import {test} from 'node:test';
import assert from 'node:assert/strict';
import {activateAR} from '../public/ar-entry.js';
test('unsupported devices receive a visible explanation on click',()=>{
 const notices=[];let requests=0;
 const result=activateAR({secure:true,hasXR:false,phase:'ready',request:()=>requests++,notice:(...args)=>notices.push(args)});
 assert.equal(result,'unsupported');assert.equal(requests,0);assert.equal(notices.length,1);assert.match(notices[0][1],/Chrome/);
});
test('initialization failure and slow loading never swallow the click',()=>{
 for(const phase of ['loading','error']){let shown=false;activateAR({secure:true,hasXR:true,phase,request:()=>assert.fail('Request before ready'),notice:()=>shown=true});assert.ok(shown);}
});
test('AR request runs synchronously inside the original user activation',()=>{
 let clicked=true,called=false;
 activateAR({secure:true,hasXR:true,phase:'ready',request:()=>{assert.ok(clicked);called=true;},notice:()=>assert.fail('Unexpected notice')});
 clicked=false;assert.ok(called);
});
test('insecure contexts get HTTPS guidance',()=>{
 let text='';activateAR({secure:false,hasXR:false,phase:'ready',request:()=>assert.fail(),notice:(title,message)=>text=message});assert.match(text,/HTTPS/);
});
