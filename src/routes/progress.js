import { Router } from "express";
import Progress from "../models/Progress.js";
import { requireAuth } from "../middleware/auth.js";
import { concepts } from "../data/index.js";

const router = Router();
router.use(requireAuth);

// GET /api/progress  -> all progress entries + stats (overall + per category)
router.get("/", async (req, res, next) => {
  try {
    const entries = await Progress.find({ user: req.userId });
    const completed = entries.filter((e) => e.status === "completed").length;

    // per-category totals + completed
    const byCategory = {};
    for (const c of concepts) {
      (byCategory[c.category] ??= { total: 0, completed: 0 }).total++;
    }
    const conceptCat = Object.fromEntries(concepts.map((c) => [c.id, c.category]));
    for (const e of entries) {
      if (e.status !== "completed") continue;
      const cat = conceptCat[e.conceptId];
      if (cat && byCategory[cat]) byCategory[cat].completed++;
    }
    for (const cat of Object.values(byCategory)) {
      cat.percent = Math.round((cat.completed / cat.total) * 100);
    }

    res.json({
      entries,
      stats: {
        total: concepts.length,
        completed,
        bookmarked: entries.filter((e) => e.status === "bookmarked").length,
        percent: Math.round((completed / concepts.length) * 100),
      },
      byCategory,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/progress/:conceptId  { status }
router.put("/:conceptId", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["learning", "completed", "bookmarked"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    const entry = await Progress.findOneAndUpdate(
      { user: req.userId, conceptId: req.params.conceptId },
      { status },
      { new: true, upsert: true }
    );
    res.json(entry);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/progress/:conceptId
router.delete("/:conceptId", async (req, res, next) => {
  try {
    await Progress.deleteOne({ user: req.userId, conceptId: req.params.conceptId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
