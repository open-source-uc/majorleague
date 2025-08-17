"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { Player } from "@/lib/types";
import { calculateAge } from "@/lib/utils/cn";

// Validation schemas
const playerCreateSchema = z.object({
  profile_id: z.string().min(1, "El ID del perfil es requerido"),
  team_id: z.number().min(1, "El ID del equipo es requerido").optional(),
  first_name: z.string().min(1, "El nombre es requerido").max(50, "El nombre no puede exceder los 50 caracteres"),
  last_name: z.string().min(1, "El apellido es requerido").max(50, "El apellido no puede exceder los 50 caracteres"),
  nickname: z.string().max(25, "El apodo no puede exceder los 25 caracteres").optional(),
  birthday: z
    .string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine((date) => {
      const birthDate = new Date(date);
      const age = calculateAge(date);
      return !isNaN(birthDate.getTime()) && age >= 15 && age <= 50;
    }, "La edad debe estar entre 15 y 50 años"),
  position: z.enum(["GK", "DEF", "MID", "FWD"]),
  jersey_number: z.number().min(1).max(99).optional(),
});

const playerUpdateSchema = z.object({
  id: z.number().min(1, "El ID del jugador es requerido"),
  profile_id: z.string().min(1, "El ID del perfil es requerido"),
  team_id: z.number().min(1, "El ID del equipo es requerido").optional(),
  first_name: z.string().min(1, "El nombre es requerido").max(50, "El nombre no puede exceder los 50 caracteres"),
  last_name: z.string().min(1, "El apellido es requerido").max(50, "El apellido no puede exceder los 50 caracteres"),
  nickname: z.string().max(25, "El apodo no puede exceder los 25 caracteres").optional(),
  birthday: z
    .string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine((date) => {
      const birthDate = new Date(date);
      const age = calculateAge(date);
      return !isNaN(birthDate.getTime()) && age >= 15 && age <= 50;
    }, "La edad debe estar entre 15 y 50 años"),
  position: z.enum(["GK", "DEF", "MID", "FWD"]),
  jersey_number: z.number().min(1).max(99).optional(),
});

const playerDeleteSchema = z.object({
  id: z.number().min(1, "El ID del jugador es requerido"),
});

// Database operations
export async function getPlayers(): Promise<Player[]> {
  const { env } = getRequestContext();
  const players = await env.DB.prepare(
    `
    SELECT p.id, p.team_id, p.profile_id, p.first_name, p.last_name, p.nickname, p.birthday, p.position, p.jersey_number, p.created_at, p.updated_at,
           t.name as team_name, pr.username as profile_username
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    LEFT JOIN profiles pr ON p.profile_id = pr.id
    ORDER BY p.created_at DESC
  `,
  ).all<Player & { team_name?: string; profile_username?: string }>();

  return players.results || [];
}

export async function getPlayerById(id: number): Promise<Player | null> {
  const { env } = getRequestContext();
  const player = await env.DB.prepare(
    `
    SELECT p.id, p.team_id, p.profile_id, p.first_name, p.last_name, p.nickname, p.birthday, p.position, p.jersey_number, p.created_at, p.updated_at,
           t.name as team_name, pr.username as profile_username
    FROM players p
    LEFT JOIN teams t ON p.team_id = t.id
    LEFT JOIN profiles pr ON p.profile_id = pr.id
    WHERE p.id = ?
  `,
  )
    .bind(id)
    .first<Player>();

  return player || null;
}

