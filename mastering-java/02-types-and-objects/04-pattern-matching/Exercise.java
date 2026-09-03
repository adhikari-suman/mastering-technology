import java.util.List;

/**
 * Part 02, Lesson 04 — Pattern matching
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
     * Describe a value, using `instanceof` patterns rather than casts.
     *
     *   describe(null)            -> "nothing"
     *   describe("")              -> "blank text"
     *   describe("   ")           -> "blank text"
     *   describe("hello")         -> "text(5)"
     *   describe(-3)              -> "negative"
     *   describe(7)             -> "int(7)"
     *   describe(List.of(1, 2))   -> "list(2)"
     *   describe(1.5)             -> "Double"
     *   describe('a')             -> "Character"
     *
     * Write it as an if/else chain of `o instanceof T t` tests — no casts
     * anywhere in the method. The blank and negative cases want a condition as
     * well as a type, and `&&` is the operator that keeps the binding in scope.
     *
     * The last two cases fall through to the value's class simple name.
     */
    static String describe(Object o) {
        throw new UnsupportedOperationException("describe: not implemented");
    }

    /**
     * The length of a String, or zero for anything else.
     *
     *   lengthOrZero("hello")  -> 5
     *   lengthOrZero("")       -> 0
     *   lengthOrZero(42)       -> 0
     *   lengthOrZero(null)     -> 0
     *
     * Write it in exactly two lines, in this shape:
     *
     *     if (!(o instanceof String s)) return 0;
     *     return s.length();
     *
     * That is the point of the exercise. Convince yourself the second line
     * compiles before you run it: the binding from a NEGATED pattern is in
     * scope wherever the pattern must have matched, which here is everything
     * after the early return.
     */
    static int lengthOrZero(Object o) {
        throw new UnsupportedOperationException("lengthOrZero: not implemented");
    }

    /**
     * Classify a value with a pattern switch.
     *
     *   classify(null)   -> "null"
     *   classify(-3)     -> "negative int"
     *   classify(0)      -> "int"
     *   classify("")     -> "empty text"
     *   classify("hi")   -> "text"
     *   classify(1.5)    -> "other"
     *
     * Use a `switch` expression with arrow labels, a `case null`, two `when`
     * guards, and a `default`. Without the `case null`, the first line throws
     * NullPointerException — a lone `default` does not catch null.
     *
     * Case order is load-bearing here. Put `case Integer i` before
     * `case Integer i when i < 0` and the compiler rejects the file: the
     * guarded label could never be reached. Try it once, read the message,
     * then put it back.
     */
    static String classify(Object o) {
        throw new UnsupportedOperationException("classify: not implemented");
    }

    /**
     * A coarser label, folding null in with everything unrecognised.
     *
     *   tag(42)    -> "number"
     *   tag(1L)    -> "number"
     *   tag("hi")  -> "text"
     *   tag(null)  -> "other"
     *   tag(1.5)   -> "other"
     *
     * One switch, and the last label is the combined form `case null, default`.
     * Numbers means Integer or Long; anything else that is not a String is
     * "other".
     */
    static String tag(Object o) {
        throw new UnsupportedOperationException("tag: not implemented");
    }

    /** A closed set of figures, built from records so patterns can open them. */
    sealed interface Figure permits Point, Line, Circle {
    }

    record Point(int x, int y) implements Figure {
    }

    /** Either endpoint may be null — that is deliberate, and it matters below. */
    record Line(Point from, Point to) implements Figure {
    }

    /** The centre may be null too. */
    record Circle(Point centre, int radius) implements Figure {
    }

    /**
     * Render a figure as text.
     *
     *   render(null)                                  -> "nothing"
     *   render(new Point(0, 0))                       -> "origin"
     *   render(new Point(1, 2))                       -> "point(1,2)"
     *   render(new Line(new Point(1,2), new Point(5,2))) -> "horizontal line"
     *   render(new Line(new Point(1,2), new Point(3,4))) -> "line(1,2)->(3,4)"
     *   render(new Line(null, new Point(3,4)))        -> "partial line"
     *   render(new Circle(new Point(0,0), 5))         -> "circle(5) at origin"
     *   render(new Circle(new Point(1,2), 5))         -> "circle(5) at point(1,2)"
     *   render(new Circle(null, 5))                   -> "circle(5) at nothing"
     *
     * Notes, in the order you will hit them:
     *
     *  - "horizontal" means both endpoints share a y. Deconstruct both points
     *    and put the comparison in a `when` guard; `_` is the pattern for a
     *    component you do not need.
     *  - a nested pattern like `Line(Point(int x, int y), ...)` cannot match a
     *    null component, so a `case Line l` arm after it catches the partial
     *    ones. That arm must come second, or the file will not compile.
     *  - the circle arm can bind its centre with a plain `Point centre`
     *    pattern, which DOES match null — and then recursing into render gives
     *    you "nothing" for free. Two patterns, opposite answers about null;
     *    the README explains why.
     *
     * No `default`. Figure is sealed, so covering the three cases is enough.
     */
    static String render(Figure figure) {
        throw new UnsupportedOperationException("render: not implemented");
    }

    /**
     * Move a figure by (dx, dy), rebuilding it from its parts.
     *
     *   translate(new Point(1, 2), 10, 20)   -> new Point(11, 22)
     *   translate(new Line(new Point(1,2), new Point(3,4)), 1, 1)
     *                                        -> new Line(new Point(2,3), new Point(4,5))
     *   translate(new Circle(new Point(1,2), 5), 1, 1)
     *                                        -> new Circle(new Point(2,3), 5)
     *   translate(null, 1, 1)                -> null
     *
     * A figure with a null part cannot be taken apart, so it comes back exactly
     * as it went in — the same object, not a copy:
     *
     *   translate(partialLine, 1, 1)  -> partialLine itself
     *
     * Deconstruct where you can, and let a plain `case Line l` / `case Circle c`
     * arm return the argument otherwise. Radius does not change.
     */
    static Figure translate(Figure figure, int dx, int dy) {
        throw new UnsupportedOperationException("translate: not implemented");
    }

    /**
     * Whether the value is a Line whose two endpoints share a y coordinate.
     *
     *   isHorizontal(new Line(new Point(1,2), new Point(5,2)))  -> true
     *   isHorizontal(new Line(new Point(1,2), new Point(5,3)))  -> false
     *   isHorizontal(new Line(null, new Point(5,2)))            -> false
     *   isHorizontal(new Point(1, 2))                           -> false
     *   isHorizontal("horizontal")                              -> false
     *   isHorizontal(null)                                      -> false
     *
     * One expression: an `instanceof` with a nested record pattern, `_` for the
     * two x coordinates nobody asked about, and `&&` for the comparison. Note
     * how much of the above list you get without writing a single null check.
     */
    static boolean isHorizontal(Object o) {
        throw new UnsupportedOperationException("isHorizontal: not implemented");
    }
}
