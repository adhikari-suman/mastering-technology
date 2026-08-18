import test from 'node:test';
import assert from 'node:assert/strict';
import * as solution from './solution.js';

const { ValidationError, NotFoundError, HttpError, serialiseError, classify, collectErrors } = solution;

test('ValidationError: fields and name', () => {
  const err = new ValidationError('email', 'must be an email');
  assert.equal(err.message, 'must be an email');
  assert.equal(err.field, 'email');
  assert.equal(err.name, 'ValidationError', 'set this.name — it is not automatic');
});

test('ValidationError: is a real Error', () => {
  const err = new ValidationError('a', 'b');
  assert.ok(err instanceof ValidationError);
  assert.ok(err instanceof Error);
  assert.equal(typeof err.stack, 'string');
});

test('NotFoundError', () => {
  const err = new NotFoundError('user', 42);
  assert.equal(err.message, 'user 42 not found');
  assert.equal(err.resource, 'user');
  assert.equal(err.id, 42);
  assert.equal(err.name, 'NotFoundError');
  assert.equal(err.code, 'ERR_NOT_FOUND');
  assert.ok(err instanceof Error);
});

test('HttpError: message and status', () => {
  const err = new HttpError(404, 'Not Found');
  assert.equal(err.status, 404);
  assert.equal(err.message, 'HTTP 404: Not Found');
  assert.equal(err.name, 'HttpError');
});

test('HttpError: classification getters', () => {
  assert.equal(new HttpError(404, 'x').isClientError, true);
  assert.equal(new HttpError(499, 'x').isClientError, true);
  assert.equal(new HttpError(500, 'x').isClientError, false);
  assert.equal(new HttpError(500, 'x').isServerError, true);
  assert.equal(new HttpError(200, 'x').isServerError, false);
  assert.equal(new HttpError(200, 'x').isClientError, false);
});

test('serialiseError: includes name and message', () => {
  assert.deepEqual(serialiseError(new Error('plain')), { name: 'Error', message: 'plain' });
});

test('serialiseError: includes custom fields', () => {
  assert.deepEqual(serialiseError(new ValidationError('email', 'bad')), {
    name: 'ValidationError', message: 'bad', field: 'email',
  });
});

test('serialiseError: excludes stack', () => {
  assert.equal('stack' in serialiseError(new Error('x')), false);
});

test('serialiseError: survives JSON, unlike the error itself', () => {
  assert.equal(JSON.stringify(new Error('lost')), '{}', 'sanity: this is the problem');
  assert.equal(JSON.parse(JSON.stringify(serialiseError(new Error('kept')))).message, 'kept');
});

test('classify: built-in types', () => {
  assert.equal(classify(new TypeError('x')), 'TypeError');
  assert.equal(classify(new RangeError('x')), 'RangeError');
  assert.equal(classify(new SyntaxError('x')), 'SyntaxError');
  assert.equal(classify(new ReferenceError('x')), 'ReferenceError');
  assert.equal(classify(new Error('x')), 'Error');
});

test('classify: a custom subclass reports Error', () => {
  assert.equal(classify(new ValidationError('a', 'b')), 'Error');
});

test('classify: real thrown errors', () => {
  try { null.x; } catch (err) { assert.equal(classify(err), 'TypeError'); }
  try { JSON.parse('{oops}'); } catch (err) { assert.equal(classify(err), 'SyntaxError'); }
});

test('collectErrors: all succeed', () => {
  assert.deepEqual(collectErrors([() => 1, () => 2]), [1, 2]);
  assert.deepEqual(collectErrors([]), []);
});

test('collectErrors: gathers every failure, not just the first', () => {
  assert.throws(
    () => collectErrors([
      () => { throw new Error('one'); },
      () => 'fine',
      () => { throw new Error('two'); },
    ]),
    (err) => {
      assert.ok(err instanceof AggregateError);
      assert.deepEqual(err.errors.map((e) => e.message), ['one', 'two']);
      return true;
    },
  );
});

test('collectErrors: runs everything even after a failure', () => {
  let ran = 0;
  try {
    collectErrors([() => { ran++; throw new Error('x'); }, () => { ran++; return 1; }]);
  } catch {}
  assert.equal(ran, 2, 'do not stop at the first failure');
});
