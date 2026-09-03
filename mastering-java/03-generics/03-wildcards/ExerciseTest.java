import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.TreeSet;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("sumAll: one signature accepts List<Integer>, List<Double> and Set<Number>")
    void sumAllReadsAnyNumbers() {
        assertEquals(6.0, Solution.sumAll(List.of(1, 2, 3)));
        assertEquals(4.0, Solution.sumAll(List.of(1.5, 2.5)));
        assertEquals(0.0, Solution.sumAll(Set.<Integer>of()));

        Set<Number> mixed = new TreeSet<>(List.of(1, 2, 3));
        assertEquals(6.0, Solution.sumAll(mixed), "the wildcard is what makes all four calls legal");
    }

    @Test
    @DisplayName("fillSquares: a consumer accepts any list that can hold an Integer")
    void fillSquaresWrites() {
        List<Number> numbers = new ArrayList<>();
        Solution.fillSquares(numbers, 4);
        assertEquals(List.of(0, 1, 4, 9), numbers);

        List<Object> objects = new ArrayList<>(List.of("head"));
        Solution.fillSquares(objects, 2);
        assertEquals(List.of("head", 0, 1), objects, "existing contents survive");

        List<Integer> ints = new ArrayList<>();
        Solution.fillSquares(ints, 0);
        assertEquals(List.of(), ints);
    }

    @Test
    @DisplayName("fillSquares: a negative count is a caller error")
    void fillSquaresRejectsNegative() {
        assertThrows(IllegalArgumentException.class,
                () -> Solution.fillSquares(new ArrayList<Number>(), -1));
    }

    @Test
    @DisplayName("copyInto: PECS lets dogs flow into a list of animals")
    void copyIntoMovesSubtypes() {
        List<Animal> dest = new ArrayList<>(List.of(new Cat("tom")));
        List<Dog> src = List.of(new Dog("rex"), new Dog("fido"));

        assertEquals(2, Solution.copyInto(dest, src));
        assertEquals(3, dest.size());
        assertEquals("rex", dest.get(1).name);
        assertEquals(2, src.size(), "the source is untouched");
    }

    @Test
    @DisplayName("copyInto: the same method with the plainest possible types")
    void copyIntoHandlesExactTypes() {
        List<String> dest = new ArrayList<>();
        assertEquals(0, Solution.copyInto(dest, List.<String>of()));
        assertEquals(2, Solution.copyInto(dest, List.of("a", "b")));
        assertEquals(List.of("a", "b"), dest);
    }

    @Test
    @DisplayName("countNulls: the unbounded wildcard is all this needs")
    void countNullsCounts() {
        assertEquals(2, Solution.countNulls(Arrays.asList("a", null, null)));
        assertEquals(0, Solution.countNulls(List.of("a")));
        assertEquals(0, Solution.countNulls(List.of()));
        assertEquals(3, Solution.countNulls(Arrays.asList(null, null, null)));
    }

    @Test
    @DisplayName("swap: exchanging two elements of a list you cannot name the type of")
    void swapExchanges() {
        List<String> letters = new ArrayList<>(List.of("a", "b", "c"));
        Solution.swap(letters, 0, 2);
        assertEquals(List.of("c", "b", "a"), letters);

        Solution.swap(letters, 1, 1);
        assertEquals(List.of("c", "b", "a"), letters, "swapping a slot with itself changes nothing");

        List<Integer> numbers = new ArrayList<>(List.of(1, 2));
        Solution.swap(numbers, 0, 1);
        assertEquals(List.of(2, 1), numbers);
    }

    @Test
    @DisplayName("swap: an out-of-range index still throws from the list itself")
    void swapRejectsBadIndex() {
        List<String> letters = new ArrayList<>(List.of("a", "b"));
        assertThrows(IndexOutOfBoundsException.class, () -> Solution.swap(letters, 0, 9));
    }

    @Test
    @DisplayName("concat: two producers of different subtypes, one honest result")
    void concatJoins() {
        List<Dog> dogs = List.of(new Dog("rex"));
        List<Cat> cats = List.of(new Cat("tom"));

        List<Animal> all = Solution.concat(dogs, cats);
        assertEquals(2, all.size());
        assertEquals("rex", all.get(0).name);

        all.add(new Dog("fido"));
        assertEquals(3, all.size(), "the result is a fresh mutable list, not a view");
        assertEquals(1, dogs.size(), "and the inputs are untouched");
    }

    @Test
    @DisplayName("concat: empty inputs, and inference from the assignment target")
    void concatHandlesEmpty() {
        assertEquals(List.of(1), Solution.concat(List.of(), List.of(1)));
        assertEquals(List.of(), Solution.concat(List.of(), List.of()));
        assertEquals(List.of("a", "b"), Solution.concat(List.of("a"), List.of("b")));
    }

    @Test
    @DisplayName("maxOf: a bound and a wildcard doing two different jobs")
    void maxOfOrders() {
        assertEquals(3, Solution.maxOf(Set.of(3, 1, 2)));
        assertEquals("c", Solution.maxOf(List.of("a", "c", "b")));

        List<Integer> ints = List.of(5);
        Number asNumber = Solution.<Integer>maxOf(ints);
        assertEquals(5, asNumber);

        assertThrows(NoSuchElementException.class, () -> Solution.maxOf(List.<String>of()));
    }

    @Test
    @DisplayName("storeInto: arrays are covariant, and pay for it at runtime")
    void storeIntoChecksAtRuntime() {
        assertTrue(Solution.storeInto(new Object[1], 42));
        assertTrue(Solution.storeInto(new Number[1], 42));
        assertTrue(Solution.storeInto(new String[1], "ok"));
        assertFalse(Solution.storeInto(new String[1], 42),
                "ArrayStoreException, checked on every store");

        Object[] widened = new String[1];
        assertSame(String[].class, widened.getClass(), "the array never forgot what it is");
    }

    @Test
    @DisplayName("arrays are covariant where generics are invariant")
    void covarianceComparison() {
        assertTrue(Object[].class.isAssignableFrom(String[].class),
                "String[] IS an Object[] — this is the assignment generics refuse");
        assertSame(new ArrayList<String>().getClass(), new ArrayList<Integer>().getClass(),
                "a list, by contrast, has nothing left at runtime to check against");
    }
}
