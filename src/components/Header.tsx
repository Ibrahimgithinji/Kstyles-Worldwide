"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/cart";
import { fetchUser, clearToken, getToken, AuthUser } from "@/lib/auth-client";
const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/blog", label: "Blog" },
];
export default function Header() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    const updateCount = () => setCount(getCart().reduce((s, i) => s + i.quantity, 0));
    const updateUser = () => {
      if (getToken()) fetchUser().then(setUser).catch(() => setUser(null));
      else setUser(null);
    };
    updateCount();
    updateUser();
    window.addEventListener("cart-updated", updateCount);
    window.addEventListener("storage", updateCount);
    window.addEventListener("auth-updated", updateUser);
    window.addEventListener("storage", updateUser);
    return () => {
      window.removeEventListener("cart-updated", updateCount);
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("auth-updated", updateUser);
      window.removeEventListener("storage", updateUser);
    };
  }, []);
  function handleLogout() {
    clearToken();
    setUser(null);
  }
  return (
    <header className="fixed top-0 z-50 w-full border-b border-[#2a2a2a] bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-wider text-white">KSTYLES</Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-sm uppercase tracking-widest text-[#a0a0a0] hover:text-[#d4af37] transition-colors">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/cart" className="text-sm uppercase tracking-widest text-[#a0a0a0] hover:text-[#d4af37] transition-colors">Cart (${count})</Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href={user.role === "admin" ? "/admin" : "/"} className="hidden text-sm uppercase tracking-widest text-[#d4af37] hover:text-[#b8960f] transition-colors md:block">{user.name}</Link>
              <button onClick={handleLogout} className="hidden text-sm uppercase tracking-widest text-[#a0a0a0] hover:text-red-400 transition-colors md:block">Logout</button>
            </div>
          ) : (
            <Link href="/auth/login" className="hidden text-sm uppercase tracking-widest text-[#a0a0a0] hover:text-[#d4af37] transition-colors md:block">Sign In</Link>
          )}
          <button onClick={() => setOpen(!open)} className="flex flex-col gap-1 md:hidden" aria-label="Menu">
            <span className="block h-[1px] w-5 bg-white" />
            <span className="block h-[1px] w-5 bg-white" />
            <span className="block h-[1px] w-5 bg-white" />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-[#2a2a2a] bg-black md:hidden">
          <div className="flex flex-col gap-4 px-4 py-6">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="text-sm uppercase tracking-widest text-[#a0a0a0] hover:text-[#d4af37]" onClick={() => setOpen(false)}>{l.label}</Link>
            ))}
            {user ? (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/"} className="text-sm uppercase tracking-widest text-[#d4af37]" onClick={() => setOpen(false)}>{user.name}</Link>
                <button onClick={() => { handleLogout(); setOpen(false); }} className="text-left text-sm uppercase tracking-widest text-[#a0a0a0] hover:text-red-400">Logout</button>
              </>
            ) : (
              <Link href="/auth/login" className="text-sm uppercase tracking-widest text-[#a0a0a0] hover:text-[#d4af37]" onClick={() => setOpen(false)}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
