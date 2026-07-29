"use client";
export default function ContactPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">Contact</h1>
        <p className="mt-2 text-[#a0a0a0]">Get in touch with the Kstyles team.</p>
        <form onSubmit={e => { e.preventDefault(); alert("Message sent!"); }} className="mt-12 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="block text-sm font-semibold text-white">First Name</label><input required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
            <div><label className="block text-sm font-semibold text-white">Last Name</label><input required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-white">Email</label><input type="email" required className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <div><label className="block text-sm font-semibold text-white">Message</label><textarea required rows={5} className="mt-1 w-full rounded-md border border-[#2a2a2a] bg-black px-4 py-2 text-sm text-white focus:border-[#d4af37] focus:outline-none" /></div>
          <button type="submit" className="rounded-md bg-[#d4af37] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Send Message</button>
        </form>
      </div>
    </div>
  );
}