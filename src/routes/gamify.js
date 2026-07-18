import { Router } from "express";
import User from "../models/User.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { levelFromXp, istDateString } from "../utils/gamify.js";

const router = Router();

// GET /api/gamify/leaderboard — top 50 by XP (public); includes your rank if logged in
router.get("/leaderboard", optionalAuth, async (req, res, next) => {
  try {
    const top = await User.find({ isVerified: true })
      .sort({ xp: -1, createdAt: 1 })
      .limit(50)
      .select("name avatar xp streak badges");

    const rows = top.map((u, i) => ({
      rank: i + 1,
      name: u.name,
      avatar: u.avatar,
      xp: u.xp,
      level: levelFromXp(u.xp),
      streak: u.streak,
      badges: u.badges.length,
      isMe: req.userId ? String(u._id) === String(req.userId) : false,
    }));

    // logged in but outside the top 50 → append your own rank
    let me = null;
    if (req.userId && !rows.some((r) => r.isMe)) {
      const self = await User.findById(req.userId).select("name avatar xp streak badges");
      if (self) {
        const ahead = await User.countDocuments({ isVerified: true, xp: { $gt: self.xp } });
        me = {
          rank: ahead + 1,
          name: self.name,
          avatar: self.avatar,
          xp: self.xp,
          level: levelFromXp(self.xp),
          streak: self.streak,
          badges: self.badges.length,
          isMe: true,
        };
      }
    }

    res.json({ top: rows, me });
  } catch (err) {
    next(err);
  }
});

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
