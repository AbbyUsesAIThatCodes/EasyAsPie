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
  if (!transforms.length) { geometry.dispose(); return; }
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

export function makePie(serving, recipeName, side) {
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
    const start = Math.PI + i * step;
    const wedge = new THREE.Group();
    group.add(wedge);
    const crust = material('#c88739');
    const dough = material('#d49138');
    const filling = material(selected ? '#3b185f' : '#565166', 0.3);
    const fruit = material(selected ? '#302164' : '#494254', 0.26);
    const gleam = material(selected ? '#b6a2de' : '#aca6b5', 0.4);
    filling.name = 'serving-filling'; fruit.name = 'serving-fruit'; gleam.name = 'serving-gleam';
    const base = mesh(wedge, new THREE.CylinderGeometry(RADIUS, RADIUS - 0.08, 0.29, 64, 1, false, start, step), crust, 0, 0.30);
    base.userData.slice = i + 1;
    base.userData.side = side;
    const top = mesh(wedge, new THREE.CylinderGeometry(1.48, 1.49, 0.065, 64, 1, false, start, step), filling, 0, 0.463);
    top.userData.slice = i + 1;
    top.userData.side = side;
    // The decorative population has fixed positions at every denominator.
    const berries = [], highlights = [], crimps = [], sugar = [], pastry = [];
    for (let k = 0; k < 180; k++) {
      const angle = Math.PI + (k * 2.399963229728653) % TAU;
      if (angle < start || angle >= start + step) continue;
      const radius = Math.sqrt((k + 0.5) / 180) * 1.37;
      const p = point(radius, angle, 0.509 + 0.018 * Math.sin(k * 4));
      berries.push({ p, s: 0.084 + (k % 4) * 0.009, sy: recipeName === 'apple' ? 0.035 : 0.066, sx: recipeName === 'apple' ? 0.12 : undefined, ry: angle });
      if (k % 3 === 0) highlights.push({ p: p.clone().add(new THREE.Vector3(-0.018, 0.057, 0.017)), s: 0.017 });
    }
    for (let k = 0; k < 64; k++) {
      const angle = Math.PI + (k + 0.5) / 64 * TAU;
      if (angle < start || angle >= start + step) continue;
      crimps.push({ p: point(1.55, angle, 0.49), sx: 0.105, sy: 0.084, sz: 0.165, ry: angle });
    }
    for (let k = 0; k < 72; k++) {
      const angle = Math.PI + (k * 1.618) % TAU;
      if (angle < start || angle >= start + step) continue;
      sugar.push({ p: point(1.49 + (k % 3) * 0.044, angle, 0.56), s: 0.019, ry: k });
    }
    // Small baked leaves make apple visually distinct without hiding cuts.
    if (recipeName === 'apple') for (let k = 0; k < 12; k++) {
      const angle = Math.PI + (k + 0.5) / 12 * TAU;
      if (angle >= start && angle < start + step) pastry.push({ p: point(0.96, angle, 0.56), sx: 0.12, sy: 0.035, sz: 0.26, ry: angle });
    }
    const sphere = () => new THREE.SphereGeometry(1, 10, 7);
    instances(wedge, sphere(), fruit, berries);
    instances(wedge, sphere(), gleam, highlights);
    instances(wedge, sphere(), dough, crimps);
    instances(wedge, new THREE.BoxGeometry(1, 1, 1), material('#fff2d1'), sugar);
    if (pastry.length) instances(wedge, sphere(), dough, pastry);
    wedge.userData = { slice: i + 1, selected, start, angle: step, side };
    // Physical, high-contrast grooves stay above the fruit even at sixteenths.
    // Use tubes, not platform-dependent WebGL line widths.
    const guide = new THREE.LineCurve3(point(0, start, 0.64), point(RADIUS, start, 0.64));
    mesh(wedge, new THREE.TubeGeometry(guide, 1, 0.010, 5, false), material('#fff2d9'));
  }
  // Logical solid hit target excludes fruit, outlines, and the decorative plate.
  // Its top matches the visible cut guides, including their near-boundary hits.
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS, RADIUS, 0.49, 96), new THREE.MeshBasicMaterial());
  hit.name = 'serving-hit-target';
  hit.position.y = 0.395;
  hit.visible = false;
  group.add(hit);
  setPieServing(group, serving);
  return group;
}

function perimeter(start, angle, radius, height) {
  const points = Array.from({ length: 65 }, (_, k) => point(radius, start + angle * k / 64, height));
  if (angle < TAU) points.push(point(0, start + angle, height), point(radius, start, height));
  const path = new THREE.CurvePath();
  for (let k = 1; k < points.length; k++) path.add(new THREE.LineCurve3(points[k - 1], points[k]));
  return path;
}

// Change materials and the serving boundary, retaining the equal solid geometry.
export function setPieServing(pie, serving) {
  const previous = pie.getObjectByName('selected-serving');
  if (previous) { pie.remove(previous); dispose(previous); }
  const colors = {
    'serving-filling': ['#565166', '#3b185f'],
    'serving-fruit': ['#494254', '#302164'],
    'serving-gleam': ['#aca6b5', '#b6a2de'],
  };
  pie.children.filter(o => o.userData.slice).forEach(wedge => {
    wedge.userData.selected = wedge.userData.slice <= serving.n;
    wedge.traverse(o => {
      if (colors[o.material?.name]) o.material.color.set(colors[o.material.name][Number(wedge.userData.selected)]);
    });
  });
  if (serving.n > 0) {
    const outline = mesh(pie, new THREE.TubeGeometry(perimeter(Math.PI, TAU * serving.n / serving.d, 1.65, 0.64), 192, 0.022, 6, false), new THREE.MeshBasicMaterial({ color: '#9653f5' }));
    outline.name = 'selected-serving';
    outline.castShadow = false;
  }
  pie.userData.serving = { ...serving };
}

