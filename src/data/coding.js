export default [
  {
    id: "polyfill-map-filter-reduce",
    title: "Polyfills: map, filter, reduce",
    category: "coding",
    level: "advanced",
    explanation:
      "Writing polyfills for array methods proves you understand this, prototypes, and callbacks. Pattern: add to Array.prototype, iterate with a loop, call the callback with (element, index, array), return the new result.",
    code: `Array.prototype.myMap = function (cb) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(cb(this[i], i, this));
  }
  return result;
};

Array.prototype.myFilter = function (cb) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (cb(this[i], i, this)) result.push(this[i]);
  }
  return result;
};

Array.prototype.myReduce = function (cb, initial) {
  let acc = initial;
  let start = 0;
  if (acc === undefined) {   // no initial value → first element
    acc = this[0];
    start = 1;
  }
  for (let i = start; i < this.length; i++) {
    acc = cb(acc, this[i], i, this);
  }
  return acc;
};

[1,2,3].myMap(x => x * 2);            // [2,4,6]
[1,2,3].myReduce((a, b) => a + b);    // 6`,
    questions: [
      { q: "What does reduce do when no initial value is given?", a: "The first element becomes the accumulator and iteration starts from index 1. On an empty array it throws TypeError." },
      { q: "Why use a regular function (not arrow) for prototype methods?", a: "You need dynamic this bound to the array instance; arrows would capture the outer this." },
    ],
  },
  {
    id: "polyfill-promise",
    title: "Implement Promise.all & Promise from scratch",
    category: "coding",
    level: "advanced",
    explanation:
      "Promise.all polyfill: return a new Promise; track resolved count; store results by index to preserve order; reject on first failure. A minimal Promise class shows understanding of state machines and callback queues.",
    code: `function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let done = 0;
    if (promises.length === 0) return resolve([]);
    promises.forEach((p, i) => {
      Promise.resolve(p).then((val) => {
        results[i] = val;           // keep original order
        if (++done === promises.length) resolve(results);
      }, reject);                    // first rejection wins
    });
  });
}

// mini Promise (simplified)
class MyPromise {
  #state = "pending"; #value; #cbs = [];
  constructor(executor) {
    const resolve = (v) => {
      if (this.#state !== "pending") return;
      this.#state = "fulfilled"; this.#value = v;
      this.#cbs.forEach((cb) => queueMicrotask(() => cb(v)));
    };
    executor(resolve, () => {});
  }
  then(onFulfilled) {
    return new MyPromise((res) => {
      const run = (v) => res(onFulfilled(v));
      this.#state === "fulfilled"
        ? queueMicrotask(() => run(this.#value))
        : this.#cbs.push(run);
    });
  }
}`,
    questions: [
      { q: "How does Promise.all preserve order?", a: "Results are stored by original index (results[i] = val), not push order — completion order doesn't matter." },
      { q: "Why use queueMicrotask in a Promise implementation?", a: "The spec requires then callbacks to run asynchronously as microtasks, even for already-settled promises." },
    ],
  },
  {
    id: "string-problems",
    title: "Classic String Problems",
    category: "coding",
    level: "intermediate",
    explanation:
      "The most-asked string questions: reverse a string, check palindrome, find first non-repeating character, count character frequency, check anagrams, capitalize words. Master the split/reduce/Map toolbox.",
    code: `// reverse
const reverse = (s) => [...s].reverse().join("");

// palindrome
const isPalindrome = (s) => {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return clean === [...clean].reverse().join("");
};

// char frequency
const freq = (s) =>
  [...s].reduce((m, c) => (m[c] = (m[c] || 0) + 1, m), {});

// first non-repeating character
const firstUnique = (s) => {
  const f = freq(s);
  return [...s].find((c) => f[c] === 1) ?? null;
};

// anagram check
const isAnagram = (a, b) =>
  [...a].sort().join("") === [...b].sort().join("");

// capitalize each word
const title = (s) =>
  s.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");`,
    questions: [
      { q: "Why use [...str] instead of str.split('')?", a: "Spread respects Unicode surrogate pairs (emoji) better than split('') which breaks them into halves." },
      { q: "How do you check anagrams in O(n)?", a: "Build a character-count map from string A, decrement with string B, verify all counts are zero — avoids O(n log n) sorting." },
    ],
  },
  {
    id: "array-problems",
    title: "Classic Array Problems",
    category: "coding",
    level: "intermediate",
    explanation:
      "Must-practice: remove duplicates, find max/min, two sum, chunk array, rotate array, intersection/union, move zeros, second largest. These test array methods, Maps/Sets, and index math.",
    code: `// two sum — O(n) with Map
const twoSum = (nums, target) => {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
};
twoSum([2, 7, 11, 15], 9); // [0, 1]

// chunk
const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) },
    (_, i) => arr.slice(i * size, i * size + size));
chunk([1,2,3,4,5], 2); // [[1,2],[3,4],[5]]

// rotate right by k
const rotate = (arr, k) => {
  k %= arr.length;
  return [...arr.slice(-k), ...arr.slice(0, -k)];
};

// second largest
const secondLargest = (arr) => [...new Set(arr)].sort((a,b) => b-a)[1];

// move zeros to end (in place)
const moveZeros = (arr) => {
  let insert = 0;
  for (const n of arr) if (n !== 0) arr[insert++] = n;
  while (insert < arr.length) arr[insert++] = 0;
  return arr;
};

// intersection
const intersect = (a, b) => { const s = new Set(b); return a.filter(x => s.has(x)); };`,
    questions: [
      { q: "Explain the two-sum Map approach.", a: "One pass storing value→index. For each element, check if (target − value) was already seen — O(n) time vs O(n²) brute force." },
      { q: "How do you rotate an array without extra space?", a: "Reverse the whole array, then reverse the first k and remaining n−k elements separately." },
    ],
  },
  {
    id: "output-questions",
    title: "Tricky Output Questions",
    category: "coding",
    level: "advanced",
    explanation:
      "Interviewers love 'what does this print?' questions combining hoisting, closures, event loop, this, and coercion. Practice reasoning step by step: sync code → microtasks → macrotasks; check scopes and this binding at each call site.",
    code: `// 1
console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
console.log(4);
// → 1 4 3 2

// 2
var x = 10;
(function () {
  console.log(x);  // undefined (local var x hoisted below)
  var x = 20;
})();

// 3
const obj = {
  count: 10,
  a() { console.log(this.count); },        // 10
  b: () => console.log(this?.count),       // undefined
};
obj.a(); obj.b();

// 4
console.log([] + []);       // ""
console.log([] + {});       // "[object Object]"
console.log(1 + "2" + 3);   // "123"
console.log(1 + 2 + "3");   // "33"

// 5
let a = { x: 1 };
let b = a;
a.x = 2;
console.log(b.x);           // 2 (same reference)

// 6
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 3 3 3
for (let i = 0; i < 3; i++) setTimeout(() => console.log(i)); // 0 1 2`,
    questions: [
      { q: "Why does 1 + '2' + 3 differ from 1 + 2 + '3'?", a: "Left-to-right evaluation: 1+'2' → '12' then '123'. But 1+2 → 3 first, then 3+'3' → '33'." },
      { q: "What's the strategy for output questions?", a: "Run sync code top to bottom, then drain ALL microtasks (promises), then macrotasks (timers). Track this by call-site and variables by scope." },
    ],
  },
  {
    id: "flatten-clone-implement",
    title: "Implement: deepFlatten, deepClone, pipe, once",
    category: "coding",
    level: "advanced",
    explanation:
      "Frequently asked utility implementations that combine recursion, closures, and rest/spread: deep flatten, deep clone, compose/pipe, once (run only one time), sleep, and retry with attempts.",
    code: `// once — runs only the first time
function once(fn) {
  let called = false, result;
  return function (...args) {
    if (!called) { called = true; result = fn.apply(this, args); }
    return result;
  };
}
const init = once(() => console.log("init!"));
init(); init(); // logs once

// sleep
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// await sleep(1000);

// retry with attempts
async function retry(fn, attempts = 3, delay = 500) {
  try {
    return await fn();
  } catch (err) {
    if (attempts <= 1) throw err;
    await sleep(delay);
    return retry(fn, attempts - 1, delay * 2); // exponential backoff
  }
}

// pipe
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

// deep clone (no built-in)
function deepClone(v, seen = new WeakMap()) {
  if (v === null || typeof v !== "object") return v;
  if (seen.has(v)) return seen.get(v);        // circular refs
  const out = Array.isArray(v) ? [] : {};
  seen.set(v, out);
  for (const k of Object.keys(v)) out[k] = deepClone(v[k], seen);
  return out;
}`,
    questions: [
      { q: "How does once() work?", a: "A closure stores a called flag and the first result; later calls skip execution and return the cached result." },
      { q: "How do you handle circular references in deepClone?", a: "Track visited objects in a WeakMap; if seen again, return the already-created clone instead of recursing forever." },
    ],
  },
];
