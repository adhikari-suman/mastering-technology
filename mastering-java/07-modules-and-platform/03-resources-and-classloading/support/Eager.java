/**
 * A class whose only observable behaviour is being initialised. Provided for
 * you; it exists to show that loading and initialising are separate events.
 */
public class Eager {

    static {
        InitLog.record("Eager");
    }

    public static int answer() {
        return 42;
    }
}
