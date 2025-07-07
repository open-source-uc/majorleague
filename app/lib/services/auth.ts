"use server";

import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";

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
    cache: "no-store", // never cache auth responses
  });

  if (!res.ok) return null;

  const data: RawAuth = await res.json();
  return { message: data.message, permissions: data.permissions, id: data.userId };
}
