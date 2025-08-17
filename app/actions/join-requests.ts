"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { JoinTeamRequest } from "@/lib/types";
import { calculateAge } from "@/lib/utils/cn";

// Validation schemas
const joinRequestCreateSchema = z.object({
  team_id: z.number().min(1, "El ID del equipo es requerido"),
  profile_id: z.string().min(1, "El ID del perfil es requerido"),
  first_name: z.string().min(1, "El nombre es requerido").max(50, "El nombre no puede exceder los 50 caracteres"),
  last_name: z.string().min(1, "El apellido es requerido").max(50, "El apellido no puede exceder los 50 caracteres"),
  nickname: z.string().optional(),
  birthday: z
    .string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine((date) => {
      const birthDate = new Date(date);
      const age = calculateAge(date);
      return !isNaN(birthDate.getTime()) && age >= 15 && age <= 50;
    }, "La edad debe estar entre 15 y 50 años"),
  preferred_position: z.enum(["GK", "DEF", "MID", "FWD"]),
  preferred_jersey_number: z.number().min(1).max(99).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  notes: z.string().optional(),
});

const joinRequestUpdateSchema = z.object({
  id: z.number().min(1, "El ID de la solicitud es requerido"),
  team_id: z.number().min(1, "El ID del equipo es requerido"),
  profile_id: z.string().min(1, "El ID del perfil es requerido"),
  first_name: z.string().min(1, "El nombre es requerido").max(50, "El nombre no puede exceder los 50 caracteres"),
  last_name: z.string().min(1, "El apellido es requerido").max(50, "El apellido no puede exceder los 50 caracteres"),
  nickname: z.string().optional(),
  birthday: z
    .string()
    .min(1, "La fecha de nacimiento es requerida")
    .refine((date) => {
      const birthDate = new Date(date);
      const age = calculateAge(date);
      return !isNaN(birthDate.getTime()) && age >= 15 && age <= 50;
    }, "La edad debe estar entre 15 y 50 años"),
  preferred_position: z.enum(["GK", "DEF", "MID", "FWD"]),
  preferred_jersey_number: z.number().min(1).max(99).optional(),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  notes: z.string().optional(),
});

const joinRequestDeleteSchema = z.object({
  id: z.number().min(1, "El ID de la solicitud es requerido"),
});

// Database operations
export async function getJoinTeamRequests(): Promise<JoinTeamRequest[]> {
  const { env } = getRequestContext();
  const requests = await env.DB.prepare(
    `
    SELECT jtr.id, jtr.team_id, jtr.profile_id, jtr.timestamp, jtr.first_name, jtr.last_name, jtr.nickname, jtr.birthday, 
           jtr.preferred_position, jtr.preferred_jersey_number, jtr.status, jtr.notes, jtr.created_at, jtr.updated_at,
           t.name as team_name, p.username as profile_username
    FROM join_team_requests jtr
    LEFT JOIN teams t ON jtr.team_id = t.id
    LEFT JOIN profiles p ON jtr.profile_id = p.id
    ORDER BY jtr.created_at DESC
  `,
  ).all<JoinTeamRequest & { team_name?: string; profile_username?: string }>();

  return requests.results || [];
}

export async function getJoinTeamRequestById(id: number): Promise<JoinTeamRequest | null> {
  const { env } = getRequestContext();
  const request = await env.DB.prepare(
    `
    SELECT jtr.id, jtr.team_id, jtr.profile_id, jtr.timestamp, jtr.first_name, jtr.last_name, jtr.birthday, 
           jtr.preferred_position, jtr.preferred_jersey_number, jtr.status, jtr.notes, jtr.created_at, jtr.updated_at,
           t.name as team_name, p.username as profile_username
    FROM join_team_requests jtr
    LEFT JOIN teams t ON jtr.team_id = t.id
    LEFT JOIN profiles p ON jtr.profile_id = p.id
    WHERE jtr.id = ?
  `,
  )
    .bind(id)
    .first<JoinTeamRequest>();

  return request || null;
}

