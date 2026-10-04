import test from 'node:test';
import assert from 'node:assert/strict';
import {createDrawerCue,settleDrawerCue,tickDrawerCue,QUIET_MS} from '../src/drawer-cue.js';
test('only a genuine settled user open/close grants at least ten minutes quiet',()=>{
 let s=createDrawerCue();s=settleDrawerCue(s,false,true,50);assert.equal(s.quietUntil,0);
 s=settleDrawerCue(s,true,true,100);s=settleDrawerCue(s,false,false,200);assert.equal(s.quietUntil,0);
 s=settleDrawerCue(s,true,true,300);s=settleDrawerCue(s,false,true,400);assert.equal(s.quietUntil,400+QUIET_MS);
 assert.equal(tickDrawerCue({...s,visibleMs:2500},{now:400+QUIET_MS-1,enabled:true,visible:true}).show,false);
 assert.equal(tickDrawerCue({...s,visibleMs:2500},{now:400+QUIET_MS,enabled:true,visible:true}).show,true);
 assert.equal(createDrawerCue(s).quietUntil,s.quietUntil);
});
test('locked and background time cannot run or catch up the decorative cue',()=>{
 let s={...createDrawerCue(),visibleMs:2500,lastTime:100};
 for(const flags of [{enabled:false,visible:true},{enabled:true,visible:false}]){
  const paused=tickDrawerCue(s,{now:200,...flags});assert.equal(paused.show,false);assert.equal(paused.state.visibleMs,2500);
  const resumed=tickDrawerCue(paused.state,{now:200000,enabled:true,visible:true});assert.equal(resumed.state.visibleMs,2500);
 }
 assert.equal(tickDrawerCue({...s,visibleMs:6000},{now:100,enabled:true,visible:true}).show,false);
});
