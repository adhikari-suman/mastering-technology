/**
 * Part 07, Lesson 06 — End-to-end contracts
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`. A very small number of `as` calls are unavoidable where a
 * mapped type meets a runtime lookup — keep them at the seams, not in the API.
 *
 * This Lesson assembles Parts 03 and 04. Reach back for the pieces.
 */

/** A parser, as in Lesson 02: unknown in, `T` out, throwing on mismatch. */
export type Parser<T> = (value: unknown) => T;

/** What a parser produces. */
export type Infer<P> = unknown; // TODO

/** Thrown when a response does not match its parser. */
export class ContractError extends Error {
  override readonly name = 'ContractError';
}

/* -------------------------------------------------------------- the parsers */

export const asNumber: Parser<number> = (value) => {
  if (typeof value !== 'number') throw new ContractError('expected number');
  return value;
};

export const asString: Parser<string> = (value) => {
  if (typeof value !== 'string') throw new ContractError('expected string');
  return value;
};

export const asUser: Parser<{ id: number; email: string }> = (value) => {
  if (typeof value !== 'object' || value === null) throw new ContractError('expected object');
  const record = value as Record<string, unknown>;
  return { id: asNumber(record['id']), email: asString(record['email']) };
};

/* ------------------------------------------------------------ the contract */

/**
 * One route: a response parser, and optionally a body parser.
 */
export type Route = {
  readonly response: Parser<unknown>;
  readonly body?: Parser<unknown>;
};

/**
 * The single definition. Both sides derive everything from this.
 *
 * TODO: give it `as const satisfies Record<string, Route>` so the keys stay
 * literal AND every entry is checked.
 */
export const API = {
  'GET /users/:id': { response: asUser },
  'GET /users/:id/posts/:postId': { response: asString },
  'POST /users': { response: asUser, body: asUser },
  'GET /health': { response: asString },
};

/** Every legal route string. */
export type RouteName = unknown; // TODO — derive it from API

/**
 * The path parameters of a route, as an object of strings.
 *
 *   ParamsOf<'GET /users/:id'>  ->  { id: string }
 *   ParamsOf<'GET /health'>     ->  {}
 *
 * Reuse the approach from Part 04 Lesson 05.
 */
export type ParamsOf<R extends string> = unknown; // TODO

/** What a route responds with. */
export type ResponseOf<R extends RouteName> = unknown; // TODO

/** What a route accepts as a body, or `undefined` when it takes none. */
export type BodyOf<R extends RouteName> = unknown; // TODO

/* --------------------------------------------------------------- the server */

/**
 * The server side of one route: takes the params and the body, returns the
 * response. Both fully derived.
 */
export type Handler<R extends RouteName> = unknown; // TODO

/** Every route must have a handler, and each must have the right signature. */
export type Handlers = unknown; // TODO — a Record from RouteName to Handler

/**
 * The caller's view: a GENERIC function taking a route, its params and its
 * body, and returning that route's response. Every argument type follows from
 * the route string.
 *
 *   <R extends RouteName>(route: R, params: ParamsOf<R>, body: BodyOf<R>) => ResponseOf<R>
 *
 * It is a TODO rather than given, because writing it is where the three derived
 * types above come together.
 */
export type Server = unknown; // TODO

export function createServer(handlers: Handlers): Server {
  throw new Error('createServer: not implemented');
}

/* --------------------------------------------------------------- the client */

/**
 * Build a client over a transport. The transport is handed the route and the
 * arguments and returns an unknown — everything on the wire is unknown, per
 * Lesson 01 — and the client PARSES it before handing it back.
 *
 * A response that does not parse throws the parser's ContractError.
 */
export type Transport = (route: string, params: unknown, body: unknown) => unknown;

export function createClient(transport: Transport): Server {
  throw new Error('createClient: not implemented');
}
