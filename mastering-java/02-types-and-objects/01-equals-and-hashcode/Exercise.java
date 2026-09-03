import java.util.HashSet;
import java.util.Set;

/**
 * Part 02, Lesson 01 — equals and hashCode
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
 * This lesson asks you to write classes, not just methods. The field
 * declarations are given; the constructors and the overrides are yours.
 */
class Solution {

    /**
     * A correct value class. Two Points are equal when both coordinates match.
     *
     *   new Point(1, 2).equals(new Point(1, 2))  -> true
     *   new Point(1, 2).equals(new Point(2, 1))  -> false
     *   new Point(1, 2).equals(null)             -> false   (never throws)
     *   new Point(1, 2).equals("1,2")            -> false
     *   new Point(1, 2).toString()               -> "Point(1, 2)"
     *
     * Equal Points must produce equal hash codes, and one Point must produce
     * the same hash code every time it is asked.
     *
     * The class is `final` and the type check should use `getClass()` — that
     * pairing is the one that cannot go asymmetric. `java.util.Objects` has a
     * one-liner for the hash code; use it. The combination must be
     * order-sensitive, so that Point(1, 2) and Point(2, 1) hash differently —
     * `x + y` would not be.
     */
    static final class Point {
        final int x;
        final int y;

        Point(int x, int y) {
            throw new UnsupportedOperationException("Point: not implemented");
        }

        @Override
        public boolean equals(Object o) {
            throw new UnsupportedOperationException("Point.equals: not implemented");
        }

        @Override
        public int hashCode() {
            throw new UnsupportedOperationException("Point.hashCode: not implemented");
        }

        @Override
        public String toString() {
            throw new UnsupportedOperationException("Point.toString: not implemented");
        }
    }

    /**
     * The same equality as Point — and deliberately no hashCode.
     *
     *   new Sloppy(1, 2).equals(new Sloppy(1, 2))  -> true
     *
     * Do NOT override hashCode here. This class exists to show what the
     * inherited one costs you the moment the object meets a HashSet or a
     * HashMap; the tests measure that cost.
     */
    static final class Sloppy {
        final int x;
        final int y;

        Sloppy(int x, int y) {
            throw new UnsupportedOperationException("Sloppy: not implemented");
        }

        @Override
        public boolean equals(Object o) {
            throw new UnsupportedOperationException("Sloppy.equals: not implemented");
        }
    }

    /**
     * A NON-final class whose equals accepts anything that is a Loose.
     *
     *   new Loose(1, 2).equals(new Loose(1, 2))          -> true
     *   new Loose(1, 2).equals(new Tagged(1, 2, "red"))  -> true   (!)
     *
     * Use `o instanceof Loose` for the type check — not getClass. The second
     * line is the whole point of the exercise, so do not defend against it.
     *
     * `hashCode` combines x and y, the same way Point's does.
     */
    static class Loose {
        final int x;
        final int y;

        Loose(int x, int y) {
            throw new UnsupportedOperationException("Loose: not implemented");
        }

        @Override
        public boolean equals(Object o) {
            throw new UnsupportedOperationException("Loose.equals: not implemented");
        }

        @Override
        public int hashCode() {
            throw new UnsupportedOperationException("Loose.hashCode: not implemented");
        }
    }

    /**
     * A Loose with an extra field, and an equals that insists on it.
     *
     *   new Tagged(1, 2, "red").equals(new Tagged(1, 2, "red"))  -> true
     *   new Tagged(1, 2, "red").equals(new Tagged(1, 2, "blue")) -> false
     *   new Tagged(1, 2, "red").equals(new Loose(1, 2))          -> false
     *
     * Compare that last line with the second line of Loose's javadoc: one
     * direction is true and the other is false, and the pair of classes is now
     * unusable in any collection. `tag` is never null. Write the obvious
     * implementation; the tests measure the damage rather than asking you to
     * avoid it.
     *
     * `hashCode` folds in `tag` as well — and that is worth pausing on. A Loose
     * says it equals a Tagged with the same coordinates, while any hashCode
     * that reads `tag` gives the two different numbers. So the same edit that
     * broke symmetry also broke "equal objects hash equally": one broken
     * `equals` is never just one broken rule.
     */
    static final class Tagged extends Loose {
        final String tag;

