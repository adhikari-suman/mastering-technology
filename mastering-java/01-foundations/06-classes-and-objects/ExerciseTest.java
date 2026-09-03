import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.function.IntSupplier;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("initOrder: static once, then field and block in source order, then the constructor")
    void initialisationOrder() {
        assertEquals(List.of("static", "field", "block", "constructor"), Solution.initOrder(),
                "the constructor body runs last, not first");
    }

    @Test
    @DisplayName("Point: the no-argument constructor delegates with this(0, 0)")
    void pointDelegates() {
        Solution.Point origin = new Solution.Point();
        assertEquals(0, origin.x);
        assertEquals(0, origin.y);
        assertEquals("Point[0, 0]", origin.toString());
    }

    @Test
    @DisplayName("Point: this.x = x, because the parameter shadows the field")
    void pointStoresCoordinates() {
        Solution.Point p = new Solution.Point(3, 4);
        assertEquals(3, p.x);
        assertEquals(4, p.y);
        assertEquals("Point[3, 4]", p.toString());
        assertFalse(p.toString().contains("@"), "the default toString would have an identity hash in it");
        assertTrue(new Object().toString().contains("@"), "like this one");
    }

    @Test
    @DisplayName("Account: money moves, and the balance is only reachable through the accessor")
    void accountMovesMoney() {
        Solution.Account account = new Solution.Account(100);
        assertEquals(100, account.balance());
        account.deposit(50);
        assertEquals(150, account.balance());
        account.withdraw(40);
        assertEquals(110, account.balance());
        assertEquals(0, new Solution.Account(0).balance());
    }

    @Test
    @DisplayName("Account: a rejected operation changes nothing")
    void accountKeepsItsInvariant() {
        assertThrows(IllegalArgumentException.class, () -> new Solution.Account(-1));

        Solution.Account account = new Solution.Account(100);
        assertThrows(IllegalArgumentException.class, () -> account.withdraw(101));
        assertThrows(IllegalArgumentException.class, () -> account.withdraw(0));
        assertThrows(IllegalArgumentException.class, () -> account.deposit(-1));
        assertEquals(100, account.balance(), "check before you subtract");
    }

    @Test
    @DisplayName("Badge: an inner class reads the outer instance it was made from")
    void badgeSeesItsOuter() {
        Solution outer = new Solution("beta");
        Solution.Badge badge = outer.new Badge();
        assertEquals("<beta>", badge.render());
    }

    @Test
    @DisplayName("Badge: each outer instance gets its own view")
    void badgesAreTiedToTheirOuter() {
        assertEquals("<one>", new Solution("one").new Badge().render());
        assertEquals("<two>", new Solution("two").new Badge().render());
        assertEquals("<null>", new Solution(null).new Badge().render(), "concatenation, not a crash");
    }

    @Test
    @DisplayName("counterFrom: an anonymous class can hold state that a lambda cannot")
    void counterRemembers() {
        IntSupplier counter = Solution.counterFrom(5);
        assertEquals(5, counter.getAsInt());
        assertEquals(6, counter.getAsInt());
        assertEquals(7, counter.getAsInt());
    }

    @Test
    @DisplayName("counterFrom: each call builds a separate instance with separate state")
    void countersAreIndependent() {
        IntSupplier first = Solution.counterFrom(0);
        IntSupplier second = Solution.counterFrom(0);
        assertNotSame(first, second);
        assertEquals(0, first.getAsInt());
        assertEquals(1, first.getAsInt());
        assertEquals(0, second.getAsInt(), "second was never advanced");
        assertEquals(-1, Solution.counterFrom(-1).getAsInt());
    }
}
