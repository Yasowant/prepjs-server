// Mock Interview — AI asks questions (always starting with a self-introduction),
// scores the answers, saves the full report + optional interview video.
import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth } from "../middleware/auth.js";
import { recordActivity } from "../utils/gamify.js";
import { cloudinaryReady } from "../utils/cloudinary.js";
import InterviewResult from "../models/InterviewResult.js";

const router = Router();
router.use(requireAuth);

const INTRO_QUESTION =
  "To start, please introduce yourself — your background, the technologies you work with, and a project you're proud of.";

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

async function askWithRetries(payload) {
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const data = await callOpenAI(payload);
      return data.choices[0].message.content;
    } catch (err) {
      lastErr = err;
      if ([400, 401, 404].includes(err?.status)) break;
      if (attempt < 3) await sleep(attempt * 800);
    }
  }
  throw lastErr;
}

function extractJSON(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = Math.min(
    ...["{", "["].map((c) => (cleaned.indexOf(c) === -1 ? Infinity : cleaned.indexOf(c)))
  );
  if (start === Infinity) throw new Error("no JSON in model reply");
  return JSON.parse(cleaned.slice(start));
}

const TOPICS = { javascript: "JavaScript", react: "React.js", fullstack: "JavaScript + React + Node.js" };
const LEVELS = { junior: "junior (0-2 years)", mid: "mid-level (2-4 years)", senior: "senior (4+ years)" };

const TOPIC_MIX = {
  javascript:
    "2 core JavaScript conceptual (closures/event loop/prototypes/async), 1 tricky code-output, 1 practical scenario, 1 ES6+/comparison, 1 debugging or performance question",
  react:
    "2 React conceptual (hooks/rendering/state), 1 tricky code-output with hooks, 1 practical component-design scenario, 1 performance/optimization, 1 comparison (e.g. useMemo vs useCallback)",
  fullstack:
    "2 JavaScript questions (closures/event loop/async), 2 React questions (hooks/rendering/state), 1 Node.js/Express or API-design question, 1 practical full-stack scenario",
};

/* ================= START — intro + 6 generated = 7 questions ================= */
router.post("/start", async (req, res) => {
  if (!process.env.OPENAI_API_KEY)
    return res.status(503).json({ message: "Interview mode is not configured (missing OPENAI_API_KEY)" });

  const topicKey = TOPICS[req.body.topic] ? req.body.topic : "javascript";
  const topic = TOPICS[topicKey];
  const level = LEVELS[req.body.level] || LEVELS.junior;

  try {
    const reply = await askWithRetries({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.9,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content: `You are a technical interviewer at a top product company. Generate exactly 6 spoken-style interview questions for a ${level} ${topic} developer. Mix: ${TOPIC_MIX[topicKey]}. Questions must be answerable verbally in 2-4 sentences (no whiteboard coding). Vary the questions on every call. Reply with ONLY a JSON array of 6 strings.`,
        },
        { role: "user", content: "Generate the 6 questions now." },
      ],
    });
    const generated = extractJSON(reply);
    if (!Array.isArray(generated) || generated.length < 4) throw new Error("bad question format");
    res.json({ questions: [INTRO_QUESTION, ...generated.slice(0, 6).map(String)] });
  } catch (err) {
    console.error("interview start failed:", err.message);
    res.status(502).json({ message: "Could not generate interview questions. Try again." });
  }
});

