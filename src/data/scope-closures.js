export default [
  {
    id: "scope",
    title: "Scope: Global, Function, Block & Lexical",
    category: "scope",
    level: "basic",
    explanation:
      "Scope determines where variables are accessible. Global scope is everywhere; function scope belongs to a function; block scope ({}) applies to let/const. Lexical (static) scoping means inner functions can access outer variables based on where they are written, not where they are called. The scope chain resolves variables from inner to outer.",
    code: `const globalVar = "global";

function outer() {
  const outerVar = "outer";
  function inner() {
    const innerVar = "inner";
    // scope chain: inner → outer → global
    console.log(innerVar, outerVar, globalVar);
  }
  inner();
}
outer();

{
  let blockScoped = "only here";
  var notBlockScoped = "leaks out";
}
// console.log(blockScoped);   // ReferenceError
console.log(notBlockScoped);   // "leaks out"`,
    questions: [
      { q: "What is lexical scope?", a: "Scope determined by where code is written. Inner functions access outer variables based on their position in source code, resolved via the scope chain." },
      { q: "What is the scope chain?", a: "When a variable isn't found in the current scope, the engine looks outward through each enclosing scope until global; if not found, ReferenceError." },
    ],
  },
  {
    id: "hoisting",
    title: "Hoisting & Temporal Dead Zone",
    category: "scope",
    level: "intermediate",
    explanation:
      "During compilation, declarations are moved ('hoisted') to the top of their scope. var is hoisted and initialized to undefined; function declarations are hoisted with their body; let/const are hoisted but uninitialized — accessing them before declaration throws (Temporal Dead Zone). Class declarations are also in the TDZ.",
    code: `console.log(a); // undefined (var hoisted)
var a = 5;

sayHi();        // ✅ "Hi" (function declaration hoisted)
function sayHi() { console.log("Hi"); }

// console.log(b); // ❌ ReferenceError — TDZ
let b = 10;

// classic interview trap
var x = 1;
function test() {
  console.log(x); // undefined, NOT 1 (local var x hoisted)
  var x = 2;
}
test();`,
    questions: [
      { q: "What is hoisting?", a: "The engine registers declarations before executing code. var → undefined, function declarations → fully available, let/const → hoisted but in TDZ." },
      { q: "What is the Temporal Dead Zone?", a: "The zone between entering a scope and the let/const declaration line, where accessing the variable throws ReferenceError." },
      { q: "Are function expressions hoisted?", a: "Only the variable is hoisted, not the function. var fn → undefined until assigned; const fn → TDZ." },
    ],
  },
  {
    id: "closures",
    title: "Closures",
    category: "scope",
    level: "intermediate",
    explanation:
      "A closure is a function bundled with its lexical environment — it 'remembers' variables from the scope where it was created, even after that scope has finished executing. Closures power data privacy, function factories, currying, memoization, and module patterns. THE most asked JS interview topic.",
    code: `function makeCounter() {
  let count = 0;                // private variable
  return {
    increment: () => ++count,
    get: () => count,
  };
}
const counter = makeCounter();
counter.increment();
counter.increment();
counter.get();       // 2 — count survives via closure
// count is NOT accessible from outside

// classic loop trap
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3 3 3
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100); // 0 1 2 (new binding per iteration)
}`,
    questions: [
      { q: "What is a closure?", a: "A function plus its preserved lexical scope. The inner function keeps access to outer variables even after the outer function has returned." },
      { q: "Why does the var loop print 3 3 3?", a: "All callbacks share one function-scoped i, which is 3 when timers fire. let creates a fresh binding per iteration; alternatively use an IIFE." },
      { q: "Give practical uses of closures.", a: "Data privacy/encapsulation, function factories, currying, memoization, debounce/throttle, event handlers, the module pattern." },
      { q: "Can closures cause memory leaks?", a: "Yes — if a closure keeps references to large objects that are never released (e.g., in long-lived listeners), the GC can't reclaim them." },
    ],
  },
  {
    id: "execution-context",
    title: "Execution Context & Call Stack",
    category: "scope",
    level: "advanced",
    explanation:
      "Every time code runs, an execution context is created: global context first, then one per function call. Each context has a creation phase (hoisting, scope chain setup, this binding) and execution phase. Contexts stack up on the call stack (LIFO); when a function returns, its context pops off.",
    code: `function first() {
  console.log("first start");
  second();
  console.log("first end");
}
function second() {
  console.log("second");
}
first();
// Call stack over time:
// [global] → [global, first] → [global, first, second]
// → [global, first] → [global]

// stack overflow
function boom() { boom(); }
// boom(); // RangeError: Maximum call stack size exceeded`,
    questions: [
      { q: "What are the phases of an execution context?", a: "Creation phase: set up variable environment (hoisting), scope chain, and this. Execution phase: run code line by line." },
      { q: "What is the call stack?", a: "A LIFO structure tracking execution contexts. Each function call pushes a frame; returning pops it. Overflowing it throws RangeError." },
    ],
  },
  {
    id: "strict-mode",
    title: "Strict Mode",
    category: "scope",
    level: "intermediate",
    explanation:
      "'use strict' opts into a stricter JS variant: assignments to undeclared variables throw, this is undefined in plain function calls (not the global object), duplicate parameters are errors, and writing to read-only properties throws. ES6 modules and classes are strict by default.",
    code: `"use strict";

// x = 10;        // ❌ ReferenceError (undeclared)
function f() {
  console.log(this); // undefined (not window/global)
}
f();

// function dup(a, a) {} // ❌ SyntaxError

const frozen = Object.freeze({ v: 1 });
// frozen.v = 2;  // ❌ TypeError in strict mode (silent fail otherwise)`,
    questions: [
      { q: "What does strict mode change?", a: "Undeclared assignments throw, this is undefined in normal function calls, duplicate params are banned, silent errors become thrown errors." },
      { q: "Is strict mode needed in ES modules?", a: "No — modules and class bodies are always strict automatically." },
    ],
  },
];
