// Ejecutar solo desde una terminal de confianza con las variables privadas cargadas.
import {readFile} from 'node:fs/promises';
import {getMigrations} from 'better-auth/db/migration';
import {getRuntime} from '../server/runtime.mjs';
import {createAuth} from '../server/auth.mjs';
import catalog from '../data/catalogo.json' with {type:'json'};
const runtime=getRuntime();if(!runtime)throw new Error('Configurá DATABASE_URL, BETTER_AUTH_URL, BETTER_AUTH_SECRET e INVENTORY_MODE.');
try{
 const migration=await getMigrations(runtime.auth.options);await migration.runMigrations();
 await runtime.db.query(await readFile(new URL('../server/schema.sql',import.meta.url),'utf8'));
 for(const p of catalog.products)await runtime.db.query('INSERT INTO inventory(product_id,stock,on_request) VALUES($1,$2,$3) ON CONFLICT(product_id) DO NOTHING',[p.id,p.stock,p.onRequest]);
 if(process.argv.includes('--create-admin')){
  const email=process.env.ADMIN_EMAIL,password=process.env.ADMIN_INITIAL_PASSWORD;
  if(!email||!password||password.length<12)throw new Error('Definí ADMIN_EMAIL y ADMIN_INITIAL_PASSWORD (12 caracteres como mínimo) solo en esta terminal.');
  const provisioning=createAuth({database:runtime.db,origin:runtime.origin,secret:process.env.BETTER_AUTH_SECRET,allowProvisioning:true});
  const result=await provisioning.api.signUpEmail({body:{email,password,name:process.env.ADMIN_NAME||'Dharma'}});
  await runtime.db.query('INSERT INTO admin_members(user_id) VALUES($1)',[result.user.id]);
  console.log('Cuenta administradora creada.');
 }
 console.log('Inventario preparado. Las cantidades existentes no se modificaron.');
}finally{await runtime.db.end();}
