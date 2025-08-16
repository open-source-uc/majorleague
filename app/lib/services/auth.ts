"use server";

import { cookies } from "next/headers";

import { getRequestContext } from "@cloudflare/next-on-pages";

import { getProfile } from "@/actions/auth";
import { OsucPermissions } from "@/lib/types/permissions";

interface RawAuth {
  message: string;
  permissions: string[];
  userId: string;
}

export async function getUserDataByToken(): Promise<{
  message: string;
  permissions: string[];
  id: string;
} | null> {
  try {
    const store = await cookies();
    const context = getRequestContext();
    const token = store.get("osucookie")?.value ?? context.env.USER_TOKEN;

    if (!token) {
      return null;
    }

    const res = await fetch("https://auth.osuc.dev/api", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return null;

    const data: RawAuth = await res.json();
    const result = { message: data.message, permissions: data.permissions, id: data.userId };
    return result;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function getAuthStatus(): Promise<{
  isAuthenticated: boolean;
  userData: { message: string; permissions: string[]; id: string } | null;
  userProfile: any | null;
  isAdmin: boolean;
}> {
  try {
    const context = getRequestContext();
    const userData = await getUserDataByToken();

    let userProfile = null;

    // Como probar el flujo de los planilleros ->
    // 1. Crear un partido y asignate a ti y a admin como planilleros
    // 2. Para revisar la vista del otro planillero (admin), comentar / descomentar el userProfile de admin

    if (userData) {
      try {
        userProfile = await getProfile(userData);
      } catch (profileError) {
        console.error("Error fetching user profile (database may not be initialized):", profileError);
        userProfile = null;
      }
    }

    // userProfile = {
    //   id: "admin",
    //   username: "admin",
    //   email: "admin@admin.com",
    //   created_at: new Date(),
    //   updated_at: new Date(),
    // };

    const isAdmin = userData?.permissions.includes(OsucPermissions.userIsRoot) || context.env.ADMIN_USER === "true";
    const isAuthenticated = !!(userData || context.env.ADMIN_USER === "true");

    return {
      isAuthenticated,
      isAdmin,
      userData,
      userProfile,
    };
  } catch (error) {
    console.error("Error fetching auth status:", error);
    return { isAuthenticated: false, userData: null, userProfile: null, isAdmin: false };
  }
}
