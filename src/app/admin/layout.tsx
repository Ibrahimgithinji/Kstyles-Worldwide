import Link from "next/link";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/designs", label: "Designs" },
    { href: "/admin/orders", label: "Orders" },
  ];
  return (
    <div className="flex min-h-screen flex-col pt-16 md:flex-row">
      <aside className="border-b border-[#2a2a2a] bg-black px-4 py-3 md:w-64 md:min-h-[calc(100vh-4rem)] md:border-r md:border-b-0 md:p-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-[#d4af37]">Admin</h2>
        <nav className="mt-2 flex gap-1 overflow-x-auto md:mt-8 md:flex-col md:gap-4 md:overflow-visible">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-[#a0a0a0] transition-colors hover:bg-[#1a1a1a] hover:text-white md:rounded-none md:px-0 md:py-0 md:hover:bg-transparent md:hover:text-[#d4af37]">{l.label}</Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 bg-[#0a0a0a] p-4 md:p-8">{children}</div>
    </div>
  );
}
