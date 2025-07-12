"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import type { Profile, UserData } from "@/lib/types";
import { getAuthStatus } from "@/lib/services/auth";

const profileSchema = z.object({
  id: z.string().min(1, "El id es requerido"),
  username: z
    .string()
    .min(1, "El nombre de usuario es requerido")
    .max(25, "El nombre de usuario no puede exceder los 25 caracteres"),
  email: z.string().email().optional(),
});

export async function getProfile(userData: UserData): Promise<Profile | null> {
  const { env } = getRequestContext();
  return (
    (await env.DB.prepare("SELECT id, username, email FROM profiles WHERE id = ?")
      .bind(`${userData.id}`)
      .first<Profile>()) ?? null
  );
}

export async function CreateProfile(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: string;
      username: string;
      email: string;
    };
  },
  formData: FormData,
) {
  const body = {
    id: formData.get("userId") as string,
    username: formData.get("username") as string,
    email: formData.get("email") as string,
  };

  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      message: "Revisa los campos e inténtalo de nuevo.",
      errors: 1,
      body,
    };
  }

  const { env } = getRequestContext();

  const collision = await env.DB.prepare("SELECT 1 FROM profiles WHERE username = ?")
    .bind(parsed.data.username)
    .first();
  if (collision) {
    return {
      success: 0,
      message: "Ese nombre de usuario ya está en uso.",
      errors: 1,
      body,
    };
  }

  await env.DB.prepare("INSERT INTO profiles (id, username, email) VALUES (?, ?, ?)")
    .bind(parsed.data.id, parsed.data.username, parsed.data.email ?? null)
    .run();

  return {
    success: 1,
    message: "Perfil creado con éxito 🎉",
    errors: 0,
    body,
  };
}
