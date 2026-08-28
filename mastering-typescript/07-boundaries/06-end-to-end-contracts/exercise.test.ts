import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { API, ContractError, createServer, createClient, asUser, asString } from './solution.ts';
import type {
  RouteName, ParamsOf, ResponseOf, BodyOf, Handler, Handlers, Transport,
} from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Routes = Expect<
  Equal<RouteName, 'GET /users/:id' | 'GET /users/:id/posts/:postId' | 'POST /users' | 'GET /health'>
>;

type _Params1 = Expect<Equal<ParamsOf<'GET /users/:id'>, { id: string }>>;
type _Params2 = Expect<
  Equal<ParamsOf<'GET /users/:id/posts/:postId'>, { id: string; postId: string }>
>;
type _Params3 = Expect<Equal<ParamsOf<'GET /health'>, {}>>;

type _Response1 = Expect<Equal<ResponseOf<'GET /users/:id'>, { id: number; email: string }>>;
type _Response2 = Expect<Equal<ResponseOf<'GET /health'>, string>>;

type _Body1 = Expect<Equal<BodyOf<'POST /users'>, { id: number; email: string }>>;
type _Body2 = Expect<Equal<BodyOf<'GET /health'>, undefined>>;

type _Handler = Expect<
  Equal<
    Handler<'GET /users/:id'>,
    (params: { id: string }, body: undefined) => { id: number; email: string }
  >
>;

function _typeOnly(server: ReturnType<typeof createServer>) {
  // The params argument's type follows from the route string.
  const user = server('GET /users/:id', { id: '1' }, undefined);
  type _User = Expect<Equal<typeof user, { id: number; email: string }>>;

  const health = server('GET /health', {}, undefined);
  type _Health = Expect<Equal<typeof health, string>>;

  // @ts-expect-error - that route has no `postId` param
  server('GET /users/:id', { id: '1', postId: '2' }, undefined);

  // @ts-expect-error - this route needs both params
  server('GET /users/:id/posts/:postId', { id: '1' }, undefined);

  // @ts-expect-error - not a route
  server('DELETE /users/:id', { id: '1' }, undefined);

  // @ts-expect-error - GET /health takes no body
  server('GET /health', {}, { id: 1, email: 'a' });
}

/* ---------------------------------------------------------------- runtime */

const handlers: Handlers = {
  'GET /users/:id': (params) => ({ id: Number(params.id), email: `u${params.id}@example.com` }),
  'GET /users/:id/posts/:postId': (params) => `${params.id}/${params.postId}`,
  'POST /users': (_params, body) => body,
  'GET /health': () => 'ok',
};

test('the contract is a plain object at runtime', () => {
  assert.deepEqual(Object.keys(API).sort(), [
    'GET /health', 'GET /users/:id', 'GET /users/:id/posts/:postId', 'POST /users',
  ]);
});

test('createServer dispatches to the right handler', () => {
  const server = createServer(handlers);
  assert.deepEqual(server('GET /users/:id', { id: '7' }, undefined), {
    id: 7, email: 'u7@example.com',
  });
  assert.equal(server('GET /health', {}, undefined), 'ok');
  assert.equal(
    server('GET /users/:id/posts/:postId', { id: '1', postId: '2' }, undefined),
    '1/2',
  );
});

test('createServer passes the body through', () => {
  const server = createServer(handlers);
  assert.deepEqual(server('POST /users', {}, { id: 1, email: 'a@b.c' }), {
    id: 1, email: 'a@b.c',
  });
});

test('createClient parses what the transport returns', () => {
  const transport: Transport = (route) =>
    route === 'GET /health' ? 'ok' : { id: 1, email: 'a@b.c' };
  const client = createClient(transport);
  assert.equal(client('GET /health', {}, undefined), 'ok');
  assert.deepEqual(client('GET /users/:id', { id: '1' }, undefined), { id: 1, email: 'a@b.c' });
});

test('createClient rejects a response that does not match the contract', () => {
  const liar: Transport = () => ({ id: 'not a number', email: 'a@b.c' });
  const client = createClient(liar);
  assert.throws(() => client('GET /users/:id', { id: '1' }, undefined), ContractError);
});

test('createClient rejects a wholly wrong shape', () => {
  const liar: Transport = () => 'a string where a user was promised';
  const client = createClient(liar);
  assert.throws(() => client('GET /users/:id', { id: '1' }, undefined), ContractError);
});

test('the client hands the transport the route and its arguments', () => {
  const seen: unknown[] = [];
  const transport: Transport = (route, params, body) => {
    seen.push(route, params, body);
    return 'ok';
  };
  createClient(transport)('GET /health', {}, undefined);
  assert.deepEqual(seen, ['GET /health', {}, undefined]);
});

test('server and client agree, because they read the same definition', () => {
  const server = createServer(handlers);
  const client = createClient((route, params, body) =>
    server(route as 'GET /users/:id', params as { id: string }, body as undefined));
  assert.deepEqual(client('GET /users/:id', { id: '3' }, undefined), {
    id: 3, email: 'u3@example.com',
  });
});
