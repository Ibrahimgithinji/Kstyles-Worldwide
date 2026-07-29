"use client";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { products } from "@/lib/data";
export default function CheckoutPage() {
  const total = products[0].price + products[1].price;
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white">Checkout</h1>
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <form onSubmit={e => { e.preventDefault(); alert("Order placed!"); }} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="block text-sm font-semibold text-white">First Name</label><input required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold text-white">Last Name</label><input required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
            </div>
            <div><label className="block text-sm font-semibold text-white">Email</label><input type="email" required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
            <div><label className="block text-sm font-semibold text-white">Address</label><input required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="block text-sm font-semibold text-white">City</label><input required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold text-white">ZIP</label><input required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
              <div><label className="block text-sm font-semibold text-white">Country</label><select required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none"><option>US</option><option>UK</option><option>CA</option></select></div>
            </div>
            <button type="submit" className="w-full rounded-md bg-[#d4af37] py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Place Order</button>
          </form>
          <div className="rounded-md border border-[#2a2a2a] bg-[#111] p-6 h-fit">
            <h3 className="text-lg font-semibold text-white">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {products.slice(0, 2).map((p, i) => (
                <div key={i} className="flex gap-4"><div className="h-16 w-16 flex-shrink-0 bg-black border border-[#2a2a2a] flex items-center justify-center"><span className="font-bold text-[#2a2a2a]">{p.name[0]}</span></div><div><p className="text-sm text-white">{p.name}</p><p className="text-sm text-[#d4af37]">{formatPrice(p.price)}</p></div></div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-[#2a2a2a] pt-4 text-sm">
              <div className="flex justify-between text-[#a0a0a0]"><span>Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between text-[#a0a0a0]"><span>Shipping</span><span>Free</span></div>
              <div className="flex justify-between text-white font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
