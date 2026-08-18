# 04 — Inheritance

Chaining prototypes so one type reuses another. Same machinery as lesson 01 —
now with syntax, and with the sharp edges named.

## `extends` and `super`

```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);            // MUST come before any use of `this`
    this.breed = breed;
  }
  speak() {
    return `${super.speak()}, specifically a bark`;
  }
}
```

Two rules that trip people:

1. **`super(...)` before `this`.** In a derived constructor, `this` doesn't
   exist until `super` has run. Touch it first and you get a `ReferenceError` —
   not `undefined`, an actual throw.
2. **`super.method()` is not `this.method()`.** `super.speak()` starts the
   lookup one level up the chain, which is how you extend behaviour instead of
   recursing into yourself forever.

Omit the constructor entirely and you get an implicit
`constructor(...args) { super(...args); }`.

## Two chains, not one

`extends` links **both** the instance chain and the class chain:

```
rex → Dog.prototype → Animal.prototype → Object.prototype   (instances)
Dog  → Animal                                               (statics inherit too)
```

That second link is why `Dog.someStaticFromAnimal` works.

## The pre-`class` version

Worth writing once, because you'll meet it in old code and in transpiler output:

```js
function Dog(name, breed) {
  Animal.call(this, name);                        // ← "super"
  this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);  // ← "extends"
Dog.prototype.constructor = Dog;                  // ← restore what you clobbered
```

Miss that last line and `instance.constructor` reports `Animal`. That's the bug
lesson 02 warned about.

## Prefer composition

Deep hierarchies are where inheritance stops paying. `Dog extends Animal` is
fine; five levels of `AbstractBaseServiceFactory` is a maintenance problem —
every subclass is coupled to every ancestor's internals, and changing a base
class breaks things you can't see from where you're editing.

**Mixins** give you shared behaviour without a chain. Copy methods onto a
prototype instead of inheriting them:

```js
const canFly = { fly() { return `${this.name} flies`; } };
Object.assign(Bird.prototype, canFly);
```

A class can mix in any number of these. It can only extend one thing.

## What to build

| Export | What it does |
| --- | --- |
| `Animal` / `Dog` | `extends`, `super()` in the constructor, `super.method()` |
| `legacyInherit(Child, Parent)` | The pre-class pattern, `constructor` restored |
| `mixin(target, ...sources)` | Copy behaviour onto a prototype |
| `Bird` | Built from `extends` plus a mixin |
| `ancestryOf(Cls)` | The chain of classes above a class |
| `overrides(Cls, name)` | Does this class override an inherited method? |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. Put `this.x = 1` before `super()` in a derived constructor. What exactly is
   thrown, and why is that better than `undefined`?
2. `class Sub extends null` is legal syntax. What can you actually do with it?
3. Extend `Array`. Does `map` on your subclass return your subclass or a plain
   array? Look up `Symbol.species` for the answer.
