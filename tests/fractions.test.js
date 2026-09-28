import test from 'node:test';
import assert from 'node:assert/strict';
import { DENOMINATORS, fraction, equivalent, convert, compare, explain } from '../src/fractions.js';
import { EXAMPLES, CHALLENGES } from '../src/exercises.js';

test('all valid servings convert exactly and reversibly when representable', () => {
  for (const d of DENOMINATORS) for (let n = 0; n <= d; n++) {
    const source = fraction(n, d);
    for (const target of DENOMINATORS) {
      const result = convert(source, target);
      if (result) {
        assert.equal(result.n * d, n * target);
        assert.ok(equivalent(source, result));
        assert.deepEqual(convert(result, d), source);
        assert.equal(compare(source, result), 0);
      } else assert.notEqual((n * target) % d, 0);
    }
  }
});

test('reject invalid counts and unsupported partitions, rather than rounding', () => {
  for (const [n, d] of [[1, 0], [1, 3], [-1, 8], [9, 8], [0.5, 4], [NaN, 4]]) {
    assert.throws(() => fraction(n, d), RangeError);
  }
  assert.equal(convert(fraction(3, 16), 8), null);
  assert.equal(compare(fraction(1, 4), fraction(1, 2)), -1);
  assert.equal(compare(fraction(7, 8), fraction(1, 2)), 1);
});

test('authored tasks all have exact, in-range whole-slice answers', () => {
  for (const task of [...EXAMPLES, ...CHALLENGES]) {
    const answer = convert(task.from, task.to);
    assert.ok(answer, JSON.stringify(task));
    assert.notEqual(task.from.d, task.to);
    assert.ok(equivalent(task.from, answer));
    assert.match(explain(task.from, answer), /both numbers/);
  }
  assert.ok(CHALLENGES.some(t => t.from.n === 0));
  assert.ok(CHALLENGES.some(t => t.from.n === t.from.d));
  assert.ok(CHALLENGES.some(t => t.from.d > t.to));
});
