/**
 * Classic FizzBuzz, returned as an array of strings for numbers 1..n.
 * Multiples of 3 -> 'Fizz', of 5 -> 'Buzz', of both -> 'FizzBuzz',
 * everything else -> the number as a string.
 *
 * fizzbuzz(5) -> ['1', '2', 'Fizz', '4', 'Buzz']
 */
export function fizzbuzz(n) {
  const arr = [];

  for (let i = 1; i <= n; i++) {
    let item = "";

    if (i % 3 === 0 && i % 5 === 0) {
      item = "FizzBuzz";
    } else if (i % 3 === 0) {
      item = "Fizz";
    } else if (i % 5 === 0) {
      item = "Buzz";
    } else {
      item = `${i}`;
    }
    arr.push(item);
  }

  return arr;
}

/**
 * Letter grade from a score out of 100.
 * 90+ 'A', 80+ 'B', 70+ 'C', 60+ 'D', below that 'F'.
 * Out of range (< 0 or > 100) -> null.
 *
 * Write this with guard clauses. No else, no nesting.
 */
export function grade(score) {
  const grade =
    score > 100 || score < 0
      ? null
      : score >= 90
        ? "A"
        : score >= 80
          ? "B"
          : score >= 70
            ? "C"
            : score >= 60
              ? "D"
              : "F";

  return grade;
}

/**
 * 'weekend' for 'sat'/'sun', 'weekday' for the other five, null for anything
 * else. Use a switch, and use deliberate fall-through for the shared cases.
 */
export function dayType(day) {
  switch (day) {
    case "sat":
    case "sun":
      return "weekend";

    case "mon":
    case "tue":
    case "wed":
    case "thu":
    case "fri":
      return "weekday";

    default:
      return null;
  }
}

/**
 * Sum only the even numbers. Use a loop with `continue` to skip odd ones.
 *
 * sumEven([1, 2, 3, 4]) -> 6
 * sumEven([])           -> 0
 */
export function sumEven(numbers) {
  let sum = 0;

  for (let num of numbers) {
    if (num % 2 === 0) {
      sum += num;
    }
  }

  return sum;
}

/**
 * Index of the first negative number, or -1 if there isn't one.
 * Use `break` — stop looking the moment you find it.
 */
export function firstNegativeIndex(numbers) {
  for (let idx = 0; idx < numbers.length; idx++) {
    if (numbers[idx] < 0) {
      return idx;
    }
  }

  return -1;
}

/**
 * Count down from n to 1, as an array. Use a `while` loop.
 * n < 1 -> []
 *
 * countdown(3) -> [3, 2, 1]
 */
export function countdown(n) {
  const arr = [];

  while (n > 0) {
    arr.push(n--);
  }

  return arr;
}

/**
 * Repeatedly halve n (integer division, discarding remainders) until it
 * reaches 1, and return how many halvings that took.
 *
 * halvingSteps(1)  -> 0
 * halvingSteps(8)  -> 3     (8 -> 4 -> 2 -> 1)
 * halvingSteps(10) -> 3     (10 -> 5 -> 2 -> 1)
 */
export function halvingSteps(n) {
  let counter = 0;

  while (n > 1) {
    n /= 2;
    n = Math.floor(n);
    counter++;
  }

  return counter;
}
