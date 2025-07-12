"use server";

import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";
import { getProfile } from "@/actions/auth";
import { OsucPermissions } from "@/lib/types/permissions";

interface RawAuth {
  message: string;
  permissions: string[];
  userId: string;
}

export async function getToken(store: ReadonlyRequestCookies) {
  const fromCookie = store.get("osucookie")?.value ?? "";

  if (process.env.NODE_ENV !== "production") {
    return fromCookie || (process.env.USER_TOKEN ?? "");
  }

  return fromCookie;
}

export async function getUserDataByToken(): Promise<{
  message: string;
  permissions: string[];
  id: string;
} | null> {
  const store = await cookies();
  const token = await getToken(store);
  if (token == "") return null;

  const res = await fetch("https://auth.osuc.dev/api", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // Cache for 5 minutes, revalidate in background
    next: { revalidate: 300 },
  });

  if (!res.ok) return null;

  const data: RawAuth = await res.json();
  return { message: data.message, permissions: data.permissions, id: data.userId };
}

export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean;
  userData: { message: string; permissions: string[]; id: string } | null;
  userProfile: any | null;
  isAdmin: boolean;
}> {
  const userData = await getUserDataByToken();

  if (!userData) {
    return { isAuthenticated: false, userData: null, userProfile: null, isAdmin: false };
  }

  const userProfile = await getProfile(userData);
  const isAdmin = userData.permissions.includes(OsucPermissions.userIsRoot) || process.env.ADMIN_USER == "true";

  return {
    isAuthenticated: !!(userData && userProfile),
    isAdmin,
    userData,
    userProfile,
  };
}
