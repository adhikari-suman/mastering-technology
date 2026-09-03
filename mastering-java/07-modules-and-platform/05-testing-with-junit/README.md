# 05 — Testing with JUnit

Every lesson so far has been graded by JUnit. This one turns it round: the
framework becomes the subject, and the exercise is to reimplement the pieces of
it whose behaviour people guess at.

## The lifecycle

```java
class OrderTest {
    @BeforeAll  static void openDatabase() { }   // once, before everything
    @BeforeEach void freshCart()          { }    // before every @Test
    @Test       void addsItem()           { }
    @Test       void removesItem()        { }
    @AfterEach  void rollback()           { }    // after every @Test
    @AfterAll   static void closeDatabase() { }  // once, at the end
}
```

For two tests that is: `@BeforeAll`, then `@BeforeEach`/test/`@AfterEach`
twice, then `@AfterAll`. JUnit constructs **a new instance of the test class
per test method** — that is why `@BeforeAll` and `@AfterAll` must be `static`,
and why a field assigned in one test is gone by the next. Fresh state per test
is the default, not something you arrange.

`@AfterEach` runs even when the test failed. `@BeforeEach` failing skips the
test and still runs `@AfterEach` for whatever did get set up.

## Three kinds of not-passing

```java
assertEquals(2, 1 + 2);                  // AssertionFailedError  -> failed
throw new IllegalStateException();       // any other Throwable   -> errored
assumeTrue(dockerIsRunning());           // TestAbortedException  -> aborted
```

JUnit distinguishes them, and only the first two turn a build red:

- **failed** — an `AssertionError`. Your expectation was wrong.
- **errored** — anything else escaped. The test did not get far enough to have
  an opinion.
- **aborted** — an assumption was false. The test declined to run at all.

`AssertionError` extends `Error`, not `Exception`. That is deliberate: a
`catch (Exception e)` somewhere in the code under test cannot swallow a failing
assertion. A `catch (Throwable t)` can, and does.

An aborted test is **not a failure**, which makes assumptions dangerous.
`assumeTrue(System.getenv("CI") != null)` at the top of a class silently
disables the whole thing on every laptop, and the summary reads green.

## Assertions worth knowing

```java
assertEquals(expected, actual, "message");   // expected FIRST, always
assertThrows(IllegalArgumentException.class, () -> parse("nope"));
assertAll("shipping",
    () -> assertEquals("EH1", address.postcode()),
    () -> assertEquals("UK",  address.country()));
```

`assertThrows` returns what it caught, so you can go on and assert about the
message. It accepts **subclasses** of the type you named: asking for
`RuntimeException` will happily accept a `NullPointerException`, which is
usually not what you meant.

`assertAll` is the one people skip and should not. Sequential assertions stop
at the first failure, so you fix one line, rerun, and discover the next.
`assertAll` runs every one and reports all the failures together as a
`MultipleFailuresError` — one round trip instead of four.

The third argument is a *message*, not a description of the assertion. Use it
to say what the reader could not have worked out:

```java
assertEquals(-3, intDivide(-7, 2), "toward zero, not floor");
```

## Naming and structure

```java
@DisplayName("Shopping cart")
class CartTest {
    @Nested
    @DisplayName("when empty")
    class WhenEmpty {
        @Test @DisplayName("has a total of zero") void totalIsZero() { }
    }
}
```

`@Nested` inner classes are non-static, get their own `@BeforeEach`, and
inherit the outer class's. They exist to give a group of tests a shared
context; the display names then read as sentences in the report.

Without `@DisplayName`, JUnit generates one from the method: `addsItem()`, or
`accepts(String, int)` when there are parameters. That is the `Standard`
generator; `ReplaceUnderscores` turns `adds_an_item` into "adds an item".

## Parameterized tests

```java
@ParameterizedTest
@ValueSource(strings = { "racecar", "level", "" })
void isPalindrome(String s) { assertTrue(Text.isPalindrome(s)); }

@ParameterizedTest
@CsvSource({ "1, 1, 2", "2, 3, 5", "-1, 1, 0" })
void adds(int a, int b, int expected) { assertEquals(expected, a + b); }

@ParameterizedTest
@MethodSource("cases")
void handles(String input, int expected) { }
static Stream<Arguments> cases() { return Stream.of(arguments("x", 1)); }
```

Each row is a separate test with its own pass or fail, not one test with a
loop. `@MethodSource` needs a `static` factory (or a per-class test instance),
and it is the one to reach for when the cases are more than literals.

`@CsvSource` has rules that catch everyone:

```
"1, 2, three"   ->  "1", "2", "three"      whitespace around a value is trimmed
"'a, b', c"     ->  "a, b", "c"            the quote character is a SINGLE quote
"a,,b"          ->  "a", null, "b"         an empty value is NULL
"a,'',b"        ->  "a", "",   "b"         an empty QUOTED value is ""
```

Empty means null and `''` means empty string. A test that takes an `int` and
gets a null column fails with an `ArgumentConversionException` that says
nothing about commas.

## The trap: one reason to fail

```java
@Test
void userService() {                    // what is this test called?
    User u = service.create("ada");
    assertEquals("ada", u.name());
    assertTrue(service.exists("ada"));
    service.delete("ada");
    assertFalse(service.exists("ada"));  // and if THIS fails, what broke?
}
```

Four assertions, three behaviours, one name. When it goes red the name tells
you nothing, and the first failing assertion hides the rest. Split it: one
behaviour per test, named for the behaviour, so the report is a list of
statements about the system and a red one is a sentence that stopped being
true.

The other half of the discipline is what *not* to test. Do not test getters,
do not test the framework, do not test that a mock you configured returns what
you configured it to return. And do not assert on private state — lesson 02's
`setAccessible` makes it possible, and it converts every refactor into a test
failure.

## What to build

| Method | What it does |
| --- | --- |
| `lifecycle(List)` | The callback order for a class of tests |
| `outcome(Throwable)` | passed / failed / errored / aborted |
| `expectThrows(Class, Runnable)` | `assertThrows`, written out |
| `collectFailures(List)` | `assertAll`'s run-them-all behaviour |
| `csvRow(String)` | One `@CsvSource` line, with all its rules |
| `displayName(String, List)` | JUnit's generated name for a method |
| `parameterizedNames(String, List)` | `{index}`, `{0}`, `{arguments}` |
| `verdict(List)` | Does this suite turn the build red? |

## Running it

```bash
cp Exercise.java Solution.java   # once
../../mj watch                   # from this folder
```

The test file for this lesson uses `@Nested`, `@ParameterizedTest`,
`@ValueSource`, `@CsvSource` and `@MethodSource` on purpose. Read it as
documentation.

## Going deeper

1. JUnit builds a new test instance per method. What would break if it did
   not, and what does `@TestInstance(PER_CLASS)` cost you when you turn that
   off to get a non-static `@MethodSource`?
2. `assertThrows` accepts subclasses. Write the assertion that pins the exact
   type, and decide when that is worth the strictness.
3. An aborted test reads as green. How would you notice that an assumption has
   been silently disabling a suite for six months?
4. A `@Test` method may be package-private but not `private`, and `@BeforeAll`
   must be `static`. Reflection could reach a private method perfectly well
   (lesson 02), so the framework is choosing to refuse. What is it protecting
   you from?
