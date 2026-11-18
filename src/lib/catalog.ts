import catalogData from "@/lib/catalog-products.json";

export interface ProductRecord extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string | null;
  category: string;
  sizes: string;
  colors: string;
  featured: number;
}

export interface ProductVariant {
  label: string;
  image: string;
}

export interface ProductWithVariants extends ProductRecord {
  variants: ProductVariant[];
  optionLabel: string;
}

interface CatalogDefinition {
  slug: string;
  optionLabel: string;
  variants: ProductVariant[];
}

const catalogDefinitions = catalogData as CatalogDefinition[];
const definitionsBySlug = new Map(catalogDefinitions.map(product => [product.slug, product]));

export function presentProduct(product: ProductRecord): ProductWithVariants {
  const definition = definitionsBySlug.get(product.slug);
  const colors = product.colors.split(",").map(value => value.trim()).filter(Boolean);

  return {
    ...product,
    variants: definition?.variants ?? colors.map(label => ({ label, image: product.image ?? "" })),
    optionLabel: definition?.optionLabel ?? "Color",
  };
}

export function getProductVariant(slug: string, label: string): ProductVariant | undefined {
  return definitionsBySlug.get(slug)?.variants.find(variant => variant.label === label);
}
