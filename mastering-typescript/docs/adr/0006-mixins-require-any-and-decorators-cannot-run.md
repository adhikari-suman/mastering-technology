# Two places the language overrules this project's rules

## Status

Accepted

## Context

ADR 0002 keeps the dependency list to two, and the Lessons carry a standing
no-`any` rule. Writing Part 05 turned up two cases where those rules cannot be
kept, and where pretending otherwise would have taught something false.

## Mixins require `any[]`

`erasableSyntaxOnly` and the no-`any` rule between them suggested
`type Ctor<T> = new (...args: never[]) => T` for the mixin constraint. The
compiler rejects it by name:

```
error TS2545: A mixin class must have a constructor with a single rest
              parameter of type 'any[]'.
```

There is a dedicated rule for mixin classes and it names `any[]`. `never[]`
makes `super(...args)` illegal; `unknown[]` makes every forwarded argument an
error at the call.

**Decision:** Part 05 Lesson 06 uses `any[]`, confined to the one type alias,
and the Lesson says why — including that this is the compiler's decision rather
than a style choice. The first draft used `never[]`, forced `Entity` to take no
constructor arguments, and taught a limitation that does not exist.

## Decorators cannot run on any Node

No released Node executes decorator syntax. V8 carries `--js-decorators` marked
*in progress*; on Node 26.8.1 it still fails to parse `@name`, in plain
JavaScript as well as after type stripping. `tsc` accepts decorators, so a file
containing one type-checks and will not load.

**Decision:** Part 05 Lesson 05 teaches decorators as what they are — functions
taking `(value, context)`. The learner writes and types those functions; the
runtime tests apply them by hand, which is what `@` compiles to; and
`fixtures/decorated.ts` carries real `@` syntax that `tsc` checks and Node never
sees, reached from the test file with `import type` so it erases completely.

## Consequences

The fixture is load-bearing and looks like dead code. It is the only place the
decorator syntax appears, and it is what proves the signatures preserve a
decorated method's type. Do not delete it, and do not import it for its values.

If a future Node ships decorators, Lesson 05 can gain a runtime half — but the
manual-application tests should stay, because applying a decorator by hand is a
better model of what the syntax does than watching it work.
