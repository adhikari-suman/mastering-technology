/**
 * Provided for you — you do not write this file.
 *
 * One `compareTo` in the source. Two in the class file: the compiler adds a
 * synthetic bridge `compareTo(Object)` so that the erased Comparable interface
 * is actually implemented.
 */
class Sized implements Comparable<Sized> {

    final int size;

    Sized(int size) {
        this.size = size;
    }

    @Override
    public int compareTo(Sized other) {
        return Integer.compare(size, other.size);
    }

    String label() {
        return "size=" + size;
    }
}
