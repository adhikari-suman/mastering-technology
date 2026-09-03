/**
 * Provided for you — you do not write this file.
 *
 * A three-type hierarchy, which is the smallest thing that makes variance
 * visible: Dog and Cat are both Animals, and neither is the other.
 */
class Animal {

    final String name;

    Animal(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return getClass().getSimpleName() + "(" + name + ")";
    }
}

class Dog extends Animal {

    Dog(String name) {
        super(name);
    }
}

class Cat extends Animal {

    Cat(String name) {
        super(name);
    }
}
