export class InventoryError extends Error {
  constructor(message,status=400){super(message);this.status=status;}
}
export function validateChange(value,products){
  if(!value||!products.some(p=>p.id===value.id))throw new InventoryError('Producto desconocido.');
  if(value.stock!==null&&(!Number.isSafeInteger(value.stock)||value.stock<0||value.stock>100000))throw new InventoryError('Ingresá una cantidad entera entre 0 y 100.000.');
  if(typeof value.onRequest!=='boolean'||!Number.isSafeInteger(value.version)||value.version<0)throw new InventoryError('La versión o disponibilidad no es válida.');
  if(!['venta','reposicion','correccion'].includes(value.reason))throw new InventoryError('Indicá el motivo del cambio.');
  return {id:value.id,stock:value.stock,onRequest:value.onRequest,version:value.version,reason:value.reason};
}
export function inventoryRepository(db){
  return {
    async list(){return (await db.query('SELECT product_id AS id, stock, on_request AS "onRequest", version, updated_at AS "updatedAt" FROM inventory ORDER BY product_id')).rows;},
    async isAdmin(userId){return (await db.query('SELECT user_id FROM admin_members WHERE user_id = $1',[userId])).rows.length===1;},
    async history(){return (await db.query('SELECT id, product_id AS "productId", old_stock AS "oldStock", new_stock AS "newStock", on_request AS "onRequest", reason, actor_name AS "actorName", created_at AS "createdAt" FROM inventory_movements ORDER BY id DESC LIMIT 50')).rows;},
    async change(input,user){
      const result=await db.query(`WITH prior AS (
        SELECT * FROM inventory WHERE product_id=$1 FOR UPDATE
      ), changed AS (
        UPDATE inventory i SET stock=$2, on_request=$3, version=i.version+1, updated_at=NOW()
        FROM prior p WHERE i.product_id=p.product_id AND i.version=$4
        RETURNING i.product_id, i.stock, i.on_request, i.version, i.updated_at, p.stock AS old_stock
      ), logged AS (
        INSERT INTO inventory_movements(product_id,old_stock,new_stock,on_request,reason,actor_id,actor_name)
        SELECT product_id,old_stock,stock,on_request,$5,$6,$7 FROM changed RETURNING id
      ) SELECT product_id AS id, stock, on_request AS "onRequest", version, updated_at AS "updatedAt" FROM changed`,
      [input.id,input.stock,input.onRequest,input.version,input.reason,user.id,user.name||'Administración']);
      if(!result.rows.length)throw new InventoryError('Otra persona actualizó este producto. Recargá el inventario antes de guardar.',409);
      return result.rows[0];
    }
  };
}
export function applyInventory(catalog,rows,{unavailable=false}={}){
  const store=structuredClone(catalog);
  for(const p of store.products){
    const row=rows.find(r=>r.id===p.id);
    if(unavailable||!row){p.stock=null;continue;}
    p.stock=row.stock;p.onRequest=row.onRequest;
  }
  return store;
}
