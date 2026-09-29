// Capture real production-game video and geometry review. No generated imagery.
// Same optional Playwright/Chromium environment variables as review-selection.mjs.
// FFmpeg must be available to Playwright, and `ffmpeg` on PATH encodes the MP4.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, copyFile, rm } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve('dist'), output = resolve(process.env.REVIEW_OUTPUT || 'docs/review/issue-18');
const manifest = JSON.parse(await readFile(`${root}/build.json`, 'utf8'));
await mkdir(output, { recursive: true });
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname, path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!path.startsWith(root + '/')) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }[extname(path)] || 'application/octet-stream'); res.end(await readFile(path)); }
  catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const messages = [], chapters = [], metrics = [];
const monitor = page => {
  page.on('pageerror', e => messages.push(e.message));
  page.on('console', m => { if (['warning', 'error'].includes(m.type())) messages.push(m.text()); });
};
const settle = async page => { await page.waitForFunction(() => document.querySelector('#scene').dataset.moving === 'false'); await page.screenshot(); };
let start;
const chapter = name => chapters.push({ seconds: Number(((Date.now() - start) / 1000).toFixed(2)), name });
try {
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 }, recordVideo: { dir: `${output}/raw`, size: { width: 1366, height: 768 } } });
  const page = await context.newPage(); monitor(page);
  page.setDefaultNavigationTimeout(180000);
  const recordingStart = Date.now();
  await page.goto(url); await settle(page); await page.screenshot();
  assert.equal(await page.locator('#build-identity').textContent(), manifest.id);
  start = Date.now(); const trimStart = (start - recordingStart) / 1000;
  chapter('Default Composition And Full Build ID'); await page.waitForTimeout(3000);
  chapter('Spatial Drawer Opens'); await page.locator('#drawer-toggle').click(); await settle(page); await page.waitForTimeout(2000);
  // Real pointer input, independently projected at the same fixed camera.
  const r = await page.locator('#scene').boundingBox(), scale = r.width / Math.max(12, r.width / r.height * 6.1);
  const angle = Math.PI + 1.5 * Math.PI, x = -2.55 + Math.sin(angle) * 1.14, z = -0.65 + Math.cos(angle) * 1.14;
  chapter('Pie A To Its Matching Bar');
  await page.mouse.click(r.x + r.width / 2 + x * scale, r.y + r.height / 2 + ((z - 0.25) * Math.sin(0.68) - 0.89 * Math.cos(0.68)) * scale);
  assert.equal(await page.locator('#bar-fraction-A').textContent(), '2/2'); await page.waitForTimeout(2200);
  chapter('Bar B To Its Matching Pie'); await page.locator('#bar-B [data-piece="3"]').click();
  assert.equal(await page.locator('#label-B .fraction').textContent(), '3/4'); await page.waitForTimeout(2200);
  chapter('Keyboard Focus And Selection'); await page.locator('#pie-A [tabindex="0"]').focus(); await page.keyboard.press('Home'); await page.waitForTimeout(1200); await page.keyboard.press('Enter'); await page.waitForTimeout(1600);
  chapter('Shared Top View'); await page.locator('#view').click(); await settle(page); await page.waitForTimeout(1800);
  chapter('Return To Angled View'); await page.locator('#view').click(); await settle(page); await page.waitForTimeout(1600);
  chapter('Drawer Closes And Shadows Follow'); await page.locator('#drawer-toggle').click(); await settle(page); await page.waitForTimeout(1500);
  chapter('Drawer Reopens'); await page.locator('#drawer-toggle').click(); await settle(page); await page.waitForTimeout(1500);
  chapter('Reduced Motion: Immediate Drawer And View'); await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#drawer-toggle').click(); assert.equal(await page.locator('#scene').getAttribute('data-moving'), 'false'); await page.waitForTimeout(1300);
  await page.locator('#drawer-toggle').click(); assert.equal(await page.locator('#scene').getAttribute('data-drawer-progress'), '1'); await page.waitForTimeout(1300);
  await page.locator('#view').click(); assert.equal(await page.locator('#scene').getAttribute('data-moving'), 'false'); await page.waitForTimeout(1300);
  await page.locator('#view').click(); await page.waitForTimeout(2000);
  const recording = page.video(); await context.close(); const raw = await recording.path();
  execFileSync('ffmpeg', ['-y', '-ss', String(trimStart), '-i', raw, '-c:v', 'libx264', '-preset', 'medium', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an', `${output}/bakery-full-capture.mp4`], { stdio: 'pipe' });
  await rm(`${output}/raw`, { recursive: true });
  const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', `${output}/bakery-full-capture.mp4`], { encoding: 'utf8' }).trim());
  console.log(`Captured ${duration}s production-game video.`);
  const inspect = await browser.newPage({ viewport: { width: 1366, height: 768 } }); monitor(inspect);
  await inspect.goto(`${url}/?preview=quarters&review=solids`); await settle(inspect);
  await inspect.screenshot({ path: `${output}/1366x768-model-review.png` });
  // A screenshot crop from the very same running scene, no rescaling or beauty render.
  await inspect.screenshot({ path: `${output}/pastry-close-up.png`, clip: { x: 155, y: 205, width: 500, height: 300 } });
  await inspect.goto(url); await settle(inspect);
  // Includes Playwright input/settling and screenshot readback. rAF callbacks
  // also run while the scene is idle: this is NOT rendered FPS or input latency.
  await inspect.evaluate(() => { window.reviewFrames = []; const tick = t => { window.reviewFrames.push(t); if (window.reviewFrames.length < 180) window.reviewFrame = requestAnimationFrame(tick); }; window.reviewFrame = requestAnimationFrame(tick); });
  const begin = Date.now(); await inspect.locator('#drawer-toggle').click(); await settle(inspect);
  const frames = await inspect.evaluate(() => { cancelAnimationFrame(window.reviewFrame); return window.reviewFrames; });
  metrics.push({ action: 'Drawer open', wallMs: Date.now() - begin, animationFrameCallbacks: frames.length, drawCalls: await inspect.locator('#scene').getAttribute('data-draw-calls'), frameIntervalsMs: frames.slice(1).map((t, i) => Number((t - frames[i]).toFixed(2))) });
  const gpu = await inspect.locator('#scene').evaluate(c => { const gl = c.getContext('webgl2'), ext = gl.getExtension('WEBGL_debug_renderer_info'); return { renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), error: gl.getError() }; });
  assert.equal(gpu.error, 0); assert.deepEqual(messages, []);
  await writeFile(`${output}/media-results.json`, JSON.stringify({ build: manifest.id, browser: browser.version(), gpu, duration, chapters, metrics, messages, note: 'Actual software-rendered browser capture; classroom hardware and projector not tested. Model-review separation is static geometry inspection, not Cut/Regroup gameplay.' }, null, 2) + '\n');
  await copyFile(`${root}/build.json`, `${output}/build.json`); await copyFile(`${root}/BUILD.md`, `${output}/BUILD.md`);
  console.log(`MEDIA REVIEW PASSED ${manifest.id}`);
} finally { await browser.close(); server.close(); }
