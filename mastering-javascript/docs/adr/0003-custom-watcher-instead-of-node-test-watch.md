# `npm run watch` instead of `node --test --watch`

Node's built-in test watcher follows the module graph of the test files. A
`solution.js` that cannot parse never loads, so it drops out of that graph and
stops being watched — you fix the typo and nothing re-runs, with the output
frozen at the error, looking exactly like a dead watcher. Since a syntax error
is the single most common state a lesson is in, `scripts/watch.mjs` watches the
folder instead.

## Consequences

This is a deliberate deviation from the obvious built-in, and the reason is
invisible in the code — the script looks like an unnecessary reimplementation.
It is not; do not replace it with `--test --watch`. (`--watch-path` is rejected
alongside `--test`, so there is no flag that fixes this.)

The script also reads `INIT_CWD` so that `npm run watch` scopes to the lesson
folder it was typed in, npm having already rewritten `cwd` to the package root
by the time the script runs.
