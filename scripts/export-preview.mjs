import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {root,validateCatalog} from './build.mjs';
import {page,home,productPage,policyPage,icon} from './site.mjs';

// Vista portátil: las fotos y las funciones se incluyen en un único HTML.
const store=validateCatalog(JSON.parse(await readFile(path.join(root,'data/catalogo.json'),'utf8')));
const embedded=new Map();
async function dataUrl(file){
  if(file.startsWith('data:'))return file;
  if(!embedded.has(file)){
    const bytes=await readFile(path.join(root,file));
    const mime=file.endsWith('.woff2')?'font/woff2':file.endsWith('.png')?'image/png':file.endsWith('.jpg')?'image/jpeg':'image/webp';
    embedded.set(file,`data:${mime};base64,${bytes.toString('base64')}`);
  }
  return embedded.get(file);
}
for(const p of store.products)p.image=await dataUrl(p.image);
const destinations=store.products.map(p=>({url:`/productos/${p.id}`,body:productPage(p,store),title:p.name}));
for(const type of ['envios-y-pagos','privacidad'])destinations.push({url:`/${type}`,body:policyPage(type,store),title:type==='privacidad'?'Privacidad':'Envíos y pagos'});
const dialogs=destinations.map((d,i)=>`<dialog class="preview-modal" id="preview-${i}" aria-label="${d.title}"><button class="icon-btn" data-close-preview aria-label="Cerrar detalles">${icon('close')}</button>${d.body.replace(/<main\b/,'<section').replace('</main>','</section>').replace(' id="contenido"','')}</dialog>`).join('');
let html=page({title:'Dharma | Vista previa de la tienda',description:'Vista previa de Dharma Collection.',path:'/',body:home(store)+dialogs,store,noindex:true});
let css=await readFile(path.join(root,'src/styles.css'),'utf8');
for(const match of [...css.matchAll(/\/assets\/fonts\/[-a-z0-9]+\.woff2/g)])css=css.replaceAll(match[0],await dataUrl(match[0].slice(1)));
html=html.replace(/<link rel="preload"[^>]+>/g,'');
html=html.replace('<link rel="stylesheet" href="/styles.css">',`<style>${css}</style>`).replace('<script type="module" src="/app.mjs"></script>','');
for(const file of ['assets/brand/logo.webp','assets/brand/favicon.png'])html=html.replaceAll('/'+file,await dataUrl(file));
html=html.replaceAll('src="/data:','src="data:').replaceAll('href="/#','href="#').replaceAll('href="/"','href="#inicio"');
const cartSource=(await readFile(path.join(root,'src/cart.mjs'),'utf8')).replace(/^export /gm,'');
const appSource=(await readFile(path.join(root,'src/app.mjs'),'utf8')).replace(/^import .*?;\n/,'').replace("location.href='/#productos'","location.href='#productos'");
const routes=Object.fromEntries(destinations.map((d,i)=>[d.url,`preview-${i}`]));
const script=`(()=>{\n${cartSource}\n${appSource}\nconst previewRoutes=${JSON.stringify(routes)};
document.addEventListener('click',event=>{
  const openPreview=document.querySelector('.preview-modal[open]');
  if(event.target.closest('[data-close-preview]')){openPreview?.close();return;}
  if(event.target.closest('[data-add]')){openPreview?.close();return;}
  const link=event.target.closest('a');if(!link)return;
  const target=previewRoutes[link.getAttribute('href')];
  if(target){event.preventDefault();openPreview?.close();document.getElementById(target).showModal();}
  else if(link.getAttribute('href')?.startsWith('#'))openPreview?.close();
},true);
document.querySelectorAll('.preview-modal').forEach(modal=>{
  modal.addEventListener('click',event=>{if(event.target!==modal)return;const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)modal.close();});
});
})();`;
html=html.replace('</body>',`<script>${script.replaceAll('</script','<\\/script')}</script></body>`);
const out=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'entrega/Dharma_vista_previa.html');
await mkdir(path.dirname(out),{recursive:true});await writeFile(out,html);console.log(out);
