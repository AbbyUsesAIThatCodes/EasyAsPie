import {CHALLENGES} from './exercises.js';

export const CONSTRUCTION_VERSION='beginner-24-v2';
export const DENOMINATORS=Object.freeze([2,4,8,16]);
const check=(ok,message)=>{if(!ok)throw Error(message);};
export const count=mask=>{let n=0;for(let m=mask;m;m>>>=1)n+=m&1;return n;};
export const full=d=>(1<<d)-1;
export function plate(d,mask=0){check(DENOMINATORS.includes(d)&&Number.isInteger(mask)&&mask>=0&&mask<=full(d),'Invalid equal-unit plate.');return {d,mask};}
export const occupied=(p,k)=>!!(p.mask&(1<<(k-1)));
export const amount=p=>count(p.mask)*(16/p.d);
export function beginStroke(p,k){check(Number.isInteger(k)&&k>=1&&k<=p.d,'Invalid piece.');return {d:p.d,operation:occupied(p,k)?'erase':'add',units:1<<(k-1),last:k};}
export function extendStroke(s,k){
 check(Number.isInteger(k)&&k>=1&&k<=s.d,'Invalid piece.');
 let delta=k-s.last;if(delta>s.d/2)delta-=s.d;if(delta< -s.d/2)delta+=s.d;
 let units=s.units;const direction=Math.sign(delta);
 for(let i=1;i<=Math.abs(delta);i++){const index=((s.last-1+direction*i)%s.d+s.d)%s.d;units|=1<<index;}
 return {...s,last:k,units};
}
export function applyStroke(p,s){check(p.d===s.d,'Stroke grid changed.');return plate(p.d,s.operation==='add'?p.mask|s.units:p.mask&~s.units);}
// Runs wrap across the origin; no seam is added inside a contiguous serving.
export function runs(p){
 if(!p.mask)return [];if(p.mask===full(p.d))return [{start:0,length:p.d}];
 const out=[];
 for(let i=0;i<p.d;i++)if(occupied(p,i+1)&&!occupied(p,((i-1+p.d)%p.d)+1)){
  let length=1;while(length<p.d&&occupied(p,((i+length)%p.d)+1))length++;
  out.push({start:i,length});
 }return out;
}
const task=(id,title,n,d,grid,extra={})=>{
 const whole=extra.whole||0;check(DENOMINATORS.includes(d)&&DENOMINATORS.includes(grid)&&Number.isInteger(n)&&n>=0&&n<=d,'Invalid task.');
 check((n*grid)%d===0,'Order is not representable.');check(whole===0||(whole===1&&n>0&&n<d),'Mixed orders need one whole and a proper fraction.');
 return Object.freeze({id,title,n,d,grid,whole,kind:'build',...extra});
};
export const LEARN_TASKS=Object.freeze([
 task('learn-whole','One Whole',2,2,2,{prompt:'This plate is one whole. Add both equal halves to make 1 whole.',goal:'A whole is all of its equal parts.'}),
 task('learn-half','Build Half A Pie',1,2,2,{prompt:'Make 1/2. Add one of the two equal parts.',goal:'The bottom number counts equal parts in one whole; the top counts selected parts.'}),
 task('learn-quarter','Build Three Quarters',3,4,4,{prompt:'Make 3/4. Add three of the four equal parts.',goal:'Three quarters leaves one quarter of the whole empty.'}),
 task('read-half','Read The Pie',1,2,4,{kind:'read',prompt:'Look at the purple amount. Choose its written fraction, then CUT PIES.',goal:'2/4 and 1/2 name the same amount.'}),
 task('read-eighths','Read Smaller Pieces',3,8,8,{kind:'read',prompt:'Look at the purple amount. Choose its written fraction, then CUT PIES.',goal:'Count the selected parts and all the equal parts in the whole.'}),
 task('learn-equivalence','Same Amount, Smaller Pieces',3,4,8,{prompt:'Build 3/4 with eighths. Make your attempt before using a hint.',goal:'Two eighths cover each quarter: 3/4 = 6/8.'}),
 task('learn-regroup','Same Amount, Larger Pieces',6,16,8,{prompt:'Build 6/16 with eighths. The whole stays the same size.',goal:'Two sixteenths cover one eighth: 6/16 = 3/8.'}),
 task('learn-mixed','One Whole And A Little More',1,4,4,{whole:1,prompt:'Make 1 whole and 1/4. Fill one plate completely, then add a quarter on the other.',goal:'A mixed number combines whole pies and a proper fraction of another equal whole.'})
]);
export const ORDER_TASKS=Object.freeze([
 ...CHALLENGES.map(t=>task(t.id,t.family,t.from.n,t.from.d,t.to)),
 task('mixed-1','One Whole And A Half',1,2,4,{whole:1}),
 task('mixed-2','One Whole And Three Quarters',3,4,8,{whole:1}),
 task('mixed-3','One Whole And Three Eighths',6,16,8,{whole:1}),
 task('mixed-4','One Whole And A Quarter',1,4,16,{whole:1})
]);
export const tasksFor=mode=>mode==='learn'?LEARN_TASKS:ORDER_TASKS;
export const orderLabel=t=>`${t.whole?'1 whole + ':''}${t.n}/${t.d}`;
export const expectedUnits=t=>16*t.whole+t.n*16/t.d;
export const blank=t=>[plate(t.grid),plate(t.grid)];
export function matches(t,plates,written=''){
 plates.forEach(p=>plate(p.d,p.mask));if(plates.some(p=>p.d!==t.grid))return false;
 if(t.kind==='read'){const m=/^(\d+)\/(2|4|8|16)$/.exec(written);return !!m&&Number(m[1])*t.d===t.n*Number(m[2])&&Number(m[1])<=Number(m[2]);}
 if(t.whole)return amount(plates[0])+amount(plates[1])===expectedUnits(t)&&plates.some(p=>p.mask===full(p.d));
 return plates[1].mask===0&&amount(plates[0])===expectedUnits(t);
}
export function createWork(mode,originBuild,index=0){return {mode,index,plates:blank(tasksFor(mode)[index]),written:'',solved:false,complete:false,history:[],originBuild};}
export const HELP=Object.freeze(['hint','reference','vocabulary','learn','free-play']);
export function help(work,source){check(HELP.includes(source),'Unknown help.');if(work.solved||work.complete)return work;return {...work,history:[...work.history,{kind:'help',id:tasksFor(work.mode)[work.index].id,source}]};}
export function commit(work){
 if(work.solved||work.complete)return work;const t=tasksFor(work.mode)[work.index],correct=matches(t,work.plates,work.written);
 const event={kind:'answer',id:t.id,plates:work.plates.map(p=>({...p})),written:work.written,correct};
 return {...work,solved:correct,history:[...work.history,event]};
}
export function nextWork(work){
 if(!work.solved||work.complete)return work;const tasks=tasksFor(work.mode),t=tasks[work.index],history=[...work.history,{kind:'advance',id:t.id}];
 if(work.index===tasks.length-1)return {...work,history,complete:true};
 return {...work,index:work.index+1,plates:blank(tasks[work.index+1]),written:'',solved:false,history};
}
export function validateWork(raw){
 check(raw&&['learn','challenge'].includes(raw.mode)&&Array.isArray(raw.history)&&raw.history.length<=20000,'Invalid activity history.');
 check(typeof raw.originBuild==='string'&&raw.originBuild.length<250,'Invalid session build.');
 let result=createWork(raw.mode,raw.originBuild);
 for(const e of raw.history){
  check(e&&e.id===tasksFor(raw.mode)[result.index].id&&!result.complete,'Activity history is out of order.');
  if(e.kind==='help'){check(!result.solved,'Help after solved task.');result=help(result,e.source);}
  else if(e.kind==='answer'){
   check(!result.solved&&Array.isArray(e.plates)&&e.plates.length===2&&typeof e.written==='string'&&e.written.length<16,'Invalid committed response.');
   e.plates.forEach(p=>plate(p.d,p.mask));const t=tasksFor(raw.mode)[result.index];check(e.plates.every(p=>p.d===t.grid)&& (t.whole||e.plates[1].mask===0),'Response uses an inactive plate or grid.');
   result=commit({...result,plates:e.plates.map(p=>({...p})),written:e.written});check(result.solved===e.correct,'Saved correctness disagrees with response.');
  }else if(e.kind==='advance'){check(result.solved,'Unsolved task cannot advance.');result=nextWork(result);}else throw Error('Unknown activity event.');
 }
 for(const k of ['index','solved','complete'])check(raw[k]===result[k],'Saved activity disagrees with history.');
 check(Array.isArray(raw.plates)&&raw.plates.length===2&&typeof raw.written==='string'&&raw.written.length<16,'Invalid current response.');
 const t=tasksFor(raw.mode)[result.index];raw.plates.forEach(p=>plate(p.d,p.mask));check(raw.plates.every(p=>p.d===t.grid)&&(t.whole||raw.plates[1].mask===0),'Invalid active grid.');
 if(result.solved)check(JSON.stringify(raw.plates)===JSON.stringify(result.plates)&&raw.written===result.written,'Solved response changed.');
 return {...result,plates:raw.plates.map(p=>({...p})),written:raw.written};
}
export function evidence(work){return tasksFor(work.mode).map(t=>{
 const events=work.history.filter(e=>e.id===t.id),answers=events.filter(e=>e.kind==='answer'),helps=events.filter(e=>e.kind==='help');
 return {id:t.id,target:orderLabel(t),grid:t.grid,kind:t.kind,responses:answers.map(e=>({plates:e.plates,amounts:e.plates.map(p=>`${count(p.mask)}/${p.d}`),written:e.written,correct:e.correct})),help:helps.map(e=>e.source),attempts:answers.length,retries:Math.max(0,answers.length-1),complete:answers.some(e=>e.correct),firstWithoutHelp:answers[0]?.correct===true&&!helps.length};
});}
