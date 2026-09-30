import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const TAU = Math.PI * 2;
export const RADIUS = 1.64;
export const PIE_X = 2.55;
export const PIE_Z = -0.65;
export const HIT_Y = 0.99;
export const BAR_LENGTH = 4.4;
export const BAR_DEPTH = 0.40;
export const BAR_Y = -0.50;
export const DRAWER_TRAVEL = 1.85;
export const BAR_Z = 0.60;
export const barPosition = side => ({ x: 0, z: BAR_Z + (side ? 0.36 : -0.36) });
export const point = (r, a, y) => new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r);
export const noise = n => { const v = Math.sin(n * 127.1 + 31.7) * 43758.5453; return v - Math.floor(v); };
export const material = (color, roughness = 0.6, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness, ...extra });
export function mesh(group, geometry, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; group.add(m); return m;
}
export function box(group, w, h, d, mat, x, y, z, radius = 0.04) {
  return mesh(group, new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 3, h / 3, d / 3)), mat, x, y, z);
}
export function instances(group, geometry, mat, transforms) {
  if (!transforms.length) { geometry.dispose(); return; }
  const batch = new THREE.InstancedMesh(geometry, mat, transforms.length), dummy = new THREE.Object3D();
  transforms.forEach((t, i) => {
    dummy.position.copy(t.p); dummy.rotation.set(t.rx || 0, t.ry || 0, t.rz || 0);
    dummy.scale.set(t.sx || t.s || 1, t.sy || t.s || 1, t.sz || t.s || 1); dummy.updateMatrix(); batch.setMatrixAt(i, dummy.matrix);
    if (t.color) batch.setColorAt(i, new THREE.Color(t.color));
  });
  batch.castShadow = true; batch.receiveShadow = true; group.add(batch); return batch;
}
// CylinderGeometry's partial cylinders have no radial end faces. Build a closed
// sector explicitly, with identical tessellation density at every denominator.
export function solidSector(rb, rt, height, start, angle) {
  const segments = Math.round(128 * angle / TAU), vertices = [], indices = [];
  vertices.push(0, height / 2, 0, 0, -height / 2, 0);
  for (let i = 0; i <= segments; i++) {
    const a = start + angle * i / segments;
    vertices.push(Math.sin(a) * rt, height / 2, Math.cos(a) * rt, Math.sin(a) * rb, -height / 2, Math.cos(a) * rb);
  }
  for (let i = 0; i < segments; i++) {
    const t = 2 + i * 2, b = t + 1;
    indices.push(0, t, t + 2, 1, b + 2, b, t, b, b + 2, t, b + 2, t + 2);
  }
  const last = 2 + segments * 2;
  indices.push(0, 1, 3, 0, 3, 2, 0, last, last + 1, 0, last + 1, 1);
  let g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); g.setIndex(indices);
  const flat = g.toNonIndexed(); g.dispose(); g = flat; g.computeVertexNormals();
  g.parameters = { radiusBottom: rb, radiusTop: rt, height, thetaStart: start, thetaLength: angle, openEnded: false };
  return g;
}
export function pastryRim(start, angle) {
  const seg = Math.round(384 * angle / TAU), around = 10, vertices = [], colors = [], indices = [];
  for (let i = 0; i <= seg; i++) {
    const a = start + angle * i / seg;
    for (let j = 0; j <= around; j++) {
      const b = j / around * TAU, ripple = Math.sin(a * 48);
      const r = 1.53 + 0.13 * Math.cos(b) + 0.015 * ripple;
      const y = 0.72 + 0.13 * Math.sin(b) + 0.032 * ripple;
      vertices.push(Math.sin(a) * r, y, Math.cos(a) * r);
      const toast = 0.5 + 0.5 * Math.sin(a * 48 + 0.9) * Math.sin(b * 0.5);
      const c = new THREE.Color('#f7bc65').lerp(new THREE.Color('#a95319'), toast * 0.70);
      colors.push(c.r, c.g, c.b);
      if (i < seg && j < around) { const n = i * (around + 1) + j; indices.push(n, n + 1, n + around + 1, n + 1, n + around + 2, n + around + 1); }
    }
  }
  // Close the decorative rim too; exposed ends remain usable on separated wedges.
  for (const [row, reverse] of [[0, true], [seg, false]]) for (let j = 1; j < around - 1; j++) {
    const n = row * (around + 1); indices.push(n, n + (reverse ? j + 1 : j), n + (reverse ? j : j + 1));
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  for (let i = 0; i < indices.length; i += 3) [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
  g.setIndex(indices); g.computeVertexNormals(); return g;
}
export function berryGeometry() {
  const g = new THREE.SphereGeometry(1, 14, 10), a = g.attributes.position;
  for (let i = 0; i < a.count; i++) {
    const x = a.getX(i), y = a.getY(i), z = a.getZ(i), t = Math.atan2(x, z);
    const wobble = 1 + 0.045 * Math.sin(t * 5 + y * 3) + 0.023 * Math.cos(t * 3 - y * 7);
    a.setXYZ(i, x * wobble, y > 0.65 ? y - 0.15 * ((y - 0.65) / 0.35) ** 2 : y, z * wobble);
  }
  g.computeVertexNormals(); return g;
}
export function calyxGeometry() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) { const a = i * TAU / 10, r = i % 2 ? 0.32 : 0.72; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (!i) shape.moveTo(x, y); else shape.lineTo(x, y); }
  shape.closePath(); const g = new THREE.ShapeGeometry(shape); g.rotateX(-Math.PI / 2); return g;
}
export function dispose(group) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  group.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m)); });
  materials.forEach(m => { for (const v of Object.values(m)) if (v?.isTexture) textures.add(v); m.dispose(); });
  textures.forEach(t => t.dispose()); geometries.forEach(g => g.dispose());
}

export function pastryWall(start, angle) {
  const count = Math.round(128 * angle / TAU), positions = [], indices = [], colors = [];
  const profile = [[1.49, 0.445], [1.62, 0.445], [1.61, 0.72], [1.49, 0.72]];
  for (let i = 0; i <= count; i++) {
    const a = start + angle * i / count;
    for (const [r, y] of profile) {
      positions.push(Math.sin(a) * r, y, Math.cos(a) * r);
      const c = new THREE.Color('#df9b48').lerp(new THREE.Color('#ba6927'), (0.5 + 0.5 * Math.sin(a * 57 + y * 22)) * 0.37);
      colors.push(c.r, c.g, c.b);
    }
    if (i < count) for (let j = 0; j < 4; j++) { const n = i * 4 + j, next = i * 4 + (j + 1) % 4; indices.push(n, next, n + 4, next, next + 4, n + 4); }
  }
  indices.push(0, 3, 2, 0, 2, 1);
  const last = count * 4; indices.push(last, last + 1, last + 2, last, last + 2, last + 3);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  for (let i = 0; i < indices.length; i += 3) [indices[i + 1], indices[i + 2]] = [indices[i + 2], indices[i + 1]];
  g.setIndex(indices); g.computeVertexNormals(); return g;
}
