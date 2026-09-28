// Optional browser acceptance harness. Uses a separately installed Playwright;
// no browser download or new runtime dependency is needed by the game/CI.
// PLAYWRIGHT_MODULE may point to its index.mjs; CHROMIUM_PATH is optional.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve('dist');
const manifest = JSON.parse(await readFile(`${root}/build.json`, 'utf8'));
const output = resolve(process.env.REVIEW_OUTPUT || 'docs/review/issue-10');
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const path = resolve(root, '.' + (new URL(req.url, 'http://localhost').pathname === '/' ? '/index.html' : new URL(req.url, 'http://localhost').pathname));
  if (!path.startsWith(root + '/')) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', mime[extname(path)] || 'application/octet-stream'); res.end(await readFile(path)); }
  catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const messages = [], checks = [];
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
page.on('pageerror', e => messages.push({ type: 'pageerror', message: e.message }));
page.on('console', m => { if (['error', 'warning'].includes(m.type())) messages.push({ type: m.type(), message: m.text() }); });
const values = () => page.locator('.fraction').allTextContents();
const settle = () => page.waitForFunction(() => document.getAnimations().length === 0);
const shot = name => page.screenshot({ path: `${output}/${name}.png` });
const layout = async () => {
  const result = await page.evaluate(() => {
    const rect = id => { const r = document.getElementById(id).getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom }; };
    return { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight,
      scene: rect('scene'), build: rect('build-identity'), A: rect('bar-A'), B: rect('bar-B') };
  });
  assert.ok(result.scrollWidth <= result.width, 'No horizontal overflow.');
  assert.ok(result.scrollHeight <= result.height + 1, 'Laptop layout fits without vertical scrolling.');
  assert.ok(result.scene.height > 200 && result.scene.bottom <= result.height, 'The pies stay visible.');
  assert.ok(result.build.bottom <= result.height && result.build.width > 0, 'Complete build ID stays on screen.');
  assert.ok(Math.abs(result.A.width - result.B.width) < 0.1, 'Bars have equal whole lengths.');
  return result;
};
try {
  for (const [width, height] of [[1366, 768], [1280, 720]]) {
    await page.setViewportSize({ width, height });
    await page.goto(url);
    await page.waitForFunction(() => document.getElementById('scene').width > 0);
    assert.equal(await page.locator('#scene-error').isVisible(), false);
    assert.equal(await page.locator('#build-identity').textContent(), manifest.id);
    assert.deepEqual(await values(), ['1/2', '2/4']);
    assert.equal(await page.getByRole('button', { name: 'Learn Coming Later' }).isEnabled(), false);
    assert.equal(await page.getByRole('button', { name: 'Challenge Coming Later' }).isEnabled(), false);
    checks.push({ check: `${width}x${height} closed`, layout: await layout() });
    await shot(`${width}x${height}-closed`);
    // Reach the drawer using only Tab; Enter opens and Space closes.
    for (let i = 0; i < 8 && !(await page.locator('#drawer-toggle').evaluate(e => e === document.activeElement)); i++) await page.keyboard.press('Tab');
    assert.equal(await page.locator('#drawer-toggle').evaluate(e => e === document.activeElement), true);
    assert.notEqual(await page.locator('#drawer-toggle').evaluate(e => getComputedStyle(e).outlineStyle), 'none');
    await page.keyboard.press('Enter');
    await settle();
    assert.equal(await page.locator('#drawer-toggle').getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#fraction-bars').getAttribute('aria-hidden'), 'false');
    checks.push({ check: `${width}x${height} open`, layout: await layout() });
    assert.deepEqual(await values(), ['1/2', '2/4']);
    await shot(`${width}x${height}-open`);
    await page.keyboard.press('Space');
    await settle();
    assert.equal(await page.locator('#fraction-bars').evaluate(e => e.inert), true);
    assert.equal(await page.locator('#drawer-toggle').evaluate(e => e === document.activeElement), true);
    assert.deepEqual(await values(), ['1/2', '2/4']);
  }
  await page.locator('#drawer-toggle').click();
  await settle();
  await page.locator('#view').click();
  assert.equal(await page.locator('#view').textContent(), 'Angled View');
  await shot('1280x720-top-view');
  await page.setViewportSize({ width: 1366, height: 768 });
  await layout();
  await page.locator('#view').click();
  if (await page.locator('#fullscreen').isVisible()) {
    await page.locator('#fullscreen').click();
    await page.waitForFunction(() => Boolean(document.fullscreenElement));
    await layout();
    await page.locator('#fullscreen').click();
    await page.waitForFunction(() => !document.fullscreenElement);
    checks.push({ check: 'Full Screen enter/exit and camera/viewport resize', result: 'passed' });
  } else checks.push({ check: 'Full Screen', result: 'not supported by this browser' });
  assert.deepEqual(await values(), ['1/2', '2/4']);
  // Repeated input must settle to the last request without altering the serving.
  for (let i = 0; i < 7; i++) await page.locator('#drawer-toggle').press('Enter');
  await settle();
  assert.equal(await page.locator('#drawer-toggle').getAttribute('aria-expanded'), 'false');
  assert.deepEqual(await values(), ['1/2', '2/4']);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#drawer-toggle').press('Space');
  assert.equal(await page.locator('#fraction-bars').evaluate(e => getComputedStyle(e).transitionDuration), '0s');
  assert.equal(await page.evaluate(() => document.getAnimations().length), 0);
  assert.equal(await page.locator('#drawer-toggle').getAttribute('aria-expanded'), 'true');
  assert.deepEqual(await values(), ['1/2', '2/4']);
  checks.push({ check: 'Keyboard, focus, rapid reversal, reduced motion, immutable servings', result: 'passed' });
  for (const [fixture, expected, selected] of [['sixteenths', ['3/16', '8/16'], [3, 8]], ['empty-whole', ['0/16', '16/16'], [0, 16]]]) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${url}/?preview=${fixture}`);
    await page.locator('#drawer-toggle').click();
    assert.deepEqual(await values(), expected);
    for (const [i, pair] of ['A', 'B'].entries()) {
      assert.equal(await page.locator(`#bar-${pair} .bar-segment`).count(), 16);
      assert.equal(await page.locator(`#bar-${pair} .selected`).count(), selected[i]);
      const widths = await page.locator(`#bar-${pair} .bar-segment`).evaluateAll(els => els.map(e => e.getBoundingClientRect().width));
      assert.ok(Math.max(...widths) - Math.min(...widths) < 0.1);
    }
    await layout();
    await shot(`1280x720-${fixture}`);
    await page.locator('#view').click();
    await shot(`1280x720-${fixture}-top`);
  }
  const gpu = await page.locator('#scene').evaluate(canvas => {
    const gl = canvas.getContext('webgl2'); const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return { renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), error: gl.getError() };
  });
  assert.equal(gpu.error, 0);
  assert.deepEqual(messages, [], 'No unexpected browser or WebGL errors/warnings.');
  await writeFile(`${output}/browser-results.json`, JSON.stringify({ build: manifest.id, browser: browser.version(), gpu, checks, messages }, null, 2) + '\n');
  console.log(`BROWSER REVIEW PASSED ${manifest.id}\n${output}`);
} finally { await browser.close(); server.close(); }
