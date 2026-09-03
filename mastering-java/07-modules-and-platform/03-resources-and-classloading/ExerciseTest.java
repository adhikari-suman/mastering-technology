import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    /**
     * Two directories acting as classpath entries, both providing greeting.txt.
     * Parent is null, so nothing else can leak in.
     */
    private static URLClassLoader twoEntryLoader(Path tmp) throws IOException {
        Path first = Files.createDirectories(tmp.resolve("first"));
        Path second = Files.createDirectories(tmp.resolve("second/data"));
        Files.writeString(first.resolve("greeting.txt"), "from first");
        Files.writeString(tmp.resolve("second/greeting.txt"), "from second");
        Files.writeString(second.resolve("notes.txt"), "notes");
        return new URLClassLoader(new URL[] {
                first.toUri().toURL(), tmp.resolve("second").toUri().toURL() }, null);
    }

    /** A loader whose only contribution is a provider-configuration file. */
    private static URLClassLoader serviceLoaderOver(Path tmp, String... providers) throws IOException {
        Path services = Files.createDirectories(tmp.resolve("META-INF/services"));
        if (providers.length > 0) {
            Files.writeString(services.resolve("Plugin"), String.join("\n", providers) + "\n");
        }
        return new URLClassLoader(new URL[] { tmp.toUri().toURL() }, ExerciseTest.class.getClassLoader());
    }

    @Test
    @DisplayName("load: loading a class and initialising it are separate events")
    void loadCanSkipInitialisation() {
        assertNotNull(Solution.load("Eager", false));
        assertFalse(InitLog.snapshot().contains("Eager"), "loaded and linked, but the static block has not run");
        assertNotNull(Solution.load("Eager", true));
        assertTrue(InitLog.snapshot().contains("Eager"), "now it has");
        assertNull(Solution.load("no.such.Clazz", true));
    }

    @Test
    @DisplayName("static init: a compile-time constant never wakes its class")
    void constantsAreInlinedAndFieldsAreNot() {
        List<String> beforeAnyTouch = Solution.touchConstant().stream().filter(s -> s.startsWith("Lazy")).toList();
        assertEquals(List.of(), beforeAnyTouch, "reading Lazy.CONSTANT did not initialise Lazy");

        List<String> afterField = Solution.touchField().stream().filter(s -> s.startsWith("Lazy")).toList();
        assertEquals(List.of("Lazy.COMPUTED", "Lazy static block"), afterField,
                "field initialisers and static blocks run in the order they are written");
    }

    @Test
    @DisplayName("initFailure: the second use loses the reason entirely")
    void failedInitialiserPoisonsTheClass() {
        assertEquals("ok", Solution.initFailure(() -> { }));
        assertEquals("ExceptionInInitializerError", Solution.initFailure(Boom::touch),
                "first use: the real cause is attached");
        assertEquals("NoClassDefFoundError", Solution.initFailure(Boom::touch),
                "every use after that: 'Could not initialize class Boom', cause gone");
        assertEquals("NoClassDefFoundError", Solution.initFailure(Boom::touch), "and forever after");
        assertTrue(InitLog.snapshot().contains("Boom"),
                "the initialiser did run — it just did not finish, and it will never be retried");
    }

    @Test
    @DisplayName("loaderChain: null is the bootstrap loader, not the absence of one")
    void loaderChainClimbsToBootstrap() {
        assertEquals(List.of("app", "platform", "bootstrap"), Solution.loaderChain(ClassLoader.getSystemClassLoader()));
        assertEquals(List.of("platform", "bootstrap"), Solution.loaderChain(java.sql.Driver.class.getClassLoader()),
                "java.sql lives one level down from java.base");
        assertEquals(List.of("bootstrap"), Solution.loaderChain(String.class.getClassLoader()));
        assertNull(String.class.getClassLoader(), "which is why that argument was null");
    }

    @Test
    @DisplayName("readResource: the classpath order decides, silently")
    void readResourceTakesTheFirstEntry(@TempDir Path tmp) throws Exception {
        try (URLClassLoader loader = twoEntryLoader(tmp)) {
            assertEquals("from first", Solution.readResource(loader, "greeting.txt"));
            assertEquals("notes", Solution.readResource(loader, "data/notes.txt"));
            assertNull(Solution.readResource(loader, "nothing.txt"));
        }
    }

    @Test
    @DisplayName("readResource: a leading slash breaks a ClassLoader lookup and says nothing")
    void readResourceRejectsLeadingSlash(@TempDir Path tmp) throws Exception {
        try (URLClassLoader loader = twoEntryLoader(tmp)) {
            assertNotNull(Solution.readResource(loader, "greeting.txt"));
            assertNull(Solution.readResource(loader, "/greeting.txt"), "same file, one character, silent null");
            assertNull(loader.getResource("/greeting.txt"), "that is the loader's own answer, not yours");
        }
    }

    @Test
    @DisplayName("classResourceExists: a Class reads relative names against its own package")
    void classResourceLookupIsPackageRelative() throws Exception {
        assertTrue(Solution.classResourceExists(List.class, "List.class"), "relative to java/util/");
        assertTrue(Solution.classResourceExists(List.class, "/java/util/List.class"), "absolute, with the slash");
        assertFalse(Solution.classResourceExists(List.class, "/List.class"), "absolute means absolute");
        assertFalse(Solution.classResourceExists(List.class, "String.class"), "String is not in java.util");
    }

    @Test
    @DisplayName("countResources: two entries can both provide the same name")
    void countResourcesFindsThemAll(@TempDir Path tmp) throws Exception {
        try (URLClassLoader loader = twoEntryLoader(tmp)) {
            assertEquals(2, Solution.countResources(loader, "greeting.txt"),
                    "this is how a duplicated logback.xml gets found");
            assertEquals(1, Solution.countResources(loader, "data/notes.txt"));
            assertEquals(0, Solution.countResources(loader, "nothing.txt"));
        }
    }

    @Test
    @DisplayName("pluginNames: ServiceLoader reads META-INF/services from the loader you name")
    void serviceLoaderFindsProviders(@TempDir Path tmp) throws Exception {
        try (URLClassLoader loader = serviceLoaderOver(tmp, "AlphaPlugin", "BetaPlugin")) {
            assertEquals(List.of("alpha", "beta"), Solution.pluginNames(loader));
        }
    }

    @Test
    @DisplayName("pluginNames: no provider file means no providers, not an error")
    void serviceLoaderIsEmptyWithoutAConfigFile(@TempDir Path tmp) throws Exception {
        try (URLClassLoader loader = serviceLoaderOver(tmp)) {
            assertEquals(List.of(), Solution.pluginNames(loader),
                    "the classes are on the parent loader; nothing declares them");
        }
    }

    @Test
    @DisplayName("pluginNames: one provider is enough")
    void serviceLoaderHonoursTheFileContents(@TempDir Path tmp) throws Exception {
        try (URLClassLoader loader = serviceLoaderOver(tmp, "BetaPlugin")) {
            assertEquals(List.of("beta"), Solution.pluginNames(loader));
        }
    }
}
