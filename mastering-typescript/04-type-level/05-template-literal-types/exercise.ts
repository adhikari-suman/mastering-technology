/**
 * Part 04, Lesson 05 — Template literal types
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`. `Uppercase`, `Capitalize` and friends are compiler
 * intrinsics — those you may use.
 */

/**
 * Split a string on a delimiter.
 *
 *   Split<'a/b/c', '/'>  ->  ['a', 'b', 'c']
 *   Split<'a', '/'>      ->  ['a']
 *   Split<'', '/'>       ->  ['']
 *
 * Matching is non-greedy from the left, which is what makes the recursion end.
 */
export type Split<S extends string, D extends string> = unknown; // TODO

/**
 * The inverse.
 *
 *   Join<['a', 'b', 'c'], '/'>  ->  'a/b/c'
 *   Join<['a'], '/'>            ->  'a'
 *   Join<[], '/'>               ->  ''
 */
export type Join<T extends readonly string[], D extends string> = unknown; // TODO

/**
 * Remove leading and trailing spaces.
 *
 *   Trim<'  a  '>  ->  'a'
 *   Trim<'a'>      ->  'a'
 *   Trim<'   '>    ->  ''
 */
export type Trim<S extends string> = unknown; // TODO

/**
 * Replace the FIRST occurrence of `From` with `To`.
 *
 *   Replace<'a-b-c', '-', '+'>  ->  'a+b-c'
 *   Replace<'abc', 'z', 'y'>    ->  'abc'
 */
export type Replace<S extends string, From extends string, To extends string> = unknown; // TODO

/**
 * Turn event names into handler names, across a union.
 *
 *   EventName<'click' | 'focus'>  ->  'onClick' | 'onFocus'
 */
export type EventName<T extends string> = unknown; // TODO

/**
 * The parameters of a route path, as an object of strings.
 *
 *   PathParams<'/users/:id'>              ->  { id: string }
 *   PathParams<'/users/:id/posts/:postId'> ->  { id: string; postId: string }
 *   PathParams<'/users'>                  ->  {}
 *
 * Two steps: pull the names out as a union, then map that union to an object.
 */
export type PathParams<S extends string> = unknown; // TODO

/**
 * The runtime twin of `Split`, for a path: split on '/' and drop the empty
 * segments that leading and trailing slashes produce.
 *
 *   splitPath('/users/1/')  ->  ['users', '1']
 *   splitPath('/')          ->  []
 */
export function splitPath(path: string): string[] {
  throw new Error('splitPath: not implemented');
}
