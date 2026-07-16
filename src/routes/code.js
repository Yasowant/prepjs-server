import { Router } from "express";
import SavedCode from "../models/SavedCode.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// GET /api/code — all saved code for this user as { itemId: code }
router.get("/", async (req, res, next) => {
  try {
    const items = await SavedCode.find({ user: req.userId }).select("itemId code");
    const map = {};
    for (const item of items) map[item.itemId] = item.code;
    res.json(map);
  } catch (err) {
    next(err);
  }
});

// PUT /api/code/:itemId  { code } — upsert
router.put("/:itemId", async (req, res, next) => {
  try {
    const { code } = req.body;
    if (typeof code !== "string")
      return res.status(400).json({ message: "code (string) is required" });
    if (code.length > 30000)
      return res.status(413).json({ message: "Code too large (max 30k chars)" });

    await SavedCode.findOneAndUpdate(
      { user: req.userId, itemId: req.params.itemId },
      { code },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/code/:itemId — reset
router.delete("/:itemId", async (req, res, next) => {
  try {
    await SavedCode.deleteOne({ user: req.userId, itemId: req.params.itemId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
