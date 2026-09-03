import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.lang.foreign.Arena;
import java.lang.foreign.MemoryLayout;
import java.lang.foreign.MemoryLayout.PathElement;
import java.lang.foreign.MemorySegment;
import java.lang.foreign.ValueLayout;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("strlen: libc counts UTF-8 bytes, not Java chars")
    void strlenCountsBytes() {
        assertEquals(5L, Solution.strlen("hello"));
        assertEquals(0L, Solution.strlen(""));
        assertEquals(5L, Solution.strlen("café"), "four chars, five bytes once encoded");
        assertEquals(4, "café".length(), "which is not what Java would tell you");
    }

    @Test
    @DisplayName("cAbs: a downcall with no memory in it at all")
    void cAbsCalls() {
        assertEquals(5, Solution.cAbs(-5));
        assertEquals(5, Solution.cAbs(5));
        assertEquals(0, Solution.cAbs(0));
        assertEquals(Integer.MAX_VALUE, Solution.cAbs(-Integer.MAX_VALUE));
    }

    @Test
    @DisplayName("substringFrom: a returned pointer, resized before it can be read")
    void substringFromReinterprets() {
        assertEquals("world", Solution.substringFrom("hello world", 'w'));
        assertEquals("hello world", Solution.substringFrom("hello world", 'h'));
        assertEquals("d", Solution.substringFrom("hello world", 'd'), "the last byte before the NUL");
    }

    @Test
    @DisplayName("substringFrom: not found is NULL, not an empty pointer")
    void substringFromHandlesNull() {
        assertEquals("", Solution.substringFrom("hello world", 'z'));
        assertEquals("", Solution.substringFrom("", 'a'));
        assertEquals(0L, MemorySegment.NULL.address(), "NULL is a zero-length segment at address 0");
    }

    @Test
    @DisplayName("pointLayout: padded to 16 bytes, and the unpadded version is an error")
    void pointLayoutPads() {
        assertThrows(IllegalArgumentException.class, () -> MemoryLayout.structLayout(
                ValueLayout.JAVA_INT.withName("id"),
                ValueLayout.JAVA_LONG.withName("value")),
                "the two members back to back: a C compiler would have inserted the four bytes silently");

        MemoryLayout point = Solution.pointLayout();
        assertEquals(16, point.byteSize(), "not 12 — the long must start on an 8-byte boundary");
        assertEquals(8, point.byteAlignment());
        assertEquals(0, point.byteOffset(PathElement.groupElement("id")));
        assertEquals(8, point.byteOffset(PathElement.groupElement("value")));
    }

    @Test
    @DisplayName("writePoint: both members survive the round trip")
    void writePointRoundTrips() {
        assertArrayEquals(new long[] {7L, 99L}, Solution.writePoint(7, 99));
        assertArrayEquals(new long[] {0L, 0L}, Solution.writePoint(0, 0));
        assertArrayEquals(new long[] {-1L, Long.MIN_VALUE}, Solution.writePoint(-1, Long.MIN_VALUE),
                "the int member is sign-extended into the long[], not reinterpreted");
    }

    @Test
    @DisplayName("sumOffHeap: an int array living outside the heap")
    void sumOffHeapSums() {
        assertEquals(6L, Solution.sumOffHeap(new int[] {1, 2, 3}));
        assertEquals(0L, Solution.sumOffHeap(new int[0]));
        assertEquals(-6L, Solution.sumOffHeap(new int[] {-1, -2, -3}));
        assertEquals(2147483648L, Solution.sumOffHeap(new int[] {Integer.MAX_VALUE, 1}),
                "accumulated in a long, so no wrap");
    }

    @Test
    @DisplayName("copyThroughNativeMemory: out of the heap and back, unchanged")
    void copyRoundTrips() {
        byte[] input = {1, 2, 3, -128, 127};
        byte[] output = Solution.copyThroughNativeMemory(input);
        assertArrayEquals(input, output);
        assertNotSame(input, output, "a genuine round trip, not the same array handed back");
        assertArrayEquals(new byte[0], Solution.copyThroughNativeMemory(new byte[0]));
    }

    @Test
    @DisplayName("accessAfterClose: a segment carries bounds and a scope, and both are checked")
    void accessAfterCloseThrows() {
        try (Arena arena = Arena.ofConfined()) {
            MemorySegment seg = arena.allocate(16);
            assertEquals(16, seg.byteSize());
            assertEquals(0, seg.get(ValueLayout.JAVA_INT, 0), "arena memory arrives zeroed");
            assertThrows(IndexOutOfBoundsException.class, () -> seg.get(ValueLayout.JAVA_INT, 64),
                    "the bounds half: in C this would have read somebody else's memory");
        }
        assertEquals(0, MemorySegment.ofAddress(0x1000L).byteSize(),
                "a bare address has no length — which is why reinterpret exists");

        assertEquals("IllegalStateException", Solution.accessAfterClose(),
                "the scope half: reading a segment whose arena has closed");
    }

    @Test
    @DisplayName("accessFromAnotherThread: confinement is enforced, not documented")
    void confinementIsEnforced() {
        assertEquals("WrongThreadException", Solution.accessFromAnotherThread());
    }
}
