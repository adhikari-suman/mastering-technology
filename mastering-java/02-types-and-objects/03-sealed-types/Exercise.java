import java.util.List;

/**
 * Part 02, Lesson 03 — Sealed types
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
 * The type declarations here are given — read them as the spec they are. Your
 * job is the methods that consume them, and the rule to hold yourself to is:
 * no `default` branch anywhere in this file.
 */
class Solution {

    /** A closed set of three shapes. Nothing else can ever implement this. */
    sealed interface Shape permits Circle, Square, Rectangle {
    }

    record Circle(double radius) implements Shape {
    }

    record Square(double side) implements Shape {
    }

    record Rectangle(double width, double height) implements Shape {
    }

    /**
     * The area of a shape.
     *
     *   area(new Circle(1))          -> Math.PI
     *   area(new Square(3))          -> 9.0
     *   area(new Rectangle(2, 5))    -> 10.0
     *   area(null)                   -> throws NullPointerException
     *
     * Write it as a `switch` expression with one arm per case and NO default.
     * The compiler knows the three permitted subtypes and will tell you if you
     * miss one — which is the entire reason the interface is sealed.
     *
     * The null case is not something you write; it is what a switch does on its
     * own, and it is worth seeing before lesson 04 offers the cure.
     */
    static double area(Shape shape) {
        throw new UnsupportedOperationException("area: not implemented");
    }

    /**
     * Multiply every dimension of a shape by a factor, keeping its case.
     *
     *   scale(new Circle(2), 3)         -> new Circle(6)
     *   scale(new Square(2), 0.5)       -> new Square(1)
     *   scale(new Rectangle(2, 5), 2)   -> new Rectangle(4, 10)
     *
     * A total function over a closed set: three cases in, three cases out, and
     * no possibility of a shape you forgot. Note that scaling a Rectangle by
     * two quadruples its area — the tests check that you scaled the sides and
     * not the area.
     */
    static Shape scale(Shape shape, double factor) {
        throw new UnsupportedOperationException("scale: not implemented");
    }

    /**
     * A tiny command language, as a recursive sealed hierarchy.
     *
     * `Compound` is itself sealed, so the tree stays closed: a Command is a
     * Move, a Custom, or one of the two Compounds — and nothing else.
     */
    sealed interface Command permits Move, Custom, Compound {
    }

    record Move(int steps) implements Command {
    }

    sealed interface Compound extends Command permits Repeat, Then {
    }

    record Repeat(Command body, int times) implements Compound {
    }

    record Then(Command first, Command second) implements Compound {
    }

    /**
     * The one hole in the hierarchy: anybody may implement this, from anywhere,
     * and every switch over Command keeps compiling because `case Custom`
     * catches whatever they wrote. The tests implement it from outside to prove
     * the point.
     */
    non-sealed interface Custom extends Command {
        int cost();
    }

    /**
     * What a command costs to run.
     *
     *   cost(new Move(3))                          -> 3
     *   cost(new Repeat(new Move(2), 4))           -> 8
     *   cost(new Then(new Move(1), new Move(2)))   -> 3
     *   cost(someCustom)                           -> whatever its cost() says
     *
     * A Move costs its steps, a Repeat costs its body times its count, a Then
     * costs the sum of both halves, and a Custom is asked. Recursive, and still
     * no default: cover Move, Custom, Repeat and Then — or Move, Custom and
     * Compound, and take the second decision inside. Both are exhaustive, for
     * the reason the README gives.
     */
    static int cost(Command command) {
        throw new UnsupportedOperationException("cost: not implemented");
    }

    /**
     * Render a command tree as text.
     *
     *   script(new Move(3))                        -> "move 3"
     *   script(new Repeat(new Move(2), 4))         -> "repeat 4 [move 2]"
     *   script(new Then(new Move(1), new Move(2))) -> "move 1; move 2"
     *   script(new Then(new Move(1), new Repeat(new Move(2), 2)))
     *                                              -> "move 1; repeat 2 [move 2]"
     *   script(aCustomCosting5)                    -> "custom(5)"
     *
     * The same walk as `cost`, producing a different answer — which is what a
     * closed data model is for: the shape of the traversal is fixed by the
     * types, so a second one costs you almost nothing.
     */
    static String script(Command command) {
        throw new UnsupportedOperationException("script: not implemented");
    }

    /**
     * The simple names of a type's permitted subtypes, in the order the
     * `permits` clause lists them.
     *
     *   permittedNames(Shape.class)    -> ["Circle", "Square", "Rectangle"]
     *   permittedNames(Compound.class) -> ["Repeat", "Then"]
     *   permittedNames(Custom.class)   -> []      (non-sealed: nothing promised)
     *   permittedNames(Circle.class)   -> []      (final: nothing below it)
     *   permittedNames(String.class)   -> []
     *
     * `Class` has both `isSealed()` and `getPermittedSubclasses()`. The latter
     * answers null for anything that is not sealed, so handle that. The seal is
     * recorded in the class file, not merely checked by javac — this method is
     * reading it back at runtime.
     *
     * Take the array as it comes and do not sort it. `getPermittedSubclasses()`
     * documents its order as unspecified, but what it hands back is the
     * class-file `PermittedSubclasses` attribute, which javac writes in the
     * order the `permits` clause was typed — so on any real JVM that is the
     * order you get, and it is the order the tests expect.
     */
    static List<String> permittedNames(Class<?> type) {
        throw new UnsupportedOperationException("permittedNames: not implemented");
    }
}
