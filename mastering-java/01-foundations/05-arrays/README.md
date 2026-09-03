# 05 — Arrays

Arrays are the oldest thing in Java and they show it. They are fast, they are
what varargs and `main` are built from, and they behave unlike every other type
in the language — including having a hole in the type system that was designed
in on purpose.

## Fixed length, filled with defaults

```java
int[] xs = new int[3];        // {0, 0, 0}
String[] names = new String[2];   // {null, null}
boolean[] flags = new boolean[1]; // {false}
int[] literal = {1, 2, 3};        // the short form, only at a declaration
```

The length is fixed at creation and readable as `xs.length` — a field, not a
method, unlike `String.length()` and `List.size()`. There is no `add`, no
`remove`, no resize. "Growing" an array means allocating a new one and copying,
which is exactly what `ArrayList` does for you.

A new array is always zero-filled: `0`, `0.0`, `false`, `'\u0000'`, or `null`
according to the element type. `new int[-1]` throws `NegativeArraySizeException`
— a distinct exception, not `IllegalArgumentException`.

## Multidimensional means arrays of arrays

```java
int[][] grid = new int[2][3];      // 2 rows, each a fresh int[3]
int[][] jagged = new int[2][];     // 2 nulls — rows not created yet
jagged[0] = new int[] {1, 2};
jagged[1] = new int[] {3};
```

There is no rectangular 2-D array type. `grid[0]` is an `int[]` like any other,
rows can have different lengths, and a row can be null. `grid.length` is the
number of rows; `grid[0].length` is the width of *that row only*.

## Arrays inherit `Object`'s idea of equality

An array does not override `toString`, `equals` or `hashCode`. So:

```java
int[] a = {1, 2}, b = {1, 2};
a.toString();       // "[I@7334aada" — type tag plus identity hash
a.equals(b);        // false. identity, always.
Arrays.equals(a, b);        // true — this is the one you want
Arrays.toString(a);         // "[1, 2]"
```

And for nested arrays the shallow versions are not enough, because they compare
the *rows* by identity:

```java
Arrays.toString(grid);      // "[[I@7334aada, [I@1d9b7cce]"  — useless
Arrays.deepToString(grid);  // "[[1, 2], [3]]"
Arrays.equals(x, y);        // false for equal nested arrays
Arrays.deepEquals(x, y);    // true
```

`Arrays.hashCode` and `deepHashCode` exist for the same reason. An array used as
a `HashMap` key hashes by identity, which is almost never what anyone means.

## Arrays are covariant, and that is a hole

`String[]` is a subtype of `Object[]`. That sounds convenient and is unsound:

```java
Object[] objects = new String[1];   // legal, because String[] IS-A Object[]
objects[0] = Integer.valueOf(42);   // compiles fine
                                    // throws ArrayStoreException at runtime
```

Every array store is therefore checked at runtime, on every write, because the
compiler cannot know what the array's real element type is. **Generics are
deliberately *invariant* — `List<String>` is not a `List<Object>` — precisely to
move this failure back to compile time.** Array covariance predates generics; it
was needed to make `Arrays.sort(Object[])` usable before there was a `<T>`.

## Copying

```java
int[] longer = Arrays.copyOf(xs, 5);          // padded with the default value
int[] slice = Arrays.copyOfRange(xs, 1, 3);   // [from, to)
System.arraycopy(src, 0, dst, 2, len);        // the low-level engine
int[] same = xs.clone();                      // a copy, one level deep
```

`clone` and `copyOf` are **shallow**: cloning an `int[][]` gives you a new outer
array pointing at the *same* rows. Writing `copy[0][0] = 9` changes the
original. Copying deeply means copying every row.

`System.arraycopy` handles overlapping ranges correctly, which is why it is what
you use to shift elements inside one array.

## The Arrays toolkit

```java
Arrays.sort(xs);                    // in place, returns nothing
Arrays.fill(xs, 7);                 // in place
Arrays.binarySearch(sorted, 5);     // index, or a negative encoding
Arrays.stream(xs).sum();
```

`Arrays.sort` mutates its argument and returns `void`; if you needed the
original, copy first. On primitives it is a dual-pivot quicksort (not stable,
but stability is meaningless for primitives); on objects it is a stable merge
sort.

`binarySearch` returns the index when found, and otherwise
`-(insertion point) - 1`:

```java
int[] sorted = {1, 3, 5, 7};
Arrays.binarySearch(sorted, 5);     // 2
Arrays.binarySearch(sorted, 4);     // -3  → would insert at index 2
Arrays.binarySearch(sorted, 0);     // -1  → would insert at index 0
```

The `-1` offset exists so that "not found at position 0" is distinguishable from
"found at position 0". Treating a negative result as a plain "missing" is fine;
treating it as an index is a bug. And the array *must* already be sorted — on
unsorted input the result is unspecified, not an error.

## Prefer a List

Most code that reaches for an array wants a `List`:

```java
List<Integer> ids = List.of(1, 2, 3);        // immutable, sensible equals
List<Integer> boxed = Arrays.stream(xs).boxed().toList();
```

Lists have working `equals`/`hashCode`/`toString`, are generic and invariant, can
grow, and read better. Keep arrays for primitives in hot loops, for `byte[]`
buffers, and for interop with APIs that demand them. Note that both `List.of`
and `Stream.toList` return **unmodifiable** lists — `add` throws
`UnsupportedOperationException` — and that `List.of` rejects null elements.

## What to build

| Method | What it does |
| --- | --- |
| `filled(int, int)` | A new array with every slot set |
| `grow(int[], int)` | A longer copy, padded with defaults |
| `insertAt(int[], int, int)` | Insert into the middle, via `System.arraycopy` |
| `render(int[][])` | A readable string for a nested array |
| `sortedCopy(int[])` | Sorted, without disturbing the input |
| `indexOfSorted(int[], int)` | `binarySearch`, negative encoding and all |
| `sameContents(int[], int[])` | Value equality for arrays |
| `storeIntoStringArray()` | Demonstrates the covariance hole |
| `boxedList(int[])` | An `int[]` as an immutable `List<Integer>` |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `Object[] objects = new String[1]` compiles. Write the equivalent line for
   `List` and explain, in one sentence, why the compiler rejects it.
2. `Arrays.asList(intArray)` gives a list of length 1. What is its element type,
   and what would you have to change about `int` for it to behave otherwise?
3. `binarySearch` on an unsorted array returns *something*. Construct an input
   where it confidently returns the wrong index.
4. `int[][] copy = grid.clone()` then `copy[0][0] = 9` changes `grid`. How many
   `clone` calls does an honest deep copy of an `int[][]` need?
