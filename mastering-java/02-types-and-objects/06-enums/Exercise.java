import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Part 02, Lesson 06 — Enums
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
 * ONE ODDITY, before you start. An enum's constants are built when the class is
 * first loaded, so while the constructors below still throw, the failures you
 * see are ExceptionInInitializerError and NoClassDefFoundError rather than the
 * usual "not implemented" message. Nothing is wrong; write the constructors and
 * the noise goes away.
 */
class Solution {

    /**
     * British coins, each knowing what it is worth.
     *
     *   Coin.FIFTY.pence()     -> 50
     *   Coin.PENNY.pence()     -> 1
     *   Coin.values().length   -> 6
     *
     * Write the constructor and the accessor. Note that `pence` is not the same
     * number as `ordinal()` for any coin but the first — which is exactly the
     * point of giving it a field of its own.
     */
    enum Coin {

        PENNY(1),
        TWO(2),
        FIVE(5),
        TEN(10),
        TWENTY(20),
        FIFTY(50);

        private final int pence;

        Coin(int pence) {
            throw new UnsupportedOperationException("Coin: not implemented");
        }

        int pence() {
            throw new UnsupportedOperationException("Coin.pence: not implemented");
        }
    }

    /**
     * What a handful of coins is worth.
     *
     *   total(List.of(Coin.FIFTY, Coin.TWO))  -> 52
     *   total(List.of())                      -> 0
     *   total(List.of(Coin.TEN, Coin.TEN))    -> 20
     */
    static int total(List<Coin> coins) {
        throw new UnsupportedOperationException("total: not implemented");
    }

    /**
     * The coin worth exactly this many pence.
     *
     *   fromPence(50)  -> Coin.FIFTY
     *   fromPence(1)   -> Coin.PENNY
     *   fromPence(3)   -> throws IllegalArgumentException
     *   fromPence(0)   -> throws IllegalArgumentException
     *
     * Search `values()` for the constant whose field matches. The tempting
     * shortcut — indexing `values()` by something derived from the number — is
     * the bug the README is about: the position of a constant is not its
     * identity, and someone will insert a coin one day.
     */
    static Coin fromPence(int pence) {
        throw new UnsupportedOperationException("fromPence: not implemented");
    }

    /** Given. The contract each Op fulfils. */
    interface Calc {
        int apply(int a, int b);
    }

    /**
     * Three operations, each carrying its symbol and its own implementation.
     *
     *   Op.PLUS.apply(2, 3)   -> 5
     *   Op.MINUS.apply(2, 3)  -> -1
     *   Op.TIMES.apply(2, 3)  -> 6
     *   Op.TIMES.symbol()     -> "*"
     *
     * Write the constructor, `symbol()`, and the three `apply` bodies. Each
     * body goes in braces after the constant's arguments — a
     * constant-specific class body — and `apply` needs no declaration on the
     * enum itself, because the interface already declares it.
     *
     * The bodies must be `public`: they implement an interface method.
     */
    enum Op implements Calc {

        PLUS("+") {
            @Override
            public int apply(int a, int b) {
                throw new UnsupportedOperationException("Op.PLUS: not implemented");
            }
        },
        MINUS("-") {
            @Override
            public int apply(int a, int b) {
                throw new UnsupportedOperationException("Op.MINUS: not implemented");
            }
        },
        TIMES("*") {
            @Override
            public int apply(int a, int b) {
                throw new UnsupportedOperationException("Op.TIMES: not implemented");
            }
        };

        private final String symbol;

        Op(String symbol) {
            throw new UnsupportedOperationException("Op: not implemented");
        }

        String symbol() {
            throw new UnsupportedOperationException("Op.symbol: not implemented");
        }
    }

    /**
     * Evaluate an expression written with one of the symbols.
     *
     *   evaluate(2, "+", 3)  -> 5
     *   evaluate(2, "-", 3)  -> -1
     *   evaluate(2, "*", 3)  -> 6
     *   evaluate(2, "/", 3)  -> throws IllegalArgumentException
     *   evaluate(2, null, 3) -> throws IllegalArgumentException
     *
     * Find the Op with that symbol and ask it. There is no `switch` in the
     * answer and no `if` chain over the operator: the constants already know
     * what to do, which is the whole reason to put the behaviour on them.
     */
    static int evaluate(int a, String symbol, int b) {
        throw new UnsupportedOperationException("evaluate: not implemented");
    }

    /** Given. Note the declaration order — several answers below depend on it. */
    enum Day {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
    }

    /**
     * The two days of the weekend.
     *
     *   weekend()                 -> [SATURDAY, SUNDAY]
     *   weekend().contains(MONDAY) -> false
     *
     * Return an EnumSet. Build it with SUNDAY first if you like — an EnumSet is
     * a bit vector over the ordinals, so it iterates in declaration order
     * whatever order you put things in, and the test checks that.
     */
    static Set<Day> weekend() {
        throw new UnsupportedOperationException("weekend: not implemented");
    }

    /**
     * Everything that is not the weekend.
     *
     *   workdays()  -> [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY]
     *
     * EnumSet has a factory that does exactly this from another EnumSet — one
     * call, no loop. (It is the operation a bit vector is best at.) It insists
     * on an EnumSet rather than any Set, because it works on the bit vector
     * itself — and `weekend()` above is declared to return `Set<Day>`, so you
     * will need an EnumSet in hand before you can pass one.
     */
    static Set<Day> workdays() {
        throw new UnsupportedOperationException("workdays: not implemented");
    }

    /**
     * How many hours are planned for each of the given days.
     *
     *   hoursFor(List.of(Day.WEDNESDAY, Day.MONDAY), 8)
     *       -> {MONDAY=8, WEDNESDAY=8}      and in that order, not the argument's
     *   hoursFor(List.of(), 8)   -> {}
     *   hoursFor(List.of(Day.MONDAY, Day.MONDAY), 8) -> {MONDAY=8}
     *
     * Return an EnumMap keyed on Day. Its constructor is unusual: with no
     * entries to copy it cannot infer the key type, so it takes the Class
     * object — `new EnumMap<>(Day.class)`.
     */
    static Map<Day, Integer> hoursFor(List<Day> days, int hoursEach) {
        throw new UnsupportedOperationException("hoursFor: not implemented");
    }

    /**
     * The Day with this exact name, or null.
     *
     *   dayOrNull("MONDAY")  -> Day.MONDAY
     *   dayOrNull("monday")  -> null      (valueOf is case-sensitive)
     *   dayOrNull("FUNDAY")  -> null
     *   dayOrNull(null)      -> null
     *
     * `Day.valueOf` throws for the last three — IllegalArgumentException for
     * the unknown names and NullPointerException for the null. Tame it. This is
     * the method you want at every boundary where a name arrives from outside
     * the program.
     */
    static Day dayOrNull(String name) {
        throw new UnsupportedOperationException("dayOrNull: not implemented");
    }

    /**
     * A singleton with state, spelled as an enum with one constant.
     *
     *   Counter.INSTANCE.next()  -> 1
     *   Counter.INSTANCE.next()  -> 2
     *   Counter.values().length  -> 1
     *
     * Write `next()`: increment the count and return the new value. The class
     * loader guarantees there is exactly one INSTANCE, built once, safely, on
     * first use — which is the whole reason to write a singleton this way.
     */
    enum Counter {

        INSTANCE;

        private int count;

        int next() {
            throw new UnsupportedOperationException("Counter.next: not implemented");
        }
    }
}
