/**
 * The assertion library for the half of this curriculum that never runs.
 *
 * A runtime test fails by throwing. A *type* test fails by not compiling — so
 * these are types whose only job is to be an error when something is wrong:
 *
 *     type _ = Expect<Equal<ReturnType<typeof f>, string>>;
 *
 * If the two types match, `Equal` is `true`, `Expect` accepts it, and tsc says
 * nothing. If they don't, `Expect<false>` violates its own constraint and you
 * get an error on that line. There is no runtime half; these vanish at erasure.
 *
 * The other direction — "this must NOT compile" — needs no helper at all:
 *
 *     // @ts-expect-error - a string is not a number
 *     const n: number = 'no';
 *
 * That directive is self-checking. If the line stops being an error, tsc
 * reports the directive itself as unused, so the assertion cannot rot.
 *
 * You are handed these on day one and will build them yourself in Part 04, once
 * conditional types and distribution make the strange shape of `Equal` readable.
 * Don't spoil it by staring at it now.
 */

/** Exact type identity — stricter than mutual assignability, and `any`-proof. */
export type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;

/** Passes only for `true`. `Expect<Equal<X, Y>>` is the workhorse assertion. */
export type Expect<T extends true> = T;

/** Passes only for `false`, for when you mean "these must differ". */
export type ExpectFalse<T extends false> = T;

/** Assignability, which is a weaker claim than `Equal`. Both are worth testing. */
export type Extends<A, B> = A extends B ? true : false;

/** True only for `any`, which is otherwise almost impossible to detect. */
export type IsAny<T> = 0 extends 1 & T ? true : false;

/** True only for `never`. Naked `T extends never` distributes and lies here. */
export type IsNever<T> = [T] extends [never] ? true : false;
