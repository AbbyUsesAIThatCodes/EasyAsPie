import './style.css';
import { createBakery } from './pies.js';
import { createFreePlay, applyFreePlayAction } from './free-play.js';
import { previewState, fixtureNames } from './preview-fixtures.js';

// Only accepted actions replace this snapshot. Emphasis and view state are separate.
const params = new URLSearchParams(location.search);
const fixture = params.get('preview');
const modelReview = params.get('review') === 'solids';
let state = fixture ? previewState(fixture) : createFreePlay();
const fixtureName = Object.hasOwn(fixtureNames, fixture) ? fixtureNames[fixture] : null;
const pairs = ['A', 'B'];
const fractionText = f => `${f.n}/${f.d}`;
const countText = f => `${f.n} of ${f.d} equal pieces selected`;
const el = id => document.getElementById(id);
const pieceName = (pair, k) => `Pie ${pair}, piece ${k} of ${state[pair].d}, ${k <= state[pair].n ? 'selected' : 'not selected'}. Select the first ${k} pieces.`;
const pieceButtons = (pair, kind) => Array.from({ length: state[pair].d }, (_, i) =>
  `<button type="button" class="${kind === 'bar' ? 'bar-segment' : 'pie-choice'}" data-pair="${pair}" data-piece="${i + 1}" tabindex="${i === 0 ? 0 : -1}" aria-label="${pieceName(pair, i + 1)}">${kind === 'bar' ? '<span class="selection-mark" aria-hidden="true">●</span>' : `Pie ${pair} · Piece ${i + 1} of ${state[pair].d} · Select`}</button>`).join('');
function pieLabel(pair) {
  return `<section class="pie-label" id="label-${pair}" aria-labelledby="title-${pair}"><h2 id="title-${pair}">Pie ${pair}</h2><strong class="fraction"></strong><span class="count" id="count-${pair}"></span>
    <div class="serving-controls" role="group" aria-label="Pie ${pair} Serving Controls" aria-describedby="count-${pair}">${['clear', 'decrease', 'increase'].map(type => `<button type="button" data-action="${type}" data-pair="${pair}" aria-label="${type[0].toUpperCase() + type.slice(1)} Pie ${pair} Serving">${type === 'clear' ? 'Clear' : type === 'decrease' ? '− Decrease' : '+ Increase'}</button>`).join('')}</div></section>`;
}
function bar(pair) {
  return `<figure class="bar-pair"><figcaption>Pie ${pair} <span>·</span> <strong id="bar-fraction-${pair}"></strong></figcaption>
    <div class="fraction-bar" id="bar-${pair}" role="toolbar" aria-label="Pie ${pair} Bar Pieces" aria-describedby="keyboard-help" style="--pieces:${state[pair].d}">${pieceButtons(pair, 'bar')}</div></figure>`;
}

document.querySelector('#app').innerHTML = `
  <header class="header">
    <a class="brand" href="./" aria-label="EasyAsPie Home"><span>EasyAs<span class="brand-pie">Pie</span></span><small>The Fraction Bakery</small></a>
    <nav class="modes" aria-label="Game Modes"><button type="button" class="active" aria-pressed="true" id="free-play">Free Play</button><button type="button" disabled>Learn <small>Coming Later</small></button><button type="button" disabled>Challenge <small>Coming Later</small></button></nav>
    <div class="view-controls"><button id="view" type="button" aria-pressed="false">Top View</button><button id="fullscreen" type="button">Full Screen ↗</button></div>
  </header>
  <main>
    <div class="preview-note"><h1>${modelReview ? 'Model Review · Separated Solids' : fixtureName ? `${fixtureName} Test Fixture` : 'Free Play Preview'}</h1><p>${modelReview ? 'Static geometry inspection. Serving amounts are unchanged.' : 'Select a piece to serve it and all pieces before it.'} <span>Cut And Regroup — Coming Later</span></p></div>
    <section class="bakery" aria-label="Two equal blueberry pies and their fraction bars">
      <div class="stage">

        <canvas id="scene" role="img"></canvas>
        ${pairs.map(pair => `<div class="pie-choices" id="pie-${pair}" role="toolbar" aria-label="Pie ${pair} Pieces" aria-describedby="keyboard-help">${pieceButtons(pair, 'pie')}</div>`).join('')}
        <p id="piece-hint" aria-hidden="true" hidden></p>
        <p id="scene-error" role="status" hidden>The 3D view is unavailable. Please use a browser with WebGL 2 enabled. You can still select servings with the controls and fraction bars.</p>
      </div>
      <div class="pie-labels">${pairs.map(pieLabel).join('')}</div>
      <div class="legend"><p><span class="selected-key" aria-hidden="true"></span>Solid outline / ● = selected <span class="legend-separator">·</span> Dashed outline = piece in focus</p><p id="keyboard-help">Tab to a pie or bar. Arrow keys, Home, or End explore pieces; Enter or Space selects. Clear selects zero.</p></div>
      <p id="announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
      <div class="drawer" id="drawer">
        <div class="drawer-front"><h2>Fraction Bars</h2><span class="drawer-handle" aria-hidden="true"></span><button id="drawer-toggle" type="button" aria-expanded="false" aria-controls="fraction-bars">Show Fraction Bars <span aria-hidden="true">⌄</span></button></div>
        <div class="drawer-reveal" id="fraction-bars" role="region" aria-label="Fraction Bars" aria-hidden="true" inert><div class="drawer-clip"><div class="drawer-tray">${pairs.map(bar).join('')}</div></div></div>
      </div>
    </section>
  </main>
  <footer><span class="footer-note">Same-sized pies. Equal-length bars.</span><div class="build-identity"><span>Build</span><code id="build-identity"></code></div></footer>`;

