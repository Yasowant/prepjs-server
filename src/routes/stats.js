import { Router } from "express";
import Submission from "../models/Submission.js";
import User from "../models/User.js";
import QuizResult from "../models/QuizResult.js";

const router = Router();

// GET /api/stats — public community stats (cached 5 min)
let cache = null;
let cachedAt = 0;

router.get("/", async (_req, res, next) => {
  try {
    if (cache && Date.now() - cachedAt < 5 * 60 * 1000) return res.json(cache);

    const [accepted, learners, quizzes] = await Promise.all([
      Submission.countDocuments({ status: "accepted" }),
      User.countDocuments({ isVerified: true }),
      QuizResult.countDocuments(),
    ]);

    cache = { accepted, learners, quizzes };
    cachedAt = Date.now();
    res.json(cache);
  } catch (err) {
    next(err);
  }
});

export default router;
