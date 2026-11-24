import {Pool} from 'pg';
import {createAuth} from './auth.mjs';
import {inventoryRepository} from './inventory.mjs';
let runtime;
export function getRuntime(){
  if(runtime)return runtime;
  const {DATABASE_URL,BETTER_AUTH_URL,BETTER_AUTH_SECRET,INVENTORY_MODE}=process.env;
  if(INVENTORY_MODE!=='database'||!DATABASE_URL||!BETTER_AUTH_URL||!BETTER_AUTH_SECRET)return null;
  const origin=new URL(BETTER_AUTH_URL).origin;
  if(!origin.startsWith('https://')&&process.env.NODE_ENV==='production')throw new Error('Se requiere HTTPS.');
  const db=new Pool({connectionString:DATABASE_URL,max:3,idleTimeoutMillis:10000,connectionTimeoutMillis:5000});
  runtime={db,origin,auth:createAuth({database:db,origin,secret:BETTER_AUTH_SECRET}),inventory:inventoryRepository(db)};
  return runtime;
}
