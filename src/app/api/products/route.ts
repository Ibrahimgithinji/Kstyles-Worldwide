import { NextResponse } from "next/server";
import db from "@/lib/db";
import { presentProduct, type ProductRecord } from "@/lib/catalog";
export async function GET() {
  const products = await db.prepare("SELECT * FROM products ORDER BY createdAt DESC").all<ProductRecord>();
  return NextResponse.json({ products: products.map(presentProduct) });
}
