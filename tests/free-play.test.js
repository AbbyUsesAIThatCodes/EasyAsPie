import test from 'node:test';
import assert from 'node:assert/strict';
import { DENOMINATORS, fraction, equivalent } from '../src/fractions.js';
import { createFreePlay, applyFreePlayAction } from '../src/free-play.js';

const servings = DENOMINATORS.flatMap(d => Array.from({ length: d + 1 }, (_, n) => fraction(n, d)));
const action = (state, pair, type, k) => applyFreePlayAction(state, { pair, type, k });

function expectRefusal(before, result, code) {
  assert.equal(result.ok, false);
  assert.equal(result.state, before, 'A refusal keeps the entire original snapshot.');
  assert.equal(result.reason.code, code);
  assert.ok(result.reason.message.length > 0, 'A refusal includes a non-color explanation.');
}

test('initial states preserve notation and do not retain mutable caller fractions', () => {
  assert.equal(servings.length, 34);
  assert.deepEqual(createFreePlay(), { A: { n: 1, d: 2 }, B: { n: 2, d: 4 } });
  const initial = { A: { n: 8, d: 16 }, B: { n: 4, d: 8 } };
  const state = createFreePlay(initial);
  initial.A.n = 0;
  assert.deepEqual(state.A, { n: 8, d: 16 });
  assert.deepEqual(state.B, { n: 4, d: 8 });
  assert.throws(() => { state.A.n = 0; }, TypeError);
  assert.throws(() => { state.B = fraction(0, 2); }, TypeError);
  for (const pair of ['A', 'B']) {
    for (const [n, d] of [[-1, 4], [5, 4], [1.5, 4], [1, 3], [1, 0], [NaN, 8]]) {
      assert.throws(() => createFreePlay({ [pair]: { n, d } }), RangeError);
    }
  }
});

for (const pair of ['A', 'B']) {
  const other = pair === 'A' ? 'B' : 'A';

  test(`${pair}: every serving action is bounded and independent across all 34 × 34 paired states`, () => {
    for (const serving of servings) for (const partner of servings) {
      const state = createFreePlay({ [pair]: serving, [other]: partner });
      const before = structuredClone(state);
      const { n, d } = serving;
      for (let k = 0; k <= d; k++) {
        const result = action(state, pair, 'select', k);
        assert.equal(result.ok, true);
        assert.equal(result.reason, null);
        assert.deepEqual(result.state[pair], { n: k, d });
        assert.equal(result.state[other], state[other]);
        assert.equal(action(result.state, pair, 'select', k).state, result.state);
      }
      const cleared = action(state, pair, 'clear');
      assert.equal(cleared.ok, true);
      assert.deepEqual(cleared.state[pair], { n: 0, d });
      assert.equal(cleared.state[other], state[other]);
      assert.equal(action(cleared.state, pair, 'clear').state, cleared.state);

      const decreased = action(state, pair, 'decrease');
      if (n === 0) expectRefusal(state, decreased, 'empty-serving');
      else {
        assert.equal(decreased.ok, true);
        assert.deepEqual(decreased.state[pair], { n: n - 1, d });
        assert.equal(decreased.state[other], state[other]);
      }
      const increased = action(state, pair, 'increase');
      if (n === d) expectRefusal(state, increased, 'whole-serving');
      else {
        assert.equal(increased.ok, true);
        assert.deepEqual(increased.state[pair], { n: n + 1, d });
        assert.equal(increased.state[other], state[other]);
      }
      assert.deepEqual(state, before, 'Successful actions do not mutate their input.');
    }
  });

  test(`${pair}: every Cut/Regroup preserves amount, round-trips, and leaves the other pair alone`, () => {
    for (const serving of servings) for (const partner of servings) {
      const state = createFreePlay({ [pair]: serving, [other]: partner });
      const before = structuredClone(state);
      for (const type of ['cut', 'regroup']) {
        const result = action(state, pair, type);
        if (type === 'cut' && serving.d === 16) expectRefusal(state, result, 'finest-partition');
        else if (type === 'regroup' && serving.d === 2) expectRefusal(state, result, 'coarsest-partition');
        else if (type === 'regroup' && serving.n % 2 !== 0) expectRefusal(state, result, 'odd-serving');
        else {
          assert.equal(result.ok, true);
          assert.equal(result.reason, null);
          assert.ok(equivalent(serving, result.state[pair]));
          assert.equal(result.state[pair].d, type === 'cut' ? serving.d * 2 : serving.d / 2);
          assert.equal(result.state[other], state[other]);
          const reverse = action(result.state, pair, type === 'cut' ? 'regroup' : 'cut');
          assert.equal(reverse.ok, true);
          assert.deepEqual(reverse.state, state, 'Round trips restore the exact displayed counts.');
        }
      }
      assert.deepEqual(state, before);
    }
  });

  test(`${pair}: invalid selections leave both fractions unchanged at every valid serving`, () => {
    for (const serving of servings) {
      const state = createFreePlay({ [pair]: serving });
      for (const k of [-1, serving.d + 1, 0.5, NaN, Infinity, '1', null, undefined, {}, 1n]) {
        expectRefusal(state, action(state, pair, 'select', k), 'invalid-selection');
      }
    }
  });
}

