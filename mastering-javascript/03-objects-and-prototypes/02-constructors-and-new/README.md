# 02 — Constructors and `new`

Lesson 01 built chains by hand with `Object.create`. `new` automates it.

## What `new Fn()` actually does

Four steps, and none of them are magic:

1. Create a new empty object.
2. Set that object's prototype to `Fn.prototype`.
3. Call `Fn` with `this` bound to the new object.
4. Return the new object — **unless** `Fn` returned an object of its own, in
   which case that wins.

You can write it yourself in five lines, and you will below.

## `Fn.prototype` is not `Fn`'s prototype

The single most confusing name in the language:

```js
function Dog(name) { this.name = name; }
Dog.prototype.speak = function () { return `${this.name} barks`; };

const rex = new Dog('Rex');
Object.getPrototypeOf(rex) === Dog.prototype;   // true
Object.getPrototypeOf(Dog) === Function.prototype;  // Dog's OWN prototype
```

`Dog.prototype` is a property on the function, holding the object that
instances will inherit from. It is not what `Dog` itself inherits from.

Methods go on `Dog.prototype` so all instances share **one** function object.
Assign them inside the constructor with `this.speak = ...` and every instance
gets its own copy — same behaviour, more memory, and no shared identity:

```js
new Dog('a').speak === new Dog('b').speak;   // true when on the prototype
```

## `instanceof` walks the chain

`a instanceof B` asks: is `B.prototype` anywhere in `a`'s prototype chain?

```js
rex instanceof Dog;      // true
rex instanceof Object;   // true — Object.prototype is further up
```

It's a chain search, not a type tag. Reassign `Dog.prototype` after creating
`rex` and `rex instanceof Dog` becomes false, because you moved the target.

## The forgotten-`new` bug

```js
const oops = Dog('Rex');   // no `new`
```

In a module (always strict), `this` is `undefined` and this throws. In sloppy
mode it silently writes `name` onto the global object and returns `undefined`.
`class` fixes this by refusing to be called without `new` at all.

## `constructor`

Every `Fn.prototype` comes with a `constructor` property pointing back at `Fn`.
Replace the whole prototype object and you lose it, which is why the manual
inheritance pattern always restores it:

```js
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;   // ← put it back
```

## What to build

| Export | What it does |
| --- | --- |
| `Dog` | A constructor with a prototype method |
| `construct(Fn, ...args)` | Implement `new` yourself |
| `isInstanceOf(obj, Fn)` | Implement `instanceof` yourself |
| `sharesMethod(a, b, name)` | Is the method shared, or per-instance? |
| `makeCounterCtor()` | A constructor returning an object of its own |
| `constructorOf(obj)` | The constructor an object claims |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. What happens if a constructor returns a **primitive**? A string, a number,
   `null`? Try all three against your `construct`.
2. `new Dog` with no parentheses is legal. What does it do?
3. Arrow functions cannot be used with `new`. Given lesson 02 of Part 02, why
   not?
