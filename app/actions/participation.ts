"use server";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { JoinTeamRequest } from "@/lib/types";

const participationSchema = z.object({
  birthdate: z.string().min(1, "Fecha de nacimiento es requerida"),
  major: z.string().min(1, "Carrera es requerida"),
  position: z.string().min(1, "Posición es requerida"),
  generation: z.string().min(1, "Generación es requerida"),
  teamId: z.string().min(1, "Equipo es requerido"),
  notes: z.string().optional(),
  firstName: z.string().min(1, "Nombre es requerido"),
  lastName: z.string().min(1, "Apellido es requerido"),
  nickname: z.string().optional(),
});

export async function ActionParticipation(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      birthdate: string;
      major: string;
      position: string;
      generation: string;
      teamId: string;
      notes: string;
      firstName: string;
      lastName: string;
      nickname: string;
    };
  },
  formData: FormData,
) {
  const { isAuthenticated, userProfile } = await getAuthStatus();

  if (!isAuthenticated || !userProfile) {
    return {
      success: 0,
      errors: 1,
      message: "Debes iniciar sesión para participar",
      body: {
        birthdate: "",
        major: "",
        position: "",
        generation: "",
        teamId: "",
        notes: "",
        firstName: "",
        lastName: "",
        nickname: "",
      },
    };
  }

  const body = {
    birthdate: (formData.get("birthdate") as string)?.trim() || "",
    major: (formData.get("major") as string)?.trim() || "",
    position: (formData.get("position") as string)?.trim() || "",
    generation: (formData.get("generation") as string)?.trim() || "",
    teamId: (formData.get("teamId") as string)?.trim() || "",
    notes: (formData.get("notes") as string)?.trim() || "",
    firstName: (formData.get("firstName") as string)?.trim() || "",
    lastName: (formData.get("lastName") as string)?.trim() || "",
    nickname: (formData.get("nickname") as string)?.trim() || "",
  };

  const birthDate = new Date(body.birthdate);
  const today = new Date();
  let calculatedAge = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    calculatedAge--;
  }

  // Validate age
  if (calculatedAge < 15 || calculatedAge > 50) {
    return {
      success: 0,
      errors: 1,
      message: "La edad debe estar entre 15 y 50 años",
      body,
    };
  }

  const parsed = participationSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: `${parsed.error.errors.map((e) => e.message).join(", ")}`,
      body,
    };
  }

  try {
    const context = getRequestContext();

    const existingPendingRequest = await context.env.DB.prepare(
      "SELECT id FROM join_team_requests WHERE profile_id = ? AND status = 'pending'",
    )
      .bind(userProfile.id)
      .first();

    if (existingPendingRequest) {
      return {
        success: 0,
        errors: 1,
        message: "Ya tienes una solicitud pendiente. Espera la respuesta antes de enviar otra.",
        body,
      };
    }

    const existingPlayer = await context.env.DB.prepare("SELECT id FROM players WHERE profile_id = ? AND team_id = ?")
      .bind(userProfile.id, parseInt(parsed.data.teamId))
      .first();

    if (existingPlayer) {
      return {
        success: 0,
        errors: 1,
        message: "Ya eres miembro de este equipo.",
        body,
      };
    }

    const team = await context.env.DB.prepare("SELECT id FROM teams WHERE id = ?")
      .bind(parseInt(parsed.data.teamId))
      .first();

    if (!team) {
      return {
        success: 0,
        errors: 1,
        message: "El equipo seleccionado no existe",
        body,
      };
    }

    await context.env.DB.prepare(
      `
      INSERT INTO join_team_requests (
        team_id, profile_id, date, first_name, last_name, nickname, birthday, 
        preferred_position, status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
    )
      .bind(
        parseInt(parsed.data.teamId),
        userProfile.id,
        new Date().toISOString().split("T")[0], // Current date for the request
        parsed.data.firstName,
        parsed.data.lastName,
        parsed.data.nickname || null,
        parsed.data.birthdate, // Birthday field
        parsed.data.position,
        parsed.data.notes || null,
      )
      .run();

    return {
      success: 1,
      errors: 0,
      message: "Tu solicitud ha sido enviada con éxito. Te contactaremos pronto.",
      body,
    };
  } catch (error) {
    console.error("Error creating participation:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error inesperado al crear la participación. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function hasParticipated(profileId: string): Promise<boolean> {
  try {
    const context = getRequestContext();
    const request = await context.env.DB.prepare(
      "SELECT status FROM join_team_requests WHERE profile_id = ? AND status = 'pending' LIMIT 1",
    )
      .bind(profileId)
      .first<{ status: string }>();

    return request?.status === "pending";
  } catch (error) {
    console.error("Error checking participation:", error);
    return false;
  }
}

export async function getParticipation(profileId: string): Promise<(JoinTeamRequest & { team_name?: string }) | null> {
  try {
    const context = getRequestContext();
    const request = await context.env.DB.prepare(
      `
      SELECT jtr.id, jtr.team_id, jtr.profile_id, jtr.date, jtr.first_name, jtr.last_name, jtr.nickname, jtr.birthday, 
             jtr.preferred_position, jtr.status, jtr.notes, jtr.created_at, jtr.updated_at,
             t.name as team_name
      FROM join_team_requests jtr
      LEFT JOIN teams t ON jtr.team_id = t.id
      WHERE jtr.profile_id = ? 
      ORDER BY jtr.created_at DESC 
      LIMIT 1
    `,
    )
      .bind(profileId)
      .first<JoinTeamRequest & { team_name?: string }>();

    return request || null;
  } catch (error) {
    console.error("Error getting participation:", error);
    return null;
  }
}

export async function deleteParticipation(profileId: string): Promise<boolean> {
  try {
    const context = getRequestContext();
    await context.env.DB.prepare("DELETE FROM join_team_requests WHERE profile_id = ? AND status = 'pending'")
      .bind(profileId)
      .run();

    return true;
  } catch (error) {
    console.error("Error deleting participation:", error);
    return false;
  }
}
