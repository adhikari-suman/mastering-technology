# Mastering JavaScript

Exercise-driven. Every lesson is a folder with three files:

| File               | What it is                                              |
| ------------------ | ------------------------------------------------------- |
| `README.md`        | The concept, why it matters, and the traps              |
| `exercise.js`      | Stubs with `TODO`s — **this is the file you edit**       |
| `exercise.test.js` | The spec. Red until you implement. **Don't edit this.**  |

Zero dependencies. Everything runs on Node's built-in test runner.

## How to work

```bash
cd mastering-javascript

# Run one lesson
node --test 01-fundamentals/01-values-and-types

# Run one lesson, re-running on every save (this is the main loop)
node --test --watch 01-fundamentals/01-values-and-types

# Run a whole module
node --test 01-fundamentals

# Run everything you've done so far
npm test
```

The loop is: read the README → run the tests → watch them fail → make them pass
one at a time → read the README's "Going deeper" section → move on.

A lesson is done when the tests are green **and** you can explain out loud why
each answer is what it is. Green tests you can't explain are not mastery.

## Rules of the road

1. **No copying from the test file into the implementation.** Hardcoding
   `return 42` to satisfy an assertion teaches you nothing. If you catch
   yourself pattern-matching the tests, stop and reread the README.
2. **Guess before you run.** Before executing anything, predict the output. The
   gap between your prediction and reality is the entire lesson.
3. **Use the REPL.** `node` with no arguments gives you a scratchpad. Poke at
   things. `typeof null`, `[] + {}`, `0.1 + 0.2` — go break stuff.
4. **No solutions in this repo, on purpose.** Ask me for one when you're
   genuinely stuck, and I'll walk you through the reasoning rather than paste
   an answer.

## Curriculum

### Module 01 — Fundamentals ✅ available now

The vocabulary. Nothing here is optional; everything later assumes it.

| #   | Lesson                  | You'll be able to                                              |
| --- | ----------------------- | -------------------------------------------------------------- |
| 01  | Values and types        | Name every primitive, use `typeof` correctly, convert on purpose |
| 02  | Operators and coercion  | Predict what `==`, `+`, `\|\|`, and `??` actually do            |
| 03  | Control flow            | Branch and loop without reaching for the wrong tool             |
| 04  | Functions               | Declarations vs. expressions vs. arrows, params, returns, scope |
| 05  | Arrays                  | `map`/`filter`/`reduce` and friends, spread, destructuring      |
| 06  | Objects                 | Property access, nesting, destructuring, `Object.*`, methods    |

### Coming next (I'll build these as you get there)

- **Module 02 — Functions in depth**: closures, higher-order functions, `this`
  and the four binding rules, `call`/`apply`/`bind`, recursion, currying.
- **Module 03 — Objects and prototypes**: the prototype chain, `class` as sugar,
  inheritance, `Object.create`, property descriptors, getters/setters, `Symbol`.
- **Module 04 — Async**: the event loop and the two queues, callbacks →
  promises → `async`/`await`, error propagation, `Promise.all`/`race`/
  `allSettled`, cancellation with `AbortController`, generators and async
  iterators, and implementing a Promise from scratch.
- **Module 05 — Collections and data**: `Map`, `Set`, `WeakMap`, iterators and
  the iteration protocol, JSON, structured cloning, immutability patterns.
- **Module 06 — Errors and robustness**: `Error` subclassing, `throw` vs.
  return-an-error, `try/finally`, unhandled rejections, defensive boundaries.
- **Module 07 — Modules and tooling**: ESM vs. CommonJS, named vs. default
  exports, circular imports, `package.json` exports, bundlers, source maps.
- **Module 08 — Advanced**: `Proxy` and `Reflect`, tagged templates,
  memory model and leaks, micro-benchmarking honestly, metaprogramming.

Ask me to build the next module whenever you're ready — or ask for extra drills
on any lesson that didn't stick.
