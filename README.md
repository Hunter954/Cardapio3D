# cardapio3d

Cardápio demonstrativo em um livro 3D, com abertura animada, três capítulos e modo de realidade aumentada espacial WebXR. Interface em português, preços em reais e modo de leitura em texto.

## Executar

Node.js 22 ou superior. Rode `npm ci` e `npm start`. Acesse `http://localhost:3000`. Não há banco de dados, segredos ou API paga. A biblioteca Three.js e a foto são servidas pelo próprio aplicativo.

## Realidade aumentada

Abra a URL **HTTPS** no Chrome para Android em um aparelho compatível com ARCore e com Google Play Services for AR instalado/atualizado. O botão **Abrir no meu espaço** permanece ativo: solicita a sessão AR dentro do gesto do usuário, mostra o progresso da autorização e apresenta uma orientação em caso de incompatibilidade, falta de permissão ou falha gráfica. Ao iniciar, apresenta **Fixar aqui no ar**. O carregamento 3D não bloqueia o painel de ajuda. A entrada imersiva precisa de um gesto do usuário: não é possível forçar sua abertura ao carregar uma URL.

O livro fica a 1,5 m à frente, na altura aproximada dos olhos, com 1,2 m de largura no tamanho Grande. A transformação é registrada no referencial `local` do WebXR, e nunca ligada à câmera. Se disponível, uma `XRAnchor` mantém essa pose. Aproximar fisicamente o celular aumenta a projeção; virar de costas retira o livro do campo de visão. A âncora existe somente durante a sessão atual; não persiste ao recarregar a página. O ambiente precisa de luz e detalhes visuais para o rastreamento. Em perda de tracking o livro é ocultado, sem saltar para a câmera. Após reset do referencial, é solicitado reposicionamento.

O modo AR requer também DOM Overlay para os controles. Dispositivos sem WebXR AR recebem **Explorar em 3D**, sem câmera e sem promessa de fixação espacial. Safari/iPhone deve ser tratado pela detecção de capacidade; um produto iOS com tracking espacial universal exigiria outro runtime/SDK ou aplicativo nativo. Nenhuma imagem da câmera é capturada ou enviada ao servidor.

## Publicar no Railway

1. Crie um repositório `cardapio3d` no GitHub e envie estes arquivos.
2. Railway → New Project → Deploy from GitHub repo → selecione o repositório.
3. O Dockerfile instala as dependências com `npm ci`; o serviço usa a variável `PORT` do Railway.
4. Em Networking, gere o domínio público. `/health` é o healthcheck.

Não é necessário QR Code nesta fase. Depois, basta gerar um QR para a URL HTTPS publicada.

## Conteúdo

Altere categorias, pratos, descrições e preços em `public/menu.js`. A foto está em `public/food.jpg`. É um cardápio de demonstração; não inclui pedidos ou pagamento.

Foto: **Juicy cheeseburger**, Jean-claude Attipoe / Unsplash. https://unsplash.com/photos/burger-with-lettuce-and-tomato-EtJiql0AdwI — https://unsplash.com/license

## Verificação

`npm test` verifica posicionamento espacial e servidor/isolamento de arquivos; `npm run check` verifica sintaxe. A validação física do AR precisa ser feita em um celular compatível: mover 50 cm à frente, girar 180° e voltar, virar páginas, reposicionar e encerrar/reabrir. Testes em navegador desktop não substituem esse teste.
