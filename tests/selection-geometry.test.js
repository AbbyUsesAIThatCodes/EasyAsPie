import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { makePie, pieceAtPoint, setPieServing } from '../src/pies.js';

function release(pie) {
  const geometries = new Set(), materials = new Set();
  pie.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) materials.add(o.material); });
  geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
}

test('all piece interiors and both sides of every cut follow the back-center origin', () => {
  for (const d of [2, 4, 8, 16]) {
    const step = 2 * Math.PI / d;
    for (let i = 0; i < d; i++) {
      for (const fraction of [0, 0.002, 0.5, 0.998]) {
        const angle = Math.PI + (i + fraction) * step;
        assert.equal(pieceAtPoint(Math.sin(angle), Math.cos(angle), d), i + 1);
      }
    }
  }
});

test('serving updates retain solid wedges and independently update all 34 visual states', () => {
  for (const d of [2, 4, 8, 16]) {
    const pie = makePie({ n: 0, d }, 'blueberry', 0);
    const other = makePie({ n: 1, d }, 'blueberry', 1);
    const wedges = pie.children.filter(o => o.userData.slice);
    const geometry = wedges.map(w => w.children[0].geometry);
    // Reverse and repeat the order to expose stale highlights as well as growth.
    for (const n of [...Array(d + 1).keys(), ...Array(d + 1).keys()].reverse()) {
      setPieServing(pie, { n, d });
      assert.deepEqual(pie.userData.serving, { n, d });
      assert.equal(wedges.filter(w => w.userData.selected).length, n);
      assert.equal(Boolean(pie.getObjectByName('selected-serving')), n > 0);
      wedges.forEach((wedge, i) => {
        assert.equal(wedge.children[0].geometry, geometry[i]);
        assert.equal(wedge.userData.selected, i < n);
        assert.equal(wedge.children[1].material.color.getHexString(), i < n ? '3b185f' : '565166');
      });
      assert.deepEqual(other.userData.serving, { n: 1, d });
    }
    // Raycasting ignores decoration/plate and still reaches an invisible logical target.
    pie.updateMatrixWorld(true);
    const hit = pie.getObjectByName('serving-hit-target');
    for (let k = 1; k <= d; k++) {
      const angle = Math.PI + (k - 0.5) * 2 * Math.PI / d;
      const ray = new THREE.Raycaster(new THREE.Vector3(pie.position.x + Math.sin(angle), 4, Math.cos(angle)), new THREE.Vector3(0, -1, 0));
      const hits = ray.intersectObject(hit);
      assert.ok(hits.length);
      const point = pie.worldToLocal(hits[0].point.clone());
      assert.equal(pieceAtPoint(point.x, point.z, d), k);
    }
    release(pie); release(other);
  }
});
