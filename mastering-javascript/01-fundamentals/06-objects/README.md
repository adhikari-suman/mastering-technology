# 06 — Objects

An object is a bag of key/value pairs. Keys are strings or symbols; values are
anything. Arrays, functions, dates, and classes are all objects underneath.

## Access

```js
const user = { name: 'Ada', 'favourite colour': 'blue' };

user.name                  // dot: when you know the key at author time
user['name']               // bracket: same thing
user['favourite colour']   // bracket: required — the key isn't an identifier
user[keyVariable]          // bracket: required — the key is computed
```

Missing keys give `undefined`, not an error. Missing keys *two levels down*
throw, which is why optional chaining exists:

```js
user.address.city    // TypeError: Cannot read properties of undefined
user.address?.city   // undefined — stops the moment it hits null/undefined
user.getName?.()     // only calls if getName exists
```

## Copying, and the reference trap

Objects are held by **reference**. Assignment copies the reference, not the object:

```js
const a = { n: 1 };
const b = a;
b.n = 2;
a.n;              // 2   — same object

const c = { ...a };  // shallow copy: now independent
```

`===` on objects compares identity, not contents:

```js
{ n: 1 } === { n: 1 }   // false — two different objects
```

Spread is **shallow**. Nested objects are still shared:

```js
const copy = { ...original };
copy.address.city = 'X';   // mutates original.address too
```

For a true deep copy: `structuredClone(original)`.

## Non-mutating update

The pattern you'll write ten thousand times in React, Redux, and any modern
codebase:

```js
const updated = { ...user, age: 37 };          // add/overwrite one key
const { password, ...safe } = user;            // remove one key
const nested = { ...user, address: { ...user.address, city: 'Paris' } };
```

Later keys win, so put the spread first and your overrides after.

## Destructuring

```js
const { name, age } = user;                     // pull out fields
const { name: userName } = user;                // rename
const { role = 'guest' } = user;                // default for a missing key
const { address: { city } = {} } = user;        // nested, with a guard
function greet({ name, greeting = 'Hi' }) {}    // in a parameter list
```

Destructuring in the parameter list is how most modern JS functions take
options — you'll see it constantly.

## The `Object.*` toolkit

```js
Object.keys(obj)      // ['name', 'age']
Object.values(obj)    // ['Ada', 36]
Object.entries(obj)   // [['name', 'Ada'], ['age', 36]]
Object.fromEntries(pairs)   // the inverse of entries
Object.freeze(obj)    // shallow, and silent in non-strict mode
```

`entries` -> `map`/`filter` -> `fromEntries` is the standard way to transform an
object, since there is no `Object.map`.

## Methods and a warning about `this`

```js
const rect = {
  width: 3,
  height: 4,
  area() {
    return this.width * this.height;   // `this` is the object it was CALLED on
  },
};
rect.area();   // 12
```

`this` is determined by **how a function is called**, not where it was defined.
Pull the method off the object and it breaks:

```js
const fn = rect.area;
fn();   // TypeError — `this` is undefined
```

Arrow functions don't get their own `this`, which makes them wrong for methods
and right for callbacks. Module 02 covers all four binding rules properly. For
now: use `method() {}` shorthand for methods, arrows for callbacks.

## What to build

`solution.js` is empty. **No function here may mutate its arguments** — several
tests check the original object afterwards.

### `getProperty(obj, key)`
Read a property whose name is only known at runtime. Dot notation can't do this.
`getProperty({ a: 1 }, 'a')` → `1` · missing key → `undefined`

### `fullName(person)`
Use destructuring in the parameter list.
`fullName({ first: 'Ada', last: 'Lovelace' })` → `'Ada Lovelace'`

### `deepGet(obj, path)`
Read a nested value from a dotted path. It must never throw, however broken the
path is.
`deepGet({ a: { b: { c: 1 } } }, 'a.b.c')` → `1` · `deepGet({ a: {} }, 'a.b.c')` → `undefined`

### `withUpdated(obj, key, value)`
A **new** object with `key` set to `value`; the original untouched.
`withUpdated({ a: 1 }, 'b', 2)` → `{ a: 1, b: 2 }`

### `omit(obj, key)`
A **new** object without `key`. Rest destructuring does this in one line, but
any approach works.
`omit({ a: 1, b: 2 }, 'b')` → `{ a: 1 }`

### `invert(obj)`
Values become keys, keys become values.
`invert({ a: '1', b: '2' })` → `{ '1': 'a', '2': 'b' }`

### `filterValues(obj, predicate)`
Keep only the entries whose **value** passes the predicate.
`filterValues({ a: 1, b: 5 }, n => n > 3)` → `{ b: 5 }`

### `mergeObjects(a, b)`
Merge into a new object; keys in `b` win. Shallow is fine.

### `makeRect(width, height)`
An object with `width`, `height`, and an `area()` method that uses `this`. Use
method shorthand, **not** an arrow function — one test reassigns `rect.width`
and expects `area()` to notice.
`makeRect(3, 4).area()` → `12`

### `deepCopy(obj)`
Copy so that mutating the result at **any** depth can't affect the original.
There's a built-in for this.

## Running it

From inside this folder:

```bash
node --test --watch
```

That re-runs on every save. Drop `--watch` for a single run — it exits non-zero
while anything is still red.

## Going deeper

1. Why does `{ a: 1 } === { a: 1 }` return false, but `'a' === 'a'` return true?
2. What happens to key order for `{ 2: 'b', 1: 'a', foo: 'c' }`? Integer-like
   keys have their own rule — find it.
3. `Object.freeze` is shallow. Write a `deepFreeze`.
