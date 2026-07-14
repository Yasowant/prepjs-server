export default [
  {
    id: "variables",
    title: "Variables: var, let, const",
    category: "fundamentals",
    level: "basic",
    explanation:
      "JavaScript has three ways to declare variables. `var` is function-scoped, hoisted with value `undefined`, and can be re-declared. `let` and `const` are block-scoped and live in the Temporal Dead Zone until declared. `const` cannot be reassigned, but objects/arrays declared with const can still be mutated.",
    code: `var a = 1;   // function scoped, hoisted
let b = 2;   // block scoped, reassignable
const c = 3; // block scoped, no reassignment

if (true) {
  var x = 10;  // leaks outside the block
  let y = 20;  // exists only inside this block
}
console.log(x); // 10
// console.log(y); // ReferenceError

const user = { name: "Yaso" };
user.name = "Fohat"; // ✅ allowed (mutation)
// user = {};        // ❌ TypeError (reassignment)`,
    questions: [
      { q: "What is the difference between var, let and const?", a: "var is function-scoped and hoisted with undefined; let and const are block-scoped, hoisted but in the TDZ. const additionally prevents reassignment (not mutation)." },
      { q: "Can you mutate a const object?", a: "Yes. const only prevents rebinding the variable. Use Object.freeze() to make an object immutable (shallow)." },
      { q: "What happens if you use a variable before declaring it?", a: "var gives undefined; let/const throw a ReferenceError because of the Temporal Dead Zone." },
    ],
  },
  {
    id: "data-types",
    title: "Data Types & typeof",
    category: "fundamentals",
    level: "basic",
    explanation:
      "JavaScript has 7 primitive types — string, number, boolean, undefined, null, symbol, bigint — and one non-primitive type: object (which includes arrays and functions). Primitives are stored by value; objects are stored by reference. `typeof null` returns 'object' — a famous historical bug.",
    code: `typeof "hi"        // "string"
typeof 42          // "number"
typeof true        // "boolean"
typeof undefined   // "undefined"
typeof null        // "object"  ← famous bug!
typeof Symbol()    // "symbol"
typeof 10n         // "bigint"
typeof {}          // "object"
typeof []          // "object" (use Array.isArray)
typeof function(){} // "function"`,
    questions: [
      { q: "What are the primitive types in JavaScript?", a: "string, number, boolean, undefined, null, symbol, and bigint. Everything else is an object." },
      { q: "Why does typeof null return 'object'?", a: "It's a bug from the first JS implementation where null's type tag was 0 (same as objects). It was never fixed to avoid breaking the web." },
      { q: "Difference between undefined and null?", a: "undefined means a variable was declared but not assigned; null is an intentional 'no value' set by the developer." },
    ],
  },
  {
    id: "type-coercion",
    title: "Type Coercion & Conversion",
    category: "fundamentals",
    level: "basic",
    explanation:
      "Coercion is JavaScript automatically converting types (implicit); conversion is doing it manually (explicit) with Number(), String(), Boolean(). The `+` operator prefers string concatenation, while `-`, `*`, `/` convert to numbers. Falsy values: false, 0, -0, '', null, undefined, NaN — everything else is truthy.",
    code: `"5" + 2    // "52"  (string concat)
"5" - 2    // 3     (numeric)
"5" * "2"  // 10
true + 1   // 2
[] + []    // ""
[] + {}    // "[object Object]"

Number("42")   // 42
String(42)     // "42"
Boolean("")    // false

// Falsy values
Boolean(0), Boolean(""), Boolean(null),
Boolean(undefined), Boolean(NaN) // all false`,
    questions: [
      { q: "What is the output of '5' + 3 and '5' - 3?", a: "'53' (concatenation) and 2 (numeric subtraction). + prefers strings; - only works on numbers." },
      { q: "List all falsy values.", a: "false, 0, -0, 0n, '', null, undefined, NaN." },
      { q: "What is the difference between implicit and explicit conversion?", a: "Implicit (coercion) happens automatically by the engine; explicit is manual using Number(), String(), Boolean(), parseInt() etc." },
    ],
  },
  {
    id: "equality",
    title: "== vs === (Equality)",
    category: "fundamentals",
    level: "basic",
    explanation:
      "`==` (loose equality) coerces types before comparing; `===` (strict equality) compares both type and value with no coercion. Always prefer `===`. Object comparisons check reference, not content. `Object.is()` is like === but treats NaN as equal to NaN and distinguishes +0/-0.",
    code: `5 == "5"     // true  (coerced)
5 === "5"    // false
null == undefined  // true
null === undefined // false
NaN === NaN  // false!
Object.is(NaN, NaN) // true

{} === {}    // false (different references)
const a = {}; const b = a;
a === b      // true (same reference)`,
    questions: [
      { q: "Difference between == and ===?", a: "== performs type coercion before comparison; === compares type and value strictly. Prefer === to avoid surprising coercion." },
      { q: "Why is NaN === NaN false?", a: "By IEEE 754 spec, NaN is not equal to anything including itself. Use Number.isNaN() or Object.is() to check." },
      { q: "How do you compare two objects for equality?", a: "=== compares references. For deep equality, compare recursively or use JSON.stringify (with caveats) or a library like lodash isEqual." },
    ],
  },
  {
    id: "operators",
    title: "Operators (ternary, logical, nullish)",
    category: "fundamentals",
    level: "basic",
    explanation:
      "Beyond arithmetic, key operators: ternary `? :` for inline conditionals, `&&`/`||` which return operands (short-circuiting), `??` (nullish coalescing) which falls back only for null/undefined, and `?.` (optional chaining) which safely accesses nested properties.",
    code: `const age = 20;
const status = age >= 18 ? "adult" : "minor";

// || returns first truthy; ?? only skips null/undefined
0 || "default"   // "default"
0 ?? "default"   // 0

// short-circuit
user && user.save();      // old style
user?.save?.();           // optional chaining

// logical assignment (ES2021)
let x = null;
x ??= 10;  // x = 10`,
    questions: [
      { q: "Difference between || and ???", a: "|| falls back when the left side is any falsy value (0, '', false); ?? falls back only when it's null or undefined." },
      { q: "What is optional chaining?", a: "?. safely accesses nested properties — returns undefined instead of throwing if the reference is null/undefined." },
      { q: "What does short-circuit evaluation mean?", a: "&& stops at the first falsy operand and || stops at the first truthy one, returning that operand — not a boolean." },
    ],
  },
  {
    id: "loops",
    title: "Loops: for, while, for...of, for...in",
    category: "fundamentals",
    level: "basic",
    explanation:
      "JS supports classic for/while loops plus `for...of` (iterates values of iterables like arrays, strings, Maps) and `for...in` (iterates enumerable keys of objects — avoid for arrays). break exits a loop; continue skips to the next iteration. Labels allow breaking out of nested loops.",
    code: `const arr = ["a", "b", "c"];

for (let i = 0; i < arr.length; i++) console.log(arr[i]);

for (const value of arr) console.log(value); // a b c
for (const key in arr) console.log(key);     // 0 1 2 (indices!)

const obj = { x: 1, y: 2 };
for (const key in obj) console.log(key, obj[key]);

outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (j === 1) break outer; // exits both loops
  }
}`,
    questions: [
      { q: "Difference between for...of and for...in?", a: "for...of iterates values of iterables (arrays, strings, Maps); for...in iterates enumerable property keys of an object, including inherited ones." },
      { q: "Why should you avoid for...in with arrays?", a: "It iterates keys as strings, includes inherited/added properties, and order isn't guaranteed. Use for...of or forEach." },
      { q: "Difference between break and continue?", a: "break exits the loop entirely; continue skips the current iteration and moves to the next." },
    ],
  },
  {
    id: "strings",
    title: "Strings & Template Literals",
    category: "fundamentals",
    level: "basic",
    explanation:
      "Strings are immutable primitives with many methods: slice, substring, split, replace/replaceAll, includes, indexOf, trim, padStart, toUpperCase, etc. Template literals (backticks) allow interpolation `${}`, multiline strings, and tagged templates.",
    code: `const s = "JavaScript Interview";
s.length            // 20
s.slice(0, 10)      // "JavaScript"
s.split(" ")        // ["JavaScript", "Interview"]
s.includes("view")  // true
s.replace("Java", "Type") // "TypeScript Interview"
"  hi  ".trim()     // "hi"
"5".padStart(3, "0")// "005"

const name = "Fohat";
console.log(\`Hello \${name},
you have \${2 + 3} new messages\`); // multiline + interpolation`,
    questions: [
      { q: "Are strings mutable in JavaScript?", a: "No. String methods always return a new string; the original is unchanged." },
      { q: "Difference between slice and substring?", a: "slice accepts negative indexes (counts from end); substring swaps arguments if start > end and treats negatives as 0." },
      { q: "What are template literals?", a: "Backtick strings supporting ${expression} interpolation, multiline text, and tagged templates for custom processing." },
    ],
  },
  {
    id: "numbers-math",
    title: "Numbers, NaN & Math",
    category: "fundamentals",
    level: "basic",
    explanation:
      "All JS numbers are 64-bit floats (IEEE 754), which causes 0.1 + 0.2 !== 0.3. NaN means 'Not a Number' but typeof NaN is 'number'. Use Number.isNaN, Number.isInteger, toFixed, parseInt/parseFloat, and Math methods (round, floor, ceil, random, max, min).",
    code: `0.1 + 0.2            // 0.30000000000000004
(0.1 + 0.2).toFixed(2) // "0.30"
Number.EPSILON       // used for float comparison

parseInt("42px")     // 42
Number("42px")       // NaN
Number.isNaN(NaN)    // true

Math.round(4.5)  // 5
Math.floor(4.9)  // 4
Math.ceil(4.1)   // 5
Math.random()    // 0 <= n < 1
Math.max(1, 5, 3) // 5

// random int 1..6
Math.floor(Math.random() * 6) + 1;`,
    questions: [
      { q: "Why is 0.1 + 0.2 !== 0.3?", a: "Floating-point binary representation can't store 0.1/0.2 exactly. Compare with Math.abs(a-b) < Number.EPSILON or use toFixed." },
      { q: "Difference between parseInt and Number?", a: "parseInt parses until the first invalid character ('42px' → 42); Number converts the whole string strictly ('42px' → NaN)." },
      { q: "What is NaN and how do you check for it?", a: "A special number value for invalid math results. Check with Number.isNaN() — not ===, since NaN !== NaN." },
    ],
  },
  {
    id: "conditionals-switch",
    title: "Conditionals & switch",
    category: "fundamentals",
    level: "basic",
    explanation:
      "if/else if/else handles branching; switch compares one value against cases using strict equality (===). Forgetting break causes fall-through (sometimes intentional). default handles unmatched cases. Object lookup maps are often a cleaner alternative to long switches.",
    code: `const day = 3;
switch (day) {
  case 1: console.log("Mon"); break;
  case 2: console.log("Tue"); break;
  case 3: console.log("Wed"); break;
  default: console.log("Unknown");
}

// fall-through (intentional grouping)
switch (day) {
  case 6:
  case 7: console.log("Weekend"); break;
  default: console.log("Weekday");
}

// object map alternative
const dayName = { 1: "Mon", 2: "Tue", 3: "Wed" }[day] ?? "Unknown";`,
    questions: [
      { q: "Does switch use == or ===?", a: "Strict equality (===) — no type coercion between the switch value and case values." },
      { q: "What is fall-through in switch?", a: "Without break, execution continues into the next case. Useful for grouping cases, but a common source of bugs." },
    ],
  },
];
