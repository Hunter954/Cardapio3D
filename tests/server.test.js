import {test,after,before} from 'node:test';
import assert from 'node:assert/strict';
import {server} from '../server.js';
let origin;
before(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;});
after(()=>new Promise(resolve=>server.close(resolve)));
test('serves app and spatial tracking permissions',async()=>{const res=await fetch(origin);assert.equal(res.status,200);assert.match(res.headers.get('permissions-policy'),/xr-spatial-tracking=\(self\)/);assert.match(await res.text(),/cardapio3d/);});
test('serves both local Three.js modules without a CDN dependency',async()=>{for(const file of ['three.module.js','three.core.js']){const res=await fetch(`${origin}/vendor/${file}`);assert.equal(res.status,200);assert.match(res.headers.get('content-type'),/javascript/);}});
test('health endpoint and private file isolation',async()=>{assert.equal((await (await fetch(origin+'/health')).json()).status,'ok');for(const file of ['/package.json','/.env','/server.js','/%2e%2e%2fpackage.json'])assert.ok((await fetch(origin+file)).status>=400);});
