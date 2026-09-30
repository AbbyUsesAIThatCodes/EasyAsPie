import './style.css';
import {STORAGE_KEY,encodeProgress,decodeProgress} from './progress.js';
import {createDrawerCue,settleDrawerCue,tickDrawerCue} from './drawer-cue.js';
import { FREE_INSTRUCTION, pieName } from './presentation.js';
import { RECIPES, createBakery } from './pies.js';
import { createFreePlay, applyFreePlayAction } from './free-play.js';
import { previewState, fixtureNames } from './preview-fixtures.js';
import { createLearningModes } from './learning-modes.js';

// Only accepted actions replace this snapshot. Emphasis and view state are separate.
const params = new URLSearchParams(location.search);
const fixture = params.get('preview');
const modelReview = params.get('review') === 'solids';
let state = fixture ? previewState(fixture) : createFreePlay();
let busy = false, actionEpoch = 0, modeController = null;
let storageReady=false,storageBlocked=false,saveTimer=null;
const canPersist=!fixture&&!modelReview;
const fixtureName = Object.hasOwn(fixtureNames, fixture) ? fixtureNames[fixture] : null;
const pairs = ['A', 'B'];
let flavors = { A: 'blueberry', B: 'blueberry' };
const name = pair => pieName(document.body.dataset.mode || 'free',pair);
const fractionText = f => `${f.n}/${f.d}`;
const countText = f => `${f.n} of ${f.d} equal pieces selected`;
const el = id => document.getElementById(id);
const pieceName = (pair, k) => `${name(pair)}, piece ${k} of ${state[pair].d}, ${k <= state[pair].n ? 'selected' : 'not selected'}. Select the first ${k} pieces.`;
const pieceButtons = (pair, kind) => Array.from({ length: state[pair].d }, (_, i) =>
  `<button type="button" class="${kind === 'bar' ? 'bar-segment' : 'pie-choice'}" data-pair="${pair}" data-piece="${i + 1}" tabindex="${i === 0 ? 0 : -1}" aria-label="${pieceName(pair, i + 1)}">${kind === 'bar' ? '<span class="selection-mark" aria-hidden="true">●</span>' : `${name(pair)} · Piece ${i + 1} of ${state[pair].d} · Select`}</button>`).join('');
function pieLabel(pair) {
  return `<section class="pie-label" id="label-${pair}" aria-labelledby="title-${pair}"><h2 id="title-${pair}">${name(pair)}</h2><strong class="fraction"></strong><span class="count" id="count-${pair}"></span>
    <div class="serving-controls" role="group" aria-label="${name(pair)} Serving Controls" aria-describedby="count-${pair}">${['clear', 'decrease', 'increase'].map(type => `<button type="button" data-action="${type}" data-pair="${pair}" aria-label="${type[0].toUpperCase() + type.slice(1)} ${name(pair)} Serving">${type === 'clear' ? 'Clear' : type === 'decrease' ? '−' : '+'}</button>`).join('')}</div><label class="flavor-control">Flavor <select data-flavor="${pair}" aria-label="${name(pair)} Flavor">${Object.entries(RECIPES).map(([key,r])=>`<option value="${key}">${r.name}</option>`).join('')}</select></label><div class="transform-controls">${['cut','regroup'].map(type => `<button type="button" data-action="${type}" data-pair="${pair}">${type === 'cut' ? '✂ Cut' : '↶ Regroup'}</button>`).join('')}</div></section>`;
}
function bar(pair) {
  return `<figure class="bar-pair"><figcaption><span class="pie-name" data-pair="${pair}">${name(pair)}</span> <span>·</span> <strong id="bar-fraction-${pair}"></strong></figcaption>
    <div class="fraction-bar" id="bar-${pair}" role="toolbar" aria-label="${name(pair)} Bar Pieces" aria-describedby="keyboard-help" style="--pieces:${state[pair].d}">${pieceButtons(pair, 'bar')}</div></figure>`;
}

