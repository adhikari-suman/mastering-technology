import java.util.ArrayList;
import java.util.List;
import java.util.function.IntSupplier;

/**
 * Part 01, Lesson 06 — Classes and Objects
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

    /** Given to you — where `note` records what ran. Leave both alone. */
    static final List<String> LOG = new ArrayList<>();

    /** Given to you. Records a stage and hands the name straight back, so it
     *  can be used as a field initialiser: `String name = note("field");` */
    static String note(String stage) {
        LOG.add(stage);
        return stage;
    }

    /** Given to you — the outer instance's state, readable by `Badge`. */
    private final String label;

    /**
     * Store the label.
     *
     *   new Solution("beta")
     *
     * The parameter shadows the field, so an unqualified `label = label`
     * assigns the parameter to itself and leaves the field null. Declaring this
     * constructor also removes the no-argument one Java would otherwise supply,
     * so `new Solution()` will no longer compile — that is expected.
     */
    Solution(String label) {
        throw new UnsupportedOperationException("Solution(String): not implemented");
    }

    /**
     * An INNER class — nested, but not static — so every Badge carries a hidden
     * reference to the Solution that made it, and can read its private fields.
     *
     *   Solution outer = new Solution("beta");
     *   outer.new Badge().render()  ->  "<beta>"
     *
     * Note the creation syntax: an inner class cannot exist without an outer
     * instance, so `new Solution.Badge()` is not a thing you can write.
     */
    class Badge {

        /**
         * Render the enclosing Solution's label wrapped in angle brackets.
         *
         *   "<beta>"
         *
         * `label` is reachable here with no qualification at all. Work out what
         * name it would have if you did qualify it.
         */
        String render() {
            throw new UnsupportedOperationException("Badge.render: not implemented");
        }
    }

    /**
     * A STATIC nested class: a plain class that happens to live in Solution's
     * namespace. It has no outer instance and cannot see `label`.
     */
    static class Point {

        /** Given to you — final, so each must be assigned exactly once. */
        final int x;

        /** Given to you. */
        final int y;

        /**
         * The origin.
         *
         *   new Point()  ->  the same as new Point(0, 0)
         *
         * Delegate to the two-argument constructor with `this(0, 0)` rather
         * than assigning the fields again. Java 25 does let statements precede
         * that call — flexible constructor bodies — but none of them may name
         * `this`, read a field, or call an instance method: the object does not
         * exist until the delegation runs.
         */
        Point() {
            throw new UnsupportedOperationException("Point(): not implemented");
        }

        /**
         * A point at the given coordinates.
         *
         *   new Point(3, 4)
         *
         * The parameters shadow the fields; you will need `this`.
         */
        Point(int x, int y) {
            throw new UnsupportedOperationException("Point(int, int): not implemented");
        }

        /**
         * A readable form, replacing Object's class-name-and-hash default.
         *
         *   new Point(3, 4).toString()  ->  "Point[3, 4]"
         *   new Point().toString()      ->  "Point[0, 0]"
         */
        @Override
        public String toString() {
            throw new UnsupportedOperationException("Point.toString: not implemented");
        }
    }

    /**
     * Encapsulation with something to protect: the balance may never go
     * negative, and `private` is what makes that promise keepable.
     */
    static class Account {

        /** Given to you. Private, and it stays private. */
        private long balance;

        /**
         * Open an account.
         *
         *   new Account(100)  ->  balance 100
         *   new Account(0)    ->  balance 0
         *   new Account(-1)   ->  throws IllegalArgumentException
         */
        Account(long opening) {
            throw new UnsupportedOperationException("Account(long): not implemented");
        }

        /**
         * The current balance.
         *
         * An accessor, not a getter ceremony: it exists because callers need to
         * read the value, while only this class may write it.
         */
        long balance() {
            throw new UnsupportedOperationException("Account.balance: not implemented");
        }

        /**
         * Add money.
         *
         *   deposit(50)  on a balance of 100  ->  150
         *   deposit(0)   -> throws IllegalArgumentException
         *   deposit(-1)  -> throws IllegalArgumentException
         */
        void deposit(long amount) {
            throw new UnsupportedOperationException("Account.deposit: not implemented");
        }

        /**
         * Take money out, if there is enough.
         *
         *   withdraw(40)  on a balance of 100 -> 60
         *   withdraw(101) on a balance of 100 -> throws IllegalArgumentException
         *   withdraw(0)   -> throws IllegalArgumentException
         *
         * A rejected withdrawal must leave the balance exactly as it was: check
         * before you subtract.
         */
        void withdraw(long amount) {
            throw new UnsupportedOperationException("Account.withdraw: not implemented");
        }
    }

    /**
     * Fill in this class with four things that call `note`, in this source
     * order:
     *
     *   1. a static initialiser block:  static { note("static"); }
     *   2. a field initialiser:         String name = note("field");
     *   3. an instance initialiser:     { note("block"); }
     *   4. a constructor:               Trace() { note("constructor"); }
     *
     * Write them in that order, then predict the order they RUN in before you
     * look at the test. Three of the four run once per instance; one does not
     * run per instance at all.
     */
    static class Trace {
    }

    /**
     * Create exactly one Trace and report everything that has been noted, in
     * the order it happened.
     *
     *   initOrder() -> a four-element List<String>
     *
     * Return a snapshot (`List.copyOf(LOG)`) rather than LOG itself, so the
     * caller cannot change the record.
     */
    static List<String> initOrder() {
        throw new UnsupportedOperationException("initOrder: not implemented");
    }

    /**
     * A counter that yields `start`, then `start + 1`, and so on, built as an
     * ANONYMOUS class rather than a lambda.
     *
     *   IntSupplier c = counterFrom(5);
     *   c.getAsInt()  -> 5
     *   c.getAsInt()  -> 6
     *   counterFrom(5).getAsInt() -> 5      a separate counter, separate state
     *
     * The anonymous class needs a field to remember where it is. That field is
     * why this cannot be a lambda: a lambda body has nowhere to keep state, and
     * `start` is captured by value and effectively final, so it cannot be
     * incremented either.
     */
    static IntSupplier counterFrom(int start) {
        throw new UnsupportedOperationException("counterFrom: not implemented");
    }
}
