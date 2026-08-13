import Link from "next/link";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/designs", label: "Designs" },
    { href: "/admin/orders", label: "Orders" },
  ];
  return (
    <div className="flex min-h-screen pt-16">
      <aside className="w-64 border-r border-[#2a2a2a] bg-black p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#d4af37]">Admin</h2>
        <nav className="mt-8 flex flex-col gap-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-sm text-[#a0a0a0] hover:text-white transition-colors">{l.label}</Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 bg-[#0a0a0a] p-8">{children}</div>
    </div>
  );
}
