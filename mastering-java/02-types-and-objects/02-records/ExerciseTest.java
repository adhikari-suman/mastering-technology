import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("Point: the compiler wrote the accessors, equals, hashCode and toString")
    void pointIsGenerated() {
        Solution.Point p = new Solution.Point(1, 2);
        assertEquals(1, p.x(), "accessors are named after the component, not getX()");
        assertEquals(2, p.y());
        assertEquals("Point[x=1, y=2]", p.toString());
        assertEquals(new Solution.Point(1, 2), p, "structural equality, for free");
        assertEquals(new Solution.Point(1, 2).hashCode(), p.hashCode());
        assertFalse(p.equals(new Solution.Point(2, 1)));
    }

    @Test
    @DisplayName("Point: a record is a class kind the runtime knows about")
    void pointIsARecord() {
        assertTrue(Solution.Point.class.isRecord());
        assertTrue(java.lang.Record.class.isAssignableFrom(Solution.Point.class),
                "every record extends java.lang.Record, which is why it can extend nothing else");
        assertEquals(List.of("x", "y"), Solution.componentNames(Solution.Point.class));
    }

    @Test
    @DisplayName("componentNames: the header survives into the class file")
    void componentNamesReadShape() {
        assertEquals(List.of("currency", "minorUnits"), Solution.componentNames(Solution.Money.class));
        assertEquals(List.of("kilos"), Solution.componentNames(Solution.Weight.class));
        assertEquals(List.of(), Solution.componentNames(String.class), "not a record: null, not an empty array");
        assertEquals(List.of(), Solution.componentNames(int.class));
    }

    @Test
    @DisplayName("Money: the compact constructor normalises what it stores")
    void moneyNormalises() {
        assertEquals("GBP", new Solution.Money("gbp", 1250).currency());
        assertEquals("GBP", new Solution.Money("  gbp ", 1250).currency(), "trimmed as well");
        assertEquals(new Solution.Money("GBP", 1250), new Solution.Money(" gBp ", 1250),
                "normalising in the constructor is what makes these equal");
        assertEquals(-50, new Solution.Money("GBP", -50).minorUnits(), "a negative balance is legal");
    }

    @Test
    @DisplayName("Money: the compact constructor rejects what it cannot normalise")
    void moneyValidates() {
        NullPointerException npe =
                assertThrows(NullPointerException.class, () -> new Solution.Money(null, 1));
        assertEquals("currency", npe.getMessage());
        assertThrows(IllegalArgumentException.class, () -> new Solution.Money("GB", 1), "too short");
        assertThrows(IllegalArgumentException.class, () -> new Solution.Money("POUND", 1), "too long");
        assertThrows(IllegalArgumentException.class, () -> new Solution.Money("G1P", 1), "not all letters");
        assertThrows(IllegalArgumentException.class, () -> new Solution.Money("", 1));
    }

    @Test
    @DisplayName("Money: the alternative constructor delegates, so it validates too")
    void moneyAlternativeConstructor() {
        assertEquals(new Solution.Money("GBP", 0), new Solution.Money("GBP"));
        assertEquals(new Solution.Money("EUR", 0), new Solution.Money(" eur "),
                "delegation means the normalisation happens once, in one place");
        assertThrows(IllegalArgumentException.class, () -> new Solution.Money("nope"));
    }

    @Test
    @DisplayName("Money.parse: a static factory over text")
    void moneyParses() {
        assertEquals(new Solution.Money("GBP", 1250), Solution.Money.parse("GBP 1250"));
        assertEquals(new Solution.Money("GBP", 1250), Solution.Money.parse("gbp 1250"));
        assertEquals(new Solution.Money("GBP", -50), Solution.Money.parse("GBP -50"));
    }

    @Test
    @DisplayName("Money.parse: everything else is an IllegalArgumentException")
    void moneyParseRejects() {
        assertThrows(IllegalArgumentException.class, () -> Solution.Money.parse("GBP"));
        assertThrows(IllegalArgumentException.class, () -> Solution.Money.parse("GBP 12 34"));
        assertThrows(IllegalArgumentException.class, () -> Solution.Money.parse("GB 12"));
        assertThrows(IllegalArgumentException.class, () -> Solution.Money.parse(null));
        assertThrows(IllegalArgumentException.class, () -> Solution.Money.parse("GBP x"),
                "NumberFormatException IS an IllegalArgumentException — no rewrapping needed");
    }

    @Test
    @DisplayName("plus: values in, a new value out, the arguments untouched")
    void moneyAdds() {
        Solution.Money a = new Solution.Money("GBP", 100);
        Solution.Money b = new Solution.Money("GBP", 25);
        assertEquals(new Solution.Money("GBP", 125), Solution.plus(a, b));
        assertEquals(100, a.minorUnits(), "a is unchanged; there is no way to change it");
        assertThrows(IllegalArgumentException.class,
                () -> Solution.plus(a, new Solution.Money("EUR", 25)));
    }

    @Test
    @DisplayName("Team: the caller's list is copied, not adopted")
    void teamCopiesIn() {
        List<String> people = new ArrayList<>(List.of("ada"));
        Solution.Team team = new Solution.Team("core", people);
        people.add("bob");
        assertEquals(List.of("ada"), team.members(),
                "without the copy, `final` would have protected nothing");
        assertEquals(new Solution.Team("core", List.of("ada")), team, "lists compare structurally");
    }

    @Test
    @DisplayName("Team: the list that comes back out is frozen too")
    void teamHandsOutFrozen() {
        Solution.Team team = new Solution.Team("core", new ArrayList<>(List.of("ada")));
        assertThrows(UnsupportedOperationException.class, () -> team.members().add("bob"));
        assertThrows(NullPointerException.class, () -> new Solution.Team("core", null));
        assertThrows(NullPointerException.class,
                () -> new Solution.Team("core", Arrays.asList("ada", null)),
                "the copy rejects null elements, which Arrays.asList happily holds");
    }

    @Test
    @DisplayName("Range: a strict constructor and a forgiving factory")
    void rangeValidates() {
        assertEquals(5, new Solution.Range(1, 5).length(), "inclusive of both ends");
        assertEquals(1, new Solution.Range(3, 3).length());
        assertThrows(IllegalArgumentException.class, () -> new Solution.Range(5, 1));
        assertEquals(new Solution.Range(1, 5), Solution.Range.of(5, 1), "the factory sorts instead");
        assertEquals(new Solution.Range(1, 5), Solution.Range.of(1, 5));
    }

    @Test
    @DisplayName("Weight: a double component does not compare the way == does")
    void weightComparesDoubles() {
        assertTrue(0.0 == -0.0, "plain ==");
        assertFalse(new Solution.Weight(0.0).equals(new Solution.Weight(-0.0)),
                "but the record says they differ");

        assertFalse(Double.NaN == Double.NaN, "plain ==");
        assertTrue(new Solution.Weight(Double.NaN).equals(new Solution.Weight(Double.NaN)),
                "and the record says NaN equals itself — which is what keeps equals reflexive");

        assertEquals(new Solution.Weight(1.5), new Solution.Weight(1.5));
    }
}
