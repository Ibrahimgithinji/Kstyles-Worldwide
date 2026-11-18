import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { presentProduct, type ProductRecord } from "@/lib/catalog";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const product = await db.prepare("SELECT * FROM products WHERE id = ?").get<ProductRecord>((await params).id);
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product: presentProduct(product) });
}
