import java.util.List;

/**
 * Part 02, Lesson 05 — Interfaces
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
 */
class Solution {

    /**
     * Everything an interface can hold, in one declaration.
     *
     *   Greeter.of("ada").greet()   -> "Hello, ada!"
     *   Greeter greeter = () -> "bob";     // one abstract method, so a lambda fits
     *   greeter.greet()             -> "Hello, bob!"
     *
     * Write three things:
     *
     *  - `greet()`, a DEFAULT method: PREFIX, then the name, then the
     *    punctuation. It calls the abstract `name()` — an interface can build
     *    on a method it does not have yet, which is the whole trick.
     *  - `punctuation()`, a PRIVATE method returning "!". Private interface
     *    methods exist so defaults can share code without publishing it; no
     *    caller outside this interface can reach it.
     *  - `of(String)`, a STATIC factory returning a Greeter for that name.
     *    Greeter has exactly one abstract method, so the shortest
     *    implementation is a lambda.
     *
     * PREFIX is a field in an interface, which makes it implicitly
     * `public static final` — a constant, not per-object state.
     */
    interface Greeter {

        String PREFIX = "Hello, ";

        String name();

        default String greet() {
            throw new UnsupportedOperationException("Greeter.greet: not implemented");
        }

        private String punctuation() {
            throw new UnsupportedOperationException("Greeter.punctuation: not implemented");
        }

        static Greeter of(String name) {
            throw new UnsupportedOperationException("Greeter.of: not implemented");
        }
    }

    /** Given. Two interfaces, one signature, two different answers. */
    interface Loud {
        default String hello() {
            return "HELLO";
        }
    }

    /** Given. */
    interface Quiet {
        default String hello() {
            return "hello";
        }
    }

    /**
     * Implement both, and say which one you meant.
     *
     *   new Both().hello()  -> "HELLO/hello"
     *
     * Without the override this class does not compile: Java will not guess
     * between two unrelated defaults. The syntax that names one is
     * `Loud.super.hello()`, and it works only for an interface this class
     * implements directly.
     */
    static final class Both implements Loud, Quiet {

        @Override
        public String hello() {
            throw new UnsupportedOperationException("Both.hello: not implemented");
        }
    }

    /** Given. A more specific Loud. */
    interface Louder extends Loud {
        @Override
        default String hello() {
            return "HELLO!!";
        }
    }

    /**
     * Given, and deliberately empty. `Loud` and `Louder` both supply a
     * `hello()`, and this compiles anyway — Louder extends Loud, so it is the
     * more specific one and there is nothing to disambiguate.
     *
     *   new Sub().hello()  -> "HELLO!!"
     */
    static final class Sub implements Loud, Louder {
    }

    /** Given. An ordinary class with an ordinary method. */
    static class Base {
        public String hello() {
            return "from Base";
        }
    }

    /**
     * Given, and also empty. Base has a `hello()`, Loud has a default
     * `hello()`, and this compiles with no complaint at all.
     *
     *   new Mixed().hello()             -> "from Base"
     *   ((Loud) new Mixed()).hello()    -> "from Base"
     *
     * Read the README on why that is the right rule and still the trap.
     */
    static final class Mixed extends Base implements Loud {
    }

    /**
     * Given. One abstract method, so one lambda's worth of work.
     * `@FunctionalInterface` does not create anything — it asks the compiler to
     * fail this declaration if a second abstract method ever appears.
     */
    @FunctionalInterface
    interface Transform {
        String apply(String s);
    }

    /**
     * A Transform that uppercases.
     *
     *   upper().apply("hi")  -> "HI"
     *
     * Write it as a METHOD REFERENCE, not a lambda — `String::toUpperCase` is
     * the unbound form: the argument the interface passes becomes the receiver
     * the method is called on.
     */
    static Transform upper() {
        throw new UnsupportedOperationException("upper: not implemented");
    }

    /**
     * Compose two transforms, first then second.
     *
     *   chain(upper(), s -> s + "!").apply("hi")     -> "HI!"
     *   chain(s -> s + "!", s -> s + "?").apply("hi") -> "hi!?"
     *   chain(s -> s + "?", s -> s + "!").apply("hi") -> "hi?!"
     *
     * The last two are the same two transforms in the other order, so getting
     * this backwards is a real possibility. Return a lambda that closes over
     * both arguments; captured locals must be effectively final, which
     * parameters you never reassign already are.
     */
    static Transform chain(Transform first, Transform second) {
        throw new UnsupportedOperationException("chain: not implemented");
    }

    /**
     * Apply a transform to every element, returning a new list.
     *
     *   applyAll(upper(), List.of("a", "b"))  -> ["A", "B"]
     *   applyAll(upper(), List.of())          -> []
     *
     * The input list must come back untouched — and it may be immutable, so
     * there is no editing it in place even if you wanted to.
     */
    static List<String> applyAll(Transform transform, List<String> values) {
        throw new UnsupportedOperationException("applyAll: not implemented");
    }

    /**
     * An abstract class, doing the two things an interface cannot: holding
     * instance state, and running a constructor to initialise it.
     *
     *   new Dog("Rex").name()   -> "Rex"
     *   new Dog("Rex").speak()  -> "Rex says woof"
     *
     * Write the constructor, `name()`, and `speak()` — which is a template
     * method: it is complete, but it leans on the abstract `sound()` that only
     * a subclass can answer. `name()` is public because Greeter's `name()` is
     * public, and an implementation may not narrow access.
     */
    static abstract class Animal {

        private final String name;

        Animal(String name) {
            throw new UnsupportedOperationException("Animal: not implemented");
        }

        public String name() {
            throw new UnsupportedOperationException("Animal.name: not implemented");
        }

        abstract String sound();

        String speak() {
            throw new UnsupportedOperationException("Animal.speak: not implemented");
        }
    }

    /**
     * Extends one class, implements one interface — and only writes `sound()`.
     *
     *   new Dog("Rex").sound()  -> "woof"
     *   new Dog("Rex").greet()  -> "Hello, Rex!"
     *
     * That second line is the interesting one. Greeter demands `name()`, Dog
     * never declares it, and the file compiles: the method inherited from
     * Animal satisfies the interface. Concrete beats abstract, and a class
     * beats an interface.
     */
    static final class Dog extends Animal implements Greeter {

        Dog(String name) {
            super(name);
        }

        @Override
        String sound() {
            throw new UnsupportedOperationException("Dog.sound: not implemented");
        }
    }
}
