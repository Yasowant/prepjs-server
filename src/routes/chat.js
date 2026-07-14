import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import ChatMessage from "../models/ChatMessage.js";
import Conversation from "../models/Conversation.js";

const router = Router();

const SYSTEM_PROMPT = `You are DevPrep AI, a friendly JavaScript interview coach.
Answer questions about JavaScript, React, Node.js, Express, MongoDB and web development.
Explain clearly with short code examples. If asked something unrelated to programming,
politely steer back to interview preparation. Keep answers concise and interview-focused.`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callOpenAI(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
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

function friendlyError(err) {
  const status = err?.status;
  if (status === 401) return "AI error: the OpenAI API key is invalid or revoked. Update OPENAI_API_KEY in server/.env.";
  if (status === 429) return "AI error: OpenAI rate limit or quota exceeded. Check billing at platform.openai.com.";
  if (status === 404) return `AI error: model "${process.env.OPENAI_MODEL}" not found. Try gpt-4o-mini.`;
  if (err?.name === "AbortError") return "AI error: OpenAI took too long to respond (30s timeout). Try again.";
  return "AI error: " + (err?.message || "unknown error talking to OpenAI");
}

// ---------- conversations ----------

// GET /api/chat/conversations — list, newest first (with legacy migration)
router.get("/conversations", requireAuth, async (req, res, next) => {
  try {
    // migrate pre-conversation messages into one legacy chat
    const orphanCount = await ChatMessage.countDocuments({ user: req.userId, conversation: null });
    if (orphanCount > 0) {
      const legacy = await Conversation.create({ user: req.userId, title: "Earlier conversation" });
      await ChatMessage.updateMany(
        { user: req.userId, conversation: null },
        { $set: { conversation: legacy._id } }
      );
    }

    const conversations = await Conversation.find({ user: req.userId })
      .sort({ updatedAt: -1 })
      .limit(50)
      .select("title updatedAt");
    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

// GET /api/chat/conversations/:id — messages of one conversation
router.get("/conversations/:id", requireAuth, async (req, res, next) => {
  try {
    const conv = await Conversation.findOne({ _id: req.params.id, user: req.userId });
    if (!conv) return res.status(404).json({ message: "Conversation not found" });
    const messages = await ChatMessage.find({ conversation: conv._id })
      .sort({ createdAt: 1 })
      .limit(200);
    res.json({
      id: conv._id,
      title: conv.title,
      messages: messages.map(({ role, content }) => ({ role, content })),
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/chat/conversations/:id
router.delete("/conversations/:id", requireAuth, async (req, res, next) => {
  try {
    const conv = await Conversation.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!conv) return res.status(404).json({ message: "Conversation not found" });
    await ChatMessage.deleteMany({ conversation: conv._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- chat ----------

// POST /api/chat  { messages, conversationId? }
router.post("/", requireAuth, async (req, res) => {
  if (!process.env.OPENAI_API_KEY)
    return res.status(503).json({ message: "AI chat is not configured (missing OPENAI_API_KEY)" });

  const { messages = [], conversationId = null } = req.body;
  if (!Array.isArray(messages) || messages.length === 0)
    return res.status(400).json({ message: "messages array required" });

  const payload = {
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-12).map(({ role, content }) => ({ role, content })),
    ],
    max_tokens: 800,
  };

  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const data = await callOpenAI(payload);
      const reply = data.choices[0].message.content;
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");

      // find or create the conversation
      let conv = null;
      if (conversationId) {
        conv = await Conversation.findOne({ _id: conversationId, user: req.userId });
      }
      if (!conv) {
        const title = (lastUserMsg?.content || "New chat").slice(0, 45);
        conv = await Conversation.create({ user: req.userId, title });
      } else {
        conv.updatedAt = new Date();
        await conv.save(); // bump to top of the list
      }

      ChatMessage.insertMany([
        ...(lastUserMsg
          ? [{ user: req.userId, conversation: conv._id, role: "user", content: lastUserMsg.content }]
          : []),
        { user: req.userId, conversation: conv._id, role: "assistant", content: reply },
      ]).catch((e) => console.error("chat history save failed:", e.message));

      return res.json({ reply, conversationId: conv._id });
    } catch (err) {
      lastErr = err;
      if ([400, 401, 404].includes(err?.status)) break;
      console.error(`OpenAI attempt ${attempt}/3 failed:`, err.message);
      if (attempt < 3) await sleep(attempt * 800);
    }
  }

  res.status(502).json({ message: friendlyError(lastErr) });
});

export default router;
