/**
 * A fixture for the class-file lesson. Deliberately small and deliberately
 * specific: one long constant (which occupies two constant-pool slots), two
 * string constants, one constructor, and one method whose bytecode is four
 * instructions long.
 *
 * javac compiles this into support/../.build/... alongside your Solution, so
 * the tests read a class file that was produced on this machine, by this JDK,
 * a moment ago.
 */
class Widget {

    static final String MARKER = "widget-marker";

    private final int size;

    Widget(int size) {
        this.size = size;
    }

    int size() {
        return size;
    }

    static int add(int a, int b) {
        return a + b;
    }

    static long serial() {
        return 8675309000000L;
    }

    static String greeting() {
        return "hello";
    }
}
