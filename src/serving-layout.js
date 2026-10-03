// Shared physical dimensions for room geometry, serving paths and clearance QA.
export const ROOM=Object.freeze({left:-18,right:18,back:-12,front:16,floor:-2.7,ceiling:13.8});
export const SUPPLY=Object.freeze({halfWidth:4.7,front:-6.6,back:-10.8,bottom:.7,top:3.5,openAngle:1.68,stackZ:-8.7,sourceY:1.52});
export const COUNTER=Object.freeze({width:17.5,depth:6.6,x:0,y:-.16,z:-1.05,height:.3});
const ease=t=>t*t*(3-2*t);
export function arrivingPlate(side,total,progress){
 const a=Math.max(0,Math.min(1,progress)),sourceX=side?2.1:-2.1,targetX=total===1?-2.15:side?3.55:-3.55;
 if(a<.65)return {x:sourceX,y:SUPPLY.sourceY,z:SUPPLY.stackZ+(-.65-SUPPLY.stackZ)*ease(a/.65)};
 const settle=ease((a-.65)/.35);return {x:sourceX+(targetX-sourceX)*settle,y:SUPPLY.sourceY*(1-settle),z:-.65};
}
