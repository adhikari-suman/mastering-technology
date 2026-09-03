import java.util.List;
import java.util.Optional;

/**
 * Part 07, Lesson 01 — Packages and the Classpath
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
 * `ClasspathEntry` and `Visibility` come from support/ — read them, don't
 * edit them.
 */
class Solution {

    /**
     * Turn a binary class name into the path the loader will look for.
     *
     *   classFilePath("com.example.Foo")      -> "com/example/Foo.class"
     *   classFilePath("Foo")                  -> "Foo.class"
     *   classFilePath("a.b.Outer$Inner")      -> "a/b/Outer$Inner.class"
     *   classFilePath("")                     -> throws IllegalArgumentException
     *   classFilePath(null)                   -> throws IllegalArgumentException
     *
     * Only dots that separate name segments become separators. The `$` in a
     * nested type's name is part of the file name and stays put.
     */
    static String classFilePath(String binaryName) {
        throw new UnsupportedOperationException("classFilePath: not implemented");
    }

    /**
     * The package part of a binary name.
     *
     *   packageOf("com.example.util.Text")  -> "com.example.util"
     *   packageOf("com.example.Foo")        -> "com.example"
     *   packageOf("Foo")                    -> ""          (default package)
     *   packageOf("a.b.Outer$Inner")        -> "a.b"
     *   packageOf(null)                     -> throws IllegalArgumentException
     *
     * The default package really is named "", not null.
     */
    static String packageOf(String binaryName) {
        throw new UnsupportedOperationException("packageOf: not implemented");
    }

    /**
     * Search a classpath in order and report the FIRST entry providing a class.
     *
     * Given the classpath
     *   [ "app/classes"  -> com.example.App, com.example.util.Text
     *     "lib/util.jar" -> com.example.util.Text
     *     "lib/old.jar"  -> com.example.util.Text ]
     *
     *   findClass(cp, "com.example.util.Text") -> Optional.of("app/classes")
     *   findClass(cp, "com.example.App")       -> Optional.of("app/classes")
     *   findClass(cp, "java.lang.String")      -> Optional.empty()
     *   findClass(List.of(), "anything")       -> Optional.empty()
     *
     * Return the entry's `name()`, not the entry.
     */
    static Optional<String> findClass(List<ClasspathEntry> classpath, String binaryName) {
        throw new UnsupportedOperationException("findClass: not implemented");
    }

    /**
     * The entries that also provide the class but never get consulted, in
     * classpath order. These are the ones that lose silently.
     *
     *   shadowedBy(cp, "com.example.util.Text") -> ["lib/util.jar", "lib/old.jar"]
     *   shadowedBy(cp, "com.example.App")       -> []
     *   shadowedBy(cp, "java.lang.String")      -> []
     *
     * A class nobody provides is shadowed by nobody.
     */
    static List<String> shadowedBy(List<ClasspathEntry> classpath, String binaryName) {
        throw new UnsupportedOperationException("shadowedBy: not implemented");
    }

    /**
     * The packages that more than one entry contributes classes to — the split
     * packages. Sorted, no duplicates.
     *
     * Given
     *   [ "app/classes"  -> com.example.App, com.example.util.Text
     *     "lib/util.jar" -> com.example.util.Text, com.google.common.Ints
     *     "lib/old.jar"  -> com.google.common.Ints ]
     *
     *   splitPackages(cp) -> ["com.example.util", "com.google.common"]
     *
     * "com.example" is not split: only one entry has a class directly in it.
     * A package is split when two DIFFERENT entries both declare something in
     * it — one entry declaring two classes in the same package is normal.
     */
    static List<String> splitPackages(List<ClasspathEntry> classpath) {
        throw new UnsupportedOperationException("splitPackages: not implemented");
    }

    /**
     * Load a class by name, answering null rather than throwing when the name
     * is not on the classpath.
     *
     *   loadOrNull("java.util.List")            -> java.util.List.class
     *   loadOrNull("no.such.Clazz")             -> null
     *   loadOrNull("java.util.list")            -> null     (names are case-sensitive)
     *   loadOrNull("jdk.internal.misc.Unsafe")  -> a Class object, NOT null
     *
     * That last one is the point: the class is not exported to you and
     * `import` of it would not compile, yet loading it by name works fine.
     * Only catch the exception that means "not found" — let anything else out.
     */
    static Class<?> loadOrNull(String binaryName) {
        throw new UnsupportedOperationException("loadOrNull: not implemented");
    }

    /**
     * Name the access level encoded in a `java.lang.reflect` modifiers int.
     *
     *   accessLevel(Visibility.class.getDeclaredField("openToAll").getModifiers())
     *       -> "public"
     *   ... "forSubclassesAndPackage" -> "protected"
     *   ... "packagePrivate"          -> "package-private"
     *   ... "mine"                    -> "private"
     *
     * `java.lang.reflect.Modifier` has the predicates you need. Three of the
     * four levels have a bit; the fourth is the absence of all three.
     */
    static String accessLevel(int modifiers) {
        throw new UnsupportedOperationException("accessLevel: not implemented");
    }

    /**
     * The access table from the README, as code: can a class OUTSIDE the
     * declaring class reach a member at this level?
     *
     *   canAccess("public", false, false)          -> true
     *   canAccess("protected", false, true)        -> true    (subclass)
     *   canAccess("protected", true, false)        -> true    (same package too)
     *   canAccess("protected", false, false)       -> false
     *   canAccess("package-private", true, false)  -> true
     *   canAccess("package-private", false, true)  -> false   (subclass does NOT help)
     *   canAccess("private", true, true)           -> false
     *   canAccess("internal", true, true)          -> throws IllegalArgumentException
     *
     * The two rows people get wrong: `protected` also grants package access,
     * and package-private grants nothing to a subclass in another package.
     */
    static boolean canAccess(String level, boolean samePackage, boolean subclass) {
        throw new UnsupportedOperationException("canAccess: not implemented");
    }
}