// Server actions
export async function createPlayer(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      profile_id: string;
      team_id?: number;
      first_name: string;
      last_name: string;
      nickname?: string;
      birthday: string;
      position: string;
      jersey_number?: number;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para crear jugadores",
      body: {
        profile_id: formData.get("profile_id") as string,
        team_id: parseInt(formData.get("team_id") as string) || undefined,
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        nickname: formData.get("nickname") as string,
        birthday: formData.get("birthday") as string,
        position: formData.get("position") as string,
        jersey_number: parseInt(formData.get("jersey_number") as string) || undefined,
      },
    };
  }

  const body = {
    profile_id: formData.get("profile_id") as string,
    team_id: parseInt(formData.get("team_id") as string) || undefined,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    nickname: (formData.get("nickname") as string) || undefined,
    birthday: formData.get("birthday") as string,
    position: formData.get("position") as string,
    jersey_number: parseInt(formData.get("jersey_number") as string) || undefined,
  };

  const parsed = playerCreateSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "Revisa los campos e inténtalo de nuevo.",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const profile = await env.DB.prepare(`SELECT id FROM profiles WHERE id = ?`).bind(parsed.data.profile_id).first();

    if (!profile) {
      return {
        success: 0,
        errors: 1,
        message: "El perfil no existe",
        body,
      };
    }

    const existingPlayer = await env.DB.prepare(`SELECT id FROM players WHERE profile_id = ?`)
      .bind(parsed.data.profile_id)
      .first();

    if (existingPlayer) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe un jugador para este perfil",
        body,
      };
    }

    if (parsed.data.team_id) {
      const team = await env.DB.prepare(`SELECT id FROM teams WHERE id = ?`).bind(parsed.data.team_id).first();

      if (!team) {
        return {
          success: 0,
          errors: 1,
          message: "El equipo no existe",
          body,
        };
      }
    }

    await env.DB.prepare(
      `
      INSERT INTO players (team_id, profile_id, first_name, last_name, nickname, birthday, position, jersey_number, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    )
      .bind(
        parsed.data.team_id || null,
        parsed.data.profile_id,
        parsed.data.first_name,
        parsed.data.last_name,
        parsed.data.nickname || null,
        parsed.data.birthday,
        parsed.data.position,
        parsed.data.jersey_number || null,
      )
      .run();

    revalidatePath("/admin/dashboard/players");

    return {
      success: 1,
      errors: 0,
      message: `Jugador "${parsed.data.first_name} ${parsed.data.last_name}" creado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating player:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear el jugador. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updatePlayer(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
      profile_id: string;
      team_id?: number;
      first_name: string;
      last_name: string;
      nickname?: string;
      birthday: string;
      position: string;
      jersey_number?: number;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para actualizar jugadores",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
        profile_id: formData.get("profile_id") as string,
        team_id: parseInt(formData.get("team_id") as string) || undefined,
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        nickname: formData.get("nickname") as string,
        birthday: formData.get("birthday") as string,
        position: formData.get("position") as string,
        jersey_number: parseInt(formData.get("jersey_number") as string) || undefined,
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID del jugador inválido",
      body: {
        id: 0,
        profile_id: formData.get("profile_id") as string,
        team_id: parseInt(formData.get("team_id") as string) || undefined,
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        nickname: formData.get("nickname") as string,
        birthday: formData.get("birthday") as string,
        position: formData.get("position") as string,
        jersey_number: parseInt(formData.get("jersey_number") as string) || undefined,
      },
    };
  }

  const body = {
    id,
    profile_id: formData.get("profile_id") as string,
    team_id: parseInt(formData.get("team_id") as string) || undefined,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    nickname: (formData.get("nickname") as string) || undefined,
    birthday: formData.get("birthday") as string,
    position: formData.get("position") as string,
    jersey_number: parseInt(formData.get("jersey_number") as string) || undefined,
  };

  const parsed = playerUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "Revisa los campos e inténtalo de nuevo.",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const existingPlayer = await env.DB.prepare(`SELECT id, profile_id FROM players WHERE id = ?`)
      .bind(parsed.data.id)
      .first<{ id: number; profile_id: string }>();

    if (!existingPlayer) {
      return {
        success: 0,
        errors: 1,
        message: "El jugador no existe",
        body,
      };
    }

    const profile = await env.DB.prepare(`SELECT id FROM profiles WHERE id = ?`).bind(parsed.data.profile_id).first();

    if (!profile) {
      return {
        success: 0,
        errors: 1,
        message: "El perfil no existe",
        body,
      };
    }

    const profileConflict = await env.DB.prepare(`SELECT id FROM players WHERE profile_id = ? AND id != ?`)
      .bind(parsed.data.profile_id, parsed.data.id)
      .first();

    if (profileConflict) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe otro jugador para este perfil",
        body,
      };
    }

    if (parsed.data.team_id) {
      const team = await env.DB.prepare(`SELECT id FROM teams WHERE id = ?`).bind(parsed.data.team_id).first();

      if (!team) {
        return {
          success: 0,
          errors: 1,
          message: "El equipo no existe",
          body,
        };
      }
    }

    await env.DB.prepare(
      `
      UPDATE players 
      SET team_id = ?, profile_id = ?, first_name = ?, last_name = ?, nickname = ?, birthday = ?, position = ?, jersey_number = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
    )
      .bind(
        parsed.data.team_id || null,
        parsed.data.profile_id,
        parsed.data.first_name,
        parsed.data.last_name,
        parsed.data.nickname || null,
        parsed.data.birthday,
        parsed.data.position,
        parsed.data.jersey_number || null,
        parsed.data.id,
      )
      .run();

    revalidatePath("/admin/dashboard/players");

    return {
      success: 1,
      errors: 0,
      message: `Jugador "${parsed.data.first_name} ${parsed.data.last_name}" actualizado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating player:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar el jugador. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function deletePlayer(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para eliminar jugadores",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID del jugador inválido",
      body: {
        id: 0,
      },
    };
  }

  const body = {
    id,
  };

  const parsed = playerDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "ID del jugador inválido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const existingPlayer = await env.DB.prepare(`SELECT id, first_name, last_name FROM players WHERE id = ?`)
      .bind(parsed.data.id)
      .first<{ id: number; first_name: string; last_name: string }>();

    if (!existingPlayer) {
      return {
        success: 0,
        errors: 1,
        message: "El jugador no existe",
        body,
      };
    }

    const hasEventPlayers = await env.DB.prepare(`SELECT COUNT(*) as count FROM event_players WHERE player_id = ?`)
      .bind(parsed.data.id)
      .first<{ count: number }>();

    if ((hasEventPlayers?.count ?? 0) > 0) {
      return {
        success: 0,
        errors: 1,
        message: "No se puede eliminar el jugador porque está asociado a eventos de partidos",
        body,
      };
    }

    await env.DB.prepare(`DELETE FROM players WHERE id = ?`).bind(parsed.data.id).run();

    revalidatePath("/admin/dashboard/players");

    return {
      success: 1,
      errors: 0,
      message: `Jugador "${existingPlayer.first_name} ${existingPlayer.last_name}" eliminado exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error deleting player:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar el jugador. Inténtalo de nuevo.",
      body,
    };
  }
}
