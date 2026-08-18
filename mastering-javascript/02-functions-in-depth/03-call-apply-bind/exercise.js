/**
 * Part 02, Lesson 03 — call, apply and bind
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * See README.md for how to run the tests. (Don't copy run commands out of
 * this header into your solution.js — they go stale; the README doesn't.)
 *
 * RULE FOR THIS WHOLE LESSON: you may not use the built-in call, apply or
 * bind anywhere in your implementations. That includes spread-into-call
 * tricks that delegate to them. Build the behaviour yourself.
 */

/* ------------------------------------------------------------------ *
 * STAGE 1 — standalone functions
 * ------------------------------------------------------------------ */

/**
 * Invoke `fn` with `thisArg` as its `this` and `args` as its arguments.
 * A null or undefined `thisArg` means globalThis.
 * `thisArg` must be left exactly as you found it.
 *
 * callWith(function () { return this.name; }, { name: 'Ada' }) -> 'Ada'
 */
export function callWith(fn, thisArg, ...args) {
  // TODO: put fn on the object under a Symbol key, call it through the dot,
  // then remove it. Return whatever it returned.
  throw new Error('callWith: not implemented');
}

/**
 * Same as callWith, but the arguments arrive as an array.
 * A missing or nullish array means no arguments.
 *
 * applyWith(function (a, b) { return a + b; }, null, [1, 2]) -> 3
 */
export function applyWith(fn, thisArg, argsArray) {
  // TODO
  throw new Error('applyWith: not implemented');
}

/**
 * Return a NEW function that, whenever it is called, invokes `fn` with
 * `thisArg` as its `this`. Any `preset` arguments come first, followed by
 * whatever the returned function is called with.
 *
 * The returned function must ignore any attempt to rebind it later.
 *
 * const hi = bindWith(greet, null, 'Hi');
 * hi('Ada')  -> 'Hi, Ada'
 */
export function bindWith(fn, thisArg, ...preset) {
  // TODO: return a closure over fn, thisArg and preset
  throw new Error('bindWith: not implemented');
}

/* ------------------------------------------------------------------ *
 * STAGE 2 — the same three, as methods on Function.prototype
 *
 * No exports here. Assign these at the top level of solution.js so that
 * every function in the program inherits them:
 *
 *     Function.prototype.myCall
 *     Function.prototype.myApply
 *     Function.prototype.myBind
 *
 * Inside each one, `this` is the function it was called on:
 *     greet.myCall(obj)   ->   `this` === greet
 *
 * Use Object.defineProperty with enumerable: false. A test walks a function
 * with for...in and fails if your methods show up.
 * ------------------------------------------------------------------ */

// TODO: define Function.prototype.myCall, myApply and myBind here.
