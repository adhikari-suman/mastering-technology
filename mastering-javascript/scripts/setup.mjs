/**
 * Creates a solution.js in every lesson that doesn't have one yet, by copying
 * that lesson's exercise.js.
 *
 * Existing solution.js files are never touched — your work is safe to re-run
 * this over. To reset a single lesson deliberately, copy it yourself:
 *     cp exercise.js solution.js
 *
 * Usage: npm run setup
 */
import { readdirSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const modules = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d\d-/.test(entry.name))
  .map((entry) => entry.name);

let created = 0;
let skipped = 0;

for (const moduleName of modules) {
  for (const lesson of readdirSync(join(root, moduleName))) {
    const exercise = join(root, moduleName, lesson, 'exercise.js');
    const solution = join(root, moduleName, lesson, 'solution.js');
    if (!existsSync(exercise)) continue;
    if (existsSync(solution)) {
      skipped++;
      continue;
    }
    copyFileSync(exercise, solution);
    console.log(`created ${moduleName}/${lesson}/solution.js`);
    created++;
  }
}

console.log(
  created === 0
    ? `Nothing to do — all ${skipped} lessons already have a solution.js.`
    : `Created ${created} file(s); left ${skipped} existing one(s) alone.`,
);
