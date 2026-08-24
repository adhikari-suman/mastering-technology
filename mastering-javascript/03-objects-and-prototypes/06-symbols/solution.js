/**
 * Attach `data` to obj under a symbol key that nothing else can collide with,
 * and return obj. The data must be invisible to Object.keys and JSON.stringify.
 *
 * Use ONE module-level symbol so readMetadata can find it again.
 */

const _symbolKey = Symbol("_symbolKey");

export function attachMetadata(obj, data) {
  Object.defineProperty(obj, _symbolKey, {
    value: data,
  });

  return obj;
}

/**
 * Read back what attachMetadata stored, or undefined if there is none.
 */
export function readMetadata(obj) {
  return obj[_symbolKey];
}

/**
 * Every symbol-keyed own property name on obj.
 *
 * symbolKeysOf({ [Symbol('a')]: 1 }).length -> 1
 */
export function symbolKeysOf(obj) {
  return Object.getOwnPropertySymbols(obj);
}

/**
 * A class holding `from` and `to`, iterable with for...of and spread.
 *
 *   [...new Range(1, 3)]  -> [1, 2, 3]
 *   [...new Range(2, 2)]  -> [2]
 *   [...new Range(3, 1)]  -> []
 *
 * Implement [Symbol.iterator].
 */
export class Range {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;

    const isAscending = current <= last;

    return {
      next: () => {
        if (isAscending) {
          return current <= last
            ? {
                value: current++,
                done: false,
              }
            : { done: true };
        } else {
          return {
            done: true,
          };
        }
      },
    };
  }
}

/**
 * A class holding `amount` and `currency`.
 *
 *   const m = new Money(5, 'GBP');
 *   +m               -> 5             (numeric hint)
 *   `${m}`           -> '5 GBP'       (string hint)
 *   m + ''           -> '5 GBP'       (default hint — treat it as string here)
 *   Object.prototype.toString.call(m) -> '[object Money]'
 *
 * Implement [Symbol.toPrimitive] and [Symbol.toStringTag].
 */
export class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "number") {
      return this.amount;
    } else if (hint === "string") {
      return `${this.amount} ${this.currency}`;
    }

    return `${this.amount} ${this.currency}`;
  }

  get [Symbol.toStringTag]() {
    return "Money";
  }
}

/**
 * An object (not a class) for which `instanceof` reports whether the left side
 * is an even number.
 *
 *   4 instanceof Even  -> true
 *   3 instanceof Even  -> false
 *   'x' instanceof Even -> false
 *
 * Implement [Symbol.hasInstance].
 */
export const Even = {
  [Symbol.hasInstance](instance) {
    return Number.isInteger(instance) && instance % 2 === 0;
  },
};
