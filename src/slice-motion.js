import * as THREE from 'three';
import {TAU,point,mesh,box,material,dispose} from './bakery-geometry.js';

// A visual transition owns transforms only; the fraction model owns all amounts.
export function sliceMotion(pie,bar,type,from,to,{reduced,onFrame,onFinish}) {
 const wedges=pie.children.filter(o=>o.userData.slice), tiles=bar.children.filter(o=>o.userData.piece);
 const knife=new THREE.Group();knife.name='cutting-knife';pie.add(knife);
 // The blade is a solid rounded wedge with a brass bolster and purple handle.
 const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(1.72,0);shape.lineTo(1.72,.36);shape.lineTo(.30,.36);shape.quadraticCurveTo(.05,.28,0,0);shape.closePath();
 const blade=mesh(knife,new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.02,bevelThickness:.012,bevelSegments:2,steps:1}),new THREE.MeshStandardMaterial({color:'#dbe8ef',roughness:.18,metalness:.8}));
 blade.rotation.y=-Math.PI/2;blade.position.z=.02;
 box(knife,.12,.39,.12,material('#d2a153',.23,{metalness:.7}),0,.18,1.76);
 box(knife,.18,.25,.60,material('#634192',.28),0,.20,2.10,.07);
 knife.visible=type==='cut';
 let frame=0,finished=false;const start=performance.now(), duration=1450;
 const finish=()=>{if(finished)return;finished=true;cancelAnimationFrame(frame);wedges.forEach(w=>{w.position.set(0,0,0);w.rotation.set(0,0,0);});tiles.forEach(t=>{t.position.y=.012;t.scale.set(1,1,1);});pie.remove(knife);dispose(knife);onFinish();};
 const tick=now=>{
  if(finished)return;
  const t=Math.min(1,(now-start)/duration);
  if(t===1||reduced.matches){finish();return;}
  // Cut pieces open after the blade descends; regroup starts separated, then closes.
  const spread=type==='cut'?Math.sin(Math.PI*Math.max(0,(t-.20)/.80)):(1-t)*Math.sin(Math.min(1,t/.15)*Math.PI/2);
  wedges.forEach((w,i)=>{const a=w.userData.start+w.userData.angle/2;const distance=.23*Math.max(0,spread);w.position.copy(point(distance,a,.13*Math.max(0,spread)));w.rotation.x=Math.sin(a)*.025*spread;w.rotation.z=-Math.cos(a)*.025*spread;});
  tiles.forEach((tile,i)=>{tile.position.y=.012+.075*Math.max(0,spread);tile.scale.x=1-.07*Math.max(0,spread);});
  const pass=Math.min(.999,t/.58)*from.d, boundary=Math.floor(pass), phase=pass-boundary;
  knife.rotation.y=Math.PI+(boundary+.5)*TAU/from.d;
  knife.position.y=.35+(1-Math.sin(Math.PI*phase)*1.23);
  knife.visible=type==='cut'&&t<.58;
  onFrame();frame=requestAnimationFrame(tick);
 };
 if(reduced.matches)finish();else frame=requestAnimationFrame(tick);
 return finish;
}
