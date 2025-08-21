"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { JoinTeamRequest, Player } from "@/lib/types";

export async function getCaptainJoinRequests(captainId: string): Promise<JoinTeamRequest[]> {
  const { env } = getRequestContext();

  const requests = await env.DB.prepare(
    `
    SELECT jtr.id, jtr.team_id, jtr.profile_id, jtr.timestamp, jtr.first_name, jtr.last_name, 
           jtr.nickname, jtr.birthday, jtr.preferred_position, jtr.preferred_jersey_number, 
           jtr.status, jtr.notes, jtr.created_at, jtr.updated_at,
           t.name as team_name, p.username as profile_username
    FROM join_team_requests jtr
    LEFT JOIN teams t ON jtr.team_id = t.id
    LEFT JOIN profiles p ON jtr.profile_id = p.id
    WHERE t.captain_id = ? AND jtr.status = 'pending'
    ORDER BY jtr.created_at DESC
  `,
  )
    .bind(captainId)
    .all<JoinTeamRequest & { team_name?: string; profile_username?: string }>();

  return requests.results || [];
}

export async function getCaptainTeamPlayers(captainId: string): Promise<Player[]> {
  const { env } = getRequestContext();

  const players = await env.DB.prepare(
    `
    SELECT p.id, p.team_id, p.profile_id, p.first_name, p.last_name, p.nickname, 
           p.birthday, p.position, p.jersey_number, p.created_at, p.updated_at,
           pr.username as profile_username, t.name as team_name
    FROM players p
    LEFT JOIN profiles pr ON p.profile_id = pr.id
    LEFT JOIN teams t ON p.team_id = t.id
    WHERE t.captain_id = ?
    ORDER BY p.jersey_number ASC, p.last_name ASC
  `,
  )
    .bind(captainId)
    .all<Player & { profile_username?: string; team_name?: string }>();

  return players.results || [];
}

const approveRequestSchema = z.object({
  request_id: z.number().min(1, "ID de solicitud requerido"),
  jersey_number: z.number().min(1).max(99).optional(),
});

const rejectRequestSchema = z.object({
  request_id: z.number().min(1, "ID de solicitud requerido"),
  rejection_reason: z.string().max(500).optional(),
});

const updatePlayerNicknameSchema = z.object({
  player_id: z.number().min(1, "ID del jugador requerido"),
  nickname: z.string().max(50).optional(),
});

async function checkCaptainPermission(teamId?: number): Promise<{
  canManage: boolean;
  captainId?: string;
  message?: string;
}> {
  const { userProfile } = await getAuthStatus();

  if (!userProfile) {
    return { canManage: false, message: "Usuario no autenticado" };
  }

  if (teamId) {
    const { env } = getRequestContext();
    const team = await env.DB.prepare(
      `
      SELECT captain_id FROM teams WHERE id = ?
    `,
    )
      .bind(teamId)
      .first<{ captain_id: string }>();

    if (!team || team.captain_id !== userProfile.id) {
      return { canManage: false, message: "Solo el capitán del equipo puede realizar esta acción" };
    }
  }

  return { canManage: true, captainId: userProfile.id };
}

