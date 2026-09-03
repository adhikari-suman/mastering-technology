import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.module.ModuleDescriptor;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    static final String APP = """
            module com.example.app {
                requires java.sql;                   // plain
                requires transitive com.example.api;
                requires static com.example.annotations;

                exports com.example.app.model;
                exports com.example.app.spi to com.example.plugin, com.example.tool;

                opens com.example.app.entity;

                uses com.example.api.Codec;
                provides com.example.api.Codec with com.example.app.JsonCodec;
            }
            """;

    static List<String> requiresOf(ModuleDescriptor d) {
        return d.requires().stream().map(Object::toString).sorted().toList();
    }

    @Test
    @DisplayName("parse: the header, and the java.base nobody typed")
    void parseHeader() {
        ModuleDescriptor d = Solution.parse(APP);
        assertEquals("com.example.app", d.name());
        assertFalse(d.isOpen());
        assertEquals(4, d.requires().size(), "three written, plus a mandated java.base");
        assertEquals(
                List.of("java.sql", "mandated java.base", "static com.example.annotations",
                        "transitive com.example.api"),
                requiresOf(d),
                "each modifier survives into the descriptor");
    }

    @Test
    @DisplayName("parse: exports, opens, uses and provides")
    void parseDirectives() {
        ModuleDescriptor d = Solution.parse(APP);
        assertEquals(Set.of("com.example.app.model", "com.example.app.spi"),
                d.exports().stream().map(ModuleDescriptor.Exports::source).collect(java.util.stream.Collectors.toSet()));
        ModuleDescriptor.Exports spi = d.exports().stream()
                .filter(e -> e.source().equals("com.example.app.spi")).findFirst().orElseThrow();
        assertEquals(Set.of("com.example.plugin", "com.example.tool"), spi.targets());
        assertEquals(Set.of("com.example.app.entity"),
                d.opens().stream().map(ModuleDescriptor.Opens::source).collect(java.util.stream.Collectors.toSet()));
        assertEquals(Set.of("com.example.api.Codec"), d.uses());
        assertEquals(List.of("com.example.app.JsonCodec"), d.provides().iterator().next().providers());
    }

    @Test
    @DisplayName("parse: an empty body, and `open module`")
    void parseEdges() {
        ModuleDescriptor empty = Solution.parse("module solo { }");
        assertEquals("solo", empty.name());
        assertEquals(List.of("mandated java.base"), requiresOf(empty), "even an empty module requires java.base");

        ModuleDescriptor open = Solution.parse("open module wide { exports p; }");
        assertTrue(open.isOpen(), "an open module opens every package it contains");
        assertEquals(Set.of(), open.opens(), "and so has no `opens` directives of its own");

        assertThrows(IllegalArgumentException.class, () -> Solution.parse("module bad { imports java.sql; }"),
                "`imports` is not a module directive");
    }

    @Test
    @DisplayName("transitiveRequires: implied readability, and only that")
    void transitiveRequiresPicksTheMarkedOnes() {
        assertEquals(List.of("com.example.api"), Solution.transitiveRequires(Solution.parse(APP)));
        assertEquals(List.of(), Solution.transitiveRequires(Solution.parse("module a { requires b; }")),
                "java.base is mandated, not transitive");
        assertEquals(List.of("b", "c"),
                Solution.transitiveRequires(Solution.parse("module a { requires transitive c; requires transitive b; }")));
    }

    @Test
    @DisplayName("exportedTo: a qualified export is visible to its target and nobody else")
    void exportedToRespectsTargets() {
        ModuleDescriptor d = Solution.parse(APP);
        assertEquals(List.of("com.example.app.model", "com.example.app.spi"),
                Solution.exportedTo(d, "com.example.plugin"));
        assertEquals(List.of("com.example.app.model"), Solution.exportedTo(d, "com.example.other"));
        assertFalse(Solution.exportedTo(d, "com.example.plugin").contains("com.example.app.entity"),
                "opens grants reflection, not compilation");
    }

    @Test
    @DisplayName("readableFrom: transitive edges propagate, plain ones stop")
    void readableFromFollowsTransitiveOnly() {
        Map<String, ModuleDescriptor> universe = new LinkedHashMap<>();
        for (String src : List.of(
                "module app { requires transitive api; requires impl; }",
                "module api { requires transitive core; }",
                "module impl { requires internal; }",
                "module core { }",
                "module internal { }")) {
            ModuleDescriptor d = Solution.parse(src);
            universe.put(d.name(), d);
        }
        assertEquals(Set.of("app", "api", "impl", "core", "java.base"), Solution.readableFrom(universe, "app"));
        assertFalse(Solution.readableFrom(universe, "app").contains("internal"),
                "impl requires it but did not re-export it");
        assertEquals(Set.of("impl", "internal", "java.base"), Solution.readableFrom(universe, "impl"),
                "from impl's own point of view internal is right there");
    }

    @Test
    @DisplayName("automaticModuleName: your module name comes from a file name")
    void automaticModuleNameDerives() {
        assertEquals("commons.lang3", Solution.automaticModuleName("commons-lang3-3.12.0.jar"));
        assertEquals("guava", Solution.automaticModuleName("guava-33.0.0-jre.jar"), "the version cut takes -jre with it");
        assertEquals("jackson.databind", Solution.automaticModuleName("jackson-databind-2.15.2.jar"));
        assertEquals("my.cool.lib", Solution.automaticModuleName("my.cool_lib.jar"));
    }

    @Test
    @DisplayName("automaticModuleName: dots collapse and get trimmed")
    void automaticModuleNameNormalises() {
        assertEquals("a.b", Solution.automaticModuleName("a--b.jar"));
        assertEquals("lib", Solution.automaticModuleName("lib-1.jar"), "a trailing -1 is a version");
        assertEquals("kotlin.stdlib", Solution.automaticModuleName("kotlin-stdlib-1.9.0-RC.jar"));
        assertEquals("lead", Solution.automaticModuleName("-lead.jar"));
        assertThrows(IllegalArgumentException.class, () -> Solution.automaticModuleName("notajar.zip"));
    }

    @Test
    @DisplayName("moduleNameOf: the JDK is modular, your classpath is not")
    void moduleNameOfReportsTheModule() {
        assertEquals("java.base", Solution.moduleNameOf(String.class));
        assertEquals("java.sql", Solution.moduleNameOf(java.sql.Driver.class));
        assertEquals("<unnamed>", Solution.moduleNameOf(Vault.class));
        assertEquals("<unnamed>", Solution.moduleNameOf(Test.class), "JUnit is on the classpath too");
        assertFalse(Vault.class.getModule().isNamed());
    }

    @Test
    @DisplayName("canUse: reading a module is not the same as it exporting to you")
    void canUseNeedsBothHalves() {
        Module unnamed = Vault.class.getModule();
        Module base = String.class.getModule();
        assertTrue(Solution.canUse(unnamed, base, "java.lang"));
        assertFalse(Solution.canUse(unnamed, base, "jdk.internal.misc"), "loaded and readable, but not exported");
        assertTrue(unnamed.canRead(base), "the read edge is there — the export is what is missing");
        assertTrue(Solution.canUse(base, base, "java.lang"), "a module always reads itself");

        Module sql = java.sql.Driver.class.getModule();
        assertFalse(Solution.canUse(base, sql, "java.sql"), "java.base does not require java.sql");
        assertTrue(sql.isExported("java.sql", base), "exported to everyone — the READ edge is the missing half here");
        assertFalse(base.canRead(sql), "which is the other way round from the jdk.internal.misc case above");
    }

    @Test
    @DisplayName("tryDeepReflect: java.base exports java.lang but does not open it")
    void tryDeepReflectHitsStrongEncapsulation() {
        assertEquals("ok", Solution.tryDeepReflect(Vault.class, "secret"), "the unnamed module is open to everyone");
        assertEquals("InaccessibleObjectException", Solution.tryDeepReflect(String.class, "value"));
        assertEquals("NoSuchFieldException", Solution.tryDeepReflect(String.class, "nope"));
        assertTrue(String.class.getModule().isExported("java.lang"));
        assertFalse(String.class.getModule().isOpen("java.lang"), "exported yes, open no");
    }
}
