import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fizzbuzz,
  grade,
  dayType,
  sumEven,
  firstNegativeIndex,
  countdown,
  halvingSteps,
} from './exercise.js';

test('fizzbuzz: the first fifteen', () => {
  assert.deepEqual(fizzbuzz(15), [
    '1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8',
    'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz',
  ]);
});

test('fizzbuzz: edges', () => {
  assert.deepEqual(fizzbuzz(1), ['1']);
  assert.deepEqual(fizzbuzz(0), []);
});

test('grade: each band', () => {
  assert.equal(grade(100), 'A');
  assert.equal(grade(90), 'A');
  assert.equal(grade(89), 'B');
  assert.equal(grade(80), 'B');
  assert.equal(grade(75), 'C');
  assert.equal(grade(60), 'D');
  assert.equal(grade(59), 'F');
  assert.equal(grade(0), 'F');
});

test('grade: rejects out-of-range scores', () => {
  assert.equal(grade(-1), null);
  assert.equal(grade(101), null);
});

test('dayType: weekends, weekdays, nonsense', () => {
  assert.equal(dayType('sat'), 'weekend');
  assert.equal(dayType('sun'), 'weekend');
  assert.equal(dayType('mon'), 'weekday');
  assert.equal(dayType('fri'), 'weekday');
  assert.equal(dayType('wed'), 'weekday');
  assert.equal(dayType('funday'), null);
  assert.equal(dayType(''), null);
});

test('sumEven: adds the even ones only', () => {
  assert.equal(sumEven([1, 2, 3, 4]), 6);
  assert.equal(sumEven([1, 3, 5]), 0);
  assert.equal(sumEven([2, 4, 6]), 12);
  assert.equal(sumEven([]), 0);
});

test('sumEven: zero and negatives are even too', () => {
  assert.equal(sumEven([0, 1]), 0);
  assert.equal(sumEven([-2, -3, -4]), -6);
});

test('firstNegativeIndex: finds the first one', () => {
  assert.equal(firstNegativeIndex([1, 2, -3, -4]), 2);
  assert.equal(firstNegativeIndex([-1, 2, 3]), 0);
  assert.equal(firstNegativeIndex([1, 2, 3]), -1);
  assert.equal(firstNegativeIndex([]), -1);
});

test('firstNegativeIndex: zero is not negative', () => {
  assert.equal(firstNegativeIndex([0, 0, -1]), 2);
});

test('countdown: descends to 1', () => {
  assert.deepEqual(countdown(3), [3, 2, 1]);
  assert.deepEqual(countdown(1), [1]);
  assert.deepEqual(countdown(0), []);
  assert.deepEqual(countdown(-5), []);
});

test('halvingSteps: counts the halvings', () => {
  assert.equal(halvingSteps(1), 0);
  assert.equal(halvingSteps(2), 1);
  assert.equal(halvingSteps(8), 3);
  assert.equal(halvingSteps(10), 3);
  assert.equal(halvingSteps(1024), 10);
});
