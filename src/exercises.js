import { fraction } from './fractions.js';

// Every authored exercise supports DM 1.3 G12; partitions also scaffold G10/G11.
export const EXAMPLES = Object.freeze([
  { title: 'Half A Pie', from: fraction(1, 2), to: 4, note: 'Split each half in two. The serving stays the same.' },
  { title: 'Smaller Slices', from: fraction(2, 4), to: 8, note: 'Twice as many equal pieces means each piece is half as big.' },
  { title: 'Into Sixteenths', from: fraction(4, 8), to: 16, note: 'Eight small slices cover the same amount as half the pie.' },
  { title: 'Three Quarters', from: fraction(3, 4), to: 8, note: 'Each selected quarter becomes two selected eighths.' },
  { title: 'Three Eighths', from: fraction(3, 8), to: 16, note: 'Double the number of pieces in the whole and in the serving.' },
  { title: 'Group Them Again', from: fraction(12, 16), to: 4, note: 'Group four sixteenths into each quarter. Divide both numbers by four.' },
  { title: 'The Whole Pie', from: fraction(2, 2), to: 16, note: 'When every piece is selected, the fraction is one whole pie.' },
  { title: 'An Empty Serving', from: fraction(0, 4), to: 16, note: 'No selected slices means zero pie, whatever the slice size.' },
]);

export const TASKSET_VERSION='equivalence-20-v1';
export const CHALLENGES = Object.freeze([
  [1, 2, 4], [1, 4, 8], [3, 4, 8], [3, 8, 16],
  [7, 8, 16], [12, 16, 4], [2, 16, 8], [6, 8, 4],
  [2, 2, 16], [0, 8, 16],
  [1, 2, 8], [1, 4, 16], [3, 4, 16], [1, 8, 16], [5, 8, 16],
  [8, 16, 2], [4, 16, 4], [10, 16, 8], [14, 16, 8], [4, 8, 2],
].map(([n, d, to], i) => Object.freeze({ id: `equivalence-${i + 1}`, from: fraction(n, d), to, family:n===0?'Zero Under A New Partition':n===d?'One Whole Under A New Partition':`${to>d?'Expand':'Regroup'} By ${Math.max(d,to)/Math.min(d,to)}` })));