el('build-identity').textContent = __BUILD_IDENTITY__.id;
let bakery, focusPiece = null, hoverPiece = null;
const samePiece = (a, b) => a?.pair === b?.pair && a?.k === b?.k;
function emphasize() {
  // The most recent pointer/keyboard modality wins; neither ever changes n/d.
  const piece = hoverPiece || focusPiece;
  document.querySelectorAll('[data-piece]').forEach(button => {
    button.classList.toggle('emphasized', Boolean(piece && button.dataset.pair === piece.pair && Number(button.dataset.piece) === piece.k));
  });
  bakery?.emphasize(piece);
  el('piece-hint').hidden = !piece;
  if (piece) el('piece-hint').textContent = `Pie ${piece.pair} · Piece ${piece.k} of ${state[piece.pair].d} · Select to serve the first ${piece.k}`;
}
function hover(piece) { if (!samePiece(hoverPiece, piece)) { hoverPiece = piece; emphasize(); } }
function render() {
  for (const pair of pairs) {
    const f = state[pair];
    el(`label-${pair}`).querySelector('.fraction').textContent = fractionText(f);
    el(`label-${pair}`).querySelector('.count').textContent = countText(f);
    el(`bar-fraction-${pair}`).textContent = fractionText(f);
    document.querySelectorAll(`[data-piece][data-pair="${pair}"]`).forEach(button => {
      const k = Number(button.dataset.piece);
      button.classList.toggle('selected', k <= f.n);
      button.setAttribute('aria-label', pieceName(pair, k));
    });
    document.querySelectorAll(`[data-action][data-pair="${pair}"]`).forEach(button => {
      const disabled = button.dataset.action === 'increase' ? f.n === f.d : f.n === 0;
      // Keep the just-operated control focused at a boundary, with disabled semantics.
      button.setAttribute('aria-disabled', String(disabled));
    });
  }
  el('scene').setAttribute('aria-label', `Two same-sized blueberry pies. Pie A: ${countText(state.A)}. Pie B: ${countText(state.B)}. Use the Pie Pieces controls to select a serving.`);
  bakery?.update(state.A, state.B);
  emphasize();
}
function act(action) {
  const result = applyFreePlayAction(state, action);
  if (!result.ok) return;
  state = result.state;
  render();
  el('announcement').textContent = `Pie ${action.pair}: ${countText(state[action.pair])}, ${fractionText(state[action.pair])} of the whole. Pie and bar match.`;
}
const showSceneError = () => { el('scene-error').hidden = false; el('view').disabled = true; document.querySelector('.bakery').classList.add('scene-unavailable'); };
el('scene').addEventListener('scene-error', showSceneError);
function placeControls({ labels, bars, drawer, moving, drawerValue, viewValue }) {
  el('scene').dataset.moving = String(moving);
  el('scene').dataset.drawerProgress = String(drawerValue);
  el('scene').dataset.viewProgress = String(viewValue);
  for (const p of labels) {
    const label = el(`label-${p.pair}`), choices = el(`pie-${p.pair}`);
    label.style.left = `${p.x}px`; label.style.top = `${p.y}px`;
    choices.style.left = `${p.x}px`; choices.style.top = `${p.y - 29}px`;
  }
  for (const r of bars) {
    const figure = el(`bar-${r.pair}`).parentElement;
    Object.assign(figure.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.width}px` });
    el(`bar-${r.pair}`).style.height = `${r.height}px`;
  }
  document.querySelector('.drawer-front').style.top = `${drawer.y - 18}px`;
}
try { bakery = createBakery(el('scene'), { onLayout: placeControls, modelReview }); }
catch (error) { showSceneError(); console.warn('3D view unavailable:', error.message); }
render();

const pieceOf = button => ({ pair: button.dataset.pair, k: Number(button.dataset.piece) });
document.querySelectorAll('[data-piece]').forEach(button => {
  button.addEventListener('click', () => act({ ...pieceOf(button), type: 'select' }));
  button.addEventListener('focus', () => {
    hoverPiece = null;
    focusPiece = pieceOf(button);
    button.parentElement.querySelectorAll('button').forEach(b => { b.tabIndex = b === button ? 0 : -1; });
    emphasize();
  });
  button.addEventListener('blur', () => { focusPiece = null; emphasize(); });
  button.addEventListener('pointerenter', () => hover(pieceOf(button)));
  button.addEventListener('pointerleave', () => hover(null));
  button.addEventListener('keydown', event => {
    const buttons = [...button.parentElement.querySelectorAll('button')];
    const index = buttons.indexOf(button);
    const next = { ArrowRight: Math.min(index + 1, buttons.length - 1), ArrowDown: Math.min(index + 1, buttons.length - 1), ArrowLeft: Math.max(index - 1, 0), ArrowUp: Math.max(index - 1, 0), Home: 0, End: buttons.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    hoverPiece = null;
    buttons[next].focus();
    emphasize();
  });
});
document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => {
  if (button.getAttribute('aria-disabled') === 'true') return;
  act({ pair: button.dataset.pair, type: button.dataset.action });
}));
el('scene').addEventListener('pointermove', event => {
  const piece = bakery?.pick(event.clientX, event.clientY) || null;
  el('scene').style.cursor = piece ? 'pointer' : '';
  hover(piece);
});
el('scene').addEventListener('pointerleave', () => hover(null));
el('scene').addEventListener('pointercancel', () => hover(null));
el('scene').addEventListener('click', event => {
  const piece = bakery?.pick(event.clientX, event.clientY);
  if (piece) {
    // Prevent an old bar/keyboard focus from re-emphasizing an unrelated piece.
    if (document.activeElement?.matches('[data-piece]')) document.activeElement.blur();
    hover(piece);
    act({ ...piece, type: 'select' });
  }
});
function setDrawer(open) {
  if (!open && el('fraction-bars').contains(document.activeElement)) el('drawer-toggle').focus();
  hoverPiece = null;
  el('drawer-toggle').setAttribute('aria-expanded', String(open));
  el('drawer-toggle').innerHTML = `${open ? 'Close' : 'Show'} Fraction Bars <span aria-hidden="true">${open ? '⌃' : '⌄'}</span>`;
  el('fraction-bars').setAttribute('aria-hidden', String(!open));
  el('fraction-bars').inert = !open;
  el('drawer').classList.toggle('open', open);
  bakery?.setDrawer(open);
  emphasize();
}
el('drawer-toggle').addEventListener('click', () => setDrawer(el('drawer-toggle').getAttribute('aria-expanded') !== 'true'));
el('fraction-bars').addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); setDrawer(false); }
});
el('view').addEventListener('click', () => {
  const top = el('view').getAttribute('aria-pressed') !== 'true';
  el('view').setAttribute('aria-pressed', String(top));
  el('view').textContent = top ? 'Angled View' : 'Top View';
  hover(null);
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
  hover(null);
  el('fullscreen').textContent = document.fullscreenElement ? 'Exit Full Screen ↙' : 'Full Screen ↗';
});
window.addEventListener('resize', () => hover(null));
window.addEventListener('blur', () => hover(null));
window.addEventListener('pagehide', event => { if (!event.persisted) bakery?.dispose(); });
