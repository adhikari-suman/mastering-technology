import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { Stack, mapBox } from './solution.ts';
import type { Box, Pushable, PushableProp } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Box = Expect<Equal<Box<number>, { readonly value: number }>>;
type _Instance = Expect<Equal<InstanceType<typeof Stack<string>>, Stack<string>>>;

interface Animal { legs: number }
interface Dog extends Animal { bark(): void }

function _variance(dogs: Pushable<Dog>, dogsProp: PushableProp<Dog>) {
  // A method is checked bivariantly — unsound, and accepted.
  const animals: Pushable<Animal> = dogs;

  // The very same operation as a property is checked contravariantly.
  // @ts-expect-error - this is the assignment that would let a Cat in
  const animalsProp: PushableProp<Animal> = dogsProp;
}

function _boxes(box: Box<number>) {
  const mapped = mapBox(box, (n) => String(n));
  type _Mapped = Expect<Equal<typeof mapped, Box<string>>>;

  // @ts-expect-error - a Box is read-only
  box.value = 1;
}

function _stackTypes() {
  const s = new Stack<number>();
  type _Pop = Expect<Equal<ReturnType<typeof s.pop>, number | undefined>>;
  type _Size = Expect<Equal<typeof s.size, number>>;
  type _Array = Expect<Equal<ReturnType<typeof s.toArray>, number[]>>;

  // @ts-expect-error - a string is not a number
  s.push('x');
}

/* ---------------------------------------------------------------- runtime */

test('Stack: push and pop are last-in, first-out', () => {
  const s = new Stack<number>();
  s.push(1);
  s.push(2);
  assert.equal(s.pop(), 2);
  assert.equal(s.pop(), 1);
  assert.equal(s.pop(), undefined);
});

test('Stack: peek does not remove', () => {
  const s = new Stack<string>();
  s.push('a');
  assert.equal(s.peek(), 'a');
  assert.equal(s.peek(), 'a');
  assert.equal(s.size, 1);
});

test('Stack: peek and pop on an empty stack', () => {
  const s = new Stack<number>();
  assert.equal(s.peek(), undefined);
  assert.equal(s.pop(), undefined);
});

test('Stack: size and isEmpty', () => {
  const s = new Stack<number>();
  assert.equal(s.size, 0);
  assert.equal(s.isEmpty(), true);
  s.push(1);
  assert.equal(s.size, 1);
  assert.equal(s.isEmpty(), false);
  s.pop();
  assert.equal(s.isEmpty(), true);
});

test('Stack: toArray is bottom to top', () => {
  const s = new Stack<number>();
  s.push(1);
  s.push(2);
  s.push(3);
  assert.deepEqual(s.toArray(), [1, 2, 3]);
});

test('Stack: toArray returns a copy', () => {
  const s = new Stack<number>();
  s.push(1);
  const out = s.toArray();
  out.push(99);
  assert.deepEqual(s.toArray(), [1], 'the stack is unchanged');
});

test('Stack: two instances do not share state', () => {
  const a = new Stack<number>();
  const b = new Stack<number>();
  a.push(1);
  assert.equal(b.size, 0);
});

test('Stack: undefined is a storable value', () => {
  const s = new Stack<number | undefined>();
  s.push(undefined);
  assert.equal(s.size, 1);
  assert.equal(s.pop(), undefined);
  assert.equal(s.size, 0);
});

test('mapBox', () => {
  assert.deepEqual(mapBox({ value: 1 }, (n) => String(n)), { value: '1' });
});

test('mapBox does not mutate', () => {
  const box = { value: 1 };
  const out = mapBox(box, (n) => n + 1);
  assert.deepEqual(box, { value: 1 });
  assert.notEqual(out, box);
});
