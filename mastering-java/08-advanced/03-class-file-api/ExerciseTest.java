import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.classfile.ClassFile;
import java.lang.classfile.constantpool.ConstantPool;
import java.lang.invoke.MethodHandles;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    private static byte[] widget() {
        return Solution.bytesOf(Widget.class);
    }

    @Test
    @DisplayName("bytesOf: a class file starts with 0xCAFEBABE")
    void bytesOfReadsTheFile() {
        byte[] bytes = widget();
        assertTrue(bytes.length > 100, "a real class file, not an empty stream");
        assertEquals((byte) 0xCA, bytes[0]);
        assertEquals((byte) 0xFE, bytes[1]);
        assertEquals((byte) 0xBA, bytes[2]);
        assertEquals((byte) 0xBE, bytes[3]);
    }

    @Test
    @DisplayName("bytesOf: the JDK's own classes are readable too")
    void bytesOfReachesJavaBase() {
        assertTrue(Solution.bytesOf(Object.class).length > 100, "java.base serves its own class files");
        assertTrue(Solution.bytesOf(Solution.class).length > 100);
    }

    @Test
    @DisplayName("superclassName: internal form converted, and Object has none")
    void superclassNameConverts() {
        assertEquals(Optional.of("java.lang.Object"), Solution.superclassName(widget()),
                "the file says java/lang/Object");
        assertEquals(Optional.empty(), Solution.superclassName(Solution.bytesOf(Object.class)),
                "recorded as constant-pool index 0 — the hole that means 'nothing'");
    }

    @Test
    @DisplayName("methodNames: the constructor is called <init>")
    void methodNamesIncludeInit() {
        assertEquals(List.of("<init>", "add", "greeting", "serial", "size"), Solution.methodNames(widget()));
        assertTrue(Solution.methodNames(Solution.bytesOf(Solution.class)).contains("bytesOf"));
    }

    @Test
    @DisplayName("descriptorOf: parameters in brackets, return type after")
    void descriptorOfReads() {
        byte[] widget = widget();
        assertEquals("(II)I", Solution.descriptorOf(widget, "add"));
        assertEquals("()J", Solution.descriptorOf(widget, "serial"), "J is long, not L");
        assertEquals("()Ljava/lang/String;", Solution.descriptorOf(widget, "greeting"));
        assertEquals("(I)V", Solution.descriptorOf(widget, "<init>"), "constructors return void");
        assertThrows(RuntimeException.class, () -> Solution.descriptorOf(widget, "nope"));
    }

    @Test
    @DisplayName("sourceFile: an optional attribute that stack traces depend on")
    void sourceFileIsPresent() {
        assertEquals(Optional.of("Widget.java"), Solution.sourceFile(widget()));
    }

    @Test
    @DisplayName("stringConstants: literals only, not every name in the file")
    void stringConstantsAreLiterals() {
        assertEquals(List.of("hello", "widget-marker"), Solution.stringConstants(widget()),
                "'size', 'add' and 'java/lang/Object' are UTF-8 entries, not string constants");
    }

    @Test
    @DisplayName("the pool: slots outnumber entries, by the hole plus every long")
    void poolHasHoles() {
        byte[] widget = widget();
        int slots = Solution.poolSlotCount(widget);
        int entries = Solution.poolEntryCount(widget);
        assertTrue(entries > 20, "Widget is small but not that small");
        assertEquals(2, slots - entries,
                "index 0 is reserved, and Widget's one long constant eats a second index");
    }

    @Test
    @DisplayName("the pool: walking it by index lands in the hole")
    void poolIndexWalkBreaks() {
        ConstantPool cp = ClassFile.of().parse(widget()).constantPool();
        int usable = 0;
        int unusable = 0;
        for (int i = 1; i < cp.size(); i++) {
            try {
                cp.entryByIndex(i);
                usable++;
            } catch (RuntimeException e) {
                unusable++;
            }
        }
        assertEquals(1, unusable, "the index just after the long constant");
        assertEquals(Solution.poolEntryCount(widget()), usable, "iterating the pool skips it for you");
    }

    @Test
    @DisplayName("opcodesOf: a stack machine, with `this` in local 0")
    void opcodesOfReadsCode() {
        byte[] widget = widget();
        assertEquals(List.of("ILOAD_0", "ILOAD_1", "IADD", "IRETURN"), Solution.opcodesOf(widget, "add"));
        assertEquals(List.of("ALOAD_0", "GETFIELD", "IRETURN"), Solution.opcodesOf(widget, "size"),
                "ALOAD_0 is `this`, which occupies local 0 of every instance method");
    }

    @Test
    @DisplayName("opcodesOf: a constructor calls its super before anything else")
    void opcodesOfConstructor() {
        List<String> init = Solution.opcodesOf(widget(), "<init>");
        assertEquals("ALOAD_0", init.get(0));
        assertEquals("INVOKESPECIAL", init.get(1), "Object.<init> — a constructor is not a method call");
        assertTrue(init.contains("PUTFIELD"));
        assertEquals("RETURN", init.get(init.size() - 1), "RETURN, not IRETURN: constructors are void");
    }

    @Test
    @DisplayName("generateAdder: bytes with no source file, loaded and called")
    void generateAdderRuns() throws Exception {
        byte[] generated = Solution.generateAdder("RuntimeAdder");

        assertEquals(List.of("add"), Solution.methodNames(generated), "no constructor: nothing declared one");
        assertEquals("(II)I", Solution.descriptorOf(generated, "add"));
        assertEquals(Optional.of("java.lang.Object"), Solution.superclassName(generated),
                "the default superclass is still written into the file");
        assertEquals(Optional.empty(), Solution.sourceFile(generated), "no source file ever existed");

        Class<?> loaded = MethodHandles.lookup().defineClass(generated);
        assertEquals("RuntimeAdder", loaded.getName());
        assertEquals(5, loaded.getMethod("add", int.class, int.class).invoke(null, 2, 3));
        assertEquals(-1, loaded.getMethod("add", int.class, int.class).invoke(null, Integer.MAX_VALUE, Integer.MIN_VALUE));
    }

    @Test
    @DisplayName("generateAdder: the body it emits is the same four instructions javac emits")
    void generatedBodyMatchesJavac() {
        assertEquals(Solution.opcodesOf(widget(), "add"),
                Solution.opcodesOf(Solution.generateAdder("ComparedAdder"), "add"),
                "hand-built bytecode and compiled bytecode, indistinguishable");
    }
}
