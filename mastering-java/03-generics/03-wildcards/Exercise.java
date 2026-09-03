import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * Part 03, Lesson 03 — Wildcards
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
 * `Animal`, `Dog` and `Cat` come from support/ and are already written.
 *
 * The signatures here are given to you complete, wildcards and all. The work is
 * in the bodies — and in at least one case the body you first write will not
 * compile, which is the point.
 */
class Solution {

    /**
     * The total of every element, as a double.
     *
     *   sumAll(List.of(1, 2, 3))          -> 6.0
     *   sumAll(List.of(1.5, 2.5))         -> 4.0
     *   sumAll(Set.of())                  -> 0.0
     *
     * `? extends Number` is what lets a List<Integer> and a List<Double> both
     * reach this method. It is a producer: you may read Numbers out, and you
     * may not put anything in.
     */
    static double sumAll(Collection<? extends Number> numbers) {
        throw new UnsupportedOperationException("sumAll: not implemented");
    }

    /**
     * Append the first `count` squares — 0, 1, 4, 9, 16 … — to the sink, in
     * order. Existing contents are kept.
     *
     *   List<Number> ns = new ArrayList<>(); fillSquares(ns, 4)  -> [0, 1, 4, 9]
     *   List<Object> os = new ArrayList<>(); fillSquares(os, 1)  -> [0]
     *   fillSquares(sink, 0)                                     -> unchanged
     *   fillSquares(sink, -1)                                    -> throws IllegalArgumentException
     *
     * `? super Integer` is a consumer: anything that can hold an Integer will
     * do. Reading from it would give you Object and nothing better.
     */
    static void fillSquares(List<? super Integer> sink, int count) {
        throw new UnsupportedOperationException("fillSquares: not implemented");
    }

    /**
     * Append every element of `src` to `dest`, in order, and return how many
     * were moved. `src` is not modified.
     *
     *   List<Animal> dest = ...; List<Dog> src = ...;
     *   copyInto(dest, src)  -> src.size(), and dest now ends with the dogs
     *
     * PECS in a single signature: `src` produces, `dest` consumes. Written this
     * way it accepts the pairing a caller actually has — a List<Dog> flowing
     * into a List<Animal> — which the invariant version would reject.
     */
    static <T> int copyInto(List<? super T> dest, List<? extends T> src) {
        throw new UnsupportedOperationException("copyInto: not implemented");
    }

    /**
     * How many elements are null.
     *
     *   countNulls(Arrays.asList("a", null, null))  -> 2
     *   countNulls(List.of("a"))                    -> 0
     *   countNulls(List.of())                       -> 0
     *
     * Nothing here needs to know the element type, so the unbounded wildcard is
     * the honest parameter. `Collection<Object>` would be wrong — a
     * List<String> is not one.
     */
    static int countNulls(Collection<?> items) {
        throw new UnsupportedOperationException("countNulls: not implemented");
    }

    /**
     * Exchange the elements at positions i and j, in place.
     *
     *   List<String> l = new ArrayList<>(List.of("a", "b", "c"));
     *   swap(l, 0, 2)   ->  l is now ["c", "b", "a"]
     *   swap(l, 1, 1)   ->  unchanged
     *   swap(l, 0, 9)   ->  throws IndexOutOfBoundsException
     *
     * Write the obvious body first and watch it fail to compile: you took a
     * value out of the list and cannot put it back into the same list. Each `?`
     * is a separate unknown type as far as the compiler is concerned. The way
     * out is a second, private, generic method — see the README on capture.
     *
     * `java.util.Collections.swap` already does this exact job, and calling it
     * would turn every test green while teaching you nothing. Write the
     * exchange yourself, here, through a capture helper of your own.
     */
    static void swap(List<?> items, int i, int j) {
        throw new UnsupportedOperationException("swap: not implemented");
    }

    /**
     * A new mutable list holding everything in `a` then everything in `b`.
     *
     *   List<Animal> all = concat(dogs, cats)   -> the dogs, then the cats
     *   concat(List.of(), List.of(1))           -> [1]
     *
     * Both parameters are producers. The RETURN type is not a wildcard — a
     * method that returns `List<? extends T>` forces every caller to deal with
     * a wildcard they did not ask for.
     */
    static <T> List<T> concat(List<? extends T> a, List<? extends T> b) {
        throw new UnsupportedOperationException("concat: not implemented");
    }

    /**
     * The largest element by natural order.
     *
     *   maxOf(Set.of(3, 1, 2))                -> 3
     *   maxOf(List.of(new Dog("rex")))        -> does not compile: Dog has no order
     *   maxOf(List.of())                      -> throws NoSuchElementException
     *
     * A bound and a wildcard doing different jobs in one signature: the bound
     * says what T can do, the wildcard says how loosely the collection may be
     * typed.
     */
    static <T extends Comparable<? super T>> T maxOf(Collection<? extends T> items) {
        throw new UnsupportedOperationException("maxOf: not implemented");
    }

    /**
     * Try to store `value` into slot 0 of `target`. Return true if the store
     * succeeded, false if the JVM rejected it.
     *
     *   storeInto(new Object[1], 42)    -> true
     *   storeInto(new Number[1], 42)    -> true
     *   storeInto(new String[1], "ok")  -> true
     *   storeInto(new String[1], 42)    -> false
     *
     * This compiles with no warning at all, because arrays are covariant: a
     * String[] IS an Object[]. The check has been moved to runtime, and the
     * exception it throws is the one generics were designed to make impossible.
     * Catch only that exception; let anything else out.
     */
    static boolean storeInto(Object[] target, Object value) {
        throw new UnsupportedOperationException("storeInto: not implemented");
    }
}
