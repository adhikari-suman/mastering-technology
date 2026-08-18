# 01 — The Prototype Chain

Every object has a hidden link to another object, its **prototype**. When you
read a property that isn't on the object, JavaScript follows that link, then
that object's link, and so on until it finds the property or runs out.

That chain is the entire inheritance system. There are no classes underneath —
`class` is syntax over this, as lesson 03 shows.

## Reading the chain

```js
const animal = { eats: true };
const dog = Object.create(animal);   // dog's prototype IS animal
dog.barks = true;

dog.barks;   // true  — own property
dog.eats;    // true  — found on animal, one link up
dog.flies;   // undefined — chain exhausted

Object.getPrototypeOf(dog) === animal;   // true
```

The chain always ends at `Object.prototype`, whose prototype is `null`:

```
dog → animal → Object.prototype → null
```

That's why every object has `toString` and `hasOwnProperty` — they live on
`Object.prototype`, at the end of everyone's chain.

## Own vs inherited

This distinction matters constantly:

```js
dog.hasOwnProperty('barks');   // true
dog.hasOwnProperty('eats');    // false — inherited, not own
'eats' in dog;                 // true  — `in` walks the chain
Object.keys(dog);              // ['barks'] — own enumerable only
```

Prefer `Object.hasOwn(obj, key)` over `obj.hasOwnProperty(key)`. The method
version breaks on objects created with `Object.create(null)`, which have no
prototype and therefore no `hasOwnProperty` to call.

## Writing never walks the chain

Reading walks up. **Writing always creates an own property**:

```js
const proto = { count: 0 };
const a = Object.create(proto);
a.count += 1;      // reads 0 from proto, writes 1 onto `a`
proto.count;       // still 0
```

This is why shared mutable state on a prototype is a trap: the first write
silently detaches that object from the shared value. It looks like it worked,
and every object ends up with its own copy.

The exception is arrays and objects on a prototype, where you mutate rather
than assign — `a.tags.push(x)` really does affect everyone.

## Shadowing

An own property hides an inherited one of the same name. Delete it and the
inherited one reappears:

```js
const child = Object.create({ greet: () => 'proto' });
child.greet = () => 'own';
child.greet();          // 'own'
delete child.greet;
child.greet();          // 'proto' — it was never gone
```

## What to build

| Export | What it does |
| --- | --- |
| `chainOf(obj)` | The full prototype chain as an array |
| `ownKeys(obj)` | Own enumerable keys only |
| `allKeys(obj)` | Own and inherited enumerable keys |
| `findOwner(obj, key)` | Which object in the chain actually holds the key |
| `hasOwnSafe(obj, key)` | Works even on `Object.create(null)` objects |
| `depthOf(obj, key)` | How many links up the key was found |

## Running it

```bash
cp exercise.js solution.js   # once
npm run watch
```

## Going deeper

1. `Object.create(null)` makes an object with no prototype. What breaks?
   Try `String(obj)` and `obj.toString()`.
2. Why is `Object.setPrototypeOf` considered slow enough to avoid? What does
   changing a prototype do to code the engine already optimised?
3. `[] instanceof Object` is true. Trace the chain that makes it true.
