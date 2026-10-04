export const QUIET_MS = 600_000;
// Wall-clock quiet period survives reload; visible-time animation never catches up.
export function createDrawerCue({quietUntil=0,opened=false}={}) {
 return {quietUntil:Number.isFinite(quietUntil)&&quietUntil>0?quietUntil:0,opened:opened===true,visibleMs:0,lastTime:null};
}
export function settleDrawerCue(state,open,user,now) {
 if(!user)return {...state,opened:false};
 if(open)return {...state,opened:true};
 return state.opened?{...state,opened:false,quietUntil:now+QUIET_MS,visibleMs:0,lastTime:null}:state;
}
export function tickDrawerCue(state,{now,enabled,visible}) {
 if(!enabled||!visible||now<state.quietUntil)return {state:{...state,lastTime:null},show:false};
 const elapsed=state.lastTime===null?0:Math.max(0,Math.min(250,now-state.lastTime));
 const next={...state,lastTime:now,visibleMs:state.visibleMs+elapsed};
 const phase=next.visibleMs%12_000;
 return {state:next,show:phase>=2_000&&phase<5_500};
}
