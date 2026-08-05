"use client";
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem("kstyles_cart") || "[]"); }
  catch { return []; }
}
export function saveCart(items: CartItem[]) {
  localStorage.setItem("kstyles_cart", JSON.stringify(items));
  if (typeof window !== "undefined") window.dispatchEvent(new Event("cart-updated"));
}
export function addToCart(item: CartItem) {
  const cart = getCart();
  const existing = cart.find(i => i.productId === item.productId && i.size === item.size && i.color === item.color);
  if (existing) existing.quantity += item.quantity;
  else cart.push(item);
  saveCart(cart);
}
export function updateQuantity(productId: string, size: string, color: string, quantity: number) {
  const cart = getCart();
  const item = cart.find(i => i.productId === productId && i.size === size && i.color === color);
  if (item) { item.quantity = quantity; if (item.quantity <= 0) removeFromCart(productId, size, color); else saveCart(cart); }
}
export function removeFromCart(productId: string, size: string, color: string) {
  saveCart(getCart().filter(i => !(i.productId === productId && i.size === size && i.color === color)));
}
export function clearCart() { saveCart([]); }
export function cartTotal(cart: CartItem[]) {
  return cart.reduce((s, i) => s + i.price * i.quantity, 0);
}