test('malformed requests and presentation events never partially update either pair', () => {
  const state = createFreePlay({ A: fraction(3, 16), B: fraction(6, 8) });
  for (const request of [null, undefined, 'cut', 2, []]) {
    expectRefusal(state, applyFreePlayAction(state, request), 'invalid-action');
  }
  for (const pair of [undefined, null, 'C', 'a', 0, '__proto__', 'constructor']) {
    expectRefusal(state, action(state, pair, 'cut'), 'invalid-pair');
  }
  for (const pair of ['A', 'B']) for (const type of [undefined, null, 'halve', 'hover', 'focus', 'animate']) {
    expectRefusal(state, action(state, pair, type), 'invalid-action');
  }
  // Presentation metadata cannot become a second source of mathematical state.
  const selected = applyFreePlayAction(state, { pair: 'A', type: 'select', k: 8, hover: 3, focus: 5, animation: {} });
  assert.deepEqual(selected.state, { A: { n: 8, d: 16 }, B: { n: 6, d: 8 } });
  assert.deepEqual(state, { A: { n: 3, d: 16 }, B: { n: 6, d: 8 } });
});

test('the agreed discovery sequences and repeated input keep exact independent servings', () => {
  let state = createFreePlay({ A: fraction(12, 16), B: fraction(1, 2) });
  for (const expected of [fraction(6, 8), fraction(3, 4)]) {
    const result = action(state, 'A', 'regroup');
    assert.equal(result.ok, true);
    state = result.state;
    assert.deepEqual(state.A, expected);
    assert.deepEqual(state.B, fraction(1, 2));
  }
  for (const expected of [fraction(2, 4), fraction(4, 8), fraction(8, 16)]) {
    state = action(state, 'B', 'cut').state;
    assert.deepEqual(state.B, expected);
    assert.deepEqual(state.A, fraction(3, 4));
  }
  for (let i = 0; i < 3; i++) expectRefusal(state, action(state, 'B', 'cut'), 'finest-partition');
  state = action(state, 'B', 'select', 3).state;
  for (let i = 0; i < 3; i++) expectRefusal(state, action(state, 'B', 'regroup'), 'odd-serving');
  assert.deepEqual(state.B, fraction(3, 16));
  // Recovery uses the latest snapshot; a rejected conversion does not poison it.
  state = action(state, 'B', 'increase').state;
  state = action(state, 'B', 'regroup').state;
  assert.deepEqual(state, { A: { n: 3, d: 4 }, B: { n: 2, d: 8 } });
});
