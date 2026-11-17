BEGIN;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD';

DELETE FROM public.products
WHERE slug IN (
  'oversized-denim-jacket',
  'signature-hoodie',
  'cargo-pants',
  'leather-bomber-jacket',
  'graphic-tee',
  'wide-leg-trousers',
  'k-styles-jersey',
  'k-styles-custom-jersey',
  'k-styles-signature-jersey',
  'orange-crystal-sweatshirt',
  'crystal-statement-crewneck',
  'crystal-luxe-pullover'
);

INSERT INTO public.products (id, name, slug, description, price, image, category, sizes, colors, featured)
VALUES
  ('catalog-hoodies-heavy-fabric', 'Hoodies (Heavy fabric)', 'hoodies-heavy-fabric', 'Heavy fabric', 3000, '/images/products/hoodie-white.webp', 'hoodies', 'S,M,L,XL', 'White,Black,Red', 1),
  ('catalog-custom-vest-jersey', 'Kstyles Custom Vest Jersey', 'kstyles-custom-vest-jersey', 'Kstyles Custom Vest Jersey', 1800, '/images/products/custom-vest-jersey.webp', 'jerseys', 'S,M,L,XL', 'White / Black', 1),
  ('catalog-custom-crop-jersey', 'Kstyles Custom Crop Jersey', 'kstyles-custom-crop-jersey', 'Kstyles Custom Crop Jersey', 1800, '/images/products/custom-crop-jersey.webp', 'jerseys', 'S,M,L,XL', 'Red / Black', 0),
  ('catalog-custom-bucket-hat', 'Kstyles Custom Bucket Hat', 'kstyles-custom-bucket-hat', 'Kstyles Custom Bucket Hat', 1200, '/images/products/bucket-hat-red.webp', 'headwear', 'One Size', 'Red,Black / Charcoal', 1),
  ('catalog-tees-shirts', 'Tees (Shirts)', 'tees-shirts', 'Tees (Shirts)', 1500, '/images/products/tee-warembo.webp', 'tees', 'S,M,L,XL', 'Warembo,Kill God (Black),Worldwide Money,Pretty Girls,Mind of a Hustler,Kill God (Color),Where Money Talks,Today / Tomorrow / Forever', 1),
  ('catalog-new-era-caps', 'New era caps', 'new-era-caps', 'New era caps', 1000, '/images/products/cap-worldwide-logo.webp', 'headwear', 'One Size', 'Worldwide Logo,JS Monogram,JS Styles,KS / JS Logo,Kstyles Logo', 1),
  ('catalog-reflective-tees', 'Reflective Tees', 'reflective-tees', 'Reflective Tees', 2000, '/images/products/tee-reflective-white.webp', 'tees', 'S,M,L,XL', 'White', 0),
  ('catalog-glow-in-the-dark-tees', 'Glow in the Dark Tees', 'glow-in-the-dark-tees', 'Glow in the dark Tees', 2000, '/images/products/tee-glow-black.webp', 'tees', 'S,M,L,XL', 'Black', 0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  category = EXCLUDED.category,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors,
  featured = EXCLUDED.featured;

COMMIT;
