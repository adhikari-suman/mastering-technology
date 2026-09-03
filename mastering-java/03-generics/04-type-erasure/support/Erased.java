import java.util.List;

/**
 * Provided for you — you do not write this file.
 *
 * Five methods whose source signatures differ only in their generics. Ask the
 * class file what each parameter became and the leftmost-bound rule falls out.
 */
class Erased {

    static <T> void unbounded(T value) {
    }

    static <T extends Number> void bounded(T value) {
    }

    static <T extends Number & Comparable<T>> void multi(T value) {
    }

    static <T extends Comparable<T>> void ordered(T value) {
    }

    static void ofStrings(List<String> values) {
    }
}
