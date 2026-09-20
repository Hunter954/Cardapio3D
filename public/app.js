import * as THREE from '/vendor/three.module.js';
import {MenuBook} from './book.js';
import {menu,money} from './menu.js';
import {placementFromViewer} from './spatial.js';
const $=id=>document.getElementById(id);
const status=text=>$('status').textContent=text;
let renderer,book,session,anchor,referenceSpace,placing=false,placeRequested=false,placementEpoch=0,reading=false,xrStarting=false,trackingLost=false;
let scale=1,rotationX=0,rotationY=-.18,zoom=1,lastFrameTime=0;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,.02,100);
const pointers=new Map();let pinchDistance=0;

function updateUI(){
 if(!book)return;
 $('category').textContent=book.index<0?'BOAS-VINDAS':menu[book.index].category.toUpperCase();
 $('page-count').textContent=book.index<0?'Capa':`${book.index+1} / ${menu.length}`;
 $('prev').disabled=book.index<=0||!!book.animation;
 $('next').disabled=book.index>=menu.length-1||!!book.animation;
}
function resize(){
 if(!renderer || session)return;
 renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
 const distance=Math.max(2.05,.83/(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect));
 camera.position.set(0,0,distance/zoom);camera.rotation.set(0,0,0);
 if(book){book.root.position.set(!reading && innerWidth>700?.65:0,reading?.09:innerWidth>700?.12:-.06,0);book.root.rotation.set(rotationX,rotationY,0);book.root.scale.setScalar(scale);}
}
function beginPreview(){
 if(session || !book)return;
 reading=true;document.body.classList.add('reading');$('entry').hidden=true;$('reader').hidden=false;
 rotationX=0;rotationY=0;resize();if(book.index===-1)book.turn();
 status('');
}
function clearAnchor(){placementEpoch++;if(anchor){anchor.delete();anchor=null;}}
function beginPlacement(){
 if(!session)return;
 clearAnchor();placing=true;placeRequested=false;book.root.visible=false;$('placement').hidden=false;$('place').disabled=true;$('reader').hidden=true;
 status('Mova o celular devagar para reconhecer o ambiente.');
}
function resetAfterXR(){
 clearAnchor();session=null;referenceSpace=null;placing=false;placeRequested=false;xrStarting=false;trackingLost=false;reading=false;book.setClosed();
 document.body.classList.remove('ar');$('placement').hidden=true;$('exit').hidden=true;$('mode').textContent='EXPERIÊNCIA 3D';
 document.body.classList.toggle('reading',reading);$('hint').textContent='Arraste para girar · Use dois dedos para aproximar';
 $('entry').hidden=false;$('reader').hidden=!reading;$('start-ar').disabled=false;
 book.root.visible=true;book.root.matrixAutoUpdate=true;book.root.position.set(0,0,0);book.root.quaternion.identity();resize();status('Sessão encerrada. Você pode abrir novamente no seu espaço.');
}
async function startAR(){
 if(session)return;
 if(xrStarting){status('Aguardando a autorização do navegador. Verifique a solicitação de realidade aumentada.');return;}
 if(!book){status('O livro ainda está carregando. Tente novamente em alguns segundos.');return;}
 xrStarting=true;$('start-ar').setAttribute('aria-busy','true');
 status('Solicitando câmera e realidade aumentada… Confirme a autorização do navegador.');
 const pendingTimer=setTimeout(()=>{if(xrStarting&&!session)window.dispatchEvent(new CustomEvent('cardapio:ar-error',{detail:{title:'Aguardando o navegador',message:'Verifique se existe uma solicitação de permissão aberta. Se nada apareceu, abra este link diretamente no Chrome e tente novamente.'}}));},15000);
 try{
  // requestSession must be called directly from the click before any awaited operation.
  const started=await navigator.xr.requestSession('immersive-ar',{requiredFeatures:['local','dom-overlay'],optionalFeatures:['anchors'],domOverlay:{root:$('overlay')}});
  clearTimeout(pendingTimer);if($('ar-help').open)$('ar-help').close();
  session=started;
  started.addEventListener('end',resetAfterXR,{once:true});
  referenceSpace=await started.requestReferenceSpace('local');
  referenceSpace.addEventListener('reset',()=>{if(session){beginPlacement();status('O ambiente mudou. Fixe o cardápio novamente.');}});
  renderer.xr.setReferenceSpaceType('local');await renderer.xr.setSession(started);renderer.xr.setReferenceSpace(referenceSpace);
  document.body.classList.add('ar');$('entry').hidden=true;$('exit').hidden=false;$('mode').textContent='REALIDADE AUMENTADA';
  $('hint').textContent='Aproxime o celular para ler · Vire as páginas nas setas';
  book.root.matrixAutoUpdate=true;book.root.scale.setScalar(scale);book.setClosed();beginPlacement();
 }catch(error){
  if(session){try{await session.end();}catch{} }
  xrStarting=false;
  const denied=error.name==='NotAllowedError'||error.name==='SecurityError';
  const message=denied?'A autorização foi recusada ou bloqueada. Nas permissões deste site no Chrome, libere câmera e realidade aumentada. Depois tente novamente.':'Este navegador ou aparelho não disponibilizou os recursos necessários. Abra diretamente no Chrome no Android e confira se o Google Play Services para RA está instalado e ativo. Se o aparelho não for compatível com ARCore, a fixação espacial não estará disponível.';
  status(denied?'Permissão não liberada. Veja a orientação na tela.':'Não foi possível iniciar o AR. Veja a orientação na tela.');
  window.dispatchEvent(new CustomEvent('cardapio:ar-error',{detail:{title:denied?'Permissão necessária':'Não foi possível abrir no seu espaço',message,detail:`Detalhe: ${error.name || 'Erro desconhecido'}`}}));
 }finally{
  clearTimeout(pendingTimer);$('start-ar').removeAttribute('aria-busy');
 }
}
function place(frame,pose){
 placeRequested=false;placing=false;clearAnchor();const epoch=placementEpoch,activeSession=session;
 const transform=placementFromViewer(pose.transform.position,pose.transform.orientation);
 book.root.position.copy(transform.position);book.root.quaternion.copy(transform.orientation);book.root.scale.setScalar(scale);book.root.visible=true;
 book.setClosed();book.turn();reading=true;$('placement').hidden=true;$('reader').hidden=false;
 status('Cardápio fixado. Você pode se aproximar e olhar ao redor.');
 if(frame.createAnchor){
  frame.createAnchor(new XRRigidTransform(transform.position,transform.orientation),referenceSpace).then(created=>{
   if(session!==activeSession||epoch!==placementEpoch){created.delete();return;}anchor=created;
  }).catch(()=>{/* Local reference space still supplies spatial tracking. */});
 }
}
function render(now,frame){
 const time=performance.now();
 if(book){
  book.update(time);
  if(frame&&session&&referenceSpace){
   const pose=frame.getViewerPose(referenceSpace);
   if(!pose || pose.emulatedPosition){
    book.root.visible=false;$('place').disabled=true;trackingLost=true;status('Rastreamento pausado. Aponte para um ambiente iluminado e mova devagar.');
   }else{
    if(placing){$('place').disabled=false;if(trackingLost||time-lastFrameTime>4000){status('Escolha uma posição e toque em “Fixar aqui no ar”.');lastFrameTime=time;}if(placeRequested)place(frame,pose);}
    else{
     book.root.visible=true;
     if(anchor){const anchorPose=frame.getPose(anchor.anchorSpace,referenceSpace);if(anchorPose){book.root.position.copy(anchorPose.transform.position);book.root.quaternion.copy(anchorPose.transform.orientation);}else{book.root.visible=false;status('Recuperando a posição do cardápio…');trackingLost=true;}}
     if(trackingLost&&book.root.visible)status('Posição recuperada. O cardápio continua no mesmo lugar.');
    }
    if(book.root.visible||placing)trackingLost=false;
   }
  }
 }
 renderer.render(scene,camera);
}
async function init(){
 try{
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);renderer.xr.enabled=true;$('stage').append(renderer.domElement);
  const image=await new Promise(resolve=>{const i=new Image(),timer=setTimeout(()=>resolve(null),5000);i.onload=()=>{clearTimeout(timer);resolve(i);};i.onerror=()=>{clearTimeout(timer);resolve(null);};i.src='/food.jpg';});
  book=new MenuBook(image);book.onChange=updateUI;scene.add(book.root);resize();updateUI();renderer.setAnimationLoop(render);
  window.dispatchEvent(new Event('cardapio:ready'));
  $('compatibility').textContent='Toque para liberar a realidade aumentada ou verificar a compatibilidade.';
  status('');
 }catch(error){window.dispatchEvent(new Event('cardapio:failed'));console.warn('3D initialization failed:',error.name,error.message);status('Não foi possível carregar o 3D neste aparelho. Você pode ler o cardápio em texto.');$('compatibility').textContent='Toque em “Abrir no meu espaço” para ver a orientação.';$('preview').textContent='Ler cardápio';$('preview').onclick=()=> $('text-dialog').showModal();}
}
window.addEventListener('cardapio:open-ar',startAR);
$('preview').addEventListener('click',beginPreview);
$('place').addEventListener('click',()=>{placeRequested=true;$('place').disabled=true;});
$('exit').addEventListener('click',()=>session?.end().catch(()=>status('Não foi possível encerrar. Use o botão Voltar do navegador.')));
$('prev').addEventListener('click',()=>book?.turn(-1));$('next').addEventListener('click',()=>book?.turn(1));
$('reset').addEventListener('click',()=>{if(session)beginPlacement();else{rotationX=rotationY=0;zoom=1;resize();}});
$('size').addEventListener('change',event=>{scale=Number(event.target.value);book?.root.scale.setScalar(scale);});
$('read-text').addEventListener('click',()=> $('text-dialog').showModal());$('close-text').addEventListener('click',()=> $('text-dialog').close());
$('overlay').addEventListener('beforexrselect',event=>{if(event.target.closest('button,select,dialog'))event.preventDefault();});
for(const data of menu){const section=document.createElement('section');const heading=document.createElement('h3');heading.textContent=data.category;section.append(heading);for(const item of data.items){const article=document.createElement('article'),title=document.createElement('b'),name=document.createElement('span'),price=document.createElement('span'),description=document.createElement('p');name.textContent=item.name;price.textContent=money(item.price);description.textContent=item.description;title.append(name,price);article.append(title,description);section.append(article);}$('text-menu').append(section);}
window.addEventListener('resize',resize);
window.addEventListener('keydown',event=>{if($('text-dialog').open||event.target.matches('select,input,button'))return;if(reading&&event.key==='ArrowRight')book?.turn(1);if(reading&&event.key==='ArrowLeft')book?.turn(-1);});
$('stage').addEventListener('pointerdown',event=>{if(session||!reading)return;pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});$('stage').setPointerCapture(event.pointerId);if(pointers.size===2){const [a,b]=[...pointers.values()];pinchDistance=Math.hypot(a.x-b.x,a.y-b.y);}});
$('stage').addEventListener('pointermove',event=>{if(session||!pointers.has(event.pointerId))return;const old=pointers.get(event.pointerId);pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()],distance=Math.hypot(a.x-b.x,a.y-b.y);if(pinchDistance>0)zoom=THREE.MathUtils.clamp(zoom*distance/pinchDistance,.65,2.8);pinchDistance=distance;}else{rotationY=THREE.MathUtils.clamp(rotationY+(event.clientX-old.x)*.005,-1.2,1.2);rotationX=THREE.MathUtils.clamp(rotationX+(event.clientY-old.y)*.003,-.6,.6);}resize();});
for(const name of ['pointerup','pointercancel','lostpointercapture'])$('stage').addEventListener(name,event=>{pointers.delete(event.pointerId);pinchDistance=0;});
$('stage').addEventListener('wheel',event=>{if(session||!reading)return;event.preventDefault();zoom=THREE.MathUtils.clamp(zoom-event.deltaY*.001,.65,2.8);resize();},{passive:false});
init();
