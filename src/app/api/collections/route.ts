import { NextResponse } from "next/server";
import db from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const rows = db.prepare("SELECT * FROM collections ORDER BY id").all();
  return NextResponse.json(rows);
}