/* ================= EVALUATE — score + SAVE the report ================= */
router.post("/evaluate", async (req, res) => {
  if (!process.env.OPENAI_API_KEY)
    return res.status(503).json({ message: "Interview mode is not configured (missing OPENAI_API_KEY)" });

  const { qa = [] } = req.body;
  const topicKey = TOPICS[req.body.topic] ? req.body.topic : "javascript";
  const topic = TOPICS[topicKey];
  const level = LEVELS[req.body.level] || LEVELS.junior;
  if (!Array.isArray(qa) || qa.length === 0)
    return res.status(400).json({ message: "qa array required" });

  const transcript = qa
    .map((x, i) => `Q${i + 1}: ${x.question}\nCandidate answer: ${x.answer?.trim() || "(no answer given)"}`)
    .join("\n\n");

  try {
    const reply = await askWithRetries({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 1800,
      messages: [
        {
          role: "system",
          content: `You are a fair but rigorous technical interviewer evaluating a ${level} ${topic} candidate. Score each answer 0-10 (0 = no answer/wrong, 10 = excellent). Question 1 is a self-introduction: score it on clarity, structure and relevance (background → skills → project), NOT technical depth. Be encouraging but honest. Reply with ONLY JSON:
{"results":[{"score":n,"feedback":"1-2 sentences","modelAnswer":"the ideal short answer"}...one per question...],"total":n,"outOf":n,"verdict":"one-line overall verdict","hireSignal":"strong yes|yes|borderline|not yet"}`,
        },
        { role: "user", content: transcript },
      ],
    });
    const evaluation = extractJSON(reply);
    if (!Array.isArray(evaluation.results)) throw new Error("bad evaluation format");

    const total =
      Number(evaluation.total) ||
      evaluation.results.reduce((s, r) => s + (Number(r.score) || 0), 0);
    const outOf = Number(evaluation.outOf) || evaluation.results.length * 10;

    // save the full report
    const saved = await InterviewResult.create({
      user: req.userId,
      topic: topicKey,
      level: req.body.level || "junior",
      qa: qa.map((x) => ({ question: String(x.question).slice(0, 1000), answer: String(x.answer || "").slice(0, 5000) })),
      results: evaluation.results.map((r) => ({
        score: Number(r.score) || 0,
        feedback: String(r.feedback || ""),
        modelAnswer: String(r.modelAnswer || ""),
      })),
      total,
      outOf,
      verdict: String(evaluation.verdict || ""),
      hireSignal: String(evaluation.hireSignal || "borderline"),
    });

    // gamification: 2 XP per point scored
    const gamify = await recordActivity(req.userId, total * 2, { interviewDone: true });

    res.json({
      ...evaluation,
      total,
      outOf,
      id: saved._id,
      xpGained: total * 2,
      newBadges: gamify?.newBadges || [],
    });
  } catch (err) {
    console.error("interview evaluate failed:", err.message);
    res.status(502).json({ message: "Could not evaluate your answers. Try again." });
  }
});

/* ================= VIDEO — signed direct upload to Cloudinary ================= */

// GET /api/interview/video-signature — client uploads the recording straight to
// Cloudinary (no big file through our server), then attaches the URL below.
router.get("/video-signature", (req, res) => {
  if (!cloudinaryReady())
    return res.status(503).json({ message: "Video storage is not configured (Cloudinary env missing)" });

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "devprep/interviews";
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET
  );
  res.json({
    timestamp,
    folder,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

// POST /api/interview/:id/video  { videoUrl }
router.post("/:id/video", async (req, res, next) => {
  try {
    const { videoUrl } = req.body;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (
      !videoUrl ||
      !new RegExp(`^https://res\\.cloudinary\\.com/${cloudName}/video/upload/`).test(videoUrl)
    )
      return res.status(400).json({ message: "Invalid video URL" });

    const doc = await InterviewResult.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { videoUrl },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Interview not found" });
    res.json({ ok: true, videoUrl: doc.videoUrl });
  } catch (err) {
    next(err);
  }
});

/* ================= HISTORY & REVIEW ================= */

// GET /api/interview/history — newest first, light list
router.get("/history", async (req, res, next) => {
  try {
    const list = await InterviewResult.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(30)
      .select("topic level total outOf hireSignal videoUrl createdAt");
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// GET /api/interview/:id — full saved report
router.get("/:id", async (req, res, next) => {
  try {
    const doc = await InterviewResult.findOne({ _id: req.params.id, user: req.userId });
    if (!doc) return res.status(404).json({ message: "Interview not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

export default router;
