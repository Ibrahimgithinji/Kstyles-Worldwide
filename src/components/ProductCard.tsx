import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
export default function ProductCard({ product }: { product: any }) {
  const p = product;
  return (
    <Link href={'/shop/' + p.id} className='group'>
      <div className='aspect-[3/4] flex items-center justify-center bg-[#111] border border-[#2a2a2a] group-hover:border-[#d4af37] transition-colors'>
        <span className='text-6xl font-bold text-[#2a2a2a]'>{p.name[0]}</span>
      </div>
      <div className='mt-4'>
        <p className='text-xs uppercase tracking-widest text-[#a0a0a0]'>{p.category}</p>
        <h3 className='mt-1 text-sm font-semibold text-white'>{p.name}</h3>
        <p className='mt-1 text-sm text-[#d4af37]'>{formatPrice(p.price)}</p>
      </div>
    </Link>
  );
}
