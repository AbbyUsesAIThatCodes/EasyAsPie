import {LESSONS} from './lessons.js';
import {CHALLENGES} from './exercises.js';
import {activityReport} from './activity-report.js';
import {FREE_INSTRUCTION} from './presentation.js';
import {createSession,currentTask,selectSlices,markAssisted,useHint,submit,advance} from './session.js';
import {createFreePlay} from './free-play.js';
import {convert,compare} from './fractions.js';
const terms={
 whole:{title:'Whole',text:'The complete pie or the entire bar used as one unit. Our two wholes have the same size.'},
 numerator:{title:'Numerator',text:'The top number counts the equal pieces selected. In 3/8, three pieces are selected.'},
 denominator:{title:'Denominator',text:'The bottom number counts all the equal pieces in one {whole}. In 3/8, the whole has eight equal pieces.'},
 equivalent:{title:'Equivalent Fractions',text:'Different fraction names for the same amount of the same-sized {whole}. Multiply or divide both numbers by the same factor.'},
 regroup:{title:'Regroup',text:'Combine adjacent equal pieces into larger equal pieces while keeping the selected amount. An odd {numerator} cannot be halved into whole larger pieces.'}
};
export function term(key){const t=terms[key];return `<span class="term" tabindex="0" role="button" data-term="${key}" aria-label="Open ${t.title} Reference"><b>${t.title}</b><span class="term-tip" role="tooltip">${t.text.replace(/\{(\w+)\}/g,(_,k)=>term(k))}<small>Click or press Enter to open the reference.</small></span></span>`;}

