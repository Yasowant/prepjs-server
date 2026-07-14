import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { sendEmail, verificationEmailHtml, resetEmailHtml } from "../utils/sendEmail.js";

const router = Router();

function signTokens(userId) {
  const accessToken = jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
  const refreshToken = jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
  return { accessToken, refreshToken };
}

function clientUrl() {
  return (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0];
}

async function sendVerification(user) {
  const token = jwt.sign(
    { sub: user._id.toString(), purpose: "verify-email" },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "1d" }
  );
  const link = `${clientUrl()}/verify?token=${token}`;
  await sendEmail({
    to: user.email,
    subject: "Verify your DevPrep email ⚡",
    html: verificationEmailHtml(user.name, link),
  });
}

// POST /api/auth/register — creates account, sends verification email
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password });

    // don't let a broken email provider break registration
    let emailSent = true;
    try {
      await sendVerification(user);
    } catch (e) {
      emailSent = false;
      console.error("Verification email failed for", email, "—", e.message);
    }

    res.status(201).json({
      message: emailSent
        ? "Account created! Check your inbox and verify your email to log in."
        : "Account created, but the verification email could not be sent. Use 'Resend verification email' on the login page in a few minutes.",
      email: user.email,
      emailSent,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verify-email  { token }
router.post("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token required" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch {
      return res.status(400).json({ message: "Verification link is invalid or expired" });
    }
    if (payload.purpose !== "verify-email")
      return res.status(400).json({ message: "Invalid token" });

    const user = await User.findById(payload.sub);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }
    res.json({ message: "Email verified! You can log in now. 🎉" });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/resend-verification  { email }
router.post("/resend-verification", async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // don't leak which emails exist
    if (user && !user.isVerified) await sendVerification(user);
    res.json({ message: "If that account exists and is unverified, a new email has been sent." });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/forgot-password  { email }
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign(
        { sub: user._id.toString(), purpose: "reset-password" },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: "1h" }
      );
      const link = `${clientUrl()}/reset?token=${token}`;
      await sendEmail({
        to: user.email,
        subject: "Reset your DevPrep password 🔑",
        html: resetEmailHtml(user.name, link),
      }).catch((e) => console.error("Reset email failed:", e.message));
    }
    // same response either way — don't leak which emails exist
    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password  { token, password }
router.post("/reset-password", async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token and password required" });
    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch {
      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }
    if (payload.purpose !== "reset-password")
      return res.status(400).json({ message: "Invalid token" });

    const user = await User.findById(payload.sub).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = password;      // hashed by the pre-save hook
    user.isVerified = true;        // proving email ownership verifies too
    await user.save();
    res.json({ message: "Password updated! You can log in now. 🎉" });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — blocked until email is verified
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isVerified)
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
      });

    const tokens = signTokens(user._id.toString());
    res.json({ user: { id: user._id, name: user.name, email: user.email }, ...tokens });
  } catch (err) {
    next(err);
  }
});

router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "refreshToken required" });
  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const tokens = signTokens(payload.sub);
    res.json(tokens);
  } catch {
    res.status(401).json({ message: "Refresh token invalid or expired" });
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      user: { id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/me  { name } — update profile
router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2)
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim() },
      { new: true }
    );
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/change-password  { currentPassword, newPassword }
router.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findById(req.userId).select("+password");
    if (!user || !(await user.comparePassword(currentPassword)))
      return res.status(401).json({ message: "Current password is incorrect" });

    user.password = newPassword; // hashed by pre-save hook
    await user.save();
    res.json({ message: "Password changed successfully 🎉" });
  } catch (err) {
    next(err);
  }
});

export default router;
