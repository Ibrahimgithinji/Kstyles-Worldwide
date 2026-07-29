import Link from 'next/link';
export default function Hero() {
  return (
    <section className='relative flex min-h-screen items-center justify-center overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black' />
      <div className='relative z-10 mx-auto max-w-4xl px-4 text-center'>
        <h1 className='text-5xl font-bold tracking-tight text-white sm:text-7xl'>DEFINE YOUR STYLE</h1>
        <p className='mx-auto mt-6 max-w-2xl text-lg text-[#a0a0a0] sm:text-xl'>Luxury streetwear for the modern icon.</p>
        <div className='mt-10 flex items-center justify-center gap-4'>
          <Link href='/shop' className='rounded-md bg-[#d4af37] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-[#b8960f]'>Shop Collection</Link>
          <Link href='/collections' className='rounded-md border border-[#2a2a2a] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:border-[#d4af37]'>Explore</Link>
        </div>
      </div>
    </section>
  );
}
