import {test} from 'node:test';
import assert from 'node:assert/strict';
import {placementFromViewer} from '../public/spatial.js';
test('places 1.5 m ahead at eye level, with world-facing orientation',()=>{
 const result=placementFromViewer({x:2,y:1.7,z:3},{x:0,y:0,z:0,w:1});
 assert.deepEqual(result.position,{x:2,y:1.6199999999999999,z:1.5});
 assert.equal(result.orientation.y,0);
});
test('turning 180 degrees places the menu behind the original viewer direction',()=>{
 const result=placementFromViewer({x:0,y:1.5,z:0},{x:0,y:1,z:0,w:0});
 assert.equal(result.position.z,1.5);assert.ok(Math.abs(result.orientation.y)===1);
});
test('looking straight up still returns finite placement without tilting the menu',()=>{
 const result=placementFromViewer({x:0,y:0,z:0},{x:Math.SQRT1_2,y:0,z:0,w:Math.SQRT1_2});
 assert.equal(result.position.z,-1.5);assert.equal(result.orientation.x,0);
});
test('placement is independent of later mutable viewer poses',()=>{
 const position={x:0,y:1,z:0},orientation={x:0,y:0,z:0,w:1};const result=placementFromViewer(position,orientation);
 position.x=100;orientation.y=1;assert.equal(result.position.x,0);assert.equal(result.position.z,-1.5);
});
