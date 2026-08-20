"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    fetch('/videos/brand.mp4', { method: 'HEAD' })
      .then(r => { if (r.ok) setHasVideo(true); })
      .catch(() => {});
  }, []);

  return (
    <section className='relative flex min-h-screen items-center overflow-hidden'>
      <div className='absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-[#111]' />
      <div className='absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-[#d4af37]/10 blur-3xl' />

      <div className='relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-2 lg:px-8'>
        <div className='text-center lg:text-left'>
          <p className='text-xs font-semibold uppercase tracking-[0.4em] text-[#d4af37]'>Kstyles Worldwide</p>
          <h1 className='mt-4 text-5xl font-bold tracking-tight text-white sm:text-6xl xl:text-7xl'>DEFINE YOUR STYLE</h1>
          <p className='mx-auto mt-6 max-w-xl text-lg text-[#a0a0a0] sm:text-xl lg:mx-0'>
            Luxury streetwear for the modern icon.
          </p>
          <div className='mt-10 flex items-center justify-center gap-4 lg:justify-start'>
            <Link href='/shop' className='rounded-md bg-[#d4af37] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-black transition-colors hover:bg-[#b8960f]'>Shop Collection</Link>
            <Link href='/collections' className='rounded-md border border-[#2a2a2a] px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:border-[#d4af37]'>Explore</Link>
          </div>
        </div>

        <div className='relative mx-auto w-full max-w-md'>
          <div className='overflow-hidden rounded-md border border-[#2a2a2a] bg-black shadow-[0_0_60px_rgba(212,175,55,0.15)]'>
            {hasVideo ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                preload='metadata'
                aria-hidden='true'
                className='hero-media aspect-[3/4] w-full object-cover'
              >
                <source src='/videos/brand.mp4' type='video/mp4' />
              </video>
            ) : (
              <img
                src='/images/hero.jpg'
                alt='K Styles — luxury streetwear'
                className='hero-media aspect-[3/4] w-full object-cover object-top'
              />
            )}
          </div>
          <div className='pointer-events-none absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-md border border-[#d4af37]/30' />
        </div>
      </div>
    </section>
  );
}