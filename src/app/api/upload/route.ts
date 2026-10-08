import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getAuthUser, isSameOriginRequest } from "@/lib/auth";
import { readBytes, errorResponse } from "@/lib/body";

const ALLOWED = /^image\/(png|jpe?g|webp|gif|avif)$/i;
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_SIZE + 64 * 1024;

function sniffImage(buffer: Buffer): "png" | "jpeg" | "gif" | "webp" | "avif" | null {
  if (buffer.length >= 8 && buffer.readUInt32BE(0) === 0x89504e47 && buffer.readUInt32BE(4) === 0x0d0a1a0a) return "png";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpeg";
  if (buffer.length >= 6 && buffer.toString("ascii", 0, 6) === "GIF89a") return "gif";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buffer.length >= 12 && buffer.toString("ascii", 4, 8) === "ftyp") {
    const brand = buffer.toString("ascii", 8, 12);
    if (brand === "avif" || brand === "avis" || brand === "av01") return "avif";
  }
  return null;
}

const extForType: Record<string, string> = { png: "png", jpeg: "jpg", gif: "gif", webp: "webp", avif: "avif" };

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = getAuthUser(req);
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let requestBytes: Uint8Array<ArrayBuffer>;
  try {
    requestBytes = await readBytes(req, MAX_REQUEST_SIZE);
  } catch (error) {
    return errorResponse(error);
  }

  let file: FormDataEntryValue | null;
  try {
    const multipart = new Request(req.url, {
      method: "POST",
      headers: { "content-type": req.headers.get("content-type") ?? "" },
      body: requestBytes,
    });
    file = (await multipart.formData()).get("file");
  } catch {
    return NextResponse.json({ error: "Invalid multipart upload" }, { status: 400 });
  }
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.test(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });

  const fileBytes = Buffer.from(await file.arrayBuffer());
  const kind = sniffImage(fileBytes);
  if (!kind) return NextResponse.json({ error: "File content is not a valid image" }, { status: 400 });

  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extForType[kind]}`;
  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), fileBytes);

  return NextResponse.json({ url: `/api/images/${name}` });
}
