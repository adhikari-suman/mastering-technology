import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import {
  buildOrder, dependenciesOf, affectedBy, ReferenceCycleError, UnknownReferenceError,
} from './solution.ts';
import type { Project, Graph } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Project = Expect<
  Equal<Project, { readonly name: string; readonly references: readonly string[] }>
>;
type _Order = Expect<Equal<ReturnType<typeof buildOrder>, string[]>>;

function _typeOnly(graph: Graph) {
  // @ts-expect-error - a Graph is readonly
  graph.push({ name: 'x', references: [] });
}

/* ---------------------------------------------------------------- runtime */

const p = (name: string, ...references: string[]): Project => ({ name, references });

const monorepo: Graph = [
  p('app', 'core', 'ui'),
  p('ui', 'core'),
  p('core'),
  p('tools'),
];

test('buildOrder: dependencies come first', () => {
  assert.deepEqual(buildOrder([p('app', 'core'), p('core')]), ['core', 'app']);
});

test('buildOrder: a shared dependency appears once', () => {
  const order = buildOrder(monorepo);
  assert.equal(order.filter((n) => n === 'core').length, 1);
  assert.ok(order.indexOf('core') < order.indexOf('ui'));
  assert.ok(order.indexOf('ui') < order.indexOf('app'));
});

test('buildOrder: every project is present', () => {
  assert.deepEqual([...buildOrder(monorepo)].sort(), ['app', 'core', 'tools', 'ui']);
});

test('buildOrder is deterministic across independent projects', () => {
  assert.deepEqual(buildOrder(monorepo), buildOrder(monorepo));
  assert.deepEqual(buildOrder([p('a'), p('b'), p('c')]), ['a', 'b', 'c']);
});

test('buildOrder: an empty graph', () => {
  assert.deepEqual(buildOrder([]), []);
});

test('buildOrder: a deep chain', () => {
  assert.deepEqual(
    buildOrder([p('d', 'c'), p('c', 'b'), p('b', 'a'), p('a')]),
    ['a', 'b', 'c', 'd'],
  );
});

test('buildOrder rejects a cycle', () => {
  assert.throws(() => buildOrder([p('a', 'b'), p('b', 'a')]), ReferenceCycleError);
});

test('buildOrder names the cycle it found', () => {
  assert.throws(
    () => buildOrder([p('a', 'b'), p('b', 'a')]),
    (err: unknown) => {
      assert.ok(err instanceof ReferenceCycleError);
      assert.deepEqual(err.cycle, ['a', 'b', 'a']);
      assert.match(err.message, /a -> b -> a/);
      return true;
    },
  );
});

test('buildOrder rejects a self-reference', () => {
  assert.throws(() => buildOrder([p('a', 'a')]), ReferenceCycleError);
});

test('buildOrder rejects an unknown reference', () => {
  assert.throws(() => buildOrder([p('a', 'ghost')]), UnknownReferenceError);
  assert.throws(() => buildOrder([p('a', 'ghost')]), { message: 'a references unknown project ghost' });
});

test('dependenciesOf', () => {
  assert.deepEqual(dependenciesOf(monorepo, 'app'), ['core', 'ui']);
  assert.deepEqual(dependenciesOf(monorepo, 'ui'), ['core']);
  assert.deepEqual(dependenciesOf(monorepo, 'core'), []);
  assert.deepEqual(dependenciesOf(monorepo, 'tools'), []);
});

test('dependenciesOf rejects an unknown project', () => {
  assert.throws(() => dependenciesOf(monorepo, 'ghost'), UnknownReferenceError);
});

test('affectedBy', () => {
  assert.deepEqual(affectedBy(monorepo, 'core'), ['ui', 'app']);
  assert.deepEqual(affectedBy(monorepo, 'ui'), ['app']);
  assert.deepEqual(affectedBy(monorepo, 'app'), []);
  assert.deepEqual(affectedBy(monorepo, 'tools'), []);
});

test('affectedBy rejects an unknown project', () => {
  assert.throws(() => affectedBy(monorepo, 'ghost'), UnknownReferenceError);
});
