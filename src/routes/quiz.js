import { Router } from "express";
import { quizzes } from "../data/quizzes.js";
import QuizResult from "../models/QuizResult.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/quiz/categories
router.get("/categories", (_req, res) => {
  res.json(Object.keys(quizzes).map((k) => ({ id: k, count: quizzes[k].length })));
});

// GET /api/quiz/:category  -> questions WITHOUT answers (login required)
router.get("/:category", requireAuth, (req, res) => {
  const qs = quizzes[req.params.category];
  if (!qs) return res.status(404).json({ message: "Quiz category not found" });
  res.json(
    qs.map(({ id, question, options }) => ({ id, question, options }))
  );
});

// POST /api/quiz/:category/submit  { answers: { [questionId]: optionIndex } }
router.post("/:category/submit", requireAuth, async (req, res, next) => {
  try {
    const qs = quizzes[req.params.category];
    if (!qs) return res.status(404).json({ message: "Quiz category not found" });
    const { answers = {} } = req.body;
    let score = 0;
    const review = qs.map((q) => {
      const given = answers[q.id];
      const correct = given === q.answer;
      if (correct) score++;
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        given,
        answer: q.answer,
        correct,
        explanation: q.explanation,
      };
    });
    const saved = await QuizResult.create({
      user: req.userId,
      category: req.params.category,
      score,
      total: qs.length,
      answers,
    });
    res.json({ score, total: qs.length, review, resultId: saved._id });
  } catch (err) {
    next(err);
  }
});

// GET /api/quiz/results/history
router.get("/results/history", requireAuth, async (req, res, next) => {
  try {
    const results = await QuizResult.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-answers"); // keep the list light
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/quiz/results/:id/review — full review of a past attempt
router.get("/results/:id/review", requireAuth, async (req, res, next) => {
  try {
    const result = await QuizResult.findOne({ _id: req.params.id, user: req.userId });
    if (!result) return res.status(404).json({ message: "Result not found" });

    const qs = quizzes[result.category];
    if (!qs) return res.status(404).json({ message: "Quiz category no longer exists" });

    const answers = result.answers || {};
    const hasAnswers = Object.keys(answers).length > 0;

    const review = qs.map((q) => {
      const given = answers[q.id];
      return {
        id: q.id,
        question: q.question,
        options: q.options,
        given: given ?? null,
        answer: q.answer,
        correct: given === q.answer,
        explanation: q.explanation,
      };
    });

    res.json({
      category: result.category,
      score: result.score,
      total: result.total,
      createdAt: result.createdAt,
      hasAnswers, // false for attempts taken before answers were stored
      review,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
