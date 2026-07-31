"use client";
import { useEffect, useState } from "react";
import { getAuthHeaders } from "@/lib/auth-client";
import { formatPrice } from "@/lib/utils";
export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/admin/orders", { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : null).then(d => d && setOrders(d.orders));
    fetch("/api/admin/products", { headers: getAuthHeaders() }).then(r => r.ok ? r.json() : null).then(d => d && setProducts(d.products));
  }, []);
  const revenue = orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const stats = [
    { label: "Total Products", value: String(products.length) },
    { label: "Total Orders", value: String(orders.length) },
    { label: "Revenue", value: formatPrice(revenue) },
    { label: "Pending Orders", value: String(orders.filter(o => o.status === "pending").length) },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.label} className="rounded-md border border-[#2a2a2a] bg-[#111] p-6">
            <p className="text-sm text-[#a0a0a0]">{s.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-12 text-lg font-semibold text-white">Recent Orders</h2>
      {orders.length === 0 ? <p className="mt-4 text-[#a0a0a0]">No orders yet.</p> : (
        <table className="mt-4 w-full text-left text-sm">
          <thead className="border-b border-[#2a2a2a] text-[#a0a0a0]">
            <tr><th className="pb-3 pr-4 font-medium">Order</th><th className="pb-3 pr-4 font-medium">Customer</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 font-medium">Total</th></tr>
          </thead>
          <tbody className="text-white">
            {orders.slice(0, 5).map(o => (
              <tr key={o.id} className="border-b border-[#2a2a2a]"><td className="py-3 pr-4">{o.id.slice(0, 8)}</td><td className="py-3 pr-4">{o.firstName} {o.lastName}</td><td className="py-3 pr-4 text-[#d4af37]">{o.status}</td><td className="py-3">{formatPrice(o.total)}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
