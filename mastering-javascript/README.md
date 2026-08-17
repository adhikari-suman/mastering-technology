# Mastering JavaScript

Exercise-driven. Every lesson is a folder with three files, plus one you make
yourself:

| File               | What it is                                                          |
| ------------------ | ------------------------------------------------------------------- |
| `README.md`        | The concept, the traps, and a checklist of what to build             |
| `exercise.js`      | Stubs + the full spec in JSDoc. **Never edited** — your reset point   |
| `exercise.test.js` | The spec, executable. Red until you implement. Don't edit.           |
| `solution.js`      | ⬅ **you create this**, by copying `exercise.js`. Your answers go here |

Zero dependencies. Everything runs on Node's built-in test runner.

## How to work

Work one lesson at a time, from inside its folder:

```bash
cd 01-fundamentals/01-values-and-types
cp exercise.js solution.js      # your working copy — do this once per lesson
node --test --watch             # the main loop; re-runs on every save
```

The tests import `solution.js`, so until you make that copy the suite reports a
single clear failure telling you to. Because `exercise.js` is never edited, that
same `cp` is how you wipe a lesson and start it again later.

From the repo root, to run everything you've done so far:

```bash
npm test
```

## Managing your solution files

`cp exercise.js solution.js` is all you ever strictly need, but there are four
helpers for doing it in bulk:

```bash
npm run setup     # create solution.js wherever it's missing
npm run status    # which lessons are started / untouched / not begun
npm run reset     # restore solution.js from exercise.js   (destructive)
npm run clean     # delete solution.js                     (destructive)
```

Each takes an optional filter that substring-matches the lesson path, so you can
act on one lesson or one module instead of all of them:

```bash
npm run reset -- 03-control
npm run clean -- 01-fundamentals
```

`reset` and `clean` throw work away, so they refuse to run if **any** matched
`solution.js` differs from its stubs, and print exactly which ones. Add `--yes`
when you mean it. Copies you haven't touched yet are removed without fuss, since
there's nothing in them to lose.

`npm run status` marks started lessons with `*`:

```
* 01-fundamentals/01-values-and-types        started
  01-fundamentals/02-operators-and-coercion  untouched copy
  01-fundamentals/03-control-flow            no solution.js
```

### Commit your solutions

`solution.js` is deliberately **not** gitignored. Your answers are the point of
this repo — they're worth keeping, they show your progress over time, and having
them tracked means `git checkout` can undo a `reset` or `clean` you didn't mean.
The repo itself ships no `solution.js`, so a fresh clone is a clean slate.

> **Note:** `node --test <directory>` does **not** work on Node 24 — it tries to
> execute the directory as a script. Either `cd` into the folder and run
> `node --test` bare (as above), or pass a glob:
> `node --test "01-fundamentals/01-values-and-types/*.test.js"`.

Read the README → make your copy → run the tests → watch them fail → make them
pass one at a time → read the "Going deeper" questions → move on.

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
4. **No answer key in this repo, on purpose.** Ask me when you're genuinely
   stuck and I'll walk you through the reasoning rather than paste an answer.

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
