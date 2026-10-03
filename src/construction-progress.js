import {CONSTRUCTION_VERSION,validateWork,evidence} from './construction.js';
import {createFreePlay} from './free-play.js';
export const STORAGE_KEY='easyaspie.construction.v2';
const check=(ok,message)=>{if(!ok)throw Error(message);};
export function validateSnapshot(raw){
 check(raw&&['free','learn','challenge'].includes(raw.mode),'Unknown mode.');
 check(raw.free?.A&&raw.free?.B,'Missing Free Play snapshot.');
 const free=createFreePlay(raw.free);check(raw.flavors&&['A','B'].every(p=>['blueberry','cherry','strawberry','apple'].includes(raw.flavors[p])),'Invalid flavors.');
 const learn=validateWork(raw.learn),challenge=validateWork(raw.challenge);check(learn.mode==='learn'&&challenge.mode==='challenge','Mode history mismatch.');
 check(typeof raw.challengeStarted==='boolean'&&typeof raw.drawerOpen==='boolean','Invalid recovery state.');
 check(Array.isArray(raw.archives)&&raw.archives.length<=100,'Invalid round archive.');
 return {mode:raw.mode,free,flavors:{...raw.flavors},learn,challenge,challengeStarted:raw.challengeStarted,drawerOpen:raw.drawerOpen,archives:raw.archives.map(validateWork)};
}
export function encode(snapshot,identity){return JSON.stringify({schema:2,taskset:CONSTRUCTION_VERSION,savedAt:new Date().toISOString(),build:identity,state:validateSnapshot(snapshot)});}
export function decode(text){
 check(typeof text==='string'&&text.length<4_000_000,'Save missing or too large.');const raw=JSON.parse(text);
 check(raw?.schema===2&&raw.taskset===CONSTRUCTION_VERSION,'Different activity version.');
 check(raw.build&&typeof raw.build.id==='string'&&raw.build.id.length<250&&typeof raw.build.sha==='string'&&/^[a-f0-9]{40}$/.test(raw.build.sha),'Invalid saved build.');
 check(Number.isFinite(Date.parse(raw.savedAt)),'Invalid saved time.');return {...raw,state:validateSnapshot(raw.state)};
}
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function report(snapshot,identity){
 const state=validateSnapshot(snapshot),sessions=[...state.archives,state.learn,state.challenge].map(w=>({mode:w.mode,originBuild:w.originBuild,complete:w.complete,rows:evidence(w)}));
 const metadata={activity:'EasyAsPie Beginner Construction',taskset:CONSTRUCTION_VERSION,exportedAt:new Date().toISOString(),build:identity,sessions};
 const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EasyAsPie Activity Report</title><style>body{font-family:'Comic Sans MS',cursive;background:#fff9ed;color:#382540;max-width:1200px;margin:2rem auto;padding:0 1rem}table{width:100%;border-collapse:collapse;font-size:14px}td,th{border:1px solid #b4a17e;padding:8px;text-align:left}th{background:#e0eddf}code{overflow-wrap:anywhere}tr{break-inside:avoid}</style><h1>EasyAsPie Activity Report</h1><p>Anonymous practice evidence, saved only in this browser. No information was sent to a server. Completion does not establish unaided performance or measurement mastery.</p><p>First responses, retries and typed help are retained. Twenty original equivalence orders precede four teacher-local mixed-number extensions. Learn includes written-to-visual and visual-to-written work. Bars mirror the learner's own construction and do not reveal the requested answer.</p><h2>Build And Source</h2><p><code>${esc(identity.id)}</code><br>Source: <code>${esc(identity.sha)}</code> (${identity.dirty?'dirty':'clean'})<br>Built: ${esc(identity.builtAt)}</p>${sessions.map((s,i)=>`<h2>${s.mode==='learn'?'Learn':'Challenge'} Session ${i+1}</h2><p>Started in <code>${esc(s.originBuild)}</code>. ${s.rows.filter(r=>r.complete).length}/${s.rows.length} completed; ${s.rows.filter(r=>r.firstWithoutHelp).length} first answers correct without recorded help; ${s.rows.filter(r=>r.help.length).length} helped; ${s.rows.filter(r=>r.retries).length} retried.</p><table><thead><tr><th>Task / Target</th><th>Equal Parts</th><th>Committed Responses</th><th>Retries / Help</th><th>Result</th></tr></thead><tbody>${s.rows.map(r=>`<tr><td>${esc(r.id)}<br>${esc(r.target)}</td><td>${r.grid}</td><td>${r.responses.map(a=>`${esc(r.kind==='read'?a.written:a.amounts.join(' + '))} — ${a.correct?'Correct':'Not Yet'}<br><small>Exact occupied masks: ${a.plates.map(p=>p.mask).join(', ')}</small>`).join('<br>')||'No submission'}</td><td>${r.retries} retries<br>${r.help.map(esc).join(', ')||'No recorded help'}</td><td>${r.complete?'Completed':'Incomplete'}${r.firstWithoutHelp?'; first answer, no recorded help':''}</td></tr>`).join('')}</tbody></table>`).join('')}<script type="application/json" id="activity-data">${JSON.stringify(metadata).replace(/</g,'\\u003c')}</script></html>`;
 return {html,metadata};
}
