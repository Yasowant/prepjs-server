// React track — advanced & ecosystem
export default [
  {
    id: "virtual-dom",
    title: "Virtual DOM & Reconciliation",
    category: "react-advanced",
    level: "intermediate",
    explanation:
      "The Virtual DOM is a lightweight JS object tree describing the UI. On every render React builds a new tree, DIFFS it against the previous one (reconciliation), and applies only the minimal real-DOM changes. Diffing heuristics: different element types → rebuild that subtree; same type → update attributes; lists → match by key. Real DOM writes are slow; object diffing is fast.",
    code: `// state change → new virtual tree → diff → minimal DOM patch

// render 1
<ul>
  <li key="a">Apple</li>
  <li key="b">Banana</li>
</ul>

// render 2 — new item added at TOP
<ul>
  <li key="c">Cherry</li>
  <li key="a">Apple</li>
  <li key="b">Banana</li>
</ul>

/* WITH keys:  React sees a & b already exist → 1 insert. ✅
   WITH index keys: every position "changed" → 3 updates. ❌

   Diffing rules:
   <div> → <span>          rebuild whole subtree
   <div class="a"> → "b"   update attribute only
   <Comp props change>     re-render Comp, keep its state
*/`,
    questions: [
      { q: "What is the Virtual DOM and why is it fast?", a: "An in-memory JS representation of the UI. React diffs new vs old trees and batches only the minimal changes to the slow real DOM — instead of re-rendering everything." },
      { q: "What is reconciliation?", a: "React's diffing process: comparing element type, then props, then children (by key for lists) to compute the smallest set of DOM operations." },
      { q: "What happens when an element's type changes in a re-render?", a: "React destroys the whole subtree (including child state) and builds it fresh — same-type elements are updated in place." },
    ],
  },
  {
    id: "react-memo-performance",
    title: "React.memo & Render Performance",
    category: "react-advanced",
    level: "advanced",
    explanation:
      "By default, when a parent re-renders, ALL children re-render — even with identical props. React.memo wraps a component to skip re-rendering when props are shallow-equal. Combine with useCallback/useMemo for reference props. Other performance tools: moving state down (isolate re-renders), children composition, virtualization for long lists, and the React DevTools Profiler to find real bottlenecks first.",
    code: `// parent re-renders → every child re-renders by default
const Row = React.memo(function Row({ item, onSelect }) {
  console.log("render", item.id);         // only when ITS props change
  return <div onClick={() => onSelect(item.id)}>{item.name}</div>;
});

function Table({ items }) {
  const [selected, setSelected] = useState(null);
  const onSelect = useCallback((id) => setSelected(id), []); // stable ref!

  return items.map((it) => <Row key={it.id} item={it} onSelect={onSelect} />);
}

// "move state down" — typing re-renders ONLY SearchBox, not the big tree
function Page() {
  return (
    <>
      <SearchBox />        {/* state lives here */}
      <HugeTable />        {/* unaffected by keystrokes */}
    </>
  );
}

// children composition trick — children prop keeps its identity,
// so <ExpensiveTree/> does NOT re-render when Wrapper's state changes
function Wrapper({ children }) {
  const [open, setOpen] = useState(false);
  return <div onClick={() => setOpen(!open)}>{children}</div>;
}`,
    questions: [
      { q: "When does a React component re-render?", a: "When its state changes, its parent re-renders, or a context it consumes changes — NOT automatically when 'props change'; parent render is what triggers it." },
      { q: "What does React.memo do and when does it fail?", a: "Skips re-render if props are shallow-equal. It fails when props are new references each render — inline objects, arrays, functions — fixed via useMemo/useCallback." },
      { q: "Name techniques to reduce re-renders.", a: "React.memo + stable references, moving state down, children composition, splitting contexts, list virtualization (react-window), and profiling before optimizing." },
    ],
  },
  {
    id: "error-boundaries",
    title: "Error Boundaries",
    category: "react-advanced",
    level: "advanced",
    explanation:
      "An error boundary catches render-phase errors in its child tree and shows a fallback UI instead of unmounting the whole app (white screen). It must be a CLASS component with static getDerivedStateFromError and/or componentDidCatch — the only remaining class-only feature. It does NOT catch: event handler errors, async/setTimeout errors, or server-side errors.",
    code: `class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };            // switch to fallback UI
  }

  componentDidCatch(error, info) {
    logToService(error, info.componentStack);  // report it
  }

  render() {
    if (this.state.hasError)
      return this.props.fallback ?? <h2>😵 Something broke. <button onClick={() => this.setState({ hasError: false })}>Retry</button></h2>;
    return this.props.children;
  }
}

// wrap risky sections — granular boundaries keep the rest alive
<ErrorBoundary fallback={<p>Chart failed</p>}>
  <RevenueChart />
</ErrorBoundary>

/* NOT caught by boundaries:
   onClick={() => { throw ... }}   → use try/catch
   setTimeout(() => { throw ... }) → use try/catch
   fetch().then(boom)              → .catch()            */`,
    questions: [
      { q: "What is an error boundary?", a: "A class component that catches errors thrown during rendering of its children and renders a fallback UI, preventing the whole app from unmounting." },
      { q: "What errors do boundaries NOT catch?", a: "Event handlers, async code (timers, promises), SSR errors, and errors thrown inside the boundary itself. Handle those with try/catch or .catch." },
      { q: "Why must it be a class component?", a: "The lifecycle hooks getDerivedStateFromError/componentDidCatch have no hook equivalents yet — libraries like react-error-boundary wrap this for you." },
    ],
  },
  {
    id: "portals-fragments",
    title: "Portals & Fragments",
    category: "react-advanced",
    level: "intermediate",
    explanation:
      "createPortal renders children into a DOM node OUTSIDE the parent hierarchy — essential for modals, tooltips, and toasts that must escape overflow:hidden or z-index traps. Events still bubble through the REACT tree, not the DOM tree. Fragments (<>…</>) group children without adding wrapper divs; use <Fragment key=…> when mapping.",
    code: `import { createPortal } from "react-dom";

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return createPortal(
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")   // outside #root!
  );
}

/* index.html:
   <div id="root"></div>
   <div id="modal-root"></div>

   Even though the modal renders elsewhere in the DOM,
   clicks inside it still bubble to React parents — React
   events follow the COMPONENT tree. */

// fragments — no extra wrapper node
function Rows() {
  return (
    <>
      <td>A</td>
      <td>B</td>
    </>
  );  // a wrapper <div> inside <tr> would be invalid HTML!
}`,
    questions: [
      { q: "What is a portal and when do you need one?", a: "createPortal renders children into a different DOM container while keeping them in the React tree — for modals/tooltips escaping overflow or stacking contexts." },
      { q: "Do events from a portal bubble to the parent component?", a: "Yes — event propagation follows the React component tree, not the DOM tree, so parents still receive bubbled events." },
      { q: "Why use Fragments?", a: "Return multiple siblings without junk wrapper divs — keeping valid HTML (table rows) and flat layouts (flex/grid children)." },
    ],
  },
  {
    id: "lazy-suspense",
    title: "Code Splitting: lazy & Suspense",
    category: "react-advanced",
    level: "advanced",
    explanation:
      "React.lazy(() => import('./Page')) splits a component into its own bundle chunk, loaded only when first rendered. Wrap lazy components in <Suspense fallback={…}> to show a loader while the chunk downloads. Route-level splitting is the standard pattern — users only download the page they visit, shrinking initial load dramatically.",
    code: `import { lazy, Suspense } from "react";

// each becomes a separate chunk, fetched on demand
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings  = lazy(() => import("./pages/Settings"));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
}

/* Without splitting: one 2MB bundle up front.
   With splitting:    200KB core + chunks on demand. */

// preload on hover for instant navigation
const load = () => import("./pages/Settings");
<Link to="/settings" onMouseEnter={load}>Settings</Link>`,
    questions: [
      { q: "What is code splitting and why does it matter?", a: "Breaking the bundle into chunks loaded on demand (dynamic import). Users download only what they need — much faster initial page load." },
      { q: "How do React.lazy and Suspense work together?", a: "lazy returns a component that triggers the dynamic import on first render; Suspense catches the pending state and shows a fallback until the chunk arrives." },
      { q: "Where should you split?", a: "Routes first (biggest win), then heavy below-the-fold components — charts, editors, modals." },
    ],
  },
  {
    id: "refs-forwardref",
    title: "forwardRef & useImperativeHandle",
    category: "react-advanced",
    level: "advanced",
    explanation:
      "Refs don't pass through components like props — ref on a custom component needs forwardRef, which forwards it to an inner DOM node. useImperativeHandle customizes what the ref exposes (a limited API like focus/clear instead of the raw node). Used by every input/UI library. Note: React 19 passes ref as a normal prop, but forwardRef remains the interview answer.",
    code: `// ❌ ref on a custom component does nothing without forwardRef
const FancyInput = React.forwardRef(function FancyInput(props, ref) {
  return <input ref={ref} className="fancy" {...props} />;
});

function Form() {
  const inputRef = useRef(null);
  return (
    <>
      <FancyInput ref={inputRef} placeholder="name" />
      <button onClick={() => inputRef.current.focus()}>Focus</button>
    </>
  );
}

// expose a CUSTOM API instead of the raw DOM node
const VideoPlayer = React.forwardRef(function VideoPlayer(props, ref) {
  const videoRef = useRef(null);
  useImperativeHandle(ref, () => ({
    play: () => videoRef.current.play(),
    pause: () => videoRef.current.pause(),
    // consumers can ONLY call these two — nothing else
  }));
  return <video ref={videoRef} src={props.src} />;
});`,
    questions: [
      { q: "Why doesn't ref work on function components directly?", a: "ref isn't a prop — React intercepts it. Function components have no instance, so forwardRef is needed to route the ref to an inner element (React 19 relaxes this)." },
      { q: "What does useImperativeHandle do?", a: "Customizes the value a parent's ref receives — exposing a controlled API (play/pause/focus) instead of the raw DOM node." },
    ],
  },

  /* ---------------- ECOSYSTEM ---------------- */
  {
    id: "react-router",
    title: "React Router: SPA Navigation",
    category: "react-ecosystem",
    level: "intermediate",
    explanation:
      "React Router maps URLs to components client-side — no page reloads. Core pieces: <BrowserRouter>, <Routes>/<Route>, <Link>/<NavLink> (navigation without reload), useNavigate (programmatic), useParams (dynamic segments like /users/:id), useSearchParams (query strings), and Outlet for nested layouts. Protected routes wrap children and redirect guests.",
    code: `<BrowserRouter>
  <Routes>
    <Route path="/" element={<Layout />}>          {/* nested layout */}
      <Route index element={<Home />} />
      <Route path="users/:id" element={<User />} />
      <Route path="dashboard" element={
        <RequireAuth><Dashboard /></RequireAuth>     {/* protected */}
      } />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
</BrowserRouter>

function Layout() {
  return (<><Nav /><Outlet /></>);        // children render here
}

function User() {
  const { id } = useParams();             // /users/42 → "42"
  const navigate = useNavigate();
  return <button onClick={() => navigate("/")}>Home</button>;
}

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}`,
    questions: [
      { q: "How does client-side routing work without reloads?", a: "Router uses the History API (pushState) to change the URL and renders the matching component — the server is never hit, so state survives navigation." },
      { q: "Link vs a-tag?", a: "<a> triggers a full page reload losing all state; <Link> intercepts the click and routes client-side instantly." },
      { q: "How do you implement a protected route?", a: "A wrapper component checks auth: render children if logged in, else <Navigate to='/login' />. Attach it around protected elements." },
    ],
  },
  {
    id: "redux-state",
    title: "Redux & Global State Management",
    category: "react-ecosystem",
    level: "advanced",
    explanation:
      "Redux centralizes app state in one store: components dispatch ACTIONS → pure REDUCERS compute new state → subscribed components re-render. Modern Redux Toolkit (RTK) removes the boilerplate: createSlice generates actions + reducers, and Immer lets you 'mutate' safely. Know when you actually need it: many components sharing frequently-changing state; otherwise Context or Zustand may suffice.",
    code: `// Redux Toolkit — the modern way
import { createSlice, configureStore } from "@reduxjs/toolkit";
import { Provider, useSelector, useDispatch } from "react-redux";

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    addItem(state, action) {
      state.items.push(action.payload);   // Immer makes this immutable ✨
    },
    removeItem(state, action) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
  },
});

export const { addItem, removeItem } = cartSlice.actions;
const store = configureStore({ reducer: { cart: cartSlice.reducer } });

// <Provider store={store}><App /></Provider>

function Cart() {
  const items = useSelector((s) => s.cart.items);   // read
  const dispatch = useDispatch();                    // write
  return (
    <button onClick={() => dispatch(addItem({ id: 1, name: "Book" }))}>
      Add ({items.length})
    </button>
  );
}`,
    questions: [
      { q: "Explain the Redux data flow.", a: "One-way loop: component dispatches an action → reducer (pure function) computes new state from old state + action → store updates → subscribed components re-render via useSelector." },
      { q: "Why are reducers pure and state immutable in Redux?", a: "Predictability, time-travel debugging, and cheap change detection by reference. RTK's Immer gives mutable syntax while producing immutable updates." },
      { q: "Context vs Redux?", a: "Context is a transport for rarely-changing data (theme, auth). Redux adds a store, devtools, middleware, and optimized subscriptions for complex, frequently-updated shared state." },
    ],
  },
  {
    id: "react18-features",
    title: "React 18: Concurrent Features",
    category: "react-ecosystem",
    level: "advanced",
    explanation:
      "React 18 introduced concurrent rendering: React can pause, interrupt, and resume renders to keep the UI responsive. Key APIs: automatic batching (multiple setStates → one render, even in promises/timeouts), useTransition (mark updates non-urgent so typing stays instant), useDeferredValue (lag a derived value), and Suspense improvements + createRoot which enables it all.",
    code: `// 1. createRoot — enables concurrent features
import { createRoot } from "react-dom/client";
createRoot(document.getElementById("root")).render(<App />);

// 2. automatic batching — ONE render, even in async code
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);      // React 17: two renders. React 18: one ✅
}, 100);

// 3. useTransition — keep typing snappy while a heavy list filters
function Search({ items }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(items);
  const [isPending, startTransition] = useTransition();

  const onChange = (e) => {
    setQuery(e.target.value);              // urgent — instant
    startTransition(() => {                // non-urgent — interruptible
      setResults(heavyFilter(items, e.target.value));
    });
  };

  return (
    <>
      <input value={query} onChange={onChange} />
      {isPending ? <Spinner /> : <List items={results} />}
    </>
  );
}

// 4. useDeferredValue — same idea, for derived values
const deferredQuery = useDeferredValue(query);`,
    questions: [
      { q: "What is concurrent rendering?", a: "React 18's ability to interrupt and resume rendering work, prioritizing urgent updates (typing) over heavy ones (filtering 10k rows) — keeping the UI responsive." },
      { q: "What changed with batching in React 18?", a: "Automatic batching everywhere: multiple state updates inside promises, timeouts, and native handlers now produce ONE re-render (previously only React event handlers batched)." },
      { q: "useTransition vs useDeferredValue?", a: "useTransition wraps the update you control (startTransition); useDeferredValue lags a value you receive. Both mark work as non-urgent and interruptible." },
    ],
  },
  {
    id: "react-interview-rapidfire",
    title: "React Rapid-Fire Interview Questions",
    category: "react-ecosystem",
    level: "intermediate",
    explanation:
      "The short-answer questions asked in almost every React interview, collected in one place. Rehearse these out loud — each answer should take 20-30 seconds. They test breadth; the other concepts in this track give you the depth to follow up.",
    code: `// Quick self-test — answer before expanding each one below!

// 1.  What is React? Library or framework?
// 2.  Function vs class components?
// 3.  What is a re-render and what triggers it?
// 4.  Real DOM vs Virtual DOM?
// 5.  What are synthetic events?
// 6.  What is prop drilling?
// 7.  StrictMode — what does it do?
// 8.  Why are keys needed in lists?
// 9.  What is the significance of the dependency array?
// 10. How do you optimize a slow React app?`,
    questions: [
      { q: "What is React — library or framework?", a: "A LIBRARY for building UIs with components. It handles rendering only — routing, data fetching, and state libs are chosen separately (frameworks like Next.js bundle those choices)." },
      { q: "Function vs class components?", a: "Functions + hooks are the modern standard: less code, easier logic reuse (custom hooks), no this binding. Classes remain for error boundaries and legacy code." },
      { q: "What are synthetic events?", a: "React's cross-browser wrapper around native events with the same interface (e.preventDefault). React attaches one delegated listener at the root instead of per element." },
      { q: "What does StrictMode do?", a: "Development-only checks: double-invokes renders and effect mount/unmount to expose impure renders and missing cleanups, and warns on deprecated APIs. No production effect." },
      { q: "How do you optimize a slow React app?", a: "Profile first (React DevTools). Then: memoize (React.memo/useMemo/useCallback), move state down, virtualize long lists, code-split routes, debounce inputs, and stabilize context values." },
    ],
  },
];
