# 02 — `this` and the Four Binding Rules

`this` is not decided by where a function is written. It is decided by **how the
function is called** — and there are exactly four ways, with a strict priority
order. Learn the four rules and `this` stops being mysterious permanently.

## The four rules, lowest priority first

### 1. Default binding

A plain function call. In a module or `'use strict'` code, `this` is
`undefined`. (In sloppy mode it's the global object — this is why strict mode
exists.)

```js
function show() { return this; }
show();          // undefined  — ESM is always strict
```

### 2. Implicit binding

Called as a method of an object. `this` is **the object left of the dot**.

```js
const user = {
  name: 'Ada',
  greet() { return `Hi, ${this.name}`; },
};
user.greet();     // 'Hi, Ada'
```

Only the *last* dot counts:

```js
a.b.c.greet();    // `this` is c, not a
```

### 3. Explicit binding

`call`, `apply`, or `bind` — you name the `this` yourself.

```js
greet.call(user);        // args listed:  fn.call(thisArg, a, b)
greet.apply(user, [a]);  // args as array: fn.apply(thisArg, [a, b])
const bound = greet.bind(user);   // returns a NEW function, permanently bound
```

Lesson 03 has you implement all three.

### 4. `new` binding

`new Fn()` creates a fresh object and binds `this` to it.

```js
function User(name) { this.name = name; }
const u = new User('Ada');   // this === the new object, returned automatically
```

**Priority: `new` > explicit > implicit > default.** When two rules could apply,
the higher one wins.

## The losing-`this` bug

This is the failure you will actually hit:

```js
const user = {
  name: 'Ada',
  greet() { return `Hi, ${this.name}`; },
};

const fn = user.greet;
fn();                        // TypeError — `this` is undefined

setTimeout(user.greet, 0);   // same problem
[1].map(user.greet);         // same problem
```

Nothing was "detached" in a special sense. `user.greet` just evaluates to the
function itself; the object is not attached to it. Call it without a dot and
rule 2 no longer applies, so rule 1 takes over.

Fixes: `user.greet.bind(user)`, or `() => user.greet()`.

## Arrow functions have no `this`

An arrow doesn't get its own `this` at all. It uses whatever `this` meant in the
scope where it was **written** — and no call style can change that:

```js
const obj = {
  name: 'Ada',
  bad: () => `Hi, ${this.name}`,      // `this` is the module scope, NOT obj
  good() { return `Hi, ${this.name}`; },
};
```

`call`, `apply`, and `bind` are all powerless against an arrow.

That makes arrows **wrong for methods** and **right for callbacks**:

```js
const timer = {
  count: 0,
  start() {
    setInterval(() => { this.count++; }, 1000);  // arrow keeps start's `this`
  },
};
```

## What to build

You write these in `solution.js`. The full spec for each is in the JSDoc above
the corresponding stub in `exercise.js`, and `exercise.test.js` is the final
authority.

| Export | What it does |
| --- | --- |
| `PREDICTIONS` | What `this` is in nine situations — predict before you run |
| `makeUser(name)` | An object whose method reads `this.name` |
| `getGreeter(user)` | A detachable function that keeps working |
| `Counter` | A constructor used with `new` |
| `makeTimer()` | An arrow callback that keeps the outer `this` |
| `describeThis()` | Reports which binding rule applied |
| `borrowMethod(obj, fn)` | Runs a foreign function with `obj` as `this` |

## Running it

Both of these run from inside this folder:

```bash
cp exercise.js solution.js   # once
npm run watch                # scopes to this lesson automatically
```

## Going deeper

1. What does `this` mean at the top level of an ES module? Why is it not the
   global object?
2. `bind` twice: `f.bind(a).bind(b)` — which wins, and why can't the second one
   change it?
3. Why does `new (f.bind(obj))()` ignore `obj`? What does that tell you about
   the priority order?
