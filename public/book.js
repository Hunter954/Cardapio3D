import * as THREE from '/vendor/three.module.js';
import {menu,money} from './menu.js';
const W=.60,H=.86,TW=1024,TH=1468;

function wrap(ctx,text,x,y,width,lineHeight){
 let line='';
 for(const word of text.split(' ')){const next=line+word+' ';if(ctx.measureText(next).width>width && line){ctx.fillText(line,x,y);y+=lineHeight;line=word+' ';}else line=next;}
 ctx.fillText(line,x,y);return y+lineHeight;
}
function canvasTexture(draw){const c=document.createElement('canvas');c.width=TW;c.height=TH;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}
function crop(ctx,img,x,y,w,h){const s=Math.max(w/img.width,h/img.height);ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();ctx.drawImage(img,x+(w-img.width*s)/2,y+(h-img.height*s)/2,img.width*s,img.height*s);ctx.restore();}
function base(ctx,dark=false){ctx.fillStyle=dark?'#173c2d':'#fff8e9';ctx.fillRect(0,0,TW,TH);ctx.strokeStyle=dark?'#b79759':'#d7cab2';ctx.lineWidth=2;ctx.strokeRect(42,42,TW-84,TH-84);ctx.fillStyle=dark?'#e8c580':'#77654b';ctx.font='24px Arial';ctx.fillText('C A R D A P I O 3 D',86,108);}
function paperMaterial(map){return new THREE.MeshBasicMaterial({map,side:THREE.FrontSide});}
function sheet(front,back){
 const group=new THREE.Group(); const geo=new THREE.PlaneGeometry(W,H,32,1);geo.translate(W/2,0,0);
 const f=new THREE.Mesh(geo,paperMaterial(front));f.position.z=.003;
 const backGeo=geo.clone();const uv=backGeo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));
 const b=new THREE.Mesh(backGeo,new THREE.MeshBasicMaterial({map:back,side:THREE.BackSide}));b.position.z=-.003;group.add(f,b);
 group.userData.meshes=[f,b];return group;
}
export class MenuBook {
 constructor(image){
  this.root=new THREE.Group();this.inner=new THREE.Group();this.root.add(this.inner);this.index=-1;this.animation=null;this.onChange=()=>{};
  this.cover=canvasTexture(c=>{base(c,true);c.fillStyle='#f6dfaa';c.textAlign='center';c.font='italic 98px Georgia';c.fillText('À mesa.',TW/2,420);c.font='32px Arial';c.fillText('UMA NOVA FORMA DE ESCOLHER',TW/2,510);if(image)crop(c,image,74,610,TW-148,470);c.font='24px Arial';c.fillStyle='#e8c580';c.fillText('ABRA. EXPLORE. SABOREIE.',TW/2,1295);});
  this.spreads=menu.map((data,i)=>({
   left:canvasTexture(c=>{base(c,true);c.fillStyle='#f6dfaa';c.font='64px Georgia';wrap(c,data.title,86,295,850,76);c.font='italic 54px Georgia';wrap(c,data.subtitle,86,395,850,70);if(image)crop(c,image,74,535,TW-148,535);c.fillStyle='#e8c580';c.font='24px Arial';c.fillText(data.tag,86,1180);c.font='30px Georgia';wrap(c,'Ingredientes de verdade. Tempo para aproveitar.',86,1260,800,44);}),
   right:canvasTexture(c=>{base(c);c.fillStyle='#173c2d';c.font='60px Georgia';wrap(c,data.category,86,236,850,70);let y=410;data.items.forEach(item=>{c.fillStyle='#173c2d';c.font='bold 40px Arial';y=wrap(c,item.name,86,y,820,48);c.font='30px Arial';c.fillStyle='#625d51';y=wrap(c,item.description,86,y+23,810,43);c.fillStyle='#9e602b';c.font='bold 36px Arial';c.fillText(money(item.price),86,y+25);y+=118;c.strokeStyle='#d7cab2';c.beginPath();c.moveTo(86,y-55);c.lineTo(938,y-55);c.stroke();});c.fillStyle='#77654b';c.font='23px Arial';c.fillText('DEMONSTRAÇÃO · VALORES ILUSTRATIVOS',86,1340);c.textAlign='right';c.fillText(String(i+1).padStart(2,'0'),938,1390);})
  }));
  const leather=new THREE.MeshBasicMaterial({color:'#122a20'});
  for(const side of [-1,1]){const board=new THREE.Mesh(new THREE.BoxGeometry(W+.025,H+.028,.024),leather);board.position.set(side*W/2,0,-.027);this.inner.add(board);if(side===-1)this.leftBoard=board;}
  const edges=new THREE.Mesh(new THREE.BoxGeometry(W*2,H-.012,.022),new THREE.MeshBasicMaterial({color:'#c7bda7'}));edges.position.z=-.013;this.edges=edges;this.inner.add(edges);
  this.left=new THREE.Mesh(new THREE.PlaneGeometry(W,H),paperMaterial(this.spreads[0].left));this.left.position.set(-W/2,0,.004);
  this.right=new THREE.Mesh(new THREE.PlaneGeometry(W,H),paperMaterial(this.spreads[0].right));this.right.position.set(W/2,0,.004);this.inner.add(this.left,this.right);
  this.leaf=sheet(this.cover,this.spreads[0].left);this.inner.add(this.leaf);this.setClosed();
 }
 setClosed(){this.index=-1;this.animation=null;this.leaf.visible=true;this.leaf.rotation.y=0;this.leaf.userData.meshes[0].material.map=this.cover;this.leaf.userData.meshes[1].material.map=this.spreads[0].left;this.left.visible=false;this.right.visible=false;this.edges.visible=false;this.leftBoard.visible=false;this.inner.position.x=-W/2;this.bend(0);this.onChange();}
 bend(amount){for(const mesh of this.leaf.userData.meshes){const a=mesh.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i);a.setZ(i,Math.sin(x/W*Math.PI)*amount);}a.needsUpdate=true;mesh.geometry.computeBoundingSphere();}}
 turn(direction=1){
  if(this.animation)return false;const target=this.index+direction;if(target<0||target>=this.spreads.length)return false;
  const opening=this.index===-1;this.right.visible=true;this.leaf.visible=true;
  const [front,back]=this.leaf.userData.meshes;
  if(opening){front.material.map=this.cover;back.material.map=this.spreads[0].left;this.right.material.map=this.spreads[0].right;}
  else if(direction>0){front.material.map=this.spreads[this.index].right;back.material.map=this.spreads[target].left;this.right.material.map=this.spreads[target].right;}
  else {front.material.map=this.spreads[target].right;back.material.map=this.spreads[this.index].left;this.left.material.map=this.spreads[target].left;}
  this.animation={start:performance.now(),duration:matchMedia('(prefers-reduced-motion: reduce)').matches?100:opening?1450:950,target,direction,opening};this.onChange();return true;
 }
 update(now){
  const a=this.animation;if(!a)return;
  const p=Math.min(1,(now-a.start)/a.duration),ease=p*p*(3-2*p);
  this.leaf.rotation.y=-Math.PI*(a.direction>0?ease:1-ease);this.bend(Math.sin(p*Math.PI)*.085);
  if(a.opening){this.inner.position.x=-W/2*(1-ease);this.leftBoard.visible=true;this.edges.visible=p>.7;}
  if(p===1){this.index=a.target;this.left.visible=this.right.visible=true;this.left.material.map=this.spreads[this.index].left;this.right.material.map=this.spreads[this.index].right;this.leaf.visible=false;this.animation=null;this.inner.position.x=0;this.onChange();}
 }
}
