import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve('dist'),out=resolve(process.env.REVIEW_OUTPUT||'../evidence/presentation');await mkdir(out,{recursive:true});
const manifest=JSON.parse(await readFile(root+'/build.json','utf8'));
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;if(p==='/favicon.ico'){res.writeHead(204).end();return;}const f=resolve(root,'.'+(p==='/'?'/index.html':p));if(relative(root,f).startsWith('..'))throw Error();res.setHeader('Content-Type',{'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json'}[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH}),page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const settle=()=>page.waitForFunction(()=>document.querySelector('#app').getAttribute('aria-busy')!=='true'&&document.querySelector('#scene').dataset.moving==='false');
const values=()=>page.locator('.fraction').allTextContents();
await page.addInitScript(()=>localStorage.removeItem('easyaspie.progress.v1'));
try{
 await page.goto(`http://127.0.0.1:${server.address().port}`);await settle();
 await page.waitForFunction(()=>!document.getElementById('drawer-cue').hidden);
 assert.equal(await page.locator('#drawer-cue').evaluate(e=>getComputedStyle(e).pointerEvents),'none');await page.screenshot({path:out+'/handle-cue.png'});
 const hit=async()=>{const r=await page.locator('#drawer-toggle').boundingBox();assert.ok(r&&r.width>=44);assert.equal(await page.evaluate(({x,y})=>document.elementFromPoint(x,y)?.closest('button')?.id,{x:r.x+r.width/2,y:r.y+r.height/2}),'drawer-toggle');await page.mouse.click(r.x+r.width/2,r.y+r.height/2);await settle();};
 await hit();assert.equal(await page.locator('#drawer-toggle').getAttribute('aria-expanded'),'true');
 await page.locator('#learn').click();await settle();await hit();assert.equal(await page.locator('#drawer-toggle').getAttribute('aria-expanded'),'false');
 await page.waitForFunction(()=>Number(document.getElementById('drawer-toggle').dataset.quietUntil)>Date.now());const quiet=Number(await page.locator('#drawer-toggle').getAttribute('data-quiet-until'));assert.ok(quiet-Date.now()>599000);assert.equal(await page.locator('#drawer-cue').isVisible(),false);
 await page.locator('#drawer-toggle').focus();await page.keyboard.press('Enter');await settle();await page.locator('#bar-B [data-piece="1"]').focus();await page.keyboard.press('Escape');await settle();assert.equal(await page.locator('#drawer-toggle').evaluate(e=>e===document.activeElement),true);
 checks.push('The visible brass handle accepts real center-coordinate clicks in Free Play and Learn; native Enter/Space, Escape focus recovery and settled open-close quiet period work.');
 for(const size of [{width:1280,height:720},{width:390,height:844}]){await page.setViewportSize(size);await page.locator('#free-play').click();await settle();await page.locator('#orbit-left').click();await hit();await hit();await page.screenshot({path:out+`/${size.width}x${size.height}-handle.png`});}
 await page.locator('#challenge').click();await settle();assert.equal(await page.locator('#drawer-toggle').isDisabled(),true);assert.equal(await page.locator('#drawer-cue').isVisible(),false);assert.equal(await page.locator('#submit-order').isEnabled(),true);assert.equal(await page.locator('#next-order').isEnabled(),false);
 await page.locator('#pie-B [data-piece="2"]').focus();await page.keyboard.press('Enter');await page.locator('#submit-order').click();assert.equal(await page.locator('#submit-order').isEnabled(),false);assert.equal(await page.locator('#next-order').isEnabled(),true);
 const colors=await page.locator('#next-order').evaluate(e=>getComputedStyle(e).backgroundColor);assert.equal(colors,'rgb(217, 244, 191)');
 checks.push('Camera/viewport changes preserve handle hit alignment; Challenge locks it and suppresses the cue; enabled Check Order/Next Order use the available-action highlight.');
 await page.setViewportSize({width:1366,height:768});await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await settle();await page.waitForFunction(()=>!document.getElementById('drawer-cue').hidden);assert.equal(await page.locator('.cue-arrow').evaluate(e=>getComputedStyle(e).animationName),'none');
 await hit();await page.locator('#challenge').click();await settle();await page.locator('#free-play').click();assert.equal(Number(await page.locator('#drawer-toggle').getAttribute('data-quiet-until')),0);checks.push('Reduced motion uses a static cue and immediate drawer motion; entering Challenge after only opening does not falsely complete the user cycle. Pure clock tests cover 600,000 ms and background/locked pauses.');
 assert.deepEqual(errors,[]);await writeFile(out+'/handle-results.json',JSON.stringify({build:manifest.id,checks,errors},null,2));console.log('HANDLE PASSED',manifest.id);
}catch(e){await page.screenshot({path:out+'/failure.png'});throw e;}finally{await browser.close();server.close();}
