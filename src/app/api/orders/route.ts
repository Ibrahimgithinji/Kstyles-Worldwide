import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  const { email, firstName, lastName, address, city, zip, country, items } = await req.json();
  if (!email || !firstName || !lastName || !address || !city || !zip || !country || !items || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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
