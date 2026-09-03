import java.util.List;

/**
 * Part 02, Lesson 02 — Records
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
     * A pair of coordinates, and nothing else.
     *
     *   new Point(1, 2).x()          -> 1
     *   new Point(1, 2).y()          -> 2
     *   new Point(1, 2).toString()   -> "Point[x=1, y=2]"
     *   new Point(1, 2).equals(new Point(1, 2))  -> true
     *
     * The header is already written and there is nothing to add. Compare it
     * with Solution.Point from lesson 01, which needed forty lines to say the
     * same thing, and note the accessor is `x()` — not `getX()`.
     */
    record Point(int x, int y) {
    }

    /**
     * An amount of money, held in the smallest unit of the currency, with the
     * currency code normalised on the way in.
     *
     *   new Money("GBP", 1250)         -> Money[currency=GBP, minorUnits=1250]
     *   new Money("  gbp ", 1250)      -> the same value: trimmed and uppercased
     *   new Money("GBP", -50)          -> allowed; a balance can be negative
     *   new Money(null, 1)             -> throws NullPointerException, message "currency"
     *   new Money("GB", 1)             -> throws IllegalArgumentException
     *   new Money("POUND", 1)          -> throws IllegalArgumentException
     *   new Money("G1P", 1)            -> throws IllegalArgumentException
     *
     * Write a COMPACT constructor: `Money { ... }`, no parameter list. Inside
     * it you have the parameters as ordinary locals; reassign `currency` to the
     * normalised form and the compiler stores what you leave behind. Assigning
     * `this.currency` there is a compile error.
     *
     * "Three letters" means exactly three, each an ASCII letter, after trimming.
     * Uppercase with `Locale.ROOT` — the no-argument `toUpperCase()` follows the
     * machine's default locale, which is not a property of the currency code.
     */
    record Money(String currency, long minorUnits) {

        Money {
            throw new UnsupportedOperationException("Money: not implemented");
        }

        /**
         * An alternative constructor: the currency, with a zero amount.
         *
         *   new Money("GBP")   -> Money[currency=GBP, minorUnits=0]
         *   new Money(" eur ") -> Money[currency=EUR, minorUnits=0]  (still normalised)
         *   new Money("nope")  -> throws IllegalArgumentException    (still validated)
         *
         * This is the one stub here that is not a `throw`. A non-canonical
         * record constructor must hand off to another constructor as its first
         * act, so there is nowhere to put one — replace the placeholder below.
         * Note what delegation buys you: the validation and normalisation live
         * in one place and every constructor goes through them.
         */
        Money(String currency) {
            this(currency, Long.MIN_VALUE);   // TODO: not implemented
        }

        /**
         * Parse a currency code and an amount separated by one space.
         *
         *   Money.parse("GBP 1250")  -> new Money("GBP", 1250)
         *   Money.parse("gbp 1250")  -> new Money("GBP", 1250)
         *   Money.parse("GBP -50")   -> new Money("GBP", -50)
         *   Money.parse("GBP")       -> throws IllegalArgumentException
         *   Money.parse("GBP 12 34") -> throws IllegalArgumentException
         *   Money.parse("GBP x")     -> throws IllegalArgumentException
         *   Money.parse(null)        -> throws IllegalArgumentException
         *
         * A static factory can do things a constructor cannot: reject its input
         * before any object exists, pick a different implementation, or carry a
         * name that says what it does. Let the constructor do the validating of
         * the currency itself — this method only has to split the text.
         *
         * On the last-but-one case: the exception thrown when "x" is not a
         * number is already an IllegalArgumentException, so you do not have to
         * catch and rewrap it. Work out which one it is.
         */
        static Money parse(String text) {
            throw new UnsupportedOperationException("Money.parse: not implemented");
        }
    }

    /**
     * Add two amounts of the same currency.
     *
     *   plus(new Money("GBP", 100), new Money("GBP", 25))  -> new Money("GBP", 125)
     *   plus(new Money("GBP", 100), new Money("EUR", 25))  -> throws IllegalArgumentException
     *
     * A record has no setters, so "adding" means building a new one. That is
     * the whole idiom: values go in, a value comes out, the inputs are
     * untouched.
     */
    static Money plus(Money a, Money b) {
        throw new UnsupportedOperationException("plus: not implemented");
    }

    /**
     * A team name and its members, where the member list cannot be edited by
     * anyone — including whoever passed it in.
     *
     *   List<String> people = new ArrayList<>(List.of("ada"));
     *   Team t = new Team("core", people);
     *   people.add("bob");
     *   t.members()               -> ["ada"]        (the record kept a snapshot)
     *   t.members().add("bob")    -> throws UnsupportedOperationException
     *   new Team("core", null)    -> throws NullPointerException
     *   new Team("core", listContainingNull) -> throws NullPointerException
     *
     * `final` on the field only stops the reference from being reassigned; the
     * list on the end of it is as mutable as ever. One method on `List` both
     * copies and freezes, and gives you the two NullPointerExceptions above for
     * free.
     */
    record Team(String name, List<String> members) {

        Team {
            throw new UnsupportedOperationException("Team: not implemented");
        }
    }

    /**
     * An inclusive range of ints that cannot be back to front.
     *
     *   new Range(1, 5).length()  -> 5      (inclusive of both ends)
     *   new Range(3, 3).length()  -> 1
     *   new Range(5, 1)           -> throws IllegalArgumentException
     *   Range.of(5, 1)            -> new Range(1, 5)   (sorts, does not throw)
     *   Range.of(1, 5)            -> new Range(1, 5)
     *
     * Two entry points with deliberately different manners: the constructor is
     * strict, the factory is forgiving. Callers pick.
     */
    record Range(int lo, int hi) {

        Range {
            throw new UnsupportedOperationException("Range: not implemented");
        }

        static Range of(int a, int b) {
            throw new UnsupportedOperationException("Range.of: not implemented");
        }

        int length() {
            throw new UnsupportedOperationException("Range.length: not implemented");
        }
    }

    /**
     * A mass in kilograms. One `double` component, no constructor, no methods.
     *
     *   new Weight(1.5).kilos()  -> 1.5
     *
     * Nothing to write beyond the header. It is here because the generated
     * `equals` does something to a `double` that `==` does not, in two specific
     * places — the tests will show you both, and the README says why.
     */
    record Weight(double kilos) {
    }

    /**
     * The component names of a record type, in declaration order.
     *
     *   componentNames(Point.class)   -> ["x", "y"]
     *   componentNames(Money.class)   -> ["currency", "minorUnits"]
     *   componentNames(String.class)  -> []       (not a record)
     *   componentNames(int.class)     -> []
     *
     * `Class` has a method for this. It answers null rather than an empty array
     * for a non-record, which is the case you have to handle.
     */
    static List<String> componentNames(Class<?> type) {
        throw new UnsupportedOperationException("componentNames: not implemented");
    }
}
