import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    private static final Map<String, String> ALIASES = Map.of("jane", "j.doe");
    private static final Map<String, String> DIRECTORY = Map.of("j.doe", "j.doe@example.com");

    @Test
    @DisplayName("lookup: a missing key and a blank value are the same answer")
    void lookupTreatsBlankAsAbsent() {
        assertEquals(Optional.of("1"), Solution.lookup(Map.of("a", "1"), "a"));
        assertEquals(Optional.empty(), Solution.lookup(Map.of("a", "1"), "b"));
        assertEquals(Optional.empty(), Solution.lookup(Map.of("a", "   "), "a"), "filtered out");
    }

    @Test
    @DisplayName("lookup: a null value in the map does not become Optional.of(null)")
    void lookupHandlesNullValues() {
        Map<String, String> withNull = new HashMap<>();
        withNull.put("a", null);
        assertEquals(Optional.empty(), Solution.lookup(withNull, "a"));
        assertThrows(NullPointerException.class, () -> Optional.of(withNull.get("a")),
                "which is what Optional.of would have done");
    }

    @Test
    @DisplayName("parseInt: absence stands in for failure")
    void parseIntIsTotal() {
        assertEquals(Optional.of(42), Solution.parseInt("42"));
        assertEquals(Optional.of(-7), Solution.parseInt("-7"));
        assertEquals(Optional.empty(), Solution.parseInt("x"));
        assertEquals(Optional.empty(), Solution.parseInt(""));
        assertEquals(Optional.empty(), Solution.parseInt(null));
    }

    @Test
    @DisplayName("orElse computes its fallback even when the value is present")
    void orElseIsEager() {
        AtomicInteger calls = new AtomicInteger();
        Supplier<String> fallback = () -> {
            calls.incrementAndGet();
            return "fallback";
        };

        assertEquals("v", Solution.eagerFallback(Optional.of("v"), fallback));
        assertEquals(1, calls.get(), "the fallback ran, and its result was thrown away");

        calls.set(0);
        assertEquals("fallback", Solution.eagerFallback(Optional.empty(), fallback));
        assertEquals(1, calls.get());
    }

    @Test
    @DisplayName("orElseGet never touches the supplier when a value is present")
    void orElseGetIsLazy() {
        AtomicInteger calls = new AtomicInteger();
        Supplier<String> fallback = () -> {
            calls.incrementAndGet();
            return "fallback";
        };

        assertEquals("v", Solution.lazyFallback(Optional.of("v"), fallback));
        assertEquals(0, calls.get(), "the difference between the two methods, in one number");

        assertEquals("fallback", Solution.lazyFallback(Optional.empty(), fallback));
        assertEquals(1, calls.get());
    }

    @Test
    @DisplayName("resolve: flatMap chains two lookups without nesting the Optionals")
    void resolveFlatMaps() {
        assertEquals(Optional.of("j.doe@example.com"), Solution.resolve(ALIASES, DIRECTORY, "jane"));
        assertEquals(Optional.empty(), Solution.resolve(ALIASES, DIRECTORY, "bob"), "no alias");
        assertEquals(Optional.empty(), Solution.resolve(Map.of("jane", "ghost"), DIRECTORY, "jane"),
                "alias resolved, directory did not");
    }

    @Test
    @DisplayName("presentOnly: Optional.stream drops the empties")
    void presentOnlyFlattens() {
        assertEquals(List.of("a", "b"),
                Solution.presentOnly(List.of(Optional.of("a"), Optional.empty(), Optional.of("b"))));
        assertEquals(List.of(), Solution.presentOnly(List.of()));
        assertEquals(List.of(), Solution.presentOnly(List.of(Optional.empty(), Optional.empty())));
        assertEquals(1, Optional.of("a").stream().count(), "one element, or none");
        assertEquals(0, Optional.empty().stream().count());
    }

    @Test
    @DisplayName("preferred: or() keeps the result wrapped and skips the second source")
    void preferredShortCircuits() {
        AtomicInteger calls = new AtomicInteger();
        Supplier<Optional<String>> second = () -> {
            calls.incrementAndGet();
            return Optional.of("b");
        };

        assertEquals(Optional.of("a"), Solution.preferred(Optional.of("a"), second));
        assertEquals(0, calls.get(), "the second source was never consulted");

        assertEquals(Optional.of("b"), Solution.preferred(Optional.empty(), second));
        assertEquals(1, calls.get());
        assertEquals(Optional.empty(), Solution.preferred(Optional.empty(), Optional::empty));
    }

    @Test
    @DisplayName("describe: both branches handled in one call")
    void describeTakesBothBranches() {
        assertEquals("got hi", Solution.describe(Optional.of("hi")));
        assertEquals("nothing", Solution.describe(Optional.empty()));
    }

    @Test
    @DisplayName("tagsOf: an absent collection is an empty collection")
    void tagsOfNeverReturnsOptional() {
        assertEquals(List.of("java", "errors"),
                Solution.tagsOf(Map.of("post", List.of("java", "errors")), "post"));
        assertEquals(List.of(), Solution.tagsOf(Map.of("post", List.of("java")), "missing"));

        Map<String, List<String>> withNull = new HashMap<>();
        withNull.put("post", null);
        assertEquals(List.of(), Solution.tagsOf(withNull, "post"));
    }

    @Test
    @DisplayName("demand: orElseThrow says what went wrong")
    void demandThrowsOnEmpty() {
        assertEquals("hi", Solution.demand(Optional.of("hi")));
        NoSuchElementException e = assertThrows(NoSuchElementException.class,
                () -> Solution.demand(Optional.empty()));
        assertEquals("No value present", e.getMessage(), "not a NullPointerException");
    }

    @Test
    @DisplayName("Optional is a return type, not a container: equality and identity")
    void optionalSemantics() {
        assertEquals(Optional.of("a"), Optional.of("a"), "value-based equals, so this holds");
        assertTrue(Solution.lookup(Map.of("a", "1"), "a").isPresent());
        assertEquals(Optional.empty(), Optional.ofNullable(null));
        assertEquals(Optional.of(1), Solution.parseInt("1"), "Optional<Integer> equals by value too");
    }
}
