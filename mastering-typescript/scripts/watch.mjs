/**
 * Re-runs both green lights whenever a file in a lesson folder changes.
 *
 *   npm run watch                 from inside a lesson folder: just that lesson
 *                                 from the project root: every lesson
 *   npm run watch -- 03-generics  watch one Part or lesson from anywhere
 *
 * Why this exists instead of `tsc --watch` plus `node --test --watch`: two
 * watchers means two half-pictures, and Node's own test watcher tracks the
 * *module graph* of the test files. The moment your solution.ts fails to parse
 * it never loads, drops out of that graph, and stops being watched — you fix
 * the typo and nothing happens, with the output frozen at the error, looking
 * exactly like a dead watcher. This watches the *directory* instead, so a file
 * that cannot parse is still a file it is watching. (`--watch-path` is rejected
 * alongside `--test`, so no flag fixes that.)
 *
 * tsc 7 checks a lesson in well under a tenth of a second, so a cold run per
 * save costs nothing and there is no incremental state to go stale.
 */
import { spawn } from 'node:child_process';
import { watch } from 'node:fs';
import { join } from 'node:path';
import { ROOT, findLessons, inferFilter, dim } from './lib.mjs';

const filter = inferFilter(process.argv[2]);
const lessons = findLessons(filter);

if (lessons.length === 0) {
  console.error(`No lesson matches "${filter}".`);
  process.exit(1);
}

const label = lessons.length === 1 ? lessons[0].name : `${lessons.length} lessons`;

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
  console.log(dim(`${new Date().toLocaleTimeString()} — ${label}\n`));
  child = spawn(process.execPath, [join(ROOT, 'scripts', 'verify.mjs'), filter], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, INIT_CWD: ROOT },   // filter is already explicit
  });
  child.on('exit', () => {
    child = null;
    console.log(dim('watching for changes — ctrl-c to stop'));
    if (queued) {
      queued = false;
      run();
    }
  });
}

const schedule = () => {
  clearTimeout(timer);
  timer = setTimeout(run, 120);   // debounce editor save bursts
};

for (const lesson of lessons) {
  watch(lesson.dir, (_event, file) => {
    if (file && file.endsWith('.ts')) schedule();
  });
}

run();
