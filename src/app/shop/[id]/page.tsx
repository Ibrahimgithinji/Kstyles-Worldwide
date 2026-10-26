"use client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { addToCart } from "@/lib/cart";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string | null;
  price: number;
  sizes: string;
  colors: string;
}

type ProductState =
  | { status: "loading"; id: string }
  | { status: "not-found"; id: string }
  | { status: "error"; id: string }
  | { status: "ready"; id: string; product: Product };

function isProduct(value: unknown): value is Product {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "category" in value &&
    typeof value.category === "string" &&
    "description" in value &&
    typeof value.description === "string" &&
    "image" in value &&
    (typeof value.image === "string" || value.image === null) &&
    "price" in value &&
    typeof value.price === "number" &&
    "sizes" in value &&
    typeof value.sizes === "string" &&
    "colors" in value &&
    typeof value.colors === "string"
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [productState, setProductState] = useState<ProductState>({ status: "loading", id: "" });
  const [retryCount, setRetryCount] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        const response = await fetch(`/api/products/${encodeURIComponent(id)}`);
        if (response.status === 404) {
          if (active) setProductState({ status: "not-found", id });
          return;
        }
        if (!response.ok) throw new Error("Product request failed");

        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("product" in data) ||
          !isProduct(data.product)
        ) {
          throw new Error("Invalid product response");
        }

        if (active) {
          setProductState({ status: "ready", id, product: data.product });
          setSize(data.product.sizes.split(",")[0]);
          setColor(data.product.colors.split(",")[0]);
        }
      } catch {
        if (active) setProductState({ status: "error", id });
      }
    }

    void loadProduct();
    return () => {
      active = false;
    };
  }, [id, retryCount]);

  const p = productState.id === id && productState.status === "ready"
    ? productState.product
    : null;
  if (productState.id !== id || productState.status === "loading") {
    return <div className="pt-24 text-center"><p className="text-[#a0a0a0]">Loading...</p></div>;
  }
  if (productState.status === "not-found") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 pt-16 text-center">
        <h1 className="text-2xl font-bold text-white">Product not found</h1>
        <p className="mt-2 text-[#a0a0a0]">This product may have been removed or is no longer available.</p>
        <Link href="/shop" className="mt-6 rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f]">
          Back to Shop
        </Link>
      </div>
    );
  }
  if (productState.status === "error" || !p) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 pt-16 text-center">
        <h1 className="text-2xl font-bold text-white">We couldn&apos;t load this product</h1>
        <p role="alert" className="mt-2 text-[#a0a0a0]">Please check your connection and try again.</p>
        <button onClick={() => { setProductState({ status: "loading", id }); setRetryCount(count => count + 1); }} className="mt-6 rounded-md bg-[#d4af37] px-6 py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f]">
          Try Again
        </button>
      </div>
    );
  }

  const sizes: string[] = p.sizes.split(",");
  const colors: string[] = p.colors.split(",");
  const colorClassMap: Record<string, string> = {
    Black: "bg-black",
    White: "bg-white",
    Cream: "bg-[#f5f5dc]",
    Olive: "bg-[#556b2f]",
    Khaki: "bg-[#c3b091]",
    Grey: "bg-[#808080]",
    Navy: "bg-[#000080]",
    Charcoal: "bg-[#36454f]",
    Indigo: "bg-[#3f51b5]",
    Brown: "bg-[#8b4513]",
  };
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2">
          <div className="aspect-[3/4] overflow-hidden border border-[#2a2a2a] bg-[#111]">
            {p.image ? <Image src={p.image} alt={p.name} width={800} height={1067} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><span className="text-9xl font-bold text-[#2a2a2a]">{p.name[0]}</span></div>}
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#a0a0a0]">{p.category}</p>
            <h1 className="mt-2 text-3xl font-bold text-white">{p.name}</h1>
            <p className="mt-4 text-2xl text-[#d4af37]">{formatPrice(p.price)}</p>
            <p className="mt-6 text-[#a0a0a0] leading-relaxed">{p.description}</p>
            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-white">Size: {size}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map(s => <button key={s} onClick={() => setSize(s)} className={`rounded-md border px-4 py-2 text-sm transition-colors ${size === s ? "border-[#d4af37] bg-[#d4af37] text-black" : "border-[#2a2a2a] text-white hover:border-[#d4af37]"}`}>{s}</button>)}
              </div>
            </div>
            <div className="mt-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-white">Color: {color}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map(c => <button key={c} onClick={() => setColor(c)} className={`h-8 w-8 rounded-full border transition-all ${color === c ? "ring-2 ring-[#d4af37] ring-offset-2 ring-offset-black" : "border-[#2a2a2a]"} ${colorClassMap[c] || "bg-[#d4af37]"}`} title={c} />)}
              </div>
            </div>
            <button onClick={() => { addToCart({ productId: p.id, name: p.name, price: p.price, image: p.image ?? "", size, color, quantity: 1 }); router.push("/cart"); }} className="mt-10 w-full rounded-md bg-[#d4af37] py-3 text-sm font-semibold uppercase tracking-widest text-black hover:bg-[#b8960f] transition-colors">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
