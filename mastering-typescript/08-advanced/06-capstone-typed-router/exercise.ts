/**
 * Part 08, Lesson 06 — Capstone: a typed router
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`. Keep `as` to the seams where a mapped type meets a runtime
 * lookup — there should be one or two, and you should be able to say why.
 *
 * Everything here has appeared before. If a piece is unfamiliar, the README
 * says which Lesson it came from.
 */

/** The verbs this router knows. */
export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * The parameter names in a path, as a union.
 *
 *   ParamName<'/users/:id'>               -> 'id'
 *   ParamName<'/users/:id/posts/:postId'> -> 'id' | 'postId'
 *   ParamName<'/health'>                  -> never
 *
 * Part 04 Lesson 05.
 */
export type ParamName<P extends string> = unknown; // TODO

/**
 * Those names as an object of strings.
 *
 *   Params<'/users/:id'>  ->  { id: string }
 *   Params<'/health'>     ->  {}
 */
export type Params<P extends string> = unknown; // TODO

/** What a handler is given. */
export type Request<P extends string> = {
  readonly method: Method;
  readonly path: string;
  readonly params: Params<P>;
  readonly query: Readonly<Record<string, string>>;
};

/** What a route does. */
export type Handler<P extends string, R> = (request: Request<P>) => R;

/** Why a request could not be served. */
export type RouteError =
  | { readonly kind: 'notFound'; readonly path: string }
  | { readonly kind: 'methodNotAllowed'; readonly path: string; readonly allowed: Method[] };

/** Success or failure, as a value. Part 07 Lesson 04. */
export type Result<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: RouteError };

/**
 * The router.
 *
 *   .get(path, handler)   register — and the same for post, put, delete
 *   .handle(method, url)  match and run, or report why not
 *
 * Registration must:
 *   - keep the path LITERAL, so the handler's params are typed from it
 *   - return `this`, so the chain survives a subclass (Part 05 Lesson 04)
 *
 * `handle` must:
 *   - split a url into its path and its query string
 *   - prefer a STATIC segment over a dynamic one, so '/users/new' reaches the
 *     literal route rather than '/users/:id'
 *   - report 'methodNotAllowed' (with the methods that ARE allowed, in
 *     registration order) when the path matches but the verb does not
 *   - report 'notFound' when nothing matches
 *   - return whatever the handler returned
 */
export class Router {
  // TODO

  get<P extends string, R>(path: P, handler: Handler<P, R>): this {
    throw new Error('Router#get: not implemented');
  }

  post<P extends string, R>(path: P, handler: Handler<P, R>): this {
    throw new Error('Router#post: not implemented');
  }

  put<P extends string, R>(path: P, handler: Handler<P, R>): this {
    throw new Error('Router#put: not implemented');
  }

  delete<P extends string, R>(path: P, handler: Handler<P, R>): this {
    throw new Error('Router#delete: not implemented');
  }

  /** Every registered route, as `${METHOD} ${path}`, in registration order. */
  routes(): string[] {
    throw new Error('Router#routes: not implemented');
  }

  handle(method: Method, url: string): Result<unknown> {
    throw new Error('Router#handle: not implemented');
  }
}
