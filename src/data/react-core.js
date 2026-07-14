// React track — basics & hooks
export default [
  {
    id: "jsx",
    title: "JSX: JavaScript + XML",
    category: "react-basics",
    level: "basic",
    explanation:
      "JSX is syntax sugar that lets you write UI markup inside JavaScript. It compiles (via Babel) to React.createElement calls — so JSX IS JavaScript, not HTML. Differences from HTML: className instead of class, htmlFor instead of for, camelCase attributes (onClick), expressions in {braces}, and every component must return ONE root element (or a Fragment).",
    code: `const name = "Fohat";

// JSX
const el = <h1 className="title">Hello {name}! You have {2 + 3} tasks</h1>;

// what it compiles to:
const el2 = React.createElement(
  "h1",
  { className: "title" },
  "Hello ", name, "! You have ", 5, " tasks"
);

// one root element — use fragments to avoid extra divs
function Card() {
  return (
    <>
      <h2>Title</h2>
      <p>Body</p>
    </>
  );
}

// expressions only — no if/for statements inside {}
const status = <p>{isOnline ? "🟢 online" : "⚪ offline"}</p>;`,
    questions: [
      { q: "What is JSX and why can't browsers run it directly?", a: "A syntax extension that compiles to React.createElement calls via Babel. Browsers only understand plain JS, so a build step transpiles JSX first." },
      { q: "Why className instead of class?", a: "JSX is JavaScript, and class is a reserved keyword in JS — so React uses the DOM property name className (same reason for htmlFor)." },
      { q: "Can you write an if statement inside JSX braces?", a: "No — braces accept expressions only. Use ternaries, && short-circuit, or compute values before the return." },
    ],
  },
  {
    id: "components-props",
    title: "Components & Props",
    category: "react-basics",
    level: "basic",
    explanation:
      "Components are reusable functions that return JSX. Props are their inputs — passed like attributes, received as one object, and READ-ONLY (never mutate props). Data flows one way: parent → child. children is a special prop containing nested content. Component names must start with a capital letter.",
    code: `function Badge({ label, color = "gold" }) {   // destructure + default
  return <span style={{ background: color }}>{label}</span>;
}

function Card({ title, children }) {          // children prop
  return (
    <div className="card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

// usage — one-way data flow
<Card title="Interview Tips">
  <Badge label="React" />
  <Badge label="JS" color="skyblue" />
  <p>Props flow parent → child only.</p>
</Card>

// ❌ never do this:
// props.title = "new";  // props are read-only!`,
    questions: [
      { q: "What are props and can a child modify them?", a: "Inputs passed from parent to child as a read-only object. Children must never mutate props — to change data, the parent passes a callback the child can call." },
      { q: "What is the children prop?", a: "Whatever you nest between a component's opening and closing tags — enables wrapper/layout components like Card, Modal, Layout." },
      { q: "Why must component names be capitalized?", a: "JSX treats lowercase tags as HTML elements (<div>) and capitalized ones as components (<Card>). A lowercase component silently renders as an unknown HTML tag." },
    ],
  },
  {
    id: "state-usestate",
    title: "State & useState",
    category: "react-basics",
    level: "basic",
    explanation:
      "State is data a component owns that changes over time — and changing it re-renders the UI. useState returns [value, setter]. Rules: never mutate state directly (React compares references), setters are asynchronous (batched), and use the functional form setX(prev => ...) when the new value depends on the old one.",
    code: `import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  const [user, setUser] = useState({ name: "Yaso", score: 0 });

  const handleClick = () => {
    // ❌ count++ or setCount(count + 1) three times won't triple —
    // state updates are batched and 'count' is stale in this closure
    setCount((prev) => prev + 1);   // ✅ functional update
    setCount((prev) => prev + 1);   // now this works (adds 2 total)

    // ❌ user.score = 10  — mutation, no re-render!
    setUser((prev) => ({ ...prev, score: 10 }));  // ✅ new object
  };

  return <button onClick={handleClick}>Count: {count}</button>;
}`,
    questions: [
      { q: "Why does calling setCount(count + 1) twice only add 1?", a: "Both calls read the same stale count from the closure and updates are batched. Use the functional form setCount(prev => prev + 1) to chain correctly." },
      { q: "Why must state updates be immutable?", a: "React decides to re-render by comparing references (===). Mutating the same object keeps the reference identical, so React sees no change." },
      { q: "Is setState synchronous?", a: "No — React batches updates and re-renders after the event handler finishes. Reading state right after setting it gives the old value." },
    ],
  },
  {
    id: "lists-keys",
    title: "Rendering Lists & Keys",
    category: "react-basics",
    level: "basic",
    explanation:
      "Render lists with map(). Every item needs a stable, unique `key` so React can track which items changed, moved, or were removed during reconciliation. Using array INDEX as key breaks when items are reordered, inserted, or deleted — causing wrong state and input bugs. Use stable IDs.",
    code: `const todos = [
  { id: "a1", text: "Learn keys" },
  { id: "b2", text: "Master hooks" },
];

// ✅ stable unique id as key
<ul>
  {todos.map((t) => <li key={t.id}>{t.text}</li>)}
</ul>

// ❌ index as key — breaks on insert/reorder/delete
{todos.map((t, i) => <li key={i}>{t.text}</li>)}
/* If you delete the first item, every index shifts:
   React thinks item "b2" is the OLD "a1" and reuses its
   DOM/state — checkbox/input values end up on wrong rows! */

// conditional rendering patterns
{isLoading && <Spinner />}
{error ? <Error msg={error} /> : <List items={todos} />}
{items.length === 0 && <p>No items yet</p>}`,
    questions: [
      { q: "Why does React need keys?", a: "During reconciliation React matches old and new list items by key to know what to reuse, move, add, or remove — without keys it falls back to position, causing wrong updates." },
      { q: "When is index as key acceptable?", a: "Only for static lists that never reorder, insert, delete, or have stateful children. Otherwise use stable IDs from your data." },
      { q: "What bugs do wrong keys cause?", a: "Component state (inputs, checkboxes) sticking to the wrong rows, lost focus, unnecessary re-mounts, and animation glitches." },
    ],
  },
  {
    id: "controlled-forms",
    title: "Controlled vs Uncontrolled Components",
    category: "react-basics",
    level: "intermediate",
    explanation:
      "Controlled components: form values live in React state — value={state} + onChange. React is the single source of truth, enabling instant validation, conditional disabling, and formatting. Uncontrolled: the DOM holds the value, read it via a ref when needed — less code, good for simple/file inputs. Interviews love asking the difference.",
    code: `// CONTROLLED — React owns the value
function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(form); }}>
      <input name="email" value={form.email} onChange={onChange} />
      <input name="password" type="password" value={form.password} onChange={onChange} />
      <button disabled={!form.email.includes("@")}>Login</button>
    </form>
  );
}

// UNCONTROLLED — DOM owns the value, read when needed
function Search() {
  const inputRef = useRef(null);
  const onSubmit = (e) => {
    e.preventDefault();
    console.log(inputRef.current.value);   // read on demand
  };
  return (
    <form onSubmit={onSubmit}>
      <input ref={inputRef} defaultValue="react" />
    </form>
  );
}`,
    questions: [
      { q: "Controlled vs uncontrolled — difference?", a: "Controlled: value lives in React state (value + onChange), enabling live validation. Uncontrolled: DOM keeps the value, accessed via ref (defaultValue for initial). File inputs are always uncontrolled." },
      { q: "Why does React warn about value without onChange?", a: "value makes the input controlled — without onChange the state never updates, so the input is frozen. Use defaultValue for an initial-but-editable value." },
    ],
  },
  {
    id: "lifting-state",
    title: "Lifting State Up & Component Communication",
    category: "react-basics",
    level: "intermediate",
    explanation:
      "When two components need the same data, move the state to their closest common parent ('lifting state up') and pass it down as props; children request changes via callback props. Parent→child: props. Child→parent: callbacks. Distant components: Context or a state library. This one-way flow keeps data predictable.",
    code: `function TemperatureApp() {
  const [celsius, setCelsius] = useState(20);   // lifted state

  return (
    <>
      <CelsiusInput value={celsius} onChange={setCelsius} />
      <FahrenheitDisplay celsius={celsius} />
    </>
  );
}

function CelsiusInput({ value, onChange }) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}  // child → parent
    />
  );
}

function FahrenheitDisplay({ celsius }) {         // parent → child
  return <p>{(celsius * 9) / 5 + 32}°F</p>;
}`,
    questions: [
      { q: "What is lifting state up?", a: "Moving shared state to the closest common ancestor so sibling components stay in sync — the parent owns the data, children receive it via props and change it via callbacks." },
      { q: "How does a child send data to its parent?", a: "The parent passes a callback function as a prop; the child calls it with the data. React has no built-in child→parent binding." },
      { q: "What is prop drilling and how do you avoid it?", a: "Passing props through many layers that don't use them. Solve with Context, component composition (children), or state managers like Redux/Zustand." },
    ],
  },

  /* ---------------- HOOKS ---------------- */
  {
    id: "useeffect",
    title: "useEffect: Side Effects & Cleanup",
    category: "react-hooks",
    level: "intermediate",
    explanation:
      "useEffect runs side effects (fetching, subscriptions, timers, DOM) AFTER render. The dependency array controls when: [] → once on mount, [x] → when x changes, none → every render. Return a cleanup function — it runs before the next effect and on unmount (clear timers, abort fetches, remove listeners). Missing deps cause stale-closure bugs.",
    code: `function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(\`/api/users/\${userId}\`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setUser)
      .catch(() => {});

    return () => controller.abort();   // cleanup: cancel on unmount/change
  }, [userId]);                        // re-run when userId changes

  return user ? <h2>{user.name}</h2> : <p>Loading…</p>;
}

// dependency array cheat sheet
useEffect(() => {});        // every render (rarely wanted)
useEffect(() => {}, []);    // once — on mount
useEffect(() => {}, [a, b]);// when a or b changes

// timer with cleanup
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);      // prevent leaks
}, []);`,
    questions: [
      { q: "When does useEffect run and when does cleanup run?", a: "The effect runs after the render is committed to the DOM. Cleanup runs before the next effect execution and on unmount — perfect for clearing timers/subscriptions." },
      { q: "What happens if you omit the dependency array?", a: "The effect runs after EVERY render. With [] it runs once; with [deps] only when those values change." },
      { q: "Why does an interval inside useEffect see stale state?", a: "The callback closes over state from the render when the effect ran. Fix with functional updates (setX(p => p+1)), including the state in deps, or a ref." },
      { q: "Why does an effect run twice in development?", a: "React 18 StrictMode mounts, unmounts, and remounts components in dev to surface missing cleanups. Production runs it once." },
    ],
  },
  {
    id: "useref",
    title: "useRef: Mutable Values & DOM Access",
    category: "react-hooks",
    level: "intermediate",
    explanation:
      "useRef returns a { current } object that persists across renders — changing it does NOT trigger a re-render. Two uses: (1) accessing DOM nodes (focus, scroll, measure), (2) storing mutable values that shouldn't cause renders (timer ids, previous values, latest callbacks). It's the escape hatch from React's render cycle.",
    code: `function SearchBox() {
  const inputRef = useRef(null);            // DOM access

  useEffect(() => {
    inputRef.current.focus();               // autofocus on mount
  }, []);

  return <input ref={inputRef} />;
}

function Stopwatch() {
  const [time, setTime] = useState(0);
  const timerId = useRef(null);             // mutable value — no re-render

  const start = () => {
    if (timerId.current) return;            // already running
    timerId.current = setInterval(() => setTime((t) => t + 1), 1000);
  };
  const stop = () => {
    clearInterval(timerId.current);
    timerId.current = null;
  };

  return <>{time}s <button onClick={start}>▶</button><button onClick={stop}>■</button></>;
}

// previous value pattern
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}`,
    questions: [
      { q: "useRef vs useState?", a: "Both persist across renders, but updating a ref doesn't re-render, and ref updates are immediate (not batched). Use state for anything the UI displays; refs for everything else." },
      { q: "How do you access a DOM element in React?", a: "Attach ref={myRef} to the element; after mount, myRef.current is the DOM node — for focus, measurements, scrolling, media control." },
      { q: "Why store a timer id in a ref instead of state?", a: "The id is bookkeeping — the UI doesn't show it. Putting it in state would cause pointless re-renders and stale-closure complications." },
    ],
  },
  {
    id: "usememo-usecallback",
    title: "useMemo & useCallback: Memoization",
    category: "react-hooks",
    level: "advanced",
    explanation:
      "Every render re-creates functions and re-runs calculations. useMemo caches a computed VALUE; useCallback caches a FUNCTION reference (useCallback(fn, deps) === useMemo(() => fn, deps)). They matter when: passing props to React.memo children (reference equality), expensive computations, or values used as effect dependencies. Don't wrap everything — memoization has its own cost.",
    code: `function ProductList({ products, onBuy }) {
  const [query, setQuery] = useState("");

  // ✅ useMemo — skip expensive filtering unless inputs change
  const visible = useMemo(
    () => products.filter((p) => p.name.includes(query)),
    [products, query]
  );

  // ✅ useCallback — stable reference so memoized children don't re-render
  const handleBuy = useCallback((id) => onBuy(id), [onBuy]);

  return visible.map((p) => (
    <ProductCard key={p.id} product={p} onBuy={handleBuy} />
  ));
}

// React.memo: skips re-render if props are shallow-equal
const ProductCard = React.memo(function ProductCard({ product, onBuy }) {
  console.log("render:", product.name);   // now only when ITS props change
  return <button onClick={() => onBuy(product.id)}>{product.name}</button>;
});

/* Without useCallback, handleBuy is a NEW function every render,
   so React.memo sees changed props and re-renders every card anyway. */`,
    questions: [
      { q: "Difference between useMemo and useCallback?", a: "useMemo caches a computed value (runs the function, stores result); useCallback caches the function itself. useCallback(fn, deps) equals useMemo(() => fn, deps)." },
      { q: "Why does React.memo often need useCallback?", a: "memo compares props shallowly. Inline functions are new references each render, defeating memo — useCallback keeps the reference stable." },
      { q: "Should you memoize everything?", a: "No — memoization costs memory and comparison time. Use it for expensive computations, stable references for memoized children, and effect dependencies." },
    ],
  },
  {
    id: "usecontext",
    title: "useContext: Global Data Without Drilling",
    category: "react-hooks",
    level: "intermediate",
    explanation:
      "Context passes data through the tree without prop drilling: createContext → <Provider value=…> → useContext in any descendant. Ideal for theme, auth user, language. Caveat: ALL consumers re-render when the value changes — so memoize the provider value and split frequently-changing data into separate contexts.",
    code: `const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = useCallback(async (email, pw) => {
    setUser(await api.login(email, pw));
  }, []);

  // ✅ memoize — otherwise a new object each render re-renders ALL consumers
  const value = useMemo(() => ({ user, login }), [user, login]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {                       // custom hook wrapper
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

// any component, any depth — no prop drilling
function Navbar() {
  const { user } = useAuth();
  return <span>Hi, {user?.name ?? "guest"}</span>;
}`,
    questions: [
      { q: "What problem does Context solve?", a: "Prop drilling — passing data through intermediate components that don't need it. Provider makes the value available to any descendant via useContext." },
      { q: "What's the performance gotcha with Context?", a: "Every consumer re-renders when the provider's value changes. Passing a fresh object literal each render re-renders everyone — memoize the value with useMemo." },
      { q: "Is Context a replacement for Redux?", a: "For low-frequency global data (theme, auth) yes. For complex, frequently-updated state with devtools/middleware needs, dedicated stores (Redux, Zustand) scale better." },
    ],
  },
  {
    id: "usereducer",
    title: "useReducer: Complex State Logic",
    category: "react-hooks",
    level: "advanced",
    explanation:
      "useReducer manages state with a reducer: (state, action) => newState, dispatched via action objects — Redux-style, built into React. Prefer it over useState when: next state depends on previous, multiple sub-values update together, or update logic deserves centralizing/testing. dispatch has a stable identity (safe for effects/children).",
    code: `const initial = { items: [], total: 0 };

function cartReducer(state, action) {
  switch (action.type) {
    case "add": {
      const items = [...state.items, action.item];
      return { items, total: items.reduce((s, i) => s + i.price, 0) };
    }
    case "remove": {
      const items = state.items.filter((i) => i.id !== action.id);
      return { items, total: items.reduce((s, i) => s + i.price, 0) };
    }
    case "clear":
      return initial;
    default:
      throw new Error("Unknown action: " + action.type);
  }
}

function Cart() {
  const [state, dispatch] = useReducer(cartReducer, initial);

  return (
    <>
      <button onClick={() => dispatch({ type: "add", item: { id: 1, price: 99 } })}>
        Add
      </button>
      <button onClick={() => dispatch({ type: "clear" })}>Clear</button>
      <p>Total: ₹{state.total}</p>
    </>
  );
}`,
    questions: [
      { q: "When useReducer over useState?", a: "When state transitions are complex or interdependent, multiple values change together, or you want centralized, testable update logic. Simple independent values → useState." },
      { q: "What are the rules for a reducer function?", a: "Pure: no side effects, no mutation — always return a NEW state object based on the current state and action." },
      { q: "How is useReducer related to Redux?", a: "Same pattern (actions, reducer, dispatch) but component-scoped, without middleware, devtools, or a global store." },
    ],
  },
  {
    id: "custom-hooks",
    title: "Custom Hooks: Reusable Logic",
    category: "react-hooks",
    level: "advanced",
    explanation:
      "A custom hook is a function starting with 'use' that calls other hooks — extracting stateful logic for reuse across components (data fetching, localStorage sync, debouncing). Each component using a hook gets ITS OWN isolated state. This is React's answer to sharing behavior without HOCs or render props.",
    code: `// useLocalStorage — state that persists
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial; }
    catch { return initial; }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// useDebounce — for search-as-you-type
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// usage
function Search() {
  const [theme, setTheme] = useLocalStorage("theme", "dark");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);

  useEffect(() => {
    if (debouncedQuery) searchApi(debouncedQuery);
  }, [debouncedQuery]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}`,
    questions: [
      { q: "What is a custom hook?", a: "A 'use'-prefixed function composing built-in hooks to package reusable stateful logic — like useFetch, useDebounce, useLocalStorage." },
      { q: "Do components share state through a custom hook?", a: "No — every call creates independent state. Hooks share LOGIC, not state. For shared state use Context or a store." },
      { q: "Why must the name start with 'use'?", a: "So React's lint rules can verify the Rules of Hooks (top-level calls only) apply inside it." },
    ],
  },
  {
    id: "hooks-rules",
    title: "Rules of Hooks & Why They Exist",
    category: "react-hooks",
    level: "intermediate",
    explanation:
      "Two rules: (1) only call hooks at the TOP LEVEL — never inside conditions, loops, or nested functions; (2) only call them from React components or custom hooks. Why: React stores hook state in an ordered list per component — the Nth useState call must always be the Nth. A conditional hook shifts the order and corrupts every hook after it.",
    code: `function Profile({ isAdmin }) {
  // ❌ conditional hook — order changes between renders!
  // if (isAdmin) {
  //   const [perms, setPerms] = useState([]);
  // }

  // ✅ hook always runs; condition goes INSIDE
  const [perms, setPerms] = useState([]);
  useEffect(() => {
    if (isAdmin) fetchPerms().then(setPerms);
  }, [isAdmin]);

  /* WHY: React keeps hooks by call order:
     render 1: [useState#1, useState#2, useEffect#1]
     If a hook is skipped next render, #2 receives #1's stored
     state — everything after the skipped hook breaks. */

  // ❌ also wrong: hooks in loops, event handlers, regular functions
  // ✅ early returns are fine AFTER all hooks have been called
  if (!perms.length) return <p>No permissions</p>;
  return <ul>{perms.map((p) => <li key={p}>{p}</li>)}</ul>;
}`,
    questions: [
      { q: "What are the Rules of Hooks?", a: "Call hooks only at the top level (no conditions/loops/nesting) and only from function components or custom hooks." },
      { q: "WHY can't hooks be conditional?", a: "React identifies hooks by call ORDER, storing their state in a sequential list. Skipping a hook shifts the order, so later hooks read the wrong state." },
      { q: "Can you use an early return before hooks?", a: "No — a return before some hooks means they're skipped conditionally. Call all hooks first, then return early." },
    ],
  },
];
