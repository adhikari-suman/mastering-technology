import test from 'node:test';
import assert from 'node:assert/strict';

// Your answers live in solution.js, which you create yourself:
//     cp exercise.js solution.js
//
// It is loaded leniently so that a missing file surfaces as one clear
// failure instead of a module-load crash that hides every other test.
let solution = {};
let loadError = null;
try {
  solution = await import('./solution.js');
} catch (err) {
  loadError = err;
}

test('solution.js exists', () => {
  assert.equal(loadError, null, 'Create it first:  cp exercise.js solution.js');
});

const {
  PREDICTIONS,
  makeUser,
  getGreeter,
  Counter,
  makeTimer,
  describeThis,
  borrowMethod,
} = solution;

const EXPECTED = {
  'plain call': 'default',
  'method call': 'implicit',
  'method pulled off the object, then called': 'default',
  'called with .call(obj)': 'explicit',
  'bound with .bind(obj), then called': 'explicit',
  'called with new': 'new',
  'arrow written as an object property': 'lexical',
  'arrow written inside a method': 'lexical',
  'bound function, then .call with a different object': 'explicit',
};

test('PREDICTIONS: every situation has been answered', () => {
  assert.ok(PREDICTIONS, 'export a PREDICTIONS object from solution.js');
  const todo = Object.keys(EXPECTED).filter((k) => PREDICTIONS[k] === 'TODO');
  assert.deepEqual(todo, [], `still marked TODO: ${todo.join(', ')}`);
});

for (const [situation, rule] of Object.entries(EXPECTED)) {
  test(`PREDICTIONS: ${situation}`, () => {
    assert.equal(
      PREDICTIONS?.[situation],
      rule,
      `you said ${JSON.stringify(PREDICTIONS?.[situation])}, the rule is "${rule}"`,
    );
  });
}

test('makeUser: greets using this.name', () => {
  assert.equal(makeUser('Ada').greet(), 'Hi, Ada');
  assert.equal(makeUser('Grace').greet(), 'Hi, Grace');
});

test('makeUser: greet() follows the object, so it is not an arrow', () => {
  const u = makeUser('Ada');
  u.name = 'Changed';
  assert.equal(u.greet(), 'Hi, Changed', 'greet must read this.name at call time');
});

test('makeUser: the raw method loses its binding', () => {
  const u = makeUser('Ada');
  const detached = u.greet;
  assert.throws(detached, 'a bare method call has no `this` in a module');
});

test('getGreeter: survives being called with no object', () => {
  const greet = getGreeter(makeUser('Ada'));
  assert.equal(greet(), 'Hi, Ada');
});

test('getGreeter: survives being passed as a callback', () => {
  const greet = getGreeter(makeUser('Grace'));
  assert.deepEqual([1].map(() => greet()), ['Hi, Grace']);
});

test('Counter: new gives each instance its own state', () => {
  const a = new Counter();
  const b = new Counter();
  assert.equal(a.value, 0);
  assert.equal(a.increment(), 1);
  assert.equal(a.increment(), 2);
  assert.equal(b.value, 0, 'instances must not share state');
});

test('makeTimer: the callback sees the timer as this', () => {
  const t = makeTimer();
  assert.equal(t.count, 0);
  t.start((cb) => cb());
  assert.equal(t.count, 1, 'use an arrow so the callback keeps start()\'s `this`');
});

test('makeTimer: repeated starts keep accumulating', () => {
  const t = makeTimer();
  t.start((cb) => cb());
  t.start((cb) => cb());
  assert.equal(t.count, 2);
});

test('describeThis: default binding is undefined in a module', () => {
  assert.equal(describeThis(), 'undefined');
});

test('describeThis: explicit binding reports the label', () => {
  assert.equal(describeThis.call({ label: 'obj' }), 'obj');
  assert.equal(describeThis.apply({ label: 'other' }), 'other');
});

test('describeThis: implicit binding reports the label', () => {
  const holder = { label: 'holder', describeThis };
  assert.equal(holder.describeThis(), 'holder');
});

test('borrowMethod: runs the function with obj as this', () => {
  assert.equal(borrowMethod({ name: 'Ada' }, function () { return this.name; }), 'Ada');
});

test('borrowMethod: forwards extra arguments', () => {
  const result = borrowMethod(
    { name: 'Ada' },
    function (greeting, punctuation) { return `${greeting}, ${this.name}${punctuation}`; },
    'Hello',
    '!',
  );
  assert.equal(result, 'Hello, Ada!');
});

test('borrowMethod: does not leave the function on the object', () => {
  const obj = { name: 'Ada' };
  borrowMethod(obj, function () { return this.name; });
  assert.deepEqual(Object.keys(obj), ['name'], 'do not attach fn to obj');
});
