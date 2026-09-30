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
try{
 await page.goto(`http://127.0.0.1:${server.address().port}`);await settle();
 assert.equal(await page.locator('#build-identity').textContent(),manifest.id);
 assert.equal(await page.locator('.preview-note p').textContent(),'Select a piece to serve it and all earlier pieces');
 assert.deepEqual(await page.locator('.pie-label h2').allTextContents(),['Test Pie 1','Test Pie 2']);
 await page.locator('[data-flavor="A"]').selectOption('strawberry');await page.locator('[data-flavor="B"]').selectOption('apple');assert.deepEqual(await values(),['1/2','2/4']);
 await page.locator('[data-action="cut"][data-pair="A"]').click();await settle();assert.deepEqual(await values(),['2/4','2/4']);
 await page.locator('[data-action="regroup"][data-pair="A"]').click();await settle();assert.deepEqual(await values(),['1/2','2/4']);
 await page.locator('#drawer-toggle').click();await settle();
 const a=await page.locator('#bar-A').boundingBox(),b=await page.locator('#bar-B').boundingBox();assert.ok(Math.abs(a.x-b.x)<.1&&Math.abs(a.width-b.width)<.1);assert.ok(a.y+a.height<b.y);
 checks.push('Independent strawberry/apple selections retain exact amounts through Cut/Regroup; aligned equal-length parallel bars occupy separate near/far rows.');
 for(const size of [{width:1366,height:768},{width:1280,height:720},{width:390,height:844}]){await page.setViewportSize(size);await settle();await page.screenshot({path:out+`/${size.width}x${size.height}-flavors-bars.png`});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),size.width);}
 await page.setViewportSize({width:1366,height:768});await page.locator('#learn').click();await settle();assert.deepEqual(await page.locator('.pie-label h2').allTextContents(),['Example Pie','Your Pie']);
 await page.locator('#pie-B [data-piece="1"]').focus();assert.match(await page.locator('#pie-B [data-piece="1"]').textContent(),/^Your Pie/);
 await page.locator('#challenge').click();await settle();assert.equal(await page.locator('#pie-A').isVisible(),false);assert.equal(await page.locator('#label-A').isVisible(),false);assert.equal(await page.locator('#drawer-toggle').getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#drawer-toggle').isDisabled(),true);assert.equal(await page.locator('#title-B').textContent(),'Customer Pie');
 assert.match(await page.locator('.activity-head').textContent(),/1\/2.*4 equal pieces/);assert.match(await page.locator('.preview-note p').textContent(),/Check Order/);
 await page.mouse.move(370,280);await page.mouse.click(370,280);assert.equal(await page.locator('#piece-hint').isVisible(),false);assert.deepEqual(await values(),['1/2','0/4']);
 await page.screenshot({path:out+'/challenge-target.png'});checks.push('Mode names include keyboard controls; Challenge closes/locks drawer and hides reference rendering, labels, focus and picking while retaining its written target.');
 await page.locator('[data-reference]').last().click();assert.doesNotMatch(await page.locator('#fraction-reference').textContent(),/Learning Connection|PLTW|Curriculum Sources/);await page.keyboard.press('Escape');
 await page.locator('#free-play').click();assert.equal(await page.locator('.preview-note p').textContent(),'Select a piece to serve it and all earlier pieces');assert.equal(await page.locator('[data-flavor="A"]').inputValue(),'strawberry');assert.equal(await page.locator('[data-flavor="B"]').inputValue(),'apple');assert.equal(await page.locator('#pie-A').isVisible(),true);checks.push('Free Play restores both test pies and independent flavors; reference course section removed.');
 assert.deepEqual(errors,[]);await writeFile(out+'/presentation-results.json',JSON.stringify({build:manifest.id,checks,errors},null,2));console.log('PRESENTATION PASSED',manifest.id);
}catch(e){await page.screenshot({path:out+'/failure.png'});throw e;}finally{await browser.close();server.close();}
