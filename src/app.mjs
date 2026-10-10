import {readCart,saveCart,normalizeCart,getTotal,getCount,formatPrice,buildOrderMessage,whatsappUrl} from './cart.mjs';

const store = JSON.parse(document.getElementById('storeData').textContent);
let storage; try {storage=window.localStorage;} catch {}
let cart=readCart(storage,store.products);
const dialog=document.getElementById('cartDialog');
const items=document.getElementById('cartItems');
const footer=document.getElementById('cartFooter');
const checkout=document.getElementById('checkoutBtn');
const delivery=document.getElementById('delivery');
const toast=document.getElementById('toast');
let toastTimer; let returnFocus;
const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function showToast(message){clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),2500);}
function openCart(){returnFocus=document.activeElement;document.getElementById('nav').classList.remove('open');document.getElementById('menuToggle').setAttribute('aria-expanded','false');dialog.showModal();document.body.classList.add('dialog-open');}
function closeCart(){dialog.close();}
dialog.addEventListener('close',()=>{document.body.classList.remove('dialog-open');returnFocus?.focus();});
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))closeCart();});
function renderCart(){
  cart=normalizeCart(cart,store.products);saveCart(storage,cart);
  document.getElementById('cartCount').textContent=getCount(cart);
  document.getElementById('cartBtn').setAttribute('aria-label',`Abrir carrito: ${getCount(cart)} productos`);
  document.getElementById('cartTotal').textContent=formatPrice(getTotal(cart));
  footer.hidden=!cart.length;
  items.innerHTML=cart.length?cart.map(p=>`<article class="cart-item"><img class="cart-item__thumb" src="${escape(p.image.startsWith('data:')?p.image:'/'+p.image)}" alt="${escape(p.name)}" width="80" height="80"><div class="cart-item__info"><h3>${escape(p.name)}</h3><p class="small-muted">Talla ${escape(p.size.toLowerCase())}</p><p class="cart-item__price">${formatPrice(p.price*p.qty)}</p><div class="cart-item__qty"><button aria-label="Quitar una unidad de ${escape(p.name)}" data-qty="${escape(p.id)}" data-change="-1">−</button><span aria-label="Cantidad">${p.qty}</span><button aria-label="Agregar una unidad de ${escape(p.name)}" data-qty="${escape(p.id)}" data-change="1" ${p.qty>=p.stock?'disabled':''}>+</button></div><button class="cart-item__remove" data-remove="${escape(p.id)}">Quitar producto</button></div></article>`).join(''):`<div class="cart-empty"><h3>Tu colección empieza acá.</h3><p>Todavía no agregaste productos al carrito.</p><button class="btn btn--outline" data-continue>Explorar la colección</button></div>`;
  checkout.href=whatsappUrl(store.whatsapp,buildOrderMessage(cart,delivery.value));
}
function add(id){
  const product=store.products.find(p=>p.id===id);if(!product||product.stock<1)return;
  const existing=cart.find(p=>p.id===id);
  if(existing&&existing.qty>=product.stock){showToast('Ya agregaste las unidades disponibles. Consultanos si querés más.');openCart();return;}
  if(existing)existing.qty++;else cart.push({...product,qty:1});
  renderCart();openCart();
}
document.addEventListener('click',e=>{
  const addButton=e.target.closest('[data-add]');if(addButton){add(addButton.dataset.add);return;}
  const change=e.target.closest('[data-qty]');if(change){
    const item=cart.find(p=>p.id===change.dataset.qty);if(!item)return;
    item.qty+=Number(change.dataset.change);cart=cart.filter(p=>p.qty>0);
    const id=change.dataset.qty;const delta=change.dataset.change;renderCart();
    const next=[...items.querySelectorAll('[data-qty]')].find(b=>b.dataset.qty===id&&b.dataset.change===delta&&!b.disabled);
    (next||items.querySelector('button')||document.getElementById('cartClose')).focus();return;
  }
  const remove=e.target.closest('[data-remove]');if(remove){cart=cart.filter(p=>p.id!==remove.dataset.remove);renderCart();(items.querySelector('button')||document.getElementById('cartClose')).focus();return;}
  if(e.target.closest('[data-continue]')){closeCart();location.href='/#productos';}
});
document.getElementById('cartBtn').addEventListener('click',openCart);
document.getElementById('cartClose').addEventListener('click',closeCart);
document.getElementById('continueShopping').addEventListener('click',closeCart);
delivery.addEventListener('change',()=>{checkout.href=whatsappUrl(store.whatsapp,buildOrderMessage(cart,delivery.value));});
checkout.addEventListener('click',e=>{if(!cart.length){e.preventDefault();return;}checkout.href=whatsappUrl(store.whatsapp,buildOrderMessage(cart,delivery.value));});
window.addEventListener('storage',()=>{cart=readCart(storage,store.products);renderCart();});

const menuToggle=document.getElementById('menuToggle');const nav=document.getElementById('nav');
menuToggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));menuToggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Abrir menú');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');}});
document.addEventListener('click',e=>{if(!e.target.closest('.header')){nav.classList.remove('open');menuToggle.setAttribute('aria-expanded','false');}});

const grid=document.getElementById('productsGrid');
if(grid){
  let filter='all';const search=document.getElementById('search');const category=document.getElementById('category');
  const fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  function filterProducts(){let count=0;for(const card of grid.children){const p=store.products.find(p=>p.id===card.dataset.product);const match=(filter==='all'||(filter==='stock'?p.stock>0:p.stock===0&&p.onRequest))&&(category.value==='all'||p.category===category.value)&&fold([p.name,p.description,p.category].join(' ')).includes(fold(search.value));card.hidden=!match;if(match)count++;}document.getElementById('noResults').hidden=count>0;}
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{filter=btn.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});filterProducts();}));
  search.addEventListener('input',filterProducts);category.addEventListener('change',filterProducts);
  document.getElementById('resetFilters').addEventListener('click',()=>{search.value='';category.value='all';document.querySelector('[data-filter="all"]').click();search.focus();});
}
renderCart();
