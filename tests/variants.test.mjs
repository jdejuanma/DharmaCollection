import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {normalizeCart,getTotal,getCount,saveCart,readCart,buildOrderMessage,canIncrease} from '../src/cart.mjs';
import {validateCatalog} from '../scripts/build.mjs';
import {productPage,productCard} from '../scripts/site.mjs';
const catalog=JSON.parse(readFileSync(new URL('../data/catalogo.json',import.meta.url)));
const saber=catalog.products.find(p=>p.id==='sable-de-luz-multicolor');
const selection=(variantId,qty=1)=>({id:saber.id,variantId,qty});
test('individual y combo usan precios actuales, no los del almacenamiento',()=>{
 const cart=normalizeCart([{...selection('individual'),price:1},{...selection('combo-2'),price:2}],catalog.products);
 assert.equal(cart.length,2);assert.equal(cart[0].price,229000);assert.equal(cart[1].price,449000);
 assert.equal(getTotal(cart),678000);assert.equal(getCount(cart),3);
 const text=buildOrderMessage(cart);assert.match(text,/Combo de 2 sables/);assert.match(text,/449\.000 Gs\./);assert.match(text,/Largo 74 cm por sable/);assert.doesNotMatch(text,/talla/i);
});
test('las opciones persisten y se eliminan por separado; variantes falsas se rechazan',()=>{
 let saved;const storage={setItem:(_k,v)=>saved=v,getItem:()=>saved};
 const cart=normalizeCart([selection('individual'),selection('combo-2',2)],catalog.products);
 assert.equal(saveCart(storage,cart),true);const restored=readCart(storage,catalog.products);
 assert.equal(getTotal(restored),1127000);assert.equal(restored[1].qty,2);
 assert.equal(getTotal(normalizeCart(restored.filter(p=>p.variantId!=='individual'),catalog.products)),898000);
 assert.deepEqual(normalizeCart([selection('fake')],catalog.products),[]);
});
test('unidades individuales y combos comparten el stock físico cuando se carga',()=>{
 const products=[{...saber,stock:3}];
 const cart=normalizeCart([selection('combo-2',2),selection('individual',5)],products);
 assert.equal(cart[0].qty,1);assert.equal(cart[1].qty,1);assert.equal(getCount(cart),3);
 assert.equal(canIncrease(cart[0],cart),false);assert.equal(canIncrease(cart[1],cart),false);
 assert.equal(normalizeCart([selection('combo-2')],[{...saber,stock:1}]).length,0);
 assert.deepEqual(normalizeCart(cart,[{...saber,stock:0}]),[]);
});
test('sin cantidad confirmada no se inventa stock y se acotan cantidades de consulta',()=>{
 const unknown={...saber,stock:null};const cart=normalizeCart([selection('combo-2',1000)],[unknown]);
 assert.equal(cart[0].qty,99);assert.equal(canIncrease(cart[0],cart),false);
 assert.match(productCard(unknown,catalog),/Disponibilidad a confirmar/);
 assert.doesNotMatch(productCard(unknown,catalog),/\d+ unidades disponibles/);
});
test('World Spinner agotado se retira del carrito antiguo y permite encargo',()=>{
 const spinner=catalog.products.find(p=>p.id==='world-spinner');assert.equal(spinner.stock,0);assert.equal(spinner.onRequest,true);
 assert.deepEqual(normalizeCart([{id:spinner.id,qty:1}],catalog.products),[]);
 const html=productPage(spinner,catalog);assert.match(html,/Sobre pedido/);assert.match(html,/Consultar encargo/);assert.doesNotMatch(html,/data-add="world-spinner"/);
});
test('el sable tiene una sola ficha, dos fotos y precios explícitos en el selector',()=>{
 assert.equal(catalog.products.length,3);const html=productPage(saber,catalog);
 assert.match(html,/data-option value="combo-2"/);assert.match(html,/data-option value="individual"/);
 assert.match(html,/449\.000 Gs\./);assert.match(html,/229\.000 Gs\./);
 assert.match(html,/data-gallery-index="0"/);assert.match(html,/data-gallery-index="1"/);
});
test('se rechazan opciones duplicadas, precios inválidos y fotos inseguras',()=>{
 for(const edit of [p=>p.variants[1].id='individual',p=>p.variants[1].price=-1,p=>p.variants[1].units=0,p=>p.gallery[1].image='../../private.jpg',p=>p.variants[1].image='https://bad.example/a.webp']){
  const value=structuredClone(catalog);edit(value.products[2]);assert.throws(()=>validateCatalog(value));
 }
});