// Server actions
export async function createJoinTeamRequest(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      team_id: number;
      profile_id: string;
      first_name: string;
      last_name: string;
      birthday: string;
      preferred_position: string;
      preferred_jersey_number?: number;
      status?: string;
      notes?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para crear solicitudes de unión",
      body: {
        team_id: parseInt(formData.get("team_id") as string) || 0,
        profile_id: formData.get("profile_id") as string,
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        birthday: formData.get("birthday") as string,
        preferred_position: formData.get("preferred_position") as string,
        preferred_jersey_number: formData.get("preferred_jersey_number") ? parseInt(formData.get("preferred_jersey_number") as string) : undefined,
        status: formData.get("status") as string,
        notes: formData.get("notes") as string,
      },
    };
  }

  const body = {
    team_id: parseInt(formData.get("team_id") as string) || 0,
    profile_id: formData.get("profile_id") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    birthday: formData.get("birthday") as string,
    preferred_position: formData.get("preferred_position") as string,
    preferred_jersey_number: formData.get("preferred_jersey_number") ? parseInt(formData.get("preferred_jersey_number") as string) : undefined,
    status: (formData.get("status") as string) || "pending",
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = joinRequestCreateSchema.safeParse(body);

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
    const team = await env.DB.prepare(`SELECT id FROM teams WHERE id = ?`).bind(parsed.data.team_id).first();

    if (!team) {
      return {
        success: 0,
        errors: 1,
        message: "El equipo no existe",
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

    const existingRequest = await env.DB.prepare(
      `SELECT id FROM join_team_requests WHERE team_id = ? AND profile_id = ?`,
    )
      .bind(parsed.data.team_id, parsed.data.profile_id)
      .first();

    if (existingRequest) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe una solicitud para este equipo y perfil",
        body,
      };
    }

    await env.DB.prepare(
      `
      INSERT INTO join_team_requests (team_id, profile_id, timestamp, first_name, last_name, nickname, birthday, preferred_position, status, notes, created_at, updated_at, preferred_jersey_number)
      VALUES (?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
    `,
    )
      .bind(
        parsed.data.team_id,
        parsed.data.profile_id,
        parsed.data.first_name,
        parsed.data.last_name,
        parsed.data.nickname || null,
        parsed.data.birthday,
        parsed.data.preferred_position,
        parsed.data.status || "pending",
        parsed.data.notes || null,
        parsed.data.preferred_jersey_number || null,
      )
      .run();

    revalidatePath("/admin/dashboard/join-requests");

    return {
      success: 1,
      errors: 0,
      message: `Solicitud de unión para "${parsed.data.first_name} ${parsed.data.last_name}" creada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating join team request:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear la solicitud de unión. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updateJoinTeamRequest(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
      team_id: number;
      profile_id: string;
      first_name: string;
      last_name: string;
      birthday: string;
      preferred_position: string;
      preferred_jersey_number?: number;
      status?: string;
      notes?: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para actualizar solicitudes de unión",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
        team_id: parseInt(formData.get("team_id") as string) || 0,
        profile_id: formData.get("profile_id") as string,
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        birthday: formData.get("birthday") as string,
        preferred_position: formData.get("preferred_position") as string,
        preferred_jersey_number: formData.get("preferred_jersey_number") ? parseInt(formData.get("preferred_jersey_number") as string) : undefined,
        status: formData.get("status") as string,
        notes: formData.get("notes") as string,
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID de la solicitud inválido",
      body: {
        id: 0,
        team_id: parseInt(formData.get("team_id") as string) || 0,
        profile_id: formData.get("profile_id") as string,
        first_name: formData.get("first_name") as string,
        last_name: formData.get("last_name") as string,
        birthday: formData.get("birthday") as string,
        preferred_position: formData.get("preferred_position") as string,
        preferred_jersey_number: formData.get("preferred_jersey_number") ? parseInt(formData.get("preferred_jersey_number") as string) : undefined,
        status: formData.get("status") as string,
        notes: formData.get("notes") as string,
      },
    };
  }

  const body = {
    id,
    team_id: parseInt(formData.get("team_id") as string) || 0,
    profile_id: formData.get("profile_id") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    birthday: formData.get("birthday") as string,
    preferred_position: formData.get("preferred_position") as string,
    preferred_jersey_number: formData.get("preferred_jersey_number") ? parseInt(formData.get("preferred_jersey_number") as string) : undefined,
    status: (formData.get("status") as string) || "pending",
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = joinRequestUpdateSchema.safeParse(body);

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
    const existingRequest = await env.DB.prepare(`SELECT id FROM join_team_requests WHERE id = ?`)
      .bind(parsed.data.id)
      .first();

    if (!existingRequest) {
      return {
        success: 0,
        errors: 1,
        message: "La solicitud no existe",
        body,
      };
    }

    const team = await env.DB.prepare(`SELECT id FROM teams WHERE id = ?`).bind(parsed.data.team_id).first();

    if (!team) {
      return {
        success: 0,
        errors: 1,
        message: "El equipo no existe",
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

    const duplicateRequest = await env.DB.prepare(
      `SELECT id FROM join_team_requests WHERE team_id = ? AND profile_id = ? AND id != ?`,
    )
      .bind(parsed.data.team_id, parsed.data.profile_id, parsed.data.id)
      .first();

    if (duplicateRequest) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe otra solicitud para este equipo y perfil",
        body,
      };
    }

    await env.DB.prepare(
      `
      UPDATE join_team_requests 
      SET team_id = ?, profile_id = ?, first_name = ?, last_name = ?, nickname = ?, birthday = ?, preferred_position = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP, preferred_jersey_number = ?
      WHERE id = ?
    `,
    )
      .bind(
        parsed.data.team_id,
        parsed.data.profile_id,
        parsed.data.first_name,
        parsed.data.last_name,
        parsed.data.nickname || null,
        parsed.data.birthday,
        parsed.data.preferred_position,
        parsed.data.status || "pending",
        parsed.data.notes || null,
        parsed.data.preferred_jersey_number || null,
        parsed.data.id,
      )
      .run();

    revalidatePath("/admin/dashboard/join-requests");

    return {
      success: 1,
      errors: 0,
      message: `Solicitud de unión para "${parsed.data.first_name} ${parsed.data.last_name}" actualizada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating join team request:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar la solicitud de unión. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function deleteJoinTeamRequest(
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
      message: "No tienes permisos para eliminar solicitudes de unión",
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
      message: "ID de la solicitud inválido",
      body: {
        id: 0,
      },
    };
  }

  const body = {
    id,
  };

  const parsed = joinRequestDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "ID de la solicitud inválido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const existingRequest = await env.DB.prepare(
      `SELECT id, first_name, last_name FROM join_team_requests WHERE id = ?`,
    )
      .bind(parsed.data.id)
      .first<{ id: number; first_name: string; last_name: string }>();

    if (!existingRequest) {
      return {
        success: 0,
        errors: 1,
        message: "La solicitud no existe",
        body,
      };
    }

    await env.DB.prepare(`DELETE FROM join_team_requests WHERE id = ?`).bind(parsed.data.id).run();

    revalidatePath("/admin/dashboard/join-requests");

    return {
      success: 1,
      errors: 0,
      message: `Solicitud de unión para "${existingRequest.first_name} ${existingRequest.last_name}" eliminada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error deleting join team request:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar la solicitud de unión. Inténtalo de nuevo.",
      body,
    };
  }
}