        Tagged(int x, int y, String tag) {
            super(x, y);
            throw new UnsupportedOperationException("Tagged: not implemented");
        }

        @Override
        public boolean equals(Object o) {
            throw new UnsupportedOperationException("Tagged.equals: not implemented");
        }

        @Override
        public int hashCode() {
            throw new UnsupportedOperationException("Tagged.hashCode: not implemented");
        }
    }

    /**
     * A value class whose fields can change after construction.
     *
     *   Mutable m = new Mutable(1, 2);
     *   m.equals(new Mutable(1, 2))  -> true
     *   m.moveTo(9, 9);
     *   m.equals(new Mutable(1, 2))  -> false
     *   m.equals(new Mutable(9, 9))  -> true
     *
     * equals and hashCode both read x and y, exactly as Point's do. Nothing
     * here is wrong on its own — the bug appears in containsAfterMove.
     */
    static final class Mutable {
        int x;
        int y;

        Mutable(int x, int y) {
            throw new UnsupportedOperationException("Mutable: not implemented");
        }

        void moveTo(int newX, int newY) {
            throw new UnsupportedOperationException("Mutable.moveTo: not implemented");
        }

        @Override
        public boolean equals(Object o) {
            throw new UnsupportedOperationException("Mutable.equals: not implemented");
        }

        @Override
        public int hashCode() {
            throw new UnsupportedOperationException("Mutable.hashCode: not implemented");
        }
    }

    /**
     * Put both objects into one HashSet and report how many it kept.
     *
     *   setSize(new Point(1, 2), new Point(1, 2))    -> 1
     *   setSize(new Point(1, 2), new Point(3, 4))    -> 2
     *   setSize(new Sloppy(1, 2), new Sloppy(1, 2))  -> 2   (they ARE equal)
     *   setSize(null, null)                          -> 1   (a set holds one null)
     *
     * Nulls are allowed on either side; HashSet accepts them.
     */
    static int setSize(Object a, Object b) {
        throw new UnsupportedOperationException("setSize: not implemented");
    }

    /**
     * Whether the two objects agree about being equal.
     *
     *   symmetric(new Point(1, 2), new Point(1, 2))          -> true
     *   symmetric(new Point(1, 2), new Point(3, 4))          -> true  (both false)
     *   symmetric(new Loose(1, 2), new Tagged(1, 2, "red"))  -> false
     *
     * "Symmetric" means the two answers match, not that they are both true.
     * Both arguments are non-null.
     */
    static boolean symmetric(Object a, Object b) {
        throw new UnsupportedOperationException("symmetric: not implemented");
    }

    /**
     * Equality that tolerates null on either side.
     *
     *   nullSafeEquals("a", "a")   -> true
     *   nullSafeEquals("a", "b")   -> false
     *   nullSafeEquals(null, null) -> true
     *   nullSafeEquals(null, "a")  -> false
     *   nullSafeEquals("a", null)  -> false
     *
     * One method in java.util.Objects is exactly this. Find it rather than
     * writing the null checks by hand.
     */
    static boolean nullSafeEquals(Object a, Object b) {
        throw new UnsupportedOperationException("nullSafeEquals: not implemented");
    }

    /**
     * Return the name, rejecting null at the door.
     *
     *   requireName("ada")  -> "ada"
     *   requireName("")     -> ""
     *   requireName(null)   -> throws NullPointerException, message "name"
     *
     * The message must be exactly "name". Use the java.util.Objects method
     * that takes a message; do not write `if (name == null) throw ...`.
     */
    static String requireName(String name) {
        throw new UnsupportedOperationException("requireName: not implemented");
    }

    /**
     * Add the point to a fresh HashSet, move it, then look for it again.
     *
     *   containsAfterMove(new Mutable(1, 2))  -> false
     *
     * Steps, in order: create a HashSet, add `p`, call `p.moveTo(p.x + 1, p.y)`,
     * and return `set.contains(p)`. Nothing else is in the set, `p` is the only
     * object involved, and it is asked about itself — and the answer is still
     * false. Work out why before you run it.
     */
    static boolean containsAfterMove(Mutable p) {
        throw new UnsupportedOperationException("containsAfterMove: not implemented");
    }
}
