import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "images", "designs");
  const files = (await readdir(dir)).filter(f => /\.(jpe?g|png|webp|gif|avif)$/i.test(f)).sort();
  return NextResponse.json(files);
}