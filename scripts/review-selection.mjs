// Optional browser acceptance harness. Uses a separately installed Playwright;
// no browser download or new runtime dependency is needed by the game/CI.
// PLAYWRIGHT_MODULE may point to its index.mjs; CHROMIUM_PATH is optional.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve('dist');
const manifest = JSON.parse(await readFile(`${root}/build.json`, 'utf8'));
const output = resolve(process.env.REVIEW_OUTPUT || 'docs/review/issue-18');
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const path = resolve(root, '.' + (new URL(req.url, 'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url, 'http://localhost').pathname));
  if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream'); res.end(await readFile(path)); }
  catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const messages = [], checks = [];
const started = Date.now();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
page.on('pageerror', e => messages.push({ type: 'pageerror', message: e.message }));
page.on('console', m => { if (['error', 'warning'].includes(m.type())) messages.push({ type: m.type(), message: m.text() }); });
page.setDefaultNavigationTimeout(180000);
const values = () => page.locator('.fraction').allTextContents();
const settle = () => page.waitForFunction(() => document.getAnimations().length === 0 && document.getElementById('scene').dataset.moving === 'false');
const shot = name => page.screenshot({ path: `${output}/${name}.png` });
const layout = async () => {
  const result = await page.evaluate(() => {
    const rect = id => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom }; };
    return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight,
      scene: rect('scene'), build: rect('build-identity'), A: rect('bar-A'), B: rect('bar-B'), toggle: rect('drawer-toggle'), labelA: rect('label-A'), labelB: rect('label-B'), open: document.getElementById('drawer-toggle').getAttribute('aria-expanded') === 'true' };
  });
  assert.ok(result.scrollWidth <= result.width, 'No horizontal overflow.');
  assert.ok(result.scrollHeight <= result.height + 1, 'Laptop layout fits without vertical scrolling.');
  assert.ok(result.scene.height > 200 && result.scene.bottom <= result.height, 'The pies stay visible.');
  assert.ok(result.build.bottom <= result.height && result.build.width > 0, 'Complete build ID stays on screen.');
  assert.ok(Math.abs(result.A.width - result.B.width) < 0.1, 'Bars have equal whole lengths.');
  for (const key of ['toggle', 'labelA', 'labelB', ...(result.open ? ['A', 'B'] : [])]) {
    const r = result[key];
    assert.ok(r.y >= result.scene.y && r.bottom <= result.scene.bottom + 1, `${key} stays inside the visible scene.`);
    assert.ok(r.x >= 0 && r.x + r.width <= result.width + 1, `${key} stays on screen.`);
  }
  return result;
};
const pairValues = { A: { n: 1, d: 2 }, B: { n: 2, d: 4 } };
let activations = 0, previews = 0, boundaryClicks = 0;
async function verify() {
  const actual = await page.evaluate(() => {
    const result = {};
    for (const pair of ['A', 'B']) {
      result[pair] = {
        fraction: document.querySelector(`#label-${pair} .fraction`).textContent,
        count: document.querySelector(`#label-${pair} .count`).textContent,
        barFraction: document.getElementById(`bar-fraction-${pair}`).textContent,
        barSelected: document.querySelectorAll(`#bar-${pair} .selected`).length,
        pieSelected: document.querySelectorAll(`#pie-${pair} .selected`).length,
        scene: document.getElementById('scene').getAttribute('aria-label'),
        disabled: Object.fromEntries(['clear', 'decrease', 'increase'].map(action => [action, document.querySelector(`[data-action="${action}"][data-pair="${pair}"]`).getAttribute('aria-disabled')])),
      };
    }
    return result;
  });
  for (const pair of ['A', 'B']) {
    const { n, d } = pairValues[pair], a = actual[pair];
    assert.equal(a.fraction, `${n}/${d}`);
    assert.equal(a.count, `${n} of ${d} equal pieces selected`);
    assert.equal(a.barFraction, `${n}/${d}`);
    assert.equal(a.barSelected, n);
    assert.equal(a.pieSelected, n);
    assert.ok(a.scene.includes(`Pie ${pair}: ${n} of ${d} equal pieces selected`));
    for (const action of ['clear', 'decrease', 'increase']) assert.equal(a.disabled[action], String(action === 'increase' ? n === d : n === 0));
  }
}

