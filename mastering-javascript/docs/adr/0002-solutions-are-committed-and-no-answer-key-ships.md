# Solutions are committed; the scaffold ships no answer key

`exercise.js` contains only stubs, and the worked `solution.js` files are
committed to a public repository. This repo is a learning journal, not a course
to hand out: the solutions are the only part of it that is not regenerable, they
record progress over time, and having them tracked means `git checkout` can undo
a `reset` or `clean` that was not meant.

## Considered options

Gitignoring `solution.js` and shipping a clean template others could work
through. Rejected because it optimises for an audience that does not exist, at
the cost of the history that makes the repo worth keeping. The trade-off is
real and one-directional: the answers are public, so anyone doing these lessons
can read them before trying, which only cheats themselves.

## Consequences

`exercise.js` must never gain a worked implementation, or the reset point is
destroyed. Rule 4 in the README states this; it is a constraint on every future
lesson, not a description of the current ones.
