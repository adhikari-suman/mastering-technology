import test from 'node:test';
import assert from 'node:assert/strict';

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

const { range, naturals, takeFrom, mapGen, filterGen, flattenGen, collect, runner, pages } = solution;

test('range', () => {
  assert.deepEqual([...range(0, 3)], [0, 1, 2]);
  assert.deepEqual([...range(0, 6, 2)], [0, 2, 4]);
  assert.deepEqual([...range(3, 0)], []);
});

test('range: a fresh generator each call', () => {
  assert.deepEqual([...range(0, 2)], [0, 1]);
  assert.deepEqual([...range(0, 2)], [0, 1]);
});

test('naturals: nothing runs before the first next()', () => {
  const g = naturals();
  assert.equal(typeof g.next, 'function');
  assert.equal(g.next().value, 0);
  assert.equal(g.next().value, 1);
});

test('takeFrom: bounded and lazy', () => {
  assert.deepEqual([...takeFrom([1, 2, 3, 4], 2)], [1, 2]);
  assert.deepEqual([...takeFrom([1], 5)], [1]);
  assert.deepEqual([...takeFrom(naturals(), 4)], [0, 1, 2, 3]);
  assert.deepEqual([...takeFrom([1, 2], 0)], []);
});

test('mapGen', () => {
  assert.deepEqual([...mapGen([1, 2, 3], (n) => n * 2)], [2, 4, 6]);
  assert.deepEqual([...takeFrom(mapGen(naturals(), (n) => n * 10), 3)], [0, 10, 20]);
});

test('mapGen: is lazy', () => {
  let calls = 0;
  const mapped = mapGen(naturals(), (n) => { calls++; return n; });
  [...takeFrom(mapped, 3)];
  assert.equal(calls, 3, 'only what was pulled should be computed');
});

test('filterGen', () => {
  assert.deepEqual([...filterGen([1, 2, 3, 4], (n) => n % 2 === 0)], [2, 4]);
  assert.deepEqual([...takeFrom(filterGen(naturals(), (n) => n % 2 === 0), 3)], [0, 2, 4]);
});

test('mapGen and filterGen compose lazily', () => {
  const pipeline = mapGen(filterGen(naturals(), (n) => n % 2 === 0), (n) => n * 10);
  assert.deepEqual([...takeFrom(pipeline, 3)], [0, 20, 40]);
});

test('flattenGen', () => {
  assert.deepEqual([...flattenGen([1, [2, [3]]])], [1, 2, 3]);
  assert.deepEqual([...flattenGen([])], []);
  assert.deepEqual([...flattenGen([[[1]], 2])], [1, 2]);
  assert.deepEqual([...flattenGen(5)], [5], 'a bare value yields itself');
});

test('collect: captures yields and the return value', () => {
  function* g() { yield 1; yield 2; return 'done'; }
  assert.deepEqual(collect(g()), { values: [1, 2], returned: 'done' });
});

test('collect: no return value', () => {
  function* g() { yield 1; }
  assert.deepEqual(collect(g()), { values: [1], returned: undefined });
});

test('collect: no yields at all', () => {
  function* g() { return 'only'; }
  assert.deepEqual(collect(g()), { values: [], returned: 'only' });
});

test('runner: feeds resolved values back in', async () => {
  const result = await runner(function* () {
    const a = yield Promise.resolve(1);
    const b = yield Promise.resolve(2);
    return a + b;
  });
  assert.equal(result, 3);
});

test('runner: sequences dependent steps', async () => {
  const result = await runner(function* () {
    const a = yield Promise.resolve(10);
    const b = yield Promise.resolve(a * 2);
    return b;
  });
  assert.equal(result, 20);
});

test('runner: throws rejections into the generator', async () => {
  const result = await runner(function* () {
    try {
      yield Promise.reject(new Error('boom'));
      return 'not reached';
    } catch (err) {
      return `caught ${err.message}`;
    }
  });
  assert.equal(result, 'caught boom');
});

test('runner: an unhandled rejection rejects the promise', async () => {
  await assert.rejects(
    () => runner(function* () { yield Promise.reject(new Error('boom')); }),
    /boom/,
  );
});

test('pages: yields every page in order', async () => {
  const data = {
    undefined: { items: ['a', 'b'], next: 'p2' },
    p2: { items: ['c'], next: 'p3' },
    p3: { items: ['d'], next: null },
  };
  const fetchPage = async (cursor) => data[String(cursor)];
  const seen = [];
  for await (const items of pages(fetchPage)) seen.push(items);
  assert.deepEqual(seen, [['a', 'b'], ['c'], ['d']]);
});

test('pages: a single page', async () => {
  const fetchPage = async () => ({ items: [1], next: null });
  const seen = [];
  for await (const items of pages(fetchPage)) seen.push(items);
  assert.deepEqual(seen, [[1]]);
});

test('pages: is lazy — stops fetching when you break', async () => {
  let fetches = 0;
  const fetchPage = async () => { fetches++; return { items: [fetches], next: 'more' }; };
  for await (const items of pages(fetchPage)) {
    if (items[0] >= 2) break;
  }
  assert.equal(fetches, 2, 'breaking must stop the generator');
});
