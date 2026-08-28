# 06 — Capstone: a typed router

Every Part, in one file.

```ts
const router = new Router()
  .get('/users/:id', (req) => `user ${req.params.id}`)
  .get('/users/:id/posts/:postId', (req) => `${req.params.id}/${req.params.postId}`)
  .post('/users', (req) => 'created');

router.handle('GET', '/users/42');   // { ok: true, value: 'user 42' }
```

`req.params.id` is `string`. `req.params.nope` is a compile error. Nobody wrote
a type for the parameters — the path string *is* the type, parsed by the
compiler.

## What goes into it

| Piece | From |
| --- | --- |
| `:id` in a path string → a union of names | 04-05, template literal types |
| That union → a params object | 04-04, mapped types |
| The handler's argument typed from the path | 03-01, generics |
| The path literal surviving inference | 01-02, `const` type parameters |
| A chainable builder that survives extension | 05-04, `this` types |
| Success or failure as a value | 07-04, `Result` |
| Exhaustive method dispatch | 02-05, `never` |
| A response that must be parsed, not asserted | 07-01, no `as` at the boundary |

Nothing here is new. That is the point — a capstone should be assembly, not a
new idea.

## The two hard parts

**Keeping the path literal.** `router.get('/users/:id', ...)` must infer `P` as
`'/users/:id'`, not `string`. A bare `<P extends string>` does it, because
constraining to a primitive stops widening (Part 03 Lesson 02). Get this wrong
and `Params<string>` is `{ [x: string]: string }` and every handler silently
takes an index signature.

**Matching at runtime.** The types say what a path *means*; the router still has
to find it. Static segments must beat dynamic ones — `/users/new` should reach
the literal route, not `/users/:id` — which is a sort, not a scan.

## Scope

No middleware, no async, no wildcards. Those are all worth adding afterwards,
and none of them teach anything the rest of this curriculum hasn't.

## What to build

| Export | What it is |
| --- | --- |
| `Method` | The four verbs |
| `ParamName<P>` / `Params<P>` | Path string → parameter object |
| `Request<P>` | Method, path, typed params, query |
| `Handler<P, R>` | What a route does |
| `Result<T>` | Success or a typed failure |
| `Router` | `get`/`post`/`put`/`delete`, chainable, and `handle` |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## When it's green

You have written, from scratch: a parser combinator library, every utility type
in `lib.es5.d.ts`, a promise-aware retry, a mixin system, a module resolver, a
type-level string parser, and this. There is not much left in the language that
is a black box.

## Going deeper

1. Add a wildcard segment `/files/*path` capturing the rest. What changes in
   `ParamName`, and what changes in the match ordering?
2. Make `Router` generic over the routes registered so far, so `handle` only
   accepts a path that exists. What does that cost the caller?
3. Add async handlers. Where does `Awaited` go, and does `handle`'s signature
   have to change for everyone?
4. The router returns `Result`. Should a 404 be an error at all? Argue both
   sides, then decide what you'd ship.
