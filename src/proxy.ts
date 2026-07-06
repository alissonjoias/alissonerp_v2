import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const ACCESS_COOKIE = "sb-access-token";
const REFRESH_COOKIE = "sb-refresh-token";

async function fetchWithKey(path: string, token?: string): Promise<Response> {
  const headers: Record<string, string> = { apikey: ANON_KEY };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_URL}${path}`, { headers });
}

function getCookies(request: NextRequest) {
  return {
    accessToken: request.cookies.get(ACCESS_COOKIE)?.value,
    refreshToken: request.cookies.get(REFRESH_COOKIE)?.value,
  };
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const { accessToken, refreshToken } = getCookies(request);

    let userId: string | null = null;

    if (accessToken) {
      const userRes = await fetchWithKey("/auth/v1/user", accessToken);
      if (userRes.ok) {
        const body = (await userRes.json()) as { id: string };
        userId = body.id;
      } else if (refreshToken) {
        const refreshRes = await fetch(`${API_URL}/auth/v1/token?grant_type=refresh_token`, {
          method: "POST",
          headers: { apikey: ANON_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          userId = data.user.id;
          response = NextResponse.next({ request });
          response.cookies.set(ACCESS_COOKIE, data.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
          response.cookies.set(REFRESH_COOKIE, data.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        } else {
          response = NextResponse.next({ request });
          response.cookies.set(ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
          response.cookies.set(REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
        }
      }
    }

    const isAuthPage = request.nextUrl.pathname.startsWith("/auth/");
    const isPublicPage = request.nextUrl.pathname === "/" || request.nextUrl.pathname.startsWith("/_next");

    if (!userId && !isAuthPage && !isPublicPage) {
      return NextResponse.redirect(new URL("/auth/v1/login", request.url));
    }

    if (userId && isAuthPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } catch {
    // Se API estiver indisponível, permite acesso às páginas públicas
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
