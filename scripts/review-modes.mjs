import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve('dist'),out=resolve(process.env.REVIEW_OUTPUT||'../evidence/modes');await mkdir(out,{recursive:true});
const manifest=JSON.parse(await readFile(root+'/build.json','utf8'));
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;if(p==='/favicon.ico'){res.writeHead(204).end();return;}const f=resolve(root,'.'+(p==='/'?'/index.html':p));if(relative(root,f).startsWith('..'))throw Error();res.setHeader('Content-Type',{'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json'}[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const context=await browser.newContext({viewport:{width:1366,height:768},...(process.env.RECORD_MODES==='1'?{recordVideo:{dir:out+'/recording',size:{width:1366,height:768}}}:{})});
const page=await context.newPage(),errors=[],checks=[],chapters=[],start=Date.now();
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const settle=()=>page.waitForFunction(()=>document.querySelector('#app').getAttribute('aria-busy')!=='true'&&document.querySelector('#scene')?.dataset.moving==='false');
const values=()=>page.locator('.fraction').allTextContents();
const select=async(pair,n)=>{if(n===0)await page.locator(`[data-action="clear"][data-pair="${pair}"]`).click();else{await page.locator(`#pie-${pair} [data-piece="${n}"]`).focus();await page.keyboard.press('Enter');}};
const chapter=async name=>{chapters.push({second:(Date.now()-start)/1000,name});if(process.env.RECORD_MODES==='1')await page.waitForTimeout(800);};
const layout=async()=>{const r=await page.evaluate(()=>{const bounds=id=>{const r=document.getElementById(id).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};return{width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollWidth,card:bounds('learning-card'),label:bounds('label-B'),bar:bounds('bar-B'),build:bounds('build-identity')};});assert.equal(r.width,r.scroll);assert.ok(r.card.left>=0&&r.card.right<=r.width);assert.ok(r.card.top>r.label.bottom&&r.card.bottom<r.build.top);if(await page.locator('#drawer-toggle').getAttribute('aria-expanded')==='true')assert.ok(r.card.top>=r.bar.bottom-1,JSON.stringify(r));return r;};
try{
 await page.goto(url);await settle();assert.equal(await page.locator('#build-identity').textContent(),manifest.id);await chapter('Integrated 3D Bakery');
 await page.locator('#drawer-toggle').click();await settle();await page.locator('[data-action="cut"][data-pair="A"]').click();await page.waitForTimeout(450);await page.screenshot({path:out+'/physical-cut.png'});await settle();await select('B',3);const saved=await values();await chapter('Physical Slicing And Two-Way Selection');
 const outer=page.locator('.vocabulary-bar > [data-term="denominator"]');await outer.hover();const nested=outer.locator('[data-term="whole"]');await nested.hover();assert.equal(await outer.locator(':scope > .term-tip').isVisible(),true);assert.equal(await nested.locator(':scope > .term-tip').isVisible(),true);await page.screenshot({path:out+'/nested-tooltip.png'});await nested.click();assert.equal(await page.locator('#fraction-reference').evaluate(e=>e.open),true);await page.keyboard.press('Escape');
 await outer.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#fraction-reference').evaluate(e=>e.open),true);await page.locator('#close-reference').click();checks.push('Hover-safe nested vocabulary, mouse/keyboard reference opening, Escape and Close.');
 await page.locator('#learn').click();await settle();await page.locator('#test-prediction').click();assert.match(await page.locator('.activity-feedback').textContent(),/Choose a prediction/);assert.deepEqual(await values(),['1/2','0/8']);
 for(const [index,prediction,answer,expectedA]of[[0,0,4,'2/4'],[1,6,3,'6/8'],[2,6,6,'6/16']]){
  await page.locator('#lesson-select').selectOption(String(index));await page.locator('#prediction').selectOption(String(prediction));await page.locator('#test-prediction').click();await settle();assert.equal((await values())[0],expectedA);await page.locator('#check-lesson').click();assert.match(await page.locator('.activity-feedback').textContent(),/Not Yet/);await select('B',answer);await page.locator('#check-lesson').click();assert.match(await page.locator('.activity-feedback').textContent(),/Same amount/);await layout();await chapter('Guided Lesson '+(index+1));
 }
 assert.match(await page.locator('.activity-feedback').textContent(),/3\/3/);await page.screenshot({path:out+'/1366x768-learn.png'});checks.push('Three prediction/demo/build lessons; missing and wrong predictions, wrong and correct servings, independent completion count.');
 await page.locator('#free-play').click();assert.deepEqual(await values(),saved);
 await page.locator('#learn').click();await page.locator('#prediction').selectOption('6');await page.locator('#test-prediction').click();await page.locator('#free-play').click();await page.waitForTimeout(1600);assert.deepEqual(await values(),saved);checks.push('Free Play snapshot restored; leaving a moving demonstration cannot overwrite the next mode.');
 await page.locator('#challenge').click();await settle();await page.locator('#submit-order').click();assert.match(await page.locator('.activity-feedback').textContent(),/Not Yet/);assert.equal(await page.locator('#next-order').isDisabled(),true);await page.locator('#hint-order').click();assert.match(await page.locator('.activity-feedback').textContent(),/BOTH/);await select('A',2);assert.equal((await values())[0],'1/2');
 const answers=[2,2,6,6,14,3,1,3,16,0];
 for(let i=0;i<answers.length;i++){
  if(i===1){await page.locator('#learning-card [data-reference]').click();await page.keyboard.press('Escape');}
  if(i===2){await page.locator('#learn').click();await page.locator('#challenge').click();}
  await select('B',answers[i]);await page.locator('#submit-order').click();assert.match(await page.locator('.activity-feedback').textContent(),/Correct/);assert.equal(await page.locator('#submit-order').isDisabled(),true);assert.match(await page.locator('.activity-actions').textContent(),new RegExp((i+1)+'/10 filled'));
  if(i===0){await page.screenshot({path:out+'/1366x768-challenge.png'});await layout();await chapter('Wrong Answer, Hint And Correct Answer');}
  await page.locator('#next-order').click();await settle();
 }
 assert.match(await page.locator('#learning-card').textContent(),/7 first try without help/);assert.match(await page.locator('#learning-card').textContent(),/3 helped/);assert.match(await page.locator('#learning-card').textContent(),/1 retried/);await page.screenshot({path:out+'/orders-complete.png'});await chapter('Ten Orders With Honest Assistance Counts');checks.push('All 10 orders including zero and whole; wrong answers blocked, reference/lesson detours counted as assistance, no double scoring, 7 unassisted first tries / 3 helped / 1 retried.');
 await page.locator('#restart-orders').click();assert.match(await page.locator('#learning-card h2').textContent(),/Order 1 Of 10/);await select('B',1);await page.locator('#reset').click();assert.deepEqual(await values(),['1/2','0/4']);
 await page.locator('#learn').click();await page.locator('#prediction').selectOption('6');await page.locator('#test-prediction').click();await page.locator('#reset').click();await page.waitForTimeout(1600);assert.deepEqual(await values(),['3/8','0/16']);assert.equal(await page.locator('#prediction').inputValue(),'');checks.push('Round restart, mode-aware Reset and Reset during demonstration.');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const size of [{width:1280,height:720},{width:390,height:844}]){
  await page.setViewportSize(size);await page.locator('#challenge').click();await settle();await layout();await page.screenshot({path:out+`/${size.width}x${size.height}-challenge.png`});
  await page.locator('#learn').click();await settle();await layout();await page.screenshot({path:out+`/${size.width}x${size.height}-learn.png`});
 }
 await page.setViewportSize({width:1366,height:768});await page.locator('#free-play').click();await settle();await page.screenshot({path:out+'/1366x768-free.png'});
 if(process.env.RECORD_MODES==='1')await page.waitForTimeout(Math.max(1000,48000-(Date.now()-start)));
 assert.deepEqual(errors,[]);const video=page.video();await context.close();if(video)await video.saveAs(out+'/integrated-gameplay.webm');
 await copyFile(root+'/build.json',out+'/build.json');await copyFile(root+'/BUILD.md',out+'/BUILD.md');await writeFile(out+'/mode-results.json',JSON.stringify({build:manifest.id,browser:browser.version(),checks,chapters,errors,wallDurationSeconds:(Date.now()-start)/1000},null,2));console.log('MODE REVIEW PASSED',manifest.id);
}catch(e){await page.screenshot({path:out+'/failure.png'});throw e;}finally{await browser.close();server.close();}
