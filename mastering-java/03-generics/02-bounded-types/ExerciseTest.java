import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("max: largest by natural order, for anything Comparable")
    void maxOrders() {
        assertEquals(3, Solution.max(List.of(3, 1, 2)));
        assertEquals("b", Solution.max(List.of("a", "b")));
        assertEquals(1, Solution.max(List.of(1)));
        assertEquals(-1, Solution.max(List.of(-5, -1, -3)));
    }

    @Test
    @DisplayName("max: a subclass whose ordering is inherited from its parent")
    void maxAcceptsInheritedOrdering() {
        Weapon dagger = new Weapon("dagger", 2);
        Weapon axe = new Weapon("axe", 9);

        // If this line does not compile, your bound is `Comparable<T>` and it
        // needs to be `Comparable<? super T>`. Weapon is a Comparable<Item>.
        Weapon best = Solution.max(List.of(dagger, axe));

        assertSame(axe, best, "the heavier weapon wins");
        assertEquals(new Item("sword", 7), Solution.max(List.of(new Item("sword", 7), dagger)));
    }

    @Test
    @DisplayName("max: an empty list has no answer to give")
    void maxRejectsEmpty() {
        assertThrows(NoSuchElementException.class, () -> Solution.max(List.<String>of()));
    }

    @Test
    @DisplayName("clamp: pins a value into a closed range")
    void clampPins() {
        assertEquals(5, Solution.clamp(5, 1, 10));
        assertEquals(1, Solution.clamp(0, 1, 10));
        assertEquals(10, Solution.clamp(99, 1, 10));
        assertEquals(1, Solution.clamp(1, 1, 10), "the bounds themselves are in range");
        assertEquals("f", Solution.clamp("m", "a", "f"), "strings order lexicographically");
    }

    @Test
    @DisplayName("clamp: an inverted range is a caller error")
    void clampRejectsInvertedRange() {
        assertThrows(IllegalArgumentException.class, () -> Solution.clamp(5, 10, 1));
    }

    @Test
    @DisplayName("isSorted: equal neighbours count as sorted")
    void isSortedChecks() {
        assertTrue(Solution.isSorted(List.of(1, 2, 2, 3)));
        assertFalse(Solution.isSorted(List.of(1, 3, 2)));
        assertTrue(Solution.isSorted(List.of(1)));
        assertTrue(Solution.isSorted(List.<Integer>of()), "vacuously true");
        assertTrue(Solution.isSorted(List.of("a", "ab", "b")));
    }

    @Test
    @DisplayName("countGreaterThan: strictly greater, so ties do not count")
    void countGreaterThanCounts() {
        assertEquals(1, Solution.countGreaterThan(List.of(1, 5, 5, 9), 5));
        assertEquals(0, Solution.countGreaterThan(List.of(1, 2), 9));
        assertEquals(3, Solution.countGreaterThan(List.of(1, 2, 3), 0));
        assertEquals(0, Solution.countGreaterThan(List.<Integer>of(), 0));
    }

    @Test
    @DisplayName("sum: the Number bound is what makes doubleValue() reachable")
    void sumTotals() {
        assertEquals(6.0, Solution.sum(List.of(1, 2, 3)));
        assertEquals(4.0, Solution.sum(List.of(1.5, 2.5)));
        assertEquals(0.0, Solution.sum(List.<Integer>of()));

        List<Number> mixed = List.of(1, 2.5, 3L);
        assertEquals(6.5, Solution.sum(mixed), "T = Number satisfies `T extends Number`");
    }

    @Test
    @DisplayName("positivesSorted: one bound to read the value, one to order it")
    void positivesSortedFiltersAndOrders() {
        assertEquals(List.of(2, 3), Solution.positivesSorted(List.of(3, -1, 0, 2)));
        assertEquals(List.of(1.0, 2.5), Solution.positivesSorted(List.of(-1.5, 2.5, 1.0)));
        assertEquals(List.<Integer>of(), Solution.positivesSorted(List.<Integer>of()));
        assertEquals(List.<Integer>of(), Solution.positivesSorted(List.of(0, -4)),
                "zero is not positive");
    }

    @Test
    @DisplayName("next: the recursive Enum<E> bound hands back E, not Object")
    void nextWrapsAround() {
        assertSame(Suit.DIAMONDS, Solution.next(Suit.CLUBS));
        assertSame(Suit.SPADES, Solution.next(Suit.HEARTS));
        assertSame(Suit.CLUBS, Solution.next(Suit.SPADES), "the last wraps to the first");

        Suit typed = Solution.next(Suit.CLUBS);
        assertEquals("DIAMONDS", typed.name(), "the result is a Suit with no cast in sight");
    }

    @Test
    @DisplayName("maxBy: only the key type carries a bound")
    void maxByComparesKeys() {
        assertEquals("bbb", Solution.maxBy(List.of("a", "bbb", "cc"), String::length));
        assertEquals("aa", Solution.maxBy(List.of("aa", "bb"), String::length),
                "ties go to the earlier element");
        assertEquals("z", Solution.maxBy(List.of("z"), String::length));
        assertThrows(NoSuchElementException.class,
                () -> Solution.maxBy(List.<String>of(), String::length));

        Item axe = new Item("axe", 9);
        assertSame(axe, Solution.maxBy(List.of(new Item("rope", 1), axe), i -> i.weight),
                "elements need no ordering of their own");
    }

    @Test
    @DisplayName("Number is not Comparable, so max(List<Number>) could never compile")
    void numberIsNotComparable() {
        assertFalse(Comparable.class.isAssignableFrom(Number.class),
                "the abstract class declares no ordering; only its subclasses do");
        assertTrue(Comparable.class.isAssignableFrom(Integer.class));
    }

    @Test
    @DisplayName("Weapon is a Comparable<Item>, which is why the bound needs ? super")
    void weaponInheritsItsOrdering() {
        assertTrue(Comparable.class.isAssignableFrom(Weapon.class));
        assertEquals(0, Weapon.class.getGenericInterfaces().length, "Weapon declares nothing itself");
        assertTrue(Item.class.getGenericInterfaces()[0].getTypeName().endsWith("Comparable<Item>"),
                "the type argument is Item, so Weapon is not a Comparable<Weapon>");
    }
}
