export default [
  {
    id: "debounce-throttle",
    title: "Debounce & Throttle",
    category: "advanced",
    level: "advanced",
    explanation:
      "Both limit how often a function runs. Debounce waits until events STOP for N ms (search-as-you-type, resize end). Throttle guarantees at most one call per N ms (scroll handlers, mousemove). Implementing both from scratch is a must-know interview question — they're built on closures and timers.",
    code: `// DEBOUNCE — run after the user stops
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
searchInput.addEventListener("input",
  debounce((e) => search(e.target.value), 400));

// THROTTLE — at most once per interval
function throttle(fn, limit) {
  let waiting = false;
  return function (...args) {
    if (waiting) return;
    fn.apply(this, args);
    waiting = true;
    setTimeout(() => (waiting = false), limit);
  };
}
window.addEventListener("scroll", throttle(updateHeader, 200));`,
    questions: [
      { q: "Debounce vs throttle — when to use which?", a: "Debounce: act after activity stops (search input, form validation, resize end). Throttle: act at a steady max rate during continuous activity (scroll, mousemove, game loops)." },
      { q: "Implement debounce.", a: "Return a closure that clears the previous timer and sets a new setTimeout — the function runs only when no new call arrives within the delay." },
    ],
  },
  {
    id: "memoization",
    title: "Memoization & Caching",
    category: "advanced",
    level: "advanced",
    explanation:
      "Memoization caches a pure function's results keyed by its arguments — repeat calls return instantly. Built with closures + Map. React uses the same idea in useMemo/useCallback/React.memo. Only memoize pure functions and mind cache growth.",
    code: `function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const slowSquare = (n) => {
  for (let i = 0; i < 1e7; i++);  // simulate heavy work
  return n * n;
};
const fastSquare = memoize(slowSquare);
fastSquare(9); // slow first time
fastSquare(9); // instant — cached

// memoized fibonacci: O(2^n) → O(n)
const fib = memoize((n) => (n <= 1 ? n : fib(n - 1) + fib(n - 2)));
fib(40); // fast`,
    questions: [
      { q: "What is memoization?", a: "Caching return values by input so repeated calls with the same arguments skip recomputation. Requires pure functions." },
      { q: "How does memoization relate to React?", a: "useMemo caches computed values, useCallback caches function references, React.memo skips re-rendering when props are unchanged — all memoization." },
    ],
  },
  {
    id: "memory-management",
    title: "Memory Management & Garbage Collection",
    category: "advanced",
    level: "advanced",
    explanation:
      "JS memory is automatic: objects are allocated on the heap and garbage-collected when unreachable (mark-and-sweep — starting from roots like globals and the stack, everything not reachable is freed). Common leak sources: forgotten timers, detached DOM references, ever-growing caches, closures holding large data, global variables.",
    code: `// LEAK: interval never cleared
const id = setInterval(() => heavyUpdate(bigData), 1000);
// fix: clearInterval(id) when done (React: cleanup in useEffect)

// LEAK: detached DOM kept alive
let button = document.querySelector("#btn");
document.body.removeChild(button);
// 'button' still references the node → not collected. Fix: button = null;

// LEAK: unbounded cache
const cache = {};
function remember(key, val) { cache[key] = val; } // grows forever
// fix: use WeakMap / LRU eviction

// WeakRef & FinalizationRegistry (advanced)
const ref = new WeakRef(someObject);
ref.deref(); // object or undefined if collected`,
    questions: [
      { q: "How does garbage collection work in JS?", a: "Mark-and-sweep: the GC marks everything reachable from roots (globals, stack) and frees the rest. Reachability, not scope end, determines collection." },
      { q: "Name common memory leak causes.", a: "Uncleared intervals/listeners, detached DOM references, unbounded caches, closures capturing large objects, accidental globals." },
      { q: "How does WeakMap help prevent leaks?", a: "Its keys are weakly held — when the key object becomes unreachable, the entry is collected automatically." },
    ],
  },
  {
    id: "error-handling",
    title: "Error Handling & Custom Errors",
    category: "advanced",
    level: "intermediate",
    explanation:
      "try/catch/finally handles sync errors and awaited rejections; it does NOT catch errors in plain async callbacks. Error types: TypeError, ReferenceError, SyntaxError, RangeError. Create custom errors by extending Error. Global nets: window.onerror / unhandledrejection; in Node: process.on('uncaughtException').",
    code: `try {
  JSON.parse("{bad json}");
} catch (err) {
  if (err instanceof SyntaxError) console.error("Bad JSON");
  else throw err;             // re-throw unknown errors
} finally {
  cleanup();                  // always runs
}

// ❌ NOT caught — callback runs later, outside try
try {
  setTimeout(() => { throw new Error("boom"); }, 0);
} catch (e) { /* never reached */ }

// custom error class
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
throw new ApiError("Not found", 404);

// async
window.addEventListener("unhandledrejection", (e) => log(e.reason));`,
    questions: [
      { q: "Why doesn't try/catch catch a setTimeout error?", a: "The callback runs later in a different call stack, after try/catch exited. Put try/catch inside the callback or use promises + .catch / await." },
      { q: "How do you create a custom error?", a: "class MyError extends Error { constructor(msg){ super(msg); this.name = 'MyError'; } } — instanceof checks then work." },
      { q: "Does finally run after return?", a: "Yes — finally always runs, even after return or throw in try/catch. A return inside finally overrides earlier returns (avoid it)." },
    ],
  },
  {
    id: "design-patterns",
    title: "Design Patterns in JavaScript",
    category: "advanced",
    level: "advanced",
    explanation:
      "Common patterns: Singleton (single shared instance), Factory (create objects without new/class exposure), Observer/PubSub (subscribe to events — the basis of event emitters and state libraries), Module (encapsulation via closures/ESM), Strategy (swap algorithms). Interviews often ask you to implement an EventEmitter.",
    code: `// Observer / EventEmitter (interview classic)
class EventEmitter {
  #events = {};
  on(event, cb) {
    (this.#events[event] ??= []).push(cb);
    return () => this.off(event, cb);        // unsubscribe fn
  }
  off(event, cb) {
    this.#events[event] = (this.#events[event] || []).filter(f => f !== cb);
  }
  emit(event, ...args) {
    (this.#events[event] || []).forEach(cb => cb(...args));
  }
  once(event, cb) {
    const wrap = (...a) => { cb(...a); this.off(event, wrap); };
    this.on(event, wrap);
  }
}
const bus = new EventEmitter();
bus.on("login", (user) => console.log("welcome", user));
bus.emit("login", "Fohat");

// Singleton
const db = (() => {
  let instance;
  return { get: () => (instance ??= { conn: "connected" }) };
})();

// Factory
const createUser = (name, role) =>
  role === "admin" ? { name, perms: ["all"] } : { name, perms: ["read"] };`,
    questions: [
      { q: "Explain the Observer pattern.", a: "Subjects maintain a list of subscribers and notify them on events. Powers DOM events, EventEmitter, RxJS, Redux subscriptions." },
      { q: "Implement an EventEmitter with on/off/emit/once.", a: "Store callbacks in a map of event → array; on pushes, off filters out, emit iterates and calls, once wraps the callback to self-remove." },
      { q: "What is the Singleton pattern in JS?", a: "Ensuring one shared instance — via closures/IIFE, a module-level export (ES modules are natural singletons), or a static class instance." },
    ],
  },
  {
    id: "functional-programming",
    title: "Functional Programming & Immutability",
    category: "advanced",
    level: "advanced",
    explanation:
      "FP style: pure functions, immutability (create new data instead of mutating), function composition (combining small functions), declarative code over imperative loops. JS supports FP with first-class functions, spread for immutable updates, and array methods.",
    code: `// composition
const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x);
const pipe    = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

const trim = (s) => s.trim();
const lower = (s) => s.toLowerCase();
const slug = (s) => s.replace(/\\s+/g, "-");

const slugify = pipe(trim, lower, slug);
slugify("  Hello World  "); // "hello-world"

// immutable updates
const state = { user: { name: "A" }, items: [1, 2] };
const next = {
  ...state,
  user: { ...state.user, name: "B" },   // new nested object
  items: [...state.items, 3],           // new array
};
state.items === next.items; // false — new reference (React re-renders)`,
    questions: [
      { q: "What is function composition?", a: "Combining small functions where each output feeds the next: compose(f,g,h)(x) = f(g(h(x))). pipe runs left-to-right." },
      { q: "Why does React need immutable updates?", a: "React detects changes by reference comparison (===). Mutating keeps the same reference so React may skip re-rendering; new objects/arrays signal changes." },
      { q: "Declarative vs imperative code?", a: "Imperative describes HOW (loops, mutations); declarative describes WHAT (map/filter, JSX). FP and React favor declarative." },
    ],
  },
  {
    id: "js-engine",
    title: "How JS Engines Work (V8) & JIT",
    category: "advanced",
    level: "advanced",
    explanation:
      "V8 (Chrome/Node) parses JS to an AST, compiles to bytecode (Ignition interpreter), and JIT-compiles hot code paths to optimized machine code (TurboFan). Hidden classes and inline caching speed up property access — keeping object shapes consistent helps performance. Deoptimization happens when assumptions break.",
    code: `// consistent shapes help hidden-class optimization
function Point(x, y) { this.x = x; this.y = y; }
const p1 = new Point(1, 2);
const p2 = new Point(3, 4);   // same hidden class ✅

const q1 = { x: 1, y: 2 };
const q2 = { y: 4, x: 3 };    // different property order
q2.z = 5;                      // shape change → deopt risk ❌

// avoid changing types in hot code
function add(a, b) { return a + b; }
add(1, 2);       // optimized for numbers
add("a", "b");   // type change may deoptimize`,
    questions: [
      { q: "Is JavaScript interpreted or compiled?", a: "Both — modern engines interpret bytecode first, then JIT-compile frequently executed (hot) code into optimized machine code at runtime." },
      { q: "What are hidden classes in V8?", a: "Internal shape descriptors for objects. Objects created with the same property order share a hidden class, enabling fast inline-cached property access." },
    ],
  },
  {
    id: "security",
    title: "Web Security: XSS, CSRF & CORS",
    category: "advanced",
    level: "advanced",
    explanation:
      "XSS: injecting malicious scripts via unsanitized input — prevent with textContent, escaping, sanitization, CSP headers. CSRF: forged requests using the victim's cookies — prevent with CSRF tokens and SameSite cookies. CORS: browser mechanism controlling cross-origin requests via server headers (Access-Control-Allow-Origin) — it protects users, not the server.",
    code: `// XSS vulnerable ❌
el.innerHTML = userInput;   // <img src=x onerror="steal()">
// Safe ✅
el.textContent = userInput;

// CSP header (server)
// Content-Security-Policy: script-src 'self'

// CSRF protection
// Set-Cookie: session=...; SameSite=Strict; HttpOnly; Secure
// + verify a csrf token sent in a header

// CORS (Express)
app.use(cors({
  origin: "https://myapp.com",   // allowed origin
  credentials: true,             // allow cookies
}));
// Preflight: browser sends OPTIONS for non-simple requests`,
    questions: [
      { q: "What is XSS and how do you prevent it?", a: "Attacker-injected script running in users' browsers. Prevent: never innerHTML untrusted input, escape output, sanitize (DOMPurify), set CSP headers, HttpOnly cookies." },
      { q: "What is CORS and why does the browser block requests?", a: "The same-origin policy blocks reading cross-origin responses unless the server opts in with Access-Control-Allow-Origin headers. A preflight OPTIONS request checks permissions for non-simple requests." },
      { q: "What is CSRF?", a: "Tricking a logged-in user's browser into sending authenticated requests. Defend with SameSite cookies, CSRF tokens, and checking Origin headers." },
    ],
  },
];
