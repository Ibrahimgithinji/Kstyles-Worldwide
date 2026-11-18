"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import type { ProductWithVariants } from "@/lib/catalog";

function isProduct(value: unknown): value is ProductWithVariants {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "slug" in value &&
    typeof value.slug === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "description" in value &&
    typeof value.description === "string" &&
    "category" in value &&
    typeof value.category === "string" &&
    "image" in value &&
    (typeof value.image === "string" || value.image === null) &&
    "price" in value &&
    typeof value.price === "number" &&
    "sizes" in value &&
    typeof value.sizes === "string" &&
    "colors" in value &&
    typeof value.colors === "string" &&
    "featured" in value &&
    typeof value.featured === "number" &&
    "optionLabel" in value &&
    typeof value.optionLabel === "string" &&
    "variants" in value &&
    Array.isArray(value.variants) &&
    value.variants.every(variant =>
      typeof variant === "object" &&
      variant !== null &&
      "label" in variant &&
      typeof variant.label === "string" &&
      "image" in variant &&
      typeof variant.image === "string",
    )
  );
}

const categories = [
  { label: "All", value: "all" },
  { label: "Hoodies", value: "hoodies" },
  { label: "Jerseys", value: "jerseys" },
  { label: "Tees", value: "tees" },
  { label: "Headwear", value: "headwear" },
];
export default function ShopPage() {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [active, setActive] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let activeRequest = true;
    async function loadProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("Product request failed");
        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("products" in data) ||
          !Array.isArray(data.products)
        ) {
          throw new Error("Invalid product response");
        }
        const products = data.products.filter(isProduct);
        if (products.length !== data.products.length) throw new Error("Invalid product data");
        if (activeRequest) setProducts(products);
      } catch {
        if (activeRequest) setError("We couldn't load products. Please refresh the page and try again.");
      } finally {
        if (activeRequest) setLoading(false);
      }
    }

    void loadProducts();
    return () => {
      activeRequest = false;
    };
  }, []);
  const filtered = active === "all" ? products : products.filter(p => p.category === active);
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white">Shop All</h1>
        <p className="mt-2 text-[#a0a0a0]">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map(category => (
            <button key={category.value} onClick={() => setActive(category.value)} className={`rounded-md px-4 py-2 text-sm uppercase tracking-widest transition-colors ${active === category.value ? "bg-[#d4af37] text-black" : "border border-[#2a2a2a] text-[#a0a0a0] hover:text-white"}`}>{category.label}</button>
          ))}
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <p className="text-[#a0a0a0]">Loading...</p>
          ) : error ? (
            <p role="alert" className="text-[#a0a0a0]">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-[#a0a0a0]">No products found.</p>
          ) : (
            filtered.map(p => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </div>
    </div>
  );
}
