// Records that it was evaluated, so tests can prove laziness.
globalThis.__heavyLoadCount = (globalThis.__heavyLoadCount ?? 0) + 1;
export const name = 'heavy';
export default function work(n) { return n * 100; }
