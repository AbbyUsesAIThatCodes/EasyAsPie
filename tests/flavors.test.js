import test from 'node:test';
import assert from 'node:assert/strict';
import {makePie,RECIPES,setPieServing} from '../src/pies.js';
import {dispose} from '../src/bakery-geometry.js';
test('every flavor uses identical core solids and keeps its recipe through serving changes',()=>{
 for(const d of [2,4,8,16]){
  const reference=makePie({n:0,d},'blueberry',0);
  for(const recipe of Object.keys(RECIPES)){
   const pie=makePie({n:d/2,d},recipe,1);
   for(const [i,w]of pie.children.filter(o=>o.userData.slice).entries()){
    const original=reference.children.filter(o=>o.userData.slice)[i];
    for(const name of ['pastry-solid','filling-solid'])assert.deepEqual(w.getObjectByName(name).geometry.attributes.position.array,original.getObjectByName(name).geometry.attributes.position.array);
   }
   setPieServing(pie,{n:d,d});assert.equal(pie.userData.recipe,recipe);assert.deepEqual(pie.userData.serving,{n:d,d});dispose(pie);
  }
  dispose(reference);
 }
});