async function start(fixture = '') {
  console.log(`Loading ${fixture || 'normal'} (${Math.round((Date.now() - started) / 1000)}s)`);
  await page.goto(`${url}/${fixture ? '?preview=' + fixture : ''}`);
  await page.waitForFunction(() => document.getElementById('scene').width > 0);
  assert.equal(await page.locator('#scene-error').isVisible(), false);
  assert.equal(await page.locator('#build-identity').textContent(), manifest.id);
  const d = { halves: 2, quarters: 4, eighths: 8, sixteenths: 16, 'empty-whole': 16 }[fixture];
  pairValues.A = { n: fixture === 'empty-whole' ? 0 : fixture === 'sixteenths' ? 3 : 1, d: d || 2 };
  pairValues.B = { n: fixture === 'empty-whole' ? 16 : (d || 4) / 2, d: d || 4 };
  await verify();
}
async function open() {
  if (await page.locator('#drawer-toggle').getAttribute('aria-expanded') !== 'true') await page.locator('#drawer-toggle').click();
  await settle();
}
async function action(pair, type) {
  await page.locator(`[data-action="${type}"][data-pair="${pair}"]`).click({ force: true });
  const f = pairValues[pair];
  f.n = type === 'clear' ? 0 : type === 'increase' ? Math.min(f.d, f.n + 1) : Math.max(0, f.n - 1);
  activations++;
  await verify();
}
// Independent projection of reference coordinates. Pointer events hit the canvas,
// never a debug API or synthetic selection event. The camera is orthographic.
async function piePoint(pair, piece, portion = 0.5, top = true) {
  const r = await page.locator('#scene').boundingBox();
  const angle = Math.PI + (piece - 1 + portion) * 2 * Math.PI / pairValues[pair].d;
  const span = Math.max(12, r.width / r.height * (top ? 7.4 : 6.1));
  const scale = r.width / span, radius = 1.14;
  const elevation = top ? Math.PI / 2 - 0.001 : 0.68;
  const targetZ = top ? 0.40 : 0.25;
  const x = (pair === 'A' ? -2.55 : 2.55) + Math.sin(angle) * radius;
  const z = -0.65 + Math.cos(angle) * radius;
  return { x: r.x + r.width / 2 + x * scale,
    y: r.y + r.height / 2 + ((z - targetZ) * Math.sin(elevation) - (0.99 - 0.10) * Math.cos(elevation)) * scale };
}
async function pointSelect(pair, k, portion = 0.5, top = true) {
  const { x, y } = await piePoint(pair, k, portion, top);
  await page.mouse.move(x, y);
  await verify(); // Hover must never commit.
  assert.equal(await page.locator(`#bar-${pair} [data-piece="${k}"]`).evaluate(e => e.classList.contains('emphasized')), true);
  previews++;
  await page.mouse.click(x, y);
  pairValues[pair].n = k; activations++;
  await verify();
  assert.ok((await page.locator('#announcement').textContent()).startsWith(`Pie ${pair}: ${k} of`));
}
async function keyboardSelect(pair, k, kind) {
  const group = page.locator(`#${kind}-${pair}`);
  const current = Number(await group.locator('[tabindex="0"]').getAttribute('data-piece'));
  await group.locator('[tabindex="0"]').focus();
  if (k === 1) await page.keyboard.press('Home');
  else if (k === pairValues[pair].d) await page.keyboard.press('End');
  else for (let i = 0; i < Math.abs(k - current); i++) await page.keyboard.press(k > current ? 'ArrowRight' : 'ArrowLeft');
  await verify(); // Arrow movement must not select.
  assert.equal(await group.locator(`[data-piece="${k}"]`).evaluate(e => e === document.activeElement), true);
  assert.equal(await page.locator(`#bar-${pair} .emphasized`).getAttribute('data-piece'), String(k));
  previews++;
  await page.keyboard.press(k % 2 ? 'Enter' : 'Space');
  pairValues[pair].n = k; activations++;
  await verify();
}
try {
  // Real Tab order: header -> both pies -> serving controls -> toggle -> open bars.
  await start();
  await shot('initial');
  const visited = [];
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press('Tab');
    const current = await page.evaluate(() => ({ id: document.activeElement.id, parent: document.activeElement.parentElement?.id, piece: document.activeElement.dataset.piece }));
    visited.push(current);
    assert.ok(!current.parent?.startsWith('bar-'), 'Closed drawer is absent from Tab order.');
    if (current.id === 'drawer-toggle') break;
  }
  assert.ok(visited.some(v => v.parent === 'pie-A') && visited.some(v => v.parent === 'pie-B'));
  assert.equal(visited.at(-1).id, 'drawer-toggle');
  await page.keyboard.press('Enter'); await settle();
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#bar-A [tabindex="0"]').evaluate(e => e === document.activeElement), true);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#bar-B [tabindex="0"]').evaluate(e => e === document.activeElement), true);
  await page.keyboard.press('Escape'); await settle();
  assert.equal(await page.locator('#drawer-toggle').evaluate(e => e === document.activeElement), true);
  assert.equal(await page.locator('#fraction-bars').evaluate(e => e.inert), true);
  await verify();
  checks.push({ check: 'Real Tab order, closed-region exclusion, Escape restores toggle focus', result: 'passed' });

  for (const fixture of ['halves', 'quarters', 'eighths', 'sixteenths']) {
    await start(fixture); await open(); await page.locator('#view').click(); await settle();
    for (const pair of ['A', 'B']) {
      const d = pairValues[pair].d;
      // Each direction covers all d+1 states, zero through its own Clear control.
      for (const direction of ['pie-pointer', 'bar-pointer', 'pie-keyboard', 'bar-keyboard']) {
        await action(pair, 'clear');
        for (let k = 1; k <= d; k++) {
          if (direction === 'pie-pointer') await pointSelect(pair, k);
          else if (direction === 'bar-pointer') {
            const button = page.locator(`#bar-${pair} [data-piece="${k}"]`);
            await button.hover(); await verify(); previews++;
            await button.click(); pairValues[pair].n = k; activations++; await verify();
          } else await keyboardSelect(pair, k, direction.split('-')[0]);
        }
      }
      // Disabled boundaries and repeated input preserve focus and exact counts.
      await action(pair, 'increase');
      await action(pair, 'clear'); await action(pair, 'clear'); await action(pair, 'decrease');
      await action(pair, 'increase');
      await page.locator(`[data-action="decrease"][data-pair="${pair}"]`).focus();
      await page.keyboard.press('Enter'); pairValues[pair].n = 0; await verify();
      assert.equal(await page.locator(`[data-action="decrease"][data-pair="${pair}"]`).evaluate(e => e === document.activeElement), true);
      // Near both sides of all pie cuts and bar borders, not just cell centers.
      for (let k = 1; k <= d; k++) {
        for (const portion of [0.035, 0.965]) {
          await pointSelect(pair, k, portion); boundaryClicks++;
          const r = await page.locator(`#bar-${pair} [data-piece="${k}"]`).boundingBox();
          await page.mouse.click(r.x + (portion < 0.5 ? 2 : r.width - 2), r.y + r.height / 2);
          pairValues[pair].n = k; activations++; boundaryClicks++; await verify();
        }
      }
    }
    checks.push({ check: `${fixture}: both pairs, every count via pie/bar pointer and keyboard, controls and cut boundaries`, result: 'passed' });
    console.log(`SELECTION MATRIX PASSED ${fixture}`);
  }
  for (const [width, height] of [[1366, 768], [1280, 720]]) {
    await page.setViewportSize({ width, height });
    for (const fixture of ['', 'sixteenths']) {
      await start(fixture);
      checks.push({ check: `${width}x${height} ${fixture || 'normal'} closed`, layout: await layout() });
      await shot(`${width}x${height}-${fixture || 'normal'}-closed`);
      await open();
      checks.push({ check: `${width}x${height} ${fixture || 'normal'} open`, layout: await layout() });
      await shot(`${width}x${height}-${fixture || 'normal'}-open`);
      for (const pair of ['A', 'B']) {
        const widths = await page.locator(`#bar-${pair} .bar-segment`).evaluateAll(els => els.map(e => e.getBoundingClientRect().width));
        assert.equal(widths.length, pairValues[pair].d);
        assert.ok(Math.max(...widths) - Math.min(...widths) < 0.1, 'Equal-width bar subdivisions.');
      }
      // Alternate sides in angled view, then change view without changing state.
      await pointSelect('A', 1, 0.5, false);
      await pointSelect('B', pairValues.B.d, 0.5, false);
      await pointSelect('A', pairValues.A.d, 0.5, false);
      await page.locator('#view').click(); await settle(); await verify(); await layout();
      await keyboardSelect('B', Math.max(1, pairValues.B.d - 1), 'bar');
      await page.keyboard.press('Home'); await verify();
      await shot(`${width}x${height}-${fixture || 'normal'}-focus`);
    }
  }
  await start('empty-whole'); await open(); await shot('1280x720-empty-whole');
  await keyboardSelect('A', 7, 'pie');
  assert.notEqual(await page.locator('#pie-A [data-piece="7"]').evaluate(e => getComputedStyle(e).outlineStyle), 'none');
  await shot('1280x720-pie-keyboard');
  await page.locator('#view').click(); await settle(); await verify(); await layout();
  await page.setViewportSize({ width: 1366, height: 768 }); await settle(); await verify();
  if (await page.locator('#fullscreen').isVisible()) {
    await page.locator('#fullscreen').click(); await page.waitForFunction(() => Boolean(document.fullscreenElement)); await verify(); await layout();
    await page.locator('#fullscreen').click(); await page.waitForFunction(() => !document.fullscreenElement); await verify();
    checks.push({ check: 'Full Screen enter/exit, camera and viewport resize preserve servings', result: 'passed' });
  } else checks.push({ check: 'Full Screen', result: 'unsupported in this browser' });
  // Repeat and interrupt drawer transitions, with live selections between them.
  for (let i = 0; i < 7; i++) { await page.locator('#drawer-toggle').press('Enter'); await action(i % 2 ? 'A' : 'B', 'decrease'); }
  await settle(); await verify();
  await page.emulateMedia({ reducedMotion: 'reduce' }); await open();
  assert.equal(await page.locator('#fraction-bars').evaluate(e => getComputedStyle(e).transitionDuration), '0s');
  assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
  assert.equal(await page.locator('#scene').getAttribute('data-moving'), 'false');
  assert.equal(await page.locator('#scene').getAttribute('data-drawer-progress'), '1');
  await page.locator('#view').click(); await verify();
  assert.equal(await page.locator('#scene').getAttribute('data-moving'), 'false');
  await keyboardSelect('A', 5, 'bar');
  await page.keyboard.press('End'); await verify();
  await page.keyboard.press('ArrowRight'); await verify();
  await page.keyboard.press('Home'); await page.keyboard.press('ArrowLeft'); await verify();
  await page.keyboard.press('Escape'); await verify();
  assert.equal(await page.locator('#drawer-toggle').evaluate(e => e === document.activeElement), true);
  checks.push({ check: 'Repeated/interrupted input, arrow boundaries, focus-only navigation, reduced motion', result: 'passed' });
  const gpu = await page.locator('#scene').evaluate(canvas => {
    const gl = canvas.getContext('webgl2'); const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return { renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), error: gl.getError() };
  });
  assert.equal(gpu.error, 0);
  assert.deepEqual(messages, [], 'No unexpected browser or WebGL errors/warnings.');
  await writeFile(`${output}/browser-results.json`, JSON.stringify({ build: manifest.id, browser: browser.version(), gpu, activations, previews, boundaryClicks, checks, messages }, null, 2) + '\n');
  console.log(`BROWSER SELECTION REVIEW PASSED ${manifest.id}\n${output}`);
} finally { await browser.close(); server.close(); }
