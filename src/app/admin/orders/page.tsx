export default function AdminOrders() {
  const orders = [
    { id: "#1001", customer: "Marcus J.", status: "Shipped", total: "$289", date: "2025-12-20" },
    { id: "#1002", customer: "Sarah K.", status: "Processing", total: "$149", date: "2025-12-19" },
    { id: "#1003", customer: "David L.", status: "Pending", total: "$459", date: "2025-12-18" },
    { id: "#1004", customer: "Amara T.", status: "Delivered", total: "$179", date: "2025-12-15" },
    { id: "#1005", customer: "James R.", status: "Shipped", total: "$398", date: "2025-12-14" },
  ];
  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Orders</h1>
      <table className="mt-8 w-full text-left text-sm">
        <thead className="border-b border-[#2a2a2a] text-[#a0a0a0]">
          <tr><th className="pb-3 pr-4 font-medium">Order ID</th><th className="pb-3 pr-4 font-medium">Customer</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 pr-4 font-medium">Total</th><th className="pb-3 font-medium">Date</th></tr>
        </thead>
        <tbody className="text-white">
          {orders.map((o, i) => (
            <tr key={i} className="border-b border-[#2a2a2a]">
              <td className="py-3 pr-4">{o.id}</td>
              <td className="py-3 pr-4">{o.customer}</td>
              <td className="py-3 pr-4 text-[#d4af37]">{o.status}</td>
              <td className="py-3 pr-4">{o.total}</td>
              <td className="py-3 text-[#a0a0a0]">{o.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
