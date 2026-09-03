import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("Coin: an enum constant is an object with state")
    void coinsCarryState() {
        assertEquals(1, Solution.Coin.PENNY.pence());
        assertEquals(50, Solution.Coin.FIFTY.pence());
        assertEquals(6, Solution.Coin.values().length);
        assertEquals(Solution.Coin.PENNY, Solution.Coin.values()[0], "values() is in declaration order");
    }

    @Test
    @DisplayName("total: sum a handful")
    void totalAdds() {
        assertEquals(52, Solution.total(List.of(Solution.Coin.FIFTY, Solution.Coin.TWO)));
        assertEquals(20, Solution.total(List.of(Solution.Coin.TEN, Solution.Coin.TEN)));
        assertEquals(0, Solution.total(List.of()));
    }

    @Test
    @DisplayName("fromPence: look up by the field, never by the position")
    void fromPenceLooksUp() {
        assertSame(Solution.Coin.FIFTY, Solution.fromPence(50));
        assertSame(Solution.Coin.PENNY, Solution.fromPence(1));
        assertThrows(IllegalArgumentException.class, () -> Solution.fromPence(3));
        assertThrows(IllegalArgumentException.class, () -> Solution.fromPence(0));
    }

    @Test
    @DisplayName("ordinal is a position in the source, not an identity")
    void ordinalIsNotIdentity() {
        assertEquals(0, Solution.Coin.PENNY.ordinal());
        assertEquals(5, Solution.Coin.FIFTY.ordinal());
        assertEquals(50, Solution.Coin.FIFTY.pence(),
                "insert one coin above and the ordinal moves while the pence do not");
        assertEquals("FIFTY", Solution.Coin.FIFTY.name());
    }

    @Test
    @DisplayName("values(): a fresh array every call, so nobody can vandalise it")
    void valuesIsACopy() {
        Solution.Coin[] first = Solution.Coin.values();
        Solution.Coin[] second = Solution.Coin.values();
        assertNotSame(first, second, "two calls, two arrays");
        first[0] = null;
        assertSame(Solution.Coin.PENNY, Solution.Coin.values()[0], "your copy, not theirs");
    }

    @Test
    @DisplayName("Op: each constant brings its own implementation")
    void opConstantBodies() {
        assertEquals(5, Solution.Op.PLUS.apply(2, 3));
        assertEquals(-1, Solution.Op.MINUS.apply(2, 3));
        assertEquals(6, Solution.Op.TIMES.apply(2, 3));
        assertEquals("*", Solution.Op.TIMES.symbol());
    }

    @Test
    @DisplayName("evaluate: a strategy lookup, with no switch in sight")
    void evaluateDispatches() {
        assertEquals(5, Solution.evaluate(2, "+", 3));
        assertEquals(-1, Solution.evaluate(2, "-", 3));
        assertEquals(6, Solution.evaluate(2, "*", 3));
        assertThrows(IllegalArgumentException.class, () -> Solution.evaluate(2, "/", 3));
        assertThrows(IllegalArgumentException.class, () -> Solution.evaluate(2, null, 3));
    }

    @Test
    @DisplayName("a constant with a body is an anonymous subclass of the enum")
    void constantBodiesAreSubclasses() {
        assertNotSame(Solution.Op.class, Solution.Op.PLUS.getClass(),
                "PLUS is an Op$1, because it carries its own apply");
        assertSame(Solution.Op.class, Solution.Op.PLUS.getDeclaringClass(),
                "getDeclaringClass is the question you meant to ask");
        assertTrue(Solution.Op.PLUS instanceof Solution.Calc);
        assertSame(Solution.Op.PLUS, Solution.Op.valueOf("PLUS"), "still exactly one instance");
    }

    @Test
    @DisplayName("weekend: an EnumSet iterates in declaration order")
    void weekendIsOrdered() {
        Set<Solution.Day> weekend = Solution.weekend();
        assertTrue(weekend instanceof EnumSet, "a bit vector, not a hash table");
        assertEquals(List.of(Solution.Day.SATURDAY, Solution.Day.SUNDAY), List.copyOf(weekend),
                "declaration order, whatever order you built it in");
        assertFalse(weekend.contains(Solution.Day.MONDAY));
    }

    @Test
    @DisplayName("workdays: the complement, in one call")
    void workdaysComplement() {
        assertEquals(List.of(Solution.Day.MONDAY, Solution.Day.TUESDAY, Solution.Day.WEDNESDAY,
                        Solution.Day.THURSDAY, Solution.Day.FRIDAY),
                List.copyOf(Solution.workdays()));
        assertEquals(7, Solution.workdays().size() + Solution.weekend().size());
    }

    @Test
    @DisplayName("hoursFor: an EnumMap, keyed and ordered by the enum itself")
    void hoursForIsAnEnumMap() {
        Map<Solution.Day, Integer> hours =
                Solution.hoursFor(List.of(Solution.Day.WEDNESDAY, Solution.Day.MONDAY), 8);
        assertTrue(hours instanceof EnumMap, "an array indexed by ordinal, with no hashing");
        assertEquals(Map.of(Solution.Day.MONDAY, 8, Solution.Day.WEDNESDAY, 8), hours);
        assertEquals(List.of(Solution.Day.MONDAY, Solution.Day.WEDNESDAY), List.copyOf(hours.keySet()),
                "MONDAY first, though WEDNESDAY was put in first");
        assertEquals(Map.of(), Solution.hoursFor(List.of(), 8));
        assertEquals(1, Solution.hoursFor(List.of(Solution.Day.MONDAY, Solution.Day.MONDAY), 8).size());
    }

    @Test
    @DisplayName("dayOrNull: valueOf is exact, case-sensitive, and throws")
    void dayOrNullTamesValueOf() {
        assertSame(Solution.Day.MONDAY, Solution.dayOrNull("MONDAY"));
        assertNull(Solution.dayOrNull("monday"), "valueOf does not lowercase anything for you");
        assertNull(Solution.dayOrNull("FUNDAY"));
        assertNull(Solution.dayOrNull(null));

        assertThrows(IllegalArgumentException.class, () -> Solution.Day.valueOf("monday"),
                "plain Java: this is what the method is protecting callers from");
        assertSame(Solution.Day.MONDAY, Solution.Day.valueOf("MONDAY"),
                "one instance per constant, so == and assertSame are correct here");
    }

    @Test
    @DisplayName("Counter: one constant, therefore one instance, with state")
    void counterIsASingleton() {
        assertEquals(1, Solution.Counter.values().length);
        assertSame(Solution.Counter.INSTANCE, Solution.Counter.valueOf("INSTANCE"));
        assertEquals(1, Solution.Counter.INSTANCE.next());
        assertEquals(2, Solution.Counter.INSTANCE.next(), "the state is shared, as any global is");
        assertEquals(3, Solution.Counter.INSTANCE.next());
    }
}
