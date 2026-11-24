// Los precios, variantes y existencias siempre salen del catálogo actual.
export const STORAGE_KEY = 'dharma-cart-v1';
export const formatPrice = value => `${new Intl.NumberFormat('es-PY').format(value)} Gs.`;
export const canOrder = product => product.stock === null || product.stock > 0;
export const lineKey = item => `${item.id}::${item.variantId || ''}`;
export const sizeText = product => `${product.sizeLabel || 'Talla'} ${product.size}`;
export function resolveItem(product, variantId) {
  if (!product || !canOrder(product)) return null;
  const variant = product.variants?.find(v => v.id === (variantId || product.variants[0].id));
  if (product.variants?.length && !variant) return null;
  if (!product.variants?.length && variantId) return null;
  return {...product, variantId: variant?.id || '', optionLabel: variant?.label || '',
    price: variant?.price ?? product.price, units: variant?.units || 1,
    image: variant?.image || product.image};
}
export function normalizeCart(value, products) {
  if (!Array.isArray(value)) return [];
  const result = []; const used = new Map();
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const product = products.find(p => p.id === item.id);
    const resolved = resolveItem(product, item.variantId);
    const qty = Number(item.qty);
    if (!resolved || !Number.isSafeInteger(qty) || qty < 1) continue;
    const existing = result.find(p => lineKey(p) === lineKey(resolved));
    // null = cantidad aún no confirmada; 99 es un límite de consulta, no stock.
    const remaining = product.stock === null ? 99 : Math.floor((product.stock - (used.get(product.id) || 0)) / resolved.units);
    const allowed = Math.min(qty, remaining, 99 - (existing?.qty || 0));
    if (allowed < 1) continue;
    used.set(product.id, (used.get(product.id) || 0) + allowed * resolved.units);
    if (existing) existing.qty += allowed;
    else result.push({...resolved, qty: allowed});
  }
  return Number.isSafeInteger(getTotal(result)) ? result : [];
}
export function canIncrease(item, cart) {
  if (item.qty >= 99) return false;
  if (item.stock === null) return true;
  const used = cart.filter(p => p.id === item.id).reduce((sum,p) => sum + p.qty * p.units,0);
  return used + item.units <= item.stock;
}
export function readCart(storage, products) {
  try { return normalizeCart(JSON.parse(storage.getItem(STORAGE_KEY)), products); }
  catch { return []; }
}
export function saveCart(storage, cart) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(cart.map(({id,variantId,qty}) => ({id,variantId,qty})))); return true; }
  catch { return false; }
}
export const getTotal = cart => cart.reduce((sum,p) => sum + p.price*p.qty,0);
export const getCount = cart => cart.reduce((sum,p) => sum + p.qty*(p.units || 1),0);
export function buildOrderMessage(cart, delivery='A coordinar') {
  if (!cart.length) return '';
  return [
    'Hola Dharma, quiero consultar disponibilidad y coordinar este pedido:', '',
    ...cart.map(p => `• ${p.name}${p.optionLabel ? ` — ${p.optionLabel}` : ''} — ${sizeText(p)} × ${p.qty}: ${formatPrice(p.price*p.qty)}`), '',
    `Subtotal de productos: ${formatPrice(getTotal(cart))}`,
    `Entrega: ${delivery}.`,
    'Envío: a cotizar. Disponibilidad y total final a confirmar.',
    'Para encomienda, el pago se coordina antes del envío.', '',
    '¿Podemos coordinar?'
  ].join('\n');
}
export function buildRequestMessage(product) {
  return `Hola Dharma, quiero consultar por encargo el ${product.name}, ${sizeText(product)}. Vi el precio de referencia de ${formatPrice(product.price)}. ¿Me confirman el precio final, la disponibilidad para traerlo y el plazo estimado?`;
}
export const whatsappUrl = (number,message) => `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
