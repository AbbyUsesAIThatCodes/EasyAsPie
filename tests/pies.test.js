import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { makePie } from '../src/pies.js';
import { previewState } from '../src/preview-fixtures.js';

const close = (a, b) => assert.ok(Math.abs(a - b) < 0.00001, `${a} should equal ${b}`);
const release = pie => {
  const geometries = new Set(), materials = new Set();
  pie.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) materials.add(o.material); });
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
};

test('all pie servings retain equal solid wedges, a common origin, and the same whole', () => {
  let dimensions, origin;
  for (const d of [2, 4, 8, 16]) for (let n = 0; n <= d; n++) {
    const pie = makePie({ n, d }, 'blueberry', 0);
    const wedges = pie.children.filter(o => o.userData.slice);
    assert.equal(wedges.length, d);
    assert.equal(wedges.filter(o => o.userData.selected).length, n);
    const whole = new THREE.Box3();
    let totalAngle = 0;
    wedges.forEach((wedge, i) => {
      const solid = wedge.children[0];
      const p = solid.geometry.parameters;
      assert.ok(p.height > 0 && !p.openEnded, 'Every slice has genuine solid depth.');
      if (origin === undefined) origin = p.thetaStart;
      close(p.thetaStart, origin + totalAngle);
      close(p.thetaLength, wedges[0].children[0].geometry.parameters.thetaLength);
      assert.equal(wedge.userData.selected, i < n, 'The first n pieces form the serving.');
      totalAngle += p.thetaLength;
      solid.updateMatrixWorld();
      whole.union(new THREE.Box3().setFromObject(solid));
    });
    close(totalAngle, 2 * Math.PI);
    const size = whole.getSize(new THREE.Vector3());
    if (!dimensions) dimensions = size;
    ['x', 'y', 'z'].forEach(axis => close(size[axis], dimensions[axis]));
    assert.ok(pie.children.some(o => o.geometry?.type === 'TorusGeometry'), 'The whole plate outline survives empty and full servings.');
    release(pie);
  }
});

test('review fixtures use the same validated immutable state as the default preview', () => {
  assert.deepEqual(previewState('sixteenths'), { A: { n: 3, d: 16 }, B: { n: 8, d: 16 } });
  assert.deepEqual(previewState('empty-whole'), { A: { n: 0, d: 16 }, B: { n: 16, d: 16 } });
  assert.deepEqual(previewState('unknown'), { A: { n: 1, d: 2 }, B: { n: 2, d: 4 } });
  for (const name of ['__proto__', 'constructor', 'toString']) assert.deepEqual(previewState(name), { A: { n: 1, d: 2 }, B: { n: 2, d: 4 } });
  for (const [name, d] of [['halves', 2], ['quarters', 4], ['eighths', 8]]) assert.deepEqual(previewState(name), { A: { n: 1, d }, B: { n: d / 2, d } });
  assert.ok(Object.isFrozen(previewState('sixteenths').A));
});
