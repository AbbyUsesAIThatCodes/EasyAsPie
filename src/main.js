import './style.css';
import { createExamples } from './examples.js';
import { createChallenge } from './challenge.js';
import { createBakery, RECIPES } from './pies.js';
import { fraction } from './fractions.js';

const pieIcon = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M19 4a16 16 0 1 0 17 17H19Z" fill="currentColor"/><path d="M23 3v14h14A16 16 0 0 0 23 3Z" fill="#dca55e"/><path d="m8 17 10 4-7 10m7-10 4 14" fill="none" stroke="#faf6ee" stroke-width="2"/></svg>';
export const fractionHTML = f => `<span class="fraction" aria-label="${f.n} out of ${f.d}"><span>${f.n}</span><span>${f.d}</span></span>`;

document.querySelector('#app').innerHTML = `
  <header class="header"><a class="brand" href="./">${pieIcon}<span>EasyAsPie<small>THE FRACTION BAKERY</small></span></a>
    <span class="course">Design And Modeling <span>·</span> 1.3 Measuring Matters</span>
    <button id="fullscreen" class="quiet" type="button">Full Screen ↗</button>
  </header>
  <div class="build-identity"><span>Build</span><code id="build-identity"></code></div>
  <div id="announcement" class="sr-only" aria-live="polite" aria-atomic="true"></div>
  <main>
    <div class="intro"><span class="eyebrow">FRESH FROM THE OVEN</span><h1>Different Slices. Same Delicious Pie.</h1><p>A little bakery for a big idea: different fractions can mean the same amount.</p></div>
    <div class="toolbar"><div id="modes" class="segmented"><button id="examples-mode" class="active" aria-pressed="true">01 · Examples</button><button id="challenge-mode" aria-pressed="false">02 · Challenge</button></div>
      <div class="preferences"><label for="recipe">Today’s Pie</label><select id="recipe">${Object.entries(RECIPES).map(([id,r])=>`<option value="${id}">${r.name}</option>`).join('')}</select><button id="view" class="quiet" type="button" aria-pressed="false">Top View</button></div>
    </div>
    <section class="bakery" aria-label="Two equal-sized pies">
      <div class="pie-labels"><div><span class="eyebrow" id="left-title">THE RECIPE</span><div id="left-fraction">${fractionHTML(fraction(1,2))}</div><span id="left-caption">1 of 2 equal slices</span></div><div class="same-whole">Same-Sized Wholes<span>More slices. Still one pie.</span></div><div><span class="eyebrow" id="right-title">ANOTHER WAY</span><div id="right-fraction">${fractionHTML(fraction(2,4))}</div><span id="right-caption">2 of 4 equal slices</span></div></div>
      <div class="stage"><canvas id="scene" aria-label="Half of the left pie and two quarters of the right pie are selected." role="img"></canvas><p id="scene-error" hidden>The 3D view is unavailable. Please use a browser with WebGL 2 enabled. Fraction controls remain available below.</p></div>
      <div class="legend"><span class="dot"></span> Selected serving <span class="dot muted"></span> Rest of the same pie</div>
    </section>
    <section id="lesson" class="lesson" aria-label="Fraction activity"><div><span class="eyebrow">THE BIG IDEA</span><h2>Same Pie. A Different Name.</h2><p>One half and two quarters cover the same amount of these equal-sized pies.</p></div><div class="equation">1/2 <span>=</span> 2/4</div></section>
    <footer><span>Equal pieces. Equal wholes. Endless possibilities.</span><span>Halves → Quarters → Eighths → Sixteenths</span></footer>
  </main>`;

export const el = id => document.getElementById(id);
el('build-identity').textContent = __BUILD_IDENTITY__.id;
let bakery;
const showSceneError = () => { el('scene-error').hidden = false; };
el('scene').addEventListener('scene-error', showSceneError);
try { bakery = createBakery(el('scene'), n => window.dispatchEvent(new CustomEvent('pie-select', { detail: n }))); }
catch (error) { showSceneError(); console.warn('3D view unavailable:', error.message); }
let left = fraction(1, 2), right = fraction(2, 4);
export function showPies(a, b) {
  left = a; right = b;
  el('left-fraction').innerHTML = fractionHTML(a);
  el('right-fraction').innerHTML = fractionHTML(b);
  el('left-caption').textContent = `${a.n} of ${a.d} equal slices`;
  el('right-caption').textContent = `${b.n} of ${b.d} equal slices`;
  el('scene').setAttribute('aria-label', `Two same-sized pies. Left: ${a.n} of ${a.d} equal slices selected. Right: ${b.n} of ${b.d} equal slices selected.`);
  bakery?.update(a, b, el('recipe').value);
}
el('recipe').addEventListener('change', () => showPies(left, right));
el('view').addEventListener('click', () => {
  const top = el('view').getAttribute('aria-pressed') !== 'true';
  el('view').setAttribute('aria-pressed', String(top));
  el('view').textContent = top ? 'Angled View' : 'Top View';
  bakery?.setTopView(top);
});
if (!document.fullscreenEnabled) el('fullscreen').hidden = true;
el('fullscreen').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { el('fullscreen').textContent = 'Full Screen Unavailable'; }
});
document.addEventListener('fullscreenchange', () => { el('fullscreen').textContent = document.fullscreenElement ? 'Exit Full Screen ↙' : 'Full Screen ↗'; });
window.addEventListener('pagehide', event => { if (!event.persisted) bakery?.dispose(); });
showPies(left, right);

const examples = createExamples({ el, showPies });
const challenge = createChallenge({ el, showPies });
let currentMode;
function setMode(mode) {
  if (mode === currentMode) return;
  currentMode = mode;
  examples.close(); challenge.close();
  for (const name of ['examples', 'challenge']) {
    el(`${name}-mode`).classList.toggle('active', name === mode);
    el(`${name}-mode`).setAttribute('aria-pressed', String(name === mode));
  }
  (mode === 'examples' ? examples : challenge).open();
}
el('examples-mode').addEventListener('click', () => setMode('examples'));
el('challenge-mode').addEventListener('click', () => setMode('challenge'));
setMode('examples');
