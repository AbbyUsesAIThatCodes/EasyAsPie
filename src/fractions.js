// Integer arithmetic is the source of truth; meshes never decide an answer.
export const DENOMINATORS = Object.freeze([2, 4, 8, 16]);

export function fraction(n, d) {
  if (!DENOMINATORS.includes(d) || !Number.isInteger(n) || n < 0 || n > d) {
    throw new RangeError('Use a whole slice count from zero to the denominator (2, 4, 8, or 16).');
  }
  return Object.freeze({ n, d });
}

export function equivalent(a, b) {
  fraction(a.n, a.d);
  fraction(b.n, b.d);
  return a.n * b.d === b.n * a.d;
}

export function convert(a, denominator) {
  fraction(a.n, a.d);
  fraction(0, denominator);
  const scaled = a.n * denominator;
  // Some sixteenths cannot be written as a whole number of eighths.
  return scaled % a.d === 0 ? fraction(scaled / a.d, denominator) : null;
}

export function compare(a, b) {
  fraction(a.n, a.d);
  fraction(b.n, b.d);
  return Math.sign(a.n * b.d - b.n * a.d);
}

export function label(a) { return `${a.n}/${a.d}`; }

export function explain(a, b) {
  if (!equivalent(a, b)) throw new RangeError('An explanation requires equivalent fractions.');
  if (a.d === b.d) return 'The slice counts and the amount are unchanged.';
  const multiply = b.d > a.d;
  const factor = multiply ? b.d / a.d : a.d / b.d;
  return `${multiply ? 'Multiply' : 'Divide'} both numbers by ${factor}: ${a.n} ${multiply ? '×' : '÷'} ${factor} = ${b.n} and ${a.d} ${multiply ? '×' : '÷'} ${factor} = ${b.d}. Same-sized whole, same amount of pie.`;
}
