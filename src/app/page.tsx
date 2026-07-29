import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import Newsletter from "@/components/Newsletter";
import { products } from "@/lib/data";
export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts products={products} />
      <Newsletter />
    </>
  );
}
