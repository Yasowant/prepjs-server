export default [
  {
    id: "function-types",
    title: "Function Declarations vs Expressions",
    category: "functions",
    level: "basic",
    explanation:
      "Function declarations are fully hoisted (callable before definition). Function expressions assign a function to a variable — only the variable declaration hoists, not the function body. Named function expressions help debugging via stack traces.",
    code: `sayHi(); // ✅ works — declaration is hoisted
function sayHi() { console.log("Hi"); }

// greet(); // ❌ TypeError: greet is not a function
var greet = function () { console.log("Hello"); };

// bye(); // ❌ ReferenceError (TDZ)
const bye = function byeFn() { console.log("Bye"); };`,
    questions: [
      { q: "Difference between function declaration and expression?", a: "Declarations are hoisted entirely and callable before definition; expressions are assigned to variables and usable only after assignment." },
      { q: "What error do you get calling a function expression early?", a: "With var: TypeError (variable is undefined). With let/const: ReferenceError (TDZ)." },
    ],
  },
  {
    id: "arrow-functions",
    title: "Arrow Functions",
    category: "functions",
    level: "basic",
    explanation:
      "Arrow functions provide shorter syntax and lexical `this` — they inherit this, arguments, super and new.target from the enclosing scope. They can't be used as constructors, have no arguments object, and shouldn't be used as object methods when you need this.",
    code: `const add = (a, b) => a + b;          // implicit return
const square = x => x * x;            // single param
const makeObj = () => ({ ok: true }); // return object literal

const timer = {
  seconds: 0,
  start() {
    setInterval(() => {
      this.seconds++;   // ✅ arrow inherits 'this' from start()
    }, 1000);
  },
};

const obj = {
  name: "DevPrep",
  bad: () => console.log(this.name),   // ❌ undefined — no own 'this'
  good() { console.log(this.name); },  // ✅ "DevPrep"
};`,
    questions: [
      { q: "How is 'this' different in arrow functions?", a: "Arrows have no own this — they capture it lexically from the surrounding scope at definition time. call/apply/bind can't change it." },
      { q: "When should you NOT use arrow functions?", a: "As object methods needing this, as constructors, as event handlers needing this = element, and when you need the arguments object." },
      { q: "Do arrow functions have the arguments object?", a: "No. Use rest parameters (...args) instead." },
    ],
  },
  {
    id: "parameters",
    title: "Default, Rest Parameters & Spread",
    category: "functions",
    level: "basic",
    explanation:
      "Default parameters apply when an argument is undefined. Rest parameters (...args) collect remaining arguments into a real array. Spread (...) does the opposite — expands an iterable into individual elements for calls, arrays, and objects.",
    code: `function greet(name = "Guest", punct = "!") {
  return \`Hello \${name}\${punct}\`;
}
greet();              // "Hello Guest!"
greet(undefined, "?") // "Hello Guest?"

function sum(...nums) {           // rest: collects
  return nums.reduce((a, b) => a + b, 0);
}
sum(1, 2, 3); // 6

const arr = [1, 2, 3];
Math.max(...arr);                 // spread: expands
const copy = [...arr, 4];         // [1,2,3,4]
const merged = { ...{a:1}, b:2 }; // {a:1, b:2}`,
    questions: [
      { q: "Difference between rest and spread?", a: "Same syntax, opposite jobs: rest collects multiple values into an array (in parameters/destructuring); spread expands an iterable into individual values." },
      { q: "When do default parameters kick in?", a: "Only when the argument is undefined (missing or explicitly undefined) — not for null, 0 or ''." },
    ],
  },
  {
    id: "callbacks-hof",
    title: "Callbacks & Higher-Order Functions",
    category: "functions",
    level: "basic",
    explanation:
      "Functions are first-class citizens: they can be stored in variables, passed as arguments, and returned. A callback is a function passed to another function to run later. A higher-order function (HOF) takes or returns functions — map, filter, reduce are classic HOFs.",
    code: `// callback
function fetchData(cb) {
  setTimeout(() => cb("data loaded"), 500);
}
fetchData((result) => console.log(result));

// higher-order function returning a function
function multiplier(factor) {
  return (n) => n * factor;
}
const double = multiplier(2);
double(5); // 10

// built-in HOFs
[1, 2, 3].map(x => x * 2);       // [2,4,6]
[1, 2, 3].filter(x => x > 1);    // [2,3]`,
    questions: [
      { q: "What is a higher-order function?", a: "A function that takes another function as an argument or returns a function. Examples: map, filter, reduce, custom function factories." },
      { q: "What does 'first-class functions' mean?", a: "Functions are treated like any other value — assignable to variables, passable as arguments, returnable from functions." },
      { q: "What is a callback?", a: "A function passed to another function to be invoked later — synchronously (array methods) or asynchronously (timers, events, I/O)." },
    ],
  },
  {
    id: "iife",
    title: "IIFE (Immediately Invoked Function Expression)",
    category: "functions",
    level: "intermediate",
    explanation:
      "An IIFE is a function that runs the moment it's defined: `(function(){...})()`. Historically used to create private scope before ES6 modules and block scoping, avoid polluting globals, and in the module pattern. Still useful for async top-level logic in older environments.",
    code: `(function () {
  const secret = "hidden";
  console.log("runs immediately");
})();

// arrow IIFE
(() => console.log("also runs"))();

// async IIFE — awaiting at top level
(async () => {
  const res = await fetch("/api/data");
  console.log(await res.json());
})();

// module pattern with IIFE
const counter = (function () {
  let count = 0;
  return { inc: () => ++count, get: () => count };
})();`,
    questions: [
      { q: "What is an IIFE and why use it?", a: "A function executed immediately after definition. It creates a private scope, avoiding global pollution — the basis of the pre-ES6 module pattern." },
      { q: "Why wrap the function in parentheses?", a: "To turn the declaration into an expression — a statement starting with 'function' can't be invoked directly." },
    ],
  },
  {
    id: "pure-functions",
    title: "Pure Functions & Side Effects",
    category: "functions",
    level: "intermediate",
    explanation:
      "A pure function always returns the same output for the same input and has no side effects (no mutation of external state, no I/O, no DOM changes). Pure functions are predictable, testable, and cacheable — core to functional programming and React rendering.",
    code: `// ✅ pure
const add = (a, b) => a + b;

// ❌ impure — mutates external state
let total = 0;
const addToTotal = (n) => (total += n);

// ❌ impure — output depends on external factor
const rand = () => Math.random();

// ✅ pure array update (no mutation)
const addItem = (arr, item) => [...arr, item];`,
    questions: [
      { q: "What makes a function pure?", a: "Deterministic output for the same input + no side effects (no external mutation, I/O, or randomness)." },
      { q: "Why are pure functions important in React?", a: "React components should render the same UI for the same props/state; purity enables safe re-renders, memoization, and concurrent rendering." },
    ],
  },
  {
    id: "recursion",
    title: "Recursion",
    category: "functions",
    level: "intermediate",
    explanation:
      "A recursive function calls itself with a smaller input until reaching a base case. Every recursion needs (1) a base case to stop and (2) progress toward it. Deep recursion can overflow the call stack; iterative versions or memoization often perform better.",
    code: `function factorial(n) {
  if (n <= 1) return 1;      // base case
  return n * factorial(n - 1);
}
factorial(5); // 120

function fib(n, memo = {}) { // memoized fibonacci
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  return (memo[n] = fib(n - 1, memo) + fib(n - 2, memo));
}

// flatten nested array recursively
function flatten(arr) {
  return arr.reduce(
    (acc, v) => acc.concat(Array.isArray(v) ? flatten(v) : v), []);
}
flatten([1, [2, [3, [4]]]]); // [1,2,3,4]`,
    questions: [
      { q: "What are the two requirements of recursion?", a: "A base case that terminates, and each call moving closer to that base case — otherwise you get a stack overflow." },
      { q: "What is stack overflow in recursion?", a: "Each call adds a stack frame; too many nested calls exceed the call stack limit (RangeError: Maximum call stack size exceeded)." },
    ],
  },
  {
    id: "currying",
    title: "Currying & Partial Application",
    category: "functions",
    level: "advanced",
    explanation:
      "Currying transforms a function of multiple arguments into a chain of single-argument functions: f(a,b,c) → f(a)(b)(c). Partial application pre-fills some arguments. Both rely on closures and enable reusable, configurable functions. A very common interview question.",
    code: `// manual curry
const add = (a) => (b) => (c) => a + b + c;
add(1)(2)(3); // 6

// generic curry (interview favourite)
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);
    return (...next) => curried(...args, ...next);
  };
}
const sum3 = curry((a, b, c) => a + b + c);
sum3(1)(2)(3);   // 6
sum3(1, 2)(3);   // 6

// partial application
const log = (level, msg) => console.log(\`[\${level}] \${msg}\`);
const logError = log.bind(null, "ERROR");
logError("Something broke");`,
    questions: [
      { q: "What is currying?", a: "Converting f(a,b,c) into f(a)(b)(c) — each call takes one argument and returns a function, using closures to remember previous arguments." },
      { q: "Write infinite currying: sum(1)(2)(3)...()", a: "function sum(a){ return b => b === undefined ? a : sum(a + b); } — call with empty () to get the result." },
      { q: "Currying vs partial application?", a: "Currying always produces unary functions in a chain; partial application fixes some arguments and returns a function taking the rest." },
    ],
  },
];
