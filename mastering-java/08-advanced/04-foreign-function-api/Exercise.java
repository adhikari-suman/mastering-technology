import java.lang.foreign.MemoryLayout;

/**
 * Part 08, Lesson 04 — The Foreign Function & Memory API
 *
 * DON'T EDIT THIS FILE. It is the pristine copy you can always reset from.
 *
 * Start by duplicating it:
 *     cp Exercise.java Solution.java
 *
 * Then write your answers in Solution.java, deleting each `throw` as you go.
 * See README.md for how to run the tests.
 *
 * The class below is called `Solution`, not `Exercise`, on purpose. Java only
 * forces a *public* type to match its filename, so a package-private class may
 * live in a file of any name. That is what lets `cp` be the entire setup step:
 * your copy is `Solution.java` holding `class Solution`, which is exactly what
 * the compiler wants, and no renaming is needed.
 *
 * Running these tests prints four WARNING lines about restricted methods. That
 * is correct and expected — the README explains it.
 */
class Solution {

    /**
     * The length of a string as libc's strlen counts it.
     *
     *   strlen("hello") -> 5
     *   strlen("")      -> 0
     *
     * Get a Linker, find the symbol in the default lookup, describe the
     * signature as (ADDRESS) -> JAVA_LONG, and call it with a NUL-terminated
     * copy of the string allocated in an Arena.
     *
     * Arena.allocateFrom(String) writes the NUL for you. invokeExact is
     * literal about types: the result cast must be exactly (long).
     *
     * Note what this counts: strlen counts BYTES up to the NUL, and
     * allocateFrom encodes as UTF-8, so a non-ASCII string is longer here than
     * its Java length. The tests pin that.
     */
    static long strlen(String text) {
        throw new UnsupportedOperationException("strlen: not implemented");
    }

    /**
     * Absolute value, computed by libc rather than by Java.
     *
     *   cAbs(-5) -> 5
     *   cAbs(5)  -> 5
     *   cAbs(0)  -> 0
     *
     * A pure (int) -> int downcall: no memory involved, so no Arena.
     */
    static int cAbs(int n) {
        throw new UnsupportedOperationException("cAbs: not implemented");
    }

    /**
     * The rest of a string from the first occurrence of a character, using
     * libc's strchr.
     *
     *   substringFrom("hello world", 'w') -> "world"
     *   substringFrom("hello world", 'h') -> "hello world"
     *   substringFrom("hello world", 'z') -> ""
     *
     * strchr is (ADDRESS, JAVA_INT) -> ADDRESS. Two things will bite:
     *
     * 1. A pointer returned from C arrives as a segment of byteSize 0, because
     *    an address carries no length. Reading even one byte throws. You have
     *    to reinterpret() it with a size you work out yourself — strlen on the
     *    returned pointer is a good way to get one, and remember the NUL.
     *
     * 2. Not found is NULL, which comes back as MemorySegment.NULL — a
     *    zero-length segment at address 0. Check for it before reinterpreting,
     *    or you will hand the JVM a length for memory that is not there.
     */
    static String substringFrom(String text, char needle) {
        throw new UnsupportedOperationException("substringFrom: not implemented");
    }

    /**
     * The layout of this C struct:
     *
     *   struct Point { int id; long value; };
     *
     * with the members named "id" and "value" so they can be addressed by path.
     *
     *   pointLayout().byteSize()      -> 16
     *   pointLayout().byteAlignment() -> 8
     *   byteOffset(groupElement("id"))    -> 0
     *   byteOffset(groupElement("value")) -> 8
     *
     * Writing the two members one after another throws
     * IllegalArgumentException: an 8-byte member may not start at offset 4. A C
     * compiler inserts the padding silently; here you write it out.
     */
    static MemoryLayout pointLayout() {
        throw new UnsupportedOperationException("pointLayout: not implemented");
    }

    /**
     * Write a Point into off-heap memory and read both members back.
     *
     *   writePoint(7, 99)   -> [7, 99]
     *   writePoint(0, 0)    -> [0, 0]
     *   writePoint(-1, Long.MIN_VALUE) -> [-1, Long.MIN_VALUE]
     *
     * Allocate one pointLayout() in a confined Arena, set both members through
     * VarHandles obtained from the layout, read them back, and return
     * [id, value] as a long[].
     *
     * A struct-member VarHandle's coordinates are (MemorySegment, long base) —
     * the base offset is a required argument even when it is always 0.
     */
    static long[] writePoint(int id, long value) {
        throw new UnsupportedOperationException("writePoint: not implemented");
    }

    /**
     * Copy an int array into off-heap memory and sum it from there.
     *
     *   sumOffHeap([1, 2, 3])          -> 6
     *   sumOffHeap([])                 -> 0
     *   sumOffHeap([Integer.MAX_VALUE, 1]) -> 2147483648  (a long, so no wrap)
     *
     * Use MemoryLayout.sequenceLayout(n, JAVA_INT) and the VarHandle from
     * PathElement.sequenceElement(), whose coordinates are (segment, base,
     * index). Accumulate into a long.
     *
     * Fresh arena memory is zeroed, so a bug that never writes still returns 0
     * rather than garbage — check your answer against a non-empty array.
     */
    static long sumOffHeap(int[] values) {
        throw new UnsupportedOperationException("sumOffHeap: not implemented");
    }

    /**
     * Round-trip a byte array through off-heap memory.
     *
     *   copyThroughNativeMemory([1, 2, 3]) -> [1, 2, 3]   (a different array)
     *   copyThroughNativeMemory([])        -> []
     *
     * Allocate, copy in, copy out, return. MemorySegment.copy and
     * MemorySegment.toArray both exist; you should not need a loop.
     *
     * The result must be a fresh array — the caller's input is not touched.
     */
    static byte[] copyThroughNativeMemory(byte[] input) {
        throw new UnsupportedOperationException("copyThroughNativeMemory: not implemented");
    }

    /**
     * The simple name of the exception thrown by reading a segment whose arena
     * has been closed.
     *
     *   accessAfterClose() -> "IllegalStateException"
     *
     * Allocate in a confined Arena, close it WITHOUT try-with-resources, then
     * read. Catch the throwable and return its class's simple name. In C this
     * is a use-after-free and a debugging afternoon; here it is an exception
     * with a message.
     *
     * If nothing throws, return "no exception" so the test can say so.
     */
    static String accessAfterClose() {
        throw new UnsupportedOperationException("accessAfterClose: not implemented");
    }

    /**
     * The simple name of the exception thrown when another thread touches a
     * confined segment.
     *
     *   accessFromAnotherThread() -> "WrongThreadException"
     *
     * Allocate in a confined Arena on this thread, then read the segment from a
     * second thread, capture what that thread throws, and return its class's
     * simple name. Join the other thread before returning — a test that races
     * is worse than no test.
     *
     * If nothing throws, return "no exception".
     */
    static String accessFromAnotherThread() {
        throw new UnsupportedOperationException("accessFromAnotherThread: not implemented");
    }
}
