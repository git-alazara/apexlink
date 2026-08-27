import { NextResponse } from "next/server";
import { recordCurrentLinkClick } from "@/lib/apex-link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const url = await recordCurrentLinkClick();

  return NextResponse.redirect(url, { status: 302 });
}
