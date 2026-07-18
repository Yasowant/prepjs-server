// Personal notes per concept — the user's own revision annotations.
import { Router } from "express";
import Note from "../models/Note.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/notes/:conceptId
router.get("/:conceptId", async (req, res, next) => {
  try {
    const note = await Note.findOne({ user: req.userId, conceptId: req.params.conceptId });
    res.json({ text: note?.text || "" });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:conceptId  { text } — empty text deletes the note
router.put("/:conceptId", async (req, res, next) => {
  try {
    const text = String(req.body.text || "").slice(0, 8000);
    if (!text.trim()) {
      await Note.deleteOne({ user: req.userId, conceptId: req.params.conceptId });
      return res.json({ text: "" });
    }
    const note = await Note.findOneAndUpdate(
      { user: req.userId, conceptId: req.params.conceptId },
      { text },
      { new: true, upsert: true }
    );
    res.json({ text: note.text });
  } catch (err) {
    next(err);
  }
});

export default router;
