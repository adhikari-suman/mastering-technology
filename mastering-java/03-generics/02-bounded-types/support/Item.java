/**
 * Provided for you — you do not write this file.
 *
 * `Item` orders itself by weight. `Weapon` inherits that ordering rather than
 * declaring its own, which means `Weapon implements Comparable<Item>`, NOT
 * `Comparable<Weapon>`. That one fact decides which bound `max` has to use.
 */
class Item implements Comparable<Item> {

    final String name;
    final int weight;

    Item(String name, int weight) {
        this.name = name;
        this.weight = weight;
    }

    @Override
    public int compareTo(Item other) {
        return Integer.compare(weight, other.weight);
    }

    @Override
    public boolean equals(Object other) {
        return other instanceof Item item
                && weight == item.weight
                && name.equals(item.name)
                && getClass() == item.getClass();
    }

    @Override
    public int hashCode() {
        return name.hashCode() * 31 + weight;
    }

    @Override
    public String toString() {
        return name + "(" + weight + ")";
    }
}

class Weapon extends Item {

    Weapon(String name, int weight) {
        super(name, weight);
    }
}