export async function approveJoinRequest(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      request_id: number;
      jersey_number?: number;
    };
  },
  formData: FormData,
) {
  const body = {
    request_id: parseInt(formData.get("request_id") as string),
    jersey_number: formData.get("jersey_number") ? parseInt(formData.get("jersey_number") as string) : undefined,
  };

  const parsed = approveRequestSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "Datos inválidos",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const request = await env.DB.prepare(
      `
      SELECT jtr.*, t.captain_id, t.name as team_name
      FROM join_team_requests jtr
      LEFT JOIN teams t ON jtr.team_id = t.id
      WHERE jtr.id = ? AND jtr.status = 'pending'
    `,
    )
      .bind(parsed.data.request_id)
      .first<JoinTeamRequest & { captain_id: string; team_name?: string }>();

    if (!request) {
      return {
        success: 0,
        errors: 1,
        message: "Solicitud no encontrada o ya procesada",
        body,
      };
    }

    const authCheck = await checkCaptainPermission(request.team_id);
    if (!authCheck.canManage) {
      return {
        success: 0,
        errors: 1,
        message: authCheck.message || "Sin permisos",
        body,
      };
    }

    if (parsed.data.jersey_number || request.preferred_jersey_number) {
      const existingPlayer = await env.DB.prepare(
        `
        SELECT id FROM players WHERE team_id = ? AND jersey_number = ?
      `,
      )
        .bind(request.team_id, parsed.data.jersey_number || request.preferred_jersey_number)
        .first();

      if (existingPlayer) {
        return {
          success: 0,
          errors: 1,
          message: `El número ${parsed.data.jersey_number || request.preferred_jersey_number} ya está ocupado`,
          body,
        };
      }
    }

    if (parsed.data.jersey_number) {
      await env.DB.prepare(
        `
        UPDATE join_team_requests 
        SET preferred_jersey_number = ?, status = 'approved'
        WHERE id = ?
      `,
      )
        .bind(parsed.data.jersey_number, parsed.data.request_id)
        .run();
    } else {
      await env.DB.prepare(
        `
        UPDATE join_team_requests 
        SET status = 'approved'
        WHERE id = ?
      `,
      )
        .bind(parsed.data.request_id)
        .run();
    }

    revalidatePath("/captain/dashboard");

    return {
      success: 1,
      errors: 0,
      message: `${request.first_name} ${request.last_name} ha sido agregado al equipo ${request.team_name || ""}`,
      body,
    };
  } catch (error) {
    console.error("Error approving join request:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al aprobar la solicitud. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function rejectJoinRequest(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      request_id: number;
      rejection_reason?: string;
    };
  },
  formData: FormData,
) {
  const body = {
    request_id: parseInt(formData.get("request_id") as string),
    rejection_reason: (formData.get("rejection_reason") as string) || undefined,
  };

  const parsed = rejectRequestSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "Datos inválidos",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const request = await env.DB.prepare(
      `
      SELECT jtr.*, t.captain_id, t.name as team_name
      FROM join_team_requests jtr
      LEFT JOIN teams t ON jtr.team_id = t.id
      WHERE jtr.id = ? AND jtr.status = 'pending'
    `,
    )
      .bind(parsed.data.request_id)
      .first<JoinTeamRequest & { captain_id: string; team_name?: string }>();

    if (!request) {
      return {
        success: 0,
        errors: 1,
        message: "Solicitud no encontrada o ya procesada",
        body,
      };
    }

    const authCheck = await checkCaptainPermission(request.team_id);
    if (!authCheck.canManage) {
      return {
        success: 0,
        errors: 1,
        message: authCheck.message || "Sin permisos",
        body,
      };
    }

    await env.DB.prepare(
      `
      UPDATE join_team_requests 
      SET status = 'rejected', notes = ?
      WHERE id = ?
    `,
    )
      .bind(parsed.data.rejection_reason || null, parsed.data.request_id)
      .run();

    revalidatePath("/captain/dashboard");

    return {
      success: 1,
      errors: 0,
      message: `Solicitud de ${request.first_name} ${request.last_name} rechazada`,
      body,
    };
  } catch (error) {
    console.error("Error rejecting join request:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al rechazar la solicitud. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function removePlayerFromTeam(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      player_id: number;
    };
  },
  formData: FormData,
) {
  const body = {
    player_id: parseInt(formData.get("player_id") as string),
  };

  if (!body.player_id) {
    return {
      success: 0,
      errors: 1,
      message: "ID del jugador requerido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const player = await env.DB.prepare(
      `
      SELECT p.*, t.captain_id, t.name as team_name
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.id = ?
    `,
    )
      .bind(body.player_id)
      .first<Player & { captain_id: string; team_name?: string }>();

    if (!player) {
      return {
        success: 0,
        errors: 1,
        message: "Jugador no encontrado",
        body,
      };
    }

    const authCheck = await checkCaptainPermission(player.team_id || undefined);
    if (!authCheck.canManage) {
      return {
        success: 0,
        errors: 1,
        message: authCheck.message || "Sin permisos",
        body,
      };
    }

    await env.DB.prepare(
      `
      DELETE FROM players WHERE id = ?
    `,
    )
      .bind(body.player_id)
      .run();

    revalidatePath("/captain/dashboard");

    return {
      success: 1,
      errors: 0,
      message: `${player.first_name} ${player.last_name} ha sido removido del equipo`,
      body,
    };
  } catch (error) {
    console.error("Error removing player:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al remover el jugador. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updatePlayerNickname(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      player_id: number;
      nickname?: string;
    };
  },
  formData: FormData,
) {
  const body = {
    player_id: parseInt(formData.get("player_id") as string),
    nickname: (formData.get("nickname") as string) || undefined,
  };

  const parsed = updatePlayerNicknameSchema.safeParse(body);
  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "Datos inválidos",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const player = await env.DB.prepare(
      `
      SELECT p.*, t.captain_id, t.name as team_name
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.id = ?
    `,
    )
      .bind(parsed.data.player_id)
      .first<Player & { captain_id: string; team_name?: string }>();

    if (!player) {
      return {
        success: 0,
        errors: 1,
        message: "Jugador no encontrado",
        body,
      };
    }

    const authCheck = await checkCaptainPermission(player.team_id || undefined);
    if (!authCheck.canManage) {
      return {
        success: 0,
        errors: 1,
        message: authCheck.message || "Sin permisos",
        body,
      };
    }

    await env.DB.prepare(
      `
      UPDATE players 
      SET nickname = ?
      WHERE id = ?
    `,
    )
      .bind(parsed.data.nickname || null, parsed.data.player_id)
      .run();

    revalidatePath("/captain/dashboard");

    return {
      success: 1,
      errors: 0,
      message: parsed.data.nickname
        ? `Apodo de ${player.first_name} actualizado a "${parsed.data.nickname}"`
        : `Apodo de ${player.first_name} eliminado`,
      body,
    };
  } catch (error) {
    console.error("Error updating player nickname:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar el apodo. Inténtalo de nuevo.",
      body,
    };
  }
}
