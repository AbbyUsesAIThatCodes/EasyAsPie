import * as THREE from 'three';

export const RECIPES = Object.freeze({
  blueberry: { name: 'Blueberry', filling: '#44366c', fruit: '#474677', accent: '#9695c3' },
  cherry: { name: 'Cherry', filling: '#8f233c', fruit: '#b63549', accent: '#f2918d' },
  apple: { name: 'Apple', filling: '#b76928', fruit: '#ecc16b', accent: '#ffdda0' },
});
const TAU = Math.PI * 2;
const RADIUS = 1.64;
const positions = [-2.3, 2.3];
const material = (color, roughness = 0.65) => new THREE.MeshStandardMaterial({ color, roughness });
const point = (radius, angle, y) => new THREE.Vector3(Math.sin(angle) * radius, y, Math.cos(angle) * radius);

function mesh(group, geometry, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geometry, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
  return m;
}

function instances(group, geometry, mat, transforms) {
  const batch = new THREE.InstancedMesh(geometry, mat, transforms.length);
  const dummy = new THREE.Object3D();
  transforms.forEach((t, i) => {
    dummy.position.copy(t.p);
    dummy.rotation.set(t.rx || 0, t.ry || 0, t.rz || 0);
    dummy.scale.set(t.sx || t.s || 1, t.sy || t.s || 1, t.sz || t.s || 1);
    dummy.updateMatrix();
    batch.setMatrixAt(i, dummy.matrix);
  });
  batch.castShadow = true;
  batch.receiveShadow = true;
  group.add(batch);
}

function makePie(serving, recipeName, side) {
  const recipe = RECIPES[recipeName];
  const group = new THREE.Group();
  group.position.x = positions[side];
  const china = material('#f9f7f0', 0.24);
  mesh(group, new THREE.CylinderGeometry(1.95, 1.81, 0.13, 80), china, 0, 0.07);
  const rim = mesh(group, new THREE.TorusGeometry(1.82, 0.06, 10, 80), china, 0, 0.14);
  rim.rotation.x = Math.PI / 2;
  const trim = mesh(group, new THREE.TorusGeometry(1.9, 0.015, 6, 80), material('#95aaa1'), 0, 0.12);
  trim.rotation.x = Math.PI / 2;
  const step = TAU / serving.d;
  for (let i = 0; i < serving.d; i++) {
    const selected = i < serving.n;
    const start = i * step;
    const wedge = new THREE.Group();
    group.add(wedge);
    const crust = material(selected ? '#dba15e' : '#dfd6c6');
    const dough = material(selected ? '#f5c987' : '#ebe4d6');
    const filling = material(selected ? recipe.filling : '#cec7c3', 0.3);
    const fruit = material(selected ? recipe.fruit : '#d8d1ca', 0.26);
    const gleam = material(selected ? recipe.accent : '#ebe4da', 0.4);
    const base = mesh(wedge, new THREE.CylinderGeometry(RADIUS, RADIUS - 0.08, 0.29, 64, 1, false, start, step), crust, 0, 0.30);
    base.userData.slice = i + 1;
    base.userData.side = side;
    const top = mesh(wedge, new THREE.CylinderGeometry(1.48, 1.49, 0.065, 64, 1, false, start, step), filling, 0, 0.463);
    top.userData.slice = i + 1;
    top.userData.side = side;
    // The decorative population has fixed positions at every denominator.
    const berries = [], highlights = [], crimps = [], sugar = [], pastry = [];
    for (let k = 0; k < 180; k++) {
      const angle = (k * 2.399963229728653) % TAU;
      if (angle < start || angle >= start + step) continue;
      const radius = Math.sqrt((k + 0.5) / 180) * 1.37;
      const p = point(radius, angle, 0.509 + 0.018 * Math.sin(k * 4));
      berries.push({ p, s: 0.075 + (k % 4) * 0.009, sy: recipeName === 'apple' ? 0.035 : 0.066, sx: recipeName === 'apple' ? 0.12 : undefined, ry: angle });
      if (k % 3 === 0) highlights.push({ p: p.clone().add(new THREE.Vector3(-0.018, 0.057, 0.017)), s: 0.017 });
    }
    for (let k = 0; k < 64; k++) {
      const angle = (k + 0.5) / 64 * TAU;
      if (angle < start || angle >= start + step) continue;
      crimps.push({ p: point(1.55, angle, 0.49), sx: 0.105, sy: 0.084, sz: 0.165, ry: angle });
    }
    for (let k = 0; k < 72; k++) {
      const angle = (k * 1.618) % TAU;
      if (angle < start || angle >= start + step) continue;
      sugar.push({ p: point(1.49 + (k % 3) * 0.044, angle, 0.56), s: 0.019, ry: k });
    }
    // Small baked leaves make apple visually distinct without hiding cuts.
    if (recipeName === 'apple') for (let k = 0; k < 12; k++) {
      const angle = (k + 0.5) / 12 * TAU;
      if (angle >= start && angle < start + step) pastry.push({ p: point(0.96, angle, 0.56), sx: 0.12, sy: 0.035, sz: 0.26, ry: angle });
    }
    const sphere = () => new THREE.SphereGeometry(1, 10, 7);
    instances(wedge, sphere(), fruit, berries);
    instances(wedge, sphere(), gleam, highlights);
    instances(wedge, sphere(), dough, crimps);
    instances(wedge, new THREE.BoxGeometry(1, 1, 1), material(selected ? '#fff2d1' : '#eee8dd'), sugar);
    if (pastry.length) instances(wedge, sphere(), dough, pastry);
    // Slice guides lie above the fruit and remain visible in every recipe.
    const line = new THREE.BufferGeometry().setFromPoints([point(0, start, 0.63), point(RADIUS, start, 0.63)]);
    wedge.add(new THREE.Line(line, new THREE.LineBasicMaterial({ color: '#fff5dc' })));
    if (selected) {
      const points = Array.from({ length: 33 }, (_, k) => point(1.7, start + step * k / 32, 0.2));
      wedge.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#675481' })));
    }
  }
  return group;
}

