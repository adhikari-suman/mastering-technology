import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect } from '../../type-tests.ts';

import { CALLS, logged, bound, clamped, sealed } from './solution.ts';

// `import type` erases completely, so the decorator syntax in that fixture is
// checked by tsc and never reaches Node — which cannot parse it.
import type { GreetType, VolumeType, PlayerCtor } from './fixtures/decorated.ts';

/* ------------------------------------------------------------------ types */

// The decorated members kept their exact signatures through decoration.
type _Greet = Expect<Equal<GreetType, (greeting: string) => string>>;
type _Volume = Expect<Equal<VolumeType, number>>;
type _CtorArgs = Expect<Equal<ConstructorParameters<PlayerCtor>, [name: string]>>;

type Original = (this: { n: number }, a: number, b: string) => symbol;

function _typeOnly(
  original: Original,
  ctx: ClassMethodDecoratorContext<{ n: number }, Original>,
  fieldCtx: ClassFieldDecoratorContext<unknown, number>,
) {
  // A method decorator returns something callable exactly like the original.
  const replaced = logged(original, ctx);
  type _Replaced = Expect<Equal<typeof replaced, Original>>;

  // A field decorator returns an initialiser transformer, not a value.
  const transform = clamped(0, 10)(undefined, fieldCtx);
  type _Transform = Expect<Equal<typeof transform, (initial: number) => number>>;
}

/* ---------------------------------------------------------------- runtime */
// Applying a decorator by hand is exactly what `@` compiles to.

/**
 * A minimal method context — the object the runtime hands a decorator.
 *
 * `V`'s constraint is `(this: This, ...args: any) => any` because that is what
 * `ClassMethodDecoratorContext` itself requires. Tightening it to `never[]`
 * makes the type argument illegal: the lib's constraint wins.
 */
function methodContext<This, V extends (this: This, ...args: any) => any>(
  name: string,
  initializers: ((this: This) => void)[] = [],
): ClassMethodDecoratorContext<This, V> {
  return {
    kind: 'method',
    name,
    static: false,
    private: false,
    access: { has: () => true, get: (obj: This) => (obj as Record<string, unknown>)[name] as V },
    addInitializer(fn: (this: This) => void) { initializers.push(fn); },
    metadata: {},
  };
}

function fieldContext<This, V>(name: string): ClassFieldDecoratorContext<This, V> {
  return {
    kind: 'field',
    name,
    static: false,
    private: false,
    access: {
      has: () => true,
      get: (obj: This) => (obj as Record<string, unknown>)[name] as V,
      set: (obj: This, value: V) => { (obj as Record<string, unknown>)[name] = value; },
    },
    addInitializer() {},
    metadata: {},
  };
}

test('logged records the call and returns the result', () => {
  CALLS.length = 0;
  const add = (a: number, b: number) => a + b;
  const wrapped = logged(add, methodContext<undefined, typeof add>('add'));
  assert.equal(wrapped.call(undefined, 1, 2), 3);
  assert.deepEqual(CALLS, ['add(1,2)']);
});

test('logged records every call, in order', () => {
  CALLS.length = 0;
  const f = (n: number) => n;
  const wrapped = logged(f, methodContext<undefined, typeof f>('f'));
  wrapped.call(undefined, 1);
  wrapped.call(undefined, 2);
  assert.deepEqual(CALLS, ['f(1)', 'f(2)']);
});

test('logged preserves the receiver', () => {
  CALLS.length = 0;
  const self = { n: 7 };
  const m = function (this: { n: number }): number { return this.n; };
  const wrapped = logged(m, methodContext<{ n: number }, typeof m>('m'));
  assert.equal(wrapped.call(self), 7);
});

test('bound returns the method unchanged and queues an initializer', () => {
  const initializers: ((this: { n: number }) => void)[] = [];
  const m = function (this: { n: number }): number { return this.n; };
  const ctx = methodContext<{ n: number }, typeof m>('m', initializers);
  const returned = bound(m, ctx);
  assert.equal(returned, m, 'the method itself is not replaced');
  assert.equal(initializers.length, 1, 'the work is queued for construction time');
});

test('bound: running the initializer makes the method extractable', () => {
  const initializers: ((this: { n: number; m?: () => number }) => void)[] = [];
  const m = function (this: { n: number }): number { return this.n; };
  const ctx = methodContext<{ n: number; m?: () => number }, typeof m>('m', initializers);
  bound(m, ctx);

  const instance: { n: number; m?: () => number } = { n: 42 };
  Object.setPrototypeOf(instance, { m });
  for (const init of initializers) init.call(instance);

  const extracted = instance.m;
  assert.equal(typeof extracted, 'function');
  assert.equal(extracted?.(), 42, 'still bound after being pulled off the object');
});

test('clamped transforms the initial value', () => {
  const transform = clamped(0, 10)(undefined, fieldContext<unknown, number>('volume'));
  assert.equal(transform(99), 10);
  assert.equal(transform(-5), 0);
  assert.equal(transform(5), 5);
});

test('clamped: the bounds themselves are in range', () => {
  const transform = clamped(0, 10)(undefined, fieldContext<unknown, number>('v'));
  assert.equal(transform(0), 0);
  assert.equal(transform(10), 10);
});

test('sealed seals the constructor and its prototype', () => {
  class Plain { a = 1; }
  const out = sealed(Plain, {
    kind: 'class',
    name: 'Plain',
    addInitializer() {},
    metadata: {},
  });
  assert.equal(out, Plain, 'returned unchanged');
  assert.equal(Object.isSealed(Plain), true);
  assert.equal(Object.isSealed(Plain.prototype), true);
});

test('a sealed class is still constructible', () => {
  class Plain { a = 1; }
  const Out = sealed(Plain, { kind: 'class', name: 'Plain', addInitializer() {}, metadata: {} });
  assert.equal(new Out().a, 1);
});
