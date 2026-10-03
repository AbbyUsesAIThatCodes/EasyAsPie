import './style.css';
import './beginner.css';
import {RECIPES,createBakery} from './pies.js';
import {createFreePlay,applyFreePlayAction} from './free-play.js';
import {previewState} from './preview-fixtures.js';
import {plate,full,count,amount,occupied,beginStroke,extendStroke,pauseStroke,applyStroke,createWork,help,commit,nextWork,tasksFor,orderLabel,expectedUnits,evidence} from './construction.js';
import {STORAGE_KEY,encode,decode,report} from './construction-progress.js';
import {decodeProgress} from './progress.js';
import {activityReport} from './activity-report.js';
import {installReference,term} from './reference.js';

const identity=__BUILD_IDENTITY__, $=id=>document.getElementById(id), pairs=['A','B'];
const params=new URLSearchParams(location.search),fixture=params.get('preview'),canPersist=!fixture;
let mode=fixture?'free':'learn',free=fixture?previewState(fixture):createFreePlay(),flavors={A:'blueberry',B:'blueberry'};
let learn=createWork('learn',identity.id),challenge=createWork('challenge',identity.id),archives=[],challengeStarted=false;
let drawerOpen=false,bakery,busy=false,served=false,epoch=0,stroke=null,pointer=null,undo=[],lastCue='',message='',tone='',legacyText=null;
let storageReady=false,storageBlocked=false,lastStored=null,saveTimer=null;
const noticedTasks=new Set();
const work=()=>mode==='learn'?learn:challenge;
const currentTask=()=>tasksFor(mode)[work().index];
const putWork=w=>{if(w.mode==='learn')learn=w;else challenge=w;};
const names=()=>mode==='free'?['Test Pie 1','Test Pie 2']:currentTask().whole?['Plate 1','Plate 2']:['Your Pie','Spare Plate'];
const active=()=>mode==='free'||currentTask().whole?2:1;
const fractions=()=>mode==='free'?[free.A,free.B]:displayPlates().map(p=>({n:count(p.mask),d:p.d}));
function displayPlates(){const w=work(),t=currentTask();return served&&w.solved?w.plates.map(p=>plate(p.d)):t.kind==='read'?[plate(t.grid,full(t.n*t.grid/t.d)),plate(t.grid)]:w.plates;}
const snapshot=()=>({mode,free,flavors,learn,challenge,archives,challengeStarted,drawerOpen});
function download(text,name,type='text/html'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

document.querySelector('#app').innerHTML=`<header class="header"><a class="brand" href="./"><span>EasyAs<span class="brand-pie">Pie</span></span><small>The Fraction Bakery</small></a><nav class="modes" aria-label="Game Modes">${[['free','Free Play'],['learn','Learn'],['challenge','Challenge']].map(([key,title])=>`<button id="${key==='free'?'free-play':key}" data-mode="${key}">${title}</button>`).join('')}</nav><div class="view-controls"><button id="orbit-left" aria-label="Orbit Camera Left">↶</button><button id="orbit-right" aria-label="Orbit Camera Right">↷</button><button id="view">Top View</button><button id="reset-view">Reset View</button><button id="fullscreen">Full Screen</button></div></header>
<main><section class="bakery" aria-label="Fraction Bakery"><div class="stage"><canvas id="scene" role="img"></canvas><p id="scene-error" role="status" hidden>The 3D view is unavailable. Use the numbered Piece Controls to build the same exact fractions.</p></div><div id="upper-order" class="upper-order" aria-hidden="true"></div><div class="pie-labels">${pairs.map((p,i)=>`<section class="pie-label" id="label-${p}" aria-labelledby="title-${p}"><h2 id="title-${p}"></h2><strong class="fraction"></strong><span class="count"></span><div class="serving-controls"><button data-action="clear" data-pair="${p}">Clear</button><button data-action="decrease" data-pair="${p}" aria-label="Decrease Serving">−</button><button data-action="increase" data-pair="${p}" aria-label="Increase Serving">+</button></div><div class="transform-controls"><button data-action="cut" data-pair="${p}">Cut</button><button data-action="regroup" data-pair="${p}">Regroup</button></div><label class="flavor-control">Flavor <select data-flavor="${p}">${Object.entries(RECIPES).map(([k,r])=>`<option value="${k}">${r.name}</option>`).join('')}</select></label><details class="unit-access"><summary>Piece Controls</summary><div id="pie-${p}" class="unit-buttons" role="toolbar" aria-label="${i?'Second':'First'} Plate Pieces"></div></details></section>`).join('')}</div>
<div id="counter-bars">${pairs.map(p=>`<figure class="bar-pair" id="bar-figure-${p}"><figcaption><span id="bar-name-${p}"></span> <strong id="bar-fraction-${p}"></strong></figcaption><div class="fraction-bar" id="bar-${p}" role="toolbar"></div></figure>`).join('')}</div><button id="drawer-toggle" aria-label="Open Drawer" aria-expanded="false"><span class="sr-only">Open Drawer</span></button><p id="operation" role="status" aria-live="polite"></p><section id="learning-card" class="learning-card" aria-label="Learning Activity"></section><p id="announcement" class="sr-only" role="status" aria-live="polite"></p></section></main>
<footer><div class="local-progress"><span id="save-status" role="status">Work Stays In This Browser</span><button id="download-report">Activity Report</button><button id="legacy-report" hidden>Previous Work</button><button id="clear-saved-work">Clear Saved Work</button></div><div class="build-identity"><span>Local Review Build</span><code id="build-identity"></code></div></footer>`;
$('build-identity').textContent=identity.id;
function fitPanels(){document.documentElement.style.setProperty('--footer-height',`${document.querySelector('footer').getBoundingClientRect().height}px`);document.documentElement.style.setProperty('--activity-height',`${$('learning-card').getBoundingClientRect().height+18}px`);document.documentElement.style.setProperty('--header-height',`${document.querySelector('.header').getBoundingClientRect().bottom+10}px`);}
new ResizeObserver(fitPanels).observe($('learning-card'));new ResizeObserver(fitPanels).observe(document.querySelector('footer'));new ResizeObserver(fitPanels).observe(document.querySelector('.header'));
function layout({labels,bars,handle,knife,moving,drawerValue,viewValue}){
 const top=$('scene').offsetTop,left=$('scene').offsetLeft;
 for(const p of labels){const label=$('label-'+p.pair);label.style.left=`${Math.max(label.offsetWidth/2+8,Math.min(innerWidth-label.offsetWidth/2-8,p.x+left))}px`;label.style.top=`${Math.max(top+(mode!=='free'&&active()===2?48:6),p.y+top-label.offsetHeight)}px`;}
 for(const r of bars){Object.assign($('bar-figure-'+r.pair).style,{left:r.x+left+'px',top:r.y+top+'px',width:r.width+'px',transformOrigin:'0 0',transform:`matrix(1,${r.shearY},${r.shearX},1,0,0)`});$('bar-'+r.pair).style.height=Math.max(22,r.height)+'px';}
 Object.assign($('drawer-toggle').style,{left:handle.x+left+'px',top:handle.y+top+'px',width:Math.max(44,handle.width)+'px'});
 Object.assign($('scene-knife').style,{left:knife.x+left+'px',top:knife.y+top+'px'});
 $('scene').dataset.moving=String(moving);$('scene').dataset.drawerProgress=String(drawerValue);$('scene').dataset.viewProgress=String(viewValue);
}
const knifeControl=document.createElement('button');knifeControl.id='scene-knife';knifeControl.textContent='CUT PIES';knifeControl.setAttribute('aria-label','Cut Pies With The Counter Knife');document.querySelector('.bakery').append(knifeControl);knifeControl.onclick=()=>submit();
try{bakery=createBakery($('scene'),{onLayout:layout,modelReview:params.get('review')==='solids'});}catch(e){$('scene-error').hidden=false;document.body.classList.add('scene-unavailable');}
$('scene').addEventListener('scene-error',()=>{$('scene-error').hidden=false;document.body.classList.add('scene-unavailable');cancelInput();});
document.addEventListener('toggle',e=>{if(e.target.matches?.('.unit-access'))bakery?.refreshLayout();},true);
function say(text){$('operation').textContent=text;$('announcement').textContent=text;}
function piecesHTML(pair,d,kind){return Array.from({length:d},(_,i)=>`<button type="button" class="${kind==='bar'?'bar-segment':'pie-choice'}" data-pair="${pair}" data-piece="${i+1}" tabindex="${i===0?0:-1}">${kind==='bar'?'<span class="selection-mark">●</span>':i+1}</button>`).join('');}
function renderScene(animate=false){
 document.body.dataset.mode=mode;document.body.dataset.plates=String(active());const fs=fractions(),ns=names();
 for(let side=0;side<2;side++){
  const pair=pairs[side],f=fs[side],inactive=side>=active(),read=mode!=='free'&&currentTask().kind==='read';
  $('label-'+pair).hidden=inactive;$('bar-figure-'+pair).hidden=inactive;
  $('title-'+pair).textContent=read?'Read This Pie':ns[side];$('label-'+pair).querySelector('.fraction').textContent=read?'?':`${f.n}/${f.d}`;
  $('label-'+pair).querySelector('.count').textContent=read?`${f.d} equal parts in one whole`:`${f.n} of ${f.d} equal parts selected`;
  $('bar-name-'+pair).textContent=ns[side];$('bar-fraction-'+pair).textContent=read?'?':`${f.n}/${f.d}`;
  for(const kind of ['pie','bar']){
   const group=$(kind+'-'+pair);if(group.children.length!==f.d){group.innerHTML=piecesHTML(pair,f.d,kind);group.style.setProperty('--pieces',f.d);}
   group.setAttribute('aria-label',`${ns[side]} ${kind==='bar'?'Bar':'Pie'} Pieces`);
   group.querySelectorAll('button').forEach(b=>{const k=Number(b.dataset.piece),selected=mode==='free'?k<=f.n:occupied(displayPlates()[side],k);b.classList.toggle('selected',selected);b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',`${ns[side]}, piece ${k} of ${f.d}, ${selected?'filled':'empty'}. ${mode==='free'?`Select the first ${k} pieces`:selected?'Erase this piece':'Add this piece'}.`);b.disabled=inactive||read||busy||(mode!=='free'&&work().solved);});
  }
  $('label-'+pair).querySelector('.unit-access').hidden=read;
  document.querySelectorAll(`[data-action][data-pair="${pair}"]`).forEach(b=>{b.disabled=busy||(mode!=='free'&&(work().solved||read));b.setAttribute('aria-label',`${b.dataset.action} ${ns[side]} Serving`);});
  document.querySelector(`[data-flavor="${pair}"]`).value=flavors[pair];
 }
 bakery?.update(fs[0],fs[1],[flavors.A,flavors.B]);bakery?.setMode(mode);bakery?.construction(mode==='free'?null:displayPlates(),active(),{animate});
 $('scene').setAttribute('aria-label',`${active()} equal-sized ${active()===1?'plate':'plates'}. ${ns[0]}: ${fs[0].n} of ${fs[0].d} parts.${active()===2?` ${ns[1]}: ${fs[1].n} of ${fs[1].d} parts.`:''} Use Piece Controls for keyboard or touch.`);
 $('scene').dataset.masks=mode==='free'?'':work().plates.map(p=>p.mask).join(',');$('scene').dataset.denominator=String(fs[0].d);
 $('app').setAttribute('aria-busy',String(busy));document.body.classList.toggle('serving',busy&&mode!=='free');
 knifeControl.hidden=mode==='free';knifeControl.disabled=busy||(mode!=='free'&&(work().solved||work().complete));
}
function renderActivity(){
 document.querySelectorAll('button[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});
 const card=$('learning-card');
 if(mode==='free'){
  $('upper-order').hidden=true;card.innerHTML=`<div class="activity-head"><h1>Free Play</h1><button id="reset">Reset Mode</button><button data-reference>Fraction Reference</button></div><p>Select a piece to serve it and all earlier pieces. Cut and Regroup keep the same amount.</p><p class="activity-feedback">${message||'Explore two equal wholes. Drag the background to move the camera.'}</p><div class="vocabulary-inline">${term('whole')} · ${term('numerator')} · ${term('denominator')} · ${term('equivalent')}</div>`;
 }else{
  const w=work(),t=currentTask(),rows=evidence(w);card.dataset.task=t.id;card.dataset.solved=String(w.solved);card.dataset.orderAssisted=String(rows[w.index].help.length>0);
  $('upper-order').hidden=w.complete;$('upper-order').textContent=served?'Order Served · Fresh Plates Ready':t.kind==='read'?'Which Fraction Is Shown?':`${orderLabel(t)} · ${t.grid} Equal Parts Per Whole`;
  const options=['1/2','1/4','3/4','3/8','2/4','6/8','6/16'];
  card.innerHTML=w.complete?`<div class="activity-head"><h1>${mode==='learn'?'Learning':'Orders'} Complete</h1><button id="new-round">New Round</button><button data-reference>Fraction Reference</button></div><p>${rows.length} tasks completed · ${rows.filter(r=>r.firstWithoutHelp).length} first answers without recorded help · ${rows.filter(r=>r.help.length).length} helped · ${rows.filter(r=>r.retries).length} retried.</p><p class="activity-feedback">Your Activity Report keeps every response and help event. Practice evidence awaits teacher review.</p>`:
  `<div class="activity-head"><span class="task-count">${mode==='learn'?'Step':'Order'} ${w.index+1} Of ${tasksFor(mode).length}</span><h1>${mode==='learn'?t.title:'Build The Order'}</h1><button data-reference>Fraction Reference</button></div><p class="task-prompt">${mode==='learn'?t.prompt:`Make <strong>${orderLabel(t)}</strong> using ${t.grid} equal parts in each whole.${t.whole?' Fill one plate completely and build the extra fraction on the other.':''}`}</p><div class="activity-actions">${t.kind==='read'?`<label>Written Fraction <select id="written-answer" ${busy||w.solved?'disabled':''}><option value="">Choose An Amount</option>${options.map(x=>`<option value="${x}" ${w.written===x?'selected':''}>${x}</option>`).join('')}</select></label>`:''}<button id="submit-order" class="cut-pies" ${busy||w.solved?'disabled':''}><span class="knife-icon" aria-hidden="true">🔪</span> CUT PIES</button><button id="hint-order" ${busy||w.solved?'disabled':''}>Hint</button><button id="undo" ${busy||w.solved||!undo.length?'disabled':''}>Undo</button><button id="reset" ${!busy&&w.solved?'disabled':''}>${busy?'Skip Serving':'Clear Plates'}</button></div><p class="activity-feedback ${tone}" role="status">${message||'Start empty to ADD; start filled to ERASE. Release to place your pieces. CUT PIES checks your answer.'}</p><p class="keyboard-guidance">Tap pieces or open Piece Controls. Arrows explore; Enter toggles; Shift + arrows previews; Enter commits; Escape cancels.</p>`;
 }
 const cueKey=mode==='free'?'free':`${mode}:${work().index}:${work().complete}`;
 if(cueKey!==lastCue){lastCue=cueKey;card.classList.remove('new-task');if(!noticedTasks.has(cueKey)){noticedTasks.add(cueKey);void card.offsetWidth;card.classList.add('new-task');card.dataset.cueCount=String(Number(card.dataset.cueCount||0)+1);}}
 fitPanels();changed();
}
function render(animate=false){renderScene(animate);renderActivity();}
function cancelInput(){stroke=null;pointer=null;bakery?.previewStroke(-1,null);$('operation').textContent='';}
function interrupt(){cancelInput();++epoch;bakery?.cancelServing();bakery?.cancelTransformation();busy=false;served=false;$('upper-order').classList.remove('success-gold');}
function recordHelp(source){
 if(challengeStarted&&!challenge.solved&&!challenge.complete){const id=tasksFor('challenge')[challenge.index].id;if(source!=='vocabulary'||!challenge.history.some(e=>e.kind==='help'&&e.id===id&&e.source===source))challenge=help(challenge,source);}
 if(mode==='learn'&&!learn.solved&&!learn.complete){const id=currentTask().id;if(source!=='vocabulary'||!learn.history.some(e=>e.kind==='help'&&e.id===id&&e.source===source))learn=help(learn,source);}
 if(mode!=='free')$('learning-card').dataset.orderAssisted=String(evidence(work())[work().index].help.length>0);changed();
}
installReference(recordHelp);
function changeMode(next){if(next===mode)return;interrupt();if(challengeStarted&&['learn','free'].includes(next))recordHelp(next==='free'?'free-play':'learn');mode=next;if(mode==='challenge')challengeStarted=true;undo=[];message='';tone='';render();save();resumeServing();}
function editable(side){return !busy&&side<active()&&(mode==='free'||(!work().solved&&!work().complete&&currentTask().kind!=='read'));}
function startStroke(side,k,keyboard=false,angle,height){if(mode==='free'||!editable(side))return;stroke={side,keyboard,...beginStroke(work().plates[side],k,angle),height:height??(occupied(work().plates[side],k)?.99:.165)};bakery?.emphasize(null);preview();}
function preview(){if(!stroke)return;bakery?.previewStroke(stroke.side,stroke);say(`${stroke.operation.toUpperCase()} preview — ${count(stroke.units)} ${count(stroke.units)===1?'unit':'units'}. ${stroke.keyboard?'Enter to commit; Escape to cancel.':'Release to commit; Escape to cancel.'}`);}
function commitStroke(){if(!stroke)return;const s=stroke;stroke=null;bakery?.previewStroke(-1,null);if(!editable(s.side))return;const w=work(),p=applyStroke(w.plates[s.side],s);undo.push(w.plates.map(x=>({...x})));putWork({...w,plates:w.plates.map((x,i)=>i===s.side?p:x)});message='Pieces changed. CUT PIES checks the complete order.';tone='';render(true);say(`${s.operation==='add'?'Added missing':'Removed occupied'} units. ${count(p.mask)} of ${p.d} parts now selected.`);}
async function freeAction(action){
 if(busy)return;const result=applyFreePlayAction(free,action);if(!result.ok){message=result.reason.message;renderActivity();return;}
 const before=free[action.pair],after=result.state[action.pair],token=++epoch;cancelInput();
 if(before.d!==after.d){busy=true;renderScene();await bakery?.transform(action.pair,action.type,before,after);if(token!==epoch)return;busy=false;}
 free=result.state;message=before.d!==after.d?`${before.n}/${before.d} = ${after.n}/${after.d}. Same amount; ${after.d} equal parts in the whole.`:'';render();
}
function toggleUnit(side,k){if(!editable(side))return;if(mode==='free'){freeAction({pair:pairs[side],type:'select',k});return;}startStroke(side,k);commitStroke();}
async function submit(){
 if(mode==='free'||busy||work().solved||work().complete)return;cancelInput();const w=work(),t=currentTask();
 if(t.kind==='read'&&!w.written){message='Choose the written amount first. Your answer stays hidden until CUT PIES.';renderActivity();return;}
 const next=commit(w);putWork(next);save();
 if(!next.solved){const total=next.plates.reduce((n,p)=>n+amount(p),0);tone='incorrect';message=t.kind==='read'?'Not Yet. Compare the purple amount with the same whole, then revise your written fraction.':total===expectedUnits(t)&&t.whole?'Not Yet. The total matches; show one complete whole on one plate, then the extra fraction on the other.':`Not Yet. Your serving is ${total<expectedUnits(t)?'less':'more'} than ${orderLabel(t)}. Your work is kept; add or erase and try again.`;renderActivity();return;}
 await playServing();
}
function resumeServing(){if(mode!=='free'&&work().solved&&!work().complete&&!busy&&!document.hidden)void playServing();}
async function playServing(){
 if(mode==='free'||busy||!work().solved||work().complete)return;
 const completed=work(),t=currentTask(),following=nextWork(completed),nextTask=tasksFor(mode)[following.index];
 const incoming={count:following.complete?0:nextTask.whole?2:1,grid:nextTask.grid};
 const token=++epoch;busy=true;tone='correct';message=`Correct - ${orderLabel(t)}. Your selected answer is saved.`;render();
 const stageCopy={whole:'Serving view: the whole pie briefly appears. Your answer is unchanged.',cut:'Cutting at the boundaries of each contiguous serving.',leftovers:'The unselected leftovers lift and whisk left.',glow:'Your retained serving glows purple.',serve:'The completed order is served to the right.',cabinet:`The cabinet opens. ${incoming.count===1?'One fresh plate arrives':'Two fresh plates arrive'} for the next order.`,ready:'Fresh plates are on the counter.'};
 await bakery?.serve(displayPlates(),stage=>{if(token!==epoch)return;$('scene').dataset.servingStage=stage;message=stageCopy[stage];const feedback=$('learning-card').querySelector('.activity-feedback');if(feedback)feedback.textContent=message;if(stage==='glow')$('upper-order').classList.add('success-gold');},incoming);
 if(token!==epoch||work().index!==completed.index||!work().solved||work().complete)return;
 // Only this token may append the advance event. A cancelled animation keeps
 // the solved response; returning/reloading resumes it without another answer.
 putWork(nextWork(work()));busy=false;served=false;undo=[];tone='';
 $('upper-order').classList.remove('success-gold');message=work().complete?'Every order is served. Your report keeps the original responses.':`Correct! ${t.goal||'Your serving matched the requested amount.'} Here is your next order.`;
 render();save();say(work().complete?'Activity complete.':`New ${mode==='learn'?'step':'order'}: ${nextTask.prompt||'Make '+orderLabel(nextTask)+'.'}`);
}

function clearPlates(){if(busy&&mode!=='free'){bakery?.finishServing();return;}interrupt();if(mode==='free'){free=createFreePlay();message='Free Play reset to equal halves.';}else if(!work().solved){const w=work();undo.push(w.plates.map(p=>({...p})));putWork({...w,plates:w.plates.map(p=>plate(p.d)),written:''});message='Plates cleared. Your previous submitted responses are still in the report.';}render();}
document.addEventListener('click',e=>{
 const modeButton=e.target.closest('button[data-mode]');if(modeButton){changeMode(modeButton.dataset.mode);return;}
 const piece=e.target.closest('[data-piece]');if(piece){if(stroke?.keyboard)cancelInput();toggleUnit(pairs.indexOf(piece.dataset.pair),Number(piece.dataset.piece));return;}
 const action=e.target.closest('[data-action]');if(action){if(mode==='free')freeAction({pair:action.dataset.pair,type:action.dataset.action});else if(action.dataset.action==='clear'&&editable(pairs.indexOf(action.dataset.pair))){const w=work(),side=pairs.indexOf(action.dataset.pair);undo.push(w.plates.map(p=>({...p})));putWork({...w,plates:w.plates.map((p,i)=>i===side?plate(p.d):p)});render(true);}return;}
 if(e.target.closest('#submit-order'))submit();
 if(e.target.closest('#reset'))clearPlates();
 if(e.target.closest('#undo')&&!busy&&undo.length&&!work().solved){cancelInput();putWork({...work(),plates:undo.pop()});message='Last construction change undone. Submitted responses stay recorded.';render(true);}
 if(e.target.closest('#hint-order')&&!busy&&!work().solved){recordHelp('hint');const t=currentTask();message=t.kind==='read'?'Count the purple equal parts, then count all equal parts in the whole. Equivalent names show the same amount.':`${t.whole?'Fill one whole plate first. ':''}${t.n}/${t.d} is ${t.n*t.grid/t.d}/${t.grid}. Select ${t.n*t.grid/t.d} of ${t.grid} equal parts${t.whole?' on the other plate':''}. This task is marked as helped.`;renderActivity();}
 if(e.target.closest('#new-round')){if(archives.length>=100){message='Download your report before clearing saved work; the local archive is full.';renderActivity();return;}archives.push(work());putWork(createWork(mode,identity.id));for(const key of noticedTasks)if(key.startsWith(mode+':'))noticedTasks.delete(key);lastCue='';undo=[];message='';tone='';render();}
});
document.addEventListener('change',e=>{if(e.target.id==='written-answer'&&!busy&&!work().solved){putWork({...work(),written:e.target.value});changed();}if(e.target.matches('[data-flavor]')&&!busy){flavors={...flavors,[e.target.dataset.flavor]:e.target.value};renderScene();changed();}});
document.addEventListener('focusin',e=>{const b=e.target.closest('[data-piece]');if(!b)return;const side=pairs.indexOf(b.dataset.pair);b.parentElement.querySelectorAll('button').forEach(x=>x.tabIndex=x===b?0:-1);if(!stroke)bakery?.emphasize({pair:b.dataset.pair,k:Number(b.dataset.piece)});});
document.addEventListener('keydown',e=>{
 if(e.key==='Tab'&&stroke)cancelInput();
 if(e.key==='Escape'&&stroke){e.preventDefault();cancelInput();say('Preview cancelled. Your pie is unchanged.');return;}
 const b=e.target.closest('[data-piece]');if(!b)return;const side=pairs.indexOf(b.dataset.pair),k=Number(b.dataset.piece),d=fractions()[side].d;
 if(stroke?.keyboard&&['Enter',' '].includes(e.key)){e.preventDefault();commitStroke();return;}
 const n={ArrowRight:k%d+1,ArrowDown:k%d+1,ArrowLeft:(k-2+d)%d+1,ArrowUp:(k-2+d)%d+1,Home:1,End:d}[e.key];if(n===undefined)return;e.preventDefault();
 if(e.shiftKey&&mode!=='free'){if(!stroke)startStroke(side,k,true);if(stroke?.side===side){stroke={...stroke,...extendStroke(stroke,n,{direction:['ArrowLeft','ArrowUp','Home'].includes(e.key)?-1:1})};preview();}}else if(stroke?.keyboard)cancelInput();
 b.parentElement.querySelector(`[data-piece="${n}"]`).focus();
});
const canvas=$('scene');
canvas.addEventListener('pointerleave',()=>{if(!pointer&&!stroke)bakery?.emphasize(null);});
canvas.addEventListener('pointerdown',e=>{
 if(pointer||busy||e.button!==0)return;const hit=bakery?.pick(e.clientX,e.clientY);pointer={id:e.pointerId,x:e.clientX,y:e.clientY,kind:hit?'plate':'camera',pair:hit?.pair,k:hit?.k,moved:false};canvas.setPointerCapture(e.pointerId);
 if(hit&&mode!=='free')startStroke(pairs.indexOf(hit.pair),hit.k,false,hit.angle,hit.height);
});
canvas.addEventListener('pointermove',e=>{
 if(!pointer){const hit=bakery?.pick(e.clientX,e.clientY);canvas.style.cursor=hit?'crosshair':'grab';if(!stroke)bakery?.emphasize(hit);return;}
 if(pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;
 if(pointer.kind==='camera'){if(pointer.moved||Math.hypot(dx,dy)>5){pointer.moved=true;bakery?.orbit(-dx*.003,dy*.003);pointer.x=e.clientX;pointer.y=e.clientY;}}
 else if(stroke){const hit=bakery?.pickStroke(e.clientX,e.clientY,stroke.side,stroke.height);if(hit?.pair===pairs[stroke.side]&&hit.radius>.18){stroke={...stroke,...extendStroke(stroke,hit.k,{angle:hit.angle,pointer:true})};preview();}else{stroke=pauseStroke(stroke);say('Preview paused. Return to its end piece to continue, or release to keep this span.');}}
});
canvas.addEventListener('pointerup',e=>{if(pointer?.id!==e.pointerId)return;const p=pointer;pointer=null;if(stroke)commitStroke();else if(p.kind==='plate'&&mode==='free')toggleUnit(pairs.indexOf(p.pair),p.k);if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);});
for(const event of ['pointercancel','lostpointercapture'])canvas.addEventListener(event,e=>{if(pointer?.id===e.pointerId)cancelInput();});
window.addEventListener('blur',cancelInput);document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelInput();if(busy&&mode!=='free'){interrupt();message='Your correct response is saved. Serving resumes when you return.';render();}save();}else resumeServing();});
$('orbit-left').onclick=()=>{cancelInput();bakery?.orbit(-.12);};$('orbit-right').onclick=()=>{cancelInput();bakery?.orbit(.12);};
$('view').onclick=()=>{cancelInput();const top=$('view').getAttribute('aria-pressed')!=='true';$('view').setAttribute('aria-pressed',String(top));$('view').textContent=top?'Angled View':'Top View';bakery?.setTopView(top);};
$('reset-view').onclick=()=>{cancelInput();bakery?.resetCamera();$('view').textContent='Top View';$('view').setAttribute('aria-pressed','false');};
$('drawer-toggle').onclick=()=>{drawerOpen=!drawerOpen;$('drawer-toggle').setAttribute('aria-expanded',String(drawerOpen));$('drawer-toggle').setAttribute('aria-label',`${drawerOpen?'Close':'Open'} Drawer`);bakery?.setDrawer(drawerOpen);changed();};
$('fullscreen').hidden=!document.fullscreenEnabled;$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{say('Full Screen is unavailable in this browser.');}};
$('download-report').onclick=()=>{const {html}=report(snapshot(),identity);download(html,identity.id+'_activity-report.html');};
function changed(){if(storageReady&&!storageBlocked&&canPersist){clearTimeout(saveTimer);saveTimer=setTimeout(save,100);}}
function save(){clearTimeout(saveTimer);if(!storageReady||storageBlocked||!canPersist)return;try{if(localStorage.getItem(STORAGE_KEY)!==lastStored){storageBlocked=true;$('save-status').textContent='Saved work changed elsewhere — reload to restore';return;}const text=encode(snapshot(),identity);localStorage.setItem(STORAGE_KEY,text);lastStored=text;$('save-status').textContent=legacyText?'Saved Here · Previous Activity Preserved':'Saved Only In This Browser';}catch{$('save-status').textContent='Could Not Save — Keep This Page Open';}}
if(canPersist){try{
 legacyText=localStorage.getItem('easyaspie.progress.v1');lastStored=localStorage.getItem(STORAGE_KEY);
 if(lastStored){const s=decode(lastStored).state;({mode,free,flavors,learn,challenge,archives,challengeStarted,drawerOpen}=s);message=work().solved?'Restored your correct response. Preparing the next order.':'Restored your work and original response history.';}
 else if(legacyText){try{const old=decodeProgress(legacyText).state;free=old.free;flavors=old.flavors;}catch{}message='New activity version: previous work is preserved separately. Use Previous Work to download it.';}
 }catch{storageBlocked=true;$('save-status').textContent='Saved Work Could Not Be Restored — Retained Without Overwrite';}}
