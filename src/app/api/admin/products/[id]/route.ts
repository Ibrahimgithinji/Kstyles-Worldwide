import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import db from "@/lib/db";
import { isStringLen, isPositiveNumber, isSafeUrl } from "@/lib/validate";

const CATEGORIES = ["tops", "bottoms", "outerwear", "accessories"];

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = db.prepare("SELECT id FROM products WHERE id = ?").get(id);
  if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const { name, slug, description, price, category, sizes, colors, image, featured } = await req.json();
  if (!isStringLen(name, 2, 120)) return NextResponse.json({ error: "Name must be 2-120 characters" }, { status: 400 });
  if (!isStringLen(slug, 2, 120) || !/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ error: "Slug must be lowercase letters, numbers, dashes" }, { status: 400 });
  if (!isStringLen(description ?? "", 0, 2000)) return NextResponse.json({ error: "Description too long" }, { status: 400 });
  if (!isPositiveNumber(price) || price > 100000) return NextResponse.json({ error: "Price must be positive (max 100000)" }, { status: 400 });
  if (category && !CATEGORIES.includes(category)) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  if (image && !isSafeUrl(image)) return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });

  db.prepare("UPDATE products SET name=?, slug=?, description=?, price=?, category=?, sizes=?, colors=?, image=?, featured=? WHERE id=?")
    .run(name, slug, description, price, category, String(sizes || "").slice(0, 200), String(colors || "").slice(0, 200), image || "", featured ? 1 : 0, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = db.prepare("DELETE FROM products WHERE id = ?").run(id);
  if (result.changes === 0) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
