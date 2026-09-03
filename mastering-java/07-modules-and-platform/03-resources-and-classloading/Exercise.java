import java.io.IOException;
import java.util.List;

/**
 * Part 07, Lesson 03 — Resources and Class Loading
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
 * `InitLog`, `Lazy`, `Eager`, `Boom`, `Plugin`, `AlphaPlugin` and `BetaPlugin`
 * come from support/ — read them, don't edit them.
 */
class Solution {

    /**
     * Load a class by name, choosing whether to initialise it.
     *
     *   load("Eager", false) -> the Class object, with NO static block run yet
     *   load("Eager", true)  -> the same Class, now initialised
     *   load("no.such.Clazz", true) -> null
     *
     * Use the three-argument `Class.forName`; the one-argument form always
     * initialises. Pass this class's own loader. Return null when the name is
     * not found; let anything else propagate.
     */
    static Class<?> load(String binaryName, boolean initialize) {
        throw new UnsupportedOperationException("load: not implemented");
    }

    /**
     * Read `Lazy.CONSTANT`, discard it, and return `InitLog.snapshot()`.
     *
     * The snapshot must contain NOTHING from Lazy: a `static final String`
     * holding a literal is a compile-time constant, so javac copies the value
     * into this class file and the reference to Lazy disappears entirely.
     *
     * Class initialisation happens once per JVM, so exactly one test can
     * observe this. Do not go looking at Lazy from anywhere else.
     */
    static List<String> touchConstant() {
        throw new UnsupportedOperationException("touchConstant: not implemented");
    }

    /**
     * Read `Lazy.COMPUTED`, discard it, and return `InitLog.snapshot()`.
     *
     * COMPUTED is initialised by a method call, so it is not a constant, so
     * this really does force Lazy's initialisation:
     *
     *   the Lazy entries of the snapshot are, in order,
     *     ["Lazy.COMPUTED", "Lazy static block"]
     *
     * Field initialisers and static blocks run interleaved, in the order they
     * are written in the source.
     */
    static List<String> touchField() {
        throw new UnsupportedOperationException("touchField: not implemented");
    }

    /**
     * Run something and name what came out of it.
     *
     *   initFailure(() -> {})            -> "ok"
     *   initFailure(Boom::touch)         -> "ExceptionInInitializerError"
     *   initFailure(Boom::touch)  again  -> "NoClassDefFoundError"
     *
     * Return the SIMPLE NAME of whatever was thrown, or "ok" if nothing was.
     * The second call is the point of the exercise: once a class's initialiser
     * has failed, the class is erroneous forever, and the message the JVM
     * gives you from then on no longer mentions the real cause.
     *
     * `Error` is not an `Exception`, so catching `Exception` will not do.
     */
    static String initFailure(Runnable action) {
        throw new UnsupportedOperationException("initFailure: not implemented");
    }

    /**
     * A loader and every parent above it, ending at the bootstrap loader.
     *
     *   loaderChain(ClassLoader.getSystemClassLoader())
     *       -> ["app", "platform", "bootstrap"]
     *   loaderChain(java.sql.Driver.class.getClassLoader())
     *       -> ["platform", "bootstrap"]
     *   loaderChain(String.class.getClassLoader())
     *       -> ["bootstrap"]
     *
     * Name each loader with `getName()`, falling back to its class's simple
     * name when that is null. A null loader IS the bootstrap loader — the last
     * example passes null in, not an empty chain.
     */
    static List<String> loaderChain(ClassLoader loader) {
        throw new UnsupportedOperationException("loaderChain: not implemented");
    }

    /**
     * Read a resource through a CLASS LOADER and decode it as UTF-8, or return
     * null when there is no such resource.
     *
     * For a loader whose search path is [first/, second/], where first/ holds
     * greeting.txt and second/ holds greeting.txt and data/notes.txt:
     *
     *   readResource(loader, "greeting.txt")     -> "from first"   (first wins)
     *   readResource(loader, "data/notes.txt")   -> the notes
     *   readResource(loader, "nothing.txt")      -> null
     *   readResource(loader, "/greeting.txt")    -> null
     *
     * That last line is the trap. ClassLoader resource names are always
     * absolute and must NOT start with a slash; the slash is taken as part of
     * the path, nothing matches, and you get null with no complaint.
     *
     * Close the stream when you are done with it.
     */
    static String readResource(ClassLoader loader, String path) throws IOException {
        throw new UnsupportedOperationException("readResource: not implemented");
    }

    /**
     * Is there a resource at this path, looked up through a CLASS rather than
     * a loader? Return true or false; do not read it.
     *
     *   classResourceExists(List.class, "List.class")            -> true
     *   classResourceExists(List.class, "/java/util/List.class") -> true
     *   classResourceExists(List.class, "/List.class")           -> false
     *   classResourceExists(List.class, "String.class")          -> false
     *
     * Class.getResourceAsStream reads a name with no leading slash as relative
     * to the class's own package — the exact opposite of the loader rule
     * above. Close whatever you open.
     */
    static boolean classResourceExists(Class<?> anchor, String path) throws IOException {
        throw new UnsupportedOperationException("classResourceExists: not implemented");
    }

    /**
     * How many entries on the loader's search path provide this resource?
     *
     *   countResources(loader, "greeting.txt")   -> 2
     *   countResources(loader, "data/notes.txt") -> 1
     *   countResources(loader, "nothing.txt")    -> 0
     *
     * `getResource` gives you the winner; there is a plural method that gives
     * you all of them. Two jars both shipping `logback.xml` is not an error,
     * and this is how you find out it happened.
     */
    static int countResources(ClassLoader loader, String path) throws IOException {
        throw new UnsupportedOperationException("countResources: not implemented");
    }

    /**
     * Every `Plugin` the loader can find, by name, sorted.
     *
     *   pluginNames(loaderWithBothProviders)  -> ["alpha", "beta"]
     *   pluginNames(loaderWithNoServiceFile)  -> []
     *
     * Use `ServiceLoader.load(Plugin.class, loader)` — the two-argument form,
     * so the search is pinned to the loader you were handed rather than to
     * whatever the current thread happens to have.
     */
    static List<String> pluginNames(ClassLoader loader) {
        throw new UnsupportedOperationException("pluginNames: not implemented");
    }
}
