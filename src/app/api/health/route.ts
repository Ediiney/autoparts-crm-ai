import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    service: "autoparts-crm-ai",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
