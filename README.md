# DevPrep API

Backend for [DevPrep](https://devprep.esscentra.in) — Node.js + Express + MongoDB.

**Base URL (production):** `https://prepjs-server.onrender.com`

🔓 = public · 🔑 = requires `Authorization: Bearer <accessToken>`

---

## 🔌 Public API (`/api/v1`) — free fake REST API

No auth, no key, CORS open to every origin. Like dummyjson, for practice projects.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/v1` | 🔓 API index — lists all collections |
| GET | `/api/v1/users` | 🔓 50 users (`?limit=&skip=&q=`) |
| GET | `/api/v1/users/:id` | 🔓 Single user |
| GET | `/api/v1/users/search?q=` | 🔓 Search name/email/city/company |
| GET | `/api/v1/products` | 🔓 60 products, 6 categories |
| GET | `/api/v1/products/:id` | 🔓 Single product |
| GET | `/api/v1/products/search?q=` | 🔓 Search title/category/brand |
| GET | `/api/v1/todos` · `/todos/:id` | 🔓 40 todos |
| GET | `/api/v1/posts` · `/posts/:id` · `/posts/search?q=` | 🔓 40 posts |
| GET | `/api/v1/quotes` · `/quotes/:id` · `/quotes/random` | 🔓 20 quotes |
| POST/PUT/DELETE | `/api/v1/{collection}[/:id]` | 🔓 Simulated writes — echo back with `isSimulated: true`, nothing persists |

Every list endpoint supports `?limit=` (max 100) and `?skip=` and returns `total` for pagination.

---

## 🔐 Auth (`/api/auth`)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | 🔓 `{ name, email, password }` → sends verification email |
| POST | `/api/auth/verify-email` | 🔓 `{ token }` from the email link |
| POST | `/api/auth/resend-verification` | 🔓 `{ email }` |
| POST | `/api/auth/forgot-password` | 🔓 `{ email }` → sends reset link (1h expiry) |
| POST | `/api/auth/reset-password` | 🔓 `{ token, password }` |
| POST | `/api/auth/login` | 🔓 `{ email, password }` → `{ user, accessToken (15m), refreshToken (7d) }` |
| POST | `/api/auth/refresh` | 🔓 `{ refreshToken }` → new token pair |
| GET | `/api/auth/me` | 🔑 Current user profile |
| PATCH | `/api/auth/me` | 🔑 Update profile (name) |
| POST | `/api/auth/change-password` | 🔑 `{ currentPassword, newPassword }` |
| POST | `/api/auth/avatar` | 🔑 `{ image }` (base64 data URL) → Cloudinary upload |
| DELETE | `/api/auth/avatar` | 🔑 Remove avatar |

---

## 📚 Concepts (`/api/concepts`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/concepts` | 🔓 All 108 concepts (`?category=&level=&search=&track=js\|react`) |
| GET | `/api/concepts/categories` | 🔓 Categories with counts |
| GET | `/api/concepts/:id` | 🔓 Full concept — explanation + code public; Q&A requires login on non-free concepts |
| GET | `/api/concepts/questions` | 🔑 All 315+ interview Q&A in one payload |

## 📈 Progress (`/api/progress`) 🔑

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/progress` | Stats + per-category progress + entries |
| PUT | `/api/progress/:conceptId` | `{ status: "completed" \| "bookmarked" }` |
| DELETE | `/api/progress/:conceptId` | Clear status |

## 📝 Notes (`/api/notes`) 🔑

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notes/:conceptId` | Your note for a concept |
| PUT | `/api/notes/:conceptId` | `{ text }` — empty text deletes (max 8k chars) |

---

## 🧠 Quiz (`/api/quiz`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/quiz/categories` | 🔓 12 categories with counts (109 questions) |
| GET | `/api/quiz/:category` | 🔑 Questions (without answers) |
| POST | `/api/quiz/:category/submit` | 🔑 `{ answers: { [questionId]: optionIndex } }` → score + full review + XP |
| GET | `/api/quiz/results/history` | 🔑 Last 20 attempts |
| GET | `/api/quiz/results/:id/review` | 🔑 Full review of a past attempt |

## ⌨️ Playground submissions (`/api/submissions`) 🔑

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/submissions` | `{ problemId, passed, total, code }` → verdict + XP |
| GET | `/api/submissions/summary` | Solved + attempted problem ids |
| GET | `/api/submissions/:problemId` | Your attempts for one problem |

## ⚛️ React Lab (`/api/reactlab`) 🔑

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reactlab/submit` | `{ challengeId, title, asked, code }` → AI review: score /10, passed, feedback + XP |
| GET | `/api/reactlab/summary` | Solved + attempted challenge ids |
| GET | `/api/reactlab/:challengeId` | Your attempts for one challenge |

## 💾 Saved code (`/api/code`) 🔑

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/code` | All saved code as `{ itemId: code }` map |
| PUT | `/api/code/:itemId` | Upsert (max 30k chars) |
| DELETE | `/api/code/:itemId` | Delete |

---

## 🎤 Mock Interview (`/api/interview`) 🔑

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interview/start` | `{ topic: js\|react\|fullstack, level }` → 7 questions (intro first) |
| POST | `/api/interview/evaluate` | `{ topic, level, qa: [{question, answer}] }` → scored report, saved |
| GET | `/api/interview/history` | Your past interviews |
| GET | `/api/interview/:id` | Full saved report |
| GET | `/api/interview/video-signature` | Signed params for direct browser → Cloudinary video upload |
| POST | `/api/interview/:id/video` | `{ videoUrl }` — attach uploaded recording |

## 🤖 AI Coach (`/api/chat`) 🔑

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | `{ messages, conversationId? }` → `{ reply, conversationId }` |
| GET | `/api/chat/conversations` | Conversation list |
| GET | `/api/chat/conversations/:id` | Messages of one conversation |
| DELETE | `/api/chat/conversations/:id` | Delete conversation |

---

## 🎮 Gamification (`/api/gamify`)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/gamify/me` | 🔑 XP, level, streak, badges |
| GET | `/api/gamify/leaderboard` | 🔓 Top 50 by XP (+ your rank if logged in) |
| GET | `/api/gamify/certificates` | 🔑 Track completion + earned certificates |

## 📊 Misc

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stats` | 🔓 Community stats (learners, accepted solutions, quizzes) |
| GET | `/api/health` | 🔓 Health check / cold-start warm-up ping |

---

## Rate limits

Global 500 req / 15 min per IP · auth routes 25 / 15 min · AI routes (chat, interview, reactlab) 40 / 15 min.

## Environment variables

`MONGODB_URI` · `JWT_ACCESS_SECRET` · `JWT_REFRESH_SECRET` · `OPENAI_API_KEY` · `OPENAI_MODEL` · `RESEND_API_KEY` · `MAIL_FROM` · `CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_API_KEY` · `CLOUDINARY_API_SECRET` · `CLIENT_URL` (comma-separated CORS origins) · `PORT`

## Run locally

```bash
cd server
npm install
npm run dev   # http://localhost:4000
```
