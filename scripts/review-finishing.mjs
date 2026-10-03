import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createServer} from 'node:http';
import {resolve,relative,extname} from 'node:path';
import {createWork,commit,nextWork,tasksFor,plate,full} from '../src/construction.js';
import {createFreePlay} from '../src/free-play.js';
import {encode} from '../src/construction-progress.js';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=resolve('dist'),out=resolve(process.env.REVIEW_OUTPUT||'../finishing-evidence/targeted');await mkdir(out,{recursive:true});
const identity=JSON.parse(await readFile(root+'/build.json','utf8'));
const server=createServer(async(req,res)=>{try{const p=new URL(req.url,'http://localhost').pathname;if(p==='/favicon.ico'){res.writeHead(204).end();return;}const f=resolve(root,'.'+(p==='/'?'/index.html':p));if(relative(root,f).startsWith('..'))throw Error();res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'}[extname(f)]||'application/octet-stream');res.end(await readFile(f));}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}/?review=finishing`,browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH});
const ctx=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'}),page=await ctx.newPage(),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.stack));
const settle=()=>page.waitForFunction(()=>document.querySelector('#app')?.getAttribute('aria-busy')!=='true'&&document.querySelector('#scene')?.dataset.moving==='false');
const current=()=>page.evaluate(()=>{const s=window.__review.snapshot();return s[s.mode];});
const geometry=()=>page.evaluate(()=>window.__review.geometry());
const stroke=()=>page.evaluate(()=>window.__review.stroke());
const point=k=>page.evaluate(k=>window.__review.point(0,k),k);
const move=async k=>{const p=await point(k);await page.mouse.move(p.x,p.y);};
const arc=async(from,to)=>{const steps=Math.ceil(Math.abs(to-from)*8);for(let i=1;i<=steps;i++)await move(from+(to-from)*i/steps);};
const click=async(side,k)=>{const p=await page.evaluate(([s,k])=>window.__review.point(s,k),[side,k]);await page.mouse.click(p.x,p.y);};
const shot=name=>page.screenshot({path:out+'/'+name+'.png',fullPage:true});
function fixture(mode,index,mask=0){let w=createWork(mode,identity.id);while(w.index<index){const t=tasksFor(mode)[w.index],n=t.n*t.grid/t.d;w=nextWork(commit({...w,plates:[plate(t.grid,t.whole?full(t.grid):full(n)),plate(t.grid,t.whole?full(n):0)],written:t.kind==='read'?`${t.n}/${t.d}`:''}));}w.plates[0]=plate(tasksFor(mode)[index].grid,mask);return encode({mode,free:createFreePlay(),flavors:{A:'blueberry',B:'blueberry'},learn:mode==='learn'?w:createWork('learn',identity.id),challenge:mode==='challenge'?w:createWork('challenge',identity.id),archives:[],challengeStarted:mode==='challenge',drawerOpen:false},identity);}
async function load(mode,index,mask=0){await page.goto(url);await page.evaluate(v=>localStorage.setItem('easyaspie.construction.v2',v),fixture(mode,index,mask));await page.reload();await settle();}
try{
 for(const mode of ['learn','challenge']){
  const index=tasksFor(mode).findIndex(t=>t.grid===8&&t.kind==='build');
  for(const operation of ['add','erase']){
   const initial=operation==='add'?1:65;await load(mode,index,initial);await move(7);await page.mouse.down();await arc(7,10);assert.equal((await stroke()).operation,operation);assert.equal((await stroke()).units,195);await arc(10,8);assert.equal((await stroke()).units,192);assert.equal((await current()).plates[0].mask,initial);await shot(`${mode}-${operation}-backtrack`);await page.mouse.up();assert.equal((await current()).plates[0].mask,operation==='add'?193:1);
  }
  await load(mode,index);await move(1);await page.mouse.down();await arc(1,3);await arc(3,0);assert.equal((await stroke()).units,129,'crossing start reverses arc');await page.mouse.up();assert.equal((await current()).plates[0].mask,129);
  await load(mode,index);await move(1);await page.mouse.down();await arc(1,9);assert.equal((await stroke()).units,255);await arc(9,2);assert.equal((await stroke()).units,3,'retracing a full circle shrinks');await page.keyboard.press('Escape');await page.mouse.up();assert.equal((await current()).plates[0].mask,0);
  await move(7);await page.mouse.down();await arc(7,8);const rect=await page.locator('#scene').boundingBox();await page.mouse.move(rect.x+5,rect.y+rect.height/2);await move(3);assert.equal((await stroke()).units,192,'outside re-entry cannot bridge');await move(8);await arc(8,7);assert.equal((await stroke()).units,64);await page.mouse.up();assert.equal((await current()).plates[0].mask,64);
 }
 checks.push('Actual Learn and Challenge pointer ADD/ERASE spans shrink on backtracking, wrap in either direction, reverse across start, shrink after a full circle, cancel, and do not bridge outside re-entry.');
 const gridIndex=tasksFor('challenge').findIndex(t=>t.grid===8&&t.n>0&&t.n<t.d);await load('challenge',gridIndex);
 await move(3);let g=await geometry();assert.equal(g.hover.k,3);assert.equal(g.hover.outlineHeight,.19);await shot('empty-hover');await click(0,3);await move(3);g=await geometry();assert.equal(g.hover.k,3);assert.equal(g.hover.outlineHeight,1.02);await shot('occupied-hover');
 checks.push('Actual empty and occupied hover hit the requested unit, with outlines at plate height 0.19 and occupied pie height 1.02.');
 await load('challenge',0);await page.emulateMedia({reducedMotion:'no-preference'});for(let i=0;i<20;i++){await click(0,1);assert.equal((await current()).plates[0].mask,i%2?0:1,'rapid repeated click during growth');}await page.emulateMedia({reducedMotion:'reduce'});checks.push('Twenty immediate repeated pointer clicks remain exact during grow/shrink animations.');
 for(const mode of ['learn','challenge'])for(const mixedNext of [false,true]){
  const tasks=tasksFor(mode),index=mixedNext?tasks.findIndex(t=>t.whole)-1:0;await load(mode,index);const t=tasks[index],n=t.n*t.grid/t.d;
  if(t.kind==='read')await page.locator('#written-answer').selectOption(`${t.n}/${t.d}`);else for(let k=1;k<=n;k++)await click(0,k);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.evaluate(()=>{window.reviewFrames=[];window.reviewWatching=true;const tick=()=>{if(!window.reviewWatching)return;const s=window.__review.snapshot(),w=s[s.mode];window.reviewFrames.push({index:w.index,...window.__review.geometry()});requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  await page.locator('#submit-order').click();await page.waitForFunction(()=>window.__review.geometry().serving?.progress>.35);await shot(`${mode}-${mixedNext?'two':'one'}-arriving`);await settle();
  const frames=await page.evaluate(()=>{window.reviewWatching=false;return window.reviewFrames;});assert.ok(frames.every(f=>!f.collisions.length),JSON.stringify(frames.filter(f=>f.collisions.length).slice(0,2)));
  const incoming=frames.filter(f=>f.serving?.plates.length);assert.ok(incoming.length>2);assert.ok(incoming.every(f=>f.serving.nextCount===(mixedNext?2:1)&&f.serving.plates.length===(mixedNext?2:1)));
  assert.ok(incoming.at(-1).serving.progress>.95);assert.equal((await current()).index,index+1);assert.equal((await current()).history.filter(e=>e.kind==='advance'&&e.id===t.id).length,1);assert.equal((await geometry()).plates.filter(p=>p.visible).length,mixedNext?2:1);
  for(const f of frames)for(const k of f.knives){const hr=Math.hypot(k.handle[0]-k.center[0],k.handle[2]-k.center[2]),br=Math.hypot(k.blade[0]-k.center[0],k.blade[2]-k.center[2]);assert.ok(hr>1.94&&br>0&&br<1.64);}
  await shot(`${mode}-${mixedNext?'mixed':'single'}-next-prompt`);await page.reload();await settle();assert.equal((await current()).index,index+1);assert.equal((await current()).history.filter(e=>e.kind==='advance'&&e.id===t.id).length,1);await page.emulateMedia({reducedMotion:'reduce'});
 }
 checks.push('Frame-sampled one/two-plate cabinet arrivals have no cabinet/counter/door collisions; next task activates once at landing, survives reload, and shows its correct plate count. Serving handles remain outward.');
 assert.deepEqual(errors,[]);await writeFile(out+'/results.json',JSON.stringify({build:identity.id,checks,errors,browser:browser.version()},null,2));console.log('FINISHING MECHANICS PASSED',identity.id,checks);
}catch(e){await shot('failure');await writeFile(out+'/failure.json',JSON.stringify({message:e.message,stack:e.stack,errors,current:await current().catch(()=>null),stroke:await stroke().catch(()=>null),geometry:await geometry().catch(()=>null)},null,2));throw e;}finally{await browser.close();server.close();}
