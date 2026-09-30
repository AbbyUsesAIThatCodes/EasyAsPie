export const FREE_INSTRUCTION = 'Select a piece to serve it and all earlier pieces';
export function pieName(mode, pair) {
  if (mode === 'learn') return pair === 'A' ? 'Example Pie' : 'Your Pie';
  if (mode === 'challenge') return pair === 'A' ? 'Example Pie' : 'Customer Pie';
  return pair === 'A' ? 'Test Pie 1' : 'Test Pie 2';
}
