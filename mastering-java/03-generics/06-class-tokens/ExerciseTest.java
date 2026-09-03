import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("castOrNull: the token does the checking, so the caller never casts")
    void castOrNullChecks() {
        String kept = Solution.castOrNull("hi", String.class);
        assertEquals("hi", kept);

        CharSequence wider = Solution.castOrNull("hi", CharSequence.class);
        assertEquals("hi", wider, "a supertype token matches too");

        assertNull(Solution.castOrNull("hi", Integer.class));
        assertNull(Solution.castOrNull(null, String.class), "isInstance(null) is false");
    }

    @Test
    @DisplayName("castOrNull: int.class is a real token that matches nothing")
    void castOrNullAndPrimitiveTokens() {
        assertEquals(1, Solution.castOrNull(1, Integer.class));
        assertNull(Solution.castOrNull(1, int.class),
                "the 1 arrived boxed; nothing on the heap has class int");

        assertNotSame(int.class, Integer.class, "two different Class objects");
        assertSame(int.class, Integer.TYPE, "int.class is exactly Integer.TYPE");
    }

    @Test
    @DisplayName("filterByType: keeps and types in one pass, dropping nulls")
    void filterByTypeSelects() {
        assertEquals(List.of("a", "b"),
                Solution.filterByType(Arrays.asList("a", 1, null, "b"), String.class));
        assertEquals(List.of(1, 2.0), Solution.filterByType(List.of(1, 2.0), Number.class));
        assertEquals(List.of(), Solution.filterByType(List.of(1), String.class));

        List<CharSequence> texts = Solution.filterByType(List.of("a", 1), CharSequence.class);
        texts.add(new StringBuilder("b"));
        assertEquals(2, texts.size(), "a real List<CharSequence>, no cast anywhere");
    }

    @Test
    @DisplayName("newArray: a token is the missing component type new T[n] needed")
    void newArrayBuildsRealArrays() {
        String[] strings = Solution.newArray(String.class, 3);
        assertSame(String[].class, strings.getClass(),
                "a genuine String[], unlike lesson 04's (T[]) trick");
        assertEquals(3, strings.length);
        assertNull(strings[0]);

        assertEquals(0, Solution.newArray(String.class, 0).length);
        assertThrows(NegativeArraySizeException.class, () -> Solution.newArray(String.class, -1));
    }

    @Test
    @DisplayName("enumNames: the token plus E extends Enum<E> gives an E[] with no cast")
    void enumNamesLists() {
        assertEquals(List.of("RED", "AMBER", "GREEN"), Solution.enumNames(Traffic.class),
                "declaration order, not alphabetical");
    }

    @Test
    @DisplayName("TypeMap: many unrelated types in one map, none of them cast by the caller")
    void typeMapStoresAndReads() {
        Solution.TypeMap map = new Solution.TypeMap();
        map.put(String.class, "hi");
        map.put(Integer.class, 42);

        String text = map.get(String.class);
        assertEquals("hi", text);
        assertEquals(42, map.get(Integer.class));
        assertNull(map.get(Double.class), "an absent token reads as null");

        map.put(String.class, "bye");
        assertEquals("bye", map.get(String.class), "a token is a key, so it replaces");
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    @DisplayName("TypeMap: List.class is the one and only token for every List<?>")
    void typeMapCannotSeeTypeArguments() {
        Solution.TypeMap map = new Solution.TypeMap();
        map.put(List.class, List.of(1, 2));
        map.put(List.class, List.of("a"));

        assertEquals(List.of("a"), map.get(List.class),
                "there is no List<String>.class to key on, so the second call overwrote the first");
    }

    @Test
    @SuppressWarnings({"rawtypes", "unchecked"})
    @DisplayName("TypeMap: type.cast in put is what makes a raw caller fail at the store")
    void typeMapGuardsTheStore() {
        Solution.TypeMap map = new Solution.TypeMap();
        Class token = String.class;   // raw on purpose: the generics are gone

        assertThrows(ClassCastException.class, () -> map.put(token, 42),
                "without type.cast(value) this would succeed and break get() instead");
        assertNull(map.get(String.class), "and nothing was stored");
    }

    @Test
    @DisplayName("TypeRef: a subclass declaration is somewhere a full type can be written down")
    void typeRefRecoversTypeArguments() {
        assertSame(String.class, new Solution.TypeRef<String>() {}.type(),
                "an unparameterized argument comes back as a plain Class");

        Type listOfStrings = new Solution.TypeRef<List<String>>() {}.type();
        assertEquals("java.util.List<java.lang.String>", listOfStrings.getTypeName());

        Type nested = new Solution.TypeRef<Map<String, List<Integer>>>() {}.type();
        assertEquals("java.util.Map<java.lang.String, java.util.List<java.lang.Integer>>",
                nested.getTypeName(), "nested arguments survive too");
    }

    @Test
    @SuppressWarnings("rawtypes")
    @DisplayName("TypeRef: without a type argument there is nothing written down to read back")
    void typeRefNeedsAParameterizedSubclass() {
        Solution.TypeRef raw = new Solution.TypeRef() {};
        assertThrows(IllegalStateException.class, raw::type,
                "the generic superclass of a raw subclass is a plain Class, not a ParameterizedType");
    }

    @Test
    @DisplayName("rawTypeOf: back from a reflective Type to the class the JVM uses")
    void rawTypeOfErases() {
        assertSame(String.class, Solution.rawTypeOf(String.class));
        assertSame(List.class, Solution.rawTypeOf(new Solution.TypeRef<List<String>>() {}.type()));
        assertSame(Map.class,
                Solution.rawTypeOf(new Solution.TypeRef<Map<String, Integer>>() {}.type()));
        assertSame(List.class, Solution.rawTypeOf(new Solution.TypeRef<List<?>>() {}.type()));
    }

    @Test
    @DisplayName("rawTypeOf: two of the four Type shapes have no raw class to give")
    void rawTypeOfRejectsTheOthers() {
        Type listOfWildcard = new Solution.TypeRef<List<?>>() {}.type();
        Type wildcard = ((ParameterizedType) listOfWildcard).getActualTypeArguments()[0];
        assertThrows(IllegalArgumentException.class, () -> Solution.rawTypeOf(wildcard));

        Type genericArray = new Solution.TypeRef<List<String>[]>() {}.type();
        assertThrows(IllegalArgumentException.class, () -> Solution.rawTypeOf(genericArray));
    }

    @Test
    @DisplayName("genericReturnTypeOf: declarations kept what values could not")
    void genericSignaturesSurvive() throws Exception {
        assertEquals("java.util.List<java.lang.String>",
                Solution.genericReturnTypeOf(Reflected.class, "names"));
        assertEquals("java.util.Map<java.lang.String, java.util.List<java.lang.Integer>>",
                Solution.genericReturnTypeOf(Reflected.class, "index"));
        assertEquals("int", Solution.genericReturnTypeOf(Reflected.class, "count"),
                "a primitive return type is its own Type");
        assertThrows(NoSuchElementException.class,
                () -> Solution.genericReturnTypeOf(Reflected.class, "absent"));

        assertSame(List.class, Reflected.class.getDeclaredMethod("names").getReturnType(),
                "getReturnType() gives the erasure; only the generic form kept <String>");
    }
}
