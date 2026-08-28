# 06 — End-to-end contracts

Everything in Part 07 so far has been about one boundary. This is about making a
boundary have only *one* definition, so a client and a server cannot disagree.

## The problem

```ts
// server
app.get('/users/:id', (req, res) => res.json({ id, email }));

// client
const user = await fetch(`/users/${id}`).then(r => r.json()) as User;
```

Three separate claims — the route string, the response shape, the client's
`as` — and nothing relates them. Rename a field on the server and the client
compiles perfectly and breaks in production.

## One definition, everything derived

Define the routes as a **value**, and let both sides read their types from it:

```ts
const api = {
  'GET /users/:id': { response: userParser },
  'POST /users':    { body: newUserParser, response: userParser },
} as const;
```

From that single object you can derive:

- the legal route strings (`keyof typeof api`)
- the path parameters of each (`PathParams` from Part 04 Lesson 05)
- the request body type (`Infer` from Lesson 02)
- the response type

This is what tRPC, ts-rest and every typed-API library does. The machinery is
the whole of Parts 03 and 04, applied at once.

## Where each piece comes from

| Piece | Lesson |
| --- | --- |
| Route strings parsed into params | 04-05, template literal types |
| Schema → type | 07-02, `Infer` |
| Only-valid-routes | 01-02, `as const` + `keyof` |
| The handler map is exhaustive | 02-05, `satisfies` |
| Per-route argument types | 03-01, `keyof` + indexed access |

If you can build this, the type system has stopped being a thing you satisfy and
started being a thing you compute with.

## The honest limit

**None of this checks the wire.** A derived client type is a claim about what
the server sends, and the server is a different process that may be a different
version. The types guarantee the client and the *definition* agree — which is
enormously valuable and is not the same as guaranteeing the response is right.

Which is why the definition holds parsers, not just types: the response is
*parsed* on arrival, so a stale server produces a clear boundary error instead
of a `TypeError` three components deep. Types for the developer, parsers for the
runtime, one definition for both.

## What to build

| Export | What it is |
| --- | --- |
| `Handler<R>` | The server side of one route, fully typed |
| `RouteName` | The legal route strings |
| `ParamsOf<R>` / `BodyOf<R>` / `ResponseOf<R>` | Derived per route |
| `createServer` | Takes a handler map, checked for exhaustiveness |
| `createClient` | Takes the same definition, returns a typed caller |

## Running it

```bash
cp exercise.ts solution.ts   # once
npm run watch
```

## Going deeper

1. Add a route to `API` and don't add a handler. Where does the error land, and
   is that where you would want it?
2. `createClient` returns a function whose argument type depends on the route
   string passed. Which mechanism makes that possible — overloads, generics, or
   a mapped type? Could all three work?
3. The client parses the response. What should it do when parsing fails — throw,
   or return a `Result`? Does the answer differ for a CLI and a UI?
4. This models one process talking to itself. What breaks first when the server
   is deployed separately, and what would you add to catch it?
