import { Router } from "express";
import Submission from "../models/Submission.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// POST /api/submissions  { problemId, passed, total, code }
router.post("/", async (req, res, next) => {
  try {
    const { problemId, passed, total, code } = req.body;
    if (!problemId || typeof passed !== "number" || typeof total !== "number" || !code)
      return res.status(400).json({ message: "problemId, passed, total and code are required" });

    const submission = await Submission.create({
      user: req.userId,
      problemId,
      passed,
      total,
      code: String(code).slice(0, 20000),
      status: passed === total && total > 0 ? "accepted" : "failed",
    });
    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
});

// GET /api/submissions/summary — solved + attempted problem ids
router.get("/summary", async (req, res, next) => {
  try {
    const subs = await Submission.find({ user: req.userId }).select("problemId status");
    const solved = [...new Set(subs.filter((s) => s.status === "accepted").map((s) => s.problemId))];
    const attempted = [...new Set(subs.map((s) => s.problemId))];
    res.json({ solved, attempted, totalSubmissions: subs.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/submissions/:problemId — this user's attempts, newest first
router.get("/:problemId", async (req, res, next) => {
  try {
    const submissions = await Submission.find({
      user: req.userId,
      problemId: req.params.problemId,
    })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(submissions);
  } catch (err) {
    next(err);
  }
});

export default router;
