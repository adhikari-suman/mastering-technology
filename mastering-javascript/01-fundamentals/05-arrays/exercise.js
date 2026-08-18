/**
 * Lesson 05 — Arrays
 *
 * Prefer array methods over manual loops here.
 *
 * None of these may mutate their arguments.
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp exercise.js solution.js
 *
 * Then write your answers in solution.js, deleting each `throw` as you go.
 * Then run `npm run watch -- 05-arrays` from the repo root.
 */

/**
 * doubleAll([1, 2, 3]) -> [2, 4, 6]
 */
export function doubleAll(numbers) {
  // TODO: map
  throw new Error('doubleAll: not implemented');
}

/**
 * evensOnly([1, 2, 3, 4]) -> [2, 4]
 */
export function evensOnly(numbers) {
  // TODO: filter
  throw new Error('evensOnly: not implemented');
}

/**
 * total([1, 2, 3]) -> 6
 * total([])        -> 0
 */
export function total(numbers) {
  // TODO: reduce — and don't forget the initial value
  throw new Error('total: not implemented');
}

/**
 * Find a user by id. Return undefined if there is no match.
 *
 * findUser([{ id: 1, name: 'Ada' }], 1) -> { id: 1, name: 'Ada' }
 */
export function findUser(users, id) {
  // TODO: find
  throw new Error('findUser: not implemented');
}

/**
 * Return a NEW array sorted by age, youngest first.
 * The input array must not be reordered.
 */
export function sortByAge(users) {
  // TODO: copy before you sort (or use toSorted)
  throw new Error('sortByAge: not implemented');
}

/**
 * The names of every user, as an array of strings.
 *
 * names([{ name: 'Ada' }, { name: 'Grace' }]) -> ['Ada', 'Grace']
 */
export function names(users) {
  // TODO
  throw new Error('names: not implemented');
}

/**
 * merge([1, 2], [3]) -> [1, 2, 3], without mutating either input.
 */
export function merge(a, b) {
  // TODO: spread
  throw new Error('merge: not implemented');
}

/**
 * Split into { first, rest } using array destructuring.
 *
 * firstAndRest([1, 2, 3]) -> { first: 1, rest: [2, 3] }
 * firstAndRest([])        -> { first: undefined, rest: [] }
 */
export function firstAndRest(items) {
  // TODO
  throw new Error('firstAndRest: not implemented');
}

/**
 * Are all the numbers positive? An empty array counts as true.
 */
export function allPositive(numbers) {
  // TODO: every
  throw new Error('allPositive: not implemented');
}

/**
 * Split an array into chunks of at most `size`. The last chunk may be shorter.
 * A loop is fine — arguably clearer — here.
 *
 * chunk([1, 2, 3, 4, 5], 2) -> [[1, 2], [3, 4], [5]]
 * chunk([], 3)              -> []
 */
export function chunk(items, size) {
  // TODO
  throw new Error('chunk: not implemented');
}

/**
 * Count how many times each value appears.
 *
 * tally(['a', 'b', 'a']) -> { a: 2, b: 1 }
 * tally([])              -> {}
 */
export function tally(items) {
  // TODO: reduce into an object
  throw new Error('tally: not implemented');
}
