import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Modifier;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    /**
     * Declared out here, outside Solution, on purpose: Custom is `non-sealed`,
     * so this is legal — and it would not compile against Command, Compound or
     * Shape.
     */
    record Beep(int loudness) implements Solution.Custom {
        @Override
        public int cost() {
            return loudness;
        }
    }

    @Test
    @DisplayName("area: one arm per permitted case, and no default")
    void areaOfEachCase() {
        assertEquals(Math.PI, Solution.area(new Solution.Circle(1)), 1e-12);
        assertEquals(9.0, Solution.area(new Solution.Square(3)), 1e-12);
        assertEquals(10.0, Solution.area(new Solution.Rectangle(2, 5)), 1e-12);
        assertEquals(0.0, Solution.area(new Solution.Square(0)), 1e-12);
    }

    @Test
    @DisplayName("area: sealing closes the types, not the nulls")
    void areaRejectsNull() {
        assertThrows(NullPointerException.class, () -> Solution.area(null),
                "a switch throws before it looks at any case — lesson 04 has the cure");
    }

    @Test
    @DisplayName("scale: every case in, the same case out")
    void scaleKeepsTheCase() {
        assertEquals(new Solution.Circle(6), Solution.scale(new Solution.Circle(2), 3));
        assertEquals(new Solution.Square(1), Solution.scale(new Solution.Square(2), 0.5));
        assertEquals(new Solution.Rectangle(4, 10), Solution.scale(new Solution.Rectangle(2, 5), 2));
    }

    @Test
    @DisplayName("scale: the sides scale, so the area scales by the square")
    void scaleIsLinearOnSides() {
        Solution.Shape big = Solution.scale(new Solution.Rectangle(2, 5), 2);
        assertEquals(40.0, Solution.area(big), 1e-12, "10 * 2 * 2, not 10 * 2");
    }

    @Test
    @DisplayName("cost: the leaf cases")
    void costOfLeaves() {
        assertEquals(3, Solution.cost(new Solution.Move(3)));
        assertEquals(0, Solution.cost(new Solution.Move(0)));
        assertEquals(5, Solution.cost(new Beep(5)), "a Custom is asked what it costs");
    }

    @Test
    @DisplayName("cost: the tree cases, recursively")
    void costOfTrees() {
        assertEquals(8, Solution.cost(new Solution.Repeat(new Solution.Move(2), 4)));
        assertEquals(3, Solution.cost(new Solution.Then(new Solution.Move(1), new Solution.Move(2))));
        assertEquals(0, Solution.cost(new Solution.Repeat(new Solution.Move(9), 0)));
        assertEquals(13, Solution.cost(new Solution.Then(
                new Solution.Move(1),
                new Solution.Repeat(new Solution.Then(new Solution.Move(1), new Beep(5)), 2))));
    }

    @Test
    @DisplayName("script: the same walk, a different answer")
    void scriptRenders() {
        assertEquals("move 3", Solution.script(new Solution.Move(3)));
        assertEquals("repeat 4 [move 2]", Solution.script(new Solution.Repeat(new Solution.Move(2), 4)));
        assertEquals("move 1; move 2",
                Solution.script(new Solution.Then(new Solution.Move(1), new Solution.Move(2))));
    }

    @Test
    @DisplayName("script: nesting composes without any extra cases")
    void scriptNests() {
        assertEquals("move 1; repeat 2 [move 2]", Solution.script(
                new Solution.Then(new Solution.Move(1), new Solution.Repeat(new Solution.Move(2), 2))));
        assertEquals("repeat 3 [move 1; custom(5)]", Solution.script(
                new Solution.Repeat(new Solution.Then(new Solution.Move(1), new Beep(5)), 3)));
    }

    @Test
    @DisplayName("permittedNames: the seal is in the class file, in permits order")
    void permittedNamesAreRecorded() {
        assertEquals(List.of("Circle", "Square", "Rectangle"),
                Solution.permittedNames(Solution.Shape.class));
        assertEquals(List.of("Move", "Custom", "Compound"),
                Solution.permittedNames(Solution.Command.class));
        assertEquals(List.of("Repeat", "Then"), Solution.permittedNames(Solution.Compound.class));
    }

    @Test
    @DisplayName("permittedNames: non-sealed and final types promise nothing")
    void permittedNamesEmptyWhereOpen() {
        assertEquals(List.of(), Solution.permittedNames(Solution.Custom.class),
                "non-sealed: the hierarchy is reopened, so there is no list to give");
        assertEquals(List.of(), Solution.permittedNames(Solution.Circle.class), "final: nothing below it");
        assertEquals(List.of(), Solution.permittedNames(String.class));
    }

    @Test
    @DisplayName("the modifiers behind the seal")
    void modifiersTellTheStory() {
        assertTrue(Solution.Shape.class.isSealed());
        assertTrue(Solution.Compound.class.isSealed(), "a permitted subtype may itself be sealed");
        assertFalse(Solution.Custom.class.isSealed(), "non-sealed is the opposite of sealed");
        assertTrue(Modifier.isFinal(Solution.Circle.class.getModifiers()),
                "records are implicitly final, which is why they need no modifier to be permitted");
    }

    @Test
    @DisplayName("the cases are records, so they compare by value")
    void casesAreValues() {
        assertEquals(new Solution.Move(2), new Solution.Move(2));
        assertNotEquals(new Solution.Move(2), new Solution.Repeat(new Solution.Move(2), 1));
        assertEquals(new Solution.Repeat(new Solution.Move(2), 3),
                new Solution.Repeat(new Solution.Move(2), 3),
                "equality recurses through the tree, because every node is a record");
    }
}
