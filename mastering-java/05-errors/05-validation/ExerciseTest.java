import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * The spec, executable. Red until you implement Solution.java. Don't edit.
 */
class ExerciseTest {

    @Test
    @DisplayName("Email: the compact constructor normalises before it validates")
    void emailNormalises() {
        assertEquals("jane@example.com", new Solution.Email("  Jane@Example.COM ").value(),
                "assigned to the parameter, not to this.value");
        assertEquals("a@b.com", new Solution.Email("A@B.COM").value());
    }

    @Test
    @DisplayName("Email: a null address names itself in the message")
    void emailRejectsNull() {
        NullPointerException e = assertThrows(NullPointerException.class,
                () -> new Solution.Email(null));
        assertEquals("email must not be null", e.getMessage(),
                "not the JVM's helpful message — this one was written on purpose");
    }

    @Test
    @DisplayName("Email: every malformed shape is refused at construction")
    void emailRejectsMalformed() {
        assertEquals("email must not be blank",
                assertThrows(IllegalArgumentException.class, () -> new Solution.Email("   ")).getMessage());
        assertEquals("email must contain exactly one @: nope",
                assertThrows(IllegalArgumentException.class, () -> new Solution.Email("nope")).getMessage());
        assertEquals("email must contain exactly one @: a@b@c",
                assertThrows(IllegalArgumentException.class, () -> new Solution.Email("a@b@c")).getMessage());
        assertEquals("email must have text either side of @: @b.com",
                assertThrows(IllegalArgumentException.class, () -> new Solution.Email("@B.com")).getMessage());
        assertEquals("email must have text either side of @: a@",
                assertThrows(IllegalArgumentException.class, () -> new Solution.Email("a@")).getMessage());
    }

    @Test
    @DisplayName("Email: once you hold one, no check is ever needed again")
    void emailIsParsedNotValidated() {
        Solution.Email email = new Solution.Email("Jane@Example.com");
        assertEquals("example.com", email.domain(), "domain() has no failure case to handle");
        assertEquals(new Solution.Email("jane@example.com"), email, "records equal by value");
    }

    @Test
    @DisplayName("parseEmail: the constructor's rule, reported instead of thrown")
    void parseEmailAdapts() {
        Solution.Valid<?> ok = assertInstanceOf(Solution.Valid.class,
                Solution.parseEmail("Jane@Example.com"));
        assertEquals(new Solution.Email("jane@example.com"), ok.value());

        assertEquals(List.of("email must contain exactly one @: nope"),
                Solution.problems(Solution.parseEmail("nope")));
        assertEquals(List.of("email must not be null"),
                Solution.problems(Solution.parseEmail(null)));
    }

    @Test
    @DisplayName("parseAge: not-a-number and out-of-range are different problems")
    void parseAgeReportsOneProblem() {
        assertEquals(new Solution.Valid<>(30), Solution.parseAge("30"));
        assertEquals(new Solution.Valid<>(18), Solution.parseAge("18"), "the boundary is inclusive");
        assertEquals(List.of("age must be a whole number"), Solution.problems(Solution.parseAge("abc")));
        assertEquals(List.of("age must be a whole number"), Solution.problems(Solution.parseAge(null)));
        assertEquals(List.of("age must be a whole number"), Solution.problems(Solution.parseAge("")));
        assertEquals(List.of("age must be at least 18"), Solution.problems(Solution.parseAge("17")));
        assertEquals(List.of("age must be at least 18"), Solution.problems(Solution.parseAge("-1")));
        assertEquals(List.of("age must be under 130"), Solution.problems(Solution.parseAge("130")));
    }

    @Test
    @DisplayName("parseSignup: three mistakes, one call, three messages")
    void parseSignupCollectsEverything() {
        assertEquals(List.of(
                        "email must contain exactly one @: nope",
                        "name must not be blank",
                        "age must be at least 18"),
                Solution.problems(Solution.parseSignup("nope", "   ", "17")),
                "not just the first — the user should fix all three at once");

        assertEquals(List.of(
                        "email must contain exactly one @: nope",
                        "name must not be blank",
                        "age must be a whole number"),
                Solution.problems(Solution.parseSignup("nope", null, "abc")));
    }

    @Test
    @DisplayName("parseSignup: a good form parses into a type that cannot be wrong")
    void parseSignupSucceeds() {
        Solution.Signup signup = Solution.orThrow(
                Solution.parseSignup("Jane@Example.com", "  Jane  ", "30"));
        assertEquals(new Solution.Email("jane@example.com"), signup.email());
        assertEquals("Jane", signup.name(), "trimmed on the way in");
        assertEquals(30, signup.age());
        assertEquals(List.of(), Solution.problems(Solution.parseSignup("a@b.com", "A", "18")));
    }

    @Test
    @DisplayName("Signup: the record refuses nulls even if a caller skips the parser")
    void signupGuardsItself() {
        Solution.Email email = new Solution.Email("a@b.com");
        assertEquals("email must not be null",
                assertThrows(NullPointerException.class,
                        () -> new Solution.Signup(null, "Jane", 30)).getMessage());
        assertEquals("name must not be null",
                assertThrows(NullPointerException.class,
                        () -> new Solution.Signup(email, null, 30)).getMessage());
    }

    @Test
    @DisplayName("problems: empty for a valid result")
    void problemsOfValid() {
        assertEquals(List.of(), Solution.problems(new Solution.Valid<>("x")));
        assertEquals(List.of("a", "b"), Solution.problems(new Solution.Invalid<>(List.of("a", "b"))));
    }

    @Test
    @DisplayName("orThrow: the boundary where a Validated becomes an exception")
    void orThrowJoinsEveryProblem() {
        assertEquals("x", Solution.orThrow(new Solution.Valid<>("x")));
        IllegalArgumentException e = assertThrows(IllegalArgumentException.class,
                () -> Solution.orThrow(new Solution.Invalid<>(List.of("a", "b"))));
        assertEquals("a; b", e.getMessage(), "all of them, not just the first");
        assertEquals("", assertThrows(IllegalArgumentException.class,
                () -> Solution.orThrow(new Solution.Invalid<>(List.of()))).getMessage());
    }

    @Test
    @DisplayName("describe: a switch over a sealed type needs no default")
    void describeIsExhaustive() {
        assertEquals("ok: hi", Solution.describe(new Solution.Valid<>("hi")));
        assertEquals("1 problem(s)", Solution.describe(new Solution.Invalid<>(List.of("a"))));
        assertEquals("2 problem(s)", Solution.describe(new Solution.Invalid<>(List.of("a", "b"))));
        assertEquals("3 problem(s)", Solution.describe(Solution.parseSignup("nope", "", "abc")));
    }
}
