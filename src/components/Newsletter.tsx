"use client";
export default function Newsletter() {
  return (
    <section className='bg-[#111] py-24'>
      <div className='mx-auto max-w-2xl px-4 text-center sm:px-6'>
        <h2 className='text-3xl font-bold text-white'>Stay in the Loop</h2>
        <p className='mt-2 text-[#a0a0a0]'>Be the first to know about drops, restocks, and exclusive offers.</p>
        <form className='mt-8 flex gap-4' onSubmit={e => e.preventDefault()}>
          <input type='email' placeholder='Enter your email' className='flex-1 rounded-md border border-[#2a2a2a] bg-black px-4 py-3 text-sm text-white placeholder-[#a0a0a0] focus:border-[#d4af37] focus:outline-none' required />
          <button type='submit' className='rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors'>Subscribe</button>
        </form>
      </div>
    </section>
  );
}
