import test from 'node:test';
import assert from 'node:assert/strict';
import {plate,full,count,amount,beginStroke,extendStroke,applyStroke,runs,LEARN_TASKS,ORDER_TASKS,expectedUnits,matches,createWork,help,commit,nextWork,validateWork,evidence} from '../src/construction.js';
test('every grid: latched strokes, overlap, wrap, empty/full and split contiguous runs',()=>{
 for(const d of [2,4,8,16]){
  let p=plate(d,1);let s=beginStroke(p,2);s=extendStroke(s,1);p=applyStroke(p,s);assert.equal(p.mask,3);assert.equal(s.operation,'add');
  s=beginStroke(p,2);s=extendStroke(s,d);const q=applyStroke(p,s);assert.equal(s.operation,'erase');assert.equal(q.mask,p.mask&~s.units);
  assert.equal(applyStroke(plate(d),{d,operation:'erase',units:full(d)}).mask,0);
  assert.equal(applyStroke(plate(d,full(d)),{d,operation:'add',units:full(d)}).mask,full(d));
  assert.equal(amount(plate(d,full(d))),16);
  const wrap=extendStroke(beginStroke(plate(d),d),1);assert.equal(count(wrap.units),2);
  assert.deepEqual(runs(plate(d)),[]);assert.deepEqual(runs(plate(d,full(d))),[{start:0,length:d}]);
 }
 assert.deepEqual(runs(plate(8,129)),[{start:7,length:2}]);
 assert.deepEqual(runs(plate(8,27)),[{start:0,length:2},{start:3,length:2}]);
});
test('all authored targets are exact; all 20 legacy conversions retained, then mixed extension',()=>{
 assert.equal(ORDER_TASKS.length,24);assert.equal(new Set(ORDER_TASKS.map(t=>t.id)).size,24);
 for(const t of [...LEARN_TASKS,...ORDER_TASKS]){
  const n=t.n*t.grid/t.d;assert.ok(Number.isInteger(n));const plates=[plate(t.grid,t.whole?full(t.grid):full(n)),plate(t.grid,t.whole?full(n):0)];
  assert.equal(matches(t,plates,`${t.n}/${t.d}`),true);assert.equal(plates.reduce((a,p)=>a+amount(p),0),expectedUnits(t));
 }
 const t=ORDER_TASKS[20];assert.equal(matches(t,[plate(4,7),plate(4,7)]),false);assert.equal(matches(t,[plate(4,3),plate(4,15)]),true);
 assert.equal(matches(ORDER_TASKS[2],[plate(8,7),plate(8)]),false,'same piece count is not same amount');
});
test('immutable committed responses, retries, help, no double-submit/advance and verified recovery',()=>{
 let w=createWork('challenge','local-test');w=commit(w);w=help(w,'hint');w={...w,plates:[plate(4,3),plate(4)]};w=commit(w);
 assert.equal(w.history[0].plates[0].mask,0);assert.equal(w.solved,true);assert.equal(commit(w),w);
 assert.deepEqual(validateWork(JSON.parse(JSON.stringify(w))),w);assert.equal(evidence(w)[0].retries,1);assert.equal(evidence(w)[0].firstWithoutHelp,false);
 const bad=structuredClone(w);bad.plates[0].mask=1;assert.throws(()=>validateWork(bad));
 const next=nextWork(w);assert.equal(nextWork(next),next);assert.deepEqual(validateWork(next),next);
 const tampered=structuredClone(w);tampered.history[0].correct=true;assert.throws(()=>validateWork(tampered));
});
test('all orders including zero and whole complete with recoverable exact evidence',()=>{
 let w=createWork('challenge','test');for(const t of ORDER_TASKS){const n=t.n*t.grid/t.d;w=commit({...w,plates:[plate(t.grid,t.whole?full(t.grid):full(n)),plate(t.grid,t.whole?full(n):0)]});assert.ok(w.solved);w=nextWork(w);assert.deepEqual(validateWork(w),w);}assert.ok(w.complete);assert.equal(evidence(w).filter(r=>r.firstWithoutHelp).length,24);
});
