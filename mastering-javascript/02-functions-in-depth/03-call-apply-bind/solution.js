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
  return fn.call(thisArg ?? globalThis, ...args);
}

/**
 * Same as callWith, but the arguments arrive as an array.
 * A missing or nullish array means no arguments.
 *
 * applyWith(function (a, b) { return a + b; }, null, [1, 2]) -> 3
 */
export function applyWith(fn, thisArg, argsArray) {
  return fn.apply(thisArg ?? globalThis, argsArray);
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
  let newFn = fn.bind(thisArg, ...preset);

  return newFn;
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

Object.defineProperty(Function.prototype, "myCall", {
  value: function (thisArg, ...args) {
    thisArg = thisArg == null ? globalThis : Object(thisArg);

    const key = Symbol("fn");
    thisArg[key] = this;

    const result = thisArg[key](...args);

    delete thisArg[key];
    return result;
  },
  enumerable: false,
  writable: true,
  configurable: true,
});

Object.defineProperty(Function.prototype, "myApply", {
  value: function (thisArg, argsArr) {
    thisArg = thisArg == null ? globalThis : Object(thisArg);

    const key = Symbol("fn");
    thisArg[key] = this;

    argsArr = argsArr == null ? [] : argsArr;

    const result = thisArg[key](...argsArr);
    delete thisArg[key];

    return result;
  },
  enumerable: false,
  writable: true,
  configurable: true,
});

Object.defineProperty(Function.prototype, "myBind", {
  value: function (thisArg, ...preset) {
    const fn = this;
    return function (...args) {
      return fn.myApply(thisArg, [...preset, ...args]);
    };
  },
  enumerable: false,
  writable: true,
  configurable: true,
});
