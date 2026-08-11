import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import db from "@/lib/db";
import { isStringLen, isPositiveNumber, isSafeUrl } from "@/lib/validate";

const CATEGORIES = ["tops", "bottoms", "outerwear", "accessories"];

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
  if (!isStringLen(name, 2, 120)) return NextResponse.json({ error: "Name must be 2-120 characters" }, { status: 400 });
  if (!isStringLen(slug, 2, 120) || !/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ error: "Slug must be lowercase letters, numbers, dashes" }, { status: 400 });
  if (!isStringLen(description ?? "", 0, 2000)) return NextResponse.json({ error: "Description too long" }, { status: 400 });
  if (!isPositiveNumber(price) || price > 100000) return NextResponse.json({ error: "Price must be positive (max 100000)" }, { status: 400 });
  if (category && !CATEGORIES.includes(category)) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  if (image && !isSafeUrl(image)) return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });

  const id = crypto.randomUUID();
  db.prepare("INSERT INTO products (id, name, slug, description, price, category, sizes, colors, image, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, name, slug, description || "", price, category || "", String(sizes || "S,M,L,XL").slice(0, 200), String(colors || "Black").slice(0, 200), image || "", featured ? 1 : 0);
  return NextResponse.json({ id });
}
