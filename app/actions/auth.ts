"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import type { Profile, UserData, Player, JoinTeamRequest } from "@/lib/types";

const profileSchema = z.object({
  id: z.string().min(1, "El id es requerido"),
  username: z
    .string()
    .min(1, "El nombre de usuario es requerido")
    .max(25, "El nombre de usuario no puede exceder los 25 caracteres"),
  email: z
    .string()
    .email("El correo debe ser válido")
    .optional()
    .refine((email) => email?.endsWith(".uc.cl") || email?.endsWith("uc.cl") || email === null, {
      message: "El correo debe ser de la UC",
    }),
});

export async function getProfile(userData: UserData): Promise<Profile | null> {
  try {
    const context = getRequestContext();
    const userId = String(userData.id);
    const profile = await context.env.DB.prepare(
      "SELECT id, username, email, created_at, updated_at FROM profiles WHERE id = ?",
    )
      .bind(userId)
      .first<Profile>();
    const result = profile ?? null;
    return result;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export async function getPlayerByProfileId(profileId: string): Promise<(Player & { team_name?: string }) | null> {
  try {
    const context = getRequestContext();
    const player = await context.env.DB.prepare(
      `
      SELECT p.id, p.team_id, p.profile_id, p.first_name, p.last_name, p.nickname, p.birthday, p.position, p.created_at, p.updated_at,
             t.name as team_name
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.profile_id = ?
    `,
    )
      .bind(profileId)
      .first<Player & { team_name?: string }>();

    return player ?? null;
  } catch (error) {
    console.error("Error fetching player by profile ID:", error);
    return null;
  }
}

export async function getJoinRequestsByProfileId(
  profileId: string,
): Promise<(JoinTeamRequest & { team_name?: string })[]> {
  try {
    const context = getRequestContext();
    const requests = await context.env.DB.prepare(
      `
      SELECT jtr.id, jtr.team_id, jtr.profile_id, jtr.timestamp, jtr.first_name, jtr.last_name, jtr.birthday, 
             jtr.preferred_position, jtr.status, jtr.notes, jtr.created_at, jtr.updated_at,
             t.name as team_name
      FROM join_team_requests jtr
      LEFT JOIN teams t ON jtr.team_id = t.id
      WHERE jtr.profile_id = ? AND jtr.status = 'pending'
      ORDER BY jtr.created_at DESC
    `,
    )
      .bind(profileId)
      .all<JoinTeamRequest & { team_name?: string }>();

    return requests.results || [];
  } catch (error) {
    console.error("Error fetching join requests by profile ID:", error);
    return [];
  }
}

export async function CreateProfile(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: string;
      username: string;
      email: string | null;
    };
  },
  formData: FormData,
) {
  try {
    const body = {
      id: formData.get("userId") as string,
      username: formData.get("username") as string,
      email: formData.get("email") as string | null,
    };

    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return {
        success: 0,
        message: parsed.error.issues[0].message,
        errors: 1,
        body,
      };
    }
    try {
      const context = getRequestContext();

      const collision = await context.env.DB.prepare("SELECT 1 FROM profiles WHERE username = ?")
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

      const userId = String(parsed.data.id);
      await context.env.DB.prepare(
        "INSERT INTO profiles (id, username, email, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
      )
        .bind(userId, parsed.data.username, parsed.data.email ?? null)
        .run();

      return {
        success: 1,
        message: "Perfil creado con éxito 🎉",
        errors: 0,
        body,
      };
    } catch (error) {
      console.error("Error creating profile:", error);
      return {
        success: 0,
        message: "Ocurrió un error en el servidor.",
        errors: 1,
        body,
      };
    }
  } catch (error) {
    console.error("Error creating profile:", error);
    return {
      success: 0,
      message: "Ocurrió un error en el servidor.",
      errors: 1,
      body: _prev.body,
    };
  }
}

export async function isCaptain(profileId: string): Promise<boolean> {
  try {
    const context = getRequestContext();
    const captain = await context.env.DB.prepare("SELECT id FROM teams WHERE captain_id = ?")
      .bind(profileId)
      .first<{ id: string }>();
    return captain ? true : false;
  } catch (error) {
    console.error("Error checking if user is captain:", error);
    return false;
  }
}
