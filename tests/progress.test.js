import test from 'node:test';
import assert from 'node:assert/strict';
import {createFreePlay} from '../src/free-play.js';
import {createSession,selectSlices,submit,useHint,markAssisted,advance,answerFor,restoreSession} from '../src/session.js';
import {CHALLENGES} from '../src/exercises.js';
import {encodeProgress,decodeProgress} from '../src/progress.js';
import {activityReport} from '../src/activity-report.js';
const identity={id:'test-build',sha:'a'.repeat(40),builtAt:'2026-09-30T00:00:00.000Z',version:'0.4.0',codename:null,dirty:false};
const snapshot=()=>({mode:'free',free:createFreePlay(),scene:createFreePlay(),flavors:{A:'strawberry',B:'apple'},learn:{index:0,phase:'predict',prediction:'',committed:null,assisted:false,completed:[]},challenge:{started:false,session:createSession(identity.id)},drawer:{open:false,opened:false,quietUntil:600000}});
test('local progress has no time expiry; flavors, exact notation and cue quiet period survive round trip',()=>{
 const state=snapshot();state.free=createFreePlay({A:{n:8,d:16},B:{n:3,d:8}});state.scene=state.free;
 const restored=decodeProgress(encodeProgress(state,identity,'2020-01-01T00:00:00.000Z'));
 assert.deepEqual(restored.state,state);assert.equal(restored.savedAt,'2020-01-01T00:00:00.000Z');
});
test('malformed, unsupported and inconsistent saved work is rejected without changing its input',()=>{
 const text=encodeProgress(snapshot(),identity),raw=JSON.parse(text);
 for(const mutate of [r=>r.schema=2,r=>r.taskset='old-ten',r=>r.state.free.A.d=3,r=>r.state.flavors.A='constructor',r=>r.state.drawer.quietUntil=-1,r=>r.state.scene.B.n=99,r=>r.state.learn.phase='anything']){
  const bad=structuredClone(raw);mutate(bad);const before=JSON.stringify(bad);assert.throws(()=>decodeProgress(before));assert.equal(JSON.stringify(bad),before);
 }
 assert.throws(()=>decodeProgress('{'));assert.equal(decodeProgress(text).state.flavors.A,'strawberry');
});
test('completed Learn restores only its correct serving; unfinished responses and other modes stay valid',()=>{
 for(const [index,A,B,committed] of [[0,{n:2,d:4},{n:4,d:8},'0'],[1,{n:6,d:8},{n:3,d:4},'6'],[2,{n:6,d:16},{n:6,d:16},'6']]){
  const state=snapshot();state.mode='learn';state.scene=createFreePlay({A,B});
  state.learn={index,phase:'done',prediction:committed,committed,assisted:false,completed:[[index,{predictionCorrect:index!==0,assisted:false}]]};
  const valid=encodeProgress(state,identity);assert.deepEqual(decodeProgress(valid).state,state);
  for(let n=0;n<=B.d;n++)if(n!==B.n){
   const bad=JSON.parse(valid);bad.state.scene.B.n=n;const text=JSON.stringify(bad);
   assert.throws(()=>decodeProgress(text),/Completed lesson serving disagrees with its target/);
   assert.equal(JSON.stringify(bad),text);
  }
  state.learn.phase='build';state.scene=createFreePlay({A,B:{n:0,d:B.d}});
  assert.deepEqual(decodeProgress(encodeProgress(state,identity)).state,state);
  state.learn.phase='done';state.mode='free';state.scene=state.free;
  assert.deepEqual(decodeProgress(encodeProgress(state,identity)).state,state);
 }
});
test('history replay retains retries and help, rejects forged first-try flags and impossible advancement',()=>{
 let s=createSession('original-build');s=submit(selectSlices(s,0));s=markAssisted(s,'free-play');s=useHint(s);s=submit(selectSlices(s,answerFor(s).n));s=advance(s);s=selectSlices(s,1);
 assert.deepEqual(restoreSession(s),s);
 const forged=structuredClone(s);forged.results[0].firstTry=true;assert.throws(()=>restoreSession(forged));
 const lostHelp=structuredClone(s);lostHelp.history=lostHelp.history.filter(e=>e.kind!=='help');assert.throws(()=>restoreSession(lostHelp));
 const outOfOrder=createSession();outOfOrder.history.push({kind:'advance',id:CHALLENGES[0].id});assert.throws(()=>restoreSession(outOfOrder));
});
test('twenty distinct authored conversions cover both directions, factors two/four/eight, zero and whole',()=>{
 assert.equal(CHALLENGES.length,20);assert.equal(new Set(CHALLENGES.map(t=>`${t.from.n}/${t.from.d}:${t.to}`)).size,20);
 for(const factor of [2,4,8])for(const direction of [1,-1])assert.ok(CHALLENGES.some(t=>t.to/t.from.d===(direction===1?factor:1/factor)));
 assert.ok(CHALLENGES.some(t=>t.from.n===0));assert.ok(CHALLENGES.some(t=>t.from.n===t.from.d));
});
test('download reports every response, retry/help source, original build and exact current build',()=>{
 let s=createSession('original-build');
 for(let i=0;i<CHALLENGES.length;i++){
  if(i===0){s=submit(selectSlices(s,0));s=markAssisted(s,'free-play');s=markAssisted(s,'learn');s=useHint(s);s=markAssisted(s,'reference');}
  s=submit(selectSlices(s,answerFor(s).n));s=advance(s);
 }
 const {html,metadata}=activityReport(s,identity,'2026-10-01T00:00:00.000Z');
 assert.equal(metadata.summary.completed,20);assert.equal(metadata.summary.firstWithoutHelp,19);assert.equal(metadata.orders[0].retries,1);
 assert.deepEqual(metadata.orders[0].responses,[{fraction:'0/4',correct:false},{fraction:'2/4',correct:true}]);assert.deepEqual(metadata.orders[0].help,['free-play','learn','hint','reference']);
 assert.match(html,/original-build/);assert.match(html,/test-build/);assert.match(html,/0\/4 — Not Yet/);assert.match(html,/No information was sent to a server/);
 assert.doesNotMatch(activityReport(s,{...identity,id:'<script>bad</script>'}).html,/<script>bad<\/script>/);
});

test('an edited unsubmitted response restores without stale feedback or invented credit',()=>{
 let s=submit(selectSlices(createSession('build'),1));s=selectSlices(s,2);const restored=restoreSession(s);assert.equal(restored.selected,2);assert.equal(restored.feedback,'');assert.equal(restored.attempts,1);assert.equal(restored.solved,false);assert.equal(restored.results.length,0);
});
