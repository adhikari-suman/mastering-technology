# 04 — Methods and Parameters

Calling a method looks like the least interesting thing in the language. It is
where Java hides three rules that surprise people: how an overload is chosen,
what a `...` parameter really is, and what "passing an object" actually passes.

## A signature is name plus parameter types

The return type is not part of the signature, so two methods differing only in
what they return do not compile. Same name, different parameter types, and you
have an **overload** — resolved entirely at compile time, from the *static*
types of the arguments.

```java
static void log(Object o) { }
static void log(String s) { }

Object value = "hi";
log(value);      // calls log(Object) — the variable's type decides, not "hi"
```

That is the opposite of virtual dispatch, which uses the runtime type of the
*receiver*. Overloads are picked by the compiler; overrides are picked by the
JVM.

## Overload resolution: widening, then boxing, then varargs

The compiler tries three passes, and stops at the first that finds a match:

1. **Without** boxing or varargs — primitive widening only.
2. **With** boxing/unboxing, still no varargs.
3. **With** varargs.

```java
static String pick(long value)    { return "long"; }
static String pick(Integer value) { return "Integer"; }
static String pick(int... values) { return "varargs"; }

pick(1);       // "long"     — int widens to long in pass 1
pick(1, 2);    // "varargs"  — nothing else can take two
```

`pick(1)` calling the `long` overload while an `Integer` overload sits right
there is the classic result. Widening a primitive is considered cheaper than
boxing it, and boxing cheaper than allocating a varargs array. **Delete
`pick(long)` and the same call silently starts calling a different method** —
which is why adding an overload to a published API is a source-compatible,
behaviour-breaking change.

## Varargs is an array with syntax

`int... values` *is* `int[] values`, plus permission for the caller to omit the
array:

```java
sum(1, 2, 3);              // the compiler allocates new int[] {1, 2, 3}
sum();                     // an empty array, not null
sum(new int[] {4, 5});     // passing the array directly is also legal
```

Because it is an array, generic varargs are where things get strange:

```java
Arrays.asList(new Integer[] {1, 2}).size();   // 2 — spread into elements
Arrays.asList(new int[] {1, 2}).size();       // 1 — a List<int[]> of one array
```

`int[]` is not `Integer[]`, and `T` cannot be a primitive, so the whole `int[]`
becomes the single element. Only one `...` parameter is allowed, and it must be
last.

## Java is pass-by-value. Always.

Every argument is copied into the parameter. When the argument is a reference,
the *reference* is copied — so both names point at one object, and the callee
can mutate what they share but cannot change which object the caller's variable
names:

```java
static void poke(int[] target) {
    target[0] = 99;                  // the caller sees this
    target = new int[] {-1, -1};     // and never sees this
}

int[] mine = {1, 2};
poke(mine);
mine;      // {99, 2}
```

"Pass by reference" would mean the second line rebound the caller's variable. It
does not, and no Java construct does. There is no `out` parameter and no swap
you can write. If a method must hand back two things, return an object.

## There are no default parameters

Java has no `greet(name, greeting = "Hello")`. You write overloads, and the
short one delegates:

```java
static String greet(String name) { return greet(name, "Hello"); }

static String greet(String name, String greeting) {
    return greeting + ", " + name;
}
```

This is fine for two parameters and unbearable at five — *n* optional parameters
means up to 2ⁿ overloads, the "telescoping constructor" problem. Past three, the
idiomatic answers are a builder or a parameter object (a `record` works well).

Note that `"Hello, " + null` is `"Hello, null"`, not a crash: string
concatenation converts a null reference to the four characters `null`. Missing
arguments in Java become compile errors; missing *values* become the string
"null" in your logs.

## static and instance

A `static` method belongs to the class and has no `this`. An instance method
gets an implicit `this` and can read per-object fields. The two kinds of state
behave completely differently:

```java
class Gauge {
    static int readings;   // one, shared by every instance
    int myReadings;        // one per instance

    void observe() { readings++; myReadings++; }
}

Gauge a = new Gauge(), b = new Gauge();
a.observe(); a.observe(); b.observe();

a.myReadings;      // 2
b.myReadings;      // 1 — b has its own field
Gauge.readings;    // 3 — one field, reached through the class
```

Calling a static method through an instance (`obj.staticMethod()`) compiles and
is a well-known way to confuse a reader; call it through the class.

## Recursion and the stack

Each call pushes a frame holding parameters and locals. The stack is a fixed
size — 1 MB or 2 MB per thread depending on the platform, and readable with
`java -XX:+PrintFlagsFinal -version | grep ThreadStackSize` (the value is in
KB) — so recursion depth is bounded in the tens of thousands, and exceeding it
throws `StackOverflowError` (an `Error`, not an `Exception`: it is not something
to catch and continue from).

Java does **not** guarantee tail-call elimination, and HotSpot does not perform
it. A tail-recursive loop in Java is still a real stack of frames. Deep
recursion over a linked structure needs an explicit stack or a loop.

Recursion is fine for the shallow, self-similar cases — a factorial, a tree of
depth 30 — and there the other lesson is arithmetic: `20!` is the largest
factorial that fits in a `long`, and `21!` wraps silently unless you reach for
`Math.multiplyExact`.

## What to build

| Method | What it does |
| --- | --- |
| `pick(long)` | Returns `"long"` |
| `pick(Integer)` | Returns `"Integer"` |
| `pick(int...)` | Returns `"varargs"` |
| `sum(int...)` | Adds a varargs array, however it arrives |
| `poke(int[])` | Mutates through a reference, then rebinds it |
| `greet(String)` | The one-argument overload, delegating |
| `greet(String, String)` | The real implementation |
| `factorial(int)` | Recursive, refusing to overflow silently |
| `record()` | Instance method over per-object and shared state |
| `totalCalls()` | Static reader of the shared counter |

The three `pick` overloads have trivial bodies. The exercise is not writing
them; it is predicting which one each call in the test file selects.

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

## Going deeper

1. `pick(1)` chooses `pick(long)`. What does `pick(null)` choose, and why does
   the compiler refuse before you can find out?
2. If varargs is really an array, what does `sum(null)` do at runtime? Now try
   the same on an `Object...` method: `f(null)` and `f((Object) null)` disagree
   there. Why can an `int...` parameter never show that disagreement?
3. You cannot write a `swap(int a, int b)` in Java. Write down what you *would*
   need from the language, and then find how `AtomicInteger` sidesteps it.
4. `factorial(21)` overflows a `long`. At what *n* does it overflow a `double`,
   and which of the two failures is worse to debug?
