import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import db from "@/lib/db";
export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orders = db.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all() as any[];
  const withItems = orders.map((o: any) => {
    const items = db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(o.id) as any[];
    return { ...o, items };
  });
  return NextResponse.json({ orders: withItems });
}
export async function PUT(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { orderId, status } = await req.json();
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, orderId);
  return NextResponse.json({ success: true });
}
