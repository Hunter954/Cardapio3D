import {activateAR} from './ar-entry.js';
const $=id=>document.getElementById(id);
let phase='loading';
function notice(title,message,detail=''){
 $('ar-help-title').textContent=title;$('ar-help-message').textContent=message;$('ar-help-detail').textContent=detail;
 if(!$('ar-help').open)$('ar-help').showModal();
}
window.addEventListener('cardapio:ready',()=>{phase='ready';});
window.addEventListener('cardapio:failed',()=>{phase='error';});
window.addEventListener('cardapio:ar-error',event=>notice(event.detail.title,event.detail.message,event.detail.detail));
$('start-ar').addEventListener('click',()=>activateAR({secure:window.isSecureContext,hasXR:typeof navigator.xr?.requestSession==='function',phase,request:()=>window.dispatchEvent(new Event('cardapio:open-ar')),notice}));
$('close-ar-help').addEventListener('click',()=> $('ar-help').close());
const url=new URL('/',location.href).href;
if(/Android/i.test(navigator.userAgent)){
 $('open-chrome').hidden=false;
 $('open-chrome').href=`intent://${new URL(url).host}/#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`;
}
$('copy-link').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText(url);$('copy-result').textContent='Link copiado. Cole na barra de endereços do Chrome.';}
 catch{$('copy-result').textContent=`Copie este endereço: ${url}`;}
});
import('./app.js').catch(error=>{
 phase='error';console.warn('Application module failed:',error.name,error.message);
 $('status').textContent='Falha ao carregar o cardápio. Recarregue a página e tente novamente.';
 $('compatibility').textContent='Toque em “Abrir no meu espaço” para ver a orientação.';
});