document.querySelector('#app').innerHTML = `
  <header class="header">
    <a class="brand" href="./" aria-label="EasyAsPie Home"><span>EasyAs<span class="brand-pie">Pie</span></span><small>The Fraction Bakery</small></a>
    <nav class="modes" aria-label="Game Modes"><button type="button" class="active" aria-pressed="true" id="free-play">Free Play</button><button type="button" disabled>Learn <small>Coming Later</small></button><button type="button" disabled>Challenge <small>Coming Later</small></button></nav>
    <div class="view-controls"><button id="reset" type="button">Reset Mode</button><button id="orbit-left" type="button" aria-label="Orbit Camera Left">↶</button><button id="orbit-right" type="button" aria-label="Orbit Camera Right">↷</button><button id="view" type="button" aria-pressed="false">Top View</button><button id="fullscreen" type="button">Full Screen ↗</button></div>
  </header>
  <main>
    <div class="preview-note"><h1>${modelReview ? 'Model Review · Separated Solids' : fixtureName ? `${fixtureName} Test Fixture` : 'Free Play Preview'}</h1><p>${modelReview ? 'Static geometry inspection. Serving amounts are unchanged.' : FREE_INSTRUCTION}</p></div>
    <section class="bakery" aria-label="Equal-sized pies and their fraction bars">
      <div class="stage">

        <canvas id="scene" role="img"></canvas>
        ${pairs.map(pair => `<div class="pie-choices" id="pie-${pair}" role="toolbar" aria-label="${name(pair)} Pieces" aria-describedby="keyboard-help">${pieceButtons(pair, 'pie')}</div>`).join('')}
        <p id="piece-hint" aria-hidden="true" hidden></p>
        <p id="scene-error" role="status" hidden>The 3D view is unavailable. Please use a browser with WebGL 2 enabled. You can still select servings with the controls and fraction bars.</p>
      </div>
      <div class="pie-labels">${pairs.map(pieLabel).join('')}</div>
      <div class="legend"><p><span class="selected-key" aria-hidden="true"></span>Solid outline / ● = selected <span class="legend-separator">·</span> Dashed outline = piece in focus</p><p id="keyboard-help">Tab to a pie or bar. Arrow keys, Home, or End explore pieces; Enter or Space selects. Clear selects zero.</p></div>
      <p id="action-feedback" class="action-feedback" role="status" aria-live="polite">Drag the background to orbit. The outline keeps the whole and serving in view.</p><p id="announcement" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></p>
      <div class="drawer" id="drawer">
        <div class="drawer-front"><h2>Fraction Bars</h2><span class="drawer-handle" aria-hidden="true"></span><button id="drawer-toggle" type="button" aria-label="Open Fraction Bars" title="Open Fraction Bars" aria-expanded="false" aria-controls="fraction-bars"><span class="sr-only">Open Fraction Bars</span></button></div>
        <div class="drawer-reveal" id="fraction-bars" role="region" aria-label="Fraction Bars" aria-hidden="true" inert><div class="drawer-clip"><div class="drawer-tray">${pairs.map(bar).join('')}</div></div></div>
      </div>
    </section>
  </main>
  <footer><div class="local-progress"><span id="save-status" role="status" title="Saved on this browser and device until you clear it. No account or upload.">Work Stays In This Browser</span><button id="clear-saved-work" type="button" aria-label="Clear Saved Work And Restart" title="Clear all saved pie work and restart">Clear Saved Work</button></div><div class="build-identity"><span>Build</span><code id="build-identity"></code></div></footer>`;

