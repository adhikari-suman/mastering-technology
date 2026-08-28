import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect, IsNever } from '../../type-tests.ts';

import { Router } from './solution.ts';
import type { Method, ParamName, Params, Request, Handler, Result, RouteError } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _P1 = Expect<Equal<ParamName<'/users/:id'>, 'id'>>;
type _P2 = Expect<Equal<ParamName<'/users/:id/posts/:postId'>, 'id' | 'postId'>>;
type _P3 = Expect<IsNever<ParamName<'/health'>>>;

type _Params1 = Expect<Equal<Params<'/users/:id'>, { id: string }>>;
type _Params2 = Expect<Equal<Params<'/users/:id/posts/:postId'>, { id: string; postId: string }>>;
type _Params3 = Expect<Equal<Params<'/health'>, {}>>;

type _Method = Expect<Equal<Method, 'GET' | 'POST' | 'PUT' | 'DELETE'>>;

function _typeOnly() {
  const router = new Router();

  // The path literal survives inference, so the handler's params come from it.
  router.get('/users/:id', (req) => {
    type _Params = Expect<Equal<typeof req.params, { id: string }>>;
    type _Method = Expect<Equal<typeof req.method, Method>>;
    type _Query = Expect<Equal<typeof req.query, Readonly<Record<string, string>>>>;
    return req.params.id;
  });

  router.get('/users/:id/posts/:postId', (req) => `${req.params.id}/${req.params.postId}`);

  // @ts-expect-error - there is no `nope` parameter in that path
  router.get('/users/:id', (req) => req.params.nope);

  // @ts-expect-error - and none at all in this one
  router.get('/health', (req) => req.params.id);

  // Chaining returns `this`, so a subclass keeps its own methods.
  class Extended extends Router {
    describe(): string { return this.routes().join(', '); }
  }
  const extended = new Extended().get('/a', () => 1).post('/b', () => 2);
  type _Extended = Expect<Equal<typeof extended, Extended>>;
  extended.describe();

  // The result is a discriminated union, so the value is unreachable unchecked.
  const result = router.handle('GET', '/users/1');
  // @ts-expect-error - check `ok` first
  result.value;
  if (result.ok) {
    const value = result.value;
    type _Value = Expect<Equal<typeof value, unknown>>;
  } else {
    const error: RouteError = result.error;
    if (error.kind === 'methodNotAllowed') {
      type _Allowed = Expect<Equal<typeof error.allowed, Method[]>>;
    }
  }
}

/* ---------------------------------------------------------------- runtime */

const build = () =>
  new Router()
    .get('/health', () => 'ok')
    .get('/users/new', () => 'the form')
    .get('/users/:id', (req) => `user ${req.params.id}`)
    .get('/users/:id/posts/:postId', (req) => `${req.params.id}:${req.params.postId}`)
    .post('/users', (req) => `created with ${JSON.stringify(req.query)}`)
    .put('/users/:id', (req) => `replaced ${req.params.id}`)
    .delete('/users/:id', (req) => `deleted ${req.params.id}`);

const unwrap = (result: Result<unknown>): unknown => {
  assert.equal(result.ok, true, `expected a match, got ${JSON.stringify(result)}`);
  return result.ok ? result.value : undefined;
};

test('a static route', () => {
  assert.equal(unwrap(build().handle('GET', '/health')), 'ok');
});

test('a dynamic route binds its parameter', () => {
  assert.equal(unwrap(build().handle('GET', '/users/42')), 'user 42');
  assert.equal(unwrap(build().handle('GET', '/users/abc')), 'user abc');
});

test('several parameters', () => {
  assert.equal(unwrap(build().handle('GET', '/users/1/posts/9')), '1:9');
});

test('a static segment beats a dynamic one', () => {
  assert.equal(unwrap(build().handle('GET', '/users/new')), 'the form', 'not "user new"');
});

test('the verb is part of the match', () => {
  assert.equal(unwrap(build().handle('PUT', '/users/1')), 'replaced 1');
  assert.equal(unwrap(build().handle('DELETE', '/users/1')), 'deleted 1');
});

test('query strings are parsed and kept off the path', () => {
  assert.equal(
    unwrap(build().handle('POST', '/users?name=ada&role=admin')),
    'created with {"name":"ada","role":"admin"}',
  );
  assert.equal(unwrap(build().handle('POST', '/users')), 'created with {}');
});

test('a query string does not confuse parameter binding', () => {
  assert.equal(unwrap(build().handle('GET', '/users/7?verbose=1')), 'user 7');
});

test('an unmatched path is notFound', () => {
  const result = build().handle('GET', '/nope');
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.kind, 'notFound');
    assert.equal(result.error.path, '/nope');
  }
});

test('a wrong-length path does not match', () => {
  assert.equal(build().handle('GET', '/users/1/posts').ok, false);
  assert.equal(build().handle('GET', '/users').ok, false);
});

test('a matching path with the wrong verb is methodNotAllowed', () => {
  const result = build().handle('POST', '/users/1');
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.error.kind, 'methodNotAllowed');
    if (result.error.kind === 'methodNotAllowed') {
      assert.deepEqual(result.error.allowed, ['GET', 'PUT', 'DELETE'], 'in registration order');
      assert.equal(result.error.path, '/users/1');
    }
  }
});

test('routes() lists what was registered, in order', () => {
  assert.deepEqual(build().routes(), [
    'GET /health',
    'GET /users/new',
    'GET /users/:id',
    'GET /users/:id/posts/:postId',
    'POST /users',
    'PUT /users/:id',
    'DELETE /users/:id',
  ]);
});

test('the handler receives the method and the raw path', () => {
  let seen: Request<'/echo/:what'> | undefined;
  const router = new Router().get('/echo/:what', (req) => { seen = req; return req.params.what; });
  router.handle('GET', '/echo/hello?x=1');
  assert.equal(seen?.method, 'GET');
  assert.equal(seen?.path, '/echo/hello', 'the query is not part of the path');
  assert.deepEqual(seen?.params, { what: 'hello' });
  assert.deepEqual(seen?.query, { x: '1' });
});

test('registration returns the same router', () => {
  const router = new Router();
  assert.equal(router.get('/a', () => 1), router);
});

test('a later route does not shadow an earlier equal one', () => {
  const router = new Router()
    .get('/thing', () => 'first')
    .get('/thing', () => 'second');
  assert.equal(unwrap(router.handle('GET', '/thing')), 'first');
});

test('the root path', () => {
  const router = new Router().get('/', () => 'home');
  assert.equal(unwrap(router.handle('GET', '/')), 'home');
  assert.equal(router.handle('GET', '/anything').ok, false);
});
