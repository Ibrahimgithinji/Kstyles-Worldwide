import Link from 'next/link';
import fs from 'fs';
import path from 'path';

export default function Hero() {
  let hasVideo = false;
  try {
    hasVideo = fs.existsSync(path.join(process.cwd(), 'public', 'videos', 'brand.mp4'));
  } catch {}

  return (
    <section className='relative flex min-h-screen items-center justify-center overflow-hidden'>
      <div className='absolute inset-0'>
        {hasVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload='metadata'
            aria-hidden='true'
            className='h-full w-full object-cover object-[50%_15%]'
          >
            <source src='/videos/brand.mp4' type='video/mp4' />
          </video>
        ) : (
          <img
            src='/images/hero.jpg'
            alt=''
            aria-hidden='true'
            className='hero-media h-full w-full object-cover object-[50%_15%]'
          />
        )}
      </div>
      <div className='absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black' />
      <div className='relative z-10 mx-auto max-w-4xl px-4 text-center'>
        <p className='text-xs font-semibold uppercase tracking-[0.4em] text-[#d4af37]'>Kstyles Worldwide</p>
        <h1 className='mt-4 text-5xl font-bold tracking-tight text-white sm:text-7xl'>DEFINE YOUR STYLE</h1>
        <p className='mx-auto mt-6 max-w-2xl text-lg text-[#a0a0a0] sm:text-xl'>Luxury streetwear for the modern icon.</p>
        <div className='mt-10 flex items-center justify-center gap-4'>
          <Link href='/shop' className='rounded-md bg-[#d4af37] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-[#b8960f]'>Shop Collection</Link>
          <Link href='/collections' className='rounded-md border border-[#2a2a2a] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:border-[#d4af37]'>Explore</Link>
        </div>
      </div>
    </section>
  );
}
