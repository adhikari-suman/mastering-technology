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

## Node version

`.nvmrc` pins this project to `lts/krypton` — the Node 24 LTS line, currently
v24.19.0. Naming the codename rather than an exact version means patch releases
are picked up automatically while the major stays put:

```bash
nvm install     # installs the LTS named in .nvmrc, first time only
nvm use         # switches to it, any time after
```

`package.json` sets `engines.node` to `>=20`, which is a different statement:
20 is the oldest version the lesson code actually needs (`node --test`,
`structuredClone`, `toSorted`). The `.nvmrc` is what to develop on; `engines` is
the floor below which things break.

## How to work

Work one lesson at a time, from inside its folder:

```bash
cd 01-fundamentals/01-values-and-types
cp exercise.js solution.js   # your working copy, once per lesson
npm run watch                # the main loop; re-runs on save
```

`npm run watch` scopes itself to whichever lesson folder you run it from. From
the project root it watches everything. To target a lesson from elsewhere, name
it: `npm run watch -- 03-control`.

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
act on one lesson or one Part instead of all of them:

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

`solution.js` is deliberately **not** gitignored — commit your answers as you
go. They're the only part of this repo that isn't regenerable, they show your
progress over time, and having them tracked means `git checkout` can undo a
`reset` or `clean` you didn't mean.

This is a public repo, so those answers are visible. That's intentional: it's a
learning journal, not a course to hand out. If you'd rather ship a clean
template for other people to work through, add `solution.js` to `.gitignore`
and update rule 4 below.

### Two Node quirks worth knowing

**`node --test <directory>` doesn't work** on Node 24 — it tries to execute the
directory as a script. `cd` into the folder and run `node --test` bare, or pass
a glob: `node --test "01-fundamentals/01-values-and-types/*.test.js"`.

**`node --test --watch` stops re-running once your code has a syntax error.**
Node's watcher tracks the module graph of the test files; a `solution.js` that
can't parse never loads, so it drops out of that graph and is no longer watched.
You fix the typo and nothing happens — the output is frozen at the error, which
looks exactly like the watcher having died. (`--watch-path` is rejected
alongside `--test`, and a static import behaves the same way.) `npm run watch`
sidesteps it by watching the folder rather than the module graph. If you're
already stuck in a frozen `--test --watch`, `touch` any `.test.js` file to
kick it back to life.

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
4. **The scaffold ships no answer key.** `exercise.js` only ever contains
   stubs. The solved `solution.js` files in this repo are my own worked
   answers, committed as a record — if you're doing these lessons yourself,
   reading them before you've tried only cheats you.

## Curriculum

### Part 01 — Fundamentals ✅ available now

The vocabulary. Nothing here is optional; everything later assumes it.

| #   | Lesson                  | You'll be able to                                              |
| --- | ----------------------- | -------------------------------------------------------------- |
| 01  | Values and types        | Name every primitive, use `typeof` correctly, convert on purpose |
| 02  | Operators and coercion  | Predict what `==`, `+`, `\|\|`, and `??` actually do            |
| 03  | Control flow            | Branch and loop without reaching for the wrong tool             |
| 04  | Functions               | Declarations vs. expressions vs. arrows, params, returns, scope |
| 05  | Arrays                  | `map`/`filter`/`reduce` and friends, spread, destructuring      |
| 06  | Objects                 | Property access, nesting, destructuring, `Object.*`, methods    |

### Part 02 — Functions in depth ✅ available now

Functions as values, taken seriously. Everything here compounds: lesson 01's
closure is lesson 04's memo cache, and lesson 05's currying is what makes
lesson 06's pipelines possible.

| #   | Lesson                | You'll be able to                                                |
| --- | --------------------- | ---------------------------------------------------------------- |
| 01  | Closures              | Private state, `once`, `memoize`, and why the loop bug happens    |
| 02  | `this` and binding    | The four rules, their priority, and why arrows are exempt          |
| 03  | `call`/`apply`/`bind` | Implement all three — standalone, then on `Function.prototype`     |
| 04  | Recursion             | Base cases, the stack limit, tree-shaped data, memoized branching  |
| 05  | Currying              | `curry`, `partial`, `unary` — and the `map(parseInt)` fix          |
| 06  | Composition           | `pipe`, `compose`, `tap`, and why composition wants unary functions |

### Coming next (I'll build these as you get there)

- **Part 03 — Objects and prototypes**: the prototype chain, `class` as sugar,
  inheritance, `Object.create`, property descriptors, getters/setters, `Symbol`.
- **Part 04 — Async**: the event loop and the two queues, callbacks →
  promises → `async`/`await`, error propagation, `Promise.all`/`race`/
  `allSettled`, cancellation with `AbortController`, generators and async
  iterators, and implementing a Promise from scratch.
- **Part 05 — Collections and data**: `Map`, `Set`, `WeakMap`, iterators and
  the iteration protocol, JSON, structured cloning, immutability patterns.
- **Part 06 — Errors and robustness**: `Error` subclassing, `throw` vs.
  return-an-error, `try/finally`, unhandled rejections, defensive boundaries.
- **Part 07 — Modules and tooling**: ESM vs. CommonJS, named vs. default
  exports, circular imports, `package.json` exports, bundlers, source maps.
- **Part 08 — Advanced**: `Proxy` and `Reflect`, tagged templates,
  memory model and leaks, micro-benchmarking honestly, metaprogramming.

Ask me to build the next Part whenever you're ready — or ask for extra drills
on any lesson that didn't stick.
