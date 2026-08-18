/**
 * Re-runs `node --test` whenever a file in a lesson folder changes.
 *
 *   npm run watch                 from inside a lesson folder: just that lesson
 *                                 from the project root: every lesson
 *   npm run watch -- 03-control   watch one lesson from anywhere
 *
 * Why this exists instead of `node --test --watch`: Node's own watcher tracks
 * the *module graph* of the test files. The moment your solution.js fails to
 * parse — a stray `const x;`, an unclosed brace — it never loads, so it drops
 * out of that graph and the watcher stops watching it. You fix the typo and
 * nothing happens; the run you're staring at is frozen at the error. (Verified
 * on Node 24; `--watch-path` is rejected alongside `--test`.)
 *
 * This watches the *directory* instead, so a file that cannot parse is still a
 * file it is watching.
 */
import { readdirSync, existsSync, watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Scope: an explicit argument wins. Failing that, if you ran this from inside
 * a lesson folder, watch that lesson — `npm run watch` with no argument should
 * do the obvious thing. npm rewrites cwd to the package root before running a
 * script, but leaves the directory you actually typed it in as INIT_CWD.
 */
function inferFilter() {
  if (process.argv[2]) return process.argv[2];
  const from = process.env.INIT_CWD ?? process.cwd();
  const rel = relative(ROOT, from);
  if (!rel || rel.startsWith('..')) return '';          // outside the project
  const [part, lesson] = rel.split(sep);
  return lesson ? `${part}/${lesson}` : '';
}

const filter = inferFilter();

const lessons = [];
for (const part of readdirSync(ROOT, { withFileTypes: true })
  .filter((e) => e.isDirectory() && /^\d\d-/.test(e.name))
  .map((e) => e.name)
  .sort()) {
  for (const lesson of readdirSync(join(ROOT, part)).sort()) {
    if (!existsSync(join(ROOT, part, lesson, 'exercise.js'))) continue;
    const name = `${part}/${lesson}`;
    if (name.includes(filter)) lessons.push({ name, dir: join(ROOT, part, lesson) });
  }
}

if (lessons.length === 0) {
  console.error(`No lesson matches "${filter}".`);
  process.exit(1);
}

// One lesson -> run just that folder. Otherwise run the whole suite from root.
const single = lessons.length === 1;
const cwd = single ? lessons[0].dir : ROOT;

let child = null;
let queued = false;
let timer = null;

function run() {
  if (child) {
    // A run is already in flight; remember to go again once it exits.
    queued = true;
    child.kill('SIGTERM');
    return;
  }
  console.clear();
  console.log(`\x1b[2m${new Date().toLocaleTimeString()} — ${single ? lessons[0].name : `${lessons.length} lessons`}\x1b[0m\n`);
  child = spawn(process.execPath, ['--test'], { cwd, stdio: 'inherit' });
  child.on('exit', () => {
    child = null;
    console.log(`\n\x1b[2mwatching for changes — ctrl-c to stop\x1b[0m`);
    if (queued) {
      queued = false;
      run();
    }
  });
}

const schedule = () => {
  clearTimeout(timer);
  timer = setTimeout(run, 120); // debounce editor save bursts
};

for (const lesson of lessons) {
  watch(lesson.dir, (_event, file) => {
    if (file && file.endsWith('.js')) schedule();
  });
}

run();
