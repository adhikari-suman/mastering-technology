/**
 * Part 06, Lesson 02 — Module resolution
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`. The two fixture imports must be real — this Lesson is partly
 * about writing import statements that actually resolve.
 */

// TODO: import `greet` from './fixtures/greeter.ts' — a real ES module.
//       Note the extension: `nodenext` requires one, and this project allows
//       `.ts` because nothing is emitted.

// TODO: import the CommonJS fixture at './fixtures/legacy.cjs'. Its types are
//       in legacy.d.cts and use `export =`, so a named import will not work.

/** `greet('ada')` from the ESM fixture. */
export function esmGreeting(name: string): string {
  throw new Error('esmGreeting: not implemented');
}

/** `shout(text)` from the CommonJS fixture. */
export function cjsShout(text: string): string {
  throw new Error('cjsShout: not implemented');
}

/** The two module formats. */
export type Format = 'esm' | 'cjs';

/** What the nearest package.json says. */
export type PackageType = 'module' | 'commonjs';

/**
 * A file's module format.
 *
 *   .mts, .mjs        always 'esm'
 *   .cts, .cjs        always 'cjs'
 *   .ts, .js, .tsx    whatever packageType says
 *   anything else     throws a TypeError naming the extension
 *
 *   formatOf('a.mjs', 'commonjs')  ->  'esm'
 *   formatOf('a.ts', 'module')     ->  'esm'
 *   formatOf('a.ts', 'commonjs')   ->  'cjs'
 */
export function formatOf(filename: string, packageType: PackageType): Format {
  throw new Error('formatOf: not implemented');
}

/** The two resolution modes this Lesson models. */
export type Mode = 'nodenext' | 'bundler';

/**
 * The specifiers a resolver would try, in order, for a relative import.
 *
 * nodenext — the specifier is used as written, and nothing else:
 *   candidatesFor('./a.js', 'nodenext')  ->  ['./a.js']
 *   candidatesFor('./a', 'nodenext')     ->  ['./a']
 *
 * bundler — an extensionless specifier is tried with each extension, then as an
 * index file, in this order: .ts, .tsx, .js, .jsx, /index.ts, /index.js
 *   candidatesFor('./a', 'bundler')
 *     -> ['./a', './a.ts', './a.tsx', './a.js', './a.jsx', './a/index.ts', './a/index.js']
 *
 * A specifier that already has one of those extensions is used as written, in
 * either mode.
 */
export function candidatesFor(specifier: string, mode: Mode): string[] {
  throw new Error('candidatesFor: not implemented');
}

/**
 * The first candidate present in `files`, or `undefined` if none is.
 *
 *   resolveSpecifier('./a', 'bundler', new Set(['./a.ts']))  ->  './a.ts'
 *   resolveSpecifier('./a', 'nodenext', new Set(['./a.ts'])) ->  undefined
 */
export function resolveSpecifier(
  specifier: string,
  mode: Mode,
  files: ReadonlySet<string>,
): string | undefined {
  throw new Error('resolveSpecifier: not implemented');
}
