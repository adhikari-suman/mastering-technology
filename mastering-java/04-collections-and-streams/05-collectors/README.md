# 05 — Collectors

`collect` is the terminal operation for everything that is not a single number.
`Collectors` is a class of about forty static factories, and knowing six of them
is the difference between a pipeline and a paragraph.

## Three ways to end up with a List

```java
stream.toList();                              // immutable, ALLOWS nulls
stream.collect(Collectors.toUnmodifiableList()); // immutable, REJECTS nulls
stream.collect(Collectors.toList());          // mutable in practice, allows nulls
```

`Stream.toList()` (Java 16+) is the default answer. `Collectors.toList()`
predates it and makes no promise about the list's type or mutability — the
javadoc says exactly that — it just happens to hand back an `ArrayList` today,
so code that adds to the result is relying on an implementation detail. Use
`toCollection(ArrayList::new)` when you actually want a mutable one and want to
say so.

The null difference is real and easy to trip over: a pipeline whose mapper can
return null works with `toList()` and throws `NullPointerException` with
`toUnmodifiableList()`.

## joining

```java
words.stream().collect(Collectors.joining());               // "antbee"
words.stream().collect(Collectors.joining(", "));           // "ant, bee"
words.stream().collect(Collectors.joining(", ", "[", "]")); // "[ant, bee]"
```

On an empty stream the three-argument form still emits the prefix and suffix, so
you get `"[]"` rather than `""`. `joining` only accepts `CharSequence`, so map
to `String` first — this is the one place `Collectors` will not do it for you.

## groupingBy, and the downstream collector

```java
Map<Character, List<String>> byInitial =
    words.stream().collect(Collectors.groupingBy(w -> w.charAt(0)));
```

The second argument, when you give one, is another `Collector` that decides what
each group becomes:

```java
Collectors.groupingBy(w -> w.charAt(0), Collectors.counting());       // Map<Character, Long>
Collectors.groupingBy(w -> w.charAt(0), Collectors.joining("/"));     // Map<Character, String>
Collectors.groupingBy(w -> w.charAt(0), Collectors.mapping(String::toUpperCase, toList()));
Collectors.groupingBy(w -> w.charAt(0), TreeMap::new, Collectors.toSet());
```

`counting()` returns `Long`, not `Integer` — and `Long.valueOf(2).equals(2)` is
false, so a map compared against `Map.of('a', 2)` fails for reasons the failure
message makes look like a miracle.

`groupingBy` gives you a `HashMap` unless you pass a map factory, so the key
order is unspecified. The three-argument overload takes the factory in the
middle, which is where `TreeMap::new` goes.

## The trap: `filtering` is not `filter`

Both of these keep only the long words. They do not produce the same map.

```java
words.stream().filter(w -> w.length() > 5)
     .collect(groupingBy(w -> w.charAt(0)));
// {a=[avocado], b=[banana]}

words.stream()
     .collect(groupingBy(w -> w.charAt(0), filtering(w -> w.length() > 5, toList())));
// {a=[avocado], b=[banana], f=[]}
```

Filtering *before* the grouping means the group never gets created. Filtering
*downstream* means the key is created by the first element that matched
`w.charAt(0)`, and then everything about it is thrown away — leaving an empty
bucket that proves the key existed. Which you want depends on whether "no long
words starting with f" is a fact worth reporting.

`mapping` and `flatMapping` are the same idea for transforming instead of
filtering:

```java
groupingBy(String::length, flatMapping(w -> w.chars().mapToObj(c -> (char) c),
                                        toCollection(TreeSet::new)));
// {3=[f, g, i], 5=[a, e, l, p], 6=[a, b, n], 7=[a, c, d, o, v]}
```

## partitioningBy

```java
Map<Boolean, List<String>> split =
    words.stream().collect(Collectors.partitioningBy(w -> w.length() > 5));
```

A `groupingBy` on a predicate, with one guarantee `groupingBy` cannot make:
**both keys are always present.** Even on an empty stream you get
`{false=[], true=[]}`, so `split.get(true)` never returns null. It also takes a
downstream collector.

## toMap, and the exception you will meet first

```java
words.stream().collect(Collectors.toMap(w -> w.charAt(0), w -> w));
// java.lang.IllegalStateException: Duplicate key a (attempted merging values ant and ape)
```

Unlike `groupingBy`, `toMap` assumes the key is unique and refuses to guess when
it is not. The third argument is the merge function, and it is the one you
should reach for by default:

```java
Collectors.toMap(w -> w.charAt(0), w -> w, (first, second) -> first);   // first wins
Collectors.toMap(w -> w.charAt(0), w -> w, (a, b) -> a + "/" + b);      // combine
Collectors.toMap(w -> w.charAt(0), w -> w, (a, b) -> b, TreeMap::new);  // and a map type
```

A second landmine: `toMap` throws `NullPointerException` on a null *value*, even
though `HashMap` stores nulls happily. It is implemented on top of `Map.merge`,
which forbids them.

## teeing

Two collectors over one pass, and a function to fuse the answers:

```java
words.stream().collect(Collectors.teeing(
    Collectors.counting(),
    Collectors.summingInt(String::length),
    (count, letters) -> count + " words, " + letters + " letters"));
```

This is what to reach for when the alternative is streaming the same list twice
— or, worse, collecting to a list and streaming that.

`summingInt`, `averagingDouble` and `summarizingInt` round out the arithmetic
set. Note that `averagingInt` on an empty stream returns `0.0`, not an empty
`Optional`, which is the opposite of what `IntStream.average()` does.

## Writing one

A `Collector` is four functions: make a container, add an element to it, merge
two containers (parallel only), finish.

```java
static Collector<String, ?, String> initials() {
    return Collector.of(
        StringBuilder::new,                                  // supplier
        (sb, w) -> { if (!w.isEmpty()) sb.append(w.charAt(0)); },  // accumulator
        StringBuilder::append,                               // combiner
        StringBuilder::toString);                            // finisher
}
```

The `?` in the type is the accumulator type, deliberately hidden: callers should
not know or care that a `StringBuilder` was involved. The payoff for writing a
real one rather than a helper method is that it composes — it can be handed to
`groupingBy` as a downstream collector like any other.

## What to build

| Method | What it does |
| --- | --- |
| `collectImmutable(List)` | A list nobody can add to |
| `bracketJoin(List)` | `"[ant, bee]"`, empty included |
| `countByInitial(List)` | `groupingBy` + `counting` |
| `shoutingLongWordsByInitial(List, int)` | `filtering` and `mapping` downstream |
| `partitionLongWords(List, int)` | `partitioningBy`, both keys guaranteed |
| `indexByInitial(List)` | `toMap` with no merge function |
| `indexByInitialFirstWins(List)` | `toMap` with one |
| `summary(List)` | `teeing` two collectors into a sentence |
| `meanLength(List)` | `averagingInt`, and what it does with nothing |
| `initialsCollector()` | A `Collector` you wrote yourself |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `initialsCollector()` has a combiner that is never called by any test here.
   Make it run. What happens if you write a combiner that is wrong?
2. `Collector.of` takes optional `Characteristics`. What does `UNORDERED` let
   the JDK do, and why would claiming it on `initials()` be a lie?
3. `groupingBy(f, counting())` and `toMap(f, w -> 1L, Long::sum)` produce equal
   maps. Which allocates less, and which reads better to someone who has to
   change it in a year?
4. `Collectors.toMap` refuses null values. Given that its own javadoc points at
   `Map.merge`, what would the API have to give up to allow them?
