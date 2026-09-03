import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    /** Three entries, in search order. Two of them are strictly redundant. */
    static final List<ClasspathEntry> CP = List.of(
            new ClasspathEntry("app/classes", List.of("com.example.App", "com.example.util.Text")),
            new ClasspathEntry("lib/util.jar", List.of("com.example.util.Text", "com.google.common.Ints")),
            new ClasspathEntry("lib/old.jar", List.of("com.google.common.Ints", "com.example.util.Text")));

    @Test
    @DisplayName("classFilePath: a type name IS a file path")
    void classFilePathMapsDots() {
        assertEquals("com/example/Foo.class", Solution.classFilePath("com.example.Foo"));
        assertEquals("Foo.class", Solution.classFilePath("Foo"), "default package: no directory");
        assertEquals("a/b/Outer$Inner.class", Solution.classFilePath("a.b.Outer$Inner"),
                "the $ of a nested type is part of the file name");
    }

    @Test
    @DisplayName("classFilePath: an empty or missing name is not a class")
    void classFilePathRejectsJunk() {
        assertThrows(IllegalArgumentException.class, () -> Solution.classFilePath(""));
        assertThrows(IllegalArgumentException.class, () -> Solution.classFilePath(null));
    }

    @Test
    @DisplayName("packageOf: the default package is named \"\", not null")
    void packageOfSplitsOffTheLastSegment() {
        assertEquals("com.example.util", Solution.packageOf("com.example.util.Text"));
        assertEquals("com.example", Solution.packageOf("com.example.Foo"));
        assertEquals("", Solution.packageOf("Foo"));
        assertEquals("a.b", Solution.packageOf("a.b.Outer$Inner"));
        assertThrows(IllegalArgumentException.class, () -> Solution.packageOf(null));
    }

    @Test
    @DisplayName("findClass: the classpath is searched in order and stops at the first hit")
    void findClassTakesTheFirst() {
        assertEquals(Optional.of("app/classes"), Solution.findClass(CP, "com.example.util.Text"));
        assertEquals(Optional.of("lib/util.jar"), Solution.findClass(CP, "com.google.common.Ints"));
        assertEquals(Optional.empty(), Solution.findClass(CP, "java.lang.String"),
                "the JDK is not on the classpath — it is in the runtime image");
        assertEquals(Optional.empty(), Solution.findClass(List.of(), "com.example.App"));
    }

    @Test
    @DisplayName("shadowedBy: duplicate classes lose silently, they do not clash")
    void shadowedByListsTheLosers() {
        assertEquals(List.of("lib/util.jar", "lib/old.jar"), Solution.shadowedBy(CP, "com.example.util.Text"));
        assertEquals(List.of("lib/old.jar"), Solution.shadowedBy(CP, "com.google.common.Ints"));
        assertEquals(List.of(), Solution.shadowedBy(CP, "com.example.App"), "only one provider, nothing shadowed");
        assertEquals(List.of(), Solution.shadowedBy(CP, "no.such.Clazz"));
    }

    @Test
    @DisplayName("splitPackages: a package spread over two entries is legal and dangerous")
    void splitPackagesFindsOverlaps() {
        assertEquals(List.of("com.example.util", "com.google.common"), Solution.splitPackages(CP));
        assertEquals(List.of(), Solution.splitPackages(List.of(CP.get(0))),
                "two classes in one package from ONE entry is not a split");
        assertEquals(List.of(), Solution.splitPackages(List.of()));
    }

    @Test
    @DisplayName("splitPackages: the default package splits like any other")
    void splitPackagesCoversTheDefaultPackage() {
        List<ClasspathEntry> cp = List.of(
                new ClasspathEntry("a.jar", List.of("Loose")),
                new ClasspathEntry("b.jar", List.of("AlsoLoose")));
        assertEquals(List.of(""), Solution.splitPackages(cp));
    }

    @Test
    @DisplayName("loadOrNull: found, not found, and the case-sensitive near miss")
    void loadOrNullFindsByName() {
        assertEquals(java.util.List.class, Solution.loadOrNull("java.util.List"));
        assertNull(Solution.loadOrNull("no.such.Clazz"));
        assertNull(Solution.loadOrNull("java.util.list"), "binary names are case-sensitive");
        assertThrows(ClassNotFoundException.class, () -> Class.forName("no.such.Clazz"),
                "the checked exception loadOrNull is swallowing");
    }

    @Test
    @DisplayName("loadOrNull: loading a class is not the same as being allowed to use it")
    void loadOrNullSeesUnexportedClasses() {
        Class<?> unsafe = Solution.loadOrNull("jdk.internal.misc.Unsafe");
        assertNotNull(unsafe, "it loads — `import jdk.internal.misc.Unsafe` would not compile");
        assertEquals("java.base", unsafe.getModule().getName());
        assertFalse(unsafe.getModule().isExported("jdk.internal.misc"), "loaded, but not exported to you");
    }

    @Test
    @DisplayName("accessLevel: three levels have a bit, the fourth is their absence")
    void accessLevelReadsModifiers() throws Exception {
        assertEquals("public", Solution.accessLevel(Visibility.class.getDeclaredField("openToAll").getModifiers()));
        assertEquals("protected",
                Solution.accessLevel(Visibility.class.getDeclaredField("forSubclassesAndPackage").getModifiers()));
        assertEquals("package-private",
                Solution.accessLevel(Visibility.class.getDeclaredField("packagePrivate").getModifiers()));
        assertEquals("private", Solution.accessLevel(Visibility.class.getDeclaredField("mine").getModifiers()));
        assertEquals(0, Visibility.class.getDeclaredField("packagePrivate").getModifiers(),
                "no bits at all — that is what the default looks like");
    }

    @Test
    @DisplayName("canAccess: protected is WIDER than package-private, not narrower")
    void canAccessFollowsTheTable() {
        assertTrue(Solution.canAccess("public", false, false));
        assertTrue(Solution.canAccess("protected", false, true), "subclass elsewhere");
        assertTrue(Solution.canAccess("protected", true, false), "and the whole package as well");
        assertFalse(Solution.canAccess("protected", false, false));
        assertTrue(Solution.canAccess("package-private", true, false));
        assertFalse(Solution.canAccess("package-private", false, true), "being a subclass buys nothing here");
        assertFalse(Solution.canAccess("private", true, true));
        assertThrows(IllegalArgumentException.class, () -> Solution.canAccess("internal", true, true),
                "Java has four levels, and `internal` is not one of them");
    }

    @Test
    @DisplayName("package-private really does mean anyone in the package")
    void packagePrivateIsReachableFromHere() {
        Visibility v = new Visibility();
        v.packagePrivate = 7;
        assertEquals(7, v.packagePrivate, "this test class is in the same (default) package, so it is allowed in");
        assertEquals(0, v.mine(), "the private field needs an accessor even from here");
    }
}
