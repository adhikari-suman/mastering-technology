import java.io.IOException;

/**
 * A source of text that fails the way I/O fails: with a checked exception.
 *
 * Provided for you — you do not write this file. It exists because a lambda can
 * only throw a checked exception if the interface it implements declares it,
 * and every `Fetcher` in this lesson is written as a lambda:
 *
 *     Fetcher good = () -> "hello";
 *     Fetcher bad  = () -> { throw new IOException("disk gone"); };
 */
@FunctionalInterface
interface Fetcher {
    String fetch() throws IOException;
}
