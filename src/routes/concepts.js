import { Router } from "express";
import { categories, concepts } from "../data/index.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const router = Router();

// Concepts anyone can read WITHOUT logging in (free previews).
// Everything else shows a lock screen for guests.
const FREE_CONCEPT_IDS = new Set([
  "variables",
  "data-types",
  "function-types",
  "arrow-functions",
  "array-methods",
  "closures",
  "event-loop",
  "this-keyword",
  "how-js-executes",
  "memory-stack-heap",
  "debounce-throttle",
  "jsx",
  "state-usestate",
  "virtual-dom",
]);

// GET /api/concepts/categories  (public)
router.get("/categories", (_req, res) => {
  res.json(
    categories.map((c) => ({
      ...c,
      count: concepts.filter((x) => x.category === c.id).length,
    }))
  );
});

// GET /api/concepts/questions — EVERY interview question in one place (login required)
router.get("/questions", requireAuth, (_req, res) => {
  const catMeta = Object.fromEntries(categories.map((c) => [c.id, c]));
  const questions = [];
  for (const c of concepts) {
    const meta = catMeta[c.category] || {};
    for (const qa of c.questions) {
      questions.push({
        q: qa.q,
        a: qa.a,
        conceptId: c.id,
        conceptTitle: c.title,
        category: c.category,
        categoryName: meta.name || c.category,
        categoryIcon: meta.icon || "📚",
        track: meta.track || "js",
        level: c.level,
      });
    }
  }
  res.json({ total: questions.length, questions });
});

// GET /api/concepts?category=&level=&search=   (public — locked ones are flagged)
router.get("/", optionalAuth, (req, res) => {
  const { category, level, search, track } = req.query;
  const isAuthed = Boolean(req.userId);
  let list = concepts;
  if (track) {
    const trackCats = new Set(categories.filter((c) => c.track === track).map((c) => c.id));
    list = list.filter((c) => trackCats.has(c.category));
  }
  if (category) list = list.filter((c) => c.category === category);
  if (level) list = list.filter((c) => c.level === level);
  if (search) {
    const q = String(search).toLowerCase();
    list = list.filter(
      (c) => c.title.toLowerCase().includes(q) || c.explanation.toLowerCase().includes(q)
    );
  }
  res.json(
    list.map(({ id, title, category: cat, level: lvl }) => ({
      id,
      title,
      category: cat,
      level: lvl,
      free: FREE_CONCEPT_IDS.has(id),
      locked: !isAuthed && !FREE_CONCEPT_IDS.has(id),
    }))
  );
});

// GET /api/concepts/:id  (free ones public, rest need login)
router.get("/:id", optionalAuth, (req, res) => {
  const concept = concepts.find((c) => c.id === req.params.id);
  if (!concept) return res.status(404).json({ message: "Concept not found" });

  if (!req.userId && !FREE_CONCEPT_IDS.has(concept.id)) {
    return res.status(403).json({
      message: "This concept is locked. Log in free to unlock all concepts.",
      code: "LOGIN_REQUIRED",
      title: concept.title,
      level: concept.level,
    });
  }
  res.json({ ...concept, free: FREE_CONCEPT_IDS.has(concept.id) });
});

export default router;
