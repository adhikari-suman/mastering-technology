import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { width, instantiations, verdict, hotspots, memoised } from './solution.ts';
import type { TypeNode, Diagnostics, Verdict, Hotspot } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Verdict = Expect<Equal<Verdict, 'comfortable' | 'slow' | 'pathological'>>;
type _Hotspot = Expect<Equal<Hotspot, { readonly name: string; readonly cost: number }>>;

// Two functions, not one: the assignment below is suppressed for the checker
// but still NARROWS everything after it, which would make the comparison in
// `_narrowing` impossible.
function _readonly(node: TypeNode) {
  // @ts-expect-error - the tree is readonly
  node.kind = 'leaf';
}

function _narrowing(node: TypeNode) {
  if (node.kind === 'union') {
    const members = node.members;
    type _Members = Expect<Equal<typeof members, readonly TypeNode[]>>;
  }
}

/* ---------------------------------------------------------------- runtime */

const leaf: TypeNode = { kind: 'leaf' };
const unionOf = (n: number): TypeNode => ({
  kind: 'union',
  members: Array.from({ length: n }, () => leaf),
});

test('width', () => {
  assert.equal(width(leaf), 1);
  assert.equal(width(unionOf(5)), 5);
  assert.equal(width({ kind: 'mapped', keys: 10, body: leaf }), 1);
  assert.equal(width({ kind: 'alias', name: 'A', body: unionOf(3) }), 3);
});

test('width of a template is a product', () => {
  assert.equal(width({ kind: 'template', parts: [unionOf(50), unionOf(50)] }), 2500);
  assert.equal(width({ kind: 'template', parts: [] }), 1, 'the empty product');
});

test('width of a conditional is its body', () => {
  assert.equal(width({ kind: 'conditional', over: unionOf(9), body: unionOf(2) }), 2);
});

test('instantiations: the simple cases', () => {
  assert.equal(instantiations(leaf), 1);
  assert.equal(instantiations(unionOf(4)), 4);
  assert.equal(instantiations({ kind: 'mapped', keys: 10, body: leaf }), 10);
  assert.equal(instantiations({ kind: 'alias', name: 'A', body: unionOf(3) }), 3);
});

test('instantiations: a conditional runs once per member', () => {
  // cost(over) + width(over) * cost(body) = 200 + 200 * 1
  assert.equal(instantiations({ kind: 'conditional', over: unionOf(200), body: leaf }), 400);
});

test('instantiations: nesting multiplies', () => {
  const inner: TypeNode = { kind: 'conditional', over: unionOf(200), body: leaf };
  const outer: TypeNode = { kind: 'conditional', over: unionOf(200), body: inner };
  // 200 + 200 * 400 = 80_200. Two innocent-looking lines.
  assert.equal(instantiations(outer), 80_200);
});

test('instantiations: a mapped type over a conditional', () => {
  const body: TypeNode = { kind: 'conditional', over: unionOf(10), body: leaf };
  assert.equal(instantiations({ kind: 'mapped', keys: 50, body }), 50 * 20);
});

test('instantiations: a template cross product', () => {
  // product of widths (2500) + sum of costs (50 + 50)
  assert.equal(instantiations({ kind: 'template', parts: [unionOf(50), unionOf(50)] }), 2600);
});

test('verdict', () => {
  const at = (n: number): Diagnostics => ({ files: 1, types: 1, instantiations: n });
  assert.equal(verdict(at(0)), 'comfortable');
  assert.equal(verdict(at(499_999)), 'comfortable');
  assert.equal(verdict(at(500_000)), 'slow');
  assert.equal(verdict(at(4_999_999)), 'slow');
  assert.equal(verdict(at(5_000_000)), 'pathological');
  assert.equal(verdict(at(50_000_000)), 'pathological');
});

test('hotspots: nothing is named', () => {
  assert.deepEqual(hotspots(unionOf(3)), []);
  assert.deepEqual(hotspots(leaf), []);
});

test('hotspots: worst first', () => {
  const cheap: TypeNode = { kind: 'alias', name: 'Cheap', body: leaf };
  const dear: TypeNode = {
    kind: 'alias',
    name: 'Dear',
    body: { kind: 'conditional', over: unionOf(100), body: leaf },
  };
  const tree: TypeNode = { kind: 'union', members: [cheap, dear] };
  assert.deepEqual(hotspots(tree), [
    { name: 'Dear', cost: 200 },
    { name: 'Cheap', cost: 1 },
  ]);
});

test('hotspots: nested aliases are all reported, parents first on a tie', () => {
  const inner: TypeNode = { kind: 'alias', name: 'Inner', body: leaf };
  const outer: TypeNode = { kind: 'alias', name: 'Outer', body: inner };
  assert.deepEqual(hotspots(outer), [
    { name: 'Outer', cost: 1 },
    { name: 'Inner', cost: 1 },
  ]);
});

test('memoised', () => {
  const node: TypeNode = { kind: 'conditional', over: unionOf(100), body: leaf };
  assert.equal(instantiations(node), 200);
  assert.equal(memoised(node, 3), 400, 'computed once instead of three times');
  assert.equal(memoised(node, 1), 0, 'naming something used once saves nothing');
  assert.equal(memoised(node, 0), 0);
});

test('memoised never goes negative', () => {
  assert.equal(memoised(leaf, -5), 0);
});
