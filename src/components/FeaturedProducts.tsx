import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
export default function FeaturedProducts({ products }: { products: any[] }) {
  const featured = products.filter(p => p.featured);
  return (
    <section className='py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex items-end justify-between'>
          <div>
            <h2 className='text-3xl font-bold text-white'>Featured</h2>
            <p className='mt-2 text-[#a0a0a0]'>Curated picks from our latest drops.</p>
          </div>
          <Link href='/shop' className='text-sm uppercase tracking-widest text-[#d4af37] hover:text-[#b8960f]'>View All</Link>
        </div>
        <div className='mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {featured.map(p => (
            <Link key={p.id} href={'/shop/' + p.id} className='group'>
              <div className='aspect-[3/4] flex items-center justify-center bg-[#111] border border-[#2a2a2a] group-hover:border-[#d4af37] transition-colors'>
                <span className='text-6xl font-bold text-[#2a2a2a]'>{p.name[0]}</span>
              </div>
              <div className='mt-4'>
                <p className='text-xs uppercase tracking-widest text-[#a0a0a0]'>{p.category}</p>
                <h3 className='mt-1 text-sm font-semibold text-white'>{p.name}</h3>
                <p className='mt-1 text-sm text-[#d4af37]'>{formatPrice(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
