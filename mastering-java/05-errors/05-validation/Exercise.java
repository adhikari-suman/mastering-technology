import java.util.List;

/**
 * Part 05, Lesson 05 — Validation
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
 */
class Solution {

    /**
     * The result of parsing: either a value, or every reason it failed.
     *
     * PROVIDED — there is nothing to implement in these three. They are here so
     * the shape is fixed: a sealed interface with exactly two implementations
     * means a `switch` over them needs no `default`, and the compiler will tell
     * you if you ever add a third case and forget to handle it.
     */
    sealed interface Validated<T> permits Valid, Invalid {
    }

    record Valid<T>(T value) implements Validated<T> {
    }

    record Invalid<T>(List<String> problems) implements Validated<T> {
    }

    /**
     * An email address that cannot be malformed, because a malformed one cannot
     * be constructed.
     *
     * The compact constructor NORMALISES first, then validates:
     *
     *   new Email("  Jane@Example.COM ").value()  -> "jane@example.com"
     *   new Email("Jane@Example.com").domain()    -> "example.com"
     *
     *   new Email(null)     -> NullPointerException, "email must not be null"
     *   new Email("   ")    -> IllegalArgumentException, "email must not be blank"
     *   new Email("nope")   -> IllegalArgumentException,
     *                          "email must contain exactly one @: nope"
     *   new Email("a@b@c")  -> IllegalArgumentException,
     *                          "email must contain exactly one @: a@b@c"
     *   new Email("@b.com") -> IllegalArgumentException,
     *                          "email must have text either side of @: @b.com"
     *   new Email("a@")     -> IllegalArgumentException,
     *                          "email must have text either side of @: a@"
     *
     * Messages quote the NORMALISED text, so trimming and lowercasing happen
     * before any check runs.
     *
     * The trap: in a compact constructor you assign to the PARAMETER, not to
     * `this.value`. `value = value.trim().toLowerCase()` works and is how
     * normalisation is done; `this.value = ...` does not compile, because the
     * implicit field assignment has not happened yet.
     */
    record Email(String value) {
        Email {
            throw new UnsupportedOperationException("Email: not implemented");
        }

        /** Everything after the single '@'. */
        String domain() {
            throw new UnsupportedOperationException("domain: not implemented");
        }
    }

    /**
     * A validated signup. Its compact constructor is a last line of defence:
     * both references are required, and `age` has already been range-checked by
     * whoever built one.
     *
     *   new Signup(null, "Jane", 30)  -> NullPointerException, "email must not be null"
     *   new Signup(email, null, 30)   -> NullPointerException, "name must not be null"
     *
     * `java.util.Objects.requireNonNull(value, message)` returns its argument,
     * so it composes into an assignment when you need one.
     */
    record Signup(Email email, String name, int age) {
        Signup {
            throw new UnsupportedOperationException("Signup: not implemented");
        }
    }

    /**
     * Parse an email without throwing, by letting the type do the checking and
     * adapting whatever it throws into a problem list.
     *
     *   parseEmail("Jane@Example.com")
     *       -> Valid(Email["jane@example.com"])
     *   parseEmail("nope")
     *       -> Invalid(["email must contain exactly one @: nope"])
     *   parseEmail(null)
     *       -> Invalid(["email must not be null"])
     *
     * One rule, written once, in the constructor. This method does not repeat
     * it — it catches and reports. Catch `RuntimeException` here: both the null
     * check and the format checks come out of the same constructor, and both
     * already carry the message you want.
     */
    static Validated<Email> parseEmail(String raw) {
        throw new UnsupportedOperationException("parseEmail: not implemented");
    }

    /**
     * Parse an age, with one problem reported per call.
     *
     *   parseAge("30")   -> Valid(30)
     *   parseAge("18")   -> Valid(18)
     *   parseAge("abc")  -> Invalid(["age must be a whole number"])
     *   parseAge(null)   -> Invalid(["age must be a whole number"])
     *   parseAge("")     -> Invalid(["age must be a whole number"])
     *   parseAge("17")   -> Invalid(["age must be at least 18"])
     *   parseAge("-1")   -> Invalid(["age must be at least 18"])
     *   parseAge("130")  -> Invalid(["age must be under 130"])
     *
     * A value that is not a number cannot also be out of range, so those two
     * problems never appear together.
     */
    static Validated<Integer> parseAge(String raw) {
        throw new UnsupportedOperationException("parseAge: not implemented");
    }

    /**
     * Parse a whole signup form, reporting EVERY problem it has, not the first.
     *
     *   parseSignup("jane@example.com", "Jane", "30")
     *       -> Valid(Signup[Email[jane@example.com], "Jane", 30])
     *   parseSignup("jane@example.com", "  Jane  ", "30")
     *       -> Valid with name "Jane"        (trimmed)
     *   parseSignup("nope", "   ", "17")
     *       -> Invalid(["email must contain exactly one @: nope",
     *                   "name must not be blank",
     *                   "age must be at least 18"])
     *   parseSignup("nope", null, "abc")
     *       -> Invalid(["email must contain exactly one @: nope",
     *                   "name must not be blank",
     *                   "age must be a whole number"])
     *
     * Problems come out in field order: email, then name, then age. This is the
     * whole reason a `Validated` type exists instead of a throw — a user filling
     * in a form should see all three mistakes at once, not one per submission.
     */
    static Validated<Signup> parseSignup(String email, String name, String age) {
        throw new UnsupportedOperationException("parseSignup: not implemented");
    }

    /**
     * The problems, or an empty list when there are none.
     *
     *   problems(new Valid<>("x"))                -> []
     *   problems(new Invalid<>(List.of("a","b"))) -> ["a", "b"]
     */
    static List<String> problems(Validated<?> validated) {
        throw new UnsupportedOperationException("problems: not implemented");
    }

    /**
     * The boundary conversion: turn a Validated back into the exception style,
     * for the one place in a program where that is the right call.
     *
     *   orThrow(new Valid<>("x"))                     -> "x"
     *   orThrow(new Invalid<>(List.of("a", "b")))     -> throws
     *       IllegalArgumentException, getMessage() == "a; b"
     *   orThrow(new Invalid<>(List.of()))             -> throws
     *       IllegalArgumentException, getMessage() == ""
     *
     * Every problem goes into the message, joined by "; ". Losing the ones
     * after the first would undo the work of collecting them.
     */
    static <T> T orThrow(Validated<T> validated) {
        throw new UnsupportedOperationException("orThrow: not implemented");
    }

    /**
     * Describe a result, using a `switch` over the sealed interface with NO
     * default branch.
     *
     *   describe(new Valid<>("hi"))                    -> "ok: hi"
     *   describe(new Invalid<>(List.of("a")))          -> "1 problem(s)"
     *   describe(new Invalid<>(List.of("a", "b")))     -> "2 problem(s)"
     *
     * Because `Validated` is sealed and both branches are covered, the switch
     * is exhaustive and the compiler accepts it without a default. Add a third
     * implementation later and every switch like this one stops compiling —
     * which is the point.
     */
    static String describe(Validated<?> validated) {
        throw new UnsupportedOperationException("describe: not implemented");
    }
}
