import * as THREE from 'three';
import {sliceMotion} from './slice-motion.js';
import { TAU, RADIUS, PIE_X, PIE_Z, HIT_Y, BAR_LENGTH, BAR_DEPTH, BAR_Y, BAR_Z, DRAWER_TRAVEL, material, mesh, instances, point, noise, solidSector, pastryRim, pastryWall, berryGeometry, calyxGeometry, dispose } from './bakery-geometry.js';
import { makeRoom, makeBar, setBarServing } from './bakery-room.js';

// Retained for the historical first-playable modules. Current Free Play is blueberry.
export const RECIPES = Object.freeze({ blueberry: { name: 'Blueberry', filling: '#44366c', fruit: '#474677', accent: '#9695c3' }, cherry: { name: 'Cherry', filling: '#8f233c', fruit: '#b63549', accent: '#f2918d' }, apple: { name: 'Apple', filling: '#b76928', fruit: '#ecc16b', accent: '#ffdda0' } });

export function makePie(serving, recipeName, side) {
  const group = new THREE.Group(); group.position.set(side ? PIE_X : -PIE_X, 0, PIE_Z);
  const china = material('#fff4df', 0.22);
  const profile = [[0, 0.04], [1.48, 0.04], [1.67, 0.065], [1.87, 0.16], [1.93, 0.20], [1.94, 0.24], [1.88, 0.26], [1.7, 0.19], [1.49, 0.14], [0, 0.14]].map(p => new THREE.Vector2(...p));
  mesh(group, new THREE.LatheGeometry(profile, 96), china);
  const trim = mesh(group, new THREE.TorusGeometry(1.89, 0.014, 6, 96), material('#c3a16c', 0.35), 0, 0.249); trim.rotation.x = Math.PI / 2;
  const step = TAU / serving.d;
  for (let i = 0; i < serving.d; i++) {
    const start = Math.PI + i * step, wedge = new THREE.Group(); group.add(wedge);
    wedge.userData = { slice: i + 1, selected: i < serving.n, start, angle: step, side };
    // Equal core solids define the mathematics; surface decoration never changes it.
    const base = mesh(wedge, solidSector(1.52, RADIUS, 0.31, start, step), material('#cf8c40', 0.6), 0, 0.305);
    base.name = 'pastry-solid';
    const filling = new THREE.MeshPhysicalMaterial({ color: '#3b185f', roughness: 0.27, clearcoat: 0.65, clearcoatRoughness: 0.25 }); filling.name = 'serving-filling';
    const jelly = mesh(wedge, solidSector(1.49, 1.49, 0.27, start, step), filling, 0, 0.595); jelly.name = 'filling-solid';
    const rimMat = new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.29, clearcoat: 0.38, clearcoatRoughness: 0.24, vertexColors: true });
    mesh(wedge, pastryRim(start, step), rimMat);
    mesh(wedge, pastryWall(start, step), material('#ffffff', 0.55, { vertexColors: true }));
    const fruit = new THREE.MeshPhysicalMaterial({ color: '#312078', roughness: 0.23, clearcoat: 1, clearcoatRoughness: 0.14 }); fruit.name = 'serving-fruit';
    const berries = [], crowns = [], crumbs = [], fillingFruit = [];
    // Fixed seeded positions/sizes. Vary shape, orientation, bloom and ripeness,
    // and leave a small lane at each cut so sixteenths remain countable.
    for (let k = 0; k < 104; k++) {
      const a = Math.PI + (k * 2.399963229728653) % TAU, r = Math.sqrt((k + 0.5) / 104) * 1.36;
      if (a < start || a >= start + step) continue;
      const s = 0.098 + noise(k + 11) * 0.079;
      const edgeDistance = Math.min(Math.abs(Math.sin(a - start)), Math.abs(Math.sin(start + step - a))) * r;
      // Keep seeded toppings when adding cuts; wide exclusion lanes stripped
      // most berries from sixteenths. Narrow center clearance leaves the
      // overlaid radial cuts readable without changing any core wedge solid.
      if (edgeDistance < s * 0.20 + 0.008) continue;
      const p = point(r, a, 0.716 + s * 0.49), sy = s * (0.72 + noise(k + 7) * 0.32);
      const tint = new THREE.Color('#d4caed').lerp(new THREE.Color('#7b86bf'), noise(k) * 0.65);
      berries.push({ p, sx: s, sy, sz: s * (0.88 + noise(k + 14) * 0.25), ry: a, rz: (noise(k + 9) - 0.5) * 0.22, color: tint });
      crowns.push({ p: p.clone().add(new THREE.Vector3(0, sy * 0.845, 0)), s: s * 0.51, ry: a });
    }
    instances(wedge, berryGeometry(), fruit, berries);
    instances(wedge, calyxGeometry(), material('#293044', 0.65, { side: THREE.DoubleSide }), crowns);
    // Visible fruit fragments in BOTH radial faces, not painted-on cut lines.
    for (const a of [start, start + step]) for (let k = 1; k <= 9; k++) {
      fillingFruit.push({ p: point(k * 0.145, a, 0.50 + noise(k) * 0.14), sx: 0.048, sy: 0.058, sz: 0.048 });
    }
    instances(wedge, new THREE.SphereGeometry(1, 8, 6), material('#53428c', 0.35), fillingFruit);
    for (let k = 0; k < 120; k++) {
      const a = Math.PI + (k + 0.5) / 120 * TAU;
      if (a < start || a >= start + step) continue;
      crumbs.push({ p: point(1.51 + noise(k) * 0.11, a, 0.84 + 0.025 * Math.sin(a * 48)), s: 0.012 + noise(k + 5) * 0.01, ry: k, rx: k });
    }
    instances(wedge, new THREE.BoxGeometry(1, 1, 1), material('#ffe9af'), crumbs);
    // Thin cuts, distinct from the thicker solid serving border.
    const path = new THREE.LineCurve3(point(0, start, HIT_Y), point(RADIUS, start, HIT_Y));
    const cut = mesh(wedge, new THREE.TubeGeometry(path, 1, 0.009, 5, false), material('#f1cf9d'));
    cut.castShadow = false;
  }
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(RADIUS, RADIUS, HIT_Y - 0.15, 128), new THREE.MeshBasicMaterial());
  hit.name = 'serving-hit-target'; hit.position.y = (HIT_Y + 0.15) / 2; hit.visible = false; group.add(hit);
  setPieServing(group, serving); return group;
}
function perimeter(start, angle, radius, height) {
  const points = Array.from({ length: 97 }, (_, k) => point(radius, start + angle * k / 96, height));
  if (angle < TAU) points.push(point(0, start + angle, height), point(radius, start, height));
  const path = new THREE.CurvePath(); for (let k = 1; k < points.length; k++) path.add(new THREE.LineCurve3(points[k - 1], points[k])); return path;
}
export function setPieServing(pie, serving) {
  const previous = pie.getObjectByName('selected-serving'); if (previous) { pie.remove(previous); dispose(previous); }
  const colors = { 'serving-filling': ['#43334e', '#3b185f'], 'serving-fruit': ['#43405f', '#312078'] };
  pie.children.filter(o => o.userData.slice).forEach(wedge => {
    wedge.userData.selected = wedge.userData.slice <= serving.n;
    wedge.traverse(o => { if (colors[o.material?.name]) o.material.color.set(colors[o.material.name][Number(wedge.userData.selected)]); });
  });
  if (serving.n > 0) {
    const outline = new THREE.Group(); outline.name = 'selected-serving';
    const path = perimeter(Math.PI, TAU * serving.n / serving.d, 1.65, HIT_Y);
    mesh(outline, new THREE.TubeGeometry(path, 192, 0.029, 6, false), new THREE.MeshBasicMaterial({ color: '#7536ed' }));
    mesh(outline, new THREE.TubeGeometry(path, 192, 0.011, 5, false), new THREE.MeshBasicMaterial({ color: '#eadcff', depthTest: false }));
    outline.traverse(o => { o.castShadow = false; }); pie.add(outline);
  }
  pie.userData.serving = { ...serving };
}
export function pieceAtPoint(x, z, denominator) {
  const angle = ((Math.atan2(x, z) - Math.PI) % TAU + TAU) % TAU;
  return (Math.floor(angle / (TAU / denominator) + 1e-10) % denominator) + 1;
}
function pieceOutline(k, d) {
  const group = new THREE.Group(), path = perimeter(Math.PI + (k - 1) * TAU / d, TAU / d, 1.60, HIT_Y + 0.03);
  mesh(group, new THREE.TubeGeometry(path, 96, 0.031, 5, false), new THREE.MeshBasicMaterial({ color: '#24182c' }));
  const count = Math.ceil(path.getLength() / 0.16);
  for (let i = 0; i < count; i++) {
    const dash = new THREE.LineCurve3(path.getPointAt(i / count), path.getPointAt((i + 0.52) / count));
    const mark = mesh(group, new THREE.TubeGeometry(dash, 1, 0.017, 5, false), new THREE.MeshBasicMaterial({ color: '#fff7dc', depthTest: false, depthWrite: false })); mark.renderOrder = 2;
  }
  group.traverse(o => { o.castShadow = false; }); group.name = 'piece-emphasis'; return group;
}
export function createBakery(canvas, { onLayout = () => {}, modelReview = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); renderer.shadowMap.enabled = true;
  renderer.shadowMap.autoUpdate = false; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.98;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#eee2c5');
  // Small original studio reflection map: broad window highlights without the
  // expensive runtime RoomEnvironment render/prefilter at every page load.
  const envCanvas = document.createElement('canvas'); envCanvas.width = 256; envCanvas.height = 128;
  const ctx = envCanvas.getContext('2d'), gradient = ctx.createLinearGradient(0, 0, 0, 128);
  gradient.addColorStop(0, '#d4e5ff'); gradient.addColorStop(0.5, '#eee5cf'); gradient.addColorStop(1, '#806142');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 256, 128);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(30, 22, 45, 42); ctx.fillStyle = '#d2e1ff'; ctx.fillRect(168, 33, 30, 26);
  const reflection = new THREE.CanvasTexture(envCanvas); reflection.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer), env = pmrem.fromEquirectangular(reflection);
  scene.environment = env.texture; scene.environmentIntensity = 0.75; reflection.dispose(); pmrem.dispose();
  const camera = new THREE.OrthographicCamera(-6, 6, 3, -3, 0.1, 80);
  scene.add(new THREE.HemisphereLight('#fff3db', '#75999c', 0.8));
  const sun = new THREE.DirectionalLight('#ffe0a1', 3.3); sun.position.set(-4.5, 7, 4.5); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 7, bottom: -7, near: 0.5, far: 25 });
  sun.shadow.bias = -0.00012; sun.shadow.normalBias = 0.018; sun.shadow.radius = 3; scene.add(sun);
  const fill = new THREE.DirectionalLight('#d4e7ff', 1.2); fill.position.set(5, 4, -1); scene.add(fill);
  const { drawer } = makeRoom(scene);
  const raycaster = new THREE.Raycaster(), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let pies = [], bars = [], disposed = false, emphasized = null, topView = false;
  let drawerOpen = false, drawerValue = 0, viewValue = 0, animation = null, frame = 0;
  let width = 1, height = 1, yaw = 0, tilt = 0, finishSlices = null;
  const feedbackTones = [null,null];
  const paintFeedback = () => pies.forEach((pie, side) => {
    const tone = feedbackTones[side], color = tone === 'correct' ? '#1a9857' : tone === 'incorrect' ? '#d84252' : '#7536ed';
    pie.getObjectByName('selected-serving')?.children[0]?.material.color.set(color);
    pie.children.filter(o => o.userData.slice).forEach(wedge => wedge.traverse(o => {
      if (o.material?.name !== 'serving-fruit') return;
      const focus = emphasized?.pair === (side ? 'B' : 'A') && emphasized.k === wedge.userData.slice;
      o.material.emissive.set(focus ? '#6e37e7' : color);
      o.material.emissiveIntensity = focus ? .3 : tone && wedge.userData.selected ? .2 : 0;
    }));
  });
  const project = (x, y, z) => { const p = new THREE.Vector3(x, y, z).project(camera); return { x: (p.x + 1) * width / 2, y: (1 - p.y) * height / 2 }; };
  const setCamera = () => {
    const angle = THREE.MathUtils.clamp(THREE.MathUtils.lerp(modelReview ? 0.50 : 0.68, Math.PI / 2 - 0.001, viewValue) + tilt, 0.42, Math.PI / 2 - 0.001);
    const targetZ = THREE.MathUtils.lerp(0.25, 0.40, viewValue), targetY = 0.10;
    camera.position.set(16 * Math.cos(angle) * Math.sin(yaw), targetY + 16 * Math.sin(angle), targetZ + 16 * Math.cos(angle) * Math.cos(yaw)); camera.lookAt(0, targetY, targetZ);
    const span = Math.max(12, width / height * THREE.MathUtils.lerp(6.1, 7.4, viewValue));
    const halfHeight = span / (width / height) / 2;
    Object.assign(camera, { left: -span / 2, right: span / 2, top: halfHeight, bottom: -halfHeight }); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  };
  const layout = () => {
    const labels = ['A', 'B'].map((pair, side) => ({ pair, ...project(side ? PIE_X : -PIE_X, 0.02, 1.20) }));
    const barRects = ['A', 'B'].map((pair, side) => {
      const x = side ? PIE_X : -PIE_X, z = BAR_Z + drawer.position.z;
      const a = project(x - BAR_LENGTH / 2, BAR_Y + 0.047, z - BAR_DEPTH / 2), b = project(x + BAR_LENGTH / 2, BAR_Y + 0.047, z - BAR_DEPTH / 2), c = project(x - BAR_LENGTH / 2, BAR_Y + 0.047, z + BAR_DEPTH / 2);
      const w = b.x - a.x, h = c.y - a.y;
      return { pair, x: a.x, y: a.y, width: w, height: h, shearX: (c.x-a.x)/h, shearY: (b.y-a.y)/w };
    });
    onLayout({ labels, bars: barRects, drawer: project(0, -0.69, 1.96 + drawer.position.z), moving: Boolean(animation), drawerValue, viewValue });
  };
  const render = (shadows = false) => {
    if (disposed) return; if (shadows) renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera); canvas.dataset.drawCalls = String(renderer.info.render.calls); layout();
  };
  const tick = time => {
    if (disposed || !animation) return;
    const t = Math.min(1, (time - animation.start) / 600), ease = t * t * (3 - 2 * t);
    drawerValue = THREE.MathUtils.lerp(animation.drawer, Number(drawerOpen), ease);
    viewValue = THREE.MathUtils.lerp(animation.view, Number(topView), ease);
    drawer.position.z = drawerValue * DRAWER_TRAVEL; setCamera();
    if (t === 1) animation = null;
    render(true); if (animation) frame = requestAnimationFrame(tick);
  };
  const transition = () => {
    cancelAnimationFrame(frame);
    if (reduced.matches) {
      animation = null; drawerValue = Number(drawerOpen); viewValue = Number(topView); drawer.position.z = drawerValue * DRAWER_TRAVEL; setCamera(); render(true);
    } else { animation = { start: performance.now(), drawer: drawerValue, view: viewValue }; frame = requestAnimationFrame(tick); layout(); }
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect(); if (!rect.width || !rect.height) return;
    width = rect.width; height = rect.height; renderer.setSize(width, height, false); setCamera(); render(true);
  };
  const observer = new ResizeObserver(resize); observer.observe(canvas);
  const contextLost = event => { event.preventDefault(); canvas.dispatchEvent(new CustomEvent('scene-error')); };
  canvas.addEventListener('webglcontextlost', contextLost);
  const motionChange = () => { if (reduced.matches) { finishSlices?.(); transition(); } }; reduced.addEventListener('change', motionChange);
  return {
    update(left, right, recipe = 'blueberry') {
      let rebuild = false;
      [left, right].forEach((serving, side) => {
        if (pies[side]?.userData.serving.d !== serving.d) {
          if (pies[side]) { scene.remove(pies[side]); dispose(pies[side]); drawer.remove(bars[side]); dispose(bars[side]); }
          pies[side] = makePie(serving, recipe, side); bars[side] = makeBar(serving, side); scene.add(pies[side]); drawer.add(bars[side]); rebuild = true;
          if (modelReview) {
            const wedge = pies[side].children.find(o => o.userData.slice === Math.ceil(serving.d * 0.7));
            const a = wedge.userData.start + wedge.userData.angle / 2;
            wedge.position.copy(point(0.52, a, 0.10));
          }
        } else if (pies[side].userData.serving.n !== serving.n) { setPieServing(pies[side], serving); setBarServing(bars[side], serving); }
      });
      if (rebuild) emphasized = null;
      paintFeedback();
      if (rebuild) resize(); else render();
    },
    transform(pair, type, from, to) {
      finishSlices?.();
      const side = pair === 'A' ? 0 : 1;
      const states = pies.map(p => ({...p.userData.serving}));
      const commit = () => { states[side] = to; this.update(states[0], states[1]); };
      if (type === 'cut') commit();
      canvas.dataset.slicing = 'true';
      return new Promise(resolve => {
        let completed = false;
        const finish = sliceMotion(pies[side], bars[side], type, from, to, {
          reduced, onFrame: () => render(true),
          onFinish: () => { completed = true; finishSlices = null; commit(); canvas.dataset.slicing = 'false'; render(true); resolve(); }
        });
        if (!completed) finishSlices = finish;
      });
    },
    cancelTransformation() { finishSlices?.(); },
    pick(clientX, clientY) {
      if (disposed || modelReview || canvas.dataset.slicing === 'true') return null;
      const rect = canvas.getBoundingClientRect();
      raycaster.setFromCamera(new THREE.Vector2((clientX - rect.left) / rect.width * 2 - 1, -(clientY - rect.top) / rect.height * 2 + 1), camera);
      const hits = raycaster.intersectObjects(pies.map(p => p.getObjectByName('serving-hit-target')), false);
      if (!hits.length) return null;
      const pie = hits[0].object.parent, local = pie.worldToLocal(hits[0].point.clone());
      return { pair: pies.indexOf(pie) === 0 ? 'A' : 'B', k: pieceAtPoint(local.x, local.z, pie.userData.serving.d) };
    },
    emphasize(piece) {
      if (piece && (!Number.isInteger(piece.k) || piece.k < 1 || piece.k > pies[piece.pair === 'A' ? 0 : 1]?.userData.serving.d || canvas.dataset.slicing === 'true')) piece = null;
      if (emphasized?.pair === piece?.pair && emphasized?.k === piece?.k) return;
      pies.forEach(pie => { const outline = pie.getObjectByName('piece-emphasis'); if (outline) { pie.remove(outline); dispose(outline); }
        pie.traverse(o => { if (o.material?.name === 'serving-fruit') { o.material.emissive.set('#6e37e7'); o.material.emissiveIntensity = 0; } });
      });
      emphasized = piece;
      if (piece && !modelReview) { const pie = pies[piece.pair === 'A' ? 0 : 1]; pie.add(pieceOutline(piece.k, pie.userData.serving.d));
        pie.children.find(o => o.userData.slice === piece.k)?.traverse(o => { if (o.material?.name === 'serving-fruit') o.material.emissiveIntensity = 0.3; });
      }
      paintFeedback(); render();
    },
    setFeedback(pair, tone) { feedbackTones[pair === 'A' ? 0 : 1] = tone; paintFeedback(); render(); },
    setDrawer(open) { drawerOpen = open; transition(); },
    setTopView(top) { topView = top; yaw = 0; tilt = 0; transition(); },
    orbit(dx, dy = 0) { yaw = THREE.MathUtils.clamp(yaw + dx, -0.22, 0.22); tilt = THREE.MathUtils.clamp(tilt + dy, -0.16, 0.18); setCamera(); render(); },
    resetCamera() { yaw = 0; tilt = 0; topView = false; transition(); },
    dispose() { finishSlices?.(); disposed = true; cancelAnimationFrame(frame); observer.disconnect(); reduced.removeEventListener('change', motionChange); canvas.removeEventListener('webglcontextlost', contextLost); dispose(scene); env.dispose(); renderer.dispose(); },
  };
}
