import {readFile,writeFile,mkdir,rm,cp,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {page,home,productPage,policyPage,esc,json,icon} from './site.mjs';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function validateCatalog(store){
  if(!store||!Array.isArray(store.products)||!store.products.length)throw new Error('El catálogo necesita al menos un producto.');
  if(!/^595\d{8,10}$/.test(store.whatsapp))throw new Error('WhatsApp debe incluir 595 y solo números.');
  const ids=new Set();
  for(const p of store.products){
    if(!p||!/^[-a-z0-9]+$/.test(p.id)||ids.has(p.id))throw new Error('Cada producto necesita un ID único con letras minúsculas, números y guiones.');ids.add(p.id);
    for(const key of ['name','category','description','size','variant','image','imageAlt'])if(typeof p[key]!=='string'||!p[key].trim())throw new Error(`Falta ${key} en ${p.id}.`);
    if(!Number.isSafeInteger(p.price)||p.price<1||!Number.isSafeInteger(p.stock)||p.stock<0||p.stock>100000||!Number.isSafeInteger(p.price*p.stock))throw new Error(`Precio o stock inválido en ${p.id}.`);
    if(typeof p.onRequest!=='boolean'||!Array.isArray(p.features)||p.features.some(f=>typeof f!=='string'))throw new Error(`Datos incompletos en ${p.id}.`);
    if(!/^(assets\/[a-zA-Z0-9_./-]+\.(webp|png|jpe?g)|data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+)$/.test(p.image)||p.image.includes('..'))throw new Error(`La imagen de ${p.id} debe ser un archivo dentro de assets o una imagen PNG, JPG o WebP importada.`);
  }
  for(const key of ['instagram','facebook']){const u=new URL(store[key]);if(u.protocol!=='https:')throw new Error('Los enlaces sociales deben usar HTTPS.');}
  return store;
}
export async function build(){
  const original=validateCatalog(JSON.parse(await readFile(path.join(root,'data/catalogo.json'),'utf8')));const store=structuredClone(original);
  const dist=path.join(root,'dist');await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
  await cp(path.join(root,'assets'),path.join(dist,'assets'),{recursive:true,filter:src=>!src.includes('-original.')});
  for(const p of store.products){
    if(p.image.startsWith('data:')){const match=p.image.match(/^data:image\/(png|jpeg|webp);base64,(.+)$/);const bytes=Buffer.from(match[2],'base64');if(bytes.length>10*1024*1024)throw new Error('La imagen supera 10 MB.');p.image=`assets/products/${p.id}.${match[1]==='jpeg'?'jpg':match[1]}`;await mkdir(path.join(dist,'assets/products'),{recursive:true});await writeFile(path.join(dist,p.image),bytes);}
    else await stat(path.join(dist,p.image));
  }
  let base=process.env.SITE_URL||store.siteUrl||(process.env.VERCEL_ENV==='production'&&process.env.VERCEL_PROJECT_PRODUCTION_URL?`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`:'');
  if(base){const u=new URL(base);if(u.protocol!=='https:'||u.pathname!=='/'||u.search||u.hash)throw new Error('SITE_URL debe ser un origen HTTPS sin ruta.');base=u.origin;}
  const noindex=process.env.VERCEL_ENV==='preview';
  const pages=[
    {filename:'index.html',path:'/',title:'Dharma | Accesorios y coleccionables en Paraguay',description:'Encontrá tu próxima pieza en Dharma. Cinturones WWE, accesorios y coleccionables. Pedidos por WhatsApp, delivery y encomiendas a todo Paraguay.',body:home(store)},
    ...store.products.map(p=>({filename:`productos/${p.id}.html`,path:`/productos/${p.id}`,title:`${p.name} | Dharma Paraguay`,description:p.description,body:productPage(p,store),product:p})),
    ...['envios-y-pagos','privacidad'].map(type=>({filename:`${type}.html`,path:`/${type}`,title:`${type==='privacidad'?'Privacidad':'Envíos y pagos'} | Dharma`,description:type==='privacidad'?'Conocé cómo se utiliza la información de tu pedido en Dharma.':'Delivery, encomienda, retiro y formas de pago en Dharma Collection, Paraguay.',body:policyPage(type,store)})),
    {filename:'404.html',path:'/404',title:'Página no encontrada | Dharma',description:'Volvé a la colección de Dharma.',body:'<main class="policy-page container" id="contenido"><span class="section-tag">404</span><h1 class="section-title">Esta pieza se nos escapó.</h1><p>La página que buscás no está disponible.</p><a class="btn btn--primary" href="/#productos">Volver a la colección</a></main>',noindex:true}
  ];
  for(const p of pages){const target=path.join(dist,p.filename);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,page({...p,store,base,noindex:p.noindex||noindex}));}
  for(const file of ['styles.css','app.mjs','cart.mjs'])await cp(path.join(root,'src',file),path.join(dist,file));
  await writeFile(path.join(dist,'catalogo.json'),JSON.stringify(store,null,2)+'\n');
  await writeFile(path.join(dist,'robots.txt'),noindex?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\n${base?`Sitemap: ${base}/sitemap.xml\n`:''}`);
  if(base)await writeFile(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p=>p.filename!=='404.html').map(p=>`<url><loc>${esc(base+p.path)}</loc></url>`).join('')}</urlset>`);
  const editorTemplate=await readFile(path.join(root,'src/editor.html'),'utf8');const editorScript=await readFile(path.join(root,'src/editor.mjs'),'utf8');
  await mkdir(path.join(root,'herramientas'),{recursive:true});await writeFile(path.join(root,'herramientas/editor-catalogo.html'),editorTemplate.replace('/*CATALOG_DATA*/',json(original)).replace('/*EDITOR_SCRIPT*/',editorScript));
  console.log(`Dharma: ${store.products.length} productos, ${pages.length} páginas. Salida: dist/`);
  return {store,pages,base};
}
if(process.argv[1]===fileURLToPath(import.meta.url))await build();
