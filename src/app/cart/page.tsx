"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCart, updateQuantity, removeFromCart, cartTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { setItems(getCart()); }, []);
  const total = cartTotal(items);
  if (items.length === 0) return (
    <div className="pt-24 pb-16 text-center">
      <h1 className="text-2xl font-bold text-white">Your Cart</h1>
      <p className="mt-4 text-[#a0a0a0]">Your cart is empty.</p>
      <Link href="/shop" className="mt-6 inline-block rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black">Continue Shopping</Link>
    </div>
  );
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white">Your Cart</h1>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item, i) => (
              <div key={i} className="flex gap-6 border-b border-[#2a2a2a] pb-6">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden border border-[#2a2a2a] bg-[#111]">
                  {item.image ? <Image src={item.image} alt={item.name} width={96} height={128} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><span className="text-2xl font-bold text-[#2a2a2a]">{item.name[0]}</span></div>}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                  <p className="mt-1 text-xs text-[#a0a0a0]">{item.size} / {item.color}</p>
                  <p className="mt-1 text-sm text-[#d4af37]">{formatPrice(item.price)}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <button onClick={() => { updateQuantity(item.productId, item.size, item.color, item.quantity - 1); setItems(getCart()); }} className="h-8 w-8 rounded border border-[#2a2a2a] text-white">-</button>
                    <span className="w-8 text-center text-sm text-white">{item.quantity}</span>
                    <button onClick={() => { updateQuantity(item.productId, item.size, item.color, item.quantity + 1); setItems(getCart()); }} className="h-8 w-8 rounded border border-[#2a2a2a] text-white">+</button>
                    <button onClick={() => { removeFromCart(item.productId, item.size, item.color); setItems(getCart()); }} className="ml-4 text-xs uppercase tracking-widest text-[#a0a0a0] hover:text-red-500">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-md border border-[#2a2a2a] bg-[#111] p-6 h-fit">
            <h3 className="text-lg font-semibold text-white">Order Summary</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-[#a0a0a0]"><span>Items</span><span>{items.reduce((s, i) => s + i.quantity, 0)}</span></div>
              <div className="flex justify-between text-[#a0a0a0]"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between text-[#a0a0a0]"><span>Shipping</span><span>Free</span></div>
              <div className="border-t border-[#2a2a2a] pt-2 flex justify-between text-white font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <Link href="/checkout" className="mt-6 block w-full rounded-md bg-[#d4af37] py-3 text-center text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Checkout</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
