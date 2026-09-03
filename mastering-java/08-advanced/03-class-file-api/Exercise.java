import java.util.List;
import java.util.Optional;

/**
 * Part 08, Lesson 03 — The Class-File API
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
 * Everything here lives in java.lang.classfile and its sub-packages. Start with
 * ClassFile.of().parse(bytes).
 */
class Solution {

    /**
     * The bytes of a loaded class's class file.
     *
     *   bytesOf(Widget.class).length   -> a few hundred
     *   bytesOf(Object.class)          -> works: java.base ships its own bytes
     *
     * The class loader that loaded a class can also serve its class file as a
     * resource. The path is the ABSOLUTE resource name — the binary name with
     * dots turned into slashes, a leading slash, and ".class" on the end:
     *
     *   java.lang.Object  ->  "/java/lang/Object.class"
     *
     * A name without the leading slash is resolved relative to the calling
     * class's package, which happens to work in this curriculum only because
     * every lesson is in the default package.
     *
     * Wrap the IOException rather than declaring it.
     */
    static byte[] bytesOf(Class<?> type) {
        throw new UnsupportedOperationException("bytesOf: not implemented");
    }

    /**
     * The binary name of the superclass recorded in a class file.
     *
     *   superclassName(bytesOf(Widget.class)) -> Optional["java.lang.Object"]
     *   superclassName(bytesOf(Object.class)) -> Optional.empty
     *
     * Note the return value: java.lang.Object is the one class with no
     * superclass, and the file records that as constant-pool index 0 — the
     * permanent hole that means "nothing here".
     *
     * The API gives you the name in INTERNAL form, "java/lang/Object". The
     * conversion to a binary name is yours.
     */
    static Optional<String> superclassName(byte[] classBytes) {
        throw new UnsupportedOperationException("superclassName: not implemented");
    }

    /**
     * Every method declared in the class file, sorted, with duplicates kept.
     *
     *   methodNames(bytesOf(Widget.class))
     *       -> ["<init>", "add", "greeting", "serial", "size"]
     *
     * Constructors are in there under the name `<init>`, which is not a legal
     * Java identifier and so can never clash with a real method. A class with a
     * static initialiser would also show `<clinit>`.
     */
    static List<String> methodNames(byte[] classBytes) {
        throw new UnsupportedOperationException("methodNames: not implemented");
    }

    /**
     * The descriptor of the first method with the given name.
     *
     *   descriptorOf(widget, "add")      -> "(II)I"
     *   descriptorOf(widget, "serial")   -> "()J"
     *   descriptorOf(widget, "greeting") -> "()Ljava/lang/String;"
     *   descriptorOf(widget, "<init>")   -> "(I)V"
     *   descriptorOf(widget, "nope")     -> throws (any RuntimeException)
     *
     * A descriptor is the parameter types in brackets followed by the return
     * type. Reference types are `L` + internal name + `;`, arrays get a leading
     * `[`, and `V` means void. The API hands you the descriptor string
     * directly — there is nothing to build by hand.
     */
    static String descriptorOf(byte[] classBytes, String methodName) {
        throw new UnsupportedOperationException("descriptorOf: not implemented");
    }

    /**
     * The value of the SourceFile attribute, when the class file has one.
     *
     *   sourceFile(bytesOf(Widget.class)) -> Optional["Widget.java"]
     *
     * Attributes are optional by definition: compile with -g:none and this one
     * is gone, taking the file names out of your stack traces with it. Look at
     * ClassModel.findAttribute and the typed keys on Attributes.
     */
    static Optional<String> sourceFile(byte[] classBytes) {
        throw new UnsupportedOperationException("sourceFile: not implemented");
    }

    /**
     * Every string literal in the constant pool, sorted, without duplicates.
     *
     *   stringConstants(bytesOf(Widget.class)) -> ["hello", "widget-marker"]
     *
     * A CONSTANT_String entry is what `ldc "hello"` points at. It is NOT the
     * same as a UTF-8 entry: every method name, field name and descriptor in
     * the class is also stored as UTF-8, and none of those are string literals.
     * The API models the two as different types — match on the right one.
     */
    static List<String> stringConstants(byte[] classBytes) {
        throw new UnsupportedOperationException("stringConstants: not implemented");
    }

    /**
     * The pool's addressable size — the number the class file itself records.
     *
     *   poolSlotCount(bytesOf(Widget.class)) -> 34 on this JDK
     *
     * This is a count of SLOTS, not of entries: index 0 is a permanent hole,
     * and every long or double constant swallows a second index. Do not compute
     * it; ask the ConstantPool for it.
     */
    static int poolSlotCount(byte[] classBytes) {
        throw new UnsupportedOperationException("poolSlotCount: not implemented");
    }

    /**
     * How many entries the constant pool actually contains.
     *
     *   poolEntryCount(bytesOf(Widget.class)) -> poolSlotCount(...) - 2
     *
     * Widget has exactly one long constant, so it loses one slot to that and
     * one to the reserved index 0. Count by iterating the pool, which skips the
     * holes; a loop over entryByIndex(1..size) throws when it lands on one.
     */
    static int poolEntryCount(byte[] classBytes) {
        throw new UnsupportedOperationException("poolEntryCount: not implemented");
    }

    /**
     * The opcode names of a method's instructions, in order.
     *
     *   opcodesOf(widget, "add")  -> ["ILOAD_0", "ILOAD_1", "IADD", "IRETURN"]
     *   opcodesOf(widget, "size") -> ["ALOAD_0", "GETFIELD", "IRETURN"]
     *
     * Use the names the API's Opcode enum gives you, unchanged. Walking a
     * CodeModel yields more than instructions — labels and line-number marks
     * come through the same stream — so filter to the instructions.
     *
     * ALOAD_0 in an instance method is loading `this`, which is always local 0.
     */
    static List<String> opcodesOf(byte[] classBytes, String methodName) {
        throw new UnsupportedOperationException("opcodesOf: not implemented");
    }

    /**
     * Generate a class file, from nothing, for a class of the given name with a
     * single method:
     *
     *   public static int add(int a, int b)      returning a + b
     *
     * The class itself must be public. The bytes must be loadable:
     *
     *   Class<?> c = MethodHandles.lookup().defineClass(generateAdder("Adder"));
     *   c.getMethod("add", int.class, int.class).invoke(null, 2, 3);   // 5
     *
     * Use ClassFile.of().build(ClassDesc.of(name), ...) and withMethodBody. The
     * constant pool, max_stack, max_locals and the stack map table are all
     * computed for you; the body is four builder calls.
     *
     * Do not put the generated class in a package: defineClass refuses to load
     * a class into a package its lookup does not belong to, and every lesson
     * here is in the default package.
     */
    static byte[] generateAdder(String className) {
        throw new UnsupportedOperationException("generateAdder: not implemented");
    }
}
