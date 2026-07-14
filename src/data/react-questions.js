// Most-asked React interview questions — question-dense packs, one per category.
export default [
  {
    id: "react-mostasked-rendering",
    title: "Most-Asked: Rendering & Lifecycle",
    category: "react-basics",
    level: "intermediate",
    explanation:
      "The rendering and lifecycle questions that open almost every React interview. Modern React expresses the old class lifecycle through hooks: mount = useEffect(fn, []), update = useEffect(fn, [deps]), unmount = the cleanup function. Understand the render → commit flow and you can answer every variation.",
    code: `// class lifecycle → hooks translation (memorize this mapping!)
useEffect(() => {
  // componentDidMount — runs once after first render
  return () => {
    // componentWillUnmount — cleanup
  };
}, []);

useEffect(() => {
  // componentDidUpdate (for these deps)
}, [propA, stateB]);

// render vs commit phases:
// RENDER  → React calls components, builds virtual tree (can be interrupted)
// COMMIT  → applies DOM changes, runs effects (never interrupted)

// mount vs re-render vs unmount
function Demo({ show }) {
  return show ? <Child key="one" /> : null;  // toggle → mount/unmount
}`,
    questions: [
      { q: "What is the component lifecycle in function components?", a: "Mount → render + useEffect(fn, []) runs; Update → re-render + effects whose deps changed (cleanup of the old effect runs first); Unmount → all cleanup functions run. Hooks replaced componentDidMount/DidUpdate/WillUnmount." },
      { q: "What is the difference between rendering and committing?", a: "Rendering: React calls your components to compute the new virtual tree — pure, interruptible, may run twice in StrictMode. Committing: React applies the diff to the real DOM and runs effects — synchronous and guaranteed once." },
      { q: "Why shouldn't you update state directly (this.state.x = 1 or obj.x = 1)?", a: "React won't know anything changed — no re-render is scheduled, and reference-based optimizations (memo, deps) break. Always use the setter with a new object/array." },
      { q: "What is a Single Page Application (SPA)?", a: "One HTML page where JS swaps views client-side using the History API — no full page reloads. Faster navigation and preserved state, but needs client routing and SEO care." },
      { q: "What happens when you call setState with the SAME value?", a: "React bails out: if Object.is(newValue, oldValue) is true, it skips re-rendering (it may still render that one component once before bailing in some cases, but children are skipped)." },
      { q: "What is the difference between element and component?", a: "A component is the function/class (the blueprint); an element is the plain object JSX produces describing one instance (<Card /> → { type: Card, props: {} }). Elements are cheap and immutable." },
      { q: "How do you force a component to remount?", a: "Change its key prop — React treats a new key as a different element, destroying the old instance (and its state) and mounting a fresh one. Useful for resetting forms." },
      { q: "React vs Angular/Vue — how do you answer this?", a: "React is a UI library (unopinionated — you pick router/state), uses JSX and one-way data flow, backed by a huge ecosystem. Angular is a full framework with DI and two-way binding; Vue sits between. Pick based on team and project needs — never trash-talk one in an interview." },
    ],
  },
  {
    id: "react-mostasked-hooks",
    title: "Most-Asked: Hooks Deep-Dive Questions",
    category: "react-hooks",
    level: "advanced",
    explanation:
      "The hooks follow-up questions that separate juniors from seniors: useEffect vs useLayoutEffect, infinite loop causes, lazy initialization, stale closures, and fetching patterns. If you can explain WHY each behavior happens, you're ahead of 90% of candidates.",
    code: `// 1. infinite loop — the classic bug
useEffect(() => {
  setItems([...items, "new"]);   // ❌ setState → render → effect → setState…
}, [items]);                      //    (items is also a dep!)

// 2. lazy initial state — expensive init runs ONCE, not every render
const [data, setData] = useState(() => JSON.parse(localStorage.getItem("big")));

// 3. useEffect vs useLayoutEffect
useEffect(() => {});        // async, AFTER paint — data, subscriptions
useLayoutEffect(() => {});  // sync, BEFORE paint — measure/mutate DOM (avoids flicker)

// 4. fetch on mount — the standard pattern
useEffect(() => {
  let alive = true;
  (async () => {
    const data = await fetchUser(id);
    if (alive) setUser(data);      // don't set state after unmount
  })();
  return () => { alive = false; };
}, [id]);

// 5. why not: useEffect(async () => {...})
// async fn returns a Promise — React expects the return to be a CLEANUP fn`,
    questions: [
      { q: "What causes an infinite loop with useEffect?", a: "The effect sets state that's in its own dependency array (or has no array at all) — each render triggers the effect which triggers a render. Fix: functional updates, correct deps, or moving logic out." },
      { q: "useEffect vs useLayoutEffect?", a: "useEffect runs asynchronously after the browser paints — right for data/subscriptions. useLayoutEffect runs synchronously before paint — for DOM measurements/mutations to avoid visual flicker, but it blocks painting." },
      { q: "Why can't the useEffect callback itself be async?", a: "An async function returns a Promise, but React expects the return value to be a cleanup function. Define an async function inside the effect and call it." },
      { q: "What is lazy initialization in useState?", a: "useState(() => expensive()) — passing a function makes React run it only on the first render, instead of recomputing the initial value on every render." },
      { q: "What is a stale closure in hooks?", a: "A callback (interval, listener, memoized fn) captured old state/props from the render it was created in. Fixes: functional setState, correct dependency arrays, or a ref holding the latest value." },
      { q: "Can you use hooks inside class components?", a: "No — hooks work only in function components and custom hooks. Classes use lifecycle methods; you can wrap a class with a function component that passes hook data as props." },
      { q: "How do you run an effect only when a value changes, skipping mount?", a: "Track first render with a ref: const first = useRef(true); in the effect, if (first.current) { first.current = false; return; } — then the update logic." },
      { q: "How do you share logic between components without duplicating code?", a: "Custom hooks (modern answer) — extract the useState/useEffect logic into useSomething(). Older patterns: HOCs and render props, worth naming for senior interviews." },
    ],
  },
  {
    id: "react-mostasked-advanced",
    title: "Most-Asked: HOC, Fiber, SSR & Hydration",
    category: "react-advanced",
    level: "advanced",
    explanation:
      "Senior-round favorites: higher-order components, render props, React Fiber, and the SSR/CSR/hydration story. You rarely write HOCs today, but interviewers use them to test whether you understand composition — and SSR questions test whether you understand what React actually ships to the browser.",
    code: `// HOC — a function that takes a component, returns an enhanced one
function withAuth(Component) {
  return function Wrapped(props) {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return <Component {...props} user={user} />;
  };
}
const SecretPage = withAuth(Dashboard);

// render prop — share logic by passing a function as children
function MouseTracker({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}>
      {children(pos)}
    </div>
  );
}
// <MouseTracker>{({ x, y }) => <p>{x},{y}</p>}</MouseTracker>

/* CSR vs SSR:
   CSR: server sends empty <div id="root"> + JS bundle → browser renders
   SSR: server sends READY HTML → fast first paint + SEO
        → then HYDRATION: React attaches listeners to existing HTML  */`,
    questions: [
      { q: "What is a Higher-Order Component (HOC)?", a: "A function that takes a component and returns a new component with extra props/behavior — e.g., withAuth, Redux's connect. Largely replaced by custom hooks, but still tests composition understanding." },
      { q: "What is React Fiber?", a: "React's reconciliation engine (since v16): it breaks rendering into small units of work that can be paused, prioritized, and resumed — the foundation that makes React 18's concurrent features possible." },
      { q: "CSR vs SSR — difference and trade-offs?", a: "CSR renders in the browser after downloading JS (slower first paint, weak SEO, cheap servers). SSR renders HTML on the server (fast first paint, good SEO, more server cost). Frameworks like Next.js mix both per page." },
      { q: "What is hydration?", a: "After SSR sends ready HTML, React runs on the client and attaches event listeners to the existing markup instead of rebuilding it. Mismatched server/client output causes hydration errors." },
      { q: "What is the render props pattern?", a: "A component receives a function (often as children) and calls it with internal state — the caller decides the UI: <Mouse>{pos => <Dot {...pos}/>}</Mouse>. Custom hooks now cover most cases." },
      { q: "Why would you choose Next.js over plain React?", a: "File-based routing, SSR/SSG/ISR per page, API routes, image/font optimization, and code-splitting defaults — production concerns plain React leaves to you." },
      { q: "What are controlled re-renders — how does React decide what to update?", a: "State change re-renders that component and its children; React diffs the new virtual tree vs old, and commits only actual differences to the DOM. memo/useMemo/keys let you prune the work." },
      { q: "What is the children prop pattern for performance?", a: "Content passed as children keeps its element identity when the wrapper re-renders, so React skips re-rendering it — a free optimization: put expensive trees in children instead of rendering them inside a stateful component." },
    ],
  },
  {
    id: "react-mostasked-practical",
    title: "Most-Asked: Practical Scenario Questions",
    category: "react-ecosystem",
    level: "intermediate",
    explanation:
      "'How would you…' questions that test real working knowledge: sharing data between siblings, debouncing search, persisting state, API calls, and project structure. Interviewers care about your decision process — state the simple answer first, then mention the scaling option.",
    code: `// debounced search — THE most asked practical
function Search() {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!query) return;
    const t = setTimeout(() => fetchResults(query), 400); // wait for pause
    return () => clearTimeout(t);                          // cancel on keypress
  }, [query]);

  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// persist state across refreshes
const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "dark");
useEffect(() => localStorage.setItem("theme", theme), [theme]);

// many form fields — ONE handler, not ten useStates
const [form, setForm] = useState({ name: "", email: "", city: "" });
const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

// loading / error / data — the standard trio
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);`,
    questions: [
      { q: "How do two sibling components share data?", a: "Lift the state to their common parent — one sibling updates via a callback prop, the other receives it as a prop. If they're far apart: Context or a store (Redux/Zustand)." },
      { q: "How do you debounce an input in React?", a: "In useEffect on the query: setTimeout for the API call, and return clearTimeout as cleanup — each keystroke cancels the previous timer, so only the final pause fires. Or a useDebounce custom hook." },
      { q: "How do you persist state across page refreshes?", a: "Initialize useState lazily from localStorage and write back in a useEffect on change. For server data, refetch on mount (React Query handles caching). Auth tokens: httpOnly cookies or storage with XSS care." },
      { q: "How do you handle a form with 10+ fields?", a: "One state object + a single onChange using e.target.name as the computed key. At scale: react-hook-form (performance, validation) — mentioning it is a plus." },
      { q: "How do you call an API in React — on mount vs on click?", a: "On mount: useEffect(fn, []) with cleanup/abort. On click: plain async handler — no effect needed. Production answer: React Query/SWR for caching, retries, and loading states." },
      { q: "How do you show loading and error states properly?", a: "Track data/loading/error states; set loading before the request, error in catch, and render each branch. Suspense + error boundaries or React Query formalize the same pattern." },
      { q: "How do you structure a large React project?", a: "Feature-based folders (features/cart/{components,hooks,api}) over type-based ones; shared UI in components/, logic in hooks/, API clients in services/. Colocation: things that change together live together." },
      { q: "How do you prevent a child from re-rendering when the parent updates?", a: "Wrap the child in React.memo and stabilize its props (useCallback/useMemo) — or restructure: move the changing state down, or pass the child through the children prop." },
      { q: "App is slow when typing in an input — how do you debug it?", a: "Profile with React DevTools to find which components re-render per keystroke. Usual fixes: move the input's state down into its own component, memoize the heavy siblings, debounce expensive work, or useTransition/useDeferredValue." },
      { q: "How do you upload a file in React?", a: "Uncontrolled <input type='file'> (file inputs can't be controlled), read e.target.files[0], append to FormData, and POST without setting Content-Type manually (the browser sets the multipart boundary)." },
    ],
  },
];
