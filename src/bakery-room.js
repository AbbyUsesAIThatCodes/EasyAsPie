import { barPosition } from './bakery-geometry.js';
import * as THREE from 'three';
import { box, mesh, material, noise, BAR_LENGTH, BAR_DEPTH, BAR_Y, BAR_Z, PIE_X } from './bakery-geometry.js';
import {COUNTER,SUPPLY} from './serving-layout.js';

function woodTexture() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d'), data = ctx.createImageData(512, 512);
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const warp = y + 4 * Math.sin(x / 59) + 2 * Math.sin(x / 23 + y / 47);
    const grain = Math.sin(warp * 1.2) * 3 + Math.sin(warp * 0.12) * 7 + (noise(x + y * 512) - 0.5) * 6;
    const seam = y % 128 < 2 ? -24 : 0, i = (y * 512 + x) * 4;
    data.data.set([210 + grain + seam, 155 + grain + seam, 92 + grain + seam, 255], i);
  }
  ctx.putImageData(data, 0, 0); const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); t.anisotropy = 4; return t;
}
export function makeRoom(scene) {
  const wood = material('#fff4df', 0.46, { map: woodTexture() });
  const teal = material('#769c92', 0.62), edge = material('#9db8a6'), deep = material('#47675f'), cream = material('#f8e8c8'), brass = material('#cb913f', 0.25, { metalness: 0.75 });
  const counter=box(scene,COUNTER.width,COUNTER.height,COUNTER.depth,wood,COUNTER.x,COUNTER.y,COUNTER.z,.09);counter.name='work-counter';
  const obstacles=[];const cabinet=(name,...args)=>{const m=box(scene,...args);m.name=name;obstacles.push(m);return m;};
  box(scene, 13, 2.3, 4, deep, 0, -1.50, -0.50);
  box(scene, 22, 10, 0.15, material('#fae8a8'), 0, 1.5, -9);
  box(scene, .16, 10, 6, material('#f1e5bc'), -9.5, 1.5, -4.5);
  box(scene, .16, 10, 6, material('#c6e1d1'), 9.5, 1.5, -4.5);
  box(scene, 22, .16, 18, material('#e4cb8e'), 0, -2.7, 0);
  // Back cabinetry: recessed panels, proud rails, knobs and an actual shelf.
  for (const x of [-7.2, 7.2]) {
    cabinet('side-cabinet',2.32,3.4,.27,teal,x,.85,-5.85);
    cabinet('side-panel',1.91,2.82,.08,deep,x,.85,-5.66);
    cabinet('side-frame',1.74,2.65,.10,edge,x,.85,-5.59);
    mesh(scene, new THREE.SphereGeometry(0.085, 12, 8), brass, x + 0.73, 0.7, -5.45);
  }
  box(scene, 15.3, 0.18, 0.9, wood, 0, 2.7, -5.50);
  for (let i = 0; i < 6; i++) {
    const x = -1.7 + i * 0.95, h = 0.45 + noise(i) * 0.5;
    mesh(scene, new THREE.CylinderGeometry(0.21, 0.23, h, 24), material(['#eee0bd', '#c6d8be', '#918595'][i % 3], 0.3), x+3, 2.82 + h / 2, -5.50);
    mesh(scene, new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24), wood, x+3, 2.86 + h, -5.50);
  }
  // Side window and mullions are geometry; warm key light crosses the counter.
  const window = new THREE.Group(); window.position.set(-8.65, 1.65, -2.8); window.rotation.y = Math.PI / 2; scene.add(window);
  box(window, 3.5, 3.5, 0.12, material('#eef6ce', 1, { emissive: '#f2edb6', emissiveIntensity: 0.45 }), 0, 0, -0.1);
  for (const x of [-1.75, 0, 1.75]) box(window, 0.12, 3.65, 0.23, cream, x, 0, 0.06);
  for (const y of [-1.75, 0, 1.75]) box(window, 3.65, 0.12, 0.23, cream, 0, y, 0.06);
  const sun=mesh(window,new THREE.CircleGeometry(.55,32),new THREE.MeshBasicMaterial({color:'#ffd35d'}),.75,.7,.01);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const ray=box(window,.09,.27,.03,material('#f9c43e'),.75+Math.sin(a)*.8,.7+Math.cos(a)*.8,.025);ray.rotation.z=-a;}
  for(const p of [[-.8,-.45],[-.4,-.3],[.0,-.45]]){const cloud=mesh(window,new THREE.SphereGeometry(.37,12,8),material('#fff9df'),p[0],p[1],.02);cloud.scale.set(1.3,.6,.1);}
  // A second back window and a bee tile make the room readable at either orbit extreme.
  box(scene,3.1,1.7,.12,material('#bde9e0'),-4.5,4,-6.35);
  for(const x of [-6.1,-4.5,-2.9])box(scene,.1,1.9,.15,cream,x,4,-6.23);
  for(const y of [3.1,4.9])box(scene,3.3,.1,.15,cream,-4.5,y,-6.23);
  const bee=new THREE.Group();bee.position.set(7.7,1.8,-5);scene.add(bee);
  const body=mesh(bee,new THREE.SphereGeometry(.34,16,10),material('#f3c64d'));body.scale.set(1.5,1,.45);
  for(const x of [-.14,.13])box(bee,.095,.57,.05,material('#57453a'),x,0,.16);
  for(const x of [-.2,.2]){const wing=mesh(bee,new THREE.SphereGeometry(.22,12,8),material('#fffaf1'),x,.35,0);wing.scale.set(.65,1,.3);}
  mesh(bee,new THREE.SphereGeometry(.045,8,6),material('#332b30'),.35,.08,.2);
  // Lemons stay at the rear edge, away from mathematical units and hit targets.
  for(let i=0;i<4;i++){const lemon=mesh(scene,new THREE.SphereGeometry(.24,16,10),material('#f4cf38'),-6.1+i*.34,.25,-3.4+(i%2)*.25);lemon.scale.set(1.4,.85,.85);const leaf=mesh(scene,new THREE.SphereGeometry(.12,8,6),material('#579162'),-6.1+i*.34,.48,-3.4+(i%2)*.25);leaf.scale.set(1,.15,.5);}
  // Independent supply cabinet: real hinges and visible stacks, never the drawer surprise.
  const {halfWidth,front,back,bottom,top}=SUPPLY,cy=(bottom+top)/2,cz=(front+back)/2;
  cabinet('supply-back',halfWidth*2,top-bottom,.12,deep,0,cy,back);
  for(const x of [-halfWidth,halfWidth])cabinet('supply-side',.12,top-bottom,front-back,deep,x,cy,cz);
  cabinet('supply-roof',halfWidth*2,.12,front-back,wood,0,top,cz);
  cabinet('supply-shelf',halfWidth*2,.1,front-back,wood,0,bottom,cz);
  cabinet('supply-base',halfWidth*2,3.35,front-back,teal,0,-1.025,cz);
  for(const x of [-2.1,2.1])for(let i=0;i<6;i++){
    const stack=mesh(scene,new THREE.CylinderGeometry(1.89,1.84,.06,64),cream,x,.79+i*.1,SUPPLY.stackZ);
    const rim=mesh(scene,new THREE.TorusGeometry(1.87,.02,6,64),brass,x,.83+i*.1,SUPPLY.stackZ);rim.rotation.x=Math.PI/2;
  }
  const supplyDoors=[];
  for(const sign of [-1,1]){const hinge=new THREE.Group();hinge.name='supply-door';hinge.position.set(sign*halfWidth,cy,front);scene.add(hinge);box(hinge,halfWidth-.03,top-bottom,.13,teal,-sign*halfWidth/2,0,0);box(hinge,halfWidth-.38,top-bottom-.34,.09,edge,-sign*halfWidth/2,0,.1);mesh(hinge,new THREE.SphereGeometry(.09,12,8),brass,-sign*(halfWidth-.25),0,.2);supplyDoors.push(hinge);obstacles.push(hinge);}
  // Foreground cabinets remain behind the moving tray.
  for (const x of [-5.5, 5.5]) {
    box(scene, 1.35, 1.9, 0.15, teal, x, -1.3, 1.6);
    box(scene, 1.05, 1.55, 0.09, edge, x, -1.3, 1.7);
  }
  // Small ceramic crock and folded cloth ground the edges without hiding pies.
  const crock = mesh(scene, new THREE.CylinderGeometry(0.30, 0.35, 0.65, 32), cream, -7.6, 0.34, -3.4);
  for (const y of [0.22, 0.5]) { const stripe = mesh(scene, new THREE.TorusGeometry(0.325, 0.018, 6, 32), teal, crock.position.x, y, crock.position.z); stripe.rotation.x = Math.PI / 2; }
  for (let i = 0; i < 3; i++) { const spoon = box(scene, 0.05, 0.9, 0.06, wood, -7.6 + i * 0.1, 0.85, -3.42); spoon.rotation.z = (i - 1) * 0.2; }
  box(scene,.85,.055,1.1,material('#e6decc'),7.2,.055,-3.2);
  for(let i=0;i<5;i++)box(scene,.065,.058,1.1,material('#8b9fba'),6.85+i*.17,.06,-3.2,.01);
  const drawer = new THREE.Group(); drawer.name = 'fraction-drawer'; scene.add(drawer);
  box(drawer, 10.55, 0.10, 1.78, wood, 0, -0.69, 0.89);
  for (const x of [-5.3, 5.3]) box(drawer, 0.14, 0.41, 1.85, wood, x, -0.54, 0.89);
  box(drawer, 10.65, 0.20, 0.12, wood, 0, -0.57, 0);
  box(drawer, 10.95, 0.50, 0.17, cream, 0, -0.69, 1.86, 0.055);
  for (const x of [-0.8, 0.8]) mesh(drawer, new THREE.SphereGeometry(0.095, 12, 8), brass, x, -0.72, 2.00);
  const handle = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.8, -0.72, 2), new THREE.Vector3(-0.66, -0.77, 2.17), new THREE.Vector3(0.66, -0.77, 2.17), new THREE.Vector3(0.8, -0.72, 2)]);
  mesh(drawer, new THREE.TubeGeometry(handle, 24, 0.065, 8, false), brass);
  // Rails extend toward the viewer with the tray and receive live shadows.
  for (const x of [-5.16, 5.16]) box(drawer, 0.055, 0.06, 2.2, brass, x, -0.65, 0.68);
  return {drawer,counter,obstacles,supplyDoors,setSupply:value=>supplyDoors.forEach((door,i)=>door.rotation.y=(i?1:-1)*value*SUPPLY.openAngle)};
}
export function makeBar(serving, side) {
  const group = new THREE.Group(); group.position.set(barPosition(side).x, BAR_Y, barPosition(side).z);
  const step = BAR_LENGTH / serving.d;
  box(group, BAR_LENGTH + 0.10, 0.08, BAR_DEPTH + 0.09, material('#34213f'), 0, -0.05, 0, 0.035);
  for (let i = 0; i < serving.d; i++) {
    const tile = box(group, step - 0.012, 0.07, BAR_DEPTH, material('#f9e7bf', 0.32), -BAR_LENGTH / 2 + step * (i + 0.5), 0.012, 0, 0.016);
    tile.userData.piece = i + 1;
    const dot = mesh(tile, new THREE.SphereGeometry(0.031, 8, 6), material('#fff5da', 0.4), 0, 0.048, 0);
    dot.scale.y = 0.25; dot.name = 'selected-dot';
  }
  setBarServing(group, serving); return group;
}
export function setBarServing(group, serving) {
  group.children.filter(o => o.userData.piece).forEach(tile => {
    const selected = serving.mask===undefined?tile.userData.piece <= serving.n:!!(serving.mask&(1<<(tile.userData.piece-1)));
    tile.material.color.set(selected ? '#7750d6' : '#f9e7bf'); tile.getObjectByName('selected-dot').visible = selected;
  });
  group.userData.serving = { ...serving };
}
