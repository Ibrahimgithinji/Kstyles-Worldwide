import Link from 'next/link';
export default function Footer() {
  return (
    <footer className='border-t border-[#2a2a2a] bg-black'>
      <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
        <div className='grid gap-8 md:grid-cols-4'>
          <div>
            <h3 className='text-lg font-bold tracking-wider text-white'>KSTYLES</h3>
            <p className='mt-2 text-sm text-[#a0a0a0]'>Luxury streetwear redefined.</p>
          </div>
          <div>
            <h4 className='mb-3 text-sm font-semibold uppercase tracking-widest text-white'>Shop</h4>
            <div className='flex flex-col gap-2 text-sm text-[#a0a0a0]'>
              <Link href='/shop' className='hover:text-[#d4af37] transition-colors'>All</Link>
              <Link href='/shop' className='hover:text-[#d4af37] transition-colors'>Outerwear</Link>
              <Link href='/shop' className='hover:text-[#d4af37] transition-colors'>Bottoms</Link>
            </div>
          </div>
          <div>
            <h4 className='mb-3 text-sm font-semibold uppercase tracking-widest text-white'>Support</h4>
            <div className='flex flex-col gap-2 text-sm text-[#a0a0a0]'>
              <Link href='/contact' className='hover:text-[#d4af37] transition-colors'>Contact</Link>
              <Link href='/faq' className='hover:text-[#d4af37] transition-colors'>FAQ</Link>
              <Link href='/shipping' className='hover:text-[#d4af37] transition-colors'>Shipping</Link>
            </div>
          </div>
          <div>
            <h4 className='mb-3 text-sm font-semibold uppercase tracking-widest text-white'>Company</h4>
            <div className='flex flex-col gap-2 text-sm text-[#a0a0a0]'>
              <Link href='/about' className='hover:text-[#d4af37] transition-colors'>About</Link>
              <Link href='/blog' className='hover:text-[#d4af37] transition-colors'>Blog</Link>
            </div>
          </div>
        </div>
        <div className='mt-12 border-t border-[#2a2a2a] pt-8 text-center text-sm text-[#a0a0a0]'>
          <p>&copy; {new Date().getFullYear()} Kstyles Worldwide. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
