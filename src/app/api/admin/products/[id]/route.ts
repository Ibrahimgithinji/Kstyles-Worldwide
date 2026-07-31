import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import db from "@/lib/db";
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, slug, description, price, category, sizes, colors, image, featured } = await req.json();
  db.prepare("UPDATE products SET name=?, slug=?, description=?, price=?, category=?, sizes=?, colors=?, image=?, featured=? WHERE id=?").run(name, slug, description, price, category, sizes, colors, image, featured ? 1 : 0, (await params).id);
  return NextResponse.json({ success: true });
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  db.prepare("DELETE FROM products WHERE id = ?").run((await params).id);
  return NextResponse.json({ success: true });
}
