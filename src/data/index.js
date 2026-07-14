import fundamentals from "./fundamentals.js";
import functions from "./functions.js";
import scope from "./scope-closures.js";
import oop from "./oop.js";
import arrays from "./arrays.js";
import async from "./async.js";
import es6 from "./es6.js";
import dom from "./dom.js";
import advanced from "./advanced.js";
import coding from "./coding.js";
import internals from "./internals.js";
import extra from "./extra.js";

export const categories = [
  { id: "fundamentals", name: "Fundamentals", icon: "🧱", description: "Variables, types, coercion, operators, loops & strings" },
  { id: "functions", name: "Functions", icon: "⚡", description: "Declarations, arrows, callbacks, IIFE, currying & recursion" },
  { id: "scope", name: "Scope & Closures", icon: "🔒", description: "Scope chain, hoisting, TDZ, closures & execution context" },
  { id: "internals", name: "JS Internals", icon: "⚙️", description: "How JS executes, call stack vs heap, memory & runtime" },
  { id: "oop", name: "Objects & OOP", icon: "🏗️", description: "this, prototypes, classes, inheritance & deep copies" },
  { id: "arrays", name: "Arrays & Methods", icon: "📦", description: "map/filter/reduce, destructuring, spread & sorting" },
  { id: "async", name: "Async JavaScript", icon: "⏳", description: "Event loop, promises, async/await, timers & fetch" },
  { id: "es6", name: "ES6+ Features", icon: "✨", description: "Modules, Map/Set, symbols, generators, Proxy & regex" },
  { id: "dom", name: "DOM & Browser", icon: "🌐", description: "DOM, events, delegation, storage & browser APIs" },
  { id: "advanced", name: "Advanced Concepts", icon: "🚀", description: "Debounce, memoization, GC, patterns, FP & security" },
  { id: "coding", name: "Coding Questions", icon: "💻", description: "Polyfills, classic problems & tricky output questions" },
];

export const concepts = [
  ...fundamentals,
  ...functions,
  ...scope,
  ...internals,
  ...oop,
  ...arrays,
  ...async,
  ...es6,
  ...dom,
  ...advanced,
  ...coding,
  ...extra,
];
