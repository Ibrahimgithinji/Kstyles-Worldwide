export default function AdminDashboard() {
  const stats = [
    { label: "Total Products", value: "156" },
    { label: "Total Orders", value: "1,247" },
    { label: "Revenue", value: "$89,450" },
    { label: "Visitors", value: "45.2K" },
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
      <table className="mt-4 w-full text-left text-sm">
        <thead className="border-b border-[#2a2a2a] text-[#a0a0a0]">
          <tr><th className="pb-3 pr-4 font-medium">Order</th><th className="pb-3 pr-4 font-medium">Customer</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 font-medium">Total</th></tr>
        </thead>
        <tbody className="text-white">
          {[["#1001", "Marcus J.", "Shipped", "$289"], ["#1002", "Sarah K.", "Processing", "$149"], ["#1003", "David L.", "Pending", "$459"], ["#1004", "Amara T.", "Delivered", "$179"]].map((r, i) => (
            <tr key={i} className="border-b border-[#2a2a2a]"><td className="py-3 pr-4">{r[0]}</td><td className="py-3 pr-4">{r[1]}</td><td className="py-3 pr-4 text-[#d4af37]">{r[2]}</td><td className="py-3">{r[3]}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
