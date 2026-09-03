import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.TreeSet;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    private static final Employee ANN = new Employee("ann", 30, "eng");
    private static final Employee BOB = new Employee("bob", 25, "eng");
    private static final Employee CID = new Employee("cid", 40, "ops");
    private static final Employee DEE = new Employee("dee", 25, "ops");
    private static final List<Employee> STAFF = List.of(ANN, BOB, CID, DEE);

    private static List<String> names(List<Employee> employees) {
        return employees.stream().map(Employee::name).toList();
    }

    @Test
    @DisplayName("compareTo: the natural order is by name")
    void naturalOrder() {
        assertTrue(ANN.compareTo(BOB) < 0);
        assertTrue(BOB.compareTo(ANN) > 0);
        assertEquals(0, ANN.compareTo(new Employee("ann", 99, "hr")),
                "same name, everything else different — still equivalent");

        List<Employee> staff = new ArrayList<>(STAFF);
        Collections.shuffle(staff, new java.util.Random(7));
        Collections.sort(staff);
        assertEquals(List.of("ann", "bob", "cid", "dee"), names(staff),
                "sort with no comparator uses compareTo");
    }

    @Test
    @DisplayName("compareTo consistent with equals: TreeSet and HashSet disagree")
    void inconsistentWithEquals() {
        Employee ann30 = new Employee("ann", 30, "eng");
        Employee ann40 = new Employee("ann", 40, "ops");
        assertNotEquals(ann30, ann40, "a record's equals looks at every component");
        assertEquals(2, new HashSet<>(List.of(ann30, ann40)).size());
        assertEquals(1, new TreeSet<>(List.of(ann30, ann40)).size(),
                "TreeSet defines membership with compareTo and ignores equals entirely");
    }

    @Test
    @DisplayName("byAgeThenName: a chained comparator, youngest first")
    void ageThenName() {
        assertEquals(List.of("bob", "dee", "ann", "cid"),
                names(Solution.sortedBy(STAFF, Solution.byAgeThenName())),
                "bob and dee are both 25, so the name breaks the tie");
    }

    @Test
    @DisplayName("byDepartmentThenAgeDescending: reversed() would have reversed both clauses")
    void departmentThenAgeDescending() {
        assertEquals(List.of("ann", "bob", "cid", "dee"),
                names(Solution.sortedBy(STAFF, Solution.byDepartmentThenAgeDescending())));

        Comparator<Employee> tempting = Comparator.comparing(Employee::department)
                .thenComparingInt(Employee::age)
                .reversed();
        assertEquals(List.of("cid", "dee", "ann", "bob"),
                names(Solution.sortedBy(STAFF, tempting)),
                "reversed() applies to the whole chain, so ops came before eng");
    }

    @Test
    @DisplayName("byNameNullsFirst: a null key needs the two-argument overload")
    void nullNamesSortFirst() {
        Employee anon = new Employee(null, 50, "eng");
        List<Employee> withNull = List.of(BOB, anon, ANN);
        assertEquals(Arrays.asList(null, "ann", "bob"),
                names(Solution.sortedBy(withNull, Solution.byNameNullsFirst())));

        assertThrows(NullPointerException.class,
                () -> Solution.sortedBy(withNull, Comparator.comparing(Employee::name)),
                "an unguarded key extractor calls compareTo on null");
    }

    @Test
    @DisplayName("sortedBy: a copy, so an immutable input is fine")
    void sortedByCopies() {
        List<Employee> input = List.of(CID, ANN);
        List<Employee> sorted = assertDoesNotThrow(
                () -> Solution.sortedBy(input, Solution.byAgeThenName()));
        assertEquals(List.of("ann", "cid"), names(sorted));
        assertEquals(List.of("cid", "ann"), names(input), "the argument is untouched");
        assertThrows(UnsupportedOperationException.class,
                () -> input.sort(Solution.byAgeThenName()),
                "which is what sorting it in place would have done");
    }

    @Test
    @DisplayName("namesByDepartment: sorts are stable, so ties keep their input order")
    void sortsAreStable() {
        List<Employee> input = List.of(
                new Employee("ann", 1, "zeta"),
                new Employee("bob", 1, "yank"),
                new Employee("cid", 1, "zeta"),
                new Employee("dee", 1, "yank"));
        assertEquals(List.of("bob", "dee", "ann", "cid"), Solution.namesByDepartment(input),
                "within yank: bob before dee, exactly as they arrived");
    }

    @Test
    @DisplayName("subtractCompare: fine until the operands are far apart")
    void subtractionOverflows() {
        assertEquals(-2, Solution.subtractCompare(3, 5));
        assertEquals(0, Solution.subtractCompare(5, 5));
        assertTrue(Solution.subtractCompare(Integer.MIN_VALUE, 1) > 0,
                "MIN_VALUE - 1 wraps to MAX_VALUE, so the sign says MIN_VALUE is bigger");
    }

    @Test
    @DisplayName("safeCompare: correct across the whole int range")
    void integerCompareIsSafe() {
        assertTrue(Solution.safeCompare(3, 5) < 0);
        assertEquals(0, Solution.safeCompare(5, 5));
        assertTrue(Solution.safeCompare(Integer.MIN_VALUE, 1) < 0);
        assertTrue(Solution.safeCompare(Integer.MAX_VALUE, Integer.MIN_VALUE) > 0);
    }

    @Test
    @DisplayName("subtractCompare actually sorts wrongly; safeCompare does not")
    void theOverflowChangesTheAnswer() {
        List<Integer> bad = new ArrayList<>(List.of(Integer.MIN_VALUE, 1));
        bad.sort((a, b) -> Solution.subtractCompare(a, b));
        assertEquals(List.of(1, Integer.MIN_VALUE), bad, "the smallest int sorted last");

        List<Integer> good = new ArrayList<>(List.of(Integer.MIN_VALUE, 1));
        good.sort((a, b) -> Solution.safeCompare(a, b));
        assertEquals(List.of(Integer.MIN_VALUE, 1), good);
    }

    @Test
    @DisplayName("brokenByAge: small lists sort happily with an illegal comparator")
    void brokenComparatorPassesQuietly() {
        List<Employee> four = new ArrayList<>(STAFF);
        assertDoesNotThrow(() -> four.sort(Solution.brokenByAge()),
                "four elements never take the merge path, so nothing checks");
    }

    @Test
    @DisplayName("brokenByAge: a hundred elements and TimSort catches it")
    void brokenComparatorThrowsOnRealData() {
        List<Employee> many = new ArrayList<>();
        for (int i = 0; i < 100; i++) many.add(new Employee("e" + i, i % 3, "d"));
        IllegalArgumentException thrown = assertThrows(IllegalArgumentException.class,
                () -> many.sort(Solution.brokenByAge()));
        assertEquals("Comparison method violates its general contract!", thrown.getMessage(),
                "the message names no class of yours — the comparator is what to go and read");
    }

    @Test
    @DisplayName("brokenByAge: the violation itself, without any sorting")
    void brokenComparatorIsNotAntisymmetric() {
        Comparator<Employee> broken = Solution.brokenByAge();
        assertTrue(broken.compare(BOB, DEE) > 0, "bob and dee are both 25");
        assertTrue(broken.compare(DEE, BOB) > 0, "and each is 'after' the other");
        assertEquals(0, Solution.byAgeThenName().compare(BOB, new Employee("bob", 25, "hr")),
                "a legal comparator returns 0 when it cannot tell two apart");
    }
}
