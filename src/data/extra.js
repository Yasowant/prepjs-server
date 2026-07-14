// Additional interview-critical concepts
export default [
  {
    id: "property-descriptors",
    title: "Property Descriptors & defineProperty",
    category: "oop",
    level: "advanced",
    explanation:
      "Every object property has hidden flags: writable (can change value), enumerable (shows in loops/Object.keys), configurable (can delete/redefine). Object.defineProperty controls them and creates accessor properties (get/set). This powers read-only props, hidden props, computed properties, and old-school reactivity (Vue 2).",
    code: `const user = {};
Object.defineProperty(user, "id", {
  value: 101,
  writable: false,      // can't change
  enumerable: false,    // hidden from loops/keys
  configurable: false,  // can't delete or redefine
});
user.id = 999;          // silently fails (throws in strict mode)
Object.keys(user);      // [] — id is hidden!

// accessor property
const account = {
  _balance: 1000,
  get balance() { return \`₹\${this._balance}\`; },
  set balance(v) {
    if (v < 0) throw new Error("Invalid");
    this._balance = v;
  },
};
account.balance;        // "₹1000" (getter)
account.balance = 5000; // setter runs

// inspect flags
Object.getOwnPropertyDescriptor(account, "_balance");
// { value: 5000, writable: true, enumerable: true, configurable: true }`,
    questions: [
      { q: "What are property flags in JavaScript?", a: "writable, enumerable, configurable — control whether a property can be changed, iterated, or deleted/redefined. All default to false with defineProperty, true with normal assignment." },
      { q: "What's the difference between a data property and an accessor property?", a: "Data properties store a value; accessor properties define get/set functions that run on read/write — useful for validation and computed values." },
      { q: "How does Object.freeze relate to descriptors?", a: "freeze sets writable:false and configurable:false on all own properties and prevents adding new ones — a bulk descriptor operation." },
    ],
  },
  {
    id: "node-event-loop",
    title: "Node.js Event Loop: nextTick & setImmediate",
    category: "async",
    level: "advanced",
    explanation:
      "Node's event loop has phases: timers (setTimeout/setInterval) → pending callbacks → poll (I/O) → check (setImmediate) → close callbacks. Between EVERY phase, Node drains process.nextTick queue first, then promise microtasks. So nextTick beats promises, which beat timers and setImmediate. Inside an I/O callback, setImmediate always fires before setTimeout(0).",
    code: `console.log("1 sync");

setTimeout(() => console.log("5 timeout"), 0);      // timers phase
setImmediate(() => console.log("6 immediate"));     // check phase

Promise.resolve().then(() => console.log("4 promise"));   // microtask
process.nextTick(() => console.log("3 nextTick"));  // beats promises!

console.log("2 sync");
// → 1 sync, 2 sync, 3 nextTick, 4 promise, 5 timeout, 6 immediate
// (5 vs 6 order can vary OUTSIDE I/O; inside I/O callbacks
//  setImmediate ALWAYS wins:)

const fs = require("fs");
fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate first!"));
});`,
    questions: [
      { q: "process.nextTick vs Promise.then — which runs first?", a: "nextTick. Node drains the nextTick queue before the promise microtask queue, both before any timer/I-O phase continues." },
      { q: "setTimeout(fn, 0) vs setImmediate — which fires first?", a: "In the main script it's non-deterministic. Inside an I/O callback, setImmediate always fires first because the check phase comes right after poll." },
      { q: "Name the Node event loop phases.", a: "timers → pending callbacks → idle/prepare → poll (I/O) → check (setImmediate) → close callbacks, with nextTick + microtasks drained between each phase." },
    ],
  },
  {
    id: "tricky-promises",
    title: "Tricky Promise Output Questions",
    category: "coding",
    level: "advanced",
    explanation:
      "Interviewers combine promises, async/await and timers to test event-loop mastery. Rules to apply: (1) async function body runs synchronously until the first await, (2) await schedules the REST of the function as a microtask, (3) .then callbacks are microtasks queued in order, (4) all microtasks drain before any timer.",
    code: `// Q1 — classic
async function a() {
  console.log("a1");
  await null;             // rest becomes a microtask
  console.log("a2");
}
console.log("start");
a();
console.log("end");
// → start, a1, end, a2

// Q2 — then chains interleave
Promise.resolve().then(() => console.log("p1"))
  .then(() => console.log("p2"));
Promise.resolve().then(() => console.log("q1"))
  .then(() => console.log("q2"));
// → p1, q1, p2, q2  (round-robin per tick of the chain)

// Q3 — await + timeout
async function f() {
  console.log(1);
  setTimeout(() => console.log(2), 0);
  await Promise.resolve();
  console.log(3);
}
f();
console.log(4);
// → 1, 4, 3, 2

// Q4 — a resolved promise's value
const p = new Promise((res) => {
  console.log("executor");   // runs IMMEDIATELY (sync!)
  res("done");
});
console.log("after");
p.then(console.log);
// → executor, after, done`,
    questions: [
      { q: "Does the Promise executor run synchronously?", a: "Yes — new Promise(executor) runs the executor immediately. Only .then/.catch callbacks are async (microtasks)." },
      { q: "What happens at an await?", a: "The async function pauses; everything after the await is scheduled as a microtask that runs when the awaited promise settles — after current sync code finishes." },
      { q: "Why does p1, q1, p2, q2 interleave?", a: "Each .then link queues its callback only when the previous one resolves, so the two chains alternate one microtask at a time." },
    ],
  },
  {
    id: "reflow-repaint",
    title: "Reflow, Repaint & Rendering Performance",
    category: "dom",
    level: "advanced",
    explanation:
      "The browser renders via: DOM + CSSOM → render tree → layout (geometry) → paint (pixels) → composite (layers). REFLOW (layout) recalculates positions/sizes — expensive, triggered by DOM changes, class changes, reading layout props (offsetHeight) after writes. REPAINT redraws visuals without geometry (color changes) — cheaper. transform/opacity changes hit only the composite step — cheapest, ideal for animations.",
    code: `// ❌ layout thrashing — read/write interleaved forces reflows
for (const el of items) {
  el.style.width = el.offsetWidth + 10 + "px"; // read → write → read...
}

// ✅ batch reads, then writes
const widths = [...items].map((el) => el.offsetWidth);
items.forEach((el, i) => (el.style.width = widths[i] + 10 + "px"));

// ✅ change classes, not many inline styles
el.classList.add("expanded");     // 1 reflow instead of N

// ✅ animate with transform/opacity (compositor-only)
el.style.transform = "translateX(100px)";   // smooth, no reflow
// ❌ el.style.left = "100px";              // reflow every frame

// ✅ batch DOM insertion
const frag = document.createDocumentFragment();
data.forEach((d) => frag.append(makeRow(d)));
list.append(frag);                // one reflow`,
    questions: [
      { q: "What is the difference between reflow and repaint?", a: "Reflow recomputes layout geometry (expensive, cascades to children); repaint redraws pixels without geometry changes (cheaper). transform/opacity avoid both — they only re-composite." },
      { q: "What is layout thrashing?", a: "Alternating DOM reads (offsetWidth) and writes (style changes) in a loop — each read forces a synchronous reflow. Fix by batching all reads, then all writes." },
      { q: "Why are transform/opacity preferred for animation?", a: "They're handled by the compositor thread on the GPU without reflow or repaint — 60fps even when the main thread is busy." },
    ],
  },
  {
    id: "coercion-tricky",
    title: "Tricky Coercion: the == Algorithm",
    category: "coding",
    level: "advanced",
    explanation:
      "Loose equality follows a spec algorithm: null == undefined (true, only each other); number vs string → string becomes number; boolean → number first; object vs primitive → object converts via valueOf/toString. Objects convert with ToPrimitive: [] → '' → 0, [5] → '5' → 5, {} → '[object Object]'. Master these and the famous WTF outputs become predictable.",
    code: `[] == ![]      // true!  ![] → false → 0; [] → "" → 0; 0 == 0
[] == false    // true   ([] → "" → 0, false → 0)
"" == 0        // true
"0" == 0       // true
"" == "0"      // false  (both strings — plain comparison)
null == 0      // false  (null only equals undefined)
null >= 0      // true!  (relational ops convert null → 0)
NaN == NaN     // false

[1] + [2]      // "12"     (arrays → strings)
[1,2] + [3]    // "1,23"
{} + []        // 0 or "[object Object]" (statement vs expression!)
true + true    // 2
"5" - - "2"    // 7

// object ToPrimitive order: [Symbol.toPrimitive] → valueOf → toString
const obj = {
  valueOf: () => 42,
  toString: () => "hello",
};
obj + 1        // 43   (valueOf wins for math)
\`\${obj}\`       // "hello" (string context uses toString)`,
    questions: [
      { q: "Why is [] == ![] true?", a: "![] evaluates first → false (arrays are truthy). Then [] == false → [] converts to '' → 0, false → 0, and 0 == 0 is true." },
      { q: "Explain ToPrimitive.", a: "When an object meets an operator, JS calls [Symbol.toPrimitive] if present, else valueOf then toString (for number hint) or toString then valueOf (string hint) until a primitive appears." },
      { q: "Why is null >= 0 true but null == 0 false?", a: "Relational operators (>=) convert null to the number 0, so 0 >= 0. But == has a special rule: null only equals undefined, never 0." },
    ],
  },
];
