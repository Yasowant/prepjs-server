export default [
  {
    id: "dom-manipulation",
    title: "DOM Selection & Manipulation",
    category: "dom",
    level: "basic",
    explanation:
      "The DOM is the tree representation of HTML. Select with querySelector/querySelectorAll (CSS selectors), getElementById. Manipulate with textContent (safe), innerHTML (parses HTML — XSS risk with user input), classList, setAttribute, style. Create with createElement + append.",
    code: `const el = document.querySelector("#app .card");
const all = document.querySelectorAll(".item");   // NodeList

el.textContent = "Safe text";        // no HTML parsing
el.innerHTML = "<b>Bold</b>";        // ⚠️ XSS risk with user input

el.classList.add("active");
el.classList.toggle("dark");
el.setAttribute("data-id", "42");
el.dataset.id;                       // "42"
el.style.color = "teal";

const li = document.createElement("li");
li.textContent = "New item";
document.querySelector("ul").append(li);
li.remove();`,
    questions: [
      { q: "innerHTML vs textContent vs innerText?", a: "innerHTML parses HTML (XSS risk); textContent sets/gets raw text of all nodes (fast); innerText respects CSS visibility and triggers reflow." },
      { q: "querySelectorAll vs getElementsByClassName?", a: "querySelectorAll returns a static NodeList (snapshot); getElementsByClassName returns a live HTMLCollection that updates with the DOM." },
    ],
  },
  {
    id: "events",
    title: "Events: Bubbling, Capturing & Delegation",
    category: "dom",
    level: "intermediate",
    explanation:
      "Events travel in 3 phases: capturing (document → target), target, bubbling (target → document). addEventListener defaults to bubbling. stopPropagation halts travel; preventDefault cancels default behavior. Event delegation attaches ONE listener on a parent and uses e.target — efficient for lists and dynamic elements.",
    code: `btn.addEventListener("click", (e) => {
  e.preventDefault();     // stop default (e.g., form submit)
  e.stopPropagation();    // stop bubbling upward
});

// capture phase
parent.addEventListener("click", fn, { capture: true });
// run once, auto-remove
btn.addEventListener("click", fn, { once: true });

// EVENT DELEGATION — one listener for all items (even future ones)
document.querySelector("ul").addEventListener("click", (e) => {
  const item = e.target.closest("li");
  if (item) console.log("clicked:", item.textContent);
});

// e.target vs e.currentTarget
// target = actual clicked element; currentTarget = listener's element`,
    questions: [
      { q: "What is event bubbling?", a: "After firing on the target, the event propagates up through ancestors to document. Most events bubble; use stopPropagation to halt." },
      { q: "What is event delegation and why use it?", a: "One parent listener handling children's events via e.target. Saves memory, and works for dynamically added elements." },
      { q: "e.target vs e.currentTarget?", a: "target is the element that originated the event; currentTarget is the element the handler is attached to." },
      { q: "preventDefault vs stopPropagation?", a: "preventDefault cancels the browser's default action (link navigation, form submit); stopPropagation stops the event from traveling further." },
    ],
  },
  {
    id: "storage",
    title: "localStorage, sessionStorage & Cookies",
    category: "dom",
    level: "basic",
    explanation:
      "localStorage persists until cleared (~5-10MB, per origin); sessionStorage lasts for the tab session; cookies (~4KB) are sent with every HTTP request and support expiry/HttpOnly/Secure flags. All store strings — JSON.stringify/parse objects. Never store sensitive tokens in localStorage if XSS is a concern.",
    code: `// localStorage — persists across sessions
localStorage.setItem("theme", "dark");
localStorage.getItem("theme");        // "dark"
localStorage.removeItem("theme");
localStorage.clear();

// storing objects
localStorage.setItem("user", JSON.stringify({ name: "A" }));
const user = JSON.parse(localStorage.getItem("user") ?? "null");

// sessionStorage — cleared when tab closes
sessionStorage.setItem("step", "2");

// cookies
document.cookie = "token=abc; max-age=3600; path=/; Secure; SameSite=Strict";

// listen to changes from other tabs
window.addEventListener("storage", (e) => console.log(e.key, e.newValue));`,
    questions: [
      { q: "localStorage vs sessionStorage vs cookies?", a: "localStorage: persistent, ~5MB, JS-only. sessionStorage: per-tab lifetime. Cookies: ~4KB, auto-sent to server each request, can be HttpOnly (invisible to JS)." },
      { q: "Where should JWT tokens be stored?", a: "HttpOnly Secure cookies resist XSS (but need CSRF protection); localStorage is vulnerable to XSS. Trade-offs — commonly access token in memory + refresh token in HttpOnly cookie." },
    ],
  },
  {
    id: "forms-dom",
    title: "Forms & Validation",
    category: "dom",
    level: "basic",
    explanation:
      "Handle forms via the submit event (not button click), read values with FormData or element.value, and validate with HTML attributes (required, pattern, minlength) plus JS (checkValidity, setCustomValidity) or manual checks. Always re-validate on the server.",
    code: `const form = document.querySelector("#signup");

form.addEventListener("submit", (e) => {
  e.preventDefault();                    // stop page reload

  const data = Object.fromEntries(new FormData(form));
  // { email: "...", password: "..." }

  if (!data.email.includes("@")) {
    return showError("Invalid email");
  }
  if (data.password.length < 6) {
    return showError("Password too short");
  }
  fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
});

// built-in validation API
const input = form.elements.email;
input.checkValidity();       // boolean
input.validationMessage;     // browser message`,
    questions: [
      { q: "Why listen to submit instead of button click?", a: "submit fires for Enter key too, enables built-in validation, and represents the actual form action. preventDefault stops the page reload." },
      { q: "What is FormData?", a: "An API that collects a form's named field values — iterable, works with fetch directly (multipart) or Object.fromEntries for JSON." },
    ],
  },
  {
    id: "browser-apis",
    title: "BOM, Web Workers & Observers",
    category: "dom",
    level: "advanced",
    explanation:
      "Beyond the DOM: window (global), location (URL), history (navigation), navigator (browser info). Web Workers run scripts on background threads (no DOM access) for heavy computation. IntersectionObserver detects visibility (lazy loading, infinite scroll); MutationObserver watches DOM changes; ResizeObserver watches size.",
    code: `// BOM
location.href;              // current URL
history.pushState({}, "", "/new-path"); // SPA routing!
navigator.onLine;           // connectivity

// Web Worker — heavy work off the main thread
// worker.js: onmessage = (e) => postMessage(e.data ** 2);
const worker = new Worker("worker.js");
worker.postMessage(1e6);
worker.onmessage = (e) => console.log(e.data);

// IntersectionObserver — lazy load images
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.src = entry.target.dataset.src;
      io.unobserve(entry.target);
    }
  });
});
document.querySelectorAll("img[data-src]").forEach((img) => io.observe(img));`,
    questions: [
      { q: "What are Web Workers and their limitations?", a: "Background threads for CPU-heavy work communicating via postMessage. They can't access the DOM, window, or parent variables — data is copied (structured clone)." },
      { q: "What is IntersectionObserver used for?", a: "Efficiently detecting when elements enter/leave the viewport — lazy loading images, infinite scroll, analytics — without scroll-event performance costs." },
      { q: "How do SPAs change the URL without reloading?", a: "history.pushState/replaceState update the URL and history; the popstate event handles back/forward. React Router uses this under the hood." },
    ],
  },
  {
    id: "critical-rendering",
    title: "Script Loading: defer, async & Rendering",
    category: "dom",
    level: "intermediate",
    explanation:
      "Plain <script> blocks HTML parsing while downloading + executing. async downloads in parallel and executes ASAP (order not guaranteed). defer downloads in parallel but executes after parsing, in order — usually the best default. DOMContentLoaded fires when HTML is parsed; load waits for all resources.",
    code: `<script src="a.js"></script>
<!-- blocks parsing: download → execute → continue -->

<script async src="analytics.js"></script>
<!-- parallel download, executes whenever ready (any order) -->

<script defer src="app.js"></script>
<!-- parallel download, executes after parsing, IN ORDER -->

<script type="module" src="main.js"></script>
<!-- modules are deferred by default -->

document.addEventListener("DOMContentLoaded", () => {
  // DOM ready — safe to query elements
});
window.addEventListener("load", () => {
  // images, styles, everything loaded
});`,
    questions: [
      { q: "Difference between async and defer?", a: "Both download in parallel. async executes immediately when downloaded (unordered, may interrupt parsing); defer executes after HTML parsing in document order." },
      { q: "DOMContentLoaded vs load?", a: "DOMContentLoaded: HTML parsed, DOM ready. load: all resources (images, CSS, scripts) finished loading." },
    ],
  },
];
