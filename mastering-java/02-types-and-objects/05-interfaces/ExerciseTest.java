import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("Greeter: a default method built on an abstract one")
    void greeterDefault() {
        assertEquals("Hello, ada!", Solution.Greeter.of("ada").greet());
        assertEquals("ada", Solution.Greeter.of("ada").name());
    }

    @Test
    @DisplayName("Greeter: one abstract method, so a lambda is an implementation")
    void greeterTakesLambda() {
        Solution.Greeter bob = () -> "bob";
        assertEquals("Hello, bob!", bob.greet(), "the default came along for free");
    }

    @Test
    @DisplayName("Greeter: a field in an interface is a constant, not state")
    void greeterConstant() throws Exception {
        assertEquals("Hello, ", Solution.Greeter.PREFIX);
        Field prefix = Solution.Greeter.class.getDeclaredField("PREFIX");
        int modifiers = prefix.getModifiers();
        assertTrue(Modifier.isPublic(modifiers), "implicitly public");
        assertTrue(Modifier.isStatic(modifiers), "implicitly static — one per interface, not per object");
        assertTrue(Modifier.isFinal(modifiers), "implicitly final");
    }

    @Test
    @DisplayName("Both: two unrelated defaults must be disambiguated by hand")
    void diamondNeedsAnAnswer() {
        assertEquals("HELLO/hello", new Solution.Both().hello(),
                "Loud.super.hello() then Quiet.super.hello()");
        assertEquals("HELLO", new Solution.Loud() { }.hello(), "the defaults themselves are untouched");
        assertEquals("hello", new Solution.Quiet() { }.hello());
    }

    @Test
    @DisplayName("Sub: the most specific interface wins, with nothing written")
    void mostSpecificWins() {
        assertEquals("HELLO!!", new Solution.Sub().hello(),
                "Louder extends Loud, so there is no ambiguity to report");
    }

    @Test
    @DisplayName("Mixed: the class wins over the interface default, silently")
    void classWins() {
        assertEquals("from Base", new Solution.Mixed().hello(),
                "Loud supplies a hello(); it is simply never used");
        Solution.Loud asLoud = new Solution.Mixed();
        assertEquals("from Base", asLoud.hello(), "the static type changes nothing — dispatch is dynamic");
    }

    @Test
    @DisplayName("upper: a method reference is an implementation of the interface")
    void upperIsAMethodReference() {
        assertEquals("HI", Solution.upper().apply("hi"));
        assertEquals("", Solution.upper().apply(""));
        assertThrows(NullPointerException.class, () -> Solution.upper().apply(null),
                "String::toUpperCase makes the argument the receiver, so null blows up there");
    }

    @Test
    @DisplayName("chain: composition, in the order it says on the tin")
    void chainComposes() {
        assertEquals("HI!", Solution.chain(Solution.upper(), s -> s + "!").apply("hi"));
        assertEquals("hi!?", Solution.chain(s -> s + "!", s -> s + "?").apply("hi"));
        assertEquals("hi?!", Solution.chain(s -> s + "?", s -> s + "!").apply("hi"),
                "the same two transforms, the other way round");
        assertEquals("A", Solution.chain(String::trim, Solution.upper()).apply("  a  "));
    }

    @Test
    @DisplayName("applyAll: run a transform over a list without touching the list")
    void applyAllMaps() {
        List<String> input = new ArrayList<>(List.of("a", "b"));
        assertEquals(List.of("A", "B"), Solution.applyAll(Solution.upper(), input));
        assertEquals(List.of("a", "b"), input, "the argument is not an output");
        assertEquals(List.of(), Solution.applyAll(Solution.upper(), List.of()));
        assertEquals(List.of("a!", "b!"), Solution.applyAll(s -> s + "!", List.of("a", "b")));
    }

    @Test
    @DisplayName("Animal: state and a constructor, which an interface cannot have")
    void abstractClassHoldsState() {
        Solution.Dog rex = new Solution.Dog("Rex");
        assertEquals("Rex", rex.name());
        assertEquals("woof", rex.sound());
        assertEquals("Rex says woof", rex.speak(), "a template method calling down to the subclass");
    }

    @Test
    @DisplayName("Dog: an inherited method satisfies the interface it never mentions")
    void inheritedMethodImplementsInterface() {
        Solution.Greeter rex = new Solution.Dog("Rex");
        assertEquals("Hello, Rex!", rex.greet(),
                "Greeter wants name(); Animal already had one, so Dog wrote nothing");
    }

    @Test
    @DisplayName("the shapes, as the runtime sees them")
    void shapesByReflection() {
        assertTrue(Solution.Greeter.class.isInterface());
        assertTrue(Modifier.isAbstract(Solution.Animal.class.getModifiers()),
                "an abstract class cannot be instantiated, only extended");
        assertTrue(Solution.Transform.class.isAnnotationPresent(FunctionalInterface.class),
                "the annotation is a compile-time check, but it is recorded at runtime");
        assertTrue(Solution.Greeter.class.isAssignableFrom(Solution.Dog.class));
        assertTrue(Solution.Animal.class.isAssignableFrom(Solution.Dog.class),
                "one superclass, any number of interfaces");
    }
}
