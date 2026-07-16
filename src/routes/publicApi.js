// DevPrep Public API (/api/v1) — a free fake REST API for practice,
// dummyjson-style. No auth, no key, CORS open to every origin.
import { Router } from "express";
import cors from "cors";
import { users, products, todos, posts, quotes } from "../data/publicData.js";

const router = Router();
router.use(cors({ origin: "*" })); // open to all origins — it's a public API

/* ---------- helpers ---------- */
function paginate(req, list) {
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const skip = Number(req.query.skip) || 0;
  return {
    items: list.slice(skip, skip + limit),
    total: list.length,
    skip,
    limit,
  };
}

function makeCollection(name, list, searchFields = []) {
  // GET /name — list with ?limit=&skip=&q=
  router.get(`/${name}`, (req, res) => {
    let filtered = list;
    const q = (req.query.q || "").toString().toLowerCase();
    if (q && searchFields.length) {
      filtered = list.filter((item) =>
        searchFields.some((f) => String(item[f]).toLowerCase().includes(q))
      );
    }
    const { items, total, skip, limit } = paginate(req, filtered);
    res.json({ [name]: items, total, skip, limit });
  });

  // GET /name/search?q=
  router.get(`/${name}/search`, (req, res) => {
    const q = (req.query.q || "").toString().toLowerCase();
    const filtered = q
      ? list.filter((item) => searchFields.some((f) => String(item[f]).toLowerCase().includes(q)))
      : list;
    const { items, total, skip, limit } = paginate(req, filtered);
    res.json({ [name]: items, total, skip, limit });
  });

  // GET /name/:id
  router.get(`/${name}/:id`, (req, res) => {
    const item = list.find((x) => x.id === Number(req.params.id));
    if (!item) return res.status(404).json({ message: `${name.slice(0, -1)} not found` });
    res.json(item);
  });

  // Simulated writes (like dummyjson — nothing persists, response echoes)
  router.post(`/${name}`, (req, res) => {
    res.status(201).json({ id: list.length + 1, ...req.body, isSimulated: true });
  });
  router.put(`/${name}/:id`, (req, res) => {
    const item = list.find((x) => x.id === Number(req.params.id));
    if (!item) return res.status(404).json({ message: "not found" });
    res.json({ ...item, ...req.body, isSimulated: true });
  });
  router.delete(`/${name}/:id`, (req, res) => {
    const item = list.find((x) => x.id === Number(req.params.id));
    if (!item) return res.status(404).json({ message: "not found" });
    res.json({ ...item, isDeleted: true, deletedOn: new Date().toISOString(), isSimulated: true });
  });
}

/* ---------- collections — ALL FREE, no auth ---------- */
makeCollection("users", users, ["firstName", "lastName", "email", "city", "company"]);
makeCollection("products", products, ["title", "category", "brand"]);
makeCollection("todos", todos, ["todo"]);
makeCollection("posts", posts, ["title", "body"]);

/* ---------- quotes ---------- */
router.get("/quotes", (req, res) => {
  const { items, total, skip, limit } = paginate(req, quotes);
  res.json({ quotes: items, total, skip, limit });
});
router.get("/quotes/random", (_req, res) => {
  res.json(quotes[Math.floor(Math.random() * quotes.length)]);
});
router.get("/quotes/:id", (req, res) => {
  const q = quotes.find((x) => x.id === Number(req.params.id));
  if (!q) return res.status(404).json({ message: "quote not found" });
  res.json(q);
});

/* ---------- index ---------- */
router.get("/", (_req, res) => {
  res.json({
    name: "DevPrep Public API",
    description: "Free fake REST API for practice — no auth, no key, CORS enabled. Writes are simulated.",
    docs: "https://devprep.esscentra.in/api",
    endpoints: {
      users: "/api/v1/users · /api/v1/users/:id · /api/v1/users/search?q=",
      products: "/api/v1/products · /api/v1/products/:id · /api/v1/products/search?q=",
      todos: "/api/v1/todos · /api/v1/todos/:id",
      posts: "/api/v1/posts · /api/v1/posts/:id · /api/v1/posts/search?q=",
      quotes: "/api/v1/quotes · /api/v1/quotes/random · /api/v1/quotes/:id",
    },
    pagination: "?limit=10&skip=20 on any list endpoint",
    writes: "POST/PUT/DELETE are accepted and echoed back (simulated, nothing persists)",
  });
});

export default router;
