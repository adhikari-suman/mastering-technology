import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Supplier;

/**
 * Part 05, Lesson 04 — Optional
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
     * Look a name up in a directory. A missing key, a null value and a blank
     * value are all the same answer: nothing.
     *
     *   lookup(Map.of("a", "1"), "a")   -> Optional[1]
     *   lookup(Map.of("a", "1"), "b")   -> Optional.empty
     *   lookup({"a": null}, "a")        -> Optional.empty
     *   lookup({"a": "  "}, "a")        -> Optional.empty
     *
     * `Optional.of` throws on null; the constructor you want here is the other
     * one. Blankness is a `filter` away — note that filtering an already-empty
     * Optional is a no-op rather than a NullPointerException, which is the
     * whole point of the type.
     */
    static Optional<String> lookup(Map<String, String> directory, String key) {
        throw new UnsupportedOperationException("lookup: not implemented");
    }

    /**
     * Parse an int, with absence standing in for failure.
     *
     *   parseInt("42")   -> Optional[42]
     *   parseInt("-7")   -> Optional[-7]
     *   parseInt("x")    -> Optional.empty
     *   parseInt("")     -> Optional.empty
     *   parseInt(null)   -> Optional.empty
     *
     * Optional as a return type is a promise: "this can legitimately have no
     * answer, and I am not going to make you remember that".
     */
    static Optional<Integer> parseInt(String raw) {
        throw new UnsupportedOperationException("parseInt: not implemented");
    }

    /**
     * Return the value, or the supplier's fallback — written with `orElse`.
     *
     *   eagerFallback(Optional.of("v"), () -> "fallback")   -> "v"
     *   eagerFallback(Optional.empty(), () -> "fallback")   -> "fallback"
     *
     * `orElse` takes a VALUE, so you must call `fallback.get()` to have one to
     * pass. Write it that way. Then count how many times the supplier ran on
     * the first line, and compare against `lazyFallback` below.
     */
    static String eagerFallback(Optional<String> value, Supplier<String> fallback) {
        throw new UnsupportedOperationException("eagerFallback: not implemented");
    }

    /**
     * The same answer, written with `orElseGet`.
     *
     *   lazyFallback(Optional.of("v"), () -> "fallback")   -> "v"
     *   lazyFallback(Optional.empty(), () -> "fallback")   -> "fallback"
     *
     * Pass the supplier itself. Identical results, different cost — and if the
     * fallback opened a database connection, a very different program.
     */
    static String lazyFallback(Optional<String> value, Supplier<String> fallback) {
        throw new UnsupportedOperationException("lazyFallback: not implemented");
    }

    /**
     * Resolve a nickname to an email address by going through two maps: the
     * alias map gives a real name, the directory gives that name's address.
     *
     *   aliases   = {"jane": "j.doe"}
     *   directory = {"j.doe": "j.doe@example.com"}
     *
     *   resolve(aliases, directory, "jane")   -> Optional[j.doe@example.com]
     *   resolve(aliases, directory, "bob")    -> Optional.empty   (no alias)
     *   aliases = {"jane": "ghost"}
     *   resolve(aliases, directory, "jane")   -> Optional.empty   (no directory entry)
     *
     * Reuse `lookup` for both steps. The lookup returns an Optional and the
     * function you hand to the combinator returns an Optional too — so `map`
     * would give you an `Optional<Optional<String>>`. Use the other one.
     */
    static Optional<String> resolve(Map<String, String> aliases,
                                    Map<String, String> directory,
                                    String key) {
        throw new UnsupportedOperationException("resolve: not implemented");
    }

    /**
     * Drop the empties from a list of Optionals.
     *
     *   presentOnly([Optional[a], empty, Optional[b]])  -> ["a", "b"]
     *   presentOnly([])                                 -> []
     *   presentOnly([empty, empty])                     -> []
     *
     * Since Java 9, `Optional` has a `stream()` method returning a stream of
     * zero or one elements, which makes this one `flatMap` with no `isPresent`
     * anywhere. (A `List<Optional<T>>` is itself a design smell — see the
     * README — but you will be handed one by somebody's API.)
     */
    static List<String> presentOnly(List<Optional<String>> options) {
        throw new UnsupportedOperationException("presentOnly: not implemented");
    }

    /**
     * The first value if there is one, otherwise whatever the supplier
     * produces — keeping the result an Optional throughout.
     *
     *   preferred(Optional.of("a"), () -> Optional.of("b"))  -> Optional[a]
     *   preferred(Optional.empty(), () -> Optional.of("b"))  -> Optional[b]
     *   preferred(Optional.empty(), () -> Optional.empty())  -> Optional.empty
     *
     * The supplier must NOT be called when the first value is present. Java 9
     * added the exact method for this; `orElseGet` is the wrong shape because
     * it unwraps.
     */
    static Optional<String> preferred(Optional<String> first, Supplier<Optional<String>> second) {
        throw new UnsupportedOperationException("preferred: not implemented");
    }

    /**
     * Describe an Optional in one sentence, taking BOTH branches in one call.
     *
     *   describe(Optional.of("hi"))  -> "got hi"
     *   describe(Optional.empty())   -> "nothing"
     *
     * Java 9's `ifPresentOrElse(Consumer, Runnable)` runs one side or the
     * other. Neither side returns anything, so you will need somewhere to put
     * the answer — an array of one, or a StringBuilder, or a mutable holder.
     * That awkwardness is real, and it is a hint about when a plain
     * `map(...).orElse(...)` reads better.
     */
    static String describe(Optional<String> value) {
        throw new UnsupportedOperationException("describe: not implemented");
    }

    /**
     * The tags stored against a key. Absence is an empty list, never null and
     * never an empty Optional.
     *
     *   tagsOf({"post": ["java", "errors"]}, "post")  -> ["java", "errors"]
     *   tagsOf({"post": [...]}, "missing")            -> []
     *   tagsOf({"post": null}, "post")                -> []
     *
     * `Optional<List<T>>` has two ways to say "nothing" — empty Optional and
     * empty list — and every caller has to handle both. A collection already
     * has an empty case; use it.
     */
    static List<String> tagsOf(Map<String, List<String>> tags, String key) {
        throw new UnsupportedOperationException("tagsOf: not implemented");
    }

    /**
     * Insist on a value.
     *
     *   demand(Optional.of("hi"))  -> "hi"
     *   demand(Optional.empty())   -> throws NoSuchElementException
     *                                 with getMessage() == "No value present"
     *
     * Use `orElseThrow()`. `get()` is the older name for the identical method
     * and reads like a safe accessor, which is why it is now discouraged: at
     * the call site `o.get()` looks like nothing can go wrong, and
     * `o.orElseThrow()` looks like exactly what it is.
     */
    static String demand(Optional<String> value) {
        throw new UnsupportedOperationException("demand: not implemented");
    }
}