// The origin is back-center; increasing k follows the left side in Top View.
// Exact cuts belong to the following piece; the common origin belongs to piece 1.
export function pieceAtPoint(x, z, denominator) {
  const angle = ((Math.atan2(x, z) - Math.PI) % TAU + TAU) % TAU;
  return (Math.floor(angle / (TAU / denominator) + 1e-10) % denominator) + 1;
}

function pieceOutline(k, d) {
  const group = new THREE.Group();
  const path = perimeter(Math.PI + (k - 1) * TAU / d, TAU / d, 1.60, 0.69);
  mesh(group, new THREE.TubeGeometry(path, 96, 0.037, 5, false), new THREE.MeshBasicMaterial({ color: '#261b35' }));
  // Dashed ivory over a dark boundary differs in pattern as well as color.
  const length = path.getLength();
  const count = Math.ceil(length / 0.16);
  for (let i = 0; i < count; i++) {
    const dash = new THREE.LineCurve3(path.getPointAt(i / count), path.getPointAt((i + 0.52) / count));
    const mark = mesh(group, new THREE.TubeGeometry(dash, 1, 0.020, 5, false), new THREE.MeshBasicMaterial({ color: '#fff7dc', depthTest: false, depthWrite: false }));
    // Draw the light dash over its wider dark backing, rather than inside it.
    mark.renderOrder = 2;
  }
  group.traverse(o => { o.castShadow = false; });
  group.name = 'piece-emphasis';
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

export function createBakery(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5.3, 5.3, 2, -2, 0.1, 50);
  camera.position.set(0, 10, 10);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight('#fff9e9', '#a59a9c', 2.2));
  const sun = new THREE.DirectionalLight('#fff4db', 3.2);
  sun.position.set(-3, 8, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 5, bottom: -5 });
  sun.shadow.bias = -0.001;
  scene.add(sun);
  // Transparent shadow catcher lets the warm wooden countertop continue into
  // the DOM labels and drawer without adding a bitmap or changing pie geometry.
  const counter = mesh(scene, new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: '#583b28', opacity: 0.22 }), 0, -0.01);
  counter.rotation.x = -Math.PI / 2;
  counter.castShadow = false;
  let pies = [];
  let disposed = false;
  let emphasized = null;
  const raycaster = new THREE.Raycaster();
  let topView = false;
  const render = () => { if (!disposed) renderer.render(scene, camera); };
  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    const span = Math.max(9, (width / height) * (topView ? 4.3 : 3.6));
    pies.forEach((pie, side) => { pie.position.x = (side ? 1 : -1) * span * 0.25; });
    const halfHeight = span / (width / height) / 2;
    Object.assign(camera, { left: -span / 2, right: span / 2, top: halfHeight, bottom: -halfHeight });
    camera.updateProjectionMatrix();
    renderer.shadowMap.needsUpdate = true;
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  const contextLost = event => {
    event.preventDefault();
    canvas.dispatchEvent(new CustomEvent('scene-error'));
  };
  canvas.addEventListener('webglcontextlost', contextLost);
  return {
    update(left, right, recipe = 'blueberry') {
      let repartitioned = false, changed = false;
      [left, right].forEach((serving, side) => {
        const old = pies[side]?.userData.serving;
        if (old?.d !== serving.d) {
          repartitioned = true;
          if (pies[side]) { scene.remove(pies[side]); dispose(pies[side]); }
          pies[side] = makePie(serving, recipe, side);
          scene.add(pies[side]);
          emphasized = null;
        } else if (old.n !== serving.n) { setPieServing(pies[side], serving); changed = true; }
      });
      // Serving and focus changes leave the solids/shadow map unchanged.
      if (repartitioned) resize();
      else if (changed) render();
    },
    pick(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height || disposed) return null;
      raycaster.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), camera);
      const hits = raycaster.intersectObjects(pies.map(p => p.getObjectByName('serving-hit-target')), false);
      if (!hits.length) return null;
      const pie = hits[0].object.parent;
      const local = pie.worldToLocal(hits[0].point.clone());
      return { pair: pies.indexOf(pie) === 0 ? 'A' : 'B', k: pieceAtPoint(local.x, local.z, pie.userData.serving.d) };
    },
    emphasize(piece) {
      if (emphasized?.pair === piece?.pair && emphasized?.k === piece?.k) return;
      pies.forEach(pie => {
        const outline = pie.getObjectByName('piece-emphasis');
        if (outline) { pie.remove(outline); dispose(outline); }
      });
      emphasized = piece;
      if (piece) {
        const pie = pies[piece.pair === 'A' ? 0 : 1];
        pie.add(pieceOutline(piece.k, pie.userData.serving.d));
      }
      render();
    },
    setTopView(top) { topView = top; camera.position.set(0, top ? 14 : 10, top ? 0.001 : 10); camera.lookAt(0, 0, 0); resize(); },
    dispose() { disposed = true; observer.disconnect(); canvas.removeEventListener('webglcontextlost', contextLost); dispose(scene); renderer.dispose(); },
  };
}
