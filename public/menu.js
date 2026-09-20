export const menu = [
 {category:'Da nossa cozinha',title:'Feito no fogo.',subtitle:'Servido com alma.',tag:'A CASA RECOMENDA',items:[
  {name:'Burger da casa',price:36,description:'Pão brioche, burger 180 g, queijo cheddar, alface e molho da casa.'},
  {name:'Duplo defumado',price:46,description:'Dois burgers, cheddar, bacon crocante e barbecue defumado.'},
  {name:'Verde & brasa',price:34,description:'Burger de grão-de-bico, rúcula, tomate e maionese de ervas.'}
 ]},
 {category:'Para compartilhar',title:'Boa companhia.',subtitle:'Sabor em dobro.',tag:'NO CENTRO DA MESA',items:[
  {name:'Batatas da casa',price:26,description:'Batatas rústicas, alecrim, flor de sal e aioli de alho assado.'},
  {name:'Crocantes de queijo',price:29,description:'Queijo empanado, geleia de pimenta e um toque de limão.'},
  {name:'Anéis de cebola',price:24,description:'Cebolas douradas na massa crocante, com molho especial.'}
 ]},
 {category:'O último capítulo',title:'Mais um momento.',subtitle:'Só para você.',tag:'DOCES & BEBIDAS',items:[
  {name:'Brownie quentinho',price:24,description:'Chocolate intenso, sorvete de baunilha e calda de chocolate.'},
  {name:'Limonada da casa',price:14,description:'Limão fresco, hortelã e gelo. Copo de 400 ml.'},
  {name:'Chá de frutas',price:12,description:'Infusão gelada de frutas vermelhas com toque cítrico. 400 ml.'}
 ]}
];
export const money = value => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
