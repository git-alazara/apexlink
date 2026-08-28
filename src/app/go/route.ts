import { NextResponse } from "next/server";
import { recordCurrentLinkClick, recordLinkClickForOwner } from "@/lib/apex-link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const ownerParam = new URL(request.url).searchParams.get("owner");
  const ownerNumber = ownerParam !== null ? Number(ownerParam) : null;

  const url =
    ownerNumber !== null && Number.isInteger(ownerNumber)
      ? await recordLinkClickForOwner(ownerNumber)
      : await recordCurrentLinkClick();

  if (!url) {
    return NextResponse.redirect("/", { status: 302 });
  }

  return NextResponse.redirect(url, { status: 302 });
}
