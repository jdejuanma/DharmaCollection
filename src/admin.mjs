const $=id=>document.getElementById(id);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const quantities=n=>n===null?'A confirmar':`${n} unidades`;
let data;
async function call(path,{method='GET',body}={}){
 const response=await fetch(path,{method,credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
 let result;try{result=await response.json();}catch{result={};}
 if(!response.ok){const error=new Error(result.error||result.message||'No se pudo completar la operación.');error.status=response.status;throw error;}
 return result;
}
function login(message=''){$('dashboard').hidden=true;$('signOut').hidden=true;$('login').hidden=false;$('notice').textContent=message;$('loginForm').elements.password.value='';}
function summary(p,row){const units=p.variants?.find(v=>v.units>1)?.units;return `${quantities(row.stock)}${units&&row.stock!==null?` · hasta ${Math.floor(row.stock/units)} combos`:''}`;}
function history(){
 const reasons={venta:'Venta',reposicion:'Reposición',correccion:'Corrección'};
 $('history').innerHTML=data.history.length?`<ul class="history-list">${data.history.map(m=>`<li><div>${escape(data.products.find(p=>p.id===m.productId)?.name||m.productId)}<small>${escape(reasons[m.reason])} · ${escape(m.actorName)} · ${escape(new Date(m.createdAt).toLocaleString('es-PY',{timeZone:'America/Asuncion'}))}</small></div><b>${escape(m.oldStock??'?')} → ${escape(m.newStock??'?')}</b></li>`).join('')}</ul>`:'<p class="small-muted">Todavía no hay movimientos registrados.</p>';
}
function render(){
 $('login').hidden=true;$('dashboard').hidden=false;$('signOut').hidden=false;$('greeting').textContent=`Hola, ${data.name}. Actualizá las unidades después de cada venta o reposición.`;$('notice').textContent='';
 $('inventoryGrid').innerHTML=data.products.map(p=>{
  const row=data.inventory.find(r=>r.id===p.id);if(!row)return `<article class="inventory-card"><h2>${escape(p.name)}</h2><p>Pendiente de cargar en el inventario.</p></article>`;
  return `<article class="inventory-card"><img src="/${escape(p.image)}" alt="" width="200" height="130"><h2>${escape(p.name)}</h2><p class="stock-summary">${escape(summary(p,row))}</p><form data-product="${escape(p.id)}"><label>Unidades disponibles<input name="stock" type="number" min="0" max="100000" step="1" value="${row.stock??''}" placeholder="A confirmar"></label><div class="stock-actions"><button type="button" data-sold="1">Vendí 1 unidad</button>${p.variants?.some(v=>v.units===2)?'<button type="button" data-sold="2">Vendí 1 combo</button>':''}</div><label class="check-label"><input name="onRequest" type="checkbox" ${row.onRequest?'checked':''}> Aceptar encargos cuando se agote</label><label>Motivo<select name="reason"><option value="venta">Venta confirmada</option><option value="reposicion">Reposición</option><option value="correccion" selected>Corrección de inventario</option></select></label><button class="btn btn--primary" type="submit">Guardar cambios</button><p class="row-status" role="status" aria-live="polite"></p></form></article>`;
 }).join('');history();
}
async function load(){try{data=await call('/api/admin/inventory');render();}catch(e){login(e.status===401?'':e.message);}}
$('loginForm').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget,button=form.querySelector('button');button.disabled=true;$('notice').textContent='Ingresando…';
 try{await call('/api/auth/sign-in/email',{method:'POST',body:{email:form.elements.email.value.trim(),password:form.elements.password.value}});form.elements.password.value='';await load();}catch(error){$('notice').textContent=error.status===503?error.message:error.status===429?'Demasiados intentos. Esperá un minuto y volvé a intentar.':'No pudimos iniciar sesión. Revisá tu correo y contraseña.';}finally{button.disabled=false;}
});
$('signOut').addEventListener('click',async()=>{try{await call('/api/auth/sign-out',{method:'POST',body:{}});data=null;login('Sesión cerrada.');}catch{$('notice').textContent='No se pudo cerrar sesión. Intentá de nuevo.';}});
$('inventoryGrid').addEventListener('click',e=>{
 const button=e.target.closest('[data-sold]');if(!button)return;
 const form=button.closest('form'),input=form.elements.stock,amount=Number(button.dataset.sold);
 if(input.value===''||!Number.isSafeInteger(Number(input.value))||Number(input.value)<amount){form.querySelector('.row-status').textContent='Revisá las unidades disponibles antes de registrar la venta.';return;}
 input.value=Number(input.value)-amount;form.elements.reason.value='venta';form.querySelector('.row-status').textContent='Cambio pendiente. Pulsá Guardar cambios para publicarlo.';
});
$('inventoryGrid').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.target,id=form.dataset.product,row=data.inventory.find(r=>r.id===id),button=form.querySelector('[type="submit"]'),status=form.querySelector('.row-status');
 button.disabled=true;status.textContent='Guardando…';
 try{
  const result=await call('/api/admin/inventory',{method:'PATCH',body:{id,stock:form.elements.stock.value===''?null:Number(form.elements.stock.value),onRequest:form.elements.onRequest.checked,version:row.version,reason:form.elements.reason.value}});
  Object.assign(row,result.item);form.closest('article').querySelector('.stock-summary').textContent=summary(data.products.find(p=>p.id===id),row);status.textContent='Guardado. La tienda ya utiliza esta cantidad.';
  try{const latest=await call('/api/admin/inventory');data.history=latest.history;history();}catch{/* La escritura ya fue confirmada; no repetirla. */}
 }catch(error){if(error.status===401)login('Tu sesión terminó. Ingresá nuevamente.');else status.textContent=error.message;}finally{button.disabled=false;}
});
$('passwordForm').addEventListener('submit',async e=>{
 e.preventDefault();const form=e.currentTarget,button=form.querySelector('button');button.disabled=true;
 try{await call('/api/auth/change-password',{method:'POST',body:{currentPassword:form.elements.currentPassword.value,newPassword:form.elements.newPassword.value,revokeOtherSessions:true}});form.reset();$('passwordNotice').textContent='Contraseña actualizada.';}catch{$('passwordNotice').textContent='No pudimos cambiarla. Revisá la contraseña actual y usá una nueva de al menos 12 caracteres.';}finally{button.disabled=false;}
});
await load();
