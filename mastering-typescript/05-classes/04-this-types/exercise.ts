/**
 * Part 05, Lesson 04 — this types
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 *     cp exercise.ts solution.ts
 *
 * RULE: no `any`, no parameter properties, and no overriding a base method just
 * to change its return type — that is the mistake `this` types exist to avoid.
 */

/**
 * A fluent query builder. Every setter returns the receiver so calls chain, and
 * the annotation must be a `this` type so a SUBCLASS keeps chaining too.
 *
 *   new QueryBuilder('users').where('a = 1').limit(10).build()
 *     -> 'SELECT * FROM users WHERE a = 1 LIMIT 10'
 *
 * build() assembles, in this order, omitting absent parts:
 *   SELECT * FROM <table> [WHERE <c1> AND <c2> ...] [LIMIT <n>]
 */
export class QueryBuilder {
  // TODO
  constructor(table: string) {
    throw new Error('QueryBuilder: not implemented');
  }

  where(condition: string): unknown {
    // TODO: the return annotation is wrong
    throw new Error('QueryBuilder#where: not implemented');
  }

  limit(n: number): unknown {
    // TODO: the return annotation is wrong
    throw new Error('QueryBuilder#limit: not implemented');
  }

  build(): string {
    throw new Error('QueryBuilder#build: not implemented');
  }
}

/**
 * A subclass adding one more step. It must NOT need to re-declare `where` or
 * `limit`; if it does, the base annotations are wrong.
 *
 *   ...orderBy('name')  adds ` ORDER BY name` after LIMIT
 */
export class SortedQueryBuilder extends QueryBuilder {
  // TODO
  orderBy(column: string): unknown {
    // TODO: the return annotation is wrong
    throw new Error('SortedQueryBuilder#orderBy: not implemented');
  }
}

/**
 * A value that may or may not be there, where `get()` is only reachable once
 * you have checked.
 *
 *   Maybe.of(1).hasValue()      -> true
 *   Maybe.empty<number>()       -> hasValue() is false
 *   .map(fn)                    -> a new Maybe, fn skipped when empty
 *
 * `hasValue` must be a `this is` predicate naming a shape that carries `get`.
 * `get` itself is NOT on the class's public surface — only that shape has it.
 */
export class Maybe<T> {
  // TODO
  static of<V>(value: V): Maybe<V> {
    throw new Error('Maybe.of: not implemented');
  }

  static empty<V>(): Maybe<V> {
    throw new Error('Maybe.empty: not implemented');
  }

  hasValue(): unknown {
    // TODO: the return annotation is wrong — it should narrow `this`
    throw new Error('Maybe#hasValue: not implemented');
  }

  map<U>(fn: (value: T) => U): Maybe<U> {
    throw new Error('Maybe#map: not implemented');
  }
}

/**
 * A standalone function typed to be called with a particular receiver.
 * Callers never pass `this`; it is erased entirely.
 *
 *   describeNamed.call({ name: 'ada' })  ->  'name: ada'
 */
export function describeNamed(): string {
  // TODO: add the `this` parameter
  throw new Error('describeNamed: not implemented');
}

/**
 * A base with a static factory that returns the ACTUAL class, so a subclass
 * gets its own type back without redeclaring anything.
 *
 *   Model.create()      -> Model
 *   User.create()       -> User
 *
 * Inside a static method, `this` is the constructor — so a `this` type there
 * means the constructor type, and `InstanceType<this>` is what you want back.
 */
export class Model {
  // TODO: a static create()
  label(): string {
    return this.constructor.name;
  }
}

export class User extends Model {
  greet(): string {
    return `hello from ${this.label()}`;
  }
}
