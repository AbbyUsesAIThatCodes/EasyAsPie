import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve('dist'),out=resolve(process.env.REVIEW_OUTPUT||'../evidence/step12');await mkdir(out,{recursive:true});
const manifest=JSON.parse(await readFile(root+'/build.json','utf8'));
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;if(p==='/favicon.ico'){res.writeHead(204).end();return;}const f=resolve(root,'.'+(p==='/'?'/index.html':p));if(relative(root,f).startsWith('..'))throw Error();res.setHeader('Content-Type',{'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json'}[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}`, browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[],checks=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const settle=()=>page.waitForFunction(()=>document.querySelector('#app').getAttribute('aria-busy')!=='true'&&document.querySelector('#scene')?.dataset.moving==='false');
const value=pair=>page.locator('#label-'+pair+' .fraction').textContent();
const click=async(pair,type)=>{await page.locator(`[data-action="${type}"][data-pair="${pair}"]`).click();await settle();};
const select=async(pair,n)=>{if(n===0)await click(pair,'clear');else {await page.locator(`#pie-${pair} [data-piece="${n}"]`).focus();await page.keyboard.press('Enter');}};
await page.addInitScript(()=>localStorage.removeItem('easyaspie.progress.v1'));
try{
 await page.goto(url);await settle();assert.equal(await page.locator('#build-identity').textContent(),manifest.id);
 await page.locator('#drawer-toggle').click();await settle();
 await page.locator('[data-action="cut"][data-pair="A"]').click();
 await page.waitForTimeout(620);await page.screenshot({path:out+'/physical-cut.png'});
 await page.locator('[data-action="cut"][data-pair="B"]').click();await settle();
 assert.equal(await value('A'),'2/4');assert.equal(await value('B'),'2/4');
 await click('A','cut');await click('A','cut');assert.equal(await value('A'),'8/16');
 await click('A','cut');assert.match(await page.locator('#action-feedback').textContent(),/Sixteenths/);
 await select('A',12);await click('A','regroup');assert.equal(await value('A'),'6/8');await click('A','regroup');assert.equal(await value('A'),'3/4');
 await page.screenshot({path:out+'/regrouped.png'});
 checks.push('Animated 1/2 → 2/4 → 4/8 → 8/16; 12/16 → 6/8 → 3/4; partner preserved during rapid actions.');
 await page.locator('[data-action="cut"][data-pair="A"]').click();await page.locator('#reset').click();await settle();await page.waitForTimeout(1600);
 assert.deepEqual(await page.locator('.fraction').allTextContents(),['1/2','2/4']);checks.push('Reset cancels motion without a late stale-state write.');
 // Regression: a hover/focus above the target denominator must not survive regroup.
 await page.goto(url+'/?preview=sixteenths');await settle();
 await page.locator('#view').click();await settle();
 const sceneRect=await page.locator('#scene').boundingBox(),scale=sceneRect.width/Math.max(12,sceneRect.width/sceneRect.height*8.5),a=Math.PI+15.5*Math.PI*2/16;
 const oldPiece16={x:sceneRect.x+sceneRect.width/2+(2.55+Math.sin(a)*1.14)*scale,y:sceneRect.y+sceneRect.height/2+(-.65+Math.cos(a)*1.14-.4)*scale};
 await page.mouse.move(oldPiece16.x,oldPiece16.y);assert.match(await page.locator('#piece-hint').textContent(),/Piece 16 of 16/);
 await page.locator('[data-action="regroup"][data-pair="B"]').click();
 await page.mouse.move(oldPiece16.x,oldPiece16.y);
 assert.equal(await page.locator('#piece-hint').isVisible(),false);
 await settle();assert.equal(await value('B'),'4/8');
 assert.equal(await page.locator('#piece-hint').isVisible(),false);
 assert.equal(await page.locator('[data-piece].emphasized').count(),0);
 await page.goto(url+'/?preview=sixteenths');await settle();
 await page.locator('[data-action="regroup"][data-pair="B"]').click();
 await page.locator('#pie-B [data-piece="16"]').focus();await page.keyboard.press('Enter');
 await settle();assert.equal(await value('B'),'4/8');
 assert.equal(await page.locator('#pie-B [data-piece="8"]').evaluate(e=>e===document.activeElement),true);
 assert.ok(!(await page.locator('#piece-hint').textContent()).includes('16 of 8'));
 assert.equal(await page.locator('#pie-B [data-piece="8"]').evaluate(e=>e.classList.contains('emphasized')),true);
 checks.push('Regroup 8/16 → 4/8 clears stationary old-piece-16 pointer hover and clamps old-piece-16 keyboard focus to piece 8; activation during motion does not change the amount.');
 await page.emulateMedia({reducedMotion:'reduce'});
 let transformations=0, refusals=0;
 for(const [fixture,d]of[['halves',2],['quarters',4],['eighths',8],['sixteenths',16]])for(const pair of ['A','B']){
  await page.goto(url+'/?preview='+fixture);await settle();const partner=pair==='A'?'B':'A',other=await value(partner);
  for(let n=0;n<=d;n++){
   await select(pair,n);assert.equal(await value(pair),`${n}/${d}`);
   await click(pair,'cut');
   if(d<16){assert.equal(await value(pair),`${n*2}/${d*2}`);await click(pair,'regroup');transformations+=2;}else{assert.equal(await value(pair),`${n}/${d}`);refusals++;}
   await click(pair,'regroup');
   if(d>2&&n%2===0){assert.equal(await value(pair),`${n/2}/${d/2}`);await click(pair,'cut');transformations+=2;}else{assert.equal(await value(pair),`${n}/${d}`);refusals++;}
   assert.equal(await value(partner),other);
   assert.equal(await page.locator('#pie-'+pair+' button').count(),d);assert.equal(await page.locator('#bar-'+pair+' button').count(),d);
  }
 }
 checks.push(`${transformations} accepted transformations and ${refusals} refusals across all 34 states in both pairs, with immediate reduced motion.`);
 await page.goto(url+'/?preview=sixteenths');await settle();await click('A','regroup');assert.equal(await value('A'),'3/16');assert.match(await page.locator('#action-feedback').textContent(),/even/);
 await page.locator('#drawer-toggle').click();await settle();await page.locator('#bar-B button').last().focus();await page.keyboard.press('Enter');await click('B','regroup');
 assert.equal(await value('B'),'8/8');assert.equal(await page.locator('#bar-B button').count(),8);
 await page.locator('#bar-B button').last().focus();await page.keyboard.press('Escape');await settle();assert.equal(await page.locator('#drawer-toggle').evaluate(e=>e===document.activeElement),true);
 for(const size of [{width:1280,height:720},{width:390,height:844}]){await page.setViewportSize(size);await page.locator('#reset').click();await settle();await page.screenshot({path:out+`/${size.width}x${size.height}.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
 assert.deepEqual(errors,[]);await writeFile(out+'/transform-results.json',JSON.stringify({build:manifest.id,browser:browser.version(),checks,transformations,refusals,errors},null,2));console.log('TRANSFORM REVIEW PASSED',manifest.id);
}catch(e){await page.screenshot({path:out+'/failure.png'});throw e;}finally{await browser.close();server.close();}
