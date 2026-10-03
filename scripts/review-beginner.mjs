import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
import {LEARN_TASKS,ORDER_TASKS,full} from '../src/construction.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve('dist'),out=resolve(process.env.REVIEW_OUTPUT||'../evidence/beginner');await mkdir(out,{recursive:true});
const server=createServer(async(req,res)=>{try{let p=new URL(req.url,'http://localhost').pathname;if(p==='/favicon.ico'){res.writeHead(204).end();return;}if(p.startsWith('/EasyAsPie/'))p=p.slice(10);const file=resolve(root,'.'+(p==='/'?'/index.html':p));if(relative(root,file).startsWith('..'))throw Error();res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=process.env.REVIEW_URL||`http://127.0.0.1:${server.address().port}/EasyAsPie/`,browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const context=await browser.newContext({viewport:{width:1366,height:768},acceptDownloads:true});const page=await context.newPage();const errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.stack));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});
const settle=()=>page.waitForFunction(()=>document.querySelector('#app')?.getAttribute('aria-busy')!=='true'&&document.querySelector('#scene')?.dataset.moving==='false');
const snap=()=>page.evaluate(()=>window.__review.snapshot());const current=async()=>{const s=await snap();return s[s.mode];};
const point=(side,k,r)=>page.evaluate(([side,k,r])=>window.__review.point(side,k,r),[side,k,r]);
const unit=async(side,k)=>{const p=await point(side,k);await page.mouse.click(p.x,p.y);};
const stroke=async(side,units)=>{const p=await point(side,units[0]);await page.mouse.move(p.x,p.y);await page.mouse.down();for(const k of units.slice(1)){const q=await point(side,k);await page.mouse.move(q.x,q.y,{steps:4});}await page.mouse.up();};
const solve=async t=>{if(t.kind==='read'){await page.locator('#written-answer').selectOption(`${t.n}/${t.d}`);}else{const masks=t.whole?[full(t.grid),full(t.n*t.grid/t.d)]:[full(t.n*t.grid/t.d),0];for(let side=0;side<(t.whole?2:1);side++){const c=await current();for(let k=1;k<=t.grid;k++)if(!!(c.plates[side].mask&(1<<(k-1)))!==!!(masks[side]&(1<<(k-1))))await unit(side,k);}}await page.locator('#submit-order').click();await settle();assert.equal((await current()).solved,true,t.id);};
const shot=name=>page.screenshot({path:out+'/'+name+'.png'});
try{
 await page.goto(url+'?review=beginner');await settle();const id=await page.locator('#build-identity').textContent();
 await shot('1366x768-learn-blank');assert.equal((await snap()).mode,'learn');assert.deepEqual((await current()).plates.map(p=>p.mask),[0,0]);
 await page.locator('#challenge').click();await settle();await page.locator('#submit-order').click();assert.equal((await current()).history[0].correct,false);
 await stroke(0,[1,2]);assert.equal((await current()).plates[0].mask,3,'real add drag');
 const p=await point(0,2);await page.mouse.move(p.x,p.y);await page.mouse.down();const q=await point(0,3);await page.mouse.move(q.x,q.y,{steps:5});assert.match(await page.locator('#operation').textContent(),/ERASE preview/);assert.equal((await current()).plates[0].mask,3,'preview does not commit');await shot('erase-preview');await page.mouse.up();assert.equal((await current()).plates[0].mask,1,'erase includes empty region without adding it');
 await stroke(0,[4,1,2]);assert.equal((await current()).plates[0].mask,11,'add crossing filled units remains add');
 await page.locator('#undo').click();assert.equal((await current()).plates[0].mask,1);
 const r=await point(0,2);await page.mouse.move(r.x,r.y);await page.mouse.down();await page.keyboard.press('Escape');await page.mouse.up();assert.equal((await current()).plates[0].mask,1,'Escape cancels');
 await page.mouse.move(r.x,r.y);await page.mouse.down();await page.dispatchEvent('#scene','pointercancel',{pointerId:1});await page.mouse.up();assert.equal((await current()).plates[0].mask,1,'pointer cancel');
 // Camera-origin movement across a plate never paints.
 const scene=await page.locator('#scene').boundingBox();await page.mouse.move(scene.x+10,scene.y+scene.height/2);await page.mouse.down();await page.mouse.move(r.x,r.y,{steps:8});await page.mouse.up();assert.equal((await current()).plates[0].mask,1);await page.locator('#reset-view').click();await settle();
 await page.locator('#label-A summary').click();await page.locator('#pie-A [data-piece="2"]').focus();await page.keyboard.press('Shift+ArrowRight');assert.match(await page.locator('#operation').textContent(),/ADD preview/);await page.keyboard.press('Enter');assert.equal((await current()).plates[0].mask,7);await page.keyboard.press('Shift+ArrowRight');await page.keyboard.press('Escape');assert.equal((await current()).plates[0].mask,7);await page.locator('#label-A summary').click();
 await page.locator('#reset').click();assert.equal((await current()).history.filter(e=>e.kind==='answer').length,1,'clear retains original attempt');
 const cue=await page.locator('#learning-card').getAttribute('data-cue-count');await unit(0,1);await unit(0,1);await page.setViewportSize({width:1280,height:720});await page.setViewportSize({width:1366,height:768});assert.equal(await page.locator('#learning-card').getAttribute('data-cue-count'),cue,'no cue on edit/resize');
 await page.locator('#hint-order').click();await unit(0,1);await unit(0,2);
 const stages=[];await page.exposeFunction('recordStage',s=>stages.push(s));await page.evaluate(()=>new MutationObserver(()=>window.recordStage(document.querySelector('#scene').dataset.servingStage)).observe(document.querySelector('#scene'),{attributes:true,attributeFilter:['data-serving-stage']}));
 await page.locator('#submit-order').click();await page.waitForFunction(()=>document.querySelector('#scene').dataset.servingStage==='leftovers');await shot('leftovers');await page.waitForFunction(()=>document.querySelector('#scene').dataset.servingStage==='cabinet');await shot('cabinet-supply');await settle();assert.deepEqual([...new Set(stages)],['whole','cut','leftovers','glow','serve','cabinet','ready']);assert.equal((await current()).history.filter(e=>e.kind==='answer').length,2);await page.reload();await settle();assert.equal((await current()).solved,true);assert.equal((await current()).plates[0].mask,3);await page.locator('#next-order').click();
 checks.push('Real pointer add/erase, latched overlap, wrap, undo, preview/commit separation, Escape/pointer cancellation, camera ownership, keyboard ranges, exact choreography stages, solved reload and original retry/help retention.');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(let i=1;i<ORDER_TASKS.length;i++){
  if(i===2){await unit(0,1);await page.locator('#free-play').click();await page.locator('[data-reference]').click();await page.keyboard.press('Escape');await page.locator('#challenge').click();assert.equal((await current()).plates[0].mask,1);assert.ok((await current()).history.some(e=>e.source==='free-play'));}
  await solve(ORDER_TASKS[i]);if(i===20)await shot('mixed-order-served');await page.locator('#next-order').click();await settle();
 }
 assert.equal((await current()).complete,true);await shot('challenge-complete');const pending=page.waitForEvent('download');await page.locator('#download-report').click();const dl=await pending;await dl.saveAs(out+'/activity-report.html');const html=await readFile(out+'/activity-report.html','utf8');const metadata=JSON.parse(/<script type="application\/json" id="activity-data">(.*?)<\/script>/s.exec(html)[1]);const round=metadata.sessions.find(s=>s.mode==='challenge');assert.equal(round.rows.filter(r=>r.complete).length,24);assert.equal(round.rows[0].responses[0].correct,false);assert.equal(round.rows[0].retries,1);assert.ok(round.rows[0].help.includes('hint'));assert.equal(metadata.build.id,id);assert.ok(html.includes(id));
 await page.reload();await settle();assert.equal((await current()).complete,true);await page.locator('#new-round').click();assert.equal((await snap()).archives[0].history.filter(e=>e.kind==='answer').length,25);
 checks.push('All twenty preserved conversions and four mixed extensions solved with real pointer input; reduced motion, help detour, completion reload, downloaded report parity and archived round.');
 await page.locator('#learn').click();for(const t of LEARN_TASKS){if(t.kind==='read'){await page.locator('#written-answer').selectOption(t.id==='read-half'?'1/4':'1/2');await page.locator('#submit-order').click();assert.equal((await current()).solved,false);}await solve(t);await page.locator('#next-order').click();await settle();}assert.equal((await current()).complete,true);checks.push('All eight Learn tasks, visual-to-written wrong/correct responses and mixed progression without numerator entry quiz.');
 await page.locator('#free-play').click();await page.locator('#drawer-toggle').click();await settle();assert.equal(await page.locator('#drawer-toggle').getAttribute('aria-expanded'),'true');
 for(const pair of ['A','B']){
  await page.locator('#label-'+pair+' summary').click();
  for(const d of [2,4,8,16]){let f=(await snap()).free[pair];while(f.d<d){await page.locator(`[data-action="cut"][data-pair="${pair}"]`).click();await settle();f=(await snap()).free[pair];}while(f.d>d){await page.locator(`[data-action="clear"][data-pair="${pair}"]`).click();await page.locator(`[data-action="regroup"][data-pair="${pair}"]`).click();await settle();f=(await snap()).free[pair];}
   for(let n=0;n<=d;n++){if(!n)await page.locator(`[data-action="clear"][data-pair="${pair}"]`).click();else{await page.locator(`#pie-${pair} [data-piece="${n}"]`).focus();await page.keyboard.press('Enter');}assert.deepEqual((await snap()).free[pair],{n,d});}
  }await page.locator('#label-'+pair+' summary').click();
 }
 await page.locator('[data-flavor="A"]').selectOption('strawberry');await page.reload();await settle();assert.equal((await snap()).flavors.A,'strawberry');assert.equal((await snap()).drawerOpen,true);
 checks.push('Both Free Play pies, every 0..d amount at 2/4/8/16 through native keyboard controls, exact Cut/Regroup paths, flavors and open drawer survive reload.');
 for(const size of [{width:1366,height:768},{width:1280,height:720},{width:390,height:844}]){
  await page.setViewportSize(size);await page.locator('#challenge').click();await settle();await shot(`${size.width}x${size.height}-challenge`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),size.width);
  await page.locator('[data-reference]').click();await page.locator('.reference-content').evaluate(e=>e.scrollTop=e.scrollHeight);const head=await page.locator('#close-reference').boundingBox();assert.ok(head.y>=0&&head.y+head.height<=size.height);await shot(`${size.width}-reference`);await page.keyboard.press('Escape');assert.equal(await page.locator('#fraction-reference').evaluate(e=>e.open),false);
 }
 await page.setViewportSize({width:1366,height:768});await page.locator('#free-play').click();for(let i=0;i<5;i++)await page.locator('#orbit-left').click();await shot('orbit-left');for(let i=0;i<10;i++)await page.locator('#orbit-right').click();await shot('orbit-right');await page.locator('#view').click();await settle();await shot('top-view');
 assert.deepEqual(errors,[]);await writeFile(out+'/results.json',JSON.stringify({build:id,checks,errors,browser:browser.version()},null,2));console.log('BEGINNER REVIEW PASSED',id,checks);
}catch(e){await shot('failure');await writeFile(out+'/failure.json',JSON.stringify({message:e.message,stack:e.stack,errors,state:await snap().catch(()=>null)},null,2));throw e;}finally{await browser.close();server.close();}
