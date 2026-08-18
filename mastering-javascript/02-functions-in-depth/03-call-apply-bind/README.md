# 03 — `call`, `apply` and `bind`

Lesson 02 named explicit binding as rule 3. Now you build it. Nothing teaches
what `this` *is* like implementing the three functions that set it.

You'll write each one twice: first standalone, then as a real method on
`Function.prototype`. The second version is where `this` inside your own
implementation starts mattering.

## What they do

```js
fn.call(thisArg, a, b)     // invoke now, arguments listed
fn.apply(thisArg, [a, b])  // invoke now, arguments as an array
fn.bind(thisArg, a)        // invoke LATER — returns a new function
```

`call` and `apply` differ only in how arguments arrive. `bind` is the odd one:
it doesn't call anything, it manufactures a new permanently-bound function.

## The trick behind `call`

You can't use `call` to implement `call`. So how do you set `this`?

Use rule 2. **Implicit binding sets `this` to the object left of the dot** — so
put the function *on* the object, call it through the dot, then clean up:

```js
thisArg.temp = fn;        // now fn is a method of thisArg
const result = thisArg.temp(...args);   // rule 2 fires: this === thisArg
delete thisArg.temp;      // leave no trace
return result;
```

That's the whole mechanism. Two problems to handle:

**Collisions.** If the object already has a `temp`, you just destroyed it. Use a
`Symbol()` as the key — guaranteed unique, and invisible to `Object.keys`.

**Nullish `thisArg`.** `fn.call(null)` binds `this` to `globalThis` in sloppy
mode. Match that: treat `null`/`undefined` as `globalThis`.

## `bind` is a closure, not a call

`bind` returns a new function that remembers `thisArg` and any preset
arguments, and appends whatever it's called with later:

```js
const greet = function (greeting, name) { return `${greeting}, ${name}`; };
const hi = greet.bind(null, 'Hi');
hi('Ada');    // 'Hi, Ada'   — 'Hi' was baked in, 'Ada' arrived later
```

That's partial application, which lesson 05 generalises.

A bound function **cannot be re-bound.** `f.bind(a).call(b)` still uses `a` —
because the outer function ignores its own `this` entirely and always calls the
inner one with the captured value.

## Extending a built-in prototype

For the second half you add methods to `Function.prototype`, which every
function in the program inherits. Two rules when you do this to a built-in:

1. **Never overwrite an existing name.** Use `myCall`, not `call`.
2. **Make it non-enumerable**, or it shows up in every `for...in` over a
   function and breaks unrelated code:

```js
Object.defineProperty(Function.prototype, 'myCall', {
  value: function (thisArg, ...args) { /* `this` is the function itself */ },
  enumerable: false,   // ← the important part
  writable: true,
  configurable: true,
});
```

Inside that method, `this` **is the function you called it on** — `greet.myCall(obj)`
means `this === greet`. That's the piece worth sitting with.

In real code, don't patch built-ins. Here it's the point of the exercise.

## What to build

You write these in `solution.js`. The full spec for each is in the JSDoc above
the corresponding stub in `exercise.js`, and `exercise.test.js` is the final
authority.

**Stage 1 — standalone**

| Export | What it does |
| --- | --- |
| `callWith(fn, thisArg, ...args)` | `fn.call` |
| `applyWith(fn, thisArg, argsArray)` | `fn.apply` |
| `bindWith(fn, thisArg, ...preset)` | `fn.bind` |

**Stage 2 — prototype methods** (no exports; assign them at module top level)

| Method | What it does |
| --- | --- |
| `Function.prototype.myCall` | Same as stage 1, as a method |
| `Function.prototype.myApply` | " |
| `Function.prototype.myBind` | " |

## Running it

Both of these run from inside this folder:

```bash
cp exercise.js solution.js   # once
npm run watch                # scopes to this lesson automatically
```

## Going deeper

1. What should `new (fn.myBind(obj))()` do? The real `bind` has an answer, and
   it isn't "use obj". Look up why.
2. Your `callWith` mutates `thisArg` for the duration of the call. When could
   that be observed by other code? (Think getters, proxies, frozen objects.)
3. `fn.apply(null, hugeArray)` throws for a large enough array. Why — and what
   does that tell you about how arguments are passed?
