import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("describe: a pattern binds and narrows in one move")
    void describeText() {
        assertEquals("nothing", Solution.describe(null));
        assertEquals("blank text", Solution.describe(""));
        assertEquals("blank text", Solution.describe("   "));
        assertEquals("text(5)", Solution.describe("hello"));
    }

    @Test
    @DisplayName("describe: everything else, including the types with no arm")
    void describeOthers() {
        assertEquals("negative", Solution.describe(-3));
        assertEquals("int(7)", Solution.describe(7));
        assertEquals("int(0)", Solution.describe(0), "zero is not negative");
        assertEquals("list(2)", Solution.describe(List.of(1, 2)));
        assertEquals("Double", Solution.describe(1.5));
        assertEquals("Character", Solution.describe('a'));
    }

    @Test
    @DisplayName("lengthOrZero: the binding outlives a negated pattern")
    void negatedPatternScope() {
        assertEquals(5, Solution.lengthOrZero("hello"));
        assertEquals(0, Solution.lengthOrZero(""));
        assertEquals(0, Solution.lengthOrZero(42));
        assertEquals(0, Solution.lengthOrZero(null), "instanceof is false for null, always");
    }

    @Test
    @DisplayName("classify: guards run after the type test, so order matters")
    void classifyGuards() {
        assertEquals("negative int", Solution.classify(-3));
        assertEquals("int", Solution.classify(0));
        assertEquals("int", Solution.classify(7));
        assertEquals("empty text", Solution.classify(""));
        assertEquals("text", Solution.classify("hi"));
        assertEquals("other", Solution.classify(1.5));
    }

    @Test
    @DisplayName("classify: only `case null` catches null — a default does not")
    void classifyNull() {
        assertEquals("null", Solution.classify(null));

        assertThrows(NullPointerException.class, () -> {
            String s = null;
            switch (s) {
                case "a" -> { }
                default -> { }
            }
        }, "plain Java: a switch with a default but no `case null` still throws");
    }

    @Test
    @DisplayName("tag: `case null, default` folds the two together")
    void tagCombinesNullAndDefault() {
        assertEquals("number", Solution.tag(42));
        assertEquals("number", Solution.tag(1L));
        assertEquals("text", Solution.tag("hi"));
        assertEquals("other", Solution.tag(null));
        assertEquals("other", Solution.tag(1.5));
    }

    @Test
    @DisplayName("render: a record pattern with a guard, and one without")
    void renderPoints() {
        assertEquals("nothing", Solution.render(null));
        assertEquals("origin", Solution.render(new Solution.Point(0, 0)));
        assertEquals("point(1,2)", Solution.render(new Solution.Point(1, 2)));
        assertEquals("point(0,1)", Solution.render(new Solution.Point(0, 1)),
                "the guard wants both coordinates zero");
    }

    @Test
    @DisplayName("render: nested patterns reach two levels down")
    void renderLines() {
        assertEquals("horizontal line",
                Solution.render(new Solution.Line(new Solution.Point(1, 2), new Solution.Point(5, 2))));
        assertEquals("line(1,2)->(3,4)",
                Solution.render(new Solution.Line(new Solution.Point(1, 2), new Solution.Point(3, 4))));
    }

    @Test
    @DisplayName("render: a nested pattern will not match a null component")
    void renderPartialLine() {
        assertEquals("partial line",
                Solution.render(new Solution.Line(null, new Solution.Point(3, 4))),
                "the deconstruction would have to call from.x(), so it declines and falls through");
        assertEquals("partial line",
                Solution.render(new Solution.Line(new Solution.Point(1, 2), null)));
        assertEquals("partial line", Solution.render(new Solution.Line(null, null)));
    }

    @Test
    @DisplayName("render: a plain type pattern in the same position DOES match null")
    void renderCircle() {
        assertEquals("circle(5) at point(1,2)",
                Solution.render(new Solution.Circle(new Solution.Point(1, 2), 5)));
        assertEquals("circle(5) at origin",
                Solution.render(new Solution.Circle(new Solution.Point(0, 0), 5)));
        assertEquals("circle(5) at nothing", Solution.render(new Solution.Circle(null, 5)),
                "`Point centre` binds null happily — the opposite of the Line arm above");
    }

    @Test
    @DisplayName("translate: take the figure apart and put it back together")
    void translateRebuilds() {
        assertEquals(new Solution.Point(11, 22), Solution.translate(new Solution.Point(1, 2), 10, 20));
        assertEquals(new Solution.Line(new Solution.Point(2, 3), new Solution.Point(4, 5)),
                Solution.translate(new Solution.Line(new Solution.Point(1, 2), new Solution.Point(3, 4)), 1, 1));
        assertEquals(new Solution.Circle(new Solution.Point(2, 3), 5),
                Solution.translate(new Solution.Circle(new Solution.Point(1, 2), 5), 1, 1),
                "the radius is not a coordinate");
        assertNull(Solution.translate(null, 1, 1));
    }

    @Test
    @DisplayName("translate: what cannot be taken apart comes back untouched")
    void translateLeavesPartialsAlone() {
        Solution.Line partial = new Solution.Line(null, new Solution.Point(3, 4));
        assertSame(partial, Solution.translate(partial, 1, 1), "the same object, not a copy");

        Solution.Circle hollow = new Solution.Circle(null, 5);
        assertSame(hollow, Solution.translate(hollow, 1, 1));
    }

    @Test
    @DisplayName("isHorizontal: `_` for the components nobody asked about")
    void isHorizontalUsesUnnamedPatterns() {
        assertTrue(Solution.isHorizontal(new Solution.Line(new Solution.Point(1, 2), new Solution.Point(5, 2))));
        assertTrue(Solution.isHorizontal(new Solution.Line(new Solution.Point(1, 2), new Solution.Point(1, 2))));
        assertFalse(Solution.isHorizontal(new Solution.Line(new Solution.Point(1, 2), new Solution.Point(5, 3))));
        assertFalse(Solution.isHorizontal(new Solution.Line(null, new Solution.Point(5, 2))));
        assertFalse(Solution.isHorizontal(new Solution.Point(1, 2)));
        assertFalse(Solution.isHorizontal("horizontal"));
        assertFalse(Solution.isHorizontal(null), "one expression, and not a null check in sight");
    }
}
