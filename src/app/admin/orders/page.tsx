"use client";
import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth-client";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface OrderItem { id: string; name: string; quantity: number; size: string; color: string; price: number; image: string; }
interface Order { id: string; firstName: string; lastName: string; email: string; status: string; total: number; createdAt: string; items: OrderItem[]; }

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/orders", { headers: getAuthHeaders() });
    if (res.ok) { const d = await res.json(); setOrders(d.orders); }
    else setDenied(true);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(orderId: string, status: string) {
    await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json", ...getAuthHeaders() }, body: JSON.stringify({ orderId, status }) });
    load();
  }

  if (denied) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold text-white">Admin access required</h1>
      <p className="mt-2 text-[#a0a0a0]">Please sign in with an admin account to manage orders.</p>
      <Link href="/auth/login" className="mt-6 rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Sign In</Link>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Orders</h1>
      <p className="mt-1 text-sm text-[#a0a0a0]">Each order lists the exact items and photos for dispatch.</p>
      {loading ? <p className="mt-8 text-[#a0a0a0]">Loading...</p> : orders.length === 0 ? <p className="mt-8 text-[#a0a0a0]">No orders yet.</p> : (
        <table className="mt-8 w-full text-left text-sm">
          <thead className="border-b border-[#2a2a2a] text-[#a0a0a0]">
            <tr><th className="pb-3 pr-4 font-medium">Order ID</th><th className="pb-3 pr-4 font-medium">Customer</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 pr-4 font-medium">Total</th><th className="pb-3 font-medium">Date</th></tr>
          </thead>
          <tbody className="text-white">
            {orders.map(o => (
              <OrderRow key={o.id} order={o} onStatus={s => updateStatus(o.id, s)} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function OrderRow({ order, onStatus }: { order: Order; onStatus: (s: string) => void }) {
  return (
    <>
      <tr className="border-b border-[#2a2a2a]">
        <td className="py-3 pr-4 font-mono text-xs">{order.id.slice(0, 8)}</td>
        <td className="py-3 pr-4"><p>{order.firstName} {order.lastName}</p><p className="text-xs text-[#a0a0a0]">{order.email}</p></td>
        <td className="py-3 pr-4">
          <select value={order.status} onChange={e => onStatus(e.target.value)} className="rounded border border-[#2a2a2a] bg-black px-2 py-1 text-sm text-white">
            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </td>
        <td className="py-3 pr-4">{formatPrice(order.total)}</td>
        <td className="py-3 text-[#a0a0a0]">{order.createdAt}</td>
      </tr>
      <tr className="border-b border-[#2a2a2a] bg-[#111]">
        <td colSpan={5} className="px-4 py-3">
          {order.items.length === 0 ? (
            <p className="text-[#a0a0a0]">No items recorded for this order.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {order.items.map(it => (
                <div key={it.id} className="flex items-center gap-3 rounded-md border border-[#2a2a2a] bg-black p-2.5">
                  <div className="h-16 w-14 shrink-0 overflow-hidden rounded bg-[#111]">
                    {it.image ? <img src={it.image} alt={it.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><span className="text-lg font-bold text-[#2a2a2a]">{it.name[0]}</span></div>}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{it.name}</p>
                    <p className="text-xs text-[#a0a0a0]">{it.size}{it.color ? ` · ${it.color}` : ""} · ×{it.quantity}</p>
                    <p className="text-xs text-[#d4af37]">{formatPrice(it.price * it.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </td>
      </tr>
    </>
  );
}
