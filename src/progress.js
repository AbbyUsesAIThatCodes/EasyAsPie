import {createFreePlay} from './free-play.js';
import {convert} from './fractions.js';
import {CHALLENGES,TASKSET_VERSION} from './exercises.js';
import {LESSONS} from './lessons.js';
import {restoreSession} from './session.js';
export const STORAGE_KEY='easyaspie.progress.v1';
const check=(ok,message)=>{if(!ok)throw Error(message);};
const boolean=v=>typeof v==='boolean';
const count=v=>typeof v==='string'&&/^(?:[0-9]|1[0-6])$/.test(v);
const same=(a,b)=>a.n===b.n&&a.d===b.d;
export function validateSnapshot(raw){
 check(raw&&['free','learn','challenge'].includes(raw.mode),'Unknown saved mode.');
 check(['free','scene'].every(k=>raw[k]&&['A','B'].every(p=>raw[k][p]&&Number.isInteger(raw[k][p].n)&&Number.isInteger(raw[k][p].d))),'Missing fraction snapshot.');
 const free=createFreePlay(raw.free),scene=createFreePlay(raw.scene);
 const flavors={A:raw.flavors?.A,B:raw.flavors?.B};
 check(Object.values(flavors).every(x=>['blueberry','strawberry','cherry','apple'].includes(x)),'Unknown saved flavor.');
 const l=raw.learn;check(l&&Number.isInteger(l.index)&&l.index>=0&&l.index<LESSONS.length,'Unknown lesson.');
 check(['predict','demonstrating','build','done'].includes(l.phase),'Unknown lesson phase.');
 check(l.prediction===''||count(l.prediction),'Invalid draft prediction.');
 check(l.committed===null||count(l.committed),'Invalid committed prediction.');
 check(l.phase==='predict'||count(l.committed),'Missing committed prediction.');
 check(boolean(l.assisted)&&Array.isArray(l.completed)&&l.completed.length<=LESSONS.length,'Invalid lesson record.');
 const seen=new Set(),completed=l.completed.map(entry=>{
  check(Array.isArray(entry)&&entry.length===2,'Invalid lesson completion.');const [index,r]=entry;
  check(Number.isInteger(index)&&index>=0&&index<LESSONS.length&&!seen.has(index),'Duplicate or unknown completed lesson.');seen.add(index);
  check(r&&boolean(r.predictionCorrect)&&boolean(r.assisted),'Invalid lesson result.');return [index,{predictionCorrect:r.predictionCorrect,assisted:r.assisted}];
 });
 if(l.phase==='done'){const result=completed.find(([i])=>i===l.index)?.[1];check(result&&result.predictionCorrect===(Number(l.committed)===LESSONS[l.index].prediction),'Completed prediction disagrees with its committed response.');}
 const challenge=raw.challenge;check(challenge&&boolean(challenge.started),'Invalid Challenge start.');
 const session=restoreSession(challenge.session);check(challenge.started||session.history.length===0,'Unstarted order has results.');
 if(raw.mode==='challenge'){
  check(challenge.started,'Challenge must be started.');const task=CHALLENGES[session.index];
  check(same(scene.A,task.from)&&scene.B.d===task.to&&scene.B.n===session.selected,'Scene disagrees with the current order.');
 }else if(raw.mode==='free')check(same(scene.A,free.A)&&same(scene.B,free.B),'Free Play scene disagrees with saved servings.');
 else{
  const lesson=LESSONS[l.index],demonstrated=convert(lesson.from,lesson.from.d*(lesson.action==='cut'?2:.5));
  check(scene.B.d===lesson.to&&same(scene.A,['predict','demonstrating'].includes(l.phase)?lesson.from:demonstrated),'Lesson scene disagrees with its phase.');
 }
 const drawer=raw.drawer;check(drawer&&boolean(drawer.open)&&boolean(drawer.opened)&&Number.isSafeInteger(drawer.quietUntil)&&drawer.quietUntil>=0,'Invalid drawer record.');
 check(!drawer.opened||drawer.open,'Unclosed discovery must have an open drawer.');
 check(raw.mode!=='challenge'||!drawer.open,'Challenge drawer must stay closed.');
 return {mode:raw.mode,free,scene,flavors,learn:{index:l.index,phase:l.phase,prediction:l.prediction,committed:l.committed,assisted:l.assisted,completed},challenge:{started:challenge.started,session},drawer:{open:drawer.open,opened:drawer.opened,quietUntil:drawer.quietUntil}};
}
export function encodeProgress(snapshot,identity,now=new Date().toISOString()){
 return JSON.stringify({schema:1,taskset:TASKSET_VERSION,savedAt:now,build:{id:identity.id,sha:identity.sha,builtAt:identity.builtAt},state:validateSnapshot(snapshot)});
}
export function decodeProgress(text){
 check(typeof text==='string'&&text.length<=2_000_000,'Saved work is too large or missing.');
 const raw=JSON.parse(text);check(raw?.schema===1&&raw.taskset===TASKSET_VERSION,'Saved work uses a different activity version.');
 check(typeof raw.savedAt==='string'&&Number.isFinite(Date.parse(raw.savedAt)),'Invalid save time.');
 check(raw.build&&typeof raw.build.id==='string'&&raw.build.id.length<250&&typeof raw.build.sha==='string'&&/^[a-f0-9]{40}$/.test(raw.build.sha),'Invalid build record.');
 return {...raw,state:validateSnapshot(raw.state)};
}
