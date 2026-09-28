import { CHALLENGES } from './exercises.js';
import { fraction, label } from './fractions.js';
import { createSession, currentTask, selectSlices, markAssisted, useHint, submit, advance } from './session.js';

export function createChallenge({ el, showPies }) {
  let state = createSession(), active = false;
  const lesson = el('lesson');
  function render(focusId) {
    const task = currentTask(state);
    el('left-title').textContent = 'MATCH THIS SERVING';
    el('right-title').textContent = 'YOUR SERVING';
    showPies(task.from, fraction(state.selected, task.to));
    lesson.className = 'lesson guided challenge';
    if (state.complete) {
      const firstTry = state.results.filter(r => r.firstTry).length;
      const supported = state.results.filter(r => r.assisted).length;
      const retries = state.results.filter(r => r.attempts > 1).length;
      lesson.innerHTML = `<div class="lesson-copy"><span class="eyebrow">BAKERY ROUND COMPLETE</span><h2 id="challenge-heading" tabindex="-1">Ten Matches. One Big Idea.</h2>
        <p>Different slice sizes can describe the same amount of the same-sized whole.</p></div>
        <div class="equation">10 <span>/</span> 10</div>
        <div class="results"><span><strong>${firstTry}</strong> first-try matches without help</span><span><strong>${supported}</strong> tasks with a hint or example visit</span><span><strong>${retries}</strong> tasks solved after retrying</span></div>
        <p class="feedback">This is practice with pictures. Next, explain a match in your own words and try the equivalent fractions on a real ruler.</p>
        <div class="example-actions"><button id="restart" class="primary">Bake Another Round ↻</button><span class="interaction-tip">The same ten prompts repeat. Your progress is kept only while this page is open.</span></div>`;
      el('announcement').textContent = `Round complete. ${firstTry} first-try matches without help out of ten.`;
    } else {
      const feedback = state.feedback || `Select ${task.to === 16 ? 'sixteenth' : task.to === 8 ? 'eighth' : 'quarter'} slices to match ${label(task.from)}. Check your serving when you are ready.`;
      lesson.innerHTML = `<div class="lesson-copy"><span class="eyebrow">CHALLENGE ${state.index + 1} OF ${CHALLENGES.length} · TAKE YOUR TIME</span>
        <h2 id="challenge-heading" tabindex="-1">Serve The Same Amount.</h2><p>How many of the ${task.to} equal slices match ${label(task.from)} of a pie?</p></div>
        <div class="equation" aria-label="${label(task.from)} equals how many over ${task.to}?">${label(task.from)} <span>=</span> ${state.solved ? state.selected : '?'}/${task.to}</div>
        <div class="example-actions"><div class="serving-controls"><span>Your slices:</span>
          <button id="challenge-fewer" aria-label="Select one fewer slice" ${state.solved || state.selected === 0 ? 'disabled' : ''}>−</button>
          <output aria-label="Selected slices">${state.selected} / ${task.to}</output>
          <button id="challenge-more" aria-label="Select one more slice" ${state.solved || state.selected === task.to ? 'disabled' : ''}>+</button>
          <button id="check" class="primary" ${state.solved ? 'disabled' : ''}>Check My Serving</button>
        </div><div class="step-nav"><button id="hint" ${state.solved ? 'disabled' : ''}>A Little Hint</button><button id="continue" ${!state.solved ? 'disabled' : ''}>${state.index === CHALLENGES.length - 1 ? 'See My Round' : 'Next Challenge'} →</button></div></div>
        <p class="feedback ${state.solved ? 'correct' : ''}" role="status">${feedback}</p>
        <span class="interaction-tip">Click a right-hand slice to select that many consecutive slices, or use − and +. Hints and example visits count as help for this task.</span>`;
      el('announcement').textContent = feedback;
    }
    if (focusId) (el(focusId) && !el(focusId).disabled ? el(focusId) : el('challenge-heading')).focus({ preventScroll: true });
  }
  lesson.addEventListener('click', event => {
    if (!active) return;
    const id = event.target.closest('button')?.id;
    if (id === 'challenge-more') state = selectSlices(state, Math.min(currentTask(state).to, state.selected + 1));
    else if (id === 'challenge-fewer') state = selectSlices(state, Math.max(0, state.selected - 1));
    else if (id === 'check') state = submit(state);
    else if (id === 'hint') state = useHint(state);
    else if (id === 'continue') state = advance(state);
    else if (id === 'restart') state = createSession();
    else return;
    render(id === 'check' && state.solved ? 'continue' : id === 'continue' || id === 'restart' ? 'challenge-heading' : id);
  });
  window.addEventListener('pie-select', event => {
    if (!active || state.solved || state.complete) return;
    state = selectSlices(state, Math.min(currentTask(state).to, event.detail));
    render();
  });
  return {
    open() { active = true; render(); },
    close() { if (active) state = markAssisted(state); active = false; },
  };
}
