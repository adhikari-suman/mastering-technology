/**
 * Bulk management of the solution.js files you work in.
 *
 *   npm run setup             create solution.js wherever it's missing
 *   npm run status            show which lessons are started / untouched / missing
 *   npm run reset             restore solution.js from exercise.js  (destructive)
 *   npm run clean             delete solution.js                     (destructive)
 *
 * All four take an optional filter that substring-matches the lesson path, so
 * you can act on one lesson or one module instead of everything:
 *
 *   npm run reset -- 03-control
 *   npm run clean -- 01-fundamentals
 *
 * `reset` and `clean` throw away work, so they refuse to touch any solution.js
 * that differs from its exercise.js until you pass --yes. Untouched copies —
 * ones still byte-identical to the stubs — are removed without ceremony, since
 * there's nothing in them to lose.
 */
import { readdirSync, existsSync, copyFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COMMANDS = new Set(['setup', 'status', 'reset', 'clean']);

const args = process.argv.slice(2);
const yes = args.includes('--yes');
const positional = args.filter((a) => !a.startsWith('--'));
const command = COMMANDS.has(positional[0]) ? positional[0] : 'setup';
const filter = (COMMANDS.has(positional[0]) ? positional[1] : positional[0]) ?? '';

/** Every lesson folder that ships an exercise.js, as { name, exercise, solution }. */
function findLessons() {
  const lessons = [];
  const modules = readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d\d-/.test(e.name))
    .map((e) => e.name)
    .sort();

  for (const mod of modules) {
    for (const lesson of readdirSync(join(ROOT, mod)).sort()) {
      const exercise = join(ROOT, mod, lesson, 'exercise.js');
      if (!existsSync(exercise)) continue;
      lessons.push({
        name: `${mod}/${lesson}`,
        exercise,
        solution: join(ROOT, mod, lesson, 'solution.js'),
      });
    }
  }
  return lessons.filter((l) => l.name.includes(filter));
}

/** 'missing' | 'untouched' (identical to the stubs) | 'started'. */
function stateOf(lesson) {
  if (!existsSync(lesson.solution)) return 'missing';
  const same =
    readFileSync(lesson.solution, 'utf8') === readFileSync(lesson.exercise, 'utf8');
  return same ? 'untouched' : 'started';
}

const lessons = findLessons();

if (lessons.length === 0) {
  console.error(filter ? `No lesson matches "${filter}".` : 'No lessons found.');
  process.exit(1);
}

if (command === 'status') {
  const label = { missing: 'no solution.js', untouched: 'untouched copy', started: 'started' };
  const width = Math.max(...lessons.map((l) => l.name.length));
  for (const lesson of lessons) {
    const state = stateOf(lesson);
    const mark = { missing: ' ', untouched: ' ', started: '*' }[state];
    console.log(`${mark} ${lesson.name.padEnd(width)}  ${label[state]}`);
  }
  const started = lessons.filter((l) => stateOf(l) === 'started').length;
  console.log(`\n${started} of ${lessons.length} lesson(s) started.`);
  console.log('Run the tests to see how far along each one is.');
  process.exit(0);
}

if (command === 'setup') {
  let created = 0;
  for (const lesson of lessons) {
    if (stateOf(lesson) !== 'missing') continue;
    copyFileSync(lesson.exercise, lesson.solution);
    console.log(`created ${lesson.name}/solution.js`);
    created++;
  }
  console.log(
    created === 0
      ? `Nothing to do — all ${lessons.length} matching lesson(s) already have a solution.js.`
      : `Created ${created} file(s).`,
  );
  process.exit(0);
}

// reset and clean: destructive, so anything with work in it needs --yes.
const targets = lessons.filter((l) => stateOf(l) !== 'missing');
const withWork = targets.filter((l) => stateOf(l) === 'started');

if (targets.length === 0) {
  console.log('Nothing to do — no solution.js files match.');
  process.exit(0);
}

if (withWork.length > 0 && !yes) {
  const verb = command === 'reset' ? 'overwrite' : 'delete';
  console.error(`Refusing to ${verb} ${withWork.length} solution.js file(s) containing your work:\n`);
  for (const lesson of withWork) console.error(`    ${lesson.name}/solution.js`);
  console.error(`\nRe-run with --yes if you mean it:\n    npm run ${command} --${filter ? ` ${filter}` : ''} --yes`);
  console.error('\n(If these are committed, `git checkout` brings them back afterwards.)');
  process.exit(1);
}

let touched = 0;
for (const lesson of targets) {
  if (command === 'reset') copyFileSync(lesson.exercise, lesson.solution);
  else rmSync(lesson.solution);
  console.log(`${command === 'reset' ? 'reset' : 'deleted'} ${lesson.name}/solution.js`);
  touched++;
}
console.log(`\n${command === 'reset' ? 'Reset' : 'Deleted'} ${touched} file(s).`);
