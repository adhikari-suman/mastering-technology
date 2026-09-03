/**
 * A class whose static initialiser always fails. Provided for you.
 *
 * The first use throws ExceptionInInitializerError with the real cause
 * attached. Every use after that gets NoClassDefFoundError instead, because
 * the class is now permanently marked erroneous.
 */
public class Boom {

    static {
        InitLog.record("Boom");
        Integer.parseInt("not a number");
    }

    public static void touch() {
    }
}
