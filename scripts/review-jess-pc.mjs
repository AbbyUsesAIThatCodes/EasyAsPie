// Production screenshots and unedited browser video. No generated imagery.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve('dist'), output=resolve(process.env.REVIEW_OUTPUT||'docs/review/issue-18/jess-pc');
const build=JSON.parse(await readFile(resolve(root,'build.json'),'utf8'));
await mkdir(output,{recursive:true});
const server=createServer(async(req,res)=>{try{const name=new URL(req.url,'http://localhost').pathname;if(name==='/favicon.ico'){res.writeHead(204).end();return;}const file=resolve(root,'.'+(name==='/'?'/index.html':name));if(relative(root,file).startsWith('..'))throw Error();res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const messages=[], chapters=[];
const settle=p=>p.waitForFunction(()=>document.querySelector('#scene')?.dataset.moving==='false');
const monitor=p=>{p.on('pageerror',e=>messages.push(e.message));p.on('console',m=>{if(m.type()==='error')messages.push(m.text());});};
try{
 const p=await browser.newPage({viewport:{width:1366,height:768}});monitor(p);
 for(const [width,height] of [[1366,768],[1280,720]]){
  await p.setViewportSize({width,height});
  for(const fixture of ['normal','sixteenths']){
   await p.goto(url+(fixture==='normal'?'':'/?preview=sixteenths'));await settle(p);
   assert.equal(await p.locator('#build-identity').textContent(),build.id);
   await p.screenshot({path:resolve(output,`${width}x${height}-${fixture}-closed.png`)});
   await p.locator('#drawer-toggle').click();await settle(p);
   await p.screenshot({path:resolve(output,`${width}x${height}-${fixture}-open.png`)});
  }
 }
 await p.goto(url+'/?preview=quarters&review=solids');await settle(p);
 await p.screenshot({path:resolve(output,'cut-face-inspection.png')});
 await p.goto(url);await settle(p);
 await p.locator('#pie-A button').first().focus();
 await p.screenshot({path:resolve(output,'keyboard-focus.png')});
 await p.setViewportSize({width:390,height:844});await p.locator('#drawer-toggle').click();await settle(p);
 await p.screenshot({path:resolve(output,'390x844-open.png')});
 const mobile=await p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,labels:[...document.querySelectorAll('.pie-label')].map(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom})),bars:[...document.querySelectorAll('.bar-pair')].map(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom}))}));
 assert.equal(mobile.scroll,mobile.width);assert.ok(mobile.labels.every(e=>e.bottom<mobile.bars[0].top));
 const context=await browser.newContext({viewport:{width:1366,height:768},recordVideo:{dir:resolve(output,'recording'),size:{width:1366,height:768}}});
 const page=await context.newPage();monitor(page);const start=Date.now();
 const chapter=async name=>{chapters.push({second:(Date.now()-start)/1000,name});await page.waitForTimeout(1000);};
 await page.goto(url);await settle(page);await chapter('Default Scene And Full Build Identity');await page.waitForTimeout(3000);
 await page.locator('#drawer-toggle').click();await settle(page);await chapter('Physical Drawer And Matching Bars');
 await page.locator('#bar-B [data-piece="3"]').click();await chapter('Bar To Pie Selection');
 await page.locator('#pie-A button').first().focus();await page.keyboard.press('End');await page.keyboard.press('Enter');await chapter('Keyboard Pie To Bar Selection');
 await page.locator('#view').click();await settle(page);await chapter('Top View');
 const r=await page.locator('#scene').boundingBox(), scale=r.width/Math.max(12,r.width/r.height*7.4);
 await page.mouse.click(r.x+r.width/2+(-2.55-1.14)*scale,r.y+r.height/2+(-.65-.4)*scale);
 assert.equal(await page.locator('#label-A .fraction').textContent(),'1/2');await chapter('Direct Pie Pointer Selection');
 await page.locator('#view').click();await settle(page);await chapter('Angled View');
 await page.locator('#orbit-right').click();await page.locator('#orbit-right').click();await chapter('Camera Orbit With Projected Bar Controls');
 await page.locator('#bar-A [data-piece="2"]').click();assert.equal(await page.locator('#label-A .fraction').textContent(),'2/2');
 await page.locator('#drawer-toggle').click();await settle(page);await chapter('Closing Drawer And Live Shadows');
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#drawer-toggle').click();await settle(page);await chapter('Reduced Motion Immediate Drawer');
 await page.waitForTimeout(Math.max(1000,36000-(Date.now()-start)));
 const video=page.video();await context.close();await video.saveAs(resolve(output,'bakery-review.webm'));
 const gpu=await p.locator('#scene').evaluate(c=>{const gl=c.getContext('webgl2'),e=gl.getExtension('WEBGL_debug_renderer_info');return {renderer:e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),error:gl.getError()};});
 assert.deepEqual(messages,[]);assert.equal(gpu.error,0);
 await writeFile(resolve(output,'media-results.json'),JSON.stringify({build:build.id,browser:browser.version(),gpu,chapters,mobile,messages,wallDurationSeconds:(Date.now()-start)/1000},null,2));
 await copyFile(resolve(root,'build.json'),resolve(output,'build.json'));await copyFile(resolve(root,'BUILD.md'),resolve(output,'BUILD.md'));
 console.log(`MEDIA VERIFIED ${build.id}`);
}finally{await browser.close();server.close();}
