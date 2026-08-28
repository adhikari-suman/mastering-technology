/**
 * Shared plumbing for the three scripts: where the lessons are, which ones you
 * meant, and what state each is in.
 */
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Scope: an explicit argument wins. Failing that, if you ran this from inside a
 * Part or a lesson folder, act only on that — `npm run watch` in one lesson
 * should not watch all forty-eight. npm rewrites cwd to the package root before
 * running a script, but leaves the directory you actually typed it in as
 * INIT_CWD.
 */
export function inferFilter(explicit) {
  if (explicit) return explicit;
  const from = process.env.INIT_CWD ?? process.cwd();
  const rel = relative(ROOT, from);
  if (!rel || rel.startsWith('..')) return '';          // at or outside the root
  const [part, lesson] = rel.split(sep);
  return lesson ? `${part}/${lesson}` : part;
}

/** Every lesson folder shipping an exercise.ts, as { name, dir, exercise, solution }. */
export function findLessons(filter = '') {
  const lessons = [];
  const parts = readdirSync(ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d\d-/.test(e.name))
    .map((e) => e.name)
    .sort();

  for (const part of parts) {
    for (const lesson of readdirSync(join(ROOT, part)).sort()) {
      const dir = join(ROOT, part, lesson);
      const exercise = join(dir, 'exercise.ts');
      if (!existsSync(exercise)) continue;
      lessons.push({
        name: `${part}/${lesson}`,
        dir,
        exercise,
        solution: join(dir, 'solution.ts'),
      });
    }
  }
  return lessons.filter((l) => l.name.includes(filter));
}

/** Every *.test.ts in a Lesson folder, as absolute paths. */
export function testFilesOf(lesson) {
  return readdirSync(lesson.dir)
    .filter((f) => f.endsWith('.test.ts'))
    .sort()
    .map((f) => join(lesson.dir, f));
}

/** 'missing' | 'untouched' (identical to the stubs) | 'started'. */
export function stateOf(lesson) {
  if (!existsSync(lesson.solution)) return 'missing';
  const same =
    readFileSync(lesson.solution, 'utf8') === readFileSync(lesson.exercise, 'utf8');
  return same ? 'untouched' : 'started';
}

export const dim = (s) => `\x1b[2m${s}\x1b[0m`;
export const red = (s) => `\x1b[31m${s}\x1b[0m`;
export const green = (s) => `\x1b[32m${s}\x1b[0m`;
export const bold = (s) => `\x1b[1m${s}\x1b[0m`;
