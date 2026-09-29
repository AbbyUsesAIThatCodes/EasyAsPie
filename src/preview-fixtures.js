import { createFreePlay } from './free-play.js';

// Explicit read-only review fixtures, also usable against the built artifact.
// They are not serving controls or saved game state. Unknown names use defaults.
export function previewState(name) {
  if (name === 'sixteenths') return createFreePlay({ A: { n: 3, d: 16 }, B: { n: 8, d: 16 } });
  if (name === 'empty-whole') return createFreePlay({ A: { n: 0, d: 16 }, B: { n: 16, d: 16 } });
  return createFreePlay();
}
