/**
 * The two green lights.
 *
 *   npm test                  both, for whatever you're scoped to
 *   npm run types             the checker only
 *   npm run run-tests         the runtime tests only
 *
 * TypeScript splits a passing lesson in two, and this is the script that makes
 * the split visible:
 *
 *   TYPES    `tsc --noEmit` — the type tests, and the annotations themselves
 *   RUNTIME  `node --test`  — the behaviour, with the types stripped away
 *
 * They fail independently, and the gap between them is the whole subject. Node
 * erases types without checking them, so a lesson can be green on RUNTIME and
 * red on TYPES: your code does the right thing and your types describe a
 * different program. The reverse happens too. Neither light alone means done.
 *
 * Lessons you have not started are skipped rather than reported as failures —
 * a missing solution.ts is not a red test, it is a lesson you haven't opened.
 */
import { spawnSync } from 'node:child_process';
import { writeFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, findLessons, inferFilter, stateOf, testFilesOf, dim, red, green, bold } from './lib.mjs';

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const filter = inferFilter(argv.find((a) => !a.startsWith('--')));

const wantTypes = !flags.has('--tests');
const wantTests = !flags.has('--types');

const lessons = findLessons(filter);
if (lessons.length === 0) {
  console.error(filter ? `No lesson matches "${filter}".` : 'No lessons found.');
  process.exit(1);
}

const ready = lessons.filter((l) => stateOf(l) !== 'missing');
const missing = lessons.filter((l) => stateOf(l) === 'missing');

if (ready.length === 0) {
  console.log(`Nothing to verify — no solution.ts in ${lessons.length} matching lesson(s).`);
  console.log(dim(`Make one first:  cp exercise.ts solution.ts    (or: npm run setup)`));
  process.exit(1);
}

const results = [];

// ---------------------------------------------------------------- TYPES
// tsc is driven by a tsconfig, not by a file list, so scope it with a generated
// one that extends the real config and narrows `include` to the lessons in
// play. It is written to the package root so its relative paths resolve, and
// removed on the way out.
if (wantTypes) {
  const scopeFile = join(ROOT, '.tsconfig.scope.json');
  const include = ready.map((l) => `${relative(ROOT, l.dir).replaceAll('\\', '/')}/**/*.ts`);
  writeFileSync(
    scopeFile,
    JSON.stringify({ extends: './tsconfig.json', include: [...include, 'type-tests.ts'] }, null, 2),
  );
  try {
    const tsc = spawnSync(
      process.execPath,
      [join(ROOT, 'node_modules', 'typescript', 'lib', 'tsc.js'), '--noEmit', '-p', scopeFile],
      { cwd: ROOT, stdio: 'inherit' },
    );
    if (tsc.error?.code === 'ENOENT' || tsc.status === null) {
      console.error(red('Could not run tsc.') + ' Install it first:  npm install');
      process.exit(1);
    }
    results.push(['TYPES  ', tsc.status === 0]);
  } finally {
    rmSync(scopeFile, { force: true });
  }
}

// -------------------------------------------------------------- RUNTIME
// Node runs the .ts files directly by stripping the types — no build step, and
// no checking either. That is the point.
if (wantTests) {
  if (wantTypes) console.log();
  // `node --test` with no arguments discovers every test file under the cwd,
  // which would ignore the scope entirely and drag in Lessons that have no
  // solution.ts. One Lesson runs from its own folder for short paths; anything
  // wider is given the file list explicitly.
  const single = ready.length === 1;
  const args = single ? ['--test'] : ['--test', ...ready.flatMap(testFilesOf)];
  const test = spawnSync(process.execPath, args, {
    cwd: single ? ready[0].dir : ROOT,
    stdio: 'inherit',
  });
  results.push(['RUNTIME', test.status === 0]);
}

// --------------------------------------------------------------- REPORT
console.log();
console.log(dim('─'.repeat(52)));
for (const [label, ok] of results) {
  console.log(`  ${bold(label)}   ${ok ? green('pass') : red('FAIL')}`);
}
const scope = filter || 'all lessons';
console.log(dim(`  scope: ${scope} — ${ready.length} lesson(s) checked`));
if (missing.length > 0) {
  console.log(dim(`  skipped ${missing.length} not begun (cp exercise.ts solution.ts)`));
}
console.log(dim('─'.repeat(52)));

process.exit(results.every(([, ok]) => ok) ? 0 : 1);
