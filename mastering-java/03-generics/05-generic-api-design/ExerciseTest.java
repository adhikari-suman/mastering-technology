import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.function.Predicate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("copyOf: a mutable, independent copy of anything readable")
    void copyOfCopies() {
        List<Integer> source = new ArrayList<>(List.of(1, 2));
        List<Integer> copy = Solution.copyOf(source);

        assertEquals(List.of(1, 2), copy);
        assertNotSame(source, copy);

        copy.add(3);
        assertEquals(2, source.size(), "not a view — the source is untouched");

        assertEquals(List.of(), Solution.copyOf(List.of()));
    }

    @Test
    @DisplayName("copyOf: `? extends T` is what lets T be inferred wider than the source")
    void copyOfWidens() {
        List<Integer> ints = List.of(1, 2);

        // Collection<T> would pin T to Integer and reject this line.
        List<Number> numbers = Solution.copyOf(ints);
        numbers.add(3.5);
        assertEquals(3, numbers.size());

        Set<String> letters = new TreeSet<>(Set.of("a", "b"));
        assertEquals(2, Solution.copyOf(letters).size(), "any Collection will do, not just a List");
    }

    @Test
    @DisplayName("mapAll: transforms in order into a fresh list")
    void mapAllTransforms() {
        List<Integer> lengths = Solution.mapAll(List.of("a", "bb"), String::length);
        assertEquals(List.of(1, 2), lengths);

        assertEquals(List.of(), Solution.<String, Integer>mapAll(List.of(), String::length));

        List<String> sorted = Solution.mapAll(new TreeSet<>(Set.of(2, 1)), Object::toString);
        assertEquals(List.of("1", "2"), sorted, "order follows the source's iteration order");
    }

    @Test
    @DisplayName("mapAll: `? super T` and `? extends R` are what accept a reused function")
    void mapAllAcceptsWiderFunctions() {
        Function<Object, String> stringify = String::valueOf;

        // Function<T, R> would reject this: the function takes Object rather
        // than Integer, and produces String rather than CharSequence.
        List<CharSequence> texts = Solution.mapAll(List.of(1, 2), stringify);

        assertEquals(List.of("1", "2"), texts);
        texts.add(new StringBuilder("3"));
        assertEquals(3, texts.size(), "and the result is a real List<CharSequence>");
    }

    @Test
    @DisplayName("partition: two lists in one record, no cast for the caller")
    void partitionSplits() {
        Solution.Split<Integer> split = Solution.partition(List.of(1, 2, 3, 4), n -> n % 2 == 0);

        assertEquals(List.of(2, 4), split.matched());
        assertEquals(List.of(1, 3), split.rest(), "order is preserved in both halves");

        Solution.Split<String> empty = Solution.partition(List.<String>of(), s -> true);
        assertEquals(List.of(), empty.matched());
        assertEquals(List.of(), empty.rest());
    }

    @Test
    @DisplayName("partition: a Predicate<Object> is a perfectly good Predicate<? super String>")
    void partitionAcceptsWiderPredicates() {
        Predicate<Object> present = o -> o != null;
        Solution.Split<String> split = Solution.partition(Arrays.asList("a", null, "b"), present);

        assertEquals(List.of("a", "b"), split.matched());
        assertEquals(1, split.rest().size());
        assertNull(split.rest().get(0));

        split.matched().add("c");
        assertEquals(3, split.matched().size(), "both halves are mutable");
    }

    @Test
    @DisplayName("firstMatching: Optional says absence is an answer, not an accident")
    void firstMatchingFinds() {
        assertEquals(Optional.of(2), Solution.firstMatching(List.of(1, 2, 3), n -> n > 1));
        assertEquals(Optional.empty(), Solution.firstMatching(List.of(1), n -> n > 9));
        assertEquals(Optional.empty(), Solution.firstMatching(List.<Integer>of(), n -> true));
        assertEquals(Optional.of("a"), Solution.firstMatching(Arrays.asList(null, "a"), s -> true),
                "nulls are skipped rather than handed to the predicate");
    }

    @Test
    @DisplayName("sortedCopy: the bound and the wildcard answer different questions")
    void sortedCopyOrders() {
        assertEquals(List.of(1, 2, 3), Solution.sortedCopy(Set.of(3, 1, 2)));
        assertEquals(List.of("a", "b"), Solution.sortedCopy(List.of("b", "a")));
        assertEquals(List.of(), Solution.sortedCopy(List.<Integer>of()));

        List<Integer> result = Solution.sortedCopy(List.of(2, 1));
        result.add(0);
        assertEquals(List.of(1, 2, 0), result, "a new mutable list, not a sorted view");
    }

    @Test
    @DisplayName("the builder chains from a base step into a subclass step")
    void builderChainsDownwards() {
        Solution.User user = new Solution.UserBuilder()
                .named("ann")     // declared on AbstractBuilder, returns S
                .aged(30)         // declared on UserBuilder — reachable only if S is real
                .addTag("x")
                .addTag("y")
                .build();

        assertEquals("ann", user.name());
        assertEquals(30, user.age());
        assertEquals(List.of("x", "y"), user.tags());
    }

    @Test
    @DisplayName("the builder chains in the other order too, and has sane defaults")
    void builderChainsUpwards() {
        Solution.User user = new Solution.UserBuilder().aged(7).named("bo").build();
        assertEquals("bo", user.name());
        assertEquals(7, user.age());
        assertEquals(List.of(), user.tags());

        Solution.User bare = new Solution.UserBuilder().build();
        assertEquals("", bare.name());
        assertEquals(0, bare.age());
        assertEquals(List.of(), bare.tags());
    }

    @Test
    @DisplayName("build: the tags are a snapshot, and the caller cannot mutate them")
    void builderSnapshotsTags() {
        Solution.UserBuilder builder = new Solution.UserBuilder().named("ann").addTag("x");
        Solution.User first = builder.build();

        builder.addTag("y");
        Solution.User second = builder.build();

        assertEquals(List.of("x"), first.tags(),
                "a User already built must not change under the caller");
        assertEquals(List.of("x", "y"), second.tags());
        assertThrows(UnsupportedOperationException.class, () -> first.tags().add("z"));
    }

    @Test
    @DisplayName("self(): S stays UserBuilder even when the call goes through the base type")
    void selfIsTheSubclass() {
        Solution.UserBuilder builder = new Solution.UserBuilder();
        assertSame(builder, builder.named("ann"), "every step returns the same builder, typed as S");

        Solution.AbstractBuilder<Solution.UserBuilder> asBase = builder;
        Solution.UserBuilder back = asBase.addTag("x");
        assertSame(builder, back, "the base class hands back the subclass it was told about");
        assertEquals(List.of("x"), builder.build().tags());
    }
}
