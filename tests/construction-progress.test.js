import test from 'node:test';
import assert from 'node:assert/strict';
import {createWork,commit,help,nextWork,plate} from '../src/construction.js';
import {createFreePlay} from '../src/free-play.js';
import {encode,decode,report} from '../src/construction-progress.js';
const identity={id:'0.4.1_Unassigned_local-test_build-001',sha:'a'.repeat(40),builtAt:'2026-10-03T00:00:00Z'};
const snapshot=()=>({mode:'learn',free:createFreePlay(),flavors:{A:'strawberry',B:'apple'},learn:createWork('learn',identity.id),challenge:createWork('challenge',identity.id),archives:[],challengeStarted:false,drawerOpen:true});
test('new save is versioned, has no expiry, preserves all modes and anonymous exact history',()=>{
 const s=snapshot();s.challenge=commit(s.challenge);s.challenge=help(s.challenge,'hint');s.challenge=commit({...s.challenge,plates:[plate(4,12),plate(4)]});s.challenge=nextWork(s.challenge);
 for(const mode of ['free','learn','challenge']){s.mode=mode;const text=encode(s,identity),raw=JSON.parse(text);raw.savedAt='2020-01-01T00:00:00Z';assert.deepEqual(decode(JSON.stringify(raw)).state,s);}
 const {html,metadata}=report(s,identity);assert.equal(metadata.sessions[1].rows[0].responses[1].plates[0].mask,12);assert.equal(metadata.sessions[1].rows[0].retries,1);assert.equal(metadata.sessions[1].rows[0].firstWithoutHelp,false);assert.ok(html.includes(identity.id));
});
test('reject inconsistent, corrupt, wrong-grid and unsupported saves without altering caller data',()=>{
 for(const mutate of [r=>r.schema=1,r=>r.taskset='future',r=>delete r.state.free.A,r=>r.state.learn.plates[1].mask=1,r=>r.state.challenge.plates[0].d=8,r=>r.state.learn.solved=true,r=>r.state.flavors.A='unknown',r=>r.state.archives=[{mode:'challenge'}]]){
  const raw=JSON.parse(encode(snapshot(),identity));mutate(raw);const text=JSON.stringify(raw);assert.throws(()=>decode(text));assert.equal(JSON.stringify(raw),text);
 }
});
