/**
 * doubleAll([1, 2, 3]) -> [2, 4, 6]
 */
export function doubleAll(numbers) {
  return numbers.map((n) => n * 2);
}

/**
 * evensOnly([1, 2, 3, 4]) -> [2, 4]
 */
export function evensOnly(numbers) {
  return numbers.filter((n) => n % 2 === 0);
}

/**
 * total([1, 2, 3]) -> 6
 * total([])        -> 0
 */
export function total(numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

/**
 * Find a user by id. Return undefined if there is no match.
 *
 * findUser([{ id: 1, name: 'Ada' }], 1) -> { id: 1, name: 'Ada' }
 */
export function findUser(users, id) {
  return users.find((user) => user.id === id);
}

/**
 * Return a NEW array sorted by age, youngest first.
 * The input array must not be reordered.
 */
export function sortByAge(users) {
  return [...users].sort((userA, userB) => userA.age - userB.age);
}

/**
 * The names of every user, as an array of strings.
 *
 * names([{ name: 'Ada' }, { name: 'Grace' }]) -> ['Ada', 'Grace']
 */
export function names(users) {
  return users.map((user) => user.name);
}

/**
 * merge([1, 2], [3]) -> [1, 2, 3], without mutating either input.
 */
export function merge(a, b) {
  return [...a, ...b];
}

/**
 * Split into { first, rest } using array destructuring.
 *
 * firstAndRest([1, 2, 3]) -> { first: 1, rest: [2, 3] }
 * firstAndRest([])        -> { first: undefined, rest: [] }
 */
export function firstAndRest(items) {
  const [first, ...rest] = items;

  return { first, rest };
}

/**
 * Are all the numbers positive? An empty array counts as true.
 */
export function allPositive(numbers) {
  return numbers.every((n) => n > 0);
}

/**
 * Split an array into chunks of at most `size`. The last chunk may be shorter.
 * A loop is fine — arguably clearer — here.
 *
 * chunk([1, 2, 3, 4, 5], 2) -> [[1, 2], [3, 4], [5]]
 * chunk([], 3)              -> []
 */
export function chunk(items, size) {
  const result = [];

  for (let idx = 0; idx < items.length; idx += size) {
    const chunk = items.slice(idx, idx + size);
    result.push(chunk);
  }

  return result;
}

/**
 * Count how many times each value appears.
 *
 * tally(['a', 'b', 'a']) -> { a: 2, b: 1 }
 * tally([])              -> {}
 */
export function tally(items) {
  return items.reduce((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}
