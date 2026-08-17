/**
 * Lesson 03 — Control Flow
 *
 * Write these with explicit loops and branches. Array methods come in lesson 05.
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * Run `node --test --watch` from inside this folder.
 */

/**
 * Classic FizzBuzz, returned as an array of strings for numbers 1..n.
 * Multiples of 3 -> 'Fizz', of 5 -> 'Buzz', of both -> 'FizzBuzz',
 * everything else -> the number as a string.
 *
 * fizzbuzz(5) -> ['1', '2', 'Fizz', '4', 'Buzz']
 */
export function fizzbuzz(n) {
  // TODO: mind the order — check 15 before 3 and 5
  throw new Error('fizzbuzz: not implemented');
}

/**
 * Letter grade from a score out of 100.
 * 90+ 'A', 80+ 'B', 70+ 'C', 60+ 'D', below that 'F'.
 * Out of range (< 0 or > 100) -> null.
 *
 * Write this with guard clauses. No else, no nesting.
 */
export function grade(score) {
  // TODO
  throw new Error('grade: not implemented');
}

/**
 * 'weekend' for 'sat'/'sun', 'weekday' for the other five, null for anything
 * else. Use a switch, and use deliberate fall-through for the shared cases.
 */
export function dayType(day) {
  // TODO
  throw new Error('dayType: not implemented');
}

/**
 * Sum only the even numbers. Use a loop with `continue` to skip odd ones.
 *
 * sumEven([1, 2, 3, 4]) -> 6
 * sumEven([])           -> 0
 */
export function sumEven(numbers) {
  // TODO
  throw new Error('sumEven: not implemented');
}

/**
 * Index of the first negative number, or -1 if there isn't one.
 * Use `break` — stop looking the moment you find it.
 */
export function firstNegativeIndex(numbers) {
  // TODO
  throw new Error('firstNegativeIndex: not implemented');
}

/**
 * Count down from n to 1, as an array. Use a `while` loop.
 * n < 1 -> []
 *
 * countdown(3) -> [3, 2, 1]
 */
export function countdown(n) {
  // TODO
  throw new Error('countdown: not implemented');
}

/**
 * Repeatedly halve n (integer division, discarding remainders) until it
 * reaches 1, and return how many halvings that took.
 *
 * halvingSteps(1)  -> 0
 * halvingSteps(8)  -> 3     (8 -> 4 -> 2 -> 1)
 * halvingSteps(10) -> 3     (10 -> 5 -> 2 -> 1)
 */
export function halvingSteps(n) {
  // TODO: Math.floor is your friend
  throw new Error('halvingSteps: not implemented');
}