$('legacy-report').hidden=!legacyText;$('legacy-report').onclick=()=>{try{const old=decodeProgress(legacyText);download(activityReport(old.state.challenge.session,identity).html,identity.id+'_previous-activity-report.html');}catch{download(legacyText,identity.id+'_preserved-previous-work.json','application/json');}};
$('clear-saved-work').onclick=()=>{const dialog=document.createElement('dialog');dialog.innerHTML='<div class="reference-head"><h2>Clear This Review’s Saved Work?</h2></div><div class="reference-content"><p>This removes the new activity’s responses and archived rounds from this browser. Previous-version work stays preserved. Download Activity Report first if you need it.</p><button id="confirm-clear">Clear And Restart</button> <button id="cancel-clear">Keep My Work</button></div>';document.body.append(dialog);dialog.showModal();dialog.querySelector('#cancel-clear').focus();dialog.querySelector('#cancel-clear').onclick=()=>dialog.close();dialog.querySelector('#confirm-clear').onclick=()=>{try{storageReady=false;clearTimeout(saveTimer);localStorage.removeItem(STORAGE_KEY);location.reload();}catch{say('Browser storage could not be cleared.');}};dialog.addEventListener('close',()=>{dialog.remove();$('clear-saved-work').focus();});};
storageReady=true;render();queueMicrotask(resumeServing);bakery?.setDrawer(drawerOpen);$('drawer-toggle').setAttribute('aria-expanded',String(drawerOpen));if(!canPersist)$('save-status').textContent='Review Fixture — Saving Is Off';
window.addEventListener('pagehide',()=>{save();interrupt();});window.addEventListener('resize',()=>{cancelInput();fitPanels();});
// Read-only geometry access for real-input review scripts. It cannot alter answers.
if(params.has('review'))window.__review={identity,point:(side,k,r)=>{const p=bakery?.projectPiece(side,k,r),rect=canvas.getBoundingClientRect();return p?{x:p.x+rect.left,y:p.y+rect.top}:null;},snapshot:()=>structuredClone(snapshot()),geometry:()=>bakery?.reviewGeometry(),stroke:()=>stroke?structuredClone(stroke):null,pick:(x,y)=>bakery?.pick(x,y)};
