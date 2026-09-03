# 04 — Streams

A stream is not a collection. It holds no elements, it can be consumed exactly
once, and nothing in the pipeline runs until the last operation asks for a
result. Treating it like a JavaScript array — where `map` returns a real array
you can keep — is where most of the surprises come from.

## Source, intermediate, terminal

```java
List.of("ant", "bee", "cow").stream()   // source
    .filter(w -> w.length() == 3)       // intermediate — returns a Stream, lazy
    .map(String::toUpperCase)           // intermediate
    .toList();                          // terminal — runs the whole thing
```

Sources: `collection.stream()`, `Arrays.stream(array)`, `Stream.of(...)`,
`Stream.iterate`, `Stream.generate`, `IntStream.range`, `"abc".chars()`,
`Files.lines(path)`.

Intermediate operations return a `Stream` and do nothing on their own — writing
a pipeline with no terminal operation is a no-op that compiles fine. Terminal
operations (`toList`, `forEach`, `reduce`, `count`, `findFirst`, `anyMatch`,
`collect`) are what actually pull elements through.

## Laziness is observable

Elements go through the whole pipeline one at a time, not stage by stage:

```java
Stream.of("a", "bb", "ccc", "dddd")
      .map(s -> { System.out.println("map " + s); return s; })
      .filter(s -> s.length() >= 3)
      .findFirst();

// map a
// map bb
// map ccc      <- and it stops. "dddd" is never touched.
```

`findFirst`, `anyMatch`, `limit` and `takeWhile` short-circuit. This is what
makes `Stream.iterate(1, x -> x * 2).limit(5)` legal on an infinite source.

The exception is the *stateful* operations. `sorted()` and `distinct()` cannot
emit anything until they have seen enough, and `sorted()` has to see everything
— so `sorted().findFirst()` still walks the entire stream, and `sorted()` on an
infinite stream simply never returns.

## Streams are single-use

```java
Stream<String> s = list.stream();
s.toList();
s.count();      // IllegalStateException: stream has already been operated upon or closed
```

There is no rewind. If two answers are needed, either build the stream twice or
collect once and work from the collection. This is also why methods should take
and return `List`, not `Stream` — handing a stream to a caller hands them
something that might already be spent.

## flatMap

```java
List.of(List.of("a", "b"), List.of("c"))
    .stream()
    .flatMap(List::stream)     // Stream<List<String>> -> Stream<String>
    .toList();                 // [a, b, c]
```

One in, zero-or-many out. It flattens exactly one level, and a mapper returning
an empty stream drops the element entirely, which makes it the idiomatic
"filter and transform in one pass".

## Primitive streams

`Stream<Integer>` boxes. `IntStream`, `LongStream` and `DoubleStream` do not,
and they carry the numeric terminals that the object stream has no business
having:

```java
words.stream().mapToInt(String::length).sum();       // int
words.stream().mapToInt(String::length).average();   // OptionalDouble
words.stream().mapToInt(String::length).summaryStatistics();
IntStream.range(0, 5).boxed().toList();              // back to Stream<Integer>
```

Two things to watch. `sum()` on an `IntStream` returns an `int`, so it wraps
silently on a long enough stream — `mapToLong` when that is a risk. And the
"empty" answers differ by method: `sum()` of nothing is `0`, but `average()` and
`max()` of nothing are `OptionalDouble.empty()` and `OptionalInt.empty()`,
because there is no honest number to return.

## reduce has three shapes

```java
// 1. no identity — might be nothing to return, so you get an Optional
Optional<String> longest = words.stream().reduce((a, b) -> b.length() > a.length() ? b : a);

// 2. with an identity — always returns a value, and the type stays the same
int product = numbers.stream().reduce(1, (a, b) -> a * b);

// 3. with an identity and a combiner — accumulate into a DIFFERENT type
int totalLength = words.stream().reduce(0, (n, w) -> n + w.length(), Integer::sum);
```

The third form's combiner is only used in parallel, but you must supply one, and
it must agree with the accumulator or a parallel run quietly gives a different
answer. In practice, form 3 is nearly always better written as a `Collector`,
which is the next lesson.

The identity has to be a real identity: `reduce(0, Integer::sum)` is fine,
`reduce(1, Integer::sum)` is not — it is right sequentially and wrong in
parallel, which is the worst kind of wrong.

## The trap: side effects in a pipeline

```java
List<String> found = new ArrayList<>();
words.stream().filter(w -> w.length() > 3).forEach(found::add);   // don't
```

It works, and then it does not: `forEach` gives no ordering guarantee even on an
ordered stream (that is `forEachOrdered`), and in parallel the `ArrayList` is
being written from several threads with no synchronisation, so you get a short
list, an `ArrayIndexOutOfBoundsException`, or a null in the middle. The version
that is correct in both modes is the one that never mutates anything:

```java
List<String> found = words.stream().filter(w -> w.length() > 3).toList();
```

Behavioural parameters — the lambdas you pass to `map`, `filter`, `sorted` —
should be pure: no writing to anything outside themselves, no reading anything
that another stage might change.

## And sometimes a for loop wins

Streams are worse than a loop when you need an index, when you need to mutate
something as you go, when you want to `break` out with several conditions, when
you want to `return` from the enclosing method, or when the body throws a
checked exception — lambdas cannot, and the wrapping ceremony costs more than
the loop saved. A five-stage pipeline that needed three comments is a loop that
someone made harder to read.

```java
for (int i = 0; i < words.size(); i++) { ... }   // still the right answer sometimes
```

## What to build

| Method | What it does |
| --- | --- |
| `shout(List)` | Drop the blanks, upper-case the rest |
| `flatten(List)` | One level of nesting, gone |
| `distinctSorted(List)` | Unique and ordered |
| `page(List, int, int)` | `skip` then `limit` |
| `product(List)` | `reduce` with an identity |
| `longest(List)` | `reduce` without one, so an `Optional` comes back |
| `totalLength(List)` | `mapToInt().sum()` |
| `averageLength(List)` | `mapToInt().average()`, empties and all |
| `elementsSeenBeforeFirstMatch(List, int)` | How lazy the pipeline really is |
| `attemptReuse(Stream)` | What a spent stream does |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `elementsSeenBeforeFirstMatch` needs a counter outside the pipeline — the
   exact thing this lesson tells you not to do. Why is measuring a pipeline the
   one case where it is defensible, and what would break if the stream were
   parallel?
2. `stream().toList()` and `collect(Collectors.toList())` differ in two ways.
   One is mutability. Find the other by trying to collect a stream containing a
   null.
3. `Stream.iterate(1, x -> x * 2).limit(5)` terminates. What does
   `Stream.iterate(1, x -> x * 2).sorted().limit(5)` do, and why is that not a
   bug in `sorted`?
4. `parallelStream()` looks free. Measure it on a list of 10 elements and on a
   list of 10 million, and find where the crossover actually is.
