import java.lang.module.ModuleDescriptor;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Part 07, Lesson 02 — The Module System
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
 * This lesson runs on the classpath, in the unnamed module, so it cannot ship
 * a real `module-info.java`. Instead it builds and inspects the same metadata
 * the JVM would: `java.lang.module.ModuleDescriptor` and `java.lang.Module`.
 */
class Solution {

    /**
     * Parse `module-info.java` source into a ModuleDescriptor.
     *
     * The grammar you must handle, and nothing more:
     *
     *     open? module NAME {
     *         requires (transitive|static)* NAME ;
     *         exports PKG (to NAME (, NAME)*)? ;
     *         opens PKG (to NAME (, NAME)*)? ;
     *         uses FQCN ;
     *         provides FQCN with FQCN (, FQCN)* ;
     *     }
     *
     * Directives end with `;`. Whitespace and line breaks are free-form, and a
     * `//` comment runs to the end of its line. An empty body is legal.
     *
     * Example:
     *
     *     module com.example.app {
     *         requires java.sql;                  // plain
     *         requires transitive com.example.api;
     *         requires static com.example.annotations;
     *         exports com.example.app.model;
     *         exports com.example.app.spi to com.example.plugin, com.example.tool;
     *         opens com.example.app.entity;
     *         uses com.example.api.Codec;
     *         provides com.example.api.Codec with com.example.app.JsonCodec;
     *     }
     *
     * gives a descriptor whose name() is "com.example.app", whose exports()
     * has two entries (one of them targeted at two modules), and whose
     * requires() has FOUR entries — the three you wrote plus a mandated
     * `java.base` the builder adds for you.
     *
     * `ModuleDescriptor.newModule(name)` and `newOpenModule(name)` start the
     * builder; `requires`, `exports`, `opens`, `uses`, `provides` fill it in;
     * `build()` finishes. An `open module` may not declare `opens` — the
     * builder throws if you try, and so may you.
     *
     * Anything that is not one of the six directives above is
     * IllegalArgumentException.
     */
    static ModuleDescriptor parse(String moduleInfoSource) {
        throw new UnsupportedOperationException("parse: not implemented");
    }

    /**
     * The names of the modules this one requires TRANSITIVELY, sorted.
     *
     *   parse("module a { requires transitive b; requires c; }")
     *       -> transitiveRequires(...) == ["b"]
     *
     * The mandated `java.base` is not transitive, so it never appears here.
     * These are exactly the modules your callers get to use without asking.
     */
    static List<String> transitiveRequires(ModuleDescriptor descriptor) {
        throw new UnsupportedOperationException("transitiveRequires: not implemented");
    }

    /**
     * The packages a given module is allowed to compile against, sorted: every
     * unqualified export, plus the qualified exports aimed at that consumer.
     *
     * For
     *     exports com.example.model;
     *     exports com.example.spi to com.example.plugin;
     *
     *   exportedTo(d, "com.example.plugin")  -> ["com.example.model", "com.example.spi"]
     *   exportedTo(d, "com.example.other")   -> ["com.example.model"]
     *
     * `opens` grants reflection, not compilation, so it is not counted here.
     */
    static List<String> exportedTo(ModuleDescriptor descriptor, String consumer) {
        throw new UnsupportedOperationException("exportedTo: not implemented");
    }

    /**
     * Resolve implied readability: which modules can `root` see?
     *
     * `universe` maps module name to descriptor. Starting from `root`:
     *   - root reads itself, and everything it requires (any modifier);
     *   - every OTHER module in the answer contributes only the modules it
     *     requires TRANSITIVELY.
     *
     * That second rule is the whole point. Given
     *
     *     module app     { requires transitive api; requires impl; }
     *     module api     { requires transitive core; }
     *     module impl    { requires internal; }
     *     module core    { }
     *     module internal{ }
     *
     *   readableFrom(universe, "app")
     *       -> {"app", "api", "impl", "core", "java.base"}
     *
     * `core` is in because api re-exported it. `internal` is NOT: impl needs
     * it, but did not pass it on. `java.base` is in because every descriptor
     * requires it whether or not anyone typed it.
     *
     * A required name with no descriptor in the universe still belongs in the
     * answer; it simply contributes nothing further.
     */
    static Set<String> readableFrom(Map<String, ModuleDescriptor> universe, String root) {
        throw new UnsupportedOperationException("readableFrom: not implemented");
    }

