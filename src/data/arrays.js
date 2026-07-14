export default [
  {
    id: "array-methods",
    title: "map, filter, reduce & friends",
    category: "arrays",
    level: "basic",
    explanation:
      "The essential trio: map transforms each element into a new array; filter keeps elements passing a test; reduce folds the array into a single value (sum, object, anything). Also know: find, findIndex, some, every, includes, forEach. None of these mutate the original (except forEach's side effects).",
    code: `const nums = [1, 2, 3, 4, 5];

nums.map(n => n * 2);        // [2,4,6,8,10]
nums.filter(n => n % 2);     // [1,3,5]
nums.reduce((acc, n) => acc + n, 0); // 15

nums.find(n => n > 3);       // 4 (first match)
nums.findIndex(n => n > 3);  // 3
nums.some(n => n > 4);       // true (at least one)
nums.every(n => n > 0);      // true (all)
nums.includes(3);            // true

// reduce → group by
const people = [{age: 20}, {age: 30}, {age: 20}];
people.reduce((acc, p) => {
  (acc[p.age] ??= []).push(p);
  return acc;
}, {});`,
    questions: [
      { q: "Difference between map and forEach?", a: "map returns a new transformed array; forEach returns undefined and is used for side effects only." },
      { q: "Explain how reduce works.", a: "It iterates with an accumulator: reduce((acc, cur) => next, initial). Each return becomes the next acc; final acc is the result." },
      { q: "Difference between find and filter?", a: "find returns the first matching element (or undefined); filter returns an array of all matches." },
    ],
  },
  {
    id: "array-mutation",
    title: "Mutating vs Non-Mutating Methods",
    category: "arrays",
    level: "intermediate",
    explanation:
      "Mutating methods change the original: push, pop, shift, unshift, splice, sort, reverse, fill. Non-mutating return new arrays: slice, concat, map, filter, toSorted, toReversed, toSpliced (ES2023). Knowing which is which prevents React state bugs. sort() compares as strings by default — pass a comparator for numbers!",
    code: `const arr = [3, 1, 2];

// MUTATING
arr.push(4); arr.pop();
arr.splice(1, 1);        // remove 1 item at index 1
arr.sort();              // ⚠️ mutates AND sorts as strings
[10, 2, 1].sort();       // [1, 10, 2] 😱
[10, 2, 1].sort((a, b) => a - b); // [1, 2, 10] ✅

// NON-MUTATING
const sliced = arr.slice(0, 2);
const sorted = [...arr].sort((a, b) => a - b); // safe copy-sort
const sorted2 = arr.toSorted((a, b) => a - b); // ES2023

// slice vs splice
const a = [1,2,3,4];
a.slice(1, 3);   // [2,3] — copy, original intact
a.splice(1, 2);  // [2,3] — REMOVED from original`,
    questions: [
      { q: "Difference between slice and splice?", a: "slice(start, end) returns a copy without mutating; splice(start, count, ...items) removes/inserts in place and returns removed items." },
      { q: "Why is [10, 2, 1].sort() wrong for numbers?", a: "Default sort converts to strings and compares lexicographically ('10' < '2'). Pass (a,b) => a-b for numeric sort." },
      { q: "How do you update arrays immutably (React)?", a: "Spread + map/filter: add [...arr, x], remove arr.filter(...), update arr.map(...), or ES2023 toSorted/toSpliced." },
    ],
  },
  {
    id: "destructuring",
    title: "Destructuring (Arrays & Objects)",
    category: "arrays",
    level: "basic",
    explanation:
      "Destructuring unpacks values from arrays/objects into variables. Supports defaults, renaming, nesting, rest collection, and swapping. Heavily used in React (props, hooks) and function parameters.",
    code: `// array
const [first, second, ...rest] = [1, 2, 3, 4];
let a = 1, b = 2;
[a, b] = [b, a];                 // swap!

// object
const user = { name: "Fohat", role: "dev", address: { city: "BBS" } };
const { name, role: job, level = "senior" } = user;
// name="Fohat", job="dev" (renamed), level="senior" (default)

const { address: { city } } = user;  // nested → city="BBS"

// in function params
function greet({ name, role = "guest" }) {
  return \`\${name} (\${role})\`;
}
greet(user);

// React examples
const [count, setCount] = useState(0);
const { data, error } = useFetch(url);`,
    questions: [
      { q: "How do you swap two variables without a temp?", a: "[a, b] = [b, a] using array destructuring." },
      { q: "How do you rename while destructuring?", a: "const { oldName: newName } = obj — extracts obj.oldName into variable newName." },
      { q: "What happens when destructuring a missing property?", a: "You get undefined, unless a default is provided: const { x = 5 } = {}." },
    ],
  },
  {
    id: "spread-rest-arrays",
    title: "Spread, Array.from & Array Cloning",
    category: "arrays",
    level: "basic",
    explanation:
      "Spread [...arr] clones/merges arrays (shallow). Array.from converts iterables and array-likes (NodeLists, arguments, strings) into arrays, with an optional map function. Array.of and Array(n).fill are handy for generation.",
    code: `const a = [1, 2], b = [3, 4];
const merged = [...a, ...b];       // [1,2,3,4]
const clone = [...a];              // shallow copy
const unique = [...new Set([1,1,2,3])]; // [1,2,3] dedupe!

Array.from("hello")                // ["h","e","l","l","o"]
Array.from({ length: 5 }, (_, i) => i * 2); // [0,2,4,6,8]
Array.from(document.querySelectorAll("li")); // NodeList → array

Array(3).fill(0)                   // [0,0,0]
[...Array(5).keys()]               // [0,1,2,3,4]`,
    questions: [
      { q: "How do you remove duplicates from an array?", a: "[...new Set(arr)] — Set stores unique values, spread converts back to array." },
      { q: "What can Array.from do that spread can't?", a: "Convert array-LIKE objects (with length but not iterable, e.g. {length: 3}) and apply a map function in one pass." },
    ],
  },
  {
    id: "flat-chaining",
    title: "flat, flatMap & Method Chaining",
    category: "arrays",
    level: "intermediate",
    explanation:
      "flat(depth) flattens nested arrays (Infinity for full flatten); flatMap maps then flattens one level. Chaining combines map/filter/reduce into pipelines. Flattening an array manually (recursion/reduce) is a classic interview question.",
    code: `[1, [2, [3, [4]]]].flat()         // [1, 2, [3, [4]]]
[1, [2, [3, [4]]]].flat(Infinity) // [1,2,3,4]

[1, 2, 3].flatMap(x => [x, x * 2]); // [1,2,2,4,3,6]

// chaining pipeline
const orders = [
  { item: "book", price: 300, qty: 2 },
  { item: "pen", price: 20, qty: 10 },
];
const total = orders
  .filter(o => o.price > 50)
  .map(o => o.price * o.qty)
  .reduce((a, b) => a + b, 0); // 600

// manual flatten (interview)
const flatten = (arr) =>
  arr.reduce((acc, v) =>
    acc.concat(Array.isArray(v) ? flatten(v) : v), []);`,
    questions: [
      { q: "How do you fully flatten a nested array?", a: "arr.flat(Infinity), or recursively with reduce + concat (common interview implementation)." },
      { q: "What is flatMap?", a: "map followed by flat(1) in one efficient pass — useful when the mapper returns arrays." },
    ],
  },
  {
    id: "array-search-sort",
    title: "Searching, Sorting & indexOf vs includes",
    category: "arrays",
    level: "intermediate",
    explanation:
      "indexOf/lastIndexOf find positions using === (can't find NaN); includes uses SameValueZero (finds NaN). For objects, use find/findIndex with a predicate. Custom sort comparators: return negative (a first), positive (b first), 0 (keep order). Sort is stable in modern JS.",
    code: `const arr = [5, 12, 8, 1, NaN];
arr.indexOf(12)       // 1
arr.indexOf(NaN)      // -1 ❌
arr.includes(NaN)     // true ✅

const users = [{id: 2}, {id: 7}];
users.find(u => u.id === 7);      // {id: 7}

// sort objects
const people = [
  { name: "B", age: 30 },
  { name: "A", age: 25 },
];
people.sort((x, y) => x.age - y.age);          // by number
people.sort((x, y) => x.name.localeCompare(y.name)); // by string

// descending
[3, 1, 2].sort((a, b) => b - a); // [3,2,1]`,
    questions: [
      { q: "Difference between indexOf and includes?", a: "indexOf returns position (uses ===, misses NaN); includes returns boolean (SameValueZero, finds NaN)." },
      { q: "How does a sort comparator work?", a: "sort((a,b) => ...) — negative keeps a before b, positive puts b first, 0 keeps relative order (stable sort)." },
    ],
  },
];
