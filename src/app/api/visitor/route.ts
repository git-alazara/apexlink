import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getOrCreateVisitor, getTotalVisitors } from "@/lib/apex-link";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VISITOR_COOKIE = "apex_visitor";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(VISITOR_COOKIE)?.value;
  const visitor = await getOrCreateVisitor(token);
  const totalVisitors = await getTotalVisitors();
  const response = NextResponse.json({ totalVisitors, visitorNumber: visitor.visitorNumber });

  if (visitor.token !== token) {
    response.cookies.set(VISITOR_COOKIE, visitor.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}
