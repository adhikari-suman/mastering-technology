import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.function.Function;

/**
 * Part 03, Lesson 02 — Bounded Types
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp Exercise.java Solution.java
 *
 * Then write your answers in Solution.java, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * The class below is called `Solution`, not `Exercise`, on purpose. Java only
 * forces a *public* type to match its filename, so a package-private class may
 * live in a file of any name. That is what lets `cp` be the entire setup step:
 * your copy is `Solution.java` holding `class Solution`, which is exactly what
 * the compiler wants, and no renaming is needed.
 *
 * `Item`, `Weapon` and `Suit` come from support/ and are already written.
 *
 * The signatures below are deliberately left for you to complete: each one
 * shows `<T>` where the real bound belongs. Getting the bound wrong shows up as
 * a COMPILE error in ExerciseTest.java rather than a failing assertion — that
 * is the lesson, not a mistake in the tests.
 */
class Solution {

    /**
     * The largest element by natural order.
     *
     *   max(List.of(3, 1, 2))          -> 3
     *   max(List.of("b", "a"))         -> "b"
     *   max(List.of(new Weapon("dagger", 2), new Weapon("axe", 9)))
     *                                  -> the axe
     *   max(List.of())                 -> throws NoSuchElementException
     *
     * The bound needs care. `Weapon` extends `Item implements Comparable<Item>`,
     * so `Weapon` is NOT a `Comparable<Weapon>`. A bound of
     * `T extends Comparable<T>` compiles here and then rejects the Weapon call
     * in the tests. Read the README section on that before you guess.
     */
    static <T> T max(List<T> items) {
        throw new UnsupportedOperationException("max: not implemented");
    }

    /**
     * `value`, pinned into the closed range [low, high].
     *
     *   clamp(5, 1, 10)      -> 5
     *   clamp(0, 1, 10)      -> 1
     *   clamp(99, 1, 10)     -> 10
     *   clamp("m", "a", "f") -> "f"
     *   clamp(5, 10, 1)      -> throws IllegalArgumentException  (low above high)
     *
     * Same bound as `max`.
     */
    static <T> T clamp(T value, T low, T high) {
        throw new UnsupportedOperationException("clamp: not implemented");
    }

    /**
     * Whether the list is in non-decreasing natural order.
     *
     *   isSorted(List.of(1, 2, 2, 3))  -> true
     *   isSorted(List.of(1, 3, 2))     -> false
     *   isSorted(List.of(1))           -> true
     *   isSorted(List.of())            -> true      (vacuously)
     *
     * Equal neighbours are sorted; only a strict decrease breaks it.
     */
    static <T> boolean isSorted(List<T> items) {
        throw new UnsupportedOperationException("isSorted: not implemented");
    }

    /**
     * How many elements are STRICTLY greater than the pivot.
     *
     *   countGreaterThan(List.of(1, 5, 5, 9), 5)  -> 1
     *   countGreaterThan(List.of(1, 2), 9)        -> 0
     *   countGreaterThan(List.of(), 0)            -> 0
     */
    static <T> int countGreaterThan(List<T> items, T pivot) {
        throw new UnsupportedOperationException("countGreaterThan: not implemented");
    }

    /**
     * The total, as a double.
     *
     *   sum(List.of(1, 2, 3))             -> 6.0
     *   sum(List.of(1.5, 2.5))            -> 4.0
     *   sum(List.<Number>of(1, 2.5))      -> 3.5
     *   sum(List.of())                    -> 0.0
     *
     * The bound is what gives you a method to call at all. `Number` has
     * `doubleValue()`; it does NOT have `+`, and it is not `Comparable`.
     */
    static <T> double sum(List<T> values) {
        throw new UnsupportedOperationException("sum: not implemented");
    }

    /**
     * The strictly-positive elements, in ascending natural order, in a new list.
     *
     *   positivesSorted(List.of(3, -1, 0, 2))       -> [2, 3]
     *   positivesSorted(List.of(-1.5, 2.5, 1.0))    -> [1.0, 2.5]
     *   positivesSorted(List.of())                  -> []
     *
     * This one needs TWO capabilities from T — a numeric value to test the sign
     * with, and an ordering to sort by — so it needs a multiple bound. The class
     * bound goes first, interfaces after, joined by `&`. Zero is not positive.
     */
    static <T> List<T> positivesSorted(List<T> values) {
        throw new UnsupportedOperationException("positivesSorted: not implemented");
    }

    /**
     * The next constant of the same enum, wrapping from the last back to the
     * first.
     *
     *   next(Suit.CLUBS)   -> Suit.DIAMONDS
     *   next(Suit.SPADES)  -> Suit.CLUBS
     *
     * Bound this with the JDK's own recursive shape, `E extends Enum<E>`. That
     * is exactly what makes `value.getDeclaringClass()` a `Class<E>`, so
     * `getEnumConstants()` hands you an `E[]` and no cast is needed anywhere.
     * `ordinal()` gives the position.
     */
    static <E> E next(E value) {
        throw new UnsupportedOperationException("next: not implemented");
    }

    /**
     * The element whose extracted key is largest. Ties go to the earlier
     * element.
     *
     *   maxBy(List.of("a", "bbb", "cc"), String::length)  -> "bbb"
     *   maxBy(List.of("aa", "bb"), String::length)        -> "aa"   (first wins)
     *   maxBy(List.of(), f)                               -> throws NoSuchElementException
     *
     * Only ONE of the two type parameters needs a bound here. The elements
     * themselves are never compared — only their keys are.
     */
    static <T, U> T maxBy(List<T> items, Function<T, U> key) {
        throw new UnsupportedOperationException("maxBy: not implemented");
    }
}
