import { NextResponse } from "next/server";
import db from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const rows = db.prepare("SELECT * FROM blog_posts ORDER BY date DESC").all() as { tags: string }[];
  return NextResponse.json(rows.map(r => ({ ...r, tags: r.tags.split(",") })));
}
