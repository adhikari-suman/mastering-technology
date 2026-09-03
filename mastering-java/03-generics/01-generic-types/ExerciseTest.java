import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("pair: a generic factory infers both parameters from the arguments")
    void pairInfers() {
        Solution.Pair<String, Integer> p = Solution.pair("a", 1);
        assertEquals("a", p.first());
        assertEquals(1, p.second());

        Solution.Pair<Object, Object> nulls = Solution.pair(null, null);
        assertNull(nulls.first(), "inference falls back to Object when there is nothing to go on");
    }

    @Test
    @DisplayName("Pair.swapped: the type parameters change places, not just the values")
    void pairSwaps() {
        Solution.Pair<Integer, String> swapped = Solution.pair("a", 1).swapped();
        assertEquals(1, swapped.first());
        assertEquals("a", swapped.second());
    }

    @Test
    @DisplayName("Pair.withSecond: a method-level type parameter adds a third type")
    void pairWithSecond() {
        Solution.Pair<String, Boolean> p = Solution.pair("a", 1).withSecond(true);
        assertEquals("a", p.first());
        assertEquals(true, p.second());
        assertEquals("z", Solution.pair("z", 1).withSecond(List.of()).first());
    }

    @Test
    @DisplayName("firstOr: head, fallback, and the difference between them")
    void firstOrReads() {
        assertEquals("a", Solution.firstOr(List.of("a", "b"), "z"));
        assertEquals("z", Solution.firstOr(List.of(), "z"));
        assertEquals("z", Solution.firstOr(null, "z"), "a null list is empty for this purpose");

        List<String> nullHead = new ArrayList<>();
        nullHead.add(null);
        assertNull(Solution.firstOr(nullHead, "z"), "a present null is still present");
    }

    @Test
    @DisplayName("repeat: n references to one object, in a mutable list")
    void repeatCopies() {
        Object token = new Object();
        List<Object> three = Solution.repeat(token, 3);
        assertEquals(3, three.size());
        assertSame(token, three.get(0));
        assertSame(three.get(0), three.get(2), "the same object n times, not n copies");

        three.add(token);
        assertEquals(4, three.size(), "the result has to be mutable");
        assertEquals(List.of(), Solution.repeat("a", 0));
    }

    @Test
    @DisplayName("repeat: a negative count is rejected, and an explicit type argument widens it")
    void repeatRejectsAndWidens() {
        assertThrows(IllegalArgumentException.class, () -> Solution.repeat("a", -1));

        List<Number> widened = Solution.<Number>repeat(1, 2);
        assertEquals(2, widened.size(), "Solution.<Number>repeat overrides what inference would pick");
        widened.add(2.5);
        assertEquals(2.5, widened.get(2));
    }

    @Test
    @DisplayName("invert: K and V trade places in the return type")
    void invertSwaps() {
        assertEquals(Map.of(1, "a", 2, "b"), Solution.invert(Map.of("a", 1, "b", 2)));
        assertEquals(Map.of(), Solution.invert(Map.of()));

        Map<Integer, String> collided = Solution.invert(Map.of("a", 1, "b", 1));
        assertEquals(1, collided.size(), "two keys sharing a value collapse to one entry");
    }

    @Test
    @DisplayName("mapEach: the transformer's O decides the result's element type")
    void mapEachTransforms() {
        assertEquals(List.of(1, 2), Solution.mapEach(List.of("a", "bb"), s -> s.length()));
        assertEquals(List.of(), Solution.mapEach(List.<String>of(), s -> s.length()));
        assertEquals(List.of("1", "2"), Solution.mapEach(List.of(1, 2), String::valueOf));
    }

    @Test
    @DisplayName("lengthTransformer: a generic interface is still a lambda target")
    void lengthTransformerWorks() {
        Transformer<String, Integer> t = Solution.lengthTransformer();
        assertEquals(3, t.apply("abc"));
        assertEquals(0, t.apply(""));
        assertEquals(List.of(3, 0), Solution.mapEach(List.of("abc", ""), t));
    }

    @Test
    @DisplayName("poison: a raw reference puts an Integer into a List<String>")
    void poisonStores() {
        List<String> names = new ArrayList<>(List.of("ok"));
        List<String> same = Solution.poison(names, 42);

        assertSame(names, same, "poison returns the list it was given");
        assertEquals(2, names.size());
        assertEquals("ok", names.get(0), "the sound element is untouched");

        List<?> asAny = names;
        assertEquals(42, asAny.get(1), "read it as Object and the Integer is plainly there");
    }

    @Test
    @DisplayName("poison: the ClassCastException lands on the reader, not the writer")
    void poisonExplodesLater() {
        List<String> names = Solution.poison(new ArrayList<>(List.of("ok")), 42);

        assertThrows(ClassCastException.class, () -> names.get(1).length(),
                "javac inserted a cast to String here; nothing checked it on the way in");
        assertEquals(2, names.size(), "the list itself is perfectly happy");
    }

    @Test
    @DisplayName("generics are compile-time only: two parameterisations share one class")
    void erasureIsVisibleAlready() {
        List<String> strings = new ArrayList<>();
        List<Integer> ints = new ArrayList<>();
        assertSame(strings.getClass(), ints.getClass(),
                "there is no List<String> at runtime — which is why poison works");
        assertTrue(strings.getClass().getTypeParameters().length == 1,
                "the class knows it HAS a parameter, never what it was given");
    }
}
