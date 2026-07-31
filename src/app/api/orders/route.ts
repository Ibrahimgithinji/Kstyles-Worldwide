import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
export async function POST(req: NextRequest) {
  const { email, firstName, lastName, address, city, zip, country, items } = await req.json();
  if (!email || !firstName || !lastName || !address || !city || !zip || !country || !items || items.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  const total = (items as any[]).reduce((s, i) => s + i.price * i.quantity, 0);
  const id = crypto.randomUUID();
  db.prepare("INSERT INTO orders (id, email, firstName, lastName, address, city, zip, country, total, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')").run(id, email, firstName, lastName, address, city, zip, country, total);
  const insert = db.prepare("INSERT INTO order_items (id, orderId, productId, quantity, size, color, price) VALUES (?, ?, ?, ?, ?, ?, ?)");
  for (const item of items) {
    insert.run(crypto.randomUUID(), id, item.productId, item.quantity, item.size || "", item.color || "", item.price);
  }
  return NextResponse.json({ id });
}
