import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.Predicate;

/**
 * Part 03, Lesson 05 — Generic API Design
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
 * The signatures are given in full. Read each one before implementing it and
 * ask what it would cost a caller if the wildcards were removed — the tests
 * make calls that only the wildcarded versions accept.
 */
class Solution {

    /**
     * The two halves of a partition. A three-line record beats returning
     * Object[], a Map<String, Object>, or a pair of out-parameters.
     */
    record Split<T>(List<T> matched, List<T> rest) {
    }

    /**
     * What UserBuilder builds. Records are shallowly immutable: the `tags`
     * field cannot be reassigned, but the list it points at can still be
     * mutated by anyone holding a reference to it.
     */
    record User(String name, int age, List<String> tags) {
    }

    /**
     * A mutable copy of anything readable, as a List.
     *
     *   copyOf(Set.of(1, 2))                -> a List<Integer> of both
     *   List<Number> ns = copyOf(intList)   -> legal, T is inferred as Number
     *   copyOf(List.of())                   -> []
     *
     * The result must be mutable and must not be a view: changing it must not
     * change the source, and vice versa.
     */
    static <T> List<T> copyOf(Collection<? extends T> source) {
        throw new UnsupportedOperationException("copyOf: not implemented");
    }

    /**
     * Every element, transformed, in order, in a new mutable list.
     *
     *   mapAll(List.of("a", "bb"), String::length)  -> [1, 2]
     *   mapAll(List.of(), fn)                       -> []
     *
     * Note the two wildcards on the Function. `? super T` lets a caller reuse a
     * Function<Object, String> here; `? extends R` lets that same function fill
     * a List<CharSequence>. With a plain Function<T, R> both calls are rejected
     * for no reason, and the tests make both of them.
     */
    static <T, R> List<R> mapAll(Collection<? extends T> source,
                                 Function<? super T, ? extends R> transform) {
        throw new UnsupportedOperationException("mapAll: not implemented");
    }

    /**
     * Split the input in two by a predicate, preserving order in both halves.
     *
     *   partition(List.of(1, 2, 3, 4), n -> n % 2 == 0)
     *       -> Split[matched=[2, 4], rest=[1, 3]]
     *   partition(List.of(), p)  -> Split[matched=[], rest=[]]
     *
     * Both lists must be mutable and independent of the source.
     */
    static <T> Split<T> partition(Collection<? extends T> source, Predicate<? super T> test) {
        throw new UnsupportedOperationException("partition: not implemented");
    }

    /**
     * The first element satisfying the predicate.
     *
     *   firstMatching(List.of(1, 2, 3), n -> n > 1)          -> Optional[2]
     *   firstMatching(List.of(1), n -> n > 9)                -> Optional.empty()
     *   firstMatching(Arrays.asList(null, "a"), s -> true)   -> Optional["a"]
     *
     * Optional<T> rather than a nullable T: the signature then tells the caller
     * that absence is a real answer, instead of leaving them to find out.
     * Null elements are skipped — the predicate is never called with null, and
     * a null is never the answer, because Optional cannot hold one.
     */
    static <T> Optional<T> firstMatching(Collection<? extends T> source, Predicate<? super T> test) {
        throw new UnsupportedOperationException("firstMatching: not implemented");
    }

    /**
     * A new mutable list holding everything from the source in ascending
     * natural order.
     *
     *   sortedCopy(Set.of(3, 1, 2))          -> [1, 2, 3]
     *   sortedCopy(List.of("b", "a"))        -> ["a", "b"]
     *   sortedCopy(List.of())                -> []
     *
     * The bound says what T must be able to do; the wildcard says how loosely
     * the collection may be typed. They are answering different questions.
     */
    static <T extends Comparable<? super T>> List<T> sortedCopy(Collection<? extends T> source) {
        throw new UnsupportedOperationException("sortedCopy: not implemented");
    }

    /**
     * A builder base class that does not know its own subclass — except that S
     * tells it. Every step returns S, so a chain that starts in the base can
     * continue in the subclass.
     */
    abstract static class AbstractBuilder<S extends AbstractBuilder<S>> {

        protected String name = "";
        protected final List<String> tags = new ArrayList<>();

        /**
         * The subclass's own type, as a value. Given to you as an abstract
         * method rather than an unchecked `(S) this` in the base class, so that
         * every implementation is a checked `return this;`.
         */
        protected abstract S self();

        /**
         * Set the name and continue the chain.
         *
         *   new UserBuilder().named("ann")  -> a UserBuilder, not an AbstractBuilder
         *
         * `return this;` will not compile — `this` is an AbstractBuilder<S>, and
         * the method promises an S.
         */
        S named(String name) {
            throw new UnsupportedOperationException("named: not implemented");
        }

        /**
         * Append a tag and continue the chain. Repeated calls accumulate.
         *
         *   new UserBuilder().addTag("x").addTag("y")  -> tags are [x, y]
         */
        S addTag(String tag) {
            throw new UnsupportedOperationException("addTag: not implemented");
        }
    }

    /**
     * The concrete builder. It passes itself as the type argument, which is
     * what turns every inherited `S` into `UserBuilder`.
     */
    static final class UserBuilder extends AbstractBuilder<UserBuilder> {

        private int age;

        /**
         * One line, and the only place the self type becomes real.
         */
        @Override
        protected UserBuilder self() {
            throw new UnsupportedOperationException("self: not implemented");
        }

        /**
         * Set the age and continue the chain.
         *
         *   new UserBuilder().named("ann").aged(30)  -> legal in that order
         *   new UserBuilder().aged(30).named("ann")  -> and in this one
         */
        UserBuilder aged(int age) {
            throw new UnsupportedOperationException("aged: not implemented");
        }

        /**
         * The finished value.
         *
         *   new UserBuilder().named("ann").aged(30).addTag("x").build()
         *       -> User[name=ann, age=30, tags=[x]]
         *   new UserBuilder().build()
         *       -> User[name=, age=0, tags=[]]
         *
         * The tags in the built User must be an UNMODIFIABLE SNAPSHOT: adding a
         * tag to the builder afterwards must not change a User already built,
         * and the caller must not be able to mutate it either.
         */
        User build() {
            throw new UnsupportedOperationException("build: not implemented");
        }
    }
}
