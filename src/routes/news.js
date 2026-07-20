// Tech news feed — aggregates free public sources (Dev.to + Hacker News).
// No API keys needed. Cached in memory for 30 minutes.
import { Router } from "express";

const router = Router();

let cache = null;
let cachedAt = 0;
const TTL = 30 * 60 * 1000;

async function fetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "DevPrep-News/1.0 (devprep.esscentra.in)" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDevto(tag) {
  const list = await fetchJson(`https://dev.to/api/articles?tag=${tag}&top=7&per_page=12`);
  return list.map((a) => ({
    id: `devto-${a.id}`,
    title: a.title,
    url: a.url,
    source: "Dev.to",
    tag,
    author: a.user?.name || "",
    points: a.positive_reactions_count || 0,
    comments: a.comments_count || 0,
    date: a.published_at,
    image: a.cover_image || null,
    description: (a.description || "").slice(0, 180),
  }));
}

async function fetchHackerNews() {
  const hits = await fetchJson(
    "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=20"
  );
  return (hits.hits || [])
    .filter((h) => h.title)
    .map((h) => ({
      id: `hn-${h.objectID}`,
      title: h.title,
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      source: "Hacker News",
      tag: "tech",
      author: h.author || "",
      points: h.points || 0,
      comments: h.num_comments || 0,
      date: h.created_at,
      image: null,
      description: "",
    }));
}

// GET /api/news/article/:id — full Dev.to article for the in-app reader (public)
const articleCache = new Map();
router.get("/article/:id", async (req, res) => {
  const id = String(req.params.id).replace(/\D/g, "");
  if (!id) return res.status(400).json({ message: "Invalid article id" });

  const hit = articleCache.get(id);
  if (hit && Date.now() - hit.at < 60 * 60 * 1000) return res.json(hit.data);

  try {
    const a = await fetchJson(`https://dev.to/api/articles/${id}`);
    const data = {
      id: a.id,
      title: a.title,
      html: a.body_html || "",
      cover: a.cover_image || null,
      author: a.user?.name || "",
      authorImg: a.user?.profile_image_90 || null,
      date: a.published_at,
      url: a.url,
      tags: a.tags || [],
      reactions: a.positive_reactions_count || 0,
      readingTime: a.reading_time_minutes || null,
    };
    articleCache.set(id, { at: Date.now(), data });
    if (articleCache.size > 120) articleCache.delete(articleCache.keys().next().value);
    res.json(data);
  } catch {
    res.status(502).json({ message: "Could not load the article — try the original link." });
  }
});

// GET /api/news — { items, fetchedAt } (public)
router.get("/", async (_req, res) => {
  if (cache && Date.now() - cachedAt < TTL) {
    return res.json({ items: cache, fetchedAt: cachedAt, cached: true });
  }

  const results = await Promise.allSettled([
    fetchDevto("javascript"),
    fetchDevto("react"),
    fetchDevto("webdev"),
    fetchHackerNews(),
  ]);

  const items = [];
  const seen = new Set();
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const item of r.value) {
      const key = item.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) continue; // dedupe cross-tag duplicates
      seen.add(key);
      items.push(item);
    }
  }
  items.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (items.length > 0) {
    cache = items;
    cachedAt = Date.now();
  }

  // if every source failed but we have an old cache, serve it stale
  if (items.length === 0 && cache) {
    return res.json({ items: cache, fetchedAt: cachedAt, cached: true, stale: true });
  }

  res.json({ items, fetchedAt: Date.now(), cached: false });
});

export default router;
