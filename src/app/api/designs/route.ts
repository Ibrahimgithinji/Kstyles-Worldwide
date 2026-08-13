import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (slug) {
    const design = db.prepare("SELECT * FROM designs WHERE slug = ? AND active = 1").get(slug) as any;
    if (!design) return NextResponse.json({ error: "Design not found" }, { status: 404 });
    return NextResponse.json({
      ...design,
      sizePrices: safelyParse(design.sizePrices),
    });
  }
  const designs = db.prepare("SELECT * FROM designs WHERE active = 1 ORDER BY createdAt DESC").all() as any[];
  return NextResponse.json({ designs: designs.map((d: any) => ({ ...d, sizePrices: safelyParse(d.sizePrices) })) });
}

function safelyParse(raw: string | null): Record<string, number> {
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}