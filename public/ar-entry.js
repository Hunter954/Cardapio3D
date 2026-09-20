// This controller stays independent of WebGL, textures and capability-probe timing.
// The immersive request is invoked synchronously inside the original user gesture.
export function activateAR({secure,hasXR,phase,request,notice}){
 if(!secure){notice('Abra o link seguro','A realidade aumentada precisa de uma conexão HTTPS. Copie o link e abra diretamente no Chrome.');return 'insecure';}
 if(!hasXR){notice('Este navegador não oferece AR espacial','Se abriu dentro do ChatGPT, WhatsApp ou Instagram, use “Abrir no Chrome” ou copie o link para o navegador. No Android, o aparelho também precisa ser compatível com ARCore e ter o Google Play Services para RA ativo.');return 'unsupported';}
 if(phase==='error'){notice('Não foi possível carregar o 3D','Abra o link diretamente no Chrome atualizado e recarregue. O navegador precisa de aceleração gráfica para desenhar o livro.');return 'error';}
 if(phase!=='ready'){notice('O cardápio ainda está carregando','Espere alguns segundos, feche este aviso e toque novamente. Se continuar assim, recarregue a página ou abra o link no Chrome.');return 'loading';}
 request();return 'requested';
}
