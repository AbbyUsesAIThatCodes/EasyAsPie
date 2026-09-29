import { createFreePlay } from './free-play.js';

// Explicit starting fixtures for the built artifact, not a denominator picker.
// Each uses exactly the same selection controls as the normal Free Play preview.
export const fixtureNames = Object.freeze({ halves: 'Halves', quarters: 'Quarters', eighths: 'Eighths', sixteenths: 'Sixteenths', 'empty-whole': 'Empty And Whole' });
export function previewState(name) {
  const denominators = { halves: 2, quarters: 4, eighths: 8 };
  const d = Object.hasOwn(denominators, name) ? denominators[name] : undefined;
  if (d) return createFreePlay({ A: { n: 1, d }, B: { n: d / 2, d } });
  if (name === 'sixteenths') return createFreePlay({ A: { n: 3, d: 16 }, B: { n: 8, d: 16 } });
  if (name === 'empty-whole') return createFreePlay({ A: { n: 0, d: 16 }, B: { n: 16, d: 16 } });
  return createFreePlay();
}
