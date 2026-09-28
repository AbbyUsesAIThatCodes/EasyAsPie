import { EXAMPLES } from './exercises.js';
import { fraction, convert, label, compare, explain } from './fractions.js';

export function createExamples({ el, showPies }) {
  let index = 0, divided = false, selected = 0, active = false;
  const lesson = el('lesson');

  function render(focusId) {
    const task = EXAMPLES[index];
    const right = divided ? fraction(selected, task.to) : task.from;
    const relation = compare(task.from, right);
    const matched = relation === 0;
    const operator = matched ? '=' : relation > 0 ? '>' : '<';
    const feedback = !divided ? task.note : matched
      ? explain(task.from, right)
      : `${label(right)} is ${relation > 0 ? 'less' : 'more'} pie than ${label(task.from)}. Adjust the serving or show the match again.`;
    el('left-title').textContent = 'THE ORIGINAL SERVING';
    el('right-title').textContent = divided ? 'A DIFFERENT SLICE SIZE' : 'START WITH THE SAME PIE';
    showPies(task.from, right);
    lesson.className = 'lesson guided';
    lesson.innerHTML = `
      <div class="lesson-copy"><span class="eyebrow">EXAMPLE ${index + 1} OF ${EXAMPLES.length}</span>
        <h2 id="example-heading" tabindex="-1">${task.title}</h2>
        <p>${task.note}</p></div>
      <div class="equation" aria-label="${label(task.from)} ${matched ? 'equals' : relation > 0 ? 'is greater than' : 'is less than'} ${label(right)}">${label(task.from)} <span>${operator}</span> ${label(right)}</div>
      <div class="example-actions">
        <div class="serving-controls">${divided ? `
          <span>Try a serving:</span><button id="fewer" aria-label="Select one fewer slice" ${selected === 0 ? 'disabled' : ''}>−</button>
          <output aria-label="Selected slices">${selected} / ${task.to}</output>
          <button id="more" aria-label="Select one more slice" ${selected === task.to ? 'disabled' : ''}>+</button>
          <button id="match" class="primary">Show The Match</button>`
          : `<button id="divide" class="primary">${task.to > task.from.d ? `Cut Into ${task.to} Equal Slices` : `Group Into ${task.to} Equal Slices`} →</button>`}
        </div>
        <div class="step-nav"><button id="previous" ${index === 0 ? 'disabled' : ''}>← Back</button><button id="next" ${index === EXAMPLES.length - 1 ? 'disabled' : ''}>Next Example →</button></div>
      </div>
      <p class="feedback" role="status" aria-live="polite">${feedback}</p>
      ${divided ? '<span class="interaction-tip">Click a slice on the right pie to select that many consecutive slices, or use − and +. The muted part still belongs to the whole.</span>' : ''}`;
    if (focusId) (el(focusId) && !el(focusId).disabled ? el(focusId) : el('example-heading')).focus({ preventScroll: true });
  }

  function reset() { divided = false; selected = 0; }
  lesson.addEventListener('click', event => {
    if (!active) return;
    const id = event.target.closest('button')?.id;
    const task = EXAMPLES[index];
    if (id === 'next' && index < EXAMPLES.length - 1) { index++; reset(); }
    else if (id === 'previous' && index > 0) { index--; reset(); }
    else if (id === 'divide' || id === 'match') { divided = true; selected = convert(task.from, task.to).n; }
    else if (id === 'more') selected = Math.min(task.to, selected + 1);
    else if (id === 'fewer') selected = Math.max(0, selected - 1);
    else return;
    render(id === 'divide' ? 'match' : id);
  });
  window.addEventListener('pie-select', event => {
    if (!active || !divided) return;
    selected = Math.min(EXAMPLES[index].to, event.detail);
    render();
  });
  return {
    open() { active = true; render(); },
    close() { active = false; },
  };
}
