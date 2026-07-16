import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import conceptRoutes from "./routes/concepts.js";
import progressRoutes from "./routes/progress.js";
import quizRoutes from "./routes/quiz.js";
import chatRoutes from "./routes/chat.js";
import submissionRoutes from "./routes/submissions.js";
import statsRoutes from "./routes/stats.js";
import codeRoutes from "./routes/code.js";
import publicApiRoutes from "./routes/publicApi.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

const app = express();

// behind a proxy (Render/Railway/nginx) — needed for correct client IPs
app.set("trust proxy", 1);

// security headers (CSP off — the SPA uses inline splash styles/scripts)
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",");
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// ---------- rate limits ----------
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests — slow down and try again in a few minutes." },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25, // login/register/reset attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please wait 15 minutes and try again." },
});
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40, // AI calls cost money — keep a lid on them
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "AI chat limit reached — try again in a few minutes." },
});

app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => res.json({ ok: true, app: "DevPrep API" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/concepts", conceptRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/chat", chatLimiter, chatRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/v1", publicApiRoutes); // public developer API — open CORS

// ---------- serve the built client in production ----------
if (isProd) {
  const dist = path.join(__dirname, "../../client/dist");
  app.use(express.static(dist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(dist, "index.html"));
  });
}

// 404 (API)
app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`🚀 DevPrep ${isProd ? "(production)" : "API"} running on http://localhost:${PORT}`)
  );
});
