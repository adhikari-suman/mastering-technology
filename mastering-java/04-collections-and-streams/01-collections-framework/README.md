# 01 — The Collections Framework

JavaScript gives you `Array`, `Map`, `Set` and stops. Java gives you an
interface hierarchy with a dozen implementations under it, and picking the wrong
one is how most Java performance folklore starts.

## The hierarchy

```
Iterable
└── Collection          add, remove, contains, size, iterator, stream
    ├── List            ordered, indexed, duplicates allowed
    ├── Set             no duplicates, membership defined by equals/hashCode
    └── Queue           ends matter
        └── Deque       both ends matter

Map                     NOT a Collection — it has no `add`, no `iterator`
```

`Map` sitting outside is deliberate: a map is a collection of *pairs*, and none
of `Collection`'s methods would mean the right thing on it. You reach its
contents through the three views — `keySet()`, `values()`, `entrySet()` — and
each of those is a real `Collection`.

Declare variables by the interface, construct by the class:

```java
List<String> names = new ArrayList<>();     // yes
ArrayList<String> names = new ArrayList<>(); // works, but pins the caller
```

## Which List

`ArrayList` is a growable array. `LinkedList` is a doubly-linked chain. The
folklore says "insert in the middle is O(1), so use LinkedList" — and it is
wrong almost every time, because to insert in the middle you must first *walk*
to the middle, which is O(n), and every element is a separate heap object with
two extra pointers, so it thrashes the cache while `ArrayList` streams through
contiguous memory.

**Use `ArrayList`.** Reach for `LinkedList` only when you want a `Deque`, and
then use `ArrayDeque`, which is faster at that too. `LinkedList` implements both
`List` and `Deque`, which is mostly how it survives.

`Stack` and `Vector` are 1.0-era synchronised classes. `ArrayDeque` replaces
`Stack`; `ArrayList` replaces `Vector`.

## Which Set

```java
new HashSet<>(List.of("pear", "fig", "apple"));        // [apple, pear, fig]  — unspecified, and NOT insertion order
new LinkedHashSet<>(List.of("pear", "fig", "apple"));  // [pear, fig, apple]  — insertion order
new TreeSet<>(List.of("pear", "fig", "apple"));        // [apple, fig, pear]  — sorted
```

`HashSet` is fastest and its iteration order is *not specified* — it looks
stable for a given JDK and then changes under you. `LinkedHashSet` costs one
extra pointer pair per element and gives insertion order. `TreeSet` is a
red-black tree: O(log n), sorted, and it decides membership with `compareTo`,
not `equals`. A `TreeSet<String>` built with `String.CASE_INSENSITIVE_ORDER`
holds one of `"Hello"` and `"HELLO"`; a `HashSet` holds both.

## `List.of` is not `new ArrayList<>`

```java
List.of("a").add("b");        // UnsupportedOperationException
List.of("a", null);           // NullPointerException
List.of("a").contains(null);  // NullPointerException — even asking is illegal
Set.of("x", "x");             // IllegalArgumentException: duplicate element
```

The `of` factories produce immutable, **null-hostile** collections. Null-hostile
is stronger than "you can't store null": `contains(null)` and `indexOf(null)`
throw too, so a null-tolerant algorithm that worked on `ArrayList` explodes when
someone hands it a `List.of`.

`Arrays.asList` is a third thing again — a fixed-size *view over the array*, so
`set` works and `add` does not.

## `unmodifiableList` is a view, not a copy

This is the trap that leaks mutable state out of well-meaning getters.

```java
List<String> backing = new ArrayList<>(List.of("a"));
List<String> view = Collections.unmodifiableList(backing);
backing.add("b");
view;                 // [a, b]  — the view moved

List<String> copy = List.copyOf(backing);
backing.add("c");
copy;                 // [a, b]  — the copy did not
```

`unmodifiableList` only removes *your* ability to mutate. Anyone still holding
the backing list can change what your caller sees, mid-iteration. `List.copyOf`
snapshots — and returns the same immutable, null-hostile kind of list that
`List.of` does.

## The trap: ConcurrentModificationException, and when it doesn't fire

Mutating a collection while a `for (T x : c)` loop is running is illegal.
`ArrayList` keeps a `modCount`, the iterator remembers the count it started
with, and `next()` throws `ConcurrentModificationException` when they diverge.
Nothing concurrent is involved; the name is about *concurrent iteration and
modification*, not threads.

The trap is that the check lives in `next()`, and `hasNext()` is only
`cursor != size`:

```java
var list = new ArrayList<>(List.of("a", "b", "c"));
for (String s : list) if (s.equals("a")) list.remove(s);   // throws
```

```java
var list = new ArrayList<>(List.of("a", "b", "c"));
for (String s : list) if (s.equals("b")) list.remove(s);   // does NOT throw
```

Remove the second-to-last element and the size drops to 2 exactly when the
cursor reaches 2, so `hasNext()` says false, the loop exits normally, and
`next()` never gets to check. You silently skipped the last element and got no
warning. The detection is explicitly best-effort — the javadoc calls writing
code that depends on it "fail-fast, but not guaranteed".

Remove properly with `removeIf`, or with the iterator's own `remove`:

```java
list.removeIf(s -> s.length() < 3);

var it = list.iterator();
while (it.hasNext()) if (it.next().length() < 3) it.remove();
```

`removeIf` also returns whether anything changed — and on a `List.of` it throws
`UnsupportedOperationException` even when the predicate matches nothing.

## What to build

| Method | What it does |
| --- | --- |
| `shapeOf(Collection)` | Which sub-interface a collection is |
| `dedupeKeepingOrder(List)` | Unique, in first-seen order |
| `sortedUnique(Collection)` | Unique, sorted |
| `attemptAdd(List, String)` | `"ok"`, or the exception `add` threw |
| `liveView(List)` | An unmodifiable *view* of the argument |
| `frozenCopy(List)` | An unmodifiable *snapshot* of the argument |
| `attemptRemoveInForEach(List, String)` | Removes badly, and reports what happened |
| `dropShorterThan(List, int)` | Removes in place, returns how many went |
| `balanced(String)` | Bracket matching with a `Deque` as a stack |
| `drainFront(Deque)` | Empty a deque from the head into a list |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `attemptRemoveInForEach` returns `"ok"` for one of the three elements of a
   three-element list. Which, and what is the list left holding? Now do it with
   a four-element list — why does the same element throw?
2. `HashSet` iteration order is unspecified but not random. What is it actually,
   and what makes `new HashSet<>(List.of("a","b","c"))` come out in a different
   order from `new HashSet<>(List.of("c","b","a"))` — or not?
3. `liveView` and `frozenCopy` have the same static type. If a method returns
   `List<String>`, how can a caller tell whether it is safe to hold onto?
4. `ArrayList` grows by 50% when full. What does that make the amortised cost of
   `add`, and why is `new ArrayList<>(1000)` worth writing when you know the
   size?
