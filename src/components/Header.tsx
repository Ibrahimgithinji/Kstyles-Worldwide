"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCart } from "@/lib/cart";
import { fetchUser, logout, AuthUser } from "@/lib/auth-client";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/designs", label: "Designs" },
  { href: "/collections", label: "Collections" },
  { href: "/blog", label: "Blog" },
];

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h2l.6 3m0 0L7 14a2 2 0 0 0 2 1.7h7.5A2 2 0 0 0 18.5 14l1.5-8H5.6Z" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const updateCount = () => setCount(getCart().reduce((s, i) => s + i.quantity, 0));
    const updateUser = () => {
      fetchUser().then(setUser).catch(() => setUser(null));
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

  useEffect(() => {
    setUserMenu(false);
    setOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    setUser(null);
    setUserMenu(false);
  }

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const initials = user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "";

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? "border-b border-[#2a2a2a] bg-black/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)]" : "border-b border-transparent bg-black/40 backdrop-blur-sm"}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Brand */}
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-gradient-to-br from-[#f0d060] via-[#d4af37] to-[#8a6d1a] shadow-[0_0_20px_rgba(212,175,55,0.35)]">
            <span className="text-sm font-black tracking-tighter text-black">K</span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-[0.22em] text-white">KSTYLES</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.4em] text-[#d4af37]">Worldwide</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-9 md:flex">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`group relative text-[13px] font-medium uppercase tracking-[0.18em] transition-colors duration-200 ${isActive(l.href) ? "text-[#d4af37]" : "text-[#c9c9c9] hover:text-white"}`}>
              {l.label}
              <span className={`absolute -bottom-2 left-0 h-[2px] rounded-full bg-gradient-to-r from-[#d4af37] to-[#f0d060] transition-all duration-300 ${isActive(l.href) ? "w-full" : "w-0 group-hover:w-full"}`} />
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart */}
          <Link href="/cart" className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#111] text-[#c9c9c9] transition-all hover:border-[#d4af37] hover:text-[#d4af37]" aria-label="Cart">
            <CartIcon />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d4af37] px-1 text-[10px] font-bold text-black shadow-[0_0_10px_rgba(212,175,55,0.6)]">{count}</span>
            )}
          </Link>

          {/* Account */}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenu(!userMenu)} className="flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#111] py-1 pl-1 pr-3 transition-all hover:border-[#d4af37]" aria-label="Account">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-xs font-bold text-[#d4af37]">{initials}</span>
                <span className="hidden text-xs font-medium text-white sm:block">{user.name.split(" ")[0]}</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={`text-[#a0a0a0] transition-transform ${userMenu ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
              </button>
              {userMenu && (
                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-xl border border-[#2a2a2a] bg-[#0d0d0d] shadow-2xl">
                  <div className="border-b border-[#2a2a2a] px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                    <p className="truncate text-xs text-[#a0a0a0]">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    {user.role === "admin" && (
                      <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#c9c9c9] transition-colors hover:bg-[#1a1a1a] hover:text-[#d4af37]">
                        <UserIcon /> Admin Dashboard
                      </Link>
                    )}
                    <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#c9c9c9] transition-colors hover:bg-[#1a1a1a] hover:text-[#d4af37]">
                      <UserIcon /> My Account
                    </Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M15 12h8m0 0-3-3m3 3-3 3M10 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth/login" className="group relative hidden overflow-hidden rounded-full bg-[#d4af37] px-6 py-2.5 text-[13px] font-semibold uppercase tracking-widest text-black transition-all hover:bg-[#f0d060] hover:shadow-[0_0_24px_rgba(212,175,55,0.45)] sm:block">
              Sign In
            </Link>
          )}

          {/* Mobile burger */}
          <button onClick={() => setOpen(!open)} className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden" aria-label="Menu">
            <span className={`block h-[2px] w-6 rounded-full bg-white transition-all duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
            <span className={`block h-[2px] w-6 rounded-full bg-white transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-[2px] w-6 rounded-full bg-white transition-all duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`overflow-hidden border-t border-[#2a2a2a] bg-black/95 backdrop-blur-xl transition-all duration-300 md:hidden ${open ? "max-h-96" : "max-h-0 border-t-0"}`}>
        <nav className="flex flex-col gap-1 px-4 py-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`rounded-lg px-3 py-3 text-sm font-medium uppercase tracking-widest transition-colors ${isActive(l.href) ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-[#c9c9c9] hover:bg-white/5 hover:text-white"}`}>
              {l.label}
            </Link>
          ))}
          {!user && (
            <Link href="/auth/login" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-[#d4af37] px-6 py-3 text-center text-sm font-semibold uppercase tracking-widest text-black">
              Sign In
            </Link>
          )}
          {user && (
            <button onClick={() => { handleLogout(); setOpen(false); }} className="mt-2 rounded-lg px-3 py-3 text-left text-sm font-medium uppercase tracking-widest text-red-400">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}