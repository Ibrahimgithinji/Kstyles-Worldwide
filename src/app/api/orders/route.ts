import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { isEmail, isStringLen } from "@/lib/validate";
import { readJson, errorResponse } from "@/lib/body";
import { clientIp, checkRateLimit, recordAttempt } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const key = "orders:" + clientIp(req);
  const rl = checkRateLimit(key);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many orders placed. Try again later." }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } });
  }
  recordAttempt(key);
  let body: any;
  try {
    body = await readJson(req);
  } catch (e) {
    return errorResponse(e);
  }
  const { email, firstName, lastName, address, city, zip, country, items } = body;
  if (!isEmail(email)) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (!isStringLen(firstName, 1, 80) || !isStringLen(lastName, 1, 80)) return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  if (!isStringLen(address, 3, 200) || !isStringLen(city, 2, 80) || !isStringLen(zip, 1, 20) || !isStringLen(country, 2, 80)) {
    return NextResponse.json({ error: "Invalid address details" }, { status: 400 });
  }
  if (!items || !Array.isArray(items) || items.length === 0 || items.length > 50) {
    return NextResponse.json({ error: "Missing or invalid items" }, { status: 400 });
  }

  const lookups = db.prepare("SELECT id, name, price, image FROM products WHERE id = ?");
  const insert = db.prepare("INSERT INTO order_items (id, orderId, productId, name, quantity, size, color, price, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");

  let total = 0;
  const rows: any[] = [];
  for (const raw of items) {
    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      return NextResponse.json({ error: "Invalid quantity for item " + raw.productId }, { status: 400 });
    }
    const product = lookups.get(String(raw.productId)) as any;
    if (!product) {
      return NextResponse.json({ error: "Product not found: " + raw.productId }, { status: 400 });
    }
    const size = typeof raw.size === "string" ? raw.size.slice(0, 20) : "";
    const color = typeof raw.color === "string" ? raw.color.slice(0, 40) : "";
    const price = Number(product.price);
    total += price * quantity;
    rows.push([crypto.randomUUID(), null, product.id, product.name, quantity, size, color, price, product.image]);
  }

  const id = crypto.randomUUID();
  db.prepare("INSERT INTO orders (id, email, firstName, lastName, address, city, zip, country, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')")
    .run(id, String(email).slice(0, 254), String(firstName).slice(0, 80), String(lastName).slice(0, 80), String(address).slice(0, 200), String(city).slice(0, 80), String(zip).slice(0, 20), String(country).slice(0, 80), total);
  for (const row of rows) {
    row[1] = id;
    insert.run(...row);
  }
  return NextResponse.json({ id, total });
}
