export default [
  {
    id: "how-js-executes",
    title: "How JavaScript Executes Your Code",
    category: "internals",
    level: "intermediate",
    explanation:
      "JavaScript is single-threaded — one line at a time on one call stack. When your file runs: (1) the engine PARSES source code into an AST (Abstract Syntax Tree), (2) compiles it to bytecode which the interpreter executes, (3) hot code is JIT-compiled to fast machine code. Before executing, a Global Execution Context is created in two phases: the CREATION phase allocates memory for variables (var → undefined, functions → full body, let/const → TDZ), then the EXECUTION phase runs code line by line, assigning real values. Every function call creates a new Execution Context pushed onto the call stack.",
    code: `console.log(x);      // undefined — memory was allocated in
var x = 10;          // the creation phase, value assigned later

sayHi();             // ✅ works — whole function stored in creation phase
function sayHi() { console.log("Hi!"); }

/*
PHASE 1 — Memory Creation (before any line runs):
  x     → undefined
  sayHi → ƒ (entire function)

PHASE 2 — Code Execution (line by line):
  line 1: print x            → undefined
  line 2: x = 10
  line 4: call sayHi()       → NEW execution context pushed
          → runs, prints "Hi!", context popped
*/

// Engine pipeline:
// source code → Parser → AST → Interpreter (bytecode)
//                         ↘ hot code → JIT Compiler → machine code`,
    questions: [
      { q: "Explain how JavaScript code is executed.", a: "The engine parses code to an AST, compiles to bytecode, and JIT-compiles hot paths. Execution happens inside execution contexts: a global context first, then one per function call, each with a creation phase (memory allocation/hoisting) and execution phase (line-by-line run). Contexts are managed on the call stack." },
      { q: "What are the two phases of an execution context?", a: "Creation phase: variables get memory (var=undefined, functions=full body, let/const=TDZ), this and scope chain are set. Execution phase: code runs line by line assigning actual values. This is why hoisting exists." },
      { q: "Is JavaScript compiled or interpreted?", a: "Both — modern engines (V8) interpret bytecode for fast startup and JIT-compile frequently-run code to optimized machine code at runtime." },
      { q: "Why is JavaScript called single-threaded?", a: "It has ONE call stack — only one statement executes at a time. Concurrency comes from the runtime (Web APIs, event loop, queues), not multiple JS threads." },
    ],
  },
  {
    id: "memory-stack-heap",
    title: "Memory: Call Stack vs Heap",
    category: "internals",
    level: "intermediate",
    explanation:
      "JavaScript uses two memory regions. The STACK is fast, fixed-size, and stores execution contexts (stack frames) with primitive values and references — pushed on function call, popped on return (LIFO). The HEAP is a large, unstructured region storing objects, arrays, and functions; variables on the stack hold only a REFERENCE (pointer) to heap data. Too many nested calls overflow the stack (RangeError); unreachable heap objects are reclaimed by the garbage collector.",
    code: `function outer() {
  const n = 42;                 // primitive → lives in stack frame
  const user = { name: "Yaso" };// object → HEAP; 'user' holds a pointer
  inner();                      // new frame pushed on STACK
}
function inner() { const y = 1; }
outer();

/*
   CALL STACK (fixed, fast)      HEAP (big, dynamic)
   ┌─────────────────┐
   │ inner: y = 1    │ ← top     ┌──────────────────┐
   ├─────────────────┤           │ { name: "Yaso" } │
   │ outer: n = 42   │           └──────────────────┘
   │        user ────┼──────────────────↑
   ├─────────────────┤
   │ global          │
   └─────────────────┘
   frames pop when functions return; heap objects live
   until nothing references them → garbage collected
*/

// stack overflow — frames never pop
function recurse() { return recurse(); }
// recurse(); // RangeError: Maximum call stack size exceeded`,
    questions: [
      { q: "What is stored in the stack vs the heap?", a: "Stack: execution contexts/frames with primitives and references — fast, small, LIFO. Heap: objects, arrays, functions — large, dynamic, garbage-collected. Stack variables point to heap data via references." },
      { q: "What causes 'Maximum call stack size exceeded'?", a: "Recursion without a base case (or extremely deep call chains) keeps pushing frames until the fixed-size stack is full — RangeError." },
      { q: "When is heap memory freed?", a: "When an object becomes unreachable from GC roots (globals, current stack), the mark-and-sweep garbage collector reclaims it automatically." },
    ],
  },
  {
    id: "value-vs-reference",
    title: "Pass by Value vs Pass by Reference",
    category: "internals",
    level: "intermediate",
    explanation:
      "Primitives are copied BY VALUE — assigning or passing them creates an independent copy. Objects/arrays are copied BY REFERENCE-VALUE — the variable holds a pointer, so two variables can point at the same heap object and mutations are visible through both. Reassigning a parameter inside a function never affects the caller's variable; mutating the object it points to does.",
    code: `// primitives — independent copies
let a = 10;
let b = a;
b++;
console.log(a, b);   // 10, 11

// objects — shared reference
const obj1 = { count: 0 };
const obj2 = obj1;         // copies the POINTER, not the object
obj2.count++;
console.log(obj1.count);   // 1 😱 same heap object

// in functions
function update(user) {
  user.name = "Changed";   // ✅ mutates caller's object (same ref)
  user = { name: "New" };  // ❌ only rebinds the local pointer
}
const me = { name: "Yaso" };
update(me);
console.log(me.name);      // "Changed" — not "New"

// breaking the link → copy
const safe = { ...obj1 };            // shallow
const deep = structuredClone(obj1);  // deep`,
    questions: [
      { q: "Is JavaScript pass-by-value or pass-by-reference?", a: "Always pass-by-value — but for objects, the value IS a reference (pointer). So mutations through the parameter are shared, while reassigning the parameter changes nothing outside." },
      { q: "Why does changing obj2 also change obj1?", a: "Assignment copies the reference, not the object — both variables point to the same heap object." },
      { q: "How do you compare whether two variables share the same object?", a: "obj1 === obj2 compares references — true only if they point to the exact same heap object." },
    ],
  },
  {
    id: "js-runtime",
    title: "JS Runtime: Engine + Web APIs + Queues",
    category: "internals",
    level: "advanced",
    explanation:
      "The JS engine (V8) alone has just a call stack and heap — no setTimeout, no fetch, no DOM! Those come from the RUNTIME ENVIRONMENT: the browser provides Web APIs (timers, fetch, DOM events), a microtask queue (promises), a macrotask/callback queue (timers, events), and the event loop that moves completed callbacks back onto the stack. Node.js is a different runtime: same V8 engine, but with libuv (thread pool), fs/http modules, and its own event loop phases instead of a DOM.",
    code: `/*
   ┌───────────────  BROWSER RUNTIME  ───────────────┐
   │  ┌────── V8 ENGINE ─────┐   ┌─── Web APIs ────┐ │
   │  │  Call Stack │  Heap  │   │ setTimeout      │ │
   │  └──────▲───────────────┘   │ fetch  DOM      │ │
   │         │ event loop        │ events          │ │
   │         │                   └───────┬─────────┘ │
   │  ┌──────┴─────────┐  ┌──────────────▼────────┐  │
   │  │ Microtask Queue│  │ Callback (Task) Queue │  │
   │  │ promises (1st!)│  │ timers, clicks (2nd)  │  │
   │  └────────────────┘  └───────────────────────┘  │
   └─────────────────────────────────────────────────┘
*/

setTimeout(() => console.log("timer"), 0);   // Web API → task queue
fetch("/api").then(() => console.log("data")); // → microtask queue
console.log("sync");                          // call stack directly
// order: sync → (microtasks) → timer

// Node.js runtime differences:
// - no window/DOM → global, process
// - libuv thread pool for fs/network
// - event loop phases: timers → I/O → check(setImmediate)...`,
    questions: [
      { q: "Is setTimeout part of JavaScript?", a: "No — it's a Web API provided by the browser runtime (or Node's timers module). The engine itself only has the call stack and heap." },
      { q: "What's the difference between the JS engine and the runtime?", a: "Engine (V8): parses and executes JS — stack + heap. Runtime (browser/Node): engine PLUS environment APIs (DOM/fs), task queues, and the event loop." },
      { q: "How do browser and Node.js runtimes differ?", a: "Browser: window, DOM, Web APIs, storage. Node: global, process, fs/http, libuv thread pool, setImmediate, different event-loop phases. Same V8 engine underneath." },
    ],
  },
  {
    id: "garbage-collection-deep",
    title: "Garbage Collection: Mark & Sweep in Depth",
    category: "internals",
    level: "advanced",
    explanation:
      "V8's GC is generational: NEW objects go to the small 'young generation' (nursery), collected frequently and fast (Scavenge — copying live objects between two semi-spaces); objects surviving a few collections are promoted to the 'old generation', collected less often with Mark-Sweep-Compact. Marking starts from roots (globals, stack, registers) and follows every reference — anything unmarked is garbage. Modern V8 does much of this incrementally and concurrently to avoid freezing your page.",
    code: `let user = { name: "A" };        // reachable via 'user' root
let admin = user;                 // two references, one object

user = null;                      // still reachable via 'admin'
admin = null;                     // ✅ unreachable → collectable

// islands of garbage — mutual references still collected!
function marry(man, woman) {
  man.wife = woman;
  woman.husband = man;
  return { father: man, mother: woman };
}
let family = marry({ name: "John" }, { name: "Ann" });
family = null;   // whole island unreachable → ALL collected
// (reference counting would leak here; mark & sweep doesn't)

/*
  roots (globals, stack)
    │ mark ✓ everything reachable
    ▼
  ✓ obj ── ✓ obj     ✗ orphan ↔ ✗ orphan  ← swept
*/`,
    questions: [
      { q: "How does mark-and-sweep work?", a: "Start from roots (globals, current stack), mark every object reachable by following references, then sweep (free) everything unmarked. Reachability — not reference counts — decides survival, so circular garbage is still collected." },
      { q: "What is generational garbage collection?", a: "Most objects die young, so V8 collects a small young generation frequently and cheaply, promoting survivors to the old generation which is collected rarely with mark-sweep-compact." },
      { q: "Can circular references cause leaks in JS?", a: "Not by themselves — mark-and-sweep collects unreachable cycles. Leaks come from cycles still reachable from roots (e.g., a detached DOM node referenced by a live closure)." },
    ],
  },
];
