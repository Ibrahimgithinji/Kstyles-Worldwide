import { NextRequest, NextResponse } from "next/server";

export async function readJson(req: NextRequest, maxBytes = 100_000) {
  const text = await req.text();
  if (text.length > maxBytes) {
    throw new HttpError(413, "Request body too large");
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new HttpError(400, "Invalid JSON body");
  }
}

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