function dispose(group) {
  const geometries = new Set(), materials = new Set();
  group.traverse(o => {
    if (o.geometry) geometries.add(o.geometry);
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m));
  });
  geometries.forEach(g => g.dispose());
  materials.forEach(m => m.dispose());
}

export function createBakery(canvas, onSlice = () => {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5.3, 5.3, 2, -2, 0.1, 50);
  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight('#fff9e9', '#a59a9c', 1.8));
  const sun = new THREE.DirectionalLight('#fff4db', 2.5);
  sun.position.set(-3, 8, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 5, bottom: -5 });
  sun.shadow.bias = -0.001;
  scene.add(sun);
  const counter = mesh(scene, new THREE.PlaneGeometry(200, 200), material('#eee3cf'), 0, -0.01);
  counter.rotation.x = -Math.PI / 2;
  counter.castShadow = false;
  // A quiet linen runner anchors both equal-sized plates.
  const linen = mesh(scene, new THREE.PlaneGeometry(9.7, 4.5), material('#e5ded0'), 0, 0.001);
  linen.rotation.x = -Math.PI / 2;
  linen.castShadow = false;
  let pies = [];
  let disposed = false;
  let topView = false;
  const render = () => { if (!disposed) renderer.render(scene, camera); };
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const span = Math.max(10, (width / height) * (topView ? 4.2 : 3.25));
    pies.forEach((pie, side) => { pie.position.x = (side ? 1 : -1) * span * 0.26; });
    const halfHeight = span / (width / height) / 2;
    Object.assign(camera, { left: -span / 2, right: span / 2, top: halfHeight, bottom: -halfHeight });
    camera.updateProjectionMatrix();
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const raycaster = new THREE.Raycaster();
  const click = event => {
    const rect = canvas.getBoundingClientRect();
    raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera);
    const hit = raycaster.intersectObjects(pies, true).find(h => h.object.userData.side === 1);
    if (hit) onSlice(hit.object.userData.slice);
  };
  canvas.addEventListener('click', click);
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    canvas.dispatchEvent(new CustomEvent('scene-error'));
  });
  return {
    update(left, right, recipe = 'blueberry') {
      pies.forEach(p => { scene.remove(p); dispose(p); });
      pies = [makePie(left, recipe, 0), makePie(right, recipe, 1)];
      pies.forEach(p => scene.add(p));
      resize();
    },
    setTopView(top) { topView = top; camera.position.set(0, top ? 14 : 10, top ? 0.001 : 10); camera.lookAt(0, 0, 0); resize(); },
    dispose() { disposed = true; observer.disconnect(); canvas.removeEventListener('click', click); dispose(scene); renderer.dispose(); },
  };
}
