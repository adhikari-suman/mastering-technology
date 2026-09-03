import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("arrayOf: the template carries the element type erasure lost")
    void arrayOfBuildsRealArrays() {
        String[] strings = Solution.arrayOf("x", 3, new String[0]);
        assertEquals(List.of("x", "x", "x"), Arrays.asList(strings));
        assertSame(String[].class, strings.getClass(),
                "a genuine String[], not an Object[] in disguise");

        Integer[] ints = Solution.arrayOf(1, 2, new Integer[0]);
        assertEquals(List.of(1, 1), Arrays.asList(ints));
    }

    @Test
    @DisplayName("arrayOf: zero is fine, negative is the JVM's problem")
    void arrayOfEdges() {
        assertEquals(0, Solution.arrayOf("x", 0, new String[0]).length);
        assertThrows(NegativeArraySizeException.class, () -> Solution.arrayOf("x", -1, new String[0]));
    }

    @Test
    @DisplayName("unsafeArray: the (T[]) cast never fails where you wrote it")
    void unsafeArrayLooksFine() {
        List<Object> objects = List.of("a", "b");
        Object[] fine = Solution.unsafeArray(objects);

        assertEquals(2, fine.length);
        assertSame(Object[].class, fine.getClass(),
                "toArray() made an Object[]; the cast changed nothing");
    }

    @Test
    @DisplayName("unsafeArray: it fails in the caller, at a cast the caller did not write")
    void unsafeArrayFailsLater() {
        assertThrows(ClassCastException.class, () -> {
            String[] bad = Solution.unsafeArray(List.of("a"));
            assertEquals(1, bad.length);
        }, "assigning an Object[] to a String[] variable is where javac put the check");
    }

    @Test
    @DisplayName("isListOfStrings: element-by-element, because instanceof cannot")
    void isListOfStringsChecks() {
        assertTrue(Solution.isListOfStrings(List.of("a", "b")));
        assertFalse(Solution.isListOfStrings(List.of("a", 1)));
        assertFalse(Solution.isListOfStrings("a"), "a String is not a List of them");
        assertFalse(Solution.isListOfStrings(null));
        assertTrue(Solution.isListOfStrings(Arrays.asList("a")));
    }

    @Test
    @DisplayName("isListOfStrings: an empty list of anything is an empty list of Strings")
    void isListOfStringsIsBlindWhenEmpty() {
        assertTrue(Solution.isListOfStrings(List.of()));
        assertTrue(Solution.isListOfStrings(new ArrayList<Integer>()),
                "there is nothing at runtime that says Integer — the answer cannot be better");
    }

    @Test
    @DisplayName("uncheckedCast: same object, no copy, and no failure at the cast")
    void uncheckedCastSucceedsWrongly() {
        List<Integer> source = List.of(1, 2, 3);
        List<String> strings = Solution.uncheckedCast(source);

        assertSame(source, strings, "no copying happened; (List<T>) is just (List)");
        assertEquals(3, strings.size(), "size() never touches an element, so it is happy");
    }

    @Test
    @DisplayName("uncheckedCast: the first read is where it goes wrong")
    void uncheckedCastFailsOnRead() {
        List<String> strings = Solution.uncheckedCast(List.of(1, 2, 3));
        assertThrows(ClassCastException.class, () -> strings.get(0).length());
    }

    @Test
    @DisplayName("firstOfFirst: read as Object, the smuggled Integer is simply there")
    void firstOfFirstPolluted() {
        List<Object> anything = List.of(new Object());
        Object smuggled = Solution.firstOfFirst(anything);
        assertEquals(42, smuggled, "the caller asked for the first Object and got an Integer");
    }

    @Test
    @DisplayName("firstOfFirst: read as String, it is a ClassCastException with no cast in sight")
    void firstOfFirstExplodes() {
        assertThrows(ClassCastException.class, () -> {
            String s = Solution.firstOfFirst(List.of("a"));
            assertEquals("a", s);
        });
    }

    @Test
    @DisplayName("flatten: the same varargs shape, only reading, so @SafeVarargs holds")
    void flattenIsSafe() {
        List<Number> numbers = Solution.flatten(List.of(1, 2), List.of(3.0));
        assertEquals(List.of(1, 2, 3.0), numbers);

        assertEquals(List.of(), Solution.flatten(List.<Integer>of()));
        assertEquals(List.<String>of(), Solution.<String>flatten());

        numbers.add(4);
        assertEquals(4, numbers.size(), "a fresh mutable list");
    }

    @Test
    @DisplayName("declaredOverloads: the compiler wrote a compareTo you never did")
    void declaredOverloadsSeesTheBridge() {
        assertEquals(List.of("int compareTo(Object) [bridge]", "int compareTo(Sized)"),
                Solution.declaredOverloads(Sized.class, "compareTo"),
                "the interface's erased method is compareTo(Object); something had to implement it");
        assertEquals(List.of("String label()"), Solution.declaredOverloads(Sized.class, "label"));
        assertEquals(List.of(), Solution.declaredOverloads(Sized.class, "absent"));
    }

    @Test
    @DisplayName("erasedParameterType: a type variable becomes its leftmost bound")
    void erasedParameterTypeShowsTheBound() {
        assertSame(Object.class, Solution.erasedParameterType(Erased.class, "unbounded"));
        assertSame(Number.class, Solution.erasedParameterType(Erased.class, "bounded"));
        assertSame(Number.class, Solution.erasedParameterType(Erased.class, "multi"),
                "Number & Comparable<T> erases to Number — the leftmost bound wins");
        assertSame(Comparable.class, Solution.erasedParameterType(Erased.class, "ordered"));
        assertThrows(NoSuchElementException.class,
                () -> Solution.erasedParameterType(Erased.class, "absent"));
    }

    @Test
    @DisplayName("List<String> and List<Integer> are one type, which is the whole lesson")
    void erasureIsTotal() {
        assertSame(List.class, Solution.erasedParameterType(Erased.class, "ofStrings"),
                "List<String> is compiled as List, so two such overloads would collide");
        assertSame(new ArrayList<String>().getClass(), new ArrayList<Integer>().getClass());

        Object list = List.of("a");
        assertTrue(list instanceof List<?>, "the wildcard form is legal: it asks nothing");
    }
}
