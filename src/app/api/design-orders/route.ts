import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isEmail, isStringLen, isPositiveNumber } from "@/lib/validate";
import { readJson, errorResponse } from "@/lib/body";
import { clientIp, checkRateLimit, recordAttempt } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = checkRateLimit(`design-order:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json({ error: `Too many requests. Try again in ${limit.retryAfterSeconds}s.` }, { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } });
  }
  let body: any;
  try {
    body = await readJson(req);
  } catch (e) {
    return errorResponse(e);
  }
  const { designId, size, quantity, fabric, color, dimensions, notes, customerName, email, phone } = body;

  if (typeof designId !== "string" || designId.length === 0) return NextResponse.json({ error: "Invalid design" }, { status: 400 });
  if (typeof size !== "string" || size.length === 0 || size.length > 20) return NextResponse.json({ error: "Invalid size" }, { status: 400 });
  if (!isPositiveNumber(Number(quantity)) || !Number.isInteger(Number(quantity)) || Number(quantity) > 99) {
    return NextResponse.json({ error: "Quantity must be 1-99" }, { status: 400 });
  }
  if (!isStringLen(customerName, 2, 80)) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  if (!isEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (phone !== undefined && phone !== "" && !/^[+\d][\d\s\-()]{5,19}$/.test(String(phone))) return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  if (!isStringLen(fabric ?? "", 0, 100) || !isStringLen(color ?? "", 0, 100) || !isStringLen(dimensions ?? "", 0, 200) || !isStringLen(notes ?? "", 0, 2000)) {
    return NextResponse.json({ error: "Invalid order details" }, { status: 400 });
  }

  const design = db.prepare("SELECT * FROM designs WHERE id = ? AND active = 1").get(designId) as any;
  if (!design) return NextResponse.json({ error: "Design not found" }, { status: 404 });
  recordAttempt(`design-order:${ip}`);

  let sizePrices: Record<string, number> = {};
  try { sizePrices = JSON.parse(design.sizePrices || "{}"); } catch { /* ignore */ }
  const unitPrice = typeof sizePrices[size] === "number" && sizePrices[size] > 0 ? sizePrices[size] : design.price;

  const id = crypto.randomUUID();
  db.prepare("INSERT INTO design_orders (id, designId, designName, size, price, quantity, fabric, color, dimensions, notes, customerName, email, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')")
    .run(id, design.id, design.name, size, unitPrice, Number(quantity), String(fabric ?? "").slice(0, 100), String(color ?? "").slice(0, 100), String(dimensions ?? "").slice(0, 200), String(notes ?? "").slice(0, 2000), customerName, email.toLowerCase(), String(phone ?? "").slice(0, 20));

  return NextResponse.json({ id, designName: design.name, size, price: unitPrice, total: unitPrice * Number(quantity) });
}