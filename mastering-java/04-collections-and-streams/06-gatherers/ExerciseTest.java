import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;
import java.util.stream.Gatherers;
import java.util.stream.Stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("batches: fixed windows, with a short one at the end")
    void batchesChunk() {
        assertEquals(List.of(List.of("a", "b"), List.of("c", "d"), List.of("e")),
                Solution.batches(List.of("a", "b", "c", "d", "e"), 2));
        assertEquals(List.of(List.of("a", "b", "c")), Solution.batches(List.of("a", "b", "c"), 3));
        assertEquals(List.of(), Solution.batches(List.of(), 2), "no elements, no windows");
    }

    @Test
    @DisplayName("batches: a window bigger than the stream is one short window")
    void batchesOversized() {
        assertEquals(List.of(List.of("a", "b")), Solution.batches(List.of("a", "b"), 5),
                "not empty — the whole stream comes back in a single chunk");
        assertThrows(UnsupportedOperationException.class,
                () -> Solution.batches(List.of("a"), 1).get(0).add("b"),
                "the windows themselves are immutable");
    }

    @Test
    @DisplayName("slidingSums: overlapping windows, and the pipeline carries on after gather")
    void slidingSumsSlide() {
        assertEquals(List.of(3, 5, 7), Solution.slidingSums(List.of(1, 2, 3, 4), 2));
        assertEquals(List.of(6, 9), Solution.slidingSums(List.of(1, 2, 3, 4), 3));
        assertEquals(List.of(3), Solution.slidingSums(List.of(1, 2), 5), "again, one short window");
        assertEquals(List.of(1, 2), Solution.slidingSums(List.of(1, 2), 1));
    }

    @Test
    @DisplayName("runningTotals: scan emits one per element and never the seed")
    void runningTotalsScan() {
        assertEquals(List.of(1, 3, 6), Solution.runningTotals(List.of(1, 2, 3)));
        assertEquals(List.of(5), Solution.runningTotals(List.of(5)));
        assertEquals(List.of(), Solution.runningTotals(List.of()),
                "no elements in, no elements out — the 0 is never emitted");
    }

    @Test
    @DisplayName("concatenate: fold emits exactly one element, even from nothing")
    void concatenateFolds() {
        assertEquals("abc", Solution.concatenate(List.of("a", "b", "c")));
        assertEquals("", Solution.concatenate(List.of()));
        assertEquals(1, Stream.<Integer>of().gather(Gatherers.fold(() -> 0, Integer::sum)).count(),
                "fold on an empty stream still emits the seed — unlike scan, which emits nothing");
        assertEquals(0, Stream.<Integer>of().gather(Gatherers.scan(() -> 0, Integer::sum)).count());
    }

    @Test
    @DisplayName("dedupeConsecutive: the transformation map and filter cannot express")
    void dedupeConsecutiveDrops() {
        assertEquals(List.of("a", "b", "a"),
                Solution.dedupeConsecutive(List.of("a", "a", "b", "b", "a")),
                "the last 'a' survives — only ADJACENT repeats go");
        assertEquals(List.of(), Solution.dedupeConsecutive(List.of()));
        assertEquals(List.of("a"), Solution.dedupeConsecutive(List.of("a", "a", "a")));
        assertEquals(List.of("a", "b", "c"), Solution.dedupeConsecutive(List.of("a", "b", "c")));
    }

    @Test
    @DisplayName("dedupeConsecutive: the state is per-run, so a second call starts clean")
    void dedupeStateIsPerRun() {
        assertEquals(List.of("a"), Solution.dedupeConsecutive(List.of("a")));
        assertEquals(List.of("a"), Solution.dedupeConsecutive(List.of("a")),
                "state captured outside the initializer would have swallowed this one");
    }

    @Test
    @DisplayName("takeThrough: emits the element that stopped it")
    void takeThroughIncludes() {
        assertEquals(List.of(1, 2, 3),
                Stream.of(1, 2, 3, 4, 5).gather(Solution.takeThrough(3)).toList());
        assertEquals(List.of(1, 2), Stream.of(1, 2).gather(Solution.takeThrough(9)).toList(),
                "nothing reaches the threshold, so everything comes through");
        assertEquals(List.of(7), Stream.of(7, 8).gather(Solution.takeThrough(3)).toList(),
                "the very first element can be the last one");
        assertEquals(List.of(1, 2), Stream.of(1, 2, 3, 4).takeWhile(x -> x < 3).toList(),
                "takeWhile drops the 3 — which is why this gatherer had to exist");
    }

    @Test
    @DisplayName("takeThrough: returning false stops an infinite source")
    void takeThroughShortCircuits() {
        assertEquals(List.of(1, 2, 3),
                Stream.iterate(1, x -> x + 1).gather(Solution.takeThrough(3)).toList(),
                "an integrator that never returned false would hang here");
    }

    @Test
    @DisplayName("tail: a gatherer that emits nothing until its finisher runs")
    void tailBuffers() {
        assertEquals(List.of("c", "d"), Solution.tail(List.of("a", "b", "c", "d"), 2));
        assertEquals(List.of("a"), Solution.tail(List.of("a"), 3), "fewer elements than asked for");
        assertEquals(List.of(), Solution.tail(List.of("a", "b"), 0));
        assertEquals(List.of(), Solution.tail(List.of(), 2));
    }

    @Test
    @DisplayName("mapConcurrently: output is in input order, not completion order")
    void mapConcurrentKeepsOrder() {
        assertEquals(List.of("ANT", "BEE", "COW"),
                Solution.mapConcurrently(List.of("ant", "bee", "cow"), 4));
        assertEquals(List.of(), Solution.mapConcurrently(List.of(), 4));
        assertEquals(List.of("ANT"), Solution.mapConcurrently(List.of("ant"), 1));
    }

    @Test
    @DisplayName("mapConcurrent runs the mapper on virtual threads")
    void mapConcurrentUsesVirtualThreads() {
        List<Boolean> virtual = Stream.of(1, 2, 3)
                .gather(Gatherers.mapConcurrent(3, x -> Thread.currentThread().isVirtual()))
                .toList();
        assertEquals(List.of(true, true, true), virtual);
        assertFalse(Thread.currentThread().isVirtual(), "while the test itself runs on a platform thread");
    }

    @Test
    @DisplayName("a gatherer is intermediate: more pipeline can follow it")
    void gatherIsIntermediate() {
        assertEquals(List.of(2L, 2L, 1L),
                Stream.of(1, 2, 3, 4, 5).gather(Gatherers.windowFixed(2))
                        .map(w -> (long) w.size()).toList(),
                "collect would have ended the pipeline here; gather does not");
    }
}
