import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("shout: filter then map, order preserved")
    void shoutFiltersAndMaps() {
        assertEquals(List.of("ANT", "BEE"), Solution.shout(List.of("ant", "  ", "bee", "")));
        assertEquals(List.of(), Solution.shout(List.of()));
        assertEquals(List.of(), Solution.shout(List.of(" ", "\t")), "blank is more than empty");
    }

    @Test
    @DisplayName("flatten: flatMap removes exactly one level")
    void flattenOneLevel() {
        assertEquals(List.of("a", "b", "c"),
                Solution.flatten(List.of(List.of("a", "b"), List.of(), List.of("c"))));
        assertEquals(List.of(), Solution.flatten(List.of()));
        assertEquals(List.of(), Solution.flatten(List.of(List.of(), List.of())));
    }

    @Test
    @DisplayName("distinctSorted: the two stateful intermediates")
    void distinctSortedOrders() {
        assertEquals(List.of("fig", "pear"), Solution.distinctSorted(List.of("pear", "fig", "pear")));
        assertEquals(List.of(), Solution.distinctSorted(List.of()));
        assertEquals(List.of("A", "a"), Solution.distinctSorted(List.of("a", "A", "a")),
                "distinct uses equals, so 'a' and 'A' are two elements");
    }

    @Test
    @DisplayName("page: skip and limit never complain about running off the end")
    void pageSlices() {
        List<String> words = List.of("a", "b", "c", "d", "e");
        assertEquals(List.of("b", "c"), Solution.page(words, 1, 2));
        assertEquals(List.of(), Solution.page(words, 99, 2), "skipping past the end is empty, not an error");
        assertEquals(List.of("a", "b", "c", "d", "e"), Solution.page(words, 0, 99));
        assertEquals(List.of(), Solution.page(words, 0, 0));
        assertEquals(List.of("e"), Solution.page(words, 4, 10));
    }

    @Test
    @DisplayName("product: reduce with an identity always returns a value")
    void productReduces() {
        assertEquals(24, Solution.product(List.of(2, 3, 4)));
        assertEquals(7, Solution.product(List.of(7)));
        assertEquals(1, Solution.product(List.of()), "the identity is what an empty stream yields");
    }

    @Test
    @DisplayName("product: an int accumulator wraps rather than growing")
    void productOverflows() {
        assertEquals(1410065408, Solution.product(List.of(100000, 100000)),
                "10^10 does not fit in an int, and nothing warns you");
    }

    @Test
    @DisplayName("longest: reduce without an identity returns an Optional")
    void longestReduces() {
        assertEquals(Optional.of("bbb"), Solution.longest(List.of("a", "bbb", "cc")));
        assertEquals(Optional.of("aa"), Solution.longest(List.of("aa", "bb")), "first one wins a tie");
        assertEquals(Optional.empty(), Solution.longest(List.of()),
                "no identity means an empty stream has no answer to give");
    }

    @Test
    @DisplayName("totalLength: mapToInt keeps the numbers unboxed")
    void totalLengthSums() {
        assertEquals(3, Solution.totalLength(List.of("ab", "c")));
        assertEquals(0, Solution.totalLength(List.of()), "sum of nothing is zero");
        assertEquals(0, Solution.totalLength(List.of("", "")));
        assertEquals(Integer.MIN_VALUE, IntStream.of(Integer.MAX_VALUE, 1).sum(),
                "IntStream.sum() returns an int, so it wraps — mapToLong when that matters");
    }

    @Test
    @DisplayName("averageLength: mean of nothing is not zero")
    void averageLengthAverages() {
        assertEquals(OptionalDouble.of(2.0), Solution.averageLength(List.of("ab", "cd")));
        assertEquals(OptionalDouble.of(2.0), Solution.averageLength(List.of("a", "bbb")));
        assertEquals(OptionalDouble.empty(), Solution.averageLength(List.of()),
                "sum(0) has an honest answer for an empty stream; average does not");
        assertEquals(1.5, Solution.averageLength(List.of("a", "bb")).getAsDouble());
    }

    @Test
    @DisplayName("elementsSeenBeforeFirstMatch: the pipeline stops the moment it can")
    void pipelineIsLazy() {
        assertEquals(3, Solution.elementsSeenBeforeFirstMatch(List.of("a", "bb", "ccc", "dddd"), 3),
                "'dddd' is never mapped — findFirst short-circuits");
        assertEquals(1, Solution.elementsSeenBeforeFirstMatch(List.of("xxx", "yyy"), 3));
        assertEquals(2, Solution.elementsSeenBeforeFirstMatch(List.of("a", "bb"), 3),
                "no match, so everything gets pulled through");
        assertEquals(0, Solution.elementsSeenBeforeFirstMatch(List.of(), 3));
    }

    @Test
    @DisplayName("attemptReuse: a stream is spent after one terminal operation")
    void streamsAreSingleUse() {
        assertEquals("IllegalStateException", Solution.attemptReuse(Stream.of("a", "b")));
        assertEquals("IllegalStateException", Solution.attemptReuse(Stream.of()),
                "an empty stream is spent just the same");
    }

    @Test
    @DisplayName("an intermediate operation with no terminal does nothing at all")
    void lazinessMeansNothingRuns() {
        StringBuilder log = new StringBuilder();
        Stream.of("a", "b").map(s -> { log.append(s); return s; });
        assertEquals("", log.toString(), "no terminal operation, no work");
    }

    @Test
    @DisplayName("toList() hands back an unmodifiable list")
    void toListIsImmutable() {
        assertThrows(UnsupportedOperationException.class, () -> Stream.of("a").toList().add("b"));
        assertFalse(Stream.of("a").toList() instanceof java.util.ArrayList);
    }
}
