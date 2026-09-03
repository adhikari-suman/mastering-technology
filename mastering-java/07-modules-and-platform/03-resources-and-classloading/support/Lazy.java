/**
 * Two static fields that behave completely differently. Provided for you.
 *
 * CONSTANT is a compile-time constant: `static final` holding a literal. Every
 * reader gets the value baked into their own class file, so reading it does
 * not touch this class at all.
 *
 * COMPUTED is not a constant, because a method call is not a constant
 * expression. Reading it forces initialisation, and the log fills in.
 */
public class Lazy {

    public static final String CONSTANT = "inlined at every call site";

    public static final String COMPUTED = InitLog.record("Lazy.COMPUTED");

    static {
        InitLog.record("Lazy static block");
    }
}
