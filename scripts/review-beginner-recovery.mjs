import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,relative,extname} from 'node:path';
import {encodeProgress} from '../src/progress.js';
import {createFreePlay} from '../src/free-play.js';
import {createSession,submit,selectSlices,useHint} from '../src/session.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve('dist'),out=resolve(process.env.REVIEW_OUTPUT||'../evidence/recovery-v2');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;if(p==='/favicon.ico'){res.writeHead(204).end();return;}const f=resolve(root,'.'+(p==='/'?'/index.html':p));if(relative(root,f).startsWith('..'))throw Error();res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=process.env.REVIEW_URL||`http://127.0.0.1:${server.address().port}/`,browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const ctx=await browser.newContext({viewport:{width:1366,height:768},acceptDownloads:true,hasTouch:true}),page=await ctx.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.stack));
const settle=()=>page.waitForFunction(()=>document.querySelector('#app')?.getAttribute('aria-busy')!=='true'&&document.querySelector('#scene')?.dataset.moving==='false');
const current=()=>page.evaluate(()=>{const s=window.__review.snapshot();return s[s.mode];});
const point=k=>page.evaluate(k=>window.__review.point(0,k),k);
const click=async k=>{const p=await point(k);await page.mouse.click(p.x,p.y);};
const fresh=async()=>{await page.goto(url+'?review=beginner');await page.evaluate(()=>localStorage.removeItem('easyaspie.construction.v2'));await page.reload();await settle();await page.locator('#challenge').click();await settle();};
try{
 await fresh();const id=await page.locator('#build-identity').textContent();
 // Interrupted success keeps the accepted answer but cannot advance twice or touch another mode.
 for(const stage of ['whole','cut','leftovers','glow','serve','cabinet']){
  await fresh();await click(1);await click(2);await page.locator('#scene-knife').click();await page.waitForFunction(s=>document.querySelector('#scene').dataset.servingStage===s,stage);
  if(stage==='whole'){await page.locator('#reset').click();await settle();}
  else if(stage==='cut'){await page.emulateMedia({reducedMotion:'reduce'});await settle();await page.emulateMedia({reducedMotion:'no-preference'});}
  else if(stage==='glow'){await page.locator('#free-play').click();await page.waitForTimeout(500);assert.equal(await page.locator('body').getAttribute('data-mode'),'free');await page.locator('#challenge').click();}
  else {await page.reload();await settle();}
  assert.equal((await current()).solved,true,stage);assert.equal((await current()).history.filter(e=>e.kind==='answer').length,1);assert.equal((await current()).plates[0].mask,3);await page.locator('#next-order').click();assert.equal((await current()).index,1);
 }
 checks.push('Success interrupted in every stage by skip, reduced-motion change, mode navigation or reload retains exactly one committed answer; no stale advance or geometry.');
 await fresh();const client=await ctx.newCDPSession(page);let p=await point(1),q=await point(2);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y,id:1}]});await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:q.x,y:q.y,id:1}]});await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});assert.equal((await current()).plates[0].mask,3);
 await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y,id:1}]});await client.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});assert.equal((await current()).plates[0].mask,3);
 await page.reload();await settle();assert.equal((await current()).plates[0].mask,3);await page.locator('#label-A summary').click();await page.locator('#pie-A [data-piece="1"]').tap();assert.equal((await current()).plates[0].mask,2);await page.locator('#label-A summary').click();
 checks.push('CDP touch drag commits exact units, touch cancellation discards preview, native large piece buttons support taps; reload retains unsubmitted construction. Actual hardware remains untested.');
 // Do not overwrite invalid saves or another tab's bytes.
 for(const bad of ['{','{"schema":999}','{"schema":2,"taskset":"future"}']){
  await page.evaluate(bad=>localStorage.setItem('easyaspie.construction.v2',bad),bad);await page.reload();await settle();assert.match(await page.locator('#save-status').textContent(),/Could Not Be Restored/);await click(1);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>localStorage.getItem('easyaspie.construction.v2')),bad);
 }
 await fresh();await page.evaluate(()=>localStorage.setItem('easyaspie.construction.v2','external-change'));await click(1);await page.waitForTimeout(180);assert.match(await page.locator('#save-status').textContent(),/changed elsewhere/);assert.equal(await page.evaluate(()=>localStorage.getItem('easyaspie.construction.v2')),'external-change');
 checks.push('Corrupt, unsupported and externally changed current saves are retained without overwrite.');
 const oldIdentity={id:'0.4.1_legacy_review',sha:'a'.repeat(40),builtAt:'2026-10-01T00:00:00Z',version:'0.4.1',codename:null,dirty:false};let session=submit(createSession(oldIdentity.id));session=useHint(session);session=submit(selectSlices(session,2));
 const legacy=encodeProgress({mode:'free',free:createFreePlay({A:{n:3,d:8},B:{n:1,d:4}}),scene:createFreePlay({A:{n:3,d:8},B:{n:1,d:4}}),flavors:{A:'strawberry',B:'apple'},learn:{index:0,phase:'predict',prediction:'',committed:null,assisted:false,completed:[]},challenge:{started:true,session},drawer:{open:false,opened:false,quietUntil:0}},oldIdentity);
 await page.evaluate(text=>{localStorage.removeItem('easyaspie.construction.v2');localStorage.setItem('easyaspie.progress.v1',text);},legacy);await page.reload();await settle();assert.match(await page.locator('.activity-feedback').textContent(),/previous work is preserved/i);assert.equal((await current()).history.length,0);await click(1);await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>localStorage.getItem('easyaspie.progress.v1')),legacy);
 const pending=page.waitForEvent('download');await page.locator('#legacy-report').click();await (await pending).saveAs(out+'/legacy-activity-report.html');const oldHTML=await readFile(out+'/legacy-activity-report.html','utf8');assert.ok(oldHTML.includes(oldIdentity.id));assert.match(oldHTML,/0\/4 [—-] Not Yet/);assert.match(oldHTML,/2\/4 [—-] Correct/);assert.match(oldHTML,/hint/);
 await page.locator('#clear-saved-work').click();await page.locator('#cancel-clear').click();assert.ok(await page.evaluate(()=>localStorage.getItem('easyaspie.construction.v2')));await page.locator('#clear-saved-work').click();await page.locator('#confirm-clear').click();await settle();assert.equal(await page.evaluate(()=>localStorage.getItem('easyaspie.progress.v1')),legacy);assert.equal((await current()).history.length,0);
 checks.push('Legacy v1 bytes, original wrong/correct responses and hint history remain; legacy report downloads correctly, valid Free Play/flavors copy forward, explicit new-save clearing preserves old work.');
 // Reopening unchanged tasks does not replay the new-task cue.
 const before=Number(await page.locator('#learning-card').getAttribute('data-cue-count'));await page.locator('#free-play').click();const afterFree=Number(await page.locator('#learning-card').getAttribute('data-cue-count'));await page.locator('#learn').click();assert.equal(Number(await page.locator('#learning-card').getAttribute('data-cue-count')),afterFree);assert.equal(afterFree,before+1);
 // Storage-unavailable path stays playable.
 const blocked=await browser.newContext();await blocked.addInitScript(()=>{Object.defineProperty(Storage.prototype,'getItem',{value(){throw Error('unavailable');}});});const offline=await blocked.newPage();offline.on('pageerror',e=>errors.push(e.message));await offline.goto(url+'?review=beginner');await offline.waitForTimeout(300);assert.match(await offline.locator('#save-status').textContent(),/Could Not Be Restored/);await offline.locator('#label-A summary').click();await offline.locator('#pie-A [data-piece="1"]').click();assert.equal(await offline.evaluate(()=>window.__review.snapshot().learn.plates[0].mask),1);await blocked.close();
 checks.push('Unchanged-task navigation suppresses glimmer replay; unavailable storage leaves the local game playable.');
 await page.screenshot({path:out+'/legacy-preserved.png'});assert.deepEqual(errors,[]);await writeFile(out+'/results.json',JSON.stringify({build:id,checks,errors,browser:browser.version()},null,2));console.log('RECOVERY AND TOUCH REVIEW PASSED',id,checks);
}catch(e){await page.screenshot({path:out+'/failure.png'});await writeFile(out+'/failure.json',JSON.stringify({message:e.message,errors,state:await current().catch(()=>null)},null,2));throw e;}finally{await browser.close();server.close();}
