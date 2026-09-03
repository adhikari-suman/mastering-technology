import java.util.Comparator;
import java.util.List;

/**
 * Part 04, Lesson 03 — Comparators
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
 * This file also declares a second top-level type, `Employee`. One .java file
 * may hold any number of package-private types; only a `public` one is pinned
 * to the filename. Its compareTo is yours to write too.
 */
class Solution {

    /**
     * Youngest first; employees of the same age ordered by name.
     *
     *   ann/30, bob/25, cid/25  ->  bob, cid, ann
     *
     * Build it from Comparator's factories, not from a lambda with an if. Age
     * is an `int`, so prefer the primitive-specialised factory: the plain
     * `comparing` overload boxes an Integer on every single comparison.
     */
    static Comparator<Employee> byAgeThenName() {
        throw new UnsupportedOperationException("byAgeThenName: not implemented");
    }

    /**
     * Department ascending; within a department, OLDEST first.
     *
     *   ann/30/eng, bob/25/eng, cid/40/ops, dee/25/ops
     *       ->  ann, bob, cid, dee
     *
     * The obvious chain ending in `.reversed()` gets this wrong — read the
     * README before you write it. There is a two-argument overload of
     * thenComparing that reverses only the clause you mean.
     */
    static Comparator<Employee> byDepartmentThenAgeDescending() {
        throw new UnsupportedOperationException("byDepartmentThenAgeDescending: not implemented");
    }

    /**
     * By name, natural order, except that a null name sorts before every real
     * one. Two null names are equivalent.
     *
     *   bob, (null), ann  ->  (null), ann, bob
     *
     * The employees themselves are never null here — only the name field is.
     * That distinction decides where the nullsFirst wrapper goes.
     */
    static Comparator<Employee> byNameNullsFirst() {
        throw new UnsupportedOperationException("byNameNullsFirst: not implemented");
    }

    /**
     * A sorted COPY. The argument must come back untouched, and must be allowed
     * to be immutable.
     *
     *   var input = List.of(ann, bob);
     *   sortedBy(input, byAgeThenName())   -> a new List, correctly ordered
     *   input                              -> unchanged, and never mutated
     *
     * `list.sort(c)` sorts in place and throws on a List.of. Find the other way.
     */
    static List<Employee> sortedBy(List<Employee> employees, Comparator<? super Employee> order) {
        throw new UnsupportedOperationException("sortedBy: not implemented");
    }

    /**
     * The names, sorted by department and by NOTHING ELSE.
     *
     *   ann/1/zeta, bob/1/yank, cid/1/zeta, dee/1/yank
     *       ->  ["bob", "dee", "ann", "cid"]
     *
     * Do not add a tie-breaker. The order within a department is the point:
     * work out what it must be before you run the test.
     */
    static List<String> namesByDepartment(List<Employee> employees) {
        throw new UnsupportedOperationException("namesByDepartment: not implemented");
    }

    /**
     * Compare two ints by subtracting them — the wrong way, written on purpose.
     *
     *   subtractCompare(3, 5)                  -> -2
     *   subtractCompare(Integer.MIN_VALUE, 1)  -> a POSITIVE number
     *
     * Return `a - b` literally. Do not guard against overflow; the second line
     * is what this method is here to demonstrate.
     */
    static int subtractCompare(int a, int b) {
        throw new UnsupportedOperationException("subtractCompare: not implemented");
    }

    /**
     * Compare two ints properly: negative, zero or positive, and correct for
     * every pair of ints there is.
     *
     *   safeCompare(3, 5)                  -> negative
     *   safeCompare(5, 5)                  -> 0
     *   safeCompare(Integer.MIN_VALUE, 1)  -> negative
     *
     * One call to a static method on a wrapper class. The exact magnitude is
     * not specified — only the sign is ever read by a sort.
     */
    static int safeCompare(int a, int b) {
        throw new UnsupportedOperationException("safeCompare: not implemented");
    }

    /**
     * A comparator that violates the total-order contract: it orders by age,
     * but never reports two employees as equivalent.
     *
     *   (a, b) -> a is younger ? -1 : 1
     *
     * Write exactly that. Two employees of the same age then compare as
     * "greater" in BOTH directions, which is not a legal ordering. Small lists
     * sort with it and look fine; large ones throw IllegalArgumentException
     * from inside the JDK's sort.
     */
    static Comparator<Employee> brokenByAge() {
        throw new UnsupportedOperationException("brokenByAge: not implemented");
    }
}

/**
 * The fixture for this lesson. A record derives equals and hashCode from all
 * three components — but its natural order, below, is yours to define.
 */
record Employee(String name, int age, String department) implements Comparable<Employee> {

    /**
     * The natural order: by name alone, using String's own ordering.
     *
     *   new Employee("ann", 1, "x").compareTo(new Employee("bob", 9, "y"))  -> negative
     *   new Employee("ann", 1, "x").compareTo(new Employee("ann", 9, "y"))  -> 0
     *
     * Note the second line: two employees can compare as equivalent while
     * `equals` says they differ. That is legal, and the README explains which
     * collections it breaks.
     */
    @Override
    public int compareTo(Employee other) {
        throw new UnsupportedOperationException("Employee.compareTo: not implemented");
    }
}
