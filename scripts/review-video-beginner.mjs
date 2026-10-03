import {mkdir,writeFile} from 'node:fs/promises';
import {LEARN_TASKS} from '../src/construction.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.env.REVIEW_OUTPUT||'docs/review/issue-31/build007/video';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});const ctx=await browser.newContext({viewport:{width:1366,height:768},recordVideo:{dir:out+'/raw',size:{width:1366,height:768}}}),page=await ctx.newPage();
const chapters=[],errors=[],requests=[],start=Date.now();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
const pause=ms=>page.waitForTimeout(ms),settle=()=>page.waitForFunction(()=>document.querySelector('#app')?.getAttribute('aria-busy')!=='true'&&document.querySelector('#scene')?.dataset.moving==='false');
const chapter=async title=>{chapters.push({second:(Date.now()-start)/1000,title});await pause(700);};
const unit=async(side,k)=>{const p=await page.evaluate(([s,k])=>window.__review.point(s,k),[side,k]);await page.mouse.click(p.x,p.y);};
try{
 await page.goto((process.env.REVIEW_URL||'http://127.0.0.1:4201/')+'?review=beginner');await settle();const build=await page.locator('#build-identity').textContent();
 await chapter('Blank Plate And Beginner Language');await pause(1000);await page.locator('#submit-order').click();await pause(1200);
 const a=await page.evaluate(()=>window.__review.point(0,1)),b=await page.evaluate(()=>window.__review.point(0,2));await page.mouse.move(a.x,a.y);await page.mouse.down();await pause(500);await page.mouse.move(b.x,b.y,{steps:20});await pause(500);await page.mouse.up();await pause(600);await chapter('Explicit Cut Pies And Whole-Pie Serving');await page.locator('#scene-knife').click();await settle();await pause(500);await page.locator('#next-order').click();
 await page.emulateMedia({reducedMotion:'reduce'});
 for(let i=1;i<7;i++){const t=LEARN_TASKS[i];if(t.kind==='read')await page.locator('#written-answer').selectOption(`${t.n}/${t.d}`);else for(let k=1;k<=t.n*t.grid/t.d;k++)await unit(0,k);await page.locator('#submit-order').click();await settle();await page.locator('#next-order').click();}
 await page.emulateMedia({reducedMotion:'no-preference'});await chapter('One Whole Plus A Fraction');for(let k=1;k<=4;k++){await unit(0,k);await pause(130);}await unit(1,1);await pause(700);await page.screenshot({path:out+'/mixed-built.png'});await page.locator('#submit-order').click();await settle();await pause(400);
 await page.locator('#challenge').click();await chapter('Equivalent Quantity With Different Parts');await unit(0,1);await unit(0,2);await pause(600);
 const c=await page.evaluate(()=>window.__review.point(0,2)),d=await page.evaluate(()=>window.__review.point(0,3));await page.mouse.move(c.x,c.y);await page.mouse.down();await page.mouse.move(d.x,d.y,{steps:10});await pause(700);await page.mouse.up();await pause(500);await unit(0,2);await page.locator('#submit-order').click();await settle();
 await page.locator('#free-play').click();await chapter('Counter Bars, Free Play And Openable Drawer');await page.locator('#drawer-toggle').click();await settle();await page.locator('[data-action="cut"][data-pair="A"]').click();await settle();await page.locator('[data-flavor="A"]').selectOption('strawberry');
 for(let i=0;i<4;i++){await page.locator('#orbit-left').click();await pause(200);}await pause(800);for(let i=0;i<8;i++){await page.locator('#orbit-right').click();await pause(150);}await pause(800);await page.locator('#reset-view').click();await settle();await page.locator('#drawer-toggle').click();await settle();
 await chapter('Framed Reference With Fixed Close Control');await page.locator('[data-reference]').click();await page.locator('.reference-content').evaluate(e=>e.scrollTo({top:e.scrollHeight,behavior:'smooth'}));await pause(1400);await page.locator('#close-reference').click();await page.locator('#learn').click();await pause(1000);
 const video=page.video();await ctx.close();await video.saveAs(out+'/beginner-gameplay.webm');await writeFile(out+'/video.json',JSON.stringify({build,chapters,errors,durationSeconds:(Date.now()-start)/1000,externalRequests:requests.filter(u=>!/^http:\/\/127\.0\.0\.1:|^data:|^blob:/.test(u))},null,2));console.log('RECORDED',build,chapters,errors);
}finally{await browser.close();}
