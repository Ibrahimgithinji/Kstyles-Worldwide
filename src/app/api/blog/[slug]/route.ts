import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = db.prepare("SELECT * FROM blog_posts WHERE slug = ?").get(slug) as { title: string; content: string; date: string; author: string; tags: string } | undefined;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ...row, tags: row.tags.split(",") });
}