el('build-identity').textContent = __BUILD_IDENTITY__.id;
let bakery, focusPiece = null, hoverPiece = null;
let drawerCue=createDrawerCue(),drawerIntent=null;
const cue=document.createElement('div');cue.id='drawer-cue';cue.hidden=true;cue.setAttribute('aria-hidden','true');cue.innerHTML='<span class="cue-sparkle">✦</span><span class="cue-arrow">↓</span><span class="cue-sparkle">✧</span>';el('drawer').append(cue);
setInterval(()=>{const result=tickDrawerCue(drawerCue,{now:Date.now(),enabled:!el('drawer-toggle').disabled,visible:!document.hidden});drawerCue=result.state;cue.hidden=!result.show;el('drawer-toggle').dataset.quietUntil=String(drawerCue.quietUntil);},100);
document.addEventListener('visibilitychange',()=>{if(document.hidden){drawerCue={...drawerCue,lastTime:null};cue.hidden=true;}});
const samePiece = (a, b) => a?.pair === b?.pair && a?.k === b?.k;
function emphasize() {
  // The most recent pointer/keyboard modality wins; neither ever changes n/d.
  const candidate = busy ? null : hoverPiece || focusPiece;
  const piece = candidate && candidate.k >= 1 && candidate.k <= state[candidate.pair].d ? candidate : null;
  document.querySelectorAll('[data-piece]').forEach(button => {
    button.classList.toggle('emphasized', Boolean(piece && button.dataset.pair === piece.pair && Number(button.dataset.piece) === piece.k));
  });
  bakery?.emphasize(piece);
  el('piece-hint').hidden = !piece;
  if (piece) el('piece-hint').textContent = `${name(piece.pair)} · Piece ${piece.k} of ${state[piece.pair].d} · Select to serve the first ${piece.k}`;
}
function hover(piece) { if (busy) piece = null; if (!samePiece(hoverPiece, piece)) { hoverPiece = piece; emphasize(); } }
function render() {
  for (const pair of pairs) {
    el('title-'+pair).textContent=name(pair);
    document.querySelector('.pie-name[data-pair="'+pair+'"]').textContent=name(pair);
    el('pie-'+pair).setAttribute('aria-label',name(pair)+' Pieces');
    el('bar-'+pair).setAttribute('aria-label',name(pair)+' Bar Pieces');
    document.querySelector('[data-flavor="'+pair+'"]').setAttribute('aria-label',name(pair)+' Flavor');
    el('label-'+pair).querySelector('.serving-controls').setAttribute('aria-label',name(pair)+' Serving Controls');
    const f = state[pair];
    for (const kind of ['pie','bar']) {
      const group = el(kind+'-'+pair);
      if (group.children.length !== f.d) {
        const focused = group.contains(document.activeElement);
        const k = Math.min(f.d, Number(document.activeElement?.dataset.piece) || 1);
        group.innerHTML = pieceButtons(pair,kind); group.style.setProperty('--pieces', f.d);
        bindPieceControls();
        if (focused) group.querySelector('[data-piece="'+k+'"]').focus();
      }
    }
    el(`label-${pair}`).querySelector('.fraction').textContent = fractionText(f);
    el(`label-${pair}`).querySelector('.count').textContent = countText(f);
    el(`bar-fraction-${pair}`).textContent = fractionText(f);
    document.querySelectorAll(`[data-piece][data-pair="${pair}"]`).forEach(button => {
      const k = Number(button.dataset.piece);
      button.classList.toggle('selected', k <= f.n);
      button.setAttribute('aria-label', pieceName(pair, k));
      if(button.classList.contains('pie-choice'))button.textContent=name(pair)+' — Piece '+k+' of '+f.d+' — Select';
    });
    document.querySelectorAll(`[data-action][data-pair="${pair}"]`).forEach(button => {
      button.setAttribute('aria-label',button.dataset.action+' '+name(pair)+' Serving');
      const disabled = ['cut','regroup'].includes(button.dataset.action) ? false : button.dataset.action === 'increase' ? f.n === f.d : f.n === 0;
      // Keep the just-operated control focused at a boundary, with disabled semantics.
      button.setAttribute('aria-disabled', String(disabled));
    });
  }
  el('scene').setAttribute('aria-label', document.body.dataset.mode === 'challenge' ? `Customer Pie: ${countText(state.B)}. The target fraction is written in the order.` : `Two same-sized pies. ${name('A')}: ${countText(state.A)}. ${name('B')}: ${countText(state.B)}. Use the Pie Pieces controls to select a serving.`);
  bakery?.update(state.A, state.B, [flavors.A,flavors.B]);
  emphasize();
}
function feedback(message) {
  el('action-feedback').textContent = message;
  if (modeController?.getMode() !== 'free' && modeController) document.querySelector('.preview-note p').textContent = message;
}
async function act(action, demonstration = false) {
  if (!demonstration && modeController && !modeController.beforeAction(action)) return;
  if (busy) { feedback('The slices are moving. Wait for them to settle, or choose Reset.'); return; }
  const result = applyFreePlayAction(state, action);
  if (!result.ok) { feedback(result.reason.message); return; }
  const from = state[action.pair], to = result.state[action.pair];
  const token = ++actionEpoch;
  if (from.d !== to.d) {
    busy = true; hoverPiece = null; focusPiece = null; emphasize();
    el('app').setAttribute('aria-busy','true');document.querySelectorAll('[data-flavor]').forEach(e=>e.disabled=true);
    feedback(name(action.pair)+': '+fractionText(from)+' → '+fractionText(to)+'. The same serving; '+(action.type==='cut'?'smaller':'larger')+' equal pieces.');
    await bakery?.transform(action.pair, action.type, from, to);
    if (token !== actionEpoch) return;
    busy = false; el('app').setAttribute('aria-busy','false');document.querySelectorAll('[data-flavor]').forEach(e=>e.disabled=false);
  }
  if (from.d !== to.d) { hoverPiece = null; focusPiece = null; }
  state = result.state; render();
  modeController?.onState(state);changed();
  if (from.d !== to.d) feedback(name(action.pair)+': '+fractionText(from)+' = '+fractionText(to)+'. Same amount, '+to.d+' equal pieces in the whole.');
  el('announcement').textContent = name(action.pair)+': '+countText(state[action.pair])+', '+fractionText(state[action.pair])+' of the whole. Pie and bar match.';
}
function loadState(next) {
  ++actionEpoch; bakery?.cancelTransformation(); busy = false;
  el('app').setAttribute('aria-busy','false');document.querySelectorAll('[data-flavor]').forEach(e=>e.disabled=false);
  state = createFreePlay(next); hoverPiece = null; focusPiece = null; render();
}
function resetGame() {
  ++actionEpoch; bakery?.cancelTransformation(); busy = false;
  el('app').setAttribute('aria-busy','false');document.querySelectorAll('[data-flavor]').forEach(e=>e.disabled=false);
  state = createFreePlay(); hoverPiece = null; focusPiece = null; render();
  bakery?.resetCamera(); el('view').setAttribute('aria-pressed','false'); el('view').textContent='Top View';
  changed();feedback('Reset: Test Pie 1 is 1/2 and Test Pie 2 is 2/4. Both servings are the same amount.');
}
const showSceneError = () => { el('scene-error').hidden = false; el('view').disabled = true; document.querySelector('.bakery').classList.add('scene-unavailable'); };
el('scene').addEventListener('scene-error', showSceneError);
function placeControls({ labels, bars, drawer, handle, moving, drawerValue, viewValue }) {
  Object.assign(el('drawer-toggle').style,{left:handle.x+'px',top:handle.y+'px',width:Math.max(44,handle.width)+'px'});
  Object.assign(cue.style,{left:handle.x+'px',top:(handle.y-57)+'px'});
  if(drawerIntent && !moving && drawerValue===Number(drawerIntent.open)){if(drawerIntent.user!==null)drawerCue=settleDrawerCue(drawerCue,drawerIntent.open,drawerIntent.user,Date.now());drawerIntent=null;cue.hidden=true;changed();}
  el('scene').dataset.moving = String(moving);
  el('scene').dataset.drawerProgress = String(drawerValue);
  el('scene').dataset.viewProgress = String(viewValue);
  // Labels/native targets are usable once the tiles have cleared the counter.
  // During travel, only the actual 3D drawer moves through the scene.
  const barsReady = el('drawer-toggle').getAttribute('aria-expanded') === 'true' && drawerValue >= 0.999;
  el('fraction-bars').style.visibility = barsReady ? 'visible' : 'hidden';
  el('fraction-bars').inert = !barsReady;
  el('fraction-bars').setAttribute('aria-hidden', String(!barsReady));
  for (const p of labels) {
    const label = el(`label-${p.pair}`), choices = el(`pie-${p.pair}`);
    label.style.left = `${p.x}px`; label.style.top = `${innerWidth < 700 ? Math.max(215, p.y - 235) : p.y - (document.body.dataset.mode==='free'?55:20)}px`;
    choices.style.left = `${p.x}px`; choices.style.top = `${p.y - (innerWidth < 700 ? 29 : 70)}px`;
  }
  for (const r of bars) {
    const figure = el(`bar-${r.pair}`).parentElement;
    Object.assign(figure.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.width}px`, transformOrigin: '0 0', transform: `matrix(1,${r.shearY},${r.shearX},1,0,0)` });
    el(`bar-${r.pair}`).style.height = `${r.height}px`;
  }
  document.querySelector('.drawer-front').style.top = `${drawer.y - 18}px`;
}
try { bakery = createBakery(el('scene'), { onLayout: placeControls, modelReview }); }
catch (error) { showSceneError(); console.warn('3D view unavailable:', error.message); }
setDrawer(false,false);render();

const pieceOf = button => ({ pair: button.dataset.pair, k: Number(button.dataset.piece) });
function bindPieceControls() { document.querySelectorAll('[data-piece]').forEach(button => {
  if (button.dataset.bound) return;
  button.dataset.bound = 'true';
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
}); }
bindPieceControls();
el('reset').addEventListener('click', () => modeController?.getMode() === 'free' ? resetGame() : modeController?.reset());
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
  if (dragged) return;
  const piece = bakery?.pick(event.clientX, event.clientY);
  if (piece) {
    // Prevent an old bar/keyboard focus from re-emphasizing an unrelated piece.
    if (document.activeElement?.matches('[data-piece]')) document.activeElement.blur();
    hover(piece);
    act({ ...piece, type: 'select' });
  }
});
let dragStart = null, dragged = false;
el('scene').addEventListener('pointerdown', event => { dragStart = { x: event.clientX, y: event.clientY }; dragged = false; });
el('scene').addEventListener('pointermove', event => {
  if (!dragStart || !event.buttons) return;
  const dx = event.clientX - dragStart.x, dy = event.clientY - dragStart.y;
  if (dragged || Math.hypot(dx, dy) > 6) { dragged = true; hover(null); bakery?.orbit(-dx * 0.003, dy * 0.003); dragStart = { x: event.clientX, y: event.clientY }; }
});
window.addEventListener('pointerup', () => { dragStart = null; });
el('scene').addEventListener('pointercancel', () => { dragStart = null; dragged = false; });
el('orbit-left').addEventListener('click', () => bakery?.orbit(-0.08));
el('orbit-right').addEventListener('click', () => bakery?.orbit(0.08));
function setDrawer(open,user=true) {
  if(open && document.body.dataset.mode === 'challenge') return;
  if (!open && el('fraction-bars').contains(document.activeElement)) el('drawer-toggle').focus();
  drawerIntent={open,user};
  hoverPiece = null;
  el('drawer-toggle').setAttribute('aria-expanded', String(open));
  el('drawer-toggle').innerHTML=`<span class="sr-only">${open?'Close':'Open'} Fraction Bars</span>`;el('drawer-toggle').setAttribute('aria-label',`${open?'Close':'Open'} Fraction Bars`);el('drawer-toggle').title=`${open?'Close':'Open'} Fraction Bars`;
  el('drawer-toggle').setAttribute('aria-label',`${open?'Close':'Open'} Fraction Bars`);
  el('drawer-toggle').title=`${open?'Close':'Open'} Fraction Bars`;
  el('fraction-bars').setAttribute('aria-hidden', 'true');
  el('fraction-bars').inert = true;
  el('drawer').classList.toggle('open', open);
  if (bakery) bakery.setDrawer(open);
  else { el('fraction-bars').inert = !open; el('fraction-bars').setAttribute('aria-hidden', String(!open));drawerCue=settleDrawerCue(drawerCue,open,user,Date.now());drawerIntent=null; }
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
window.addEventListener('pagehide', event => { if (!event.persisted) { saveProgress();++actionEpoch;modeController?.suspend();bakery?.dispose(); } });
function setMode(mode) {
  const locked=mode==='challenge';document.querySelector('.bakery').setAttribute('aria-label',locked?'Customer Pie And Written Order':'Equal-Sized Pies And Their Fraction Bars');
  el('label-A').hidden=locked;el('pie-A').hidden=locked;el('pie-A').inert=locked;
  if(locked){setDrawer(false,false);cue.hidden=true;drawerCue={...drawerCue,opened:false,lastTime:null};}
  el('drawer-toggle').disabled=locked;el('drawer-toggle').title=locked?'Fraction bars are closed for this order.':'';
  bakery?.setMode(mode);bakery?.setExampleVisible(!locked);hoverPiece=null;focusPiece=null;render();
}
for(const select of document.querySelectorAll('[data-flavor]'))select.addEventListener('change',()=>{if(busy)return;flavors={...flavors,[select.dataset.flavor]:select.value};render();changed();});
modeController = createLearningModes({ identity:__BUILD_IDENTITY__,changed,setMode, getState: () => state, loadState, act, feedback, setFeedback: tone => bakery?.setFeedback('B',tone) });

function progressSnapshot(){return {...modeController.snapshot(),flavors,drawer:{open:el('drawer-toggle').getAttribute('aria-expanded')==='true',opened:drawerCue.opened&&el('drawer-toggle').getAttribute('aria-expanded')==='true',quietUntil:drawerCue.quietUntil}};}
function saveProgress(){
 clearTimeout(saveTimer);if(!storageReady||storageBlocked||!canPersist)return;
 try{localStorage.setItem(STORAGE_KEY,encodeProgress(progressSnapshot(),__BUILD_IDENTITY__));el('save-status').textContent='Saved Only In This Browser';}
 catch(error){el('save-status').textContent='Could Not Save — Keep This Page Open';console.warn('Local progress could not be saved:',error.message);}
}
function changed(){if(storageReady&&!storageBlocked&&canPersist){clearTimeout(saveTimer);saveTimer=setTimeout(saveProgress,100);}}
if(canPersist){
 try{
  const text=localStorage.getItem(STORAGE_KEY);
  if(text){
   const saved=decodeProgress(text).state;flavors=saved.flavors;for(const pair of pairs)document.querySelector('[data-flavor="'+pair+'"]').value=flavors[pair];
   modeController.restore(saved);drawerCue=createDrawerCue(saved.drawer);setDrawer(saved.drawer.open,null);
   el('save-status').textContent='Restored — Saved Only In This Browser';
  }
 }catch(error){storageBlocked=true;el('save-status').textContent='Saved Work Could Not Be Restored — Clear To Start Fresh';console.warn('Saved work retained without overwriting:',error.message);}
 storageReady=true;if(!storageBlocked)changed();
}else el('save-status').textContent='Review Fixture — Saving Is Off';
el('clear-saved-work').addEventListener('click',()=>{
 try{localStorage.removeItem(STORAGE_KEY);storageReady=false;clearTimeout(saveTimer);location.reload();}
 catch{el('save-status').textContent='Could Not Clear Browser Storage';}
});
window.addEventListener('pagehide',saveProgress);
document.addEventListener('visibilitychange',()=>{if(document.hidden)saveProgress();});
