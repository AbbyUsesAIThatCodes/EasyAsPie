import assert from 'node:assert/strict';
import { readFileSync, readdirSync, appendFileSync } from 'node:fs';

const manifest = readFileSync('dist/build.json', 'utf8');
const m = JSON.parse(manifest);
assert.equal(readFileSync(`artifacts/${m.id}/build.json`, 'utf8'), manifest);
assert.ok(readFileSync('dist/BUILD.md', 'utf8').includes(m.id));
const js = readdirSync('dist/assets').filter(p => p.endsWith('.js')).map(p => readFileSync(`dist/assets/${p}`, 'utf8')).join('\n');
assert.ok(js.includes(m.id), 'The game bundle must display this exact identity.');
assert.ok(readFileSync('dist/index.html', 'utf8').includes('./assets/'), 'Assets must work under /EasyAsPie/.');
assert.match(m.sha, /^[a-f0-9]{40}$/);
assert.match(m.sourceFingerprint, /^[a-f0-9]{64}$/);
console.log(`BUILD VERIFIED ${m.id}`);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\nManifest, artifact name, UI bundle, build report, and relative assets agree: **${m.id}**\n`);
