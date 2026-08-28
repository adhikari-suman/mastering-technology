import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { varianceOf, contramap, mapProducer } from './solution.ts';
import type {
  Producer, Consumer, Invariant, WithMethod, WithProperty, Variance, Position,
} from './solution.ts';

/* ------------------------------------------------------------------ types */

interface Animal { legs: number }
interface Dog extends Animal { bark(): void }

function _variance(
  dogProducer: Producer<Dog>,
  animalConsumer: Consumer<Animal>,
  dogBox: Invariant<Dog>,
  dogMethod: WithMethod<Dog>,
  dogProperty: WithProperty<Dog>,
) {
  // Covariant: a producer of dogs produces animals.
  const animalProducer: Producer<Animal> = dogProducer;

  // Contravariant: a consumer of animals will accept dogs.
  const dogConsumer: Consumer<Dog> = animalConsumer;

  // @ts-expect-error - and not the other way round
  const wrongWay: Consumer<Animal> = dogConsumer;

  // @ts-expect-error - invariant: reading wants one direction, writing the other
  const animalBox: Invariant<Animal> = dogBox;

  // A method is bivariant, so this unsound assignment is allowed.
  const animalMethod: WithMethod<Animal> = dogMethod;

  // @ts-expect-error - the same operation as a property is checked
  const animalProperty: WithProperty<Animal> = dogProperty;
}

type _Variance = Expect<
  Equal<Variance, 'covariant' | 'contravariant' | 'invariant' | 'bivariant'>
>;
type _Position = Expect<Equal<Position, 'output' | 'input' | 'method'>>;

function _combinators(numberConsumer: Consumer<number>, numberProducer: Producer<number>) {
  // contramap flips the direction the function points.
  const stringConsumer = contramap(numberConsumer, (s: string) => s.length);
  type _Contra = Expect<Equal<typeof stringConsumer, Consumer<string>>>;

  const stringProducer = mapProducer(numberProducer, (n) => String(n));
  type _Co = Expect<Equal<typeof stringProducer, Producer<string>>>;
}

/* ---------------------------------------------------------------- runtime */

test('varianceOf: a single position', () => {
  assert.equal(varianceOf(['output']), 'covariant');
  assert.equal(varianceOf(['input']), 'contravariant');
  assert.equal(varianceOf(['method']), 'bivariant');
});

test('varianceOf: no positions at all', () => {
  assert.equal(varianceOf([]), 'covariant');
});

test('varianceOf: both directions is invariant', () => {
  assert.equal(varianceOf(['output', 'input']), 'invariant');
  assert.equal(varianceOf(['input', 'output']), 'invariant');
});

test('varianceOf: a method constrains nothing, so it never decides', () => {
  assert.equal(varianceOf(['output', 'method']), 'covariant');
  assert.equal(varianceOf(['input', 'method']), 'contravariant');
  assert.equal(varianceOf(['method', 'method']), 'bivariant');
  assert.equal(varianceOf(['output', 'input', 'method']), 'invariant');
});

test('varianceOf: repeats do not change the answer', () => {
  assert.equal(varianceOf(['output', 'output']), 'covariant');
  assert.equal(varianceOf(['input', 'input', 'input']), 'contravariant');
});

test('contramap', () => {
  const seen: number[] = [];
  const numberConsumer: Consumer<number> = { set: (n) => { seen.push(n); } };
  const stringConsumer = contramap(numberConsumer, (s: string) => s.length);
  stringConsumer.set('hello');
  stringConsumer.set('');
  assert.deepEqual(seen, [5, 0]);
});

test('contramap composes', () => {
  const seen: string[] = [];
  const base: Consumer<string> = { set: (s) => { seen.push(s); } };
  const fromNumber = contramap(base, (n: number) => `n=${n}`);
  const fromBoolean = contramap(fromNumber, (b: boolean) => (b ? 1 : 0));
  fromBoolean.set(true);
  fromBoolean.set(false);
  assert.deepEqual(seen, ['n=1', 'n=0']);
});

test('mapProducer', () => {
  let calls = 0;
  const numbers: Producer<number> = { get: () => { calls++; return calls; } };
  const strings = mapProducer(numbers, (n) => `#${n}`);
  assert.equal(strings.get(), '#1');
  assert.equal(strings.get(), '#2');
});

test('mapProducer does not call through until asked', () => {
  let called = false;
  const producer: Producer<number> = { get: () => { called = true; return 1; } };
  mapProducer(producer, (n) => n);
  assert.equal(called, false, 'lazy, like the thing it wraps');
});
