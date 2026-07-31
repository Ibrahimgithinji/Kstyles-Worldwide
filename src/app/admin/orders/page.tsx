"use client";
import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth-client";
import { formatPrice } from "@/lib/utils";
export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  async function load() {
    const res = await fetch("/api/admin/orders", { headers: getAuthHeaders() });
    if (res.ok) { const d = await res.json(); setOrders(d.orders); }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function updateStatus(orderId: string, status: string) {
    await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json", ...getAuthHeaders() }, body: JSON.stringify({ orderId, status }) });
    load();
  }
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Orders</h1>
      {loading ? <p className="mt-8 text-[#a0a0a0]">Loading...</p> : orders.length === 0 ? <p className="mt-8 text-[#a0a0a0]">No orders yet.</p> : (
        <table className="mt-8 w-full text-left text-sm">
          <thead className="border-b border-[#2a2a2a] text-[#a0a0a0]">
            <tr><th className="pb-3 pr-4 font-medium">Order ID</th><th className="pb-3 pr-4 font-medium">Customer</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 pr-4 font-medium">Total</th><th className="pb-3 font-medium">Date</th></tr>
          </thead>
          <tbody className="text-white">
            {orders.map(o => (
              <tr key={o.id} className="border-b border-[#2a2a2a]">
                <td className="py-3 pr-4">{o.id.slice(0, 8)}</td>
                <td className="py-3 pr-4">{o.firstName} {o.lastName}</td>
                <td className="py-3 pr-4">
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="rounded border border-[#2a2a2a] bg-black px-2 py-1 text-sm text-white">
                    <option>pending</option><option>processing</option><option>shipped</option><option>delivered</option><option>cancelled</option>
                  </select>
                </td>
                <td className="py-3 pr-4">{formatPrice(o.total)}</td>
                <td className="py-3 text-[#a0a0a0]">{o.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
