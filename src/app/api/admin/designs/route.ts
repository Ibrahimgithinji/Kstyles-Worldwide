import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import db, { logAdminAction, DESIGN_STATUSES } from "@/lib/db";
import { readJson, errorResponse } from "@/lib/body";
import { isStringLen, isPositiveNumber, isSafeUrl } from "@/lib/validate";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const designs = db.prepare("SELECT * FROM designs ORDER BY createdAt DESC").all();
  const orders = db.prepare("SELECT * FROM design_orders ORDER BY createdAt DESC").all();
  return NextResponse.json({ designs, orders });
}

function parseSizes(raw: unknown): Record<string, number> {
  if (raw === undefined || raw === null) return {};
  if (typeof raw === "object") return raw as Record<string, number>;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return typeof parsed === "object" && parsed ? parsed : {};
    } catch { /* ignore */ }
  }
  return {};
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const parsedSizes = parseSizes(sizePrices);
  for (const [k, v] of Object.entries(parsedSizes)) {
    if (!isPositiveNumber(v) || v > 100000) return NextResponse.json({ error: `Invalid price for size ${k}` }, { status: 400 });
  }

  const id = crypto.randomUUID();
  db.prepare("INSERT INTO designs (id, name, slug, description, price, sizePrices, image, tags, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .run(id, name, slug, description || "", price, JSON.stringify(parsedSizes), image || "", String(tags ?? "").slice(0, 200), active === false ? 0 : 1);
  logAdminAction(user.id, user.email, "design.create", id, `name=${name} base=${price}`);
  return NextResponse.json({ id });
}

export async function PUT(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { designId, status } = await req.json().catch(() => ({}));
  if (typeof designId !== "string" || designId.length === 0) return NextResponse.json({ error: "Invalid design order id" }, { status: 400 });
  if (typeof status !== "string" || !(DESIGN_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "Invalid status. Allowed: " + DESIGN_STATUSES.join(", ") }, { status: 400 });
  }
  const result = db.prepare("UPDATE design_orders SET status = ? WHERE id = ?").run(status, designId);
  if (result.changes === 0) return NextResponse.json({ error: "Design order not found" }, { status: 404 });
  logAdminAction(user.id, user.email, "design_order.status", designId, `status=${status}`);
  return NextResponse.json({ success: true });
}