# 03 — Comparators

JavaScript sorts with `(a, b) => a - b` and, by default, by string. Java has two
separate mechanisms and a written contract that the sort algorithm will actually
enforce against you at runtime.

## Comparable is the type's own opinion

```java
record Employee(String name, int age, String department)
        implements Comparable<Employee> {

    @Override
    public int compareTo(Employee other) {
        return name.compareTo(other.name);
    }
}
```

Implementing `Comparable` gives a type a *natural order* — the one used by
`Collections.sort(list)`, `list.sort(null)`, `TreeSet`, `TreeMap` and
`stream().sorted()` with no argument. A type gets exactly one, so it should be
the obvious one or none at all. `String`, all the wrappers, `LocalDate` and
`BigDecimal` have one; most domain types should not.

Negative means "before", positive means "after", zero means "equivalent". The
magnitude is meaningless — only the sign is read.

## Comparator is everybody else's opinion

```java
Comparator<Employee> byDepartment = Comparator.comparing(Employee::department);
Comparator<Employee> byDepartmentThenName = byDepartment.thenComparing(Employee::name);
Comparator<Employee> lastDepartmentFirst = byDepartment.reversed();
```

`Comparator.comparing(keyExtractor)` builds one from a getter. The combinators
chain, and reading them aloud is usually enough to know what they do — with one
exception, below.

There are four key-extractor factories and choosing wrongly costs a boxing
allocation per comparison:

```java
Comparator.comparing(Employee::age)      // key type Integer — boxes every call
Comparator.comparingInt(Employee::age)   // key type int — no allocation
```

Both are correct. On a million-element sort the first one allocates tens of
millions of `Integer` objects for nothing. `comparingLong` and
`comparingDouble` complete the set, and `thenComparingInt` matches.

## The trap: `reversed()` reverses everything before it

`reversed()` is a method on the whole comparator you have built so far, not a
modifier on the last clause you wrote.

```java
// "by department, then oldest first" — WRONG
Comparator.comparing(Employee::department)
          .thenComparingInt(Employee::age)
          .reversed();
// departments now come out Z→A too
```

```java
// "by department, then oldest first" — right
Comparator.comparing(Employee::department)
          .thenComparing(Employee::age, Comparator.reverseOrder());
```

The second form is the two-argument overload: a key extractor *and* a comparator
for that key. The same overload is how you handle nulls in a field:

```java
Comparator.comparing(Employee::name, Comparator.nullsFirst(Comparator.naturalOrder()));
```

`Comparator.nullsFirst(c)` on its own wraps a comparator to tolerate null
*elements*; passed as the second argument it tolerates a null *key*. Without one
of those, a null name is a `NullPointerException` in the middle of a sort.

## Never compare by subtracting

```java
Comparator<Integer> broken = (a, b) -> a - b;
broken.compare(Integer.MIN_VALUE, 1);   // 2147483647 — "MIN_VALUE is bigger"
```

`a - b` overflows the moment the operands are more than `Integer.MAX_VALUE`
apart, and the sign flips. It works on every test you write with small numbers
and then loses data in production. `Integer.compare(a, b)` is branch-free, does
not overflow, and is what `comparingInt` uses.

## The trap: the contract is enforced

A comparator must be a **total order**:

- *antisymmetric*: `sgn(compare(a, b)) == -sgn(compare(b, a))`
- *transitive*: `a < b` and `b < c` implies `a < c`
- *consistent*: `compare(a, b) == 0` implies `sgn(compare(a, x)) == sgn(compare(b, x))` for every `x`

```java
Comparator<Employee> broken = (a, b) -> a.age() < b.age() ? -1 : 1;
```

That never returns 0, so two equal ages compare as "greater" in both directions
— antisymmetry gone. Sorting four elements with it works fine. Sorting a hundred
throws:

```
java.lang.IllegalArgumentException: Comparison method violates its general contract!
```

`Collections.sort` is TimSort, which merges pre-detected runs and checks its own
invariants as it goes. It only *notices* a broken comparator when the input is
big enough to take the merge path — so this is a bug that appears the first time
your data grows, in a stack trace containing none of your code. When you see
that message, the comparator is what to look at, and the usual culprit is a
ternary with no zero case.

## Stability, and consistency with equals

Java's object sorts are **stable**: elements that compare equal keep their
original relative order. That is what makes "sort by date, then sort by author"
work as a two-pass operation. (`Arrays.sort` on a primitive array is *not*
stable — it is a dual-pivot quicksort, and there is nothing to observe anyway.)

Separately, a natural order is "consistent with equals" when `a.compareTo(b) ==
0` exactly when `a.equals(b)`. Ours is not — it compares names only — and the
sorted collections care:

```java
var ann30 = new Employee("ann", 30, "eng");
var ann40 = new Employee("ann", 40, "ops");

new HashSet<>(List.of(ann30, ann40)).size();   // 2 — equals says different
new TreeSet<>(List.of(ann30, ann40)).size();   // 1 — compareTo says the same
```

`TreeSet` and `TreeMap` are documented as behaving "strangely" here, and this is
what that means: they ignore `equals` entirely and define membership with the
comparator. It is not a bug, it is the contract, and it is why `TreeSet<String>`
built with `String.CASE_INSENSITIVE_ORDER` treats `"Hello"` and `"HELLO"` as one
element.

## What to build

| Method | What it does |
| --- | --- |
| `Employee.compareTo` | The natural order: by name |
| `byAgeThenName()` | Youngest first, ties broken by name |
| `byDepartmentThenAgeDescending()` | The one `reversed()` gets wrong |
| `byNameNullsFirst()` | Tolerates a null name |
| `sortedBy(List, Comparator)` | A sorted copy, leaving the input alone |
| `namesByDepartment(List)` | Names sorted by department only |
| `subtractCompare(int, int)` | `a - b`, so you can watch it fail |
| `safeCompare(int, int)` | The same intent, done properly |
| `brokenByAge()` | A comparator that violates the contract |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `sortedBy` must work on a `List.of`. What does that rule out, and what is the
   difference between `list.sort(c)` and `list.stream().sorted(c).toList()`?
2. `brokenByAge()` throws at 100 elements and not at 4. Find the smallest list
   it throws on. Is that number stable across JDK versions? Should you write a
   test that depends on it?
3. `Comparator.comparing(Employee::name)` on a list containing a null
   *Employee* still throws even with `nullsFirst` on the key. Which wrapper do
   you need where?
4. `Comparator.comparing` returns a `Serializable` comparator when the lambda is
   serializable. Look at why that clause is in the javadoc, and what it costs.
