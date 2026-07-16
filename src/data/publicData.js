// Deterministic dummy data for the public DevPrep API (/api/v1).
// Generated once at boot — same data every time, like dummyjson.

const FIRST = ["Aarav", "Ananya", "Rohan", "Priya", "Karan", "Sneha", "Vikram", "Isha", "Aditya", "Meera", "Rahul", "Divya", "Arjun", "Pooja", "Nikhil", "Riya", "Sameer", "Tanya", "Yash", "Neha"];
const LAST = ["Sharma", "Patel", "Nayak", "Reddy", "Gupta", "Iyer", "Singh", "Das", "Mehta", "Kulkarni"];
const CITIES = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata", "Bhubaneswar"];
const COMPANIES = ["TechNova", "CodeCraft", "PixelWorks", "DataDyne", "CloudNine", "ByteForge", "AppSmiths", "DevHouse"];
const ROLES = ["Frontend Developer", "Backend Developer", "Full Stack Developer", "UI Designer", "QA Engineer", "DevOps Engineer"];

export const users = Array.from({ length: 50 }, (_, i) => {
  const id = i + 1;
  const firstName = FIRST[i % FIRST.length];
  const lastName = LAST[(i * 3) % LAST.length];
  return {
    id,
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}@example.com`,
    age: 21 + ((i * 7) % 30),
    city: CITIES[i % CITIES.length],
    company: COMPANIES[(i * 2) % COMPANIES.length],
    role: ROLES[i % ROLES.length],
    avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=128`,
  };
});

const CATEGORIES = ["electronics", "furniture", "clothing", "books", "sports", "grocery"];
const PRODUCT_NAMES = {
  electronics: ["Wireless Mouse", "Mechanical Keyboard", "4K Monitor", "USB-C Hub", "Noise-Cancelling Headphones", "Webcam Pro", "Portable SSD 1TB", "Smart Watch", "Bluetooth Speaker", "Gaming Laptop"],
  furniture: ["Ergonomic Chair", "Standing Desk", "Bookshelf", "Bean Bag", "Monitor Stand", "Desk Lamp", "Filing Cabinet", "Sofa Set", "Coffee Table", "Wardrobe"],
  clothing: ["Cotton T-Shirt", "Denim Jacket", "Running Shoes", "Hoodie", "Formal Shirt", "Sneakers", "Track Pants", "Winter Coat", "Baseball Cap", "Leather Belt"],
  books: ["JavaScript: The Good Parts", "Clean Code", "Atomic Habits", "Deep Work", "The Pragmatic Programmer", "You Don't Know JS", "Refactoring", "Design Patterns", "Eloquent JavaScript", "Cracking the Coding Interview"],
  sports: ["Yoga Mat", "Dumbbell Set", "Cricket Bat", "Football", "Badminton Racket", "Skipping Rope", "Cycling Helmet", "Tennis Ball Pack", "Gym Gloves", "Resistance Bands"],
  grocery: ["Organic Honey", "Green Tea Pack", "Almond Butter", "Brown Rice 5kg", "Olive Oil 1L", "Dark Chocolate", "Oats 1kg", "Coffee Beans", "Mixed Nuts", "Protein Bars"],
};

export const products = CATEGORIES.flatMap((category, ci) =>
  PRODUCT_NAMES[category].map((title, i) => {
    const id = ci * 10 + i + 1;
    return {
      id,
      title,
      category,
      price: 99 + ((id * 137) % 4900),
      rating: Math.round((3 + ((id * 7) % 21) / 10) * 10) / 10,
      stock: (id * 13) % 100,
      brand: COMPANIES[id % COMPANIES.length],
      description: `${title} — top-rated ${category} product with premium quality and fast delivery.`,
      thumbnail: `https://picsum.photos/seed/devprep-${id}/300/200`,
    };
  })
);

const TODO_TASKS = ["Learn closures", "Practice the event loop", "Build a todo app", "Review pull requests", "Write unit tests", "Refactor the auth module", "Update dependencies", "Fix the navbar bug", "Deploy to production", "Prepare for standup", "Read Clean Code chapter 3", "Solve two LeetCode problems", "Polish the portfolio", "Mock interview practice", "Optimize bundle size", "Add dark mode", "Write API documentation", "Set up CI pipeline", "Debounce the search input", "Memoize expensive renders"];

export const todos = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  todo: TODO_TASKS[i % TODO_TASKS.length],
  completed: (i * 7) % 3 === 0,
  userId: (i % 50) + 1,
}));

const POST_TOPICS = ["closures", "the event loop", "React hooks", "useEffect cleanup", "promises", "async/await", "the Virtual DOM", "debouncing", "memoization", "prototypes", "ES6 modules", "CSS grid", "TypeScript generics", "REST API design", "MongoDB indexing", "JWT authentication", "code splitting", "web performance", "accessibility", "testing"];

export const posts = Array.from({ length: 40 }, (_, i) => {
  const topic = POST_TOPICS[i % POST_TOPICS.length];
  return {
    id: i + 1,
    title: `Understanding ${topic} — a practical guide`,
    body: `Everything you need to know about ${topic}: how it works under the hood, common interview questions, real-world examples, and the mistakes to avoid in production code.`,
    userId: (i % 50) + 1,
    tags: ["javascript", topic.split(" ")[0].toLowerCase(), i % 2 === 0 ? "webdev" : "react"],
    likes: (i * 31) % 500,
  };
});

export const quotes = [
  "First, solve the problem. Then, write the code. — John Johnson",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand. — Martin Fowler",
  "Programs must be written for people to read, and only incidentally for machines to execute. — Harold Abelson",
  "Simplicity is the soul of efficiency. — Austin Freeman",
  "Code is like humor. When you have to explain it, it's bad. — Cory House",
  "Make it work, make it right, make it fast. — Kent Beck",
  "The best error message is the one that never shows up. — Thomas Fuchs",
  "Experience is the name everyone gives to their mistakes. — Oscar Wilde",
  "Before software can be reusable it first has to be usable. — Ralph Johnson",
  "Talk is cheap. Show me the code. — Linus Torvalds",
  "Deleted code is debugged code. — Jeff Sickel",
  "It's not a bug — it's an undocumented feature. — Anonymous",
  "Weeks of coding can save you hours of planning. — Anonymous",
  "The most disastrous thing you can ever learn is your first programming language. — Alan Kay",
  "Testing leads to failure, and failure leads to understanding. — Burt Rutan",
  "There are only two hard things in Computer Science: cache invalidation and naming things. — Phil Karlton",
  "Java is to JavaScript what car is to carpet. — Chris Heilmann",
  "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away. — Antoine de Saint-Exupéry",
  "Optimism is an occupational hazard of programming. — Kent Beck",
  "A good programmer looks both ways before crossing a one-way street. — Doug Linder",
].map((q, i) => {
  const [quote, author] = q.split(" — ");
  return { id: i + 1, quote, author };
});
