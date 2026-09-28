import './style.css';
import { createBakery } from './pies.js';
import { createFreePlay } from './free-play.js';
import { previewState } from './preview-fixtures.js';

// One mathematical snapshot feeds every representation. View state never writes it.
const fixture = new URLSearchParams(location.search).get('preview');
const state = fixture ? previewState(fixture) : createFreePlay();
const fixtureName = fixture === 'sixteenths' ? 'Sixteenths' : fixture === 'empty-whole' ? 'Empty And Whole' : null;
const pairs = ['A', 'B'];
const fractionText = f => `${f.n}/${f.d}`;
const countText = f => `${f.n} of ${f.d} equal pieces selected`;
const el = id => document.getElementById(id);

function pieLabel(pair) {
  const f = state[pair];
  return `<div class="pie-label" id="label-${pair}"><h2>Pie ${pair}</h2><strong class="fraction">${fractionText(f)}</strong><span>${countText(f)}</span></div>`;
}
function bar(pair) {
  const f = state[pair];
  return `<figure class="bar-pair"><figcaption>Pie ${pair} <span>·</span> <strong>${fractionText(f)}</strong></figcaption>
    <div class="fraction-bar" id="bar-${pair}" role="img" aria-label="Pie ${pair} fraction bar: ${countText(f)}." style="--pieces:${f.d}">
      ${Array.from({ length: f.d }, (_, i) => `<span class="bar-segment${i < f.n ? ' selected' : ''}" aria-hidden="true">${i < f.n ? '<span class="selection-mark">●</span>' : ''}</span>`).join('')}
    </div></figure>`;
}

document.querySelector('#app').innerHTML = `
  <header class="header">
    <a class="brand" href="./" aria-label="EasyAsPie Home"><span>EasyAs<span class="brand-pie">Pie</span></span><small>The Fraction Bakery</small></a>
    <nav class="modes" aria-label="Game Modes"><button type="button" class="active" aria-pressed="true" id="free-play">Free Play</button><button type="button" disabled>Learn <small>Coming Later</small></button><button type="button" disabled>Challenge <small>Coming Later</small></button></nav>
    <div class="view-controls"><button id="view" type="button" aria-pressed="false">Top View</button><button id="fullscreen" type="button">Full Screen ↗</button></div>
  </header>
  <main>
    <div class="preview-note"><h1>${fixtureName ? `${fixtureName} Test Fixture` : 'Free Play Visual Preview'}</h1><p>Serving selection, Cut, and Regroup are coming next.</p></div>
    <section class="bakery" aria-label="Two equal blueberry pies and their fraction bars">
      <div class="stage">
        <div class="kitchen" aria-hidden="true"><div class="window"><i></i><i></i><i></i><i></i></div><div class="shelf"><i class="jar"></i><i class="jar berry-jar"></i><i class="bowl"></i><i class="jar tall"></i></div><div class="cabinet cabinet-left"></div><div class="cabinet cabinet-right"></div></div>
        <canvas id="scene" role="img" aria-label="Two same-sized blueberry pies. Pie A: ${countText(state.A)}. Pie B: ${countText(state.B)}."></canvas>
        <p id="scene-error" role="status" hidden>The 3D view is unavailable. Please use a browser with WebGL 2 enabled. The fraction labels and drawer bars still show both servings.</p>
      </div>
      <div class="pie-labels">${pairs.map(pieLabel).join('')}</div>
      <p class="legend"><span class="selected-key" aria-hidden="true"></span>Outlined pieces are selected<span class="legend-separator">·</span>Same-sized pies. Equal-length bars.</p>
      <div class="drawer" id="drawer">
        <div class="drawer-reveal" id="fraction-bars" role="region" aria-label="Fraction Bars" aria-hidden="true" inert><div class="drawer-clip"><div class="drawer-tray">${pairs.map(bar).join('')}</div></div></div>
        <div class="drawer-front"><h2>Fraction Bars</h2><span class="drawer-handle" aria-hidden="true"></span><button id="drawer-toggle" type="button" aria-expanded="false" aria-controls="fraction-bars">Show Fraction Bars <span aria-hidden="true">⌄</span></button></div>
      </div>
    </section>
  </main>
  <footer><span class="footer-note">Same amount. Different slices.</span><div class="build-identity"><span>Build</span><code id="build-identity"></code></div></footer>`;

el('build-identity').textContent = __BUILD_IDENTITY__.id;
let bakery;
const showSceneError = () => { el('scene-error').hidden = false; el('view').disabled = true; };
el('scene').addEventListener('scene-error', showSceneError);
try {
  bakery = createBakery(el('scene'));
  bakery.update(state.A, state.B);
} catch (error) {
  showSceneError();
  console.warn('3D view unavailable:', error.message);
}

// Keep the only drawer control outside the collapsing region: focus survives
// open/close and interrupted transitions, including immediate reduced motion.
el('drawer-toggle').addEventListener('click', () => {
  const open = el('drawer-toggle').getAttribute('aria-expanded') !== 'true';
  el('drawer-toggle').setAttribute('aria-expanded', String(open));
  el('drawer-toggle').innerHTML = `${open ? 'Close' : 'Show'} Fraction Bars <span aria-hidden="true">${open ? '⌃' : '⌄'}</span>`;
  el('fraction-bars').setAttribute('aria-hidden', String(!open));
  el('fraction-bars').inert = !open;
  el('drawer').classList.toggle('open', open);
});
el('view').addEventListener('click', () => {
  const top = el('view').getAttribute('aria-pressed') !== 'true';
  el('view').setAttribute('aria-pressed', String(top));
  el('view').textContent = top ? 'Angled View' : 'Top View';
  bakery?.setTopView(top);
});
if (!document.fullscreenEnabled) el('fullscreen').hidden = true;
el('fullscreen').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { el('fullscreen').textContent = 'Full Screen Unavailable'; }
});
document.addEventListener('fullscreenchange', () => {
  el('fullscreen').textContent = document.fullscreenElement ? 'Exit Full Screen ↙' : 'Full Screen ↗';
});
window.addEventListener('pagehide', event => { if (!event.persisted) bakery?.dispose(); });
