import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { makeBar, setBarServing } from '../src/bakery-room.js';
import { BAR_LENGTH, barPosition, dispose } from '../src/bakery-geometry.js';

test('physical bars keep equal wholes and exact selected counts in all 34 states', () => {
  for (const d of [2, 4, 8, 16]) {
    const a = makeBar({ n: 0, d }, 0), b = makeBar({ n: 1, d }, 1);
    const pieces = a.children.filter(o => o.userData.piece), solids = pieces.map(o => o.geometry);
    assert.equal(pieces.length, d);
    assert.equal(a.position.x, b.position.x); assert.equal(a.position.y,b.position.y);
    assert.equal(a.position.z,barPosition(0).z);assert.equal(b.position.z,barPosition(1).z);assert.ok(a.position.z<b.position.z);
    const size = new THREE.Box3().setFromObject(a).getSize(new THREE.Vector3());
    const partnerSize = new THREE.Box3().setFromObject(b).getSize(new THREE.Vector3());
    assert.ok(size.distanceTo(partnerSize) < 1e-5, 'Partner wholes have the same dimensions.');
    for (let k = 1; k < d; k++) assert.ok(Math.abs(pieces[k].position.x - pieces[k - 1].position.x - BAR_LENGTH / d) < 1e-8, 'Every cell occupies an equal interval.');
    for (let n = d; n >= 0; n--) {
      setBarServing(a, { n, d });
      assert.deepEqual(a.userData.serving, { n, d });
      assert.equal(pieces.filter(o => o.getObjectByName('selected-dot').visible).length, n);
      pieces.forEach((o, i) => { assert.equal(o.getObjectByName('selected-dot').visible, i < n); assert.equal(o.geometry, solids[i]); });
      assert.deepEqual(b.userData.serving, { n: 1, d });
      assert.equal(b.children.filter(o => o.userData.piece && o.getObjectByName('selected-dot').visible).length, 1);
    }
    dispose(a); dispose(b);
  }
});
