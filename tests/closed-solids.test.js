import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { solidSector, pastryWall, pastryRim, TAU, RADIUS } from '../src/bakery-geometry.js';

// Weld coincident triangle positions and require two oppositely directed uses
// of every edge, including the radial cuts that partial cylinders omit.
function audit(g) {
  const p = g.attributes.position, edges = new Map(); let volume = 0;
  const v = i => new THREE.Vector3().fromBufferAttribute(p, i);
  const key = i => [p.getX(i), p.getY(i), p.getZ(i)].map(n => Math.round(n * 1e6)).join(',');
  for (let i = 0; i < p.count; i += 3) {
    volume += v(i).dot(v(i + 1).cross(v(i + 2))) / 6;
    for (const [a, b] of [[i, i + 1], [i + 1, i + 2], [i + 2, i]]) {
      const ka = key(a), kb = key(b); if (ka === kb) continue;
      const id = [ka, kb].sort().join('|'); const e = edges.get(id) || { count: 0, balance: 0 };
      e.count++; e.balance += ka < kb ? 1 : -1; edges.set(id, e);
    }
  }
  for (const e of edges.values()) { assert.equal(e.count, 2, 'No open surface edges.'); assert.equal(e.balance, 0, 'Adjacent faces have consistent winding.'); }
  assert.ok(volume > 0, 'Faces point outward.'); return volume;
}
test('every movable pastry/filling sector is closed, outward-facing and equal-volume', () => {
  for (const [rb, rt, h] of [[1.52, RADIUS, 0.31], [1.49, 1.49, 0.27]]) {
    let whole;
    for (const d of [2, 4, 8, 16]) {
      const volumes = [];
      for (let k = 0; k < d; k++) {
        const g = solidSector(rb, rt, h, Math.PI + k * TAU / d, TAU / d);
        volumes.push(audit(g)); g.dispose();
      }
      assert.ok(Math.max(...volumes) - Math.min(...volumes) < 1e-6);
      const total = volumes.reduce((a, b) => a + b, 0);
      if (whole === undefined) whole = total;
      assert.ok(Math.abs(total - whole) < 1e-6, 'Changing d preserves the exact tessellated whole volume.');
    }
  }
});

test('decorative pastry shells are closed and face outward', () => {
  for (const make of [pastryWall, pastryRim]) for (const d of [2, 4, 8, 16]) {
    const source = make(Math.PI, TAU / d), g = source.toNonIndexed();
    audit(g); g.dispose(); source.dispose();
  }
});
