import java.util.List;
import java.util.Map;

/**
 * Provided for you — you do not write this file.
 *
 * Three methods whose declared return types are the only place their type
 * arguments survive. The bytecode erased them from every value; the Signature
 * attribute kept them on the declaration.
 */
class Reflected {

    static List<String> names() {
        return List.of("ann", "bo");
    }

    static Map<String, List<Integer>> index() {
        return Map.of();
    }

    static int count() {
        return 2;
    }
}
