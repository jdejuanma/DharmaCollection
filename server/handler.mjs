import catalog from '../data/catalogo.json' with {type:'json'};
import {page,home,productPage,policyPage} from '../scripts/site.mjs';
import {validateChange,applyInventory,InventoryError} from './inventory.mjs';
const noStore={'Cache-Control':'no-store','X-Robots-Tag':'noindex','Content-Type':'application/json; charset=utf-8'};
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:noStore});
export function createHandler(runtimeProvider){
 return async function handle(request){
  const url=new URL(request.url), route=url.pathname;
  let runtime;
  try{runtime=runtimeProvider();}catch{return json({error:'Administración pendiente de configuración.'},503);}
  if(route.startsWith('/api/auth/')){
    if(!runtime)return json({error:'Administración pendiente de activación.'},503);
    // No se exponen altas, recuperación por email ni cambios de identidad sin un flujo configurado.
    const allowed=['/api/auth/sign-in/email','/api/auth/sign-out','/api/auth/get-session','/api/auth/change-password'];
    if(!allowed.includes(route))return json({error:'Ruta no disponible.'},404);
    const response=await runtime.auth.handler(request);
    response.headers.set('Cache-Control','no-store');response.headers.set('X-Robots-Tag','noindex');
    return response;
  }
  if(route==='/api/admin/inventory'){
    if(!runtime)return json({error:'Administración pendiente de activación.'},503);
    try{
      if(!['GET','PATCH'].includes(request.method))return json({error:'Método no permitido.'},405);
      const session=await runtime.auth.api.getSession({headers:request.headers});
      if(!session)return json({error:'Iniciá sesión para continuar.'},401);
      if(!await runtime.inventory.isAdmin(session.user.id))return json({error:'Tu cuenta no tiene acceso a la administración.'},403);
      if(request.method==='GET')return json({products:catalog.products,inventory:await runtime.inventory.list(),history:await runtime.inventory.history(),name:session.user.name});
      if(request.headers.get('origin')!==runtime.origin)return json({error:'Origen no permitido.'},403);
      if(!request.headers.get('content-type')?.startsWith('application/json'))return json({error:'Formato no permitido.'},415);
      const raw=await request.text();if(raw.length>4096)return json({error:'Solicitud demasiado grande.'},413);
      let input;try{input=JSON.parse(raw);}catch{return json({error:'Datos no válidos.'},400);}
      const change=validateChange(input,catalog.products);
      return json({item:await runtime.inventory.change(change,session.user)});
    }catch(error){return json({error:error instanceof InventoryError?error.message:'No pudimos guardar o cargar el inventario. Intentá de nuevo.'},error instanceof InventoryError?error.status:503);}
  }
  if(route.startsWith('/api/'))return json({error:'Ruta no encontrada.'},404);
  if(!['GET','HEAD'].includes(request.method))return new Response(null,{status:405});
  let store=catalog;
  if(runtime){try{store=applyInventory(catalog,await runtime.inventory.list());}catch{store=applyInventory(catalog,[],{unavailable:true});}}
  const path=route.replace(/\.html$/,'');
  let content;
  if(path==='/'||path==='/index')content={path:'/',title:'Dharma | Accesorios y coleccionables en Paraguay',description:'Sables de luz, cinturones WWE y coleccionables. Envíos a todo Paraguay.',body:home(store)};
  else if(path.startsWith('/productos/')){
    const product=store.products.find(p=>'/productos/'+p.id===path);
    if(product)content={path,title:product.name+' | Dharma Paraguay',description:product.description,body:productPage(product,store),product};
  }else if(['/envios-y-pagos','/privacidad'].includes(path))content={path,title:'Dharma | '+(path==='/privacidad'?'Privacidad':'Envíos y pagos'),description:'Información de Dharma',body:policyPage(path.slice(1),store)};
  if(!content)return new Response('Página no encontrada',{status:404});
  const origin=runtime?.origin||'https://dharmacollection.vercel.app';
  return new Response(request.method==='HEAD'?null:page({...content,store,base:origin,noindex:process.env.VERCEL_ENV==='preview'}),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
 };
}
