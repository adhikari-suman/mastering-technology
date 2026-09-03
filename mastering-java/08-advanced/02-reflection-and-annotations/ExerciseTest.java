import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    private static Customer ada() {
        return Customer.of(7, "Ada Lovelace", 36);
    }

    @Test
    @DisplayName("@Column: RUNTIME retention, or reflection never sees it")
    void columnIsRetainedAtRuntime() {
        Retention retention = Column.class.getAnnotation(Retention.class);
        assertNotNull(retention, "no @Retention at all — the default is CLASS, which the JVM drops");
        assertEquals(RetentionPolicy.RUNTIME, retention.value());
    }

    @Test
    @DisplayName("@Column: targeted at fields, so misuse is a compile error")
    void columnTargetsFields() {
        Target target = Column.class.getAnnotation(Target.class);
        assertNotNull(target, "no @Target means 'almost anywhere'");
        assertEquals(List.of(ElementType.FIELD), List.of(target.value()));
    }

    @Test
    @DisplayName("@Column: reading it back off a field gives a proxy, not a class")
    void columnReadsBack() throws Exception {
        Field name = Customer.class.getDeclaredField("name");
        Column col = name.getAnnotation(Column.class);
        assertNotNull(col, "if this is null, fix @Retention first");
        assertEquals("full_name", col.value());
        assertFalse(col.id(), "the default from the declaration");
        assertEquals(Column.class, col.annotationType(), "getClass() would give you the proxy instead");
    }

    @Test
    @DisplayName("instanceFieldNames: declared and non-static, private included")
    void instanceFieldNamesFilters() {
        assertEquals(List.of("age", "id", "name", "scratch"), Solution.instanceFieldNames(Customer.class),
                "static `created` is excluded; every survivor is private");
        assertEquals(List.of("body", "revision"), Solution.instanceFieldNames(Note.class));
        assertEquals(List.of(), Solution.instanceFieldNames(Object.class));
        assertEquals(0, Customer.class.getFields().length, "getFields() sees nothing here: all private");
    }

    @Test
    @DisplayName("readField: private fields, and primitives come back boxed")
    void readFieldReads() {
        Customer ada = ada();
        assertEquals("Ada Lovelace", Solution.readField(ada, "name"));
        assertEquals(7, Solution.readField(ada, "id"));
        assertEquals(Integer.class, Solution.readField(ada, "age").getClass(), "an int through an Object return");
        assertEquals("never persisted", Solution.readField(ada, "scratch"));
    }

    @Test
    @DisplayName("readField: an unknown field is an error, not a null")
    void readFieldRejectsUnknown() {
        assertEquals("never persisted", Solution.readField(ada(), "scratch"),
                "a field that is there reads fine, annotation or no annotation");
        assertThrows(RuntimeException.class, () -> Solution.readField(ada(), "nope"),
                "NoSuchFieldException is checked, so it has to come back out wrapped");
    }

    @Test
    @DisplayName("readFieldFast: a VarHandle reads the same values")
    void readFieldFastAgrees() {
        Customer ada = ada();
        assertEquals("Ada Lovelace", Solution.readFieldFast(ada, "name"));
        assertEquals(36, Solution.readFieldFast(ada, "age"));
        assertEquals(Solution.readField(ada, "id"), Solution.readFieldFast(ada, "id"),
                "same answer, resolved once instead of looked up per call");
    }

    @Test
    @DisplayName("call: private methods, matched by arity rather than by boxed types")
    void callInvokes() {
        Customer ada = ada();
        assertEquals("A.L.", Solution.call(ada, "initials"));
        assertEquals("ababab", Solution.call(ada, "repeat", "ab", 3),
                "repeat declares (String, int) but the 3 arrives as an Integer");
        assertEquals("Customer[7]", Solution.call(ada, "toString"));
    }

    @Test
    @DisplayName("call: the callee's own exception, not InvocationTargetException")
    void callUnwraps() {
        IllegalStateException thrown =
                assertThrows(IllegalStateException.class, () -> Solution.call(ada(), "explode"));
        assertEquals("nope", thrown.getMessage(), "unwrapped from InvocationTargetException");
    }

    @Test
    @DisplayName("construct: a private constructor, chosen by argument count")
    void constructBuilds() {
        Customer built = Solution.construct(Customer.class, 9, "Grace Hopper", 45);
        assertEquals("Grace Hopper", Solution.readField(built, "name"));
        assertEquals(9, Solution.readField(built, "id"));

        Note note = Solution.construct(Note.class, "hello", 2);
        assertEquals("hello", Solution.readField(note, "body"));
    }

    @Test
    @DisplayName("canForceAccess: your classes yes, java.base no")
    void canForceAccessRespectsModules() {
        assertTrue(Solution.canForceAccess(Customer.class, "name"), "the unnamed module is open to everything");
        assertTrue(Solution.canForceAccess(Note.class, "revision"));
        assertFalse(Solution.canForceAccess(String.class, "hash"), "java.base never opens java.lang");
        assertFalse(Solution.canForceAccess(Integer.class, "value"));
    }

    @Test
    @DisplayName("toRow: annotated fields only, with the blank value falling back to the field name")
    void toRowMaps() {
        assertEquals(Map.of("customer_id", 7, "full_name", "Ada Lovelace", "age", 36),
                Solution.toRow(ada()));
        assertEquals(Map.of("body", "hello"), Solution.toRow(new Note("hello", 2)),
                "@Deprecated is an annotation too, but it is not @Column");
    }

    @Test
    @DisplayName("toRow: an object with no columns maps to nothing")
    void toRowEmpty() {
        assertEquals(Map.of(), Solution.toRow("a plain string"),
                "and forcing access to String's fields would have thrown");
        assertEquals(Map.of(), Solution.toRow(new Object()));
    }

    @Test
    @DisplayName("idColumn: found, absent, and irrelevant")
    void idColumnFinds() {
        assertEquals(Optional.of("customer_id"), Solution.idColumn(Customer.class));
        assertEquals(Optional.empty(), Solution.idColumn(Note.class), "annotated, but nothing marked id");
        assertEquals(Optional.empty(), Solution.idColumn(String.class));
    }
}
