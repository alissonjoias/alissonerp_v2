import "server-only";

import { cookies } from "next/headers";

import { apiClient } from "./api-client";

const ACCESS_COOKIE = "sb-access-token";
const REFRESH_COOKIE = "sb-refresh-token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setSessionCookies(accessToken: string, refreshToken: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 365,
  });
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getSessionCookies(): Promise<{
  accessToken?: string;
  refreshToken?: string;
}> {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(ACCESS_COOKIE)?.value,
    refreshToken: cookieStore.get(REFRESH_COOKIE)?.value,
  };
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  cookieStore.set(REFRESH_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
}

export async function refreshSession(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  const res = await apiClient("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });

  if (!res.ok) {
    await clearSessionCookies();
    return null;
  }

  const data = await res.json();
  await setSessionCookies(data.access_token, data.refresh_token);
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
}
