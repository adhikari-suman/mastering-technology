# 02 — Maps in Depth

`Map` is where most Java programs keep their state, and where most Java programs
keep six lines of `if (map.containsKey(k)) … else …` that one method call would
have replaced.

## The boilerplate killers

Three methods on `Map` cover almost every "read-modify-write" you will ever
write. Learn these and a lot of code stops needing to exist.

```java
// counting
counts.merge(word, 1, Integer::sum);
```

`merge(key, value, fn)`: if the key is absent, store `value`; if it is present,
store `fn(old, value)`. That one line is `containsKey` + `get` + `put`.

```java
// bucketing
groups.computeIfAbsent(letter, k -> new ArrayList<>()).add(word);
```

`computeIfAbsent(key, fn)` returns the existing value, or computes and stores one
first. It always hands back a usable value, so you can chain straight into it.
Note the argument is a *function of the key*, not a bare value — `getOrDefault(k,
new ArrayList<>())` would allocate a list on every call and store none of them.

```java
// updating only what is there
counts.computeIfPresent(word, (k, v) -> v - 1);
```

And the payoff hiding in both: **returning `null` from the remapping function
deletes the entry.**

```java
counts.computeIfPresent(word, (k, v) -> v <= 1 ? null : v - 1);
// "decrement, and drop the key when it hits zero" — one line, no branch
```

## `getOrDefault` does not mean "or null"

```java
var m = new HashMap<String, Integer>();
m.put("x", null);

m.getOrDefault("x", 9);   // null   — "x" HAS a mapping; the mapping is null
m.getOrDefault("y", 9);   // 9
m.get("x") == null;       // true, and tells you nothing about presence
```

The default fires on *absence*, not on nullness. `containsKey` is the only
honest presence test on a map that stores nulls. `computeIfAbsent` agrees with
neither: it treats a null value as absent and overwrites it.

## Iterating

```java
for (Map.Entry<String, Integer> e : map.entrySet()) {
    e.getKey(); e.getValue();
    e.setValue(e.getValue() + 1);   // writes through to the map
}
```

`entrySet()` is the one to use — `keySet()` plus `get` hashes every key twice.
All three views are live: `map.keySet().remove(k)` removes the entry from the
map. `Map.of` entries refuse `setValue`.

`forEach` reads better when you do not need to mutate or break out:

```java
map.forEach((k, v) -> System.out.println(k + "=" + v));
```

## Which Map

```java
new HashMap<>()        // fastest; iteration order UNSPECIFIED
new LinkedHashMap<>()  // insertion order (or access order, with a flag)
new TreeMap<>()        // sorted by key, O(log n), needs Comparable or a Comparator
```

`HashMap` order is not random and not stable — it is a function of hash codes
and table size, so it changes when the map resizes or the JDK changes. Never
write a test that depends on it.

Nulls differ by implementation, and the rules are not obvious:

| | null key | null value |
| --- | --- | --- |
| `HashMap`, `LinkedHashMap` | allowed (one) | allowed |
| `TreeMap` | **NullPointerException** | allowed |
| `Map.of`, `Map.copyOf` | NullPointerException | NullPointerException |

`TreeMap` rejects a null key because it has to call `compareTo` on it — even for
the very first entry, which it compares with itself to type-check.

## Sequenced maps (Java 21+)

`SequencedMap` finally names the thing `LinkedHashMap` always did:

```java
SequencedMap<String, Integer> m = new LinkedHashMap<>();
m.put("b", 2); m.put("a", 1); m.put("c", 3);

m.firstEntry();          // b=2
m.lastEntry();           // c=3
m.reversed().keySet();   // [c, a, b]
m.putFirst("z", 0);      // [z, b, a, c]
m.pollFirstEntry();
```

`reversed()` is a **view**, not a copy — put into the original and it appears.
`TreeMap` is a `SequencedMap` too, but a sorted map cannot honour "put this
first", so `TreeMap.putFirst` throws `UnsupportedOperationException`: an
interface method that is documented to be optional. `HashMap` is not a
`SequencedMap` at all, which is the type system finally saying out loud that it
has no order.

## The trap: a key you can still change

A `HashMap` files an entry in a bucket chosen from `hashCode()` *at the moment
you put it*. It never looks again.

```java
Map<List<String>, String> map = new HashMap<>();
List<String> key = new ArrayList<>(List.of("a"));
map.put(key, "v");

key.add("b");            // the key's hashCode just changed

map.containsKey(key);    // false
map.get(key);            // null
map.size();              // 1  — the entry is still in there
```

The entry is not lost, it is *unreachable*: it sits in the bucket for the old
hash, and every lookup now goes to the bucket for the new one. `map.remove(key)`
does not remove it either. It will show up in `entrySet()`, and that iterator's
own `remove` is the only way back to it.

Part 02's `equals`/`hashCode` lesson showed the moment this goes wrong. What is
new here is the *aftermath*: the map's `size()` still counts the entry, `remove`
cannot reach it, and iteration can — so a leak like this is invisible to every
lookup and obvious to every traversal.

This is why map keys should be immutable, and why `record` — which derives
`equals`/`hashCode` from its components — is only a safe key when its components
are themselves immutable. A `record Point(int x, int y)` is a perfect key. A
`record Path(List<String> parts)` handed a mutable list is a landmine.

## What to build

| Method | What it does |
| --- | --- |
| `wordCount(List)` | Occurrences per word, with `merge` |
| `groupByInitial(List)` | Bucket by first letter, with `computeIfAbsent` |
| `decrementOrRemove(Map, String)` | Count down, deleting at zero |
| `lookup(Map, String, int)` | `getOrDefault`, null mapping and all |
| `render(Map)` | `"a=1;b=2"` by walking `entrySet` |
| `keysInOrder(Map)` | The keys in whatever order the map iterates |
| `bookends(SequencedMap)` | First and last entry |
| `reversedKeys(SequencedMap)` | Keys back to front |
| `attemptPutNullKey(Map)` | `"ok"`, or the exception `put` threw |
| `stillFindable(Map, List, String)` | Whether a mutated key can still be found |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `merge` throws `NullPointerException` if you pass it a null *value*, but
   `put(k, null)` is fine on a `HashMap`. Why would the API be inconsistent
   there on purpose?
2. `computeIfAbsent(k, k -> ...)` where the mapping function itself puts into
   the same map throws `ConcurrentModificationException`. What invariant is it
   protecting?
3. `LinkedHashMap` has a three-argument constructor with an `accessOrder` flag,
   and an overridable `removeEldestEntry`. Together they are about twelve lines
   of LRU cache. Write it.
4. `HashMap` turns a bucket into a red-black tree once it holds eight entries.
   What attack does that defend against, and what does it require of your key's
   `compareTo`?
