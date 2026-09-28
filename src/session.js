import { CHALLENGES } from './exercises.js';
import { fraction, compare, label, explain, convert } from './fractions.js';

export const createSession = () => ({ index: 0, selected: 0, attempts: 0, assisted: false, solved: false, complete: false, results: [], feedback: '' });
export const currentTask = state => CHALLENGES[state.index];
export const selectSlices = (state, n) => state.solved || state.complete ? state : {
  ...state, selected: fraction(n, currentTask(state).to).n, feedback: '',
};
export const markAssisted = state => state.solved || state.complete ? state : { ...state, assisted: true };

export function useHint(state) {
  if (state.solved || state.complete) return state;
  const task = currentTask(state);
  const growing = task.to > task.from.d;
  const factor = growing ? task.to / task.from.d : task.from.d / task.to;
  return { ...state, assisted: true, feedback: `The denominator changes from ${task.from.d} to ${task.to}. ${growing ? 'Multiply' : 'Divide'} BOTH numbers by ${factor}. Keep the same amount of pie.` };
}

export function submit(state) {
  if (state.solved || state.complete) return state;
  const task = currentTask(state);
  const answer = fraction(state.selected, task.to);
  const difference = compare(answer, task.from);
  const attempts = state.attempts + 1;
  if (difference !== 0) {
    const sameCount = answer.n === task.from.n ? ' The same number of slices is not the same amount when the slice sizes differ.' : '';
    return { ...state, attempts, feedback: `${label(answer)} is ${difference < 0 ? 'less' : 'more'} than ${label(task.from)} of the same-sized pie.${sameCount} Adjust your serving and try again.` };
  }
  const result = { id: task.id, attempts, assisted: state.assisted, firstTry: attempts === 1 && !state.assisted };
  return { ...state, attempts, solved: true, results: [...state.results, result], feedback: `A perfect match! ${explain(task.from, answer)}` };
}

export function advance(state) {
  if (!state.solved || state.complete) return state;
  if (state.index === CHALLENGES.length - 1) return { ...state, complete: true };
  return { ...state, index: state.index + 1, selected: 0, attempts: 0, assisted: false, solved: false, feedback: '' };
}

export function answerFor(state) { return convert(currentTask(state).from, currentTask(state).to); }
