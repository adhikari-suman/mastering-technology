import test from 'node:test';
import assert from 'node:assert/strict';

let solution = {};
let loadError = null;
try {
  solution = await import('./solution.js');
} catch (err) {
  loadError = err;
}

test('solution.js exists', () => {
  assert.equal(loadError, null, 'Create it first:  cp exercise.js solution.js');
});

const { identity, upper, escapeHtml, sql, oneLine, raw, partsOf } = solution;

test('identity: matches an untagged literal', () => {
  const name = 'Ada';
  assert.equal(identity`Hello ${name}!`, `Hello ${name}!`);
  assert.equal(identity`no holes`, 'no holes');
  assert.equal(identity`${1}`, '1');
  assert.equal(identity``, '');
});

test('identity: several values', () => {
  assert.equal(identity`${1}-${2}-${3}`, '1-2-3');
  assert.equal(identity`a${1}b${2}c`, 'a1b2c');
});

test('upper: only the values change', () => {
  assert.equal(upper`hello ${'world'}`, 'hello WORLD');
  assert.equal(upper`${'a'} and ${'b'}`, 'A and B');
  assert.equal(upper`nothing here`, 'nothing here');
});

test('escapeHtml: escapes values', () => {
  assert.equal(escapeHtml`<p>${'<script>'}</p>`, '<p>&lt;script&gt;</p>');
  assert.equal(escapeHtml`${'a & b'}`, 'a &amp; b');
  assert.equal(escapeHtml`${'"quoted"'}`, '&quot;quoted&quot;');
  assert.equal(escapeHtml`${"it's"}`, 'it&#39;s');
});

test('escapeHtml: never escapes the literal text', () => {
  assert.equal(escapeHtml`<b>bold</b>`, '<b>bold</b>');
});

test('escapeHtml: ampersand is escaped first, not doubly', () => {
  assert.equal(escapeHtml`${'<'}`, '&lt;', 'not &amp;lt;');
});

test('sql: parameterises', () => {
  assert.deepEqual(sql`SELECT * FROM t WHERE id = ${5}`, {
    text: 'SELECT * FROM t WHERE id = $1',
    values: [5],
  });
});

test('sql: several placeholders, numbered from 1', () => {
  assert.deepEqual(sql`WHERE a = ${1} AND b = ${'two'}`, {
    text: 'WHERE a = $1 AND b = $2',
    values: [1, 'two'],
  });
});

test('sql: no values', () => {
  assert.deepEqual(sql`SELECT 1`, { text: 'SELECT 1', values: [] });
});

test('sql: a dangerous value is never spliced into the text', () => {
  const evil = "'; DROP TABLE users; --";
  const query = sql`WHERE name = ${evil}`;
  assert.equal(query.text, 'WHERE name = $1');
  assert.deepEqual(query.values, [evil], 'the value travels separately');
});

test('oneLine: collapses whitespace', () => {
  assert.equal(oneLine`  a   b  `, 'a b');
  assert.equal(oneLine`a
    b`, 'a b');
  assert.equal(oneLine`   ${'x'}   ${'y'}   `, 'x y');
});

test('raw: escapes stay uninterpreted', () => {
  assert.equal(raw`a\nb`, String.raw`a\nb`);
  assert.equal(raw`a\nb`.length, 4);
  assert.equal(raw`C:\new`, 'C:\\new');
});

test('raw: interpolation still works', () => {
  assert.equal(raw`a\n${1}b`, 'a\\n1b');
});

test('partsOf: exposes the call shape', () => {
  const result = partsOf`a${1}b${2}c`;
  assert.deepEqual(result.strings, ['a', 'b', 'c']);
  assert.deepEqual(result.values, [1, 2]);
  assert.ok(Array.isArray(result.rawStrings));
});

test('partsOf: always one more string than value', () => {
  assert.equal(partsOf`${1}`.strings.length, 2);
  assert.deepEqual(partsOf`${1}`.strings, ['', '']);
  assert.equal(partsOf`x`.strings.length, 1);
  assert.deepEqual(partsOf`x`.values, []);
});
