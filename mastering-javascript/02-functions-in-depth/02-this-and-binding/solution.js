/**
 * PART 1 — Predict, then verify.
 *
 * For each situation, say which binding rule applies. Use exactly one of:
 *   'default' | 'implicit' | 'explicit' | 'new' | 'lexical'
 *
 * 'lexical' means an arrow function, which has no `this` of its own and uses
 * the enclosing scope's.
 *
 * Answer from your head BEFORE running anything.
 */
export const PREDICTIONS = {
  // function show() { return this; }  ->  show()
  "plain call": "default",

  // const o = { m() { return this; } };  ->  o.m()
  "method call": "implicit",

  // const o = { m() { return this; } };  ->  const f = o.m; f()
  "method pulled off the object, then called": "default",

  // function show() { return this; }  ->  show.call(obj)
  "called with .call(obj)": "explicit",

  // function show() { return this; }  ->  show.bind(obj)()
  "bound with .bind(obj), then called": "explicit",

  // function Ctor() { this.x = 1; }  ->  new Ctor()
  "called with new": "new",

  // const o = { m: () => this };  ->  o.m()
  "arrow written as an object property": "lexical",

  // const o = { m() { return (() => this)(); } };  ->  o.m()
  "arrow written inside a method": "lexical",

  // const bound = show.bind(a);  ->  bound.call(b)
  "bound function, then .call with a different object": "explicit",
};

/**
 * PART 2 — Implement.
 */

/**
 * Return an object with a `name` and a `greet()` method that returns
 * `Hi, <name>` by reading `this.name`.
 *
 * Use method shorthand, NOT an arrow — one test reassigns `.name` and expects
 * greet() to notice.
 *
 * makeUser('Ada').greet() -> 'Hi, Ada'
 */
export function makeUser(name) {
  return {
    name,
    greet() {
      return `Hi, ${this.name}`;
    },
  };
}

/**
 * Given a user object built by makeUser, return a standalone function that
 * still greets correctly when called with no object in front of it.
 *
 * const greet = getGreeter(makeUser('Ada'));
 * greet() -> 'Hi, Ada'    (even though there is no dot)
 */
export function getGreeter(user) {
  const greeter = user.greet.bind(user);

  return greeter;
}

/**
 * A constructor, to be used with `new`.
 *   new Counter()      starts at 0
 *   .increment()       adds 1 and returns the new count
 *   .value             the current count
 *
 * Two instances must not share state.
 *
 * Write it as a `function` (not a class) — the point is to see `this` bound
 * by the `new` rule.
 */
export function Counter() {
  this.value = 0;
  this.increment = function () {
    this.value++;
    return this.value;
  };
}

/**
 * Return an object with `count` and a `start()` method.
 *
 * `start()` must schedule a callback (use the provided `schedule` function,
 * which just calls its argument) that increments `this.count`. The callback
 * has to see the timer object as `this` — which is exactly what an arrow
 * function gives you and a plain function does not.
 *
 * const t = makeTimer();
 * t.start((cb) => cb());
 * t.count -> 1
 */
export function makeTimer() {
  return {
    count: 0,
    start: function (schedule) {
      schedule(() => {
        this.count++;
      });
    },
  };
}

/**
 * Return a string naming what `this` is when the function is called:
 *   'undefined'  when `this` is undefined (default binding in a module)
 *   otherwise    the value of `this.label`
 *
 * describeThis()                       -> 'undefined'
 * describeThis.call({ label: 'obj' })  -> 'obj'
 */
export function describeThis() {
  if (this !== undefined && Object.hasOwn(this, "label")) {
    return this.label;
  }

  return "undefined";
}

/**
 * Call `fn` with `obj` as its `this`, passing along any extra arguments, and
 * return the result. Don't attach fn to obj as a property.
 *
 * borrowMethod({ name: 'Ada' }, function () { return this.name; }) -> 'Ada'
 */
export function borrowMethod(obj, fn, ...args) {
  return fn.call(obj, ...args);
}
