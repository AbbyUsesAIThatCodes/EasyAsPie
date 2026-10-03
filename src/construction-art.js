import * as THREE from 'three';
import {TAU,RADIUS,HIT_Y,point,mesh,material,solidSector,dispose,box} from './bakery-geometry.js';
import {occupied,runs} from './construction.js';

function removeNamed(group,name){const old=group.getObjectByName(name);if(old){group.remove(old);dispose(old);}}
export function paintConstruction(pie,p){
 removeNamed(pie,'selected-serving');removeNamed(pie,'unit-guides');
 const guides=new THREE.Group();guides.name='unit-guides';pie.add(guides);
 for(let i=0;i<p.d;i++){
  const a=Math.PI+i*TAU/p.d;
  mesh(guides,new THREE.TubeGeometry(new THREE.LineCurve3(point(.06,a,.16),point(RADIUS,a,.16)),1,.012,4,false),material('#b99d6b'));
  const dot=mesh(guides,new THREE.SphereGeometry(.036,8,6),material('#a9864e'),...point(1.77,a+TAU/p.d/2,.23).toArray());dot.scale.y=.3;
 }
 pie.children.filter(o=>o.userData.slice).forEach(wedge=>{
  const k=wedge.userData.slice;wedge.visible=occupied(p,k);wedge.userData.selected=wedge.visible;
  // Internal grid data survives; only external edges are visible on a merged serving.
  const cut=wedge.getObjectByName('unit-cut');if(cut)cut.visible=!occupied(p,(k-2+p.d)%p.d+1);
 });
 const outline=new THREE.Group();outline.name='selected-serving';pie.add(outline);
 for(const run of runs(p)){
  const start=Math.PI+run.start*TAU/p.d,angle=run.length*TAU/p.d;
  const points=Array.from({length:65},(_,i)=>point(1.655,start+angle*i/64,HIT_Y+.015));
  if(run.length<p.d)points.push(point(0,start,HIT_Y+.015),points[0]);
  const curve=new THREE.CurvePath();for(let i=1;i<points.length;i++)curve.add(new THREE.LineCurve3(points[i-1],points[i]));
  mesh(outline,new THREE.TubeGeometry(curve,128,.025,5,false),new THREE.MeshBasicMaterial({color:'#883ee7'}));
 }
 pie.userData.construction={...p};
}
export function paintPreview(pie,stroke){
 removeNamed(pie,'stroke-preview');if(!stroke)return;
 const preview=new THREE.Group();preview.name='stroke-preview';pie.add(preview);
 for(let i=0;i<stroke.d;i++)if(stroke.units&(1<<i)){
  const m=new THREE.MeshBasicMaterial({color:stroke.operation==='add'?'#a346ff':'#ed445d',transparent:true,opacity:.55,depthTest:false,depthWrite:false});
  const sector=mesh(preview,solidSector(1.63,1.63,.025,Math.PI+i*TAU/stroke.d,TAU/stroke.d),m,0,HIT_Y+.04);sector.renderOrder=5;sector.castShadow=false;
 }
}
export function animateUnits(pie,before,after,{reduced,onFrame}){
 const changed=before.mask^after.mask;if(!changed||reduced.matches)return ()=>{};
 const moving=pie.children.filter(o=>o.userData.slice&&(changed&(1<<(o.userData.slice-1))));
 let frame,done=false;const start=performance.now(),puffs=new THREE.Group();pie.add(puffs);
 moving.forEach(w=>{w.visible=true;if(!occupied(after,w.userData.slice)){const a=w.userData.start+w.userData.angle/2;for(let i=0;i<4;i++){const puff=mesh(puffs,new THREE.SphereGeometry(.06,6,4),material('#eadbba'),...point(.8+i*.16,a,.65).toArray());puff.userData.seed=i;}}});
 const finish=()=>{if(done)return;done=true;cancelAnimationFrame(frame);moving.forEach(w=>{w.scale.setScalar(1);w.visible=occupied(after,w.userData.slice);});pie.remove(puffs);dispose(puffs);onFrame();};
 const tick=now=>{const t=Math.min(1,(now-start)/380);for(const w of moving){const add=occupied(after,w.userData.slice);const s=add?(t<.65?1.12*Math.sin(t/.65*Math.PI/2):1+.12*Math.cos((t-.65)/.35*Math.PI/2)):1-t;w.scale.set(s,add?Math.max(.05,s-(t>.5&&t<.8?.12:0)):s,s);}puffs.children.forEach(p=>{p.position.y+=.016;p.scale.setScalar(Math.sin(t*Math.PI)*1.6);});onFrame();if(t===1)finish();else frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return finish;
}
export function makeKnife(){
 const knife=new THREE.Group();
 box(knife,.09,.29,1.42,material('#e6eff2',.2,{metalness:.6}),0,0,.55,.02);
 box(knife,.16,.22,.7,material('#36796f'),0,0,-.46,.05);return knife;
}
export function serveAnimation(pies,plates,room,{reduced,onFrame,onStage}){
 let frame,done=false,start=performance.now(),last='';const knives=new THREE.Group();room.scene.add(knives);
 const homes=pies.map(p=>p.position.clone());
 for(let side=0;side<plates.length;side++)for(const run of runs(plates[side])){
  if(run.length===plates[side].d)continue;
  for(const k of [run.start,run.start+run.length]){const knife=makeKnife();knife.position.copy(homes[side]);knife.position.y=3;knife.rotation.y=Math.PI+k*TAU/plates[side].d;knives.add(knife);}
 }
 const stage=(name)=>{if(last!==name){last=name;onStage(name);}};
 const finish=()=>{if(done)return;done=true;cancelAnimationFrame(frame);pies.forEach((pie,i)=>{pie.position.copy(homes[i]);pie.children.filter(o=>o.userData.slice).forEach(w=>{w.position.set(0,0,0);w.scale.setScalar(1);});paintConstruction(pie,plates[i]);removeNamed(pie,'served-glow');});room.setSupply(0);room.scene.remove(knives);dispose(knives);stage('ready');onFrame();};
 if(reduced.matches){stage('whole');stage('cut');stage('leftovers');stage('glow');stage('serve');stage('cabinet');finish();return {finish,promise:Promise.resolve()};}
 let resolve;const promise=new Promise(r=>resolve=r);const stop=()=>{finish();resolve();};
 const tick=now=>{
  const t=(now-start)/1000;
  const name=t<.55?'whole':t<1.1?'cut':t<1.85?'leftovers':t<2.5?'glow':t<3.1?'serve':t<4?'cabinet':'ready';stage(name);
  for(let i=0;i<pies.length;i++){
   const pie=pies[i],p=plates[i];
   pie.children.filter(o=>o.userData.slice).forEach(w=>{
    const selected=occupied(p,w.userData.slice);w.visible=t<1.85||selected;
    if(!selected&&t>=1.1){const a=Math.min(1,(t-1.1)/.75);w.position.set(-7*a,Math.sin(a*Math.PI)*1.5,0);w.scale.setScalar(1-a*.45);}
   });
   if(t>=1.85&&t<2.5&&!pie.getObjectByName('served-glow')){
    const glow=new THREE.Group();glow.name='served-glow';pie.add(glow);for(const run of runs(p))mesh(glow,solidSector(1.64,1.64,.04,Math.PI+run.start*TAU/p.d,run.length*TAU/p.d),new THREE.MeshBasicMaterial({color:'#b769ff',opacity:.35,transparent:true,depthWrite:false}),0,HIT_Y+.06);
   }
   if(t>=2.5&&t<3.1)pie.position.x=homes[i].x+10*Math.pow((t-2.5)/.6,2);
   if(t>=3.1){pie.visible=true;pie.children.filter(o=>o.userData.slice).forEach(w=>w.visible=false);removeNamed(pie,'served-glow');pie.getObjectByName('selected-serving').visible=false;const a=Math.min(1,(t-3.1)/.9);pie.position.copy(homes[i]).lerp(new THREE.Vector3(i ? 0.82 : -0.82,1.1,-5),1-a);}
  }
  knives.visible=t>=.55&&t<1.1;knives.children.forEach(k=>k.position.y=3-2.15*Math.min(1,Math.max(0,(t-.55)/.55)));
  room.setSupply(t>=3.1?Math.sin(Math.min(1,(t-3.1)/.9)*Math.PI):0);onFrame();if(t>=4)stop();else frame=requestAnimationFrame(tick);
 };frame=requestAnimationFrame(tick);return {finish:stop,promise};
}
