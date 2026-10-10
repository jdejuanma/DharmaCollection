// Adaptado del carrito de Fastysport: los datos comerciales siempre salen del catálogo actual.
export const STORAGE_KEY = 'dharma-cart-v1';
export const formatPrice = value => `${new Intl.NumberFormat('es-PY').format(value)} Gs.`;
export function normalizeCart(value, products) {
  if (!Array.isArray(value)) return [];
  const result = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const product = products.find(p => p.id === item.id);
    const qty = Number(item.qty);
    if (!product || product.stock < 1 || !Number.isSafeInteger(qty) || qty < 1) continue;
    const existing = result.find(p => p.id === product.id);
    const allowed = Math.min(product.stock, qty + (existing?.qty || 0));
    if (existing) existing.qty = allowed;
    else result.push({...product, qty: allowed});
  }
  return Number.isSafeInteger(getTotal(result)) ? result : [];
}
export function readCart(storage, products) {
  try { return normalizeCart(JSON.parse(storage.getItem(STORAGE_KEY)), products); }
  catch { return []; }
}
export function saveCart(storage, cart) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(cart.map(({id,qty}) => ({id,qty})))); return true; }
  catch { return false; }
}
export const getTotal = cart => cart.reduce((sum,p) => sum + p.price*p.qty,0);
export const getCount = cart => cart.reduce((sum,p) => sum + p.qty,0);
export function buildOrderMessage(cart, delivery='A coordinar') {
  if (!cart.length) return '';
  return [
    'Hola Dharma, quiero consultar disponibilidad y coordinar este pedido:', '',
    ...cart.map(p => `• ${p.name} — talla ${p.size.toLowerCase()} × ${p.qty}: ${formatPrice(p.price*p.qty)}`), '',
    `Subtotal de productos: ${formatPrice(getTotal(cart))}`,
    `Entrega: ${delivery}.`,
    'Envío: a cotizar. Disponibilidad y total final a confirmar.',
    'Para encomienda, el pago se coordina antes del envío.', '',
    '¿Podemos coordinar?'
  ].join('\n');
}
export function buildRequestMessage(product) {
  return `Hola Dharma, quiero consultar por encargo el ${product.name}, talla ${product.size.toLowerCase()}. Vi el precio de referencia de ${formatPrice(product.price)}. ¿Me confirman el precio final, la disponibilidad para traerlo y el plazo estimado?`;
}
export const whatsappUrl = (number,message) => `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
