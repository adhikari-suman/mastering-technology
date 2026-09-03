import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    /** Unboxing, made visible: this is what `int n = map.get(k)` compiles to. */
    private static int unbox(Integer boxed) {
        return boxed;
    }

    @Test
    @DisplayName("required: returns its argument, so the check and the assignment are one line")
    void requiredReturnsTheValue() {
        assertEquals("jane@example.com", Solution.required("jane@example.com", "email"));
        assertEquals(List.of(), Solution.required(List.of(), "items"));
        NullPointerException e = assertThrows(NullPointerException.class,
                () -> Solution.required(null, "email"));
        assertEquals("email must not be null", e.getMessage(), "the field names itself");
    }

    @Test
    @DisplayName("npeMessage: the JVM says what you called and which expression was null")
    void helpfulNullPointerMessage() {
        String message = Solution.npeMessage(new Solution.Contact(null, "j@x.com"));
        assertTrue(message.contains("String.length()"), "what you tried to invoke: " + message);
        assertTrue(message.contains("Contact.name()"), "where the null came from: " + message);
        assertTrue(message.contains("is null"), message);
    }

    @Test
    @DisplayName("npeMessage: the message comes from the JVM, not from the exception")
    void helpfulMessagesAreGenerated() {
        assertEquals("ok", Solution.npeMessage(new Solution.Contact("Jane", "j@x.com")));
        assertNull(new NullPointerException().getMessage(),
                "an NPE you construct yourself has nothing to say");
    }

    @Test
    @DisplayName("Order: the copy is taken on the way in")
    void orderCopiesOnTheWayIn() {
        List<String> input = new ArrayList<>(List.of("a", "b"));
        Solution.Order order = new Solution.Order("Jane", input);
        input.add("c");
        assertEquals(List.of("a", "b"), order.items(), "the caller still holds their own list");
        assertEquals("Jane", order.customer());
    }

    @Test
    @DisplayName("Order: what comes out cannot be edited either")
    void orderCopiesOnTheWayOut() {
        Solution.Order order = new Solution.Order("Jane", new ArrayList<>(List.of("a", "b")));
        assertThrows(UnsupportedOperationException.class, () -> order.items().add("c"));
        assertEquals(List.of("a", "b"), order.items());
    }

    @Test
    @DisplayName("Order: nulls are refused at the door, by name")
    void orderRejectsNulls() {
        List<String> items = List.of("a");
        assertEquals("customer must not be null",
                assertThrows(NullPointerException.class,
                        () -> new Solution.Order(null, items)).getMessage());
        assertEquals("items must not be null",
                assertThrows(NullPointerException.class,
                        () -> new Solution.Order("Jane", null)).getMessage());
        assertThrows(NullPointerException.class,
                () -> new Solution.Order("Jane", Arrays.asList("a", null)),
                "a null element is refused too — List.copyOf is null-hostile");
    }

    @Test
    @DisplayName("nullTolerance: Map does not say, so implementations disagree")
    void mapsDisagreeAboutNull() {
        assertEquals("both", Solution.nullTolerance(new HashMap<>()),
                "HashMap takes a null key and null values, which is why they leak everywhere");
        assertEquals("neither", Solution.nullTolerance(new ConcurrentHashMap<>()));
        assertEquals("value only", Solution.nullTolerance(new TreeMap<>()),
                "it has to compare keys, and null does not compare");
    }

    @Test
    @DisplayName("nullTolerance: the factory collections refuse nulls before you can store one")
    void factoryCollectionsAreNullHostile() {
        assertThrows(NullPointerException.class, () -> Map.of("a", null));
        assertThrows(NullPointerException.class, () -> List.of("a", null));
        assertEquals("both", Solution.nullTolerance(new HashMap<>(Map.of("x", "y"))),
                "and a HashMap built from one is still permissive");
    }

    @Test
    @DisplayName("countOf: the unboxing NPE comes from a line with no dot on it")
    void countOfAvoidsUnboxing() {
        Map<String, Integer> counts = Map.of("a", 3);
        assertEquals(3, Solution.countOf(counts, "a"));
        assertEquals(0, Solution.countOf(counts, "b"));
        assertEquals(0, Solution.countOf(Map.of(), "a"));
        assertThrows(NullPointerException.class, () -> unbox(counts.get("b")),
                "int n = counts.get(\"b\") is exactly this");
    }

    @Test
    @DisplayName("safeList: absence is an empty collection, and it is unmodifiable")
    void safeListNeverReturnsNull() {
        assertEquals(List.of(), Solution.safeList(null));
        assertEquals(List.of("a", "b"), Solution.safeList(List.of("a", "b")));
        assertThrows(UnsupportedOperationException.class, () -> Solution.safeList(null).add("x"));
        assertThrows(NullPointerException.class, () -> Solution.safeList(Arrays.asList("a", null)));
    }

    @Test
    @DisplayName("@Nullable: readable at runtime, and enforcing absolutely nothing")
    void annotationIsDocumentationOnly() {
        assertTrue(Solution.isMarkedNullable("maybeName"));
        assertFalse(Solution.isMarkedNullable("required"));
        assertFalse(Solution.isMarkedNullable("nonesuch"));

        assertEquals("Jane", Solution.maybeName(true));
        assertNull(Solution.maybeName(false),
                "the annotation is there, the null still arrived, nothing stopped it");
    }
}
