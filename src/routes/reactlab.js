// React Lab submissions — the AI reviews the component against the challenge
// requirements (there's no unit-test runner for UI), scores it and saves the attempt.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { recordActivity } from "../utils/gamify.js";
import ReactLabSubmission from "../models/ReactLabSubmission.js";

const router = Router();
router.use(requireAuth);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callOpenAI(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40_000);
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data?.error?.message || `OpenAI HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function extractJSON(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  if (start === -1) throw new Error("no JSON in model reply");
  return JSON.parse(cleaned.slice(start));
}

// POST /api/reactlab/submit  { challengeId, title, asked, code }
router.post("/submit", async (req, res) => {
  if (!process.env.OPENAI_API_KEY)
    return res.status(503).json({ message: "Submissions are not configured (missing OPENAI_API_KEY)" });

  const { challengeId, title, asked, code } = req.body;
  if (!challengeId || !code || !title)
    return res.status(400).json({ message: "challengeId, title and code are required" });

  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const data = await callOpenAI({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          {
            role: "system",
            content: `You are a strict React interviewer reviewing a machine-coding submission. Evaluate whether the code correctly implements the challenge requirements. Scoring 0-10: 0-2 = starter/unchanged/irrelevant code, 3-5 = partial or buggy, 6-7 = works and meets core requirements, 8-10 = clean, complete, well-structured (good state handling, no obvious bugs). passed = score >= 6. Give at most 4 short feedback bullets (what's good, what's missing, one improvement). Reply with ONLY JSON:
{"score":n,"passed":true|false,"summary":"one line verdict","feedback":["...","..."]}`,
          },
          {
            role: "user",
            content: `CHALLENGE: ${title}\nREQUIREMENTS: ${String(asked || "").slice(0, 1500)}\n\nSUBMITTED CODE:\n${String(code).slice(0, 12000)}`,
          },
        ],
      });
      const review = extractJSON(data.choices[0].message.content);
      const score = Math.max(0, Math.min(10, Number(review.score) || 0));
      const passed = Boolean(review.passed) && score >= 6;

      // first time solving this challenge?
      const solvedBefore = passed
        ? await ReactLabSubmission.exists({ user: req.userId, challengeId, passed: true })
        : true;

      await ReactLabSubmission.create({
        user: req.userId,
        challengeId,
        code: String(code).slice(0, 30000),
        score,
        passed,
        summary: String(review.summary || ""),
        feedback: (review.feedback || []).map(String).slice(0, 6),
      });

      // XP: 25 first solve, 5 re-solve, 2 for a real attempt
      const xp = passed ? (solvedBefore ? 5 : 25) : 2;
      const solvedIds = await ReactLabSubmission.distinct("challengeId", {
        user: req.userId,
        passed: true,
      });
      const gamify = await recordActivity(req.userId, xp, { solvedCount: solvedIds.length });

      return res.json({
        score,
        passed,
        summary: String(review.summary || ""),
        feedback: (review.feedback || []).map(String).slice(0, 6),
        xpGained: xp,
        newBadges: gamify?.newBadges || [],
      });
    } catch (err) {
      lastErr = err;
      if ([400, 401, 404].includes(err?.status)) break;
      if (attempt < 3) await sleep(attempt * 800);
    }
  }

  console.error("reactlab submit failed:", lastErr?.message);
  res.status(502).json({ message: "Could not review your solution. Try again." });
});

// GET /api/reactlab/summary — solved + attempted challenge ids
router.get("/summary", async (req, res, next) => {
  try {
    const subs = await ReactLabSubmission.find({ user: req.userId }).select("challengeId passed");
    const solved = [...new Set(subs.filter((s) => s.passed).map((s) => s.challengeId))];
    const attempted = [...new Set(subs.map((s) => s.challengeId))];
    res.json({ solved, attempted, totalSubmissions: subs.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/reactlab/:challengeId — this user's attempts, newest first
router.get("/:challengeId", async (req, res, next) => {
  try {
    const submissions = await ReactLabSubmission.find({
      user: req.userId,
      challengeId: req.params.challengeId,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-code");
    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

export default router;
