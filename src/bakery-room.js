import { barPosition } from './bakery-geometry.js';
import * as THREE from 'three';
import { box, mesh, material, noise, BAR_LENGTH, BAR_DEPTH, BAR_Y, BAR_Z, PIE_X } from './bakery-geometry.js';

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
  box(scene, 16, 0.30, 7.2, wood, 0, -0.16, -1.5, 0.09);
  box(scene, 13, 2.3, 4, deep, 0, -1.50, -0.50);
  box(scene, 13, 6, 0.15, material('#d9c9a7'), 0, 1.0, -3.6);
  // Back cabinetry: recessed panels, proud rails, knobs and an actual shelf.
  for (const x of [-4.8, -2.4, 0, 2.4, 4.8]) {
    box(scene, 2.32, 3.4, 0.27, teal, x, 0.85, -3.25);
    box(scene, 1.91, 2.82, 0.08, deep, x, 0.85, -3.06);
    box(scene, 1.74, 2.65, 0.10, edge, x, 0.85, -2.99);
    mesh(scene, new THREE.SphereGeometry(0.085, 12, 8), brass, x + 0.73, 0.7, -2.85);
  }
  box(scene, 7.3, 0.18, 0.9, wood, 1.1, 1.80, -2.80);
  for (let i = 0; i < 6; i++) {
    const x = -1.7 + i * 0.95, h = 0.45 + noise(i) * 0.5;
    mesh(scene, new THREE.CylinderGeometry(0.21, 0.23, h, 24), material(['#eee0bd', '#c6d8be', '#918595'][i % 3], 0.3), x, 1.92 + h / 2, -2.90);
    mesh(scene, new THREE.CylinderGeometry(0.24, 0.24, 0.08, 24), wood, x, 1.96 + h, -2.90);
  }
  // Side window and mullions are geometry; warm key light crosses the counter.
  const window = new THREE.Group(); window.position.set(-6.15, 2.75, -2); window.rotation.y = Math.PI / 2; scene.add(window);
  box(window, 3.5, 3.5, 0.12, material('#eef6ce', 1, { emissive: '#f2edb6', emissiveIntensity: 0.45 }), 0, 0, -0.1);
  for (const x of [-1.75, 0, 1.75]) box(window, 0.12, 3.65, 0.23, cream, x, 0, 0.06);
  for (const y of [-1.75, 0, 1.75]) box(window, 3.65, 0.12, 0.23, cream, 0, y, 0.06);
  // Foreground cabinets remain behind the moving tray.
  for (const x of [-5.5, 5.5]) {
    box(scene, 1.35, 1.9, 0.15, teal, x, -1.3, 1.6);
    box(scene, 1.05, 1.55, 0.09, edge, x, -1.3, 1.7);
  }
  // Small ceramic crock and folded cloth ground the edges without hiding pies.
  const crock = mesh(scene, new THREE.CylinderGeometry(0.30, 0.35, 0.65, 32), cream, -5.15, 0.34, -0.6);
  for (const y of [0.22, 0.5]) { const stripe = mesh(scene, new THREE.TorusGeometry(0.325, 0.018, 6, 32), teal, crock.position.x, y, crock.position.z); stripe.rotation.x = Math.PI / 2; }
  for (let i = 0; i < 3; i++) { const spoon = box(scene, 0.05, 0.9, 0.06, wood, -5.15 + i * 0.1, 0.85, -0.62); spoon.rotation.z = (i - 1) * 0.2; }
  box(scene, 0.85, 0.055, 1.85, material('#e6decc'), 5.0, 0.055, -0.2);
  for (let i = 0; i < 5; i++) box(scene, 0.065, 0.058, 1.85, material('#8b9fba'), 4.65 + i * 0.17, 0.06, -0.2, 0.01);
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
  return { drawer };
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
    const selected = tile.userData.piece <= serving.n;
    tile.material.color.set(selected ? '#7750d6' : '#f9e7bf'); tile.getObjectByName('selected-dot').visible = selected;
  });
  group.userData.serving = { ...serving };
}
