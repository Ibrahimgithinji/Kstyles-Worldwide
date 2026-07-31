import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
export async function GET() {
  const products = db.prepare("SELECT * FROM products ORDER BY createdAt DESC").all();
  return NextResponse.json({ products });
}
