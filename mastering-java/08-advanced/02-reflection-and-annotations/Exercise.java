import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Part 08, Lesson 02 — Reflection and Annotations
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
 * This file declares a second top-level type — the @Column annotation, below
 * the class. That is legal for the same reason: only one type per file may be
 * public, and neither of these is. The fixtures in support/ are annotated with
 * it, so it has to be a real type in your Solution.java, not a nested one.
 */
class Solution {

    /**
     * The names of every field DECLARED on the type that belongs to an
     * instance, sorted alphabetically.
     *
     *   instanceFieldNames(Customer.class) -> ["age", "id", "name", "scratch"]
     *   instanceFieldNames(Note.class)     -> ["body", "revision"]
     *   instanceFieldNames(Object.class)   -> []
     *
     * "Declared" means private ones count and inherited ones do not. Static
     * fields are excluded — Customer has a `static int created` that must not
     * appear — and so are compiler-generated synthetic fields.
     *
     * getFields() is not the method you want; it returns public fields only.
     * Sort explicitly: the JDK does not promise an order for getDeclaredFields.
     */
    static List<String> instanceFieldNames(Class<?> type) {
        throw new UnsupportedOperationException("instanceFieldNames: not implemented");
    }

    /**
     * Read one field of an object by name, whatever its visibility.
     *
     *   readField(Customer.of(7, "Ada Lovelace", 36), "name") -> "Ada Lovelace"
     *   readField(Customer.of(7, "Ada Lovelace", 36), "id")   -> 7  (an Integer)
     *   readField(customer, "nope")  -> throws (any RuntimeException you like)
     *
     * Every field on the fixtures is private, so a plain get() will not do.
     * Primitives come back boxed, because the return type is Object.
     *
     * The reflection API throws checked exceptions. Wrap them in an unchecked
     * one rather than adding `throws` to the signature — the tests call this
     * from a lambda.
     */
    static Object readField(Object target, String name) {
        throw new UnsupportedOperationException("readField: not implemented");
    }

    /**
     * The same read, but through a VarHandle rather than a Field.
     *
     *   readFieldFast(Customer.of(7, "Ada Lovelace", 36), "name") -> "Ada Lovelace"
     *   readFieldFast(Customer.of(7, "Ada Lovelace", 36), "age")  -> 36
     *
     * Use MethodHandles.privateLookupIn to get a Lookup with private access to
     * the target's class, then findVarHandle. You need the field's declared
     * type to look the handle up — ask the Field for it.
     *
     * A VarHandle on an `int` field returns an int; the boxing to Object here
     * is yours, not the API's.
     */
    static Object readFieldFast(Object target, String name) {
        throw new UnsupportedOperationException("readFieldFast: not implemented");
    }

    /**
     * Call a method on an object by name, whatever its visibility, passing the
     * given arguments.
     *
     *   call(customer, "initials")            -> "A.L."
     *   call(customer, "repeat", "ab", 3)     -> "ababab"
     *   call(customer, "toString")            -> "Customer[7]"
     *   call(customer, "explode")             -> throws IllegalStateException
     *
     * Two traps, both worth the time:
     *
     * 1. The declared parameter types are (String, int), but an Object[] of
     *    arguments boxes the 3 into an Integer, so looking the method up by
     *    args[i].getClass() finds nothing. Match on name and parameter count.
     *
     * 2. Method.invoke wraps anything the called code throws in an
     *    InvocationTargetException. The test above expects the original
     *    IllegalStateException, so unwrap it and rethrow the cause.
     */
    static Object call(Object target, String name, Object... args) {
        throw new UnsupportedOperationException("call: not implemented");
    }

    /**
     * Build an instance by calling a declared constructor, whatever its
     * visibility, chosen by the number of arguments.
     *
     *   construct(Customer.class, 7, "Ada Lovelace", 36)  -> a Customer
     *   construct(Note.class, "hello", 2)                 -> a Note
     *
     * Customer's constructor is private. As with call(), find it by parameter
     * count rather than by the runtime classes of the arguments, and unwrap
     * anything the constructor body throws.
     *
     * The return type is T, so the cast is yours to make.
     */
    static <T> T construct(Class<T> type, Object... args) {
        throw new UnsupportedOperationException("construct: not implemented");
    }

    /**
     * Whether setAccessible(true) on the named declared field is permitted.
     *
     *   canForceAccess(Customer.class, "name")     -> true
     *   canForceAccess(String.class, "hash")       -> false
     *   canForceAccess(Integer.class, "value")     -> false
     *
     * Your own classes live in the unnamed module, which is open to everything.
     * java.base is not: it never opens java.lang, so the break-in fails with an
     * InaccessibleObjectException. Catch exactly that and answer false.
     *
     * A field that does not exist is a different problem; let that throw.
     */
    static boolean canForceAccess(Class<?> type, String fieldName) {
        throw new UnsupportedOperationException("canForceAccess: not implemented");
    }

    /**
     * The annotation-driven mapper: turn an object into the row you would
     * insert, keyed by column name.
     *
     *   toRow(Customer.of(7, "Ada Lovelace", 36))
     *       -> {"customer_id": 7, "full_name": "Ada Lovelace", "age": 36}
     *   toRow(new Note("hello", 2))  -> {"body": "hello"}
     *   toRow("a plain string")      -> {}
     *
     * Only fields carrying @Column take part. The column name is the
     * annotation's value, or — when that is blank, as on Customer.age — the
     * field's own name. `scratch` and `revision` are not annotated with @Column
     * and must not appear.
     *
     * Filter FIRST, then force access. String's own fields live in java.base
     * and setAccessible on them throws, so a mapper that opens every field
     * before deciding which ones it wants fails on the third example.
     *
     * If every row comes back empty, the annotation is the problem, not this
     * method. Read what @Retention defaults to.
     */
    static Map<String, Object> toRow(Object entity) {
        throw new UnsupportedOperationException("toRow: not implemented");
    }

    /**
     * The name of the column marked as the identifier, if the type has one.
     *
     *   idColumn(Customer.class) -> Optional["customer_id"]
     *   idColumn(Note.class)     -> Optional.empty
     *   idColumn(String.class)   -> Optional.empty
     *
     * "Marked" means @Column(id = true). The same blank-value rule as toRow
     * applies, though the fixture does not exercise it.
     */
    static Optional<String> idColumn(Class<?> type) {
        throw new UnsupportedOperationException("idColumn: not implemented");
    }
}

/**
 * Mark a field as a persistent column.
 *
 *   @Column(value = "customer_id", id = true) private final int id;
 *   @Column("full_name") private final String name;
 *   @Column private final int age;             // column name = "age"
 *
 * The declaration below compiles and the fixtures in support/ use it happily,
 * but nothing at runtime can see it. Two meta-annotations are missing:
 *
 *   - one that keeps it alive past class loading, rather than letting the JVM
 *     drop it (this is the default, and it is not the one you want);
 *   - one that restricts it to fields, so writing it on a method is a compile
 *     error rather than a silent no-op.
 *
 * The tests read both back off this type with getAnnotation, so they will tell
 * you exactly what they expect.
 */
@interface Column {
    String value() default "";

    boolean id() default false;
}
