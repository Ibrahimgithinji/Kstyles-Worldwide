import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import db from "@/lib/db";
export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const products = db.prepare("SELECT * FROM products ORDER BY createdAt DESC").all() as any[];
  return NextResponse.json({ products });
}
export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, slug, description, price, category, sizes, colors, image, featured } = await req.json();
  if (!name || !slug || !price) return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO products (id, name, slug, description, price, category, sizes, colors, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(id, name, slug, description || "", price, category || "", sizes || "S,M,L,XL", colors || "Black", image || "", featured ? 1 : 0);
  return NextResponse.json({ id });
}
