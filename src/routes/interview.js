// Mock Interview — AI asks 5 questions, then scores the candidate's answers.
import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { recordActivity } from "../utils/gamify.js";

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

// pull the first JSON object/array out of a model reply (handles ```json fences)
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

// POST /api/interview/start  { topic, level } -> { questions: [5 strings] }
router.post("/start", async (req, res) => {
  if (!process.env.OPENAI_API_KEY)
    return res.status(503).json({ message: "Interview mode is not configured (missing OPENAI_API_KEY)" });

  const topic = TOPICS[req.body.topic] || TOPICS.javascript;
  const level = LEVELS[req.body.level] || LEVELS.junior;

  try {
    const reply = await askWithRetries({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.9,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content: `You are a technical interviewer at a top product company. Generate exactly 5 spoken-style interview questions for a ${level} ${topic} developer. Mix: 2 conceptual, 1 code-output/tricky, 1 practical "how would you", 1 comparison question. Questions must be answerable in text in 2-4 sentences (no whiteboard coding). Vary questions on every call. Reply with ONLY a JSON array of 5 strings.`,
        },
        { role: "user", content: "Generate the 5 questions now." },
      ],
    });
    const questions = extractJSON(reply);
    if (!Array.isArray(questions) || questions.length < 3) throw new Error("bad question format");
    res.json({ questions: questions.slice(0, 5).map(String) });
  } catch (err) {
    console.error("interview start failed:", err.message);
    res.status(502).json({ message: "Could not generate interview questions. Try again." });
  }
});

// POST /api/interview/evaluate  { topic, level, qa: [{question, answer}] }
router.post("/evaluate", async (req, res) => {
  if (!process.env.OPENAI_API_KEY)
    return res.status(503).json({ message: "Interview mode is not configured (missing OPENAI_API_KEY)" });

  const { qa = [] } = req.body;
  const topic = TOPICS[req.body.topic] || TOPICS.javascript;
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
      max_tokens: 1400,
      messages: [
        {
          role: "system",
          content: `You are a fair but rigorous technical interviewer evaluating a ${level} ${topic} candidate. Score each answer 0-10 (0 = no answer/wrong, 10 = excellent). Be encouraging but honest. Reply with ONLY JSON:
{"results":[{"score":n,"feedback":"1-2 sentences","modelAnswer":"the ideal short answer"}...one per question...],"total":n,"outOf":n,"verdict":"one-line overall verdict","hireSignal":"strong yes|yes|borderline|not yet"}`,
        },
        { role: "user", content: transcript },
      ],
    });
    const evaluation = extractJSON(reply);
    if (!Array.isArray(evaluation.results)) throw new Error("bad evaluation format");

    // gamification: 2 XP per point scored, badge for first interview
    const total = Number(evaluation.total) || evaluation.results.reduce((s, r) => s + (Number(r.score) || 0), 0);
    const gamify = await recordActivity(req.userId, total * 2, { interviewDone: true });

    res.json({ ...evaluation, total, xpGained: total * 2, newBadges: gamify?.newBadges || [] });
  } catch (err) {
    console.error("interview evaluate failed:", err.message);
    res.status(502).json({ message: "Could not evaluate your answers. Try again." });
  }
});

export default router;
