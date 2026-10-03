import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {arrivingPlate,SUPPLY,COUNTER} from '../src/serving-layout.js';
import {makeKnife} from '../src/construction-art.js';
import {dispose} from '../src/bakery-geometry.js';

test('serving knife handles point outward with blades between the handle and center at every boundary',()=>{
 for(const d of [2,4,8,16])for(let i=0;i<d;i++){
  const k=makeKnife(),a=Math.PI+i*Math.PI*2/d;k.rotation.y=a;k.updateMatrixWorld(true);
  const h=k.getObjectByName('handle').getWorldPosition(new THREE.Vector3()),b=k.getObjectByName('blade').getWorldPosition(new THREE.Vector3()),out=new THREE.Vector3(Math.sin(a),0,Math.cos(a));
  assert.ok(h.dot(out)>1.94);assert.ok(b.dot(out)>0&&b.dot(out)<1.64);assert.ok(h.clone().cross(out).length()<1e-10);dispose(k);
 }
});
test('incoming plates clear the opening before spreading and settle on the counter with the task count',()=>{
 assert.ok(COUNTER.z-COUNTER.depth/2>SUPPLY.front+.1);
 for(const total of [1,2])for(let side=0;side<total;side++){
  const start=arrivingPlate(side,total,0),end=arrivingPlate(side,total,1);assert.equal(start.z,SUPPLY.stackZ);assert.equal(end.y,0);assert.equal(end.z,-.65);assert.equal(end.x,total===1?-2.15:side?3.55:-3.55);
  for(let i=0;i<=1000;i++){const p=arrivingPlate(side,total,i/1000);assert.ok(p.y>=0);if(p.z<-.65)assert.ok(Math.abs(p.x)+1.94<SUPPLY.halfWidth-.1);if(p.y<.1)assert.ok(p.z-1.94>COUNTER.z-COUNTER.depth/2);}
 }
});
