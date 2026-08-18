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

const { ok, err, isOk, isErr, mapResult, chainResult, unwrapOr, fromThrowing, toThrowing, all } = solution;

test('ok and err construct the shapes', () => {
  assert.deepEqual(ok(5), { ok: true, value: 5 });
  assert.deepEqual(err('boom'), { ok: false, error: 'boom' });
  assert.deepEqual(ok(undefined), { ok: true, value: undefined });
});

test('guards', () => {
  assert.equal(isOk(ok(1)), true);
  assert.equal(isOk(err('e')), false);
  assert.equal(isErr(err('e')), true);
  assert.equal(isErr(ok(1)), false);
});

test('guards work on falsy success values', () => {
  assert.equal(isOk(ok(0)), true);
  assert.equal(isOk(ok(null)), true);
  assert.equal(isOk(ok(false)), true);
});

test('mapResult: transforms a success', () => {
  assert.deepEqual(mapResult(ok(2), (n) => n * 2), { ok: true, value: 4 });
});

test('mapResult: passes a failure through without calling fn', () => {
  let called = false;
  assert.deepEqual(mapResult(err('e'), () => { called = true; }), { ok: false, error: 'e' });
  assert.equal(called, false);
});

test('chainResult: does not double-wrap', () => {
  assert.deepEqual(chainResult(ok(2), (n) => ok(n * 2)), { ok: true, value: 4 });
});

test('chainResult: a step can fail', () => {
  assert.deepEqual(chainResult(ok(2), () => err('bad')), { ok: false, error: 'bad' });
});

test('chainResult: an existing failure short-circuits', () => {
  let called = false;
  assert.deepEqual(chainResult(err('e'), () => { called = true; return ok(1); }), { ok: false, error: 'e' });
  assert.equal(called, false);
});

test('chainResult: sequences several steps', () => {
  const half = (n) => (n % 2 === 0 ? ok(n / 2) : err('odd'));
  assert.deepEqual(chainResult(chainResult(ok(8), half), half), { ok: true, value: 2 });
  assert.deepEqual(chainResult(chainResult(ok(6), half), half), { ok: false, error: 'odd' });
});

test('unwrapOr', () => {
  assert.equal(unwrapOr(ok(5), 0), 5);
  assert.equal(unwrapOr(err('e'), 0), 0);
  assert.equal(unwrapOr(ok(0), 99), 0, 'a falsy success value is still the value');
});

test('fromThrowing: success', () => {
  assert.deepEqual(fromThrowing((n) => n * 2)(5), { ok: true, value: 10 });
});

test('fromThrowing: failure captures the error', () => {
  const result = fromThrowing(JSON.parse)('{oops}');
  assert.equal(result.ok, false);
  assert.ok(result.error instanceof SyntaxError);
});

test('fromThrowing: forwards all arguments', () => {
  assert.deepEqual(fromThrowing((a, b) => a + b)(1, 2), { ok: true, value: 3 });
});

test('toThrowing: returns the value on success', () => {
  assert.equal(toThrowing((n) => ok(n * 2))(5), 10);
});

test('toThrowing: throws on failure', () => {
  assert.throws(() => toThrowing(() => err(new Error('boom')))(), /boom/);
});

test('toThrowing: normalises a non-Error error', () => {
  assert.throws(() => toThrowing(() => err('plain string'))(), (e) => {
    assert.ok(e instanceof Error);
    assert.equal(e.message, 'plain string');
    return true;
  });
});

test('all: every success', () => {
  assert.deepEqual(all([ok(1), ok(2)]), { ok: true, value: [1, 2] });
  assert.deepEqual(all([]), { ok: true, value: [] });
});

test('all: the first failure wins', () => {
  assert.deepEqual(all([ok(1), err('first'), err('second')]), { ok: false, error: 'first' });
});

test('the pieces compose', () => {
  const parse = fromThrowing(JSON.parse);
  const getName = (obj) => (obj.name ? ok(obj.name) : err('no name'));
  assert.deepEqual(chainResult(parse('{"name":"Ada"}'), getName), { ok: true, value: 'Ada' });
  assert.deepEqual(chainResult(parse('{}'), getName), { ok: false, error: 'no name' });
  assert.equal(isErr(chainResult(parse('{oops}'), getName)), true);
});
