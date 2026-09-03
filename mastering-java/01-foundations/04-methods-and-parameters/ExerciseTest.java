import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Arrays;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("pick: widening a primitive beats boxing it")
    void pickPrefersWidening() {
        assertEquals("long", Solution.pick(1), "int widens to long before it boxes to Integer");
        assertEquals("long", Solution.pick(1L), "an exact match, unsurprisingly");
        assertEquals("long", Solution.pick((short) 1));
        assertEquals("long", Solution.pick('a'), "char is an integer type and widens too");
    }

    @Test
    @DisplayName("pick: boxing beats varargs, and varargs is the last resort")
    void pickPrefersBoxingToVarargs() {
        assertEquals("Integer", Solution.pick(Integer.valueOf(1)), "already boxed, so no widening applies");
        assertEquals("varargs", Solution.pick(1, 2), "nothing else can take two arguments");
        assertEquals("varargs", Solution.pick(), "nor zero");
        assertEquals("varargs", Solution.pick(new int[] {1, 2, 3}), "int[] is what int... means");
    }

    @Test
    @DisplayName("sum: an omitted varargs argument is an empty array, not null")
    void sumAdds() {
        assertEquals(6, Solution.sum(1, 2, 3));
        assertEquals(7, Solution.sum(7));
        assertEquals(0, Solution.sum());
        assertEquals(0, Solution.sum(new int[0]));
        assertEquals(-1, Solution.sum(2, -3));
    }

    @Test
    @DisplayName("sum: the array can be handed over directly, because it is an array")
    void sumTakesAnArray() {
        assertEquals(9, Solution.sum(new int[] {4, 5}));
        assertEquals(2, Arrays.asList(new Integer[] {1, 2}).size(), "Integer[] spreads into two elements");
        assertEquals(1, Arrays.asList(new int[] {1, 2}).size(), "int[] cannot, so it becomes one element");
    }

    @Test
    @DisplayName("poke: the object is shared, the variable is not")
    void pokeShowsPassByValue() {
        int[] mine = {1, 2};
        Solution.poke(mine);
        assertArrayEquals(new int[] {99, 2}, mine, "the mutation reached the caller");
        assertEquals(2, mine.length, "the rebinding did not — mine still names the original array");
    }

    @Test
    @DisplayName("greet: the missing default parameter is an overload")
    void greetDefaults() {
        assertEquals("Hello, Ada", Solution.greet("Ada"));
        assertEquals("Hi, Ada", Solution.greet("Ada", "Hi"));
        assertEquals("Good morning, Grace", Solution.greet("Grace", "Good morning"));
    }

    @Test
    @DisplayName("greet: concatenating null gives the word, not an exception")
    void greetHandlesNull() {
        assertEquals("Hello, null", Solution.greet(null));
        assertEquals("null, Ada", Solution.greet("Ada", null));
        assertEquals("xnull", "x" + null, "this is the language, not the exercise");
    }

    @Test
    @DisplayName("factorial: recursion down to the base case")
    void factorialComputes() {
        assertEquals(1L, Solution.factorial(0), "0! is 1 — that is the base case");
        assertEquals(1L, Solution.factorial(1));
        assertEquals(120L, Solution.factorial(5));
        assertEquals(3628800L, Solution.factorial(10));
        assertEquals(2432902008176640000L, Solution.factorial(20), "the last one a long can hold");
    }

    @Test
    @DisplayName("factorial: overflow and nonsense are errors, not wrong answers")
    void factorialRefusesToWrap() {
        assertThrows(ArithmeticException.class, () -> Solution.factorial(21));
        assertThrows(ArithmeticException.class, () -> Solution.factorial(50));
        assertThrows(IllegalArgumentException.class, () -> Solution.factorial(-1));
    }

    @Test
    @DisplayName("record: instance state is per object, static state is per class")
    void recordSeparatesState() {
        int before = Solution.totalCalls();
        Solution a = new Solution();
        Solution b = new Solution();

        assertEquals(1, a.record());
        assertEquals(2, a.record());
        assertEquals(1, b.record(), "b has its own copy of mine");
        assertEquals(before + 3, Solution.totalCalls(), "and both share total");
    }
}
