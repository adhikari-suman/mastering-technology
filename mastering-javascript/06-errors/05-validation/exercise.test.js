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

const { required, isString, isNumber, minLength, matches, validate, parseUser, parseConfig, atBoundary } = solution;

test('required', () => {
  assert.equal(required('a'), null);
  assert.equal(required(0), null, 'zero is present');
  assert.equal(required(false), null);
  assert.equal(required(undefined), 'is required');
  assert.equal(required(null), 'is required');
  assert.equal(required(''), 'is required');
});

test('isString / isNumber', () => {
  assert.equal(isString('a'), null);
  assert.equal(isString(1), 'must be a string');
  assert.equal(isNumber(1), null);
  assert.equal(isNumber(0), null);
  assert.equal(isNumber(NaN), 'must be a number');
  assert.equal(isNumber('1'), 'must be a number');
});

test('minLength', () => {
  assert.equal(minLength(3)('abc'), null);
  assert.equal(minLength(3)('ab'), 'must be at least 3 characters');
});

test('matches', () => {
  assert.equal(matches(/@/, 'must contain @')('a@b'), null);
  assert.equal(matches(/@/, 'must contain @')('ab'), 'must contain @');
});

test('validate: success', () => {
  const input = { name: 'Ada' };
  assert.deepEqual(validate(input, { name: [required, isString] }), { ok: true, value: input });
});

test('validate: collects every failure across fields', () => {
  const result = validate({ name: '', age: 'x' }, {
    name: [required],
    age: [isNumber],
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [
    { field: 'name', message: 'is required' },
    { field: 'age', message: 'must be a number' },
  ]);
});

test('validate: collects every failure within one field', () => {
  const result = validate({ name: 1 }, { name: [isString, minLength(3)] });
  assert.equal(result.errors.length, 2, 'do not stop at the first rule');
});

test('validate: empty schema always succeeds', () => {
  assert.deepEqual(validate({ a: 1 }, {}), { ok: true, value: { a: 1 } });
});

test('parseUser: normalises', () => {
  const result = parseUser({ email: '  ADA@Example.COM ', age: '36', tags: ['x'] });
  assert.deepEqual(result, { ok: true, value: { email: 'ada@example.com', age: 36, tags: ['x'] } });
});

test('parseUser: applies defaults', () => {
  const result = parseUser({ email: 'a@b.com' });
  assert.deepEqual(result.value, { email: 'a@b.com', age: 0, tags: [] });
});

test('parseUser: unparseable age becomes 0', () => {
  assert.equal(parseUser({ email: 'a@b.com', age: 'nonsense' }).value.age, 0);
});

test('parseUser: non-array tags become []', () => {
  assert.deepEqual(parseUser({ email: 'a@b.com', tags: 'x' }).value.tags, []);
});

test('parseUser: reports errors', () => {
  assert.deepEqual(parseUser({}).errors, [{ field: 'email', message: 'is required' }]);
  assert.deepEqual(parseUser({ email: 'nope' }).errors, [{ field: 'email', message: 'must contain @' }]);
});

test('parseUser: returns a new object', () => {
  const input = { email: 'a@b.com' };
  assert.notEqual(parseUser(input).value, input, 'parse must produce a new value');
});

test('parseConfig: parses and defaults', () => {
  assert.deepEqual(parseConfig({ PORT: '8080', DEBUG: 'true', HOST: 'example.com' }), {
    ok: true, value: { port: 8080, debug: true, host: 'example.com' },
  });
  assert.deepEqual(parseConfig({}), { ok: true, value: { port: 3000, debug: false, host: 'localhost' } });
});

test('parseConfig: DEBUG is true only for the exact string', () => {
  assert.equal(parseConfig({ DEBUG: 'TRUE' }).value.debug, false);
  assert.equal(parseConfig({ DEBUG: '1' }).value.debug, false);
  assert.equal(parseConfig({ DEBUG: 'true' }).value.debug, true);
});

test('parseConfig: a bad PORT is an error', () => {
  const result = parseConfig({ PORT: 'nonsense' });
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [{ field: 'PORT', message: 'must be a number' }]);
});

test('atBoundary: the handler only sees parsed values', () => {
  const boundary = atBoundary(parseUser, (user) => user.email);
  assert.deepEqual(boundary({ email: ' A@B.com ' }), { ok: true, value: 'a@b.com' });
});

test('atBoundary: failures skip the handler entirely', () => {
  let called = false;
  const boundary = atBoundary(parseUser, () => { called = true; });
  const result = boundary({});
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [{ field: 'email', message: 'is required' }]);
  assert.equal(called, false, 'the interior must never run on unparsed input');
});
