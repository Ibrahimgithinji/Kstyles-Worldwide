import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import db, { logAdminAction } from "@/lib/db";
import { readJson, errorResponse } from "@/lib/body";
import { isStringLen, isPositiveNumber, isSafeUrl } from "@/lib/validate";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const existing = db.prepare("SELECT id, sizePrices FROM designs WHERE id = ?").get(id) as any;
  if (!existing) return NextResponse.json({ error: "Design not found" }, { status: 404 });

  let body: any;
  try {
    body = await readJson(req);
  } catch (e) {
    return errorResponse(e);
  }
  const { name, slug, description, price, sizePrices, image, tags, active } = body;

  if (!isStringLen(name, 2, 120)) return NextResponse.json({ error: "Name must be 2-120 characters" }, { status: 400 });
  if (!isStringLen(slug, 2, 120) || !/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ error: "Slug must be lowercase letters, numbers, dashes" }, { status: 400 });
  if (!isStringLen(description ?? "", 0, 2000)) return NextResponse.json({ error: "Description too long" }, { status: 400 });
  if (!isPositiveNumber(price) || price > 100000) return NextResponse.json({ error: "Base price must be positive (max 100000)" }, { status: 400 });
  if (image && !isSafeUrl(image)) return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });

  let parsedSizes: Record<string, number> | null = null;
  if (sizePrices !== undefined) {
    if (typeof sizePrices === "string") {
      try { parsedSizes = JSON.parse(sizePrices); } catch { parsedSizes = {}; }
    } else if (typeof sizePrices === "object" && sizePrices) {
      parsedSizes = sizePrices;
    }
    for (const [k, v] of Object.entries(parsedSizes ?? {})) {
      if (!isPositiveNumber(v) || v > 100000) return NextResponse.json({ error: `Invalid price for size ${k}` }, { status: 400 });
    }
  }

  const slugOwner = db.prepare("SELECT id FROM designs WHERE slug = ? AND id != ?").get(slug, id);
  if (slugOwner) return NextResponse.json({ error: "Slug already in use — choose another" }, { status: 409 });

  let finalSizes: Record<string, number>;
  if (parsedSizes) {
    finalSizes = parsedSizes;
  } else {
    try { finalSizes = JSON.parse(existing.sizePrices || "{}"); } catch { finalSizes = {}; }
  }

  db.prepare("UPDATE designs SET name=?, slug=?, description=?, price=?, sizePrices=?, image=?, tags=?, active=? WHERE id=?")
    .run(name, slug, description ?? "", price, JSON.stringify(finalSizes), image || "", String(tags ?? "").slice(0, 200), active === false ? 0 : 1, id);
  logAdminAction(user.id, user.email, "design.update", id, `name=${name} base=${price}`);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = db.prepare("DELETE FROM designs WHERE id = ?").run(id);
  if (result.changes === 0) return NextResponse.json({ error: "Design not found" }, { status: 404 });
  logAdminAction(user.id, user.email, "design.delete", id);
  return NextResponse.json({ success: true });
}