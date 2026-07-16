import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { levelFromXp, istDateString } from "../utils/gamify.js";

const router = Router();

// GET /api/gamify/me — xp, level, streak, badges for the dashboard
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select("xp streak longestStreak lastActiveOn badges");
    if (!user) return res.status(404).json({ message: "User not found" });

    // streak display: if last activity was before yesterday, streak is effectively 0
    const today = istDateString();
    const yesterday = istDateString(-1);
    const streakAlive = user.lastActiveOn === today || user.lastActiveOn === yesterday;

    const level = levelFromXp(user.xp);
    res.json({
      xp: user.xp,
      level,
      xpIntoLevel: user.xp % 100,
      xpForNextLevel: 100,
      streak: streakAlive ? user.streak : 0,
      longestStreak: user.longestStreak,
      activeToday: user.lastActiveOn === today,
      badges: user.badges,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
