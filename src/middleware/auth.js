import jwt from "jsonwebtoken";

// Sets req.userId if a valid token is present, but never blocks.
export function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.userId = payload.sub;
    } catch {
      /* invalid token → treat as guest */
    }
  }
  next();
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Not authenticated" });
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ message: "Token invalid or expired" });
  }
}
