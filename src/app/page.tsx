import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import CatalogSections from "@/components/CatalogSections";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <CatalogSections />
      <Testimonials />
      <Newsletter />
    </>
  );
}
