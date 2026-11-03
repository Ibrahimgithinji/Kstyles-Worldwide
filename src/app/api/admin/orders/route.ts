import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, isSameOriginRequest } from "@/lib/auth";
import db, { logAdminAction, withDatabaseContext } from "@/lib/db";
import { readJson, errorResponse } from "@/lib/body";

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const withItems = await withDatabaseContext({ userId: user.id, role: "admin" }, async () => {
    const orders = await db.prepare("SELECT * FROM orders ORDER BY createdAt DESC").all() as any[];
    return Promise.all(orders.map(async (order: any) => {
      const items = await db.prepare("SELECT * FROM order_items WHERE orderId = ?").all(order.id) as any[];
      return { ...order, items };
    }));
  });
  return NextResponse.json({ orders: withItems });
}
export async function PUT(req: NextRequest) {
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let body: any;
  try {
    body = await readJson(req);
  } catch (e) {
    return errorResponse(e);
  }
  const { orderId, status } = body;
  if (typeof orderId !== "string" || orderId.length === 0) return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  if (typeof status !== "string" || !ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status. Allowed: " + ORDER_STATUSES.join(", ") }, { status: 400 });
  }
  const result = await withDatabaseContext({ userId: user.id, role: "admin" }, () =>
    db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, orderId),
  );
  if (result.changes === 0) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  await logAdminAction(user.id, user.email, "order.status", orderId, `status=${status}`);
  return NextResponse.json({ success: true });
}
