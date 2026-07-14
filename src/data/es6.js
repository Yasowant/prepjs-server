export default [
  {
    id: "modules",
    title: "ES Modules: import & export",
    category: "es6",
    level: "basic",
    explanation:
      "ES modules organize code across files. Named exports (many per file) require exact-name imports (or aliases); default export (one per file) can be imported with any name. Modules are strict mode, singleton (cached after first load), and support dynamic import() for code-splitting. CommonJS (require/module.exports) is the older Node style.",
    code: `// math.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default function multiply(a, b) { return a * b; }

// app.js
import multiply, { PI, add as sum } from "./math.js";
import * as math from "./math.js";

// dynamic import — lazy loading
const { heavyFn } = await import("./heavy.js");

// CommonJS (Node classic)
const fs = require("fs");
module.exports = { myFn };`,
    questions: [
      { q: "Named vs default exports?", a: "Named: multiple per file, imported with braces and exact names. Default: one per file, imported without braces under any name." },
      { q: "ESM vs CommonJS?", a: "ESM: import/export, static analysis, tree-shaking, async loading, strict mode. CJS: require/module.exports, synchronous, dynamic. Node supports both." },
      { q: "What is dynamic import used for?", a: "import() returns a promise — used for lazy loading / code splitting (e.g., React.lazy) to reduce initial bundle size." },
    ],
  },
  {
    id: "map-set",
    title: "Map, Set, WeakMap & WeakSet",
    category: "es6",
    level: "intermediate",
    explanation:
      "Map is a key-value store where keys can be ANY type (objects too), with size, ordered iteration, and better performance for frequent add/delete than plain objects. Set stores unique values — perfect for deduplication. WeakMap/WeakSet hold objects weakly (garbage-collectable, not iterable) — used for private data and caches.",
    code: `const map = new Map();
const keyObj = { id: 1 };
map.set(keyObj, "metadata");   // object as key!
map.set("name", "DevPrep");
map.get(keyObj);   // "metadata"
map.size;          // 2
for (const [k, v] of map) console.log(k, v);

const set = new Set([1, 2, 2, 3, 3]);
set.size;          // 3 — duplicates dropped
set.has(2);        // true
[...set];          // [1, 2, 3]

// WeakMap — keys garbage-collected when unreferenced
const privateData = new WeakMap();
class User {
  constructor(ssn) { privateData.set(this, { ssn }); }
  getSSN() { return privateData.get(this).ssn; }
}`,
    questions: [
      { q: "Map vs plain object?", a: "Map: any key type, insertion-ordered iteration, .size, no prototype pollution, faster add/delete. Object: string/symbol keys, JSON-friendly, literal syntax." },
      { q: "What is a WeakMap and when is it useful?", a: "A Map whose object keys are held weakly — entries are GC'd when the key object is no longer referenced. Used for private instance data and memory-safe caches." },
      { q: "How do you remove duplicates with Set?", a: "[...new Set(array)] — Set only stores unique values (SameValueZero comparison)." },
    ],
  },
  {
    id: "symbols",
    title: "Symbols",
    category: "es6",
    level: "advanced",
    explanation:
      "Symbols are unique, immutable primitives used as collision-free property keys. Each Symbol() call creates a distinct value even with the same description. Well-known symbols (Symbol.iterator, Symbol.asyncIterator, Symbol.toPrimitive) let you hook into language behavior. Symbol properties are skipped by for...in and JSON.stringify.",
    code: `const id = Symbol("id");
const id2 = Symbol("id");
id === id2;          // false — always unique

const user = { name: "A", [id]: 123 };
user[id];            // 123
Object.keys(user);   // ["name"] — symbol hidden
JSON.stringify(user);// '{"name":"A"}'

// global registry
Symbol.for("app.key") === Symbol.for("app.key"); // true

// well-known symbol: make an object iterable
const range = {
  from: 1, to: 3,
  [Symbol.iterator]() {
    let cur = this.from, last = this.to;
    return { next: () => cur <= last
      ? { value: cur++, done: false }
      : { value: undefined, done: true } };
  },
};
[...range]; // [1, 2, 3]`,
    questions: [
      { q: "What are symbols used for?", a: "Unique property keys that never collide, hidden metadata, and customizing built-in behavior via well-known symbols like Symbol.iterator." },
      { q: "Are two Symbol('x') equal?", a: "No — every Symbol() is unique. Only Symbol.for('x') returns the same symbol from the global registry." },
    ],
  },
  {
    id: "iterators-generators",
    title: "Iterators & Generators",
    category: "es6",
    level: "advanced",
    explanation:
      "The iterator protocol: an object with next() returning {value, done}. Iterables implement [Symbol.iterator] and work with for...of and spread. Generators (function*) create iterators easily — yield pauses execution and resumes on next(). They enable lazy/infinite sequences and power async iteration.",
    code: `function* idGenerator() {
  let id = 1;
  while (true) yield id++;   // infinite, but lazy!
}
const gen = idGenerator();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }

function* fib() {
  let [a, b] = [0, 1];
  while (true) { yield a; [a, b] = [b, a + b]; }
}
const f = fib();
[f.next().value, f.next().value, f.next().value]; // [0,1,1]

// two-way communication
function* echo() {
  const received = yield "ready";
  yield \`got: \${received}\`;
}
const e = echo();
e.next();        // {value:"ready"}
e.next("hello"); // {value:"got: hello"}

// async generator
async function* pages(url) {
  while (url) {
    const res = await (await fetch(url)).json();
    yield res.items;
    url = res.nextUrl;
  }
}
// for await (const items of pages(url)) { ... }`,
    questions: [
      { q: "What is a generator?", a: "A function* that can pause at yield and resume later, producing values lazily through the iterator protocol." },
      { q: "What does yield do?", a: "Pauses the generator, emitting a value to the caller; next(arg) resumes it, and arg becomes the yield expression's value." },
      { q: "What makes an object iterable?", a: "Implementing [Symbol.iterator] that returns an iterator ({next() → {value, done}}). Then for...of, spread and destructuring work on it." },
    ],
  },
  {
    id: "optional-nullish",
    title: "Optional Chaining & Nullish Coalescing",
    category: "es6",
    level: "basic",
    explanation:
      "?. short-circuits to undefined instead of throwing when accessing properties/methods/indexes of null/undefined. ?? provides defaults ONLY for null/undefined (unlike || which also overrides 0, '', false). Together they make defensive code concise.",
    code: `const user = { profile: { name: "Fohat" }, greet() { return "hi"; } };

user.profile?.name        // "Fohat"
user.address?.city        // undefined (no throw!)
user.greet?.()            // "hi" — safe method call
user.missing?.()          // undefined
user.items?.[0]           // safe index access

// ?? vs ||
const count = 0;
count || 10   // 10 ❌ (0 is falsy)
count ?? 10   // 0  ✅ (0 is not null/undefined)

const config = { retries: 0, name: "" };
config.retries ?? 3       // 0 — respects real values
config.name || "default"  // "default" — '' overridden`,
    questions: [
      { q: "What does optional chaining do?", a: "a?.b returns undefined if a is null/undefined instead of throwing TypeError. Works for properties, methods (?.()) and indexes (?.[])." },
      { q: "When would ?? and || give different results?", a: "When the left side is a falsy non-null value: 0, '', false. || replaces them; ?? keeps them." },
    ],
  },
  {
    id: "proxy-reflect",
    title: "Proxy & Reflect",
    category: "es6",
    level: "advanced",
    explanation:
      "A Proxy wraps an object and intercepts operations (get, set, has, deleteProperty...) via trap handlers — the magic behind Vue reactivity and validation layers. Reflect provides the default behaviors as functions (Reflect.get, Reflect.set), used inside traps to delegate.",
    code: `const user = { name: "Fohat", age: 25 };

const proxy = new Proxy(user, {
  get(target, prop) {
    console.log(\`reading \${prop}\`);
    return Reflect.get(target, prop);
  },
  set(target, prop, value) {
    if (prop === "age" && typeof value !== "number")
      throw new TypeError("age must be a number");
    return Reflect.set(target, prop, value);
  },
});

proxy.name;        // logs "reading name" → "Fohat"
proxy.age = 30;    // ✅
// proxy.age = "x" // ❌ TypeError

// default values trap
const withDefaults = new Proxy({}, {
  get: (t, p) => (p in t ? t[p] : "N/A"),
});`,
    questions: [
      { q: "What is a Proxy used for?", a: "Intercepting object operations: validation, logging, reactivity (Vue 3), default values, negative array indexes, access control." },
      { q: "Why use Reflect inside proxy traps?", a: "Reflect methods perform the default operation with correct receiver/this semantics and return success booleans — the clean way to delegate." },
    ],
  },
  {
    id: "json",
    title: "JSON: parse, stringify & gotchas",
    category: "es6",
    level: "basic",
    explanation:
      "JSON.stringify converts values to JSON text (with optional replacer and indentation); JSON.parse converts back (with optional reviver). Gotchas: undefined/functions/symbols are dropped, Dates become strings, circular references throw, NaN/Infinity become null.",
    code: `const obj = { name: "A", age: 25, greet() {}, when: new Date(), x: undefined };

JSON.stringify(obj);
// '{"name":"A","age":25,"when":"2026-07-14T..."}' — greet & x dropped!

JSON.stringify(obj, null, 2);          // pretty print
JSON.stringify(obj, ["name"]);         // pick keys → '{"name":"A"}'

JSON.parse('{"n": 1}');                // { n: 1 }
JSON.parse('{"d":"2026-01-01"}', (k, v) =>
  k === "d" ? new Date(v) : v);        // reviver → real Date

const a = {}; a.self = a;
// JSON.stringify(a); // ❌ TypeError: circular structure`,
    questions: [
      { q: "What does JSON.stringify drop?", a: "Functions, undefined, and symbols (in objects). In arrays they become null. Dates serialize to ISO strings." },
      { q: "How do you handle circular references?", a: "Custom replacer tracking seen objects, structuredClone for cloning, or libraries like flatted." },
    ],
  },
  {
    id: "regex",
    title: "Regular Expressions",
    category: "es6",
    level: "intermediate",
    explanation:
      "Regex patterns match text: literals /pattern/flags or new RegExp(). Key methods: test (boolean), match/matchAll (string side), exec, replace with capture groups. Flags: g (global), i (case-insensitive), m (multiline). Know character classes, quantifiers, groups, anchors, lookaheads.",
    code: `const email = /^[\\w.+-]+@[\\w-]+\\.[\\w.]+$/;
email.test("a@b.com");   // true

"2026-07-14".match(/(\\d{4})-(\\d{2})-(\\d{2})/);
// ["2026-07-14", "2026", "07", "14"]

// named groups
const m = "14/07/2026".match(/(?<d>\\d+)\\/(?<mo>\\d+)\\/(?<y>\\d+)/);
m.groups.y; // "2026"

"aaa bbb".replace(/(\\w+) (\\w+)/, "$2 $1");  // "bbb aaa"
"Hello World".replace(/o/g, "0");            // "Hell0 W0rld"

// common patterns
/\\d+/       // digits      /\\s/  whitespace
/^abc/      // starts with /abc$/ ends with
/colou?r/   // optional u   /(ab)+/ group repeat
/(?=.*\\d)/ // lookahead: contains a digit`,
    questions: [
      { q: "Difference between match and matchAll?", a: "match with /g returns all matches without groups; matchAll returns an iterator of full match objects including capture groups." },
      { q: "What does the g flag do in replace?", a: "Replaces ALL occurrences instead of just the first. Or use String.replaceAll." },
    ],
  },
];
