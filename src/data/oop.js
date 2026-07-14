export default [
  {
    id: "objects-basics",
    title: "Objects: Creation & Property Access",
    category: "oop",
    level: "basic",
    explanation:
      "Objects are key-value collections. Create them with literals, constructors, Object.create, or classes. Access properties with dot or bracket notation (brackets allow dynamic keys). Useful statics: Object.keys/values/entries, Object.assign, Object.freeze.",
    code: `const user = {
  name: "Fohat",
  "full role": "developer",   // key with space
  greet() { return \`Hi, \${this.name}\`; },
};

user.name             // dot
user["full role"]     // bracket
const key = "name";
user[key]             // dynamic access

Object.keys(user)     // ["name","full role","greet"]
Object.entries(user)  // [[key, value], ...]
delete user.name;

const frozen = Object.freeze({ a: 1 }); // immutable (shallow)
const sealed = Object.seal({ a: 1 });   // can modify, can't add/delete`,
    questions: [
      { q: "Ways to create objects in JS?", a: "Object literal {}, new Object(), Object.create(proto), constructor functions, ES6 classes, factory functions." },
      { q: "Object.freeze vs Object.seal?", a: "freeze: no add/delete/modify. seal: no add/delete but existing values can be modified. Both are shallow." },
    ],
  },
  {
    id: "this-keyword",
    title: "The 'this' Keyword",
    category: "oop",
    level: "intermediate",
    explanation:
      "`this` is determined by HOW a function is called: (1) method call → the object before the dot, (2) plain call → undefined in strict mode / global object otherwise, (3) constructor (new) → the new instance, (4) call/apply/bind → explicitly set, (5) arrow functions → inherited lexically. Highest priority: new > bind > method > default.",
    code: `const user = {
  name: "PrepJS",
  greet() { return this.name; },
};
user.greet();          // "PrepJS" (method call)

const fn = user.greet;
fn();                  // undefined — lost 'this' (plain call)

const bound = user.greet.bind(user);
bound();               // "PrepJS"

function Person(name) { this.name = name; }
const p = new Person("Yaso"); // this = new object

const obj = {
  name: "X",
  arrow: () => this?.name,  // ❌ inherits outer this
};`,
    questions: [
      { q: "How is 'this' determined?", a: "By call-site: new binding > explicit (call/apply/bind) > implicit (obj.method()) > default (undefined in strict mode). Arrow functions ignore all — they use lexical this." },
      { q: "Why does extracting a method break 'this'?", a: "const fn = obj.method; fn() is a plain call — this is no longer obj. Fix with bind or an arrow wrapper." },
      { q: "What is 'this' in an event handler?", a: "In function handlers, the element the listener is attached to; in arrow handlers, the enclosing scope's this." },
    ],
  },
  {
    id: "call-apply-bind",
    title: "call, apply & bind",
    category: "oop",
    level: "intermediate",
    explanation:
      "All three set `this` explicitly. call(thisArg, a, b) invokes immediately with individual arguments; apply(thisArg, [a, b]) invokes with an array; bind(thisArg, ...) returns a new function permanently bound (does not invoke). Writing a bind polyfill is a top interview question.",
    code: `function intro(city, country) {
  return \`\${this.name} from \${city}, \${country}\`;
}
const person = { name: "Fohat" };

intro.call(person, "Bhubaneswar", "India");
intro.apply(person, ["Bhubaneswar", "India"]);

const boundIntro = intro.bind(person, "Bhubaneswar");
boundIntro("India"); // partial application

// bind polyfill (interview favourite)
Function.prototype.myBind = function (ctx, ...args) {
  const fn = this;
  return function (...rest) {
    return fn.apply(ctx, [...args, ...rest]);
  };
};`,
    questions: [
      { q: "Difference between call, apply and bind?", a: "call/apply invoke immediately (args individually vs as array); bind returns a new permanently-bound function without invoking." },
      { q: "Can you re-bind a bound function?", a: "No — once bound, later bind/call/apply cannot change this. Only new can override it." },
      { q: "Write a polyfill for bind.", a: "Return a function that applies the original with the stored context and merged arguments — see the myBind example." },
    ],
  },
  {
    id: "prototypes",
    title: "Prototypes & Prototypal Inheritance",
    category: "oop",
    level: "advanced",
    explanation:
      "Every object has an internal [[Prototype]] link (accessible via Object.getPrototypeOf or __proto__). Property lookup walks up this prototype chain until found or null. Functions have a .prototype property used when called with new. This is JavaScript's native inheritance model — classes are syntax sugar over it.",
    code: `const animal = {
  eats: true,
  walk() { return "walking"; },
};
const rabbit = Object.create(animal); // rabbit → animal
rabbit.jumps = true;
rabbit.eats;   // true (found on prototype)
rabbit.walk(); // "walking"

function Dog(name) { this.name = name; }
Dog.prototype.bark = function () { return \`\${this.name} barks\`; };
const d = new Dog("Rex");
d.bark(); // methods shared via prototype

Object.getPrototypeOf(d) === Dog.prototype; // true
d.__proto__.__proto__ === Object.prototype; // true
// chain: d → Dog.prototype → Object.prototype → null`,
    questions: [
      { q: "What is the prototype chain?", a: "The linked series of [[Prototype]] objects used for property lookup. If a property isn't on the object, JS checks its prototype, then that prototype's prototype, until null." },
      { q: "Difference between __proto__ and prototype?", a: "__proto__ is the actual link on every object to its prototype. .prototype is a property of constructor functions — it becomes the __proto__ of instances created with new." },
      { q: "What does the 'new' keyword do?", a: "Creates an empty object, links it to Constructor.prototype, calls the constructor with this = new object, and returns it (unless the constructor returns an object)." },
    ],
  },
  {
    id: "classes",
    title: "ES6 Classes",
    category: "oop",
    level: "intermediate",
    explanation:
      "Classes are syntactic sugar over prototypes: constructor for initialization, methods placed on the prototype, static members on the class itself, # for true private fields, and getters/setters for computed access. Class bodies run in strict mode and are not hoisted (TDZ).",
    code: `class Person {
  #ssn;                        // private field
  static species = "human";   // static property

  constructor(name, ssn) {
    this.name = name;
    this.#ssn = ssn;
  }
  greet() { return \`Hi, I'm \${this.name}\`; }

  get initials() { return this.name[0].toUpperCase(); }
  set rename(n) { this.name = n; }

  static create(name) { return new Person(name); } // factory
}

const p = new Person("Fohat", "123");
p.greet();       // "Hi, I'm Fohat"
p.initials;      // "F" (getter — no parens)
Person.species;  // "human"
// p.#ssn        // ❌ SyntaxError — truly private`,
    questions: [
      { q: "Are classes just syntax sugar?", a: "Mostly — methods go on the prototype and new works the same. But classes add strict mode, TDZ, mandatory new, private #fields, and super." },
      { q: "What are static members?", a: "Properties/methods on the class itself, not instances — utility functions and factories like Person.create() or Array.isArray()." },
      { q: "How do private fields work?", a: "#field is accessible only inside the class body — enforced by the language, unlike the _convention." },
    ],
  },
  {
    id: "inheritance",
    title: "Inheritance: extends & super",
    category: "oop",
    level: "intermediate",
    explanation:
      "`extends` sets up the prototype chain between classes; `super(...)` calls the parent constructor (mandatory before using this in a subclass), and super.method() calls parent methods. Method overriding lets subclasses redefine behavior.",
    code: `class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a sound\`; }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);          // must call before 'this'
    this.breed = breed;
  }
  speak() {               // override
    return \`\${super.speak()} — Woof!\`;
  }
}

const rex = new Dog("Rex", "Lab");
rex.speak();              // "Rex makes a sound — Woof!"
rex instanceof Dog;       // true
rex instanceof Animal;    // true`,
    questions: [
      { q: "Why must super() be called before using this?", a: "In a subclass, the instance object is created by the parent constructor. Until super() runs, this is uninitialized — accessing it throws ReferenceError." },
      { q: "How does instanceof work?", a: "It walks the prototype chain of the object checking if Constructor.prototype appears anywhere in it." },
    ],
  },
  {
    id: "polymorphism-encapsulation",
    title: "Polymorphism, Encapsulation & Abstraction",
    category: "oop",
    level: "intermediate",
    explanation:
      "The four OOP pillars in JS: Encapsulation — bundling data + methods, hiding internals (#private fields, closures). Inheritance — reusing behavior via extends/prototypes. Polymorphism — same method name, different behavior (method overriding). Abstraction — exposing a simple interface, hiding complexity.",
    code: `// Polymorphism — one interface, many forms
class Shape { area() { return 0; } }
class Circle extends Shape {
  constructor(r) { super(); this.r = r; }
  area() { return Math.PI * this.r ** 2; }
}
class Square extends Shape {
  constructor(s) { super(); this.s = s; }
  area() { return this.s ** 2; }
}
[new Circle(2), new Square(3)].map(s => s.area());

// Encapsulation with closure
function BankAccount(initial) {
  let balance = initial;              // private
  return {
    deposit: (n) => (balance += n),
    getBalance: () => balance,
  };
}`,
    questions: [
      { q: "What are the 4 pillars of OOP?", a: "Encapsulation, Inheritance, Polymorphism, Abstraction — all achievable in JS via classes, prototypes, closures and private fields." },
      { q: "How is polymorphism achieved in JS?", a: "Method overriding — subclasses redefine parent methods; duck typing — any object with the right method works. JS has no compile-time method overloading." },
      { q: "How do you achieve encapsulation in JS?", a: "Class #private fields, closures over private variables, or WeakMaps keyed by instance." },
    ],
  },
  {
    id: "copy-objects",
    title: "Shallow vs Deep Copy",
    category: "oop",
    level: "intermediate",
    explanation:
      "Assignment copies references, not objects. Shallow copies (spread, Object.assign) duplicate only the first level — nested objects are still shared. Deep copies duplicate everything: use structuredClone() (modern), JSON.parse(JSON.stringify()) (loses functions/dates/undefined), or recursion.",
    code: `const original = { name: "A", address: { city: "BBS" } };

const ref = original;                 // same object!
const shallow = { ...original };      // 1 level copied
shallow.address.city = "Delhi";
original.address.city;                // "Delhi" 😱 shared nested ref

const deep = structuredClone(original);        // ✅ modern deep copy
const deep2 = JSON.parse(JSON.stringify(original)); // ⚠️ loses functions, Dates→strings, undefined dropped

// interview: write deepClone
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, deepClone(v)])
  );
}`,
    questions: [
      { q: "Difference between shallow and deep copy?", a: "Shallow copies duplicate top-level properties but share nested object references; deep copies duplicate the entire structure recursively." },
      { q: "What are the limitations of JSON.parse(JSON.stringify())?", a: "Loses functions, undefined, symbols; converts Dates to strings; fails on circular references and BigInt." },
      { q: "What is structuredClone?", a: "A built-in deep-clone API handling Dates, Maps, Sets, circular refs — but not functions or DOM nodes." },
    ],
  },
];
