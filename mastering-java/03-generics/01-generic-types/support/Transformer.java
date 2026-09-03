/**
 * Provided for you — you do not write this file.
 *
 * A generic interface with two type parameters and a single abstract method,
 * which is all it takes to be a lambda target.
 */
@FunctionalInterface
interface Transformer<I, O> {
    O apply(I input);
}