export function createLearningModes(api){
 const freeHeading=document.querySelector('.preview-note h1').textContent.replace('Free Play Preview','Free Play');
 let mode='free',free=api.getState(),lessonIndex=0,phase='predict',prediction='',committedPrediction=null,lessonMessage='',lessonAssisted=false,learningBusy=false;
 let session=createSession(api.identity.id),challengeStarted=false,challengeMessage='',challengeTone='',epoch=0;
 const completed=new Map();
 const card=document.createElement('section');card.id='learning-card';card.className='learning-card';card.hidden=true;card.setAttribute('aria-label','Learning Activity');document.querySelector('.bakery').append(card);
 const vocab=document.createElement('div');vocab.className='vocabulary-bar';vocab.innerHTML=`${term('numerator')} / ${term('denominator')} · ${term('equivalent')} <button data-reference>Reference</button>`;document.querySelector('.bakery').append(vocab);
 const dialog=document.createElement('dialog');dialog.id='fraction-reference';dialog.innerHTML=`<div class="reference-head"><h2>Fraction Reference</h2><button id="close-reference">Close</button></div><p>Our pies and bars are different models of the same-sized ${term('whole')}.</p>${Object.entries(terms).map(([key,t])=>`<section id="reference-${key}"><h3>${t.title}</h3><p>${t.text.replace(/\{(\w+)\}/g,(_,k)=>term(k))}</p></section>`).join('')}<h3>Camera And Keyboard</h3><p>Drag the scene to orbit, or use the two arrow buttons. Top View restores a centered comparison. Tab to a pie or open bar; arrows, Home and End explore pieces, Enter or Space selects. Escape closes the drawer or this reference.</p>`;document.body.append(dialog);
 const showReference=key=>{if(challengeStarted)session=markAssisted(session,'reference');if(mode==='challenge'){challengeMessage='Reference used. This order is now marked as helped.';render();}if(mode==='learn')lessonAssisted=true;api.changed();dialog.showModal();if(key)dialog.querySelector('#reference-'+key)?.scrollIntoView({block:'nearest'});};
 document.querySelector('#close-reference').onclick=()=>dialog.close();
 const vocabularyExposure=event=>{const target=event.target.closest?.('.term');if(!target||target.contains(event.relatedTarget))return;if(challengeStarted&&!session.history.some(e=>e.id===currentTask(session).id&&e.kind==='help'&&e.source==='vocabulary'))session=markAssisted(session,'vocabulary');if(mode==='learn')lessonAssisted=true;card.dataset.orderAssisted=String(session.assisted);api.changed();};
 document.addEventListener('pointerover',vocabularyExposure);document.addEventListener('focusin',vocabularyExposure);

 document.addEventListener('click',event=>{const t=event.target.closest('[data-term],[data-reference]');if(!t)return;event.stopPropagation();if(!dialog.open)showReference(t.dataset.term);else dialog.querySelector('#reference-'+t.dataset.term)?.scrollIntoView({block:'nearest'});});
 document.addEventListener('keydown',event=>{if(event.target.matches('.term')&&['Enter',' '].includes(event.key)){event.preventDefault();if(!dialog.open)showReference(event.target.dataset.term);}});
 const setScene=(A,B)=>{api.loadState(createFreePlay({A,B}));api.setFeedback(null);};
 function startLesson(index){++epoch;lessonIndex=index;phase='predict';prediction='';committedPrediction=null;lessonMessage='Make a prediction before testing it.';lessonAssisted=false;learningBusy=false;const l=LESSONS[index];setScene(l.from,{n:0,d:l.to});render();}
 function challengeScene(){const t=currentTask(session);setScene(t.from,{n:session.selected,d:t.to});}
 function changeMode(next){if(next===mode)return;if(mode==='free')free=api.getState();if(challengeStarted&&['learn','free'].includes(next))session=markAssisted(session,next==='free'?'free-play':'learn');if(next==='challenge')challengeStarted=true;++epoch;learningBusy=false;mode=next;document.body.dataset.mode=mode;api.setMode(mode);
  document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});
  if(mode==='free'){api.loadState(free);api.setFeedback(null);document.querySelector('.preview-note p').textContent=FREE_INSTRUCTION;}else if(mode==='learn')startLesson(lessonIndex);else challengeScene();
  api.feedback(mode==='free'?'Explore freely. Cut and regroup preserve the amount.':mode==='learn'?'Predict, test, then build the matching serving.':'Build the Customer Pie to match the written target. Choose Check Order when ready.');render();
 }
 document.querySelector('.modes').innerHTML='<button id="free-play" data-mode="free" class="active" aria-pressed="true">Free Play</button><button id="learn" data-mode="learn" aria-pressed="false">Learn</button><button id="challenge" data-mode="challenge" aria-pressed="false">Challenge</button>';
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>changeMode(b.dataset.mode));
 function render(){
  api.changed();
  card.hidden=mode==='free';vocab.hidden=mode!=='free';
  document.querySelector('.preview-note h1').textContent=mode==='free'?freeHeading:mode==='learn'?'Learn Together':'Bakery Orders';
  if(mode==='free')return;
  if(mode==='learn'){
   const l=LESSONS[lessonIndex];
   card.dataset.predictionCorrect=phase==='done'?String(completed.get(lessonIndex).predictionCorrect):'';
   card.innerHTML=`<div class="activity-head"><label>Lesson <select id="lesson-select" ${learningBusy?'disabled':''}>${LESSONS.map((x,i)=>`<option value="${i}" ${i===lessonIndex?'selected':''}>${x.title}</option>`).join('')}</select></label><span>${phase==='predict'?`Predict the ${term('numerator')}.`:phase==='done'?'Lesson Check Complete':`Build ${term('equivalent')} in Your Pie.`}</span><button data-reference>Reference</button></div>
    ${phase==='predict'?`<div class="activity-actions"><span>${l.prompt}</span><label>Your Prediction <select id="prediction" ${learningBusy?'disabled':''}><option value="">Choose</option>${Array.from({length:17},(_,n)=>`<option ${String(n)===prediction?'selected':''}>${n}</option>`).join('')}</select></label><button id="test-prediction" ${learningBusy?'disabled':''}>Test My Prediction</button></div>`:`<div class="activity-actions"><span>Match ${l.from.n}/${l.from.d} using Your Pie's ${l.to} equal pieces.</span><button id="check-lesson">Check My Serving</button><button id="lesson-replay">Replay Lesson</button></div>`}
    <p class="activity-feedback" role="status">${lessonMessage}</p>`;
   card.querySelector('#lesson-select').onchange=e=>startLesson(Number(e.target.value));
   if(phase==='predict'){
    card.querySelector('#prediction').onchange=e=>{prediction=e.target.value;api.changed();};
    card.querySelector('#test-prediction').onclick=async()=>{
     if(prediction===''){lessonMessage='Choose a prediction first; the demonstration stays hidden.';render();return;}
     const token=epoch,answer=prediction;committedPrediction=answer;learningBusy=true;render();
     await api.act({pair:'A',type:l.action},true);
     if(token!==epoch||mode!=='learn')return;
     learningBusy=false;phase='build';prediction=answer;const right=Number(answer)===l.prediction;
     lessonMessage=(right?'✓ Prediction matched. ':'Try again next time: the amount stays fixed when both numbers change together. ')+`Build Your Pie before checking. Prediction: ${answer}.`;
     api.feedback(l.explanation);
     api.setFeedback(right?'correct':'incorrect');render();
    };
   }else{
    card.querySelector('#lesson-replay').onclick=()=>startLesson(lessonIndex);
    card.querySelector('#check-lesson').onclick=()=>{const f=api.getState().B,expected=convert(l.from,l.to),right=compare(f,expected)===0;
     if(right){phase='done';completed.set(lessonIndex,{predictionCorrect:Number(committedPrediction)===l.prediction,assisted:lessonAssisted});lessonMessage=`✓ Same amount: ${l.from.n}/${l.from.d} = ${f.n}/${f.d}. ${lessonAssisted?'Completed with reference help.':'Completed without reference help.'} ${completed.size}/3 lesson checks completed.`;}
     else lessonMessage=`Not Yet: ${f.n}/${f.d} is ${compare(f,expected)<0?'less':'more'} than the target. Count how many smaller pieces cover each original piece.`;
     api.setFeedback(right?'correct':'incorrect');render();};
   }
  }else{
   const t=currentTask(session),first=session.results.filter(r=>r.firstTry).length,helped=session.results.filter(r=>r.assisted).length;
   card.dataset.orderAssisted=String(session.assisted);
   card.innerHTML=session.complete?`<div class="activity-head"><h2>Orders Complete</h2><button id="download-report">Download Activity Report</button><button id="restart-orders">New Round</button><button data-reference>Reference</button></div><p>${CHALLENGES.length} orders completed · ${first} first try without help · ${helped} helped · ${session.results.filter(r=>r.attempts>1).length} retried.</p><p class="activity-feedback">Practice evidence, not proof of ruler-reading mastery. Explain why both numbers change together.</p>`:
   `<div class="activity-head"><h2>Order ${session.index+1} Of ${CHALLENGES.length}</h2><span>Match ${t.from.n}/${t.from.d} using the Customer Pie's ${t.to} equal pieces.</span><button data-reference>Reference</button></div><div class="activity-actions"><span>Choose the ${term('numerator')} in the Customer Pie.</span><button id="submit-order" ${session.solved?'disabled':''}>Check Order</button><button id="hint-order" ${session.solved?'disabled':''}>Hint</button><button id="next-order" ${session.solved?'':'disabled'}>Next Order</button><span>${session.results.length}/${CHALLENGES.length} filled</span></div><p class="activity-feedback ${challengeTone}" role="status">${challengeMessage||'Build your serving, then check it. There is no timer.'}</p>`;
   if(session.complete){card.querySelector('#download-report').onclick=()=>{const {html}=activityReport(session,api.identity);const url=URL.createObjectURL(new Blob([html],{type:'text/html'})),a=document.createElement('a');a.href=url;a.download=api.identity.id+'_activity-report.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};card.querySelector('#restart-orders').onclick=()=>{session=createSession(api.identity.id);challengeMessage='';challengeTone='';challengeScene();render();};return;}
   card.querySelector('#submit-order').onclick=()=>{session=submit(session);challengeTone=session.solved?'correct':'incorrect';challengeMessage=(session.solved?'✓ Correct: ':'Not Yet: ')+session.feedback;api.setFeedback(challengeTone);render();};
   card.querySelector('#hint-order').onclick=()=>{session=useHint(session);challengeMessage='Hint · '+session.feedback;challengeTone='';render();};
   card.querySelector('#next-order').onclick=()=>{session=advance(session);challengeMessage='';challengeTone='';if(!session.complete)challengeScene();render();};
  }
 }
 document.body.dataset.mode='free';render();
 return{
  suspend(){++epoch;},
  snapshot:()=>({mode,free:mode==='free'?api.getState():free,scene:api.getState(),learn:{index:lessonIndex,phase:learningBusy?'demonstrating':phase,prediction,committed:committedPrediction,assisted:lessonAssisted,completed:[...completed]},challenge:{started:challengeStarted,session}}),
  restore(saved){
   ++epoch;learningBusy=false;mode=saved.mode;free=createFreePlay(saved.free);lessonIndex=saved.learn.index;phase=saved.learn.phase;prediction=saved.learn.prediction;committedPrediction=saved.learn.committed;lessonAssisted=saved.learn.assisted;
   completed.clear();for(const [i,r]of saved.learn.completed)completed.set(i,r);
   session=saved.challenge.session;challengeStarted=saved.challenge.started;
   document.body.dataset.mode=mode;api.setMode(mode);
   document.querySelectorAll('[data-mode]').forEach(b=>{b.classList.toggle('active',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});
   let scene=saved.scene;
   if(mode==='learn'&&phase==='demonstrating'){
    const l=LESSONS[lessonIndex];scene=createFreePlay({A:convert(l.from,l.from.d*(l.action==='cut'?2:.5)),B:scene.B});phase='build';prediction=committedPrediction;
   }
   api.loadState(scene);
   if(mode==='free')document.querySelector('.preview-note p').textContent=FREE_INSTRUCTION;
   else if(mode==='challenge'){challengeMessage=session.feedback||'Restored your serving. Choose Check Order when ready.';challengeTone=session.solved?'correct':'';api.feedback('Restored order. Match the written target with the Customer Pie.');}
   else {lessonMessage=phase==='predict'?'Restored your prediction. Test it when ready.':`Restored committed prediction: ${committedPrediction}. ${Number(committedPrediction)===LESSONS[lessonIndex].prediction?'Prediction matched.':'Prediction did not match.'} Check Your Pie to complete the lesson.`;api.feedback('Restored this lesson and its original committed response.');}
   api.setFeedback(mode==='challenge'&&session.solved?'correct':null);render();
  },
  getMode:()=>mode,
  beforeAction(action){if(mode==='free')return true;if(learningBusy){api.feedback('The demonstration is moving. Change mode or Reset to stop it.');return false;}if(action.pair==='A'){api.feedback('The Example Pie is the reference. Build your response with the other pie.');return false;}if(['cut','regroup'].includes(action.type)){api.feedback('This task keeps Your Pie’s denominator fixed. Choose its numerator.');return false;}if(mode==='challenge'&&(session.solved||session.complete)){api.feedback('This order is already checked. Choose Next Order or Reset.');return false;}return true;},
  onState(state){if(mode==='challenge'){session=selectSlices(session,state.B.n);challengeMessage='';challengeTone='';api.setFeedback(null);render();}else if(mode==='learn'&&!learningBusy&&phase!=='predict'){phase='build';lessonMessage='Serving changed. Check whether the new amount matches.';api.setFeedback(null);render();}},
  reset(){if(mode==='learn')startLesson(lessonIndex);else if(mode==='challenge'){++epoch;session=createSession(api.identity.id);challengeMessage='';challengeTone='';challengeScene();render();}},
 };
}
