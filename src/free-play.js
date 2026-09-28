import { fraction, convert } from './fractions.js';

// Each pair owns one fraction. Rendering, hover/focus, and animation live elsewhere.
export function createFreePlay({ A = fraction(1, 2), B = fraction(2, 4) } = {}) {
  return Object.freeze({ A: fraction(A.n, A.d), B: fraction(B.n, B.d) });
}

const refused = (state, code, message) => ({ state, ok: false, reason: { code, message } });

/** Pure transition over a state from createFreePlay or a previous successful action. */
export function applyFreePlayAction(state, action) {
  if (!action || typeof action !== 'object' || Array.isArray(action)) {
    return refused(state, 'invalid-action', 'Choose a Free Play action.');
  }
  const { pair, type, k } = action;
  if (pair !== 'A' && pair !== 'B') {
    return refused(state, 'invalid-pair', 'Choose pair A or pair B.');
  }
  const current = state[pair];
  let next;
  switch (type) {
    case 'select':
      if (!Number.isInteger(k) || k < 0 || k > current.d) {
        return refused(state, 'invalid-selection', `Select a whole number of pieces from 0 to ${current.d}.`);
      }
      next = fraction(k, current.d);
      break;
    case 'clear':
      next = fraction(0, current.d);
      break;
    case 'decrease':
      if (current.n === 0) {
        return refused(state, 'empty-serving', 'The serving is already empty.');
      }
      next = fraction(current.n - 1, current.d);
      break;
    case 'increase':
      if (current.n === current.d) {
        return refused(state, 'whole-serving', 'The whole pie is already selected.');
      }
      next = fraction(current.n + 1, current.d);
      break;
    case 'cut':
      if (current.d === 16) {
        return refused(state, 'finest-partition', 'Sixteenths are the smallest pieces in Free Play.');
      }
      next = convert(current, current.d * 2);
      break;
    case 'regroup':
      if (current.d === 2) {
        return refused(state, 'coarsest-partition', 'Halves are the largest pieces in Free Play.');
      }
      if (current.n % 2 !== 0) {
        return refused(state, 'odd-serving', 'Regroup needs an even number of selected pieces so the serving stays exactly the same.');
      }
      next = convert(current, current.d / 2);
      break;
    default:
      return refused(state, 'invalid-action', 'Choose Select, Clear, Decrease, Increase, Cut, or Regroup.');
  }
  // Idempotent selection/Clear is accepted without creating a different snapshot.
  if (next.n === current.n && next.d === current.d) return { state, ok: true, reason: null };
  return { state: Object.freeze({ ...state, [pair]: next }), ok: true, reason: null };
}
