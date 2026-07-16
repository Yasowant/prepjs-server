// Gamification engine — XP, daily streaks and badges.
// Call recordActivity() from any route where the user "did work".
import User from "../models/User.js";

// Badge catalog lives on the client too (components/badges) — keep ids in sync.
export const BADGES = {
  "first-quiz": (ctx) => ctx.quizCount >= 1,
  "quiz-10": (ctx) => ctx.quizCount >= 10,
  "perfect-score": (ctx) => ctx.perfectQuiz === true,
  "first-solve": (ctx) => ctx.solvedCount >= 1,
  "solver-10": (ctx) => ctx.solvedCount >= 10,
  "interview-1": (ctx) => ctx.interviewDone === true,
  "streak-3": (ctx) => ctx.user.streak >= 3,
  "streak-7": (ctx) => ctx.user.streak >= 7,
  "streak-30": (ctx) => ctx.user.streak >= 30,
  "xp-500": (ctx) => ctx.user.xp >= 500,
  "xp-2000": (ctx) => ctx.user.xp >= 2000,
};

// date string in IST so streaks flip at Indian midnight
export function istDateString(offsetDays = 0) {
  const now = new Date(Date.now() + offsetDays * 86_400_000);
  return now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }); // YYYY-MM-DD
}

export function levelFromXp(xp) {
  return Math.floor(xp / 100) + 1; // 100 XP per level
}

/**
 * Add XP, update the daily streak and award any newly-earned badges.
 * extras: { quizCount?, perfectQuiz?, solvedCount?, interviewDone? }
 * Returns { xpGained, newBadges, user } or null on failure (never throws).
 */
export async function recordActivity(userId, xpGain, extras = {}) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const today = istDateString();
    const yesterday = istDateString(-1);

    if (user.lastActiveOn !== today) {
      user.streak = user.lastActiveOn === yesterday ? user.streak + 1 : 1;
      user.lastActiveOn = today;
      if (user.streak > user.longestStreak) user.longestStreak = user.streak;
    }

    user.xp += Math.max(0, xpGain);

    const ctx = { user, ...extras };
    const newBadges = [];
    for (const [id, earned] of Object.entries(BADGES)) {
      if (!user.badges.includes(id) && earned(ctx)) {
        user.badges.push(id);
        newBadges.push(id);
      }
    }

    await user.save();
    return { xpGained: xpGain, newBadges, user };
  } catch (err) {
    console.error("gamify recordActivity failed:", err.message);
    return null;
  }
}
