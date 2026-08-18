# 03 — Classes

`class` is syntax over exactly what you built in lesson 02. Nothing new is added
to the object model — but the syntax closes several holes, and the private-field
support is genuinely not expressible any other way.

## The same thing, twice

```js
function Dog(name) { this.name = name; }
Dog.prototype.speak = function () { return `${this.name} barks`; };
```

```js
class Dog {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} barks`; }
}
```

Identical results: `speak` lands on `Dog.prototype`, instances share it,
`typeof Dog === 'function'`.

## What `class` actually changes

1. **Calling without `new` throws.** No silent global writes.
2. **Class bodies are always strict**, regardless of the surrounding file.
3. **Methods are non-enumerable**, so `for...in` over an instance skips them.
   Prototype assignment makes them enumerable, which leaks.
4. **Declarations are not hoisted usably** — they're in the temporal dead zone,
   so you can't `new Dog()` above the class.
5. **`#private` fields exist**, and are enforced by the language.

Point 3 is worth checking yourself: `for...in` over a constructor-function
instance lists the prototype methods; over a class instance it doesn't.

## Fields, statics, and `#private`

```js
class Counter {
  count = 0;              // instance field — runs before the constructor body
  static created = 0;     // on the class itself, not instances
  #secret = 42;           // private — a hard error outside the class body

  constructor() { Counter.created += 1; }

  static reset() { Counter.created = 0; }   // static method

  reveal() { return this.#secret; }
  get double() { return this.count * 2; }   // getter, accessed as .double
  set value(v) { this.count = v; }          // setter, assigned as .value = x
}
```

`#secret` is not "private by convention" like `_secret`. Accessing it from
outside is a **SyntaxError at parse time** — not a runtime check you can dodge.
`Object.keys`, `JSON.stringify` and `Object.getOwnPropertyNames` cannot see it.

Instance fields are per-instance; a `#private` field is too. Statics live on the
class object, so all instances share one.

## The `this`-losing problem returns

Class methods are just functions on a prototype, so Part 02 lesson 02 applies
unchanged:

```js
const c = new Counter();
const inc = c.increment;
inc();       // TypeError — `this` is undefined
```

The fix is an arrow-valued **class field**, which is created per instance and
captures `this` lexically:

```js
class Counter {
  count = 0;
  increment = () => { this.count += 1; };   // bound, but one copy per instance
}
```

That's the trade: bound and safe to detach, versus shared and cheap. Use the
prototype method by default; use the arrow field when you're handing the method
to something else.

## What to build

| Export | What it does |
| --- | --- |
| `Dog` | The class version, `speak` still shared |
| `Vault` | `#private` state, unreachable from outside |
| `Temperature` | A getter and a setter |
| `Registry` | Static state and static methods |
| `Bound` | A method that survives being detached |
| `methodIsEnumerable(Cls, name)` | Prove class methods are non-enumerable |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. `typeof Dog` — what does a class report, and why is that the honest answer?
2. Try reading `vault.#balance` from outside the class. Is it a `TypeError` you
   can catch, or something that stops the file loading?
3. A getter with no setter — what happens on assignment in strict mode versus
   sloppy mode?