    /**
     * The module name the JVM derives for a plain jar dropped on the module
     * path, from the file name alone.
     *
     *   automaticModuleName("commons-lang3-3.12.0.jar")  -> "commons.lang3"
     *   automaticModuleName("guava-33.0.0-jre.jar")      -> "guava"
     *   automaticModuleName("jackson-databind-2.15.2.jar") -> "jackson.databind"
     *   automaticModuleName("my.cool_lib.jar")           -> "my.cool.lib"
     *   automaticModuleName("a--b.jar")                  -> "a.b"
     *   automaticModuleName("lib-1.jar")                 -> "lib"
     *   automaticModuleName("notajar.zip")               -> throws IllegalArgumentException
     *
     * The real algorithm, in order:
     *   1. drop the ".jar" suffix;
     *   2. if what is left contains a hyphen followed by a run of one or more
     *      digits that is itself followed by a dot or the end of the string,
     *      cut at the FIRST such hyphen and keep only the part before it —
     *      that was the version. (So "-33." matches, and so does a trailing
     *      "-1"; "-jre" and "-RC" do not.)
     *   3. replace every character that is not a letter or a digit with ".";
     *   4. collapse runs of dots into one;
     *   5. drop a leading and a trailing dot.
     *
     * Step 2 is why "guava-33.0.0-jre" is "guava" and not "guava.jre".
     */
    static String automaticModuleName(String jarFileName) {
        throw new UnsupportedOperationException("automaticModuleName: not implemented");
    }

    /**
     * The name of the module a type lives in, or "<unnamed>" when it has none.
     *
     *   moduleNameOf(String.class)      -> "java.base"
     *   moduleNameOf(java.sql.Driver.class) -> "java.sql"
     *   moduleNameOf(Vault.class)       -> "<unnamed>"
     *
     * Every class has a module; classpath classes get the unnamed one, whose
     * getName() is null.
     */
    static String moduleNameOf(Class<?> type) {
        throw new UnsupportedOperationException("moduleNameOf: not implemented");
    }

    /**
     * Can `user` compile against `packageName` in `owner`? BOTH conditions
     * have to hold: user must read owner, and owner must export the package
     * to user.
     *
     *   canUse(unnamed, javaBase, "java.lang")          -> true
     *   canUse(unnamed, javaBase, "jdk.internal.misc")  -> false  (not exported)
     *   canUse(javaBase, javaBase, "java.lang")         -> true   (reads itself)
     *   canUse(javaBase, javaSql, "java.sql")           -> false  (not read)
     *
     * The last two lines are one half each: java.sql exports java.sql to
     * everybody, but java.base does not require java.sql, so there is no read
     * edge and the export buys nothing.
     *
     * `Module` has one method for each half of that question.
     */
    static boolean canUse(Module user, Module owner, String packageName) {
        throw new UnsupportedOperationException("canUse: not implemented");
    }

    /**
     * Attempt deep reflection on a field and report what happened.
     *
     * Look the field up with getDeclaredField and call setAccessible(true).
     * Return "ok" if that worked, otherwise the SIMPLE NAME of whatever was
     * thrown.
     *
     *   tryDeepReflect(Vault.class, "secret")  -> "ok"
     *   tryDeepReflect(String.class, "value")  -> "InaccessibleObjectException"
     *   tryDeepReflect(String.class, "nope")   -> "NoSuchFieldException"
     *
     * The middle one is the lesson: java.base exports java.lang, so you can
     * call String's methods, but it does not OPEN java.lang, so its privates
     * are closed to everybody.
     */
    static String tryDeepReflect(Class<?> type, String fieldName) {
        throw new UnsupportedOperationException("tryDeepReflect: not implemented");
    }
}
