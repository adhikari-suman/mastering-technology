# Closures and higher-order functions are taught twice, on purpose

Lesson 04 (Functions) introduces higher-order functions and closures under a
heading called "A first taste of closures", and Part 02 covers both again in
depth. The repetition is a spiral, not an oversight: the first pass builds
enough intuition to use them, and the second returns with memoisation, the
module pattern, loop-variable capture and stale closures, which are not
teachable before the basic shape is fluent.

## Consequences

The overlap will look like duplicated scope to anyone auditing the roadmap, and
the obvious "fix" is to cut closures from Part 02. Don't. If Part 02's coverage
is ever trimmed, trim the re-explanation and keep the harder applications.
