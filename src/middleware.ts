import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const NEW_HOST = "soft-skills.transformerinstitute.org";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // Redirect old domain to new domain (301 permanent)
  if (host === "soft-skills.chillai.space") {
    const url = new URL(request.url);
    url.host = NEW_HOST;
    url.protocol = "https:";
    return NextResponse.redirect(url.toString(), 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/(.*)",
};
