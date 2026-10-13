import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
class Element {
  constructor(){this.handlers={};this.children=[];this.textContent='';this.value='';this.hidden=false;this.disabled=false;}
  addEventListener(type,handler){this.handlers[type]=handler;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  get childElementCount(){return this.children.length;}
  focus(){}
  closest(){return null;}
}
const elements=Object.fromEntries(['form','status','results','more','article','submit'].map(key=>[key,new Element()]));
elements.form.elements=Object.fromEntries(['q','mode','letter','georsltr_locale'].map(key=>[key,new Element()]));
elements.form.elements.mode.value='word';elements.form.elements.georsltr_locale.value='ru_RU';
elements.form.querySelector=()=>elements.submit;
const root=new Element();root.querySelector=selector=>elements[{'[data-georsltr-search]':'form','[data-georsltr-dictionary-status]':'status','[data-georsltr-results]':'results','[data-georsltr-more]':'more','[data-georsltr-article]':'article'}[selector]];
const calls=[];let finishOld;
const key='a'.repeat(40);
runInNewContext(readFileSync('assets/dictionary.js','utf8'),{
 window:{georsltr_dictionary_config:{ajaxUrl:'/ajax',nonce:'nonce',strings:{loading:'loading',failed:'unavailable',empty:'empty',copy:'copy',source:'source'}}},
 document:{createElement:()=>new Element(),querySelectorAll:selector=>selector==='[data-georsltr-dictionary]'?[root]:[]},
 URL,navigator:{clipboard:{writeText:async()=>{}}},
 FormData:class{constructor(){this.fields={};}append(key,value){this.fields[key]=value;}},
 fetch:async(url,options)=>{
  assert.equal(url,'/ajax');assert.equal(options.credentials,'same-origin');
  const fields=options.body.fields;calls.push(fields);
  assert.equal(fields.action,'georsltr_dictionary');assert.equal(fields.nonce,'nonce');assert.equal(fields.georsltr_locale,'ru_RU');
  let body;
  if(fields.operation==='alphabet')body={data:[{chapter:1,label:'А',count:466}]};
  else if(fields.operation==='entry')body={data:{lexical:{headword:'А҆́бїе',civil:'Абие',definition:'<script>literal</script>',body_format:'plain-text',source_url:'javascript:alert(1)'},links:[]}};
  else if(fields.q==='old')return new Promise(resolve=>{finishOld=()=>resolve({ok:true,json:async()=>({success:true,data:{data:[{headword:'old'}],total:1,offset:0}})});});
  else body={data:[{key,headword:fields.q||'А҆́бїе',civil:'Абие',definition:'<script>literal</script>'}],total:40,offset:Number(fields.offset)};
  return {ok:true,json:async()=>({success:true,data:body})};
 }
});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
elements.form.elements.q.value='old';elements.form.handlers.submit({preventDefault(){}});await tick();
elements.form.elements.q.value='new';elements.form.handlers.submit({preventDefault(){}});await tick();
finishOld();await tick();
assert.equal(elements.results.children[0].children[0].textContent,'new','A late response must not replace newer results.');
assert.equal(elements.submit.disabled,false);
assert.equal(elements.form.elements.letter.children.length,1,'Alphabet must load only once.');
assert.equal(elements.more.hidden,false);
await elements.results.children[0].handlers.click();await tick();
assert.equal(elements.article.children[2].textContent,'<script>literal</script>');
assert.ok(!elements.article.children.some(child=>child.href),'Unsafe source URLs must not become links.');
assert.equal(elements.article.hidden,false);
elements.more.handlers.click();await tick();
assert.equal(elements.results.childElementCount,2);
assert.equal(calls.at(-1).offset,1);
console.log('Dictionary AJAX locale, alphabet, stale responses, pagination, literal output and unsafe links passed.');
