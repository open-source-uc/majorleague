// Server action to login a user
"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

export async function ActionLogin(
  prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      email: string;
      password: string;
    };
  },
  formData: FormData,
) {
  const supabase = await createClient();

  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  const body = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { success, data } = schema.safeParse(body);

  if (!success) {
    return {
      errors: 1,
      success: 0,
      message: "Datos inválidos",
      body,
    };
  }

  const { error } = await supabase.auth.signInWithPassword(data);
  if (error) {
    return {
      errors: 1,
      success: 0,
      message: "Credenciales inválidas",
      body,
    };
  } else {
    revalidatePath("/");
    return {
      errors: 0,
      success: 1,
      message: "Inicio de sesión exitoso",
      body,
    };
  }
}
