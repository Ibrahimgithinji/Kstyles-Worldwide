import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get((await params).id) as any;
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}
