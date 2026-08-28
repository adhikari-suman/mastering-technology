import test from 'node:test';
import assert from 'node:assert/strict';
import type { Equal, Expect, ExpectFalse } from '../../type-tests.ts';

import {
  ROLES, PERMISSIONS, DEFAULT_ROLE, identity, can, isRole, widened, narrow,
} from './solution.ts';
import type { Role, Permission } from './solution.ts';

/* ------------------------------------------------------------------ types */

type _Roles = Expect<Equal<typeof ROLES, readonly ['admin', 'editor', 'viewer']>>;
type _Role = Expect<Equal<Role, 'admin' | 'editor' | 'viewer'>>;
type _Permission = Expect<Equal<Permission, 'read' | 'write' | 'delete'>>;
type _Default = Expect<Equal<typeof DEFAULT_ROLE, Role>>;

// `satisfies` keeps the exact shape that an annotation would have flattened.
type _Viewer = Expect<Equal<typeof PERMISSIONS.viewer, readonly ['read']>>;
type _Admin = Expect<Equal<typeof PERMISSIONS.admin, readonly ['read', 'write', 'delete']>>;

// ...and still enforces the constraint.
type _Keys = Expect<Equal<keyof typeof PERMISSIONS, Role>>;

// The widening rule, stated as a test.
type _Widened = Expect<Equal<typeof widened, string>>;
type _Narrow = Expect<Equal<typeof narrow, 'admin'>>;
type _Differ = ExpectFalse<Equal<typeof widened, typeof narrow>>;

/**
 * Assertions that need a value to point at. This function is never called: its
 * parameters hand the checker typed bindings, and because nothing invokes it,
 * Node never runs the body. A `@ts-expect-error` only silences the *checker* —
 * the line underneath is still real code, so it has to live somewhere unreached.
 */
function _typeOnly() {
  // A const type parameter refuses to widen — for primitives, and for the
  // containers that would otherwise lose everything. It is an *inference*
  // modifier, so these have to be real calls; naming the type argument
  // explicitly would bypass the very thing under test.
  const one = identity('a');
  type _One = Expect<Equal<typeof one, 'a'>>;
  const many = identity(['a', 'b']);
  type _Many = Expect<Equal<typeof many, readonly ['a', 'b']>>;

  // The union is closed.
  // @ts-expect-error - 'owner' is not a Role
  const _bad: Role = 'owner';

  // @ts-expect-error - 'admin' is a Role, not a Permission
  can('admin', 'admin');
}

/* ---------------------------------------------------------------- runtime */

test('ROLES survives to runtime as a plain array', () => {
  assert.deepEqual([...ROLES], ['admin', 'editor', 'viewer']);
  assert.equal(ROLES.length, 3);
});

test('PERMISSIONS is a plain object at runtime', () => {
  assert.deepEqual(PERMISSIONS.viewer, ['read']);
  assert.deepEqual(PERMISSIONS.admin, ['read', 'write', 'delete']);
});

test('DEFAULT_ROLE', () => {
  assert.equal(DEFAULT_ROLE, 'viewer');
});

test('identity returns its argument', () => {
  assert.equal(identity('a'), 'a');
  const xs = ['a', 'b'];
  assert.equal(identity(xs), xs, 'the same reference, not a copy');
});

test('can', () => {
  assert.equal(can('admin', 'delete'), true);
  assert.equal(can('editor', 'write'), true);
  assert.equal(can('editor', 'delete'), false);
  assert.equal(can('viewer', 'read'), true);
  assert.equal(can('viewer', 'write'), false);
});

test('isRole', () => {
  assert.equal(isRole('admin'), true);
  assert.equal(isRole('viewer'), true);
  assert.equal(isRole('owner'), false);
  assert.equal(isRole(''), false);
});
