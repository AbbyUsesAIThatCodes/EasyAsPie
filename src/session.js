import { CHALLENGES } from './exercises.js';
import { fraction, compare, label, explain, convert } from './fractions.js';

export const HELP_SOURCES = Object.freeze(['hint','reference','vocabulary','learn','free-play']);
export const createSession = (originBuild=null) => ({index:0,selected:0,attempts:0,assisted:false,solved:false,complete:false,results:[],history:[],feedback:'',originBuild});
export const currentTask = state => CHALLENGES[state.index];
export const selectSlices = (state,n) => state.solved||state.complete?state:{...state,selected:fraction(n,currentTask(state).to).n,feedback:''};
export function markAssisted(state,source='reference') {
 if(state.solved||state.complete)return state;
 if(!HELP_SOURCES.includes(source))throw Error('Unknown help source.');
 return {...state,assisted:true,history:[...state.history,{kind:'help',id:currentTask(state).id,source}]};
}
export function useHint(state) {
 if(state.solved||state.complete)return state;
 const task=currentTask(state),growing=task.to>task.from.d,factor=growing?task.to/task.from.d:task.from.d/task.to;
 return {...markAssisted(state,'hint'),feedback:`The denominator changes from ${task.from.d} to ${task.to}. ${growing?'Multiply':'Divide'} BOTH numbers by ${factor}. Keep the same amount of pie.`};
}
export function submit(state) {
 if(state.solved||state.complete)return state;
 const task=currentTask(state),answer=fraction(state.selected,task.to),difference=compare(answer,task.from),attempts=state.attempts+1;
 const history=[...state.history,{kind:'answer',id:task.id,n:answer.n,correct:difference===0}];
 if(difference!==0){
  const sameCount=answer.n===task.from.n?' The same number of slices is not the same amount when the slice sizes differ.':'';
  return {...state,attempts,history,feedback:`${label(answer)} is ${difference<0?'less':'more'} than ${label(task.from)} of the same-sized pie.${sameCount} Adjust your serving and try again.`};
 }
 const result={id:task.id,attempts,assisted:state.assisted,firstTry:attempts===1&&!state.assisted};
 return {...state,attempts,history,solved:true,results:[...state.results,result],feedback:`A perfect match! ${explain(task.from,answer)}`};
}
export function advance(state) {
 if(!state.solved||state.complete)return state;
 const history=[...state.history,{kind:'advance',id:currentTask(state).id}];
 if(state.index===CHALLENGES.length-1)return {...state,history,complete:true};
 return {...state,history,index:state.index+1,selected:0,attempts:0,assisted:false,solved:false,feedback:''};
}
export function answerFor(state){return convert(currentTask(state).from,currentTask(state).to);}

// Recompute assessment credit from ordered events; never trust saved score flags.
export function restoreSession(raw) {
 if(!raw||!Array.isArray(raw.history)||raw.history.length>10000)throw Error('Invalid order history.');
 if(raw.originBuild!==null&&(typeof raw.originBuild!=='string'||raw.originBuild.length>250))throw Error('Invalid starting build.');
 let state=createSession(raw.originBuild);
 for(const event of raw.history){
  if(!event||event.id!==currentTask(state).id||state.complete)throw Error('Order history is out of sequence.');
  if(event.kind==='answer'){
   if(state.solved)throw Error('Repeated solved response.');
   state=submit(selectSlices(state,event.n));
   if(state.solved!==event.correct)throw Error('Saved correctness disagrees with the response.');
  }else if(event.kind==='help'){
   if(state.solved)throw Error('Help recorded after completion.');
   state=event.source==='hint'?useHint(state):markAssisted(state,event.source);
  }else if(event.kind==='advance'){
   if(!state.solved)throw Error('Unsolved order cannot advance.');state=advance(state);
  }else throw Error('Unknown order event.');
 }
 for(const key of ['index','attempts','assisted','solved','complete'])if(raw[key]!==state[key])throw Error('Saved order state disagrees with history.');
 if(JSON.stringify(raw.results)!==JSON.stringify(state.results))throw Error('Saved results disagree with history.');
 fraction(raw.selected,currentTask(state).to);
 if(state.solved&&raw.selected!==state.selected)throw Error('Solved response was changed.');
 if(raw.feedback!==''&&raw.feedback!==state.feedback)throw Error('Saved feedback disagrees with history.');
 return {...state,selected:raw.selected,feedback:raw.feedback===''?'':state.feedback};
}
