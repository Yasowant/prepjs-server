export default [
  {
    id: "event-loop",
    title: "Event Loop, Microtasks & Macrotasks",
    category: "async",
    level: "advanced",
    explanation:
      "JS is single-threaded; the event loop enables async behavior. The call stack runs sync code; Web APIs handle timers/fetch; completed callbacks queue up. Microtasks (Promise .then, queueMicrotask) run BEFORE macrotasks (setTimeout, setInterval, I/O) — the entire microtask queue drains after each task. Output-ordering questions on this are guaranteed in interviews.",
    code: `console.log("1");                       // sync

setTimeout(() => console.log("2"), 0);  // macrotask

Promise.resolve().then(() => console.log("3")); // microtask

queueMicrotask(() => console.log("4")); // microtask

console.log("5");                       // sync

// Output: 1 5 3 4 2
// sync first → all microtasks → then macrotasks

// Trap: even setTimeout(fn, 0) waits for stack + microtasks
async function f() {
  console.log("a");
  await null;             // pauses — rest is a microtask
  console.log("b");
}
f(); console.log("c");    // a c b`,
    questions: [
      { q: "Explain the event loop.", a: "It continuously checks: if the call stack is empty, drain ALL microtasks, then run one macrotask, repeat. Web APIs handle async work off the main thread and enqueue callbacks." },
      { q: "Microtask vs macrotask — which runs first?", a: "Microtasks (promises, queueMicrotask, MutationObserver) all run before the next macrotask (setTimeout, setInterval, I/O, UI events)." },
      { q: "Why doesn't setTimeout(fn, 0) run immediately?", a: "The callback must wait for the current stack to finish and all microtasks to drain; 0ms is a minimum, not a guarantee." },
    ],
  },
  {
    id: "callbacks-hell",
    title: "Callback Hell & Inversion of Control",
    category: "async",
    level: "basic",
    explanation:
      "Before promises, async flows were nested callbacks. Deep nesting ('pyramid of doom') hurts readability and error handling, and passing your callback to third-party code gives up control (inversion of control). Promises and async/await solve both.",
    code: `// callback hell 😱
getUser(id, (user) => {
  getOrders(user, (orders) => {
    getDetails(orders[0], (details) => {
      sendEmail(details, (result) => {
        console.log("done", result);
      }, onError);
    }, onError);
  }, onError);
}, onError);

// same flow with async/await ✨
async function flow() {
  const user = await getUser(id);
  const orders = await getOrders(user);
  const details = await getDetails(orders[0]);
  return sendEmail(details);
}`,
    questions: [
      { q: "What is callback hell and how do you avoid it?", a: "Deeply nested callbacks that are hard to read and error-handle. Avoid with promises, async/await, or splitting into named functions." },
      { q: "What is inversion of control?", a: "Handing your callback to external code and trusting it to call it correctly (once, with right args). Promises restore control with guaranteed, once-only settlement." },
    ],
  },
  {
    id: "promises",
    title: "Promises: States, Chaining & Error Handling",
    category: "async",
    level: "intermediate",
    explanation:
      "A Promise represents a future value with 3 states: pending → fulfilled (resolve) or rejected (reject); once settled it never changes. .then returns a NEW promise enabling chaining; .catch handles rejections anywhere upstream; .finally runs regardless. Returned values are wrapped, thrown errors become rejections.",
    code: `const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve("done"), 500);
});

p.then((val) => {
  console.log(val);        // "done"
  return val.toUpperCase(); // passed to next then
})
  .then((v) => { throw new Error("oops"); })
  .catch((err) => console.error(err.message)) // catches any upstream error
  .finally(() => console.log("cleanup"));

// chaining flattens nested promises
fetch("/api/user")
  .then(res => res.json())    // returns a promise — auto-unwrapped
  .then(user => fetch(\`/api/orders/\${user.id}\`))
  .then(res => res.json())
  .catch(handleError);`,
    questions: [
      { q: "What are the states of a promise?", a: "pending, fulfilled, rejected. Settled (fulfilled/rejected) is final — a promise can't change state twice." },
      { q: "How does promise chaining work?", a: ".then returns a new promise resolving with the callback's return value; returned promises are awaited/unwrapped automatically." },
      { q: "Where should .catch go?", a: "Usually at the end of the chain — it catches rejections from any earlier step. A .catch mid-chain handles and recovers, letting the chain continue." },
    ],
  },
  {
    id: "promise-combinators",
    title: "Promise.all / allSettled / race / any",
    category: "async",
    level: "intermediate",
    explanation:
      "Combinators run promises in parallel: all → resolves with array of results, rejects fast on FIRST failure; allSettled → always resolves with {status, value/reason} per promise; race → settles with the FIRST to settle (win or fail); any → first to FULFILL (rejects only if all fail). ",
    code: `const p1 = Promise.resolve(1);
const p2 = new Promise(r => setTimeout(() => r(2), 100));
const p3 = Promise.reject(new Error("fail"));

await Promise.all([p1, p2]);        // [1, 2]
await Promise.all([p1, p3]);        // ❌ throws "fail" immediately

await Promise.allSettled([p1, p3]);
// [{status:"fulfilled", value:1}, {status:"rejected", reason:Error}]

await Promise.race([p2, timeout(50)]); // whichever settles first
await Promise.any([p3, p2]);           // 2 — first FULFILLED

// practical: timeout wrapper
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);`,
    questions: [
      { q: "Difference between Promise.all and allSettled?", a: "all fails fast — one rejection rejects everything. allSettled waits for all and reports each result's status; it never rejects." },
      { q: "Difference between race and any?", a: "race settles with the first settled promise (fulfilled OR rejected); any resolves with the first fulfilled, rejecting only if ALL reject (AggregateError)." },
      { q: "How would you implement a fetch timeout?", a: "Promise.race between the fetch and a promise that rejects after N ms (or use AbortController)." },
    ],
  },
  {
    id: "async-await",
    title: "async/await",
    category: "async",
    level: "intermediate",
    explanation:
      "async functions always return a promise; await pauses the function (not the thread) until a promise settles, unwrapping the value or throwing the rejection. Use try/catch for errors. Watch out for the sequential-await trap — start independent operations first, then await, or use Promise.all.",
    code: `async function getUser(id) {
  try {
    const res = await fetch(\`/api/users/\${id}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    return await res.json();
  } catch (err) {
    console.error("Failed:", err.message);
    throw err; // re-throw for caller
  }
}

// ❌ SLOW — sequential (600ms)
const a = await taskA(); // 300ms
const b = await taskB(); // 300ms

// ✅ FAST — parallel (300ms)
const [x, y] = await Promise.all([taskA(), taskB()]);

// await in loops
for (const id of ids) await process(id);          // sequential
await Promise.all(ids.map(id => process(id)));    // parallel`,
    questions: [
      { q: "What does an async function return?", a: "Always a promise. Returned values are wrapped in a resolved promise; thrown errors become rejections." },
      { q: "How do you run awaits in parallel?", a: "Start all promises first (or map to promises) and await Promise.all — sequential awaits add latencies together." },
      { q: "Does await block the main thread?", a: "No — it suspends only the async function; the event loop continues running other code." },
    ],
  },
  {
    id: "timers",
    title: "setTimeout, setInterval & requestAnimationFrame",
    category: "async",
    level: "basic",
    explanation:
      "setTimeout schedules a one-time callback after ≥delay ms; setInterval repeats. Both return IDs for clearTimeout/clearInterval. Delays are minimums — actual timing depends on the event loop. requestAnimationFrame syncs with the browser repaint (~60fps) for smooth animations.",
    code: `const id = setTimeout(() => console.log("later"), 1000);
clearTimeout(id);   // cancel

let n = 0;
const iid = setInterval(() => {
  if (++n === 3) clearInterval(iid);
  console.log("tick", n);
}, 500);

// recursive timeout — safer interval (waits for completion)
function poll() {
  setTimeout(async () => {
    await fetchStatus();
    poll();
  }, 2000);
}

// animation
function animate(t) {
  // move element...
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);`,
    questions: [
      { q: "setInterval vs recursive setTimeout?", a: "setInterval fires on schedule regardless of callback duration (can overlap/pile up); recursive setTimeout guarantees a gap after each run finishes." },
      { q: "Is the setTimeout delay guaranteed?", a: "No — it's a minimum. The callback runs when the stack is clear and its turn arrives; browsers also clamp/throttle background tabs." },
    ],
  },
  {
    id: "fetch-api",
    title: "fetch API & AbortController",
    category: "async",
    level: "intermediate",
    explanation:
      "fetch returns a promise resolving to a Response — it rejects only on network failure, NOT on HTTP errors (404/500), so check res.ok. Parse with res.json()/text(). Configure method, headers, body for POST. AbortController cancels in-flight requests (cleanup in React effects).",
    code: `// GET
const res = await fetch("/api/users");
if (!res.ok) throw new Error(\`HTTP \${res.status}\`); // ⚠️ must check!
const users = await res.json();

// POST
await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json",
             Authorization: \`Bearer \${token}\` },
  body: JSON.stringify({ name: "Fohat" }),
});

// cancellation
const controller = new AbortController();
fetch("/api/big", { signal: controller.signal })
  .catch(err => err.name === "AbortError" && console.log("cancelled"));
controller.abort();`,
    questions: [
      { q: "Does fetch reject on a 404?", a: "No — it resolves with res.ok = false. It rejects only on network errors/CORS failure. Always check res.ok or res.status." },
      { q: "How do you cancel a fetch?", a: "Pass an AbortController's signal in options and call controller.abort() — the promise rejects with AbortError." },
    ],
  },
];
