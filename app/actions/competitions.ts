"use server";

import { revalidatePath } from "next/cache";

import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";

import { getAuthStatus } from "@/lib/services/auth";
import type { Competition } from "@/lib/types";

// Validation schemas
const competitionCreateSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre de la competición debe tener al menos 2 caracteres")
    .max(100, "El nombre de la competición no puede exceder los 100 caracteres"),
  year: z.number().min(2020, "El año debe ser posterior a 2020").max(2050, "El año no puede ser posterior a 2050"),
  semester: z.number().min(1, "El semestre debe ser 1 o 2").max(2, "El semestre debe ser 1 o 2"),
  start_timestamp: z.string().min(1, "La fecha y hora de inicio es requerida"),
  end_timestamp: z.string().min(1, "La fecha y hora de fin es requerida"),
});

const competitionUpdateSchema = z.object({
  id: z.number().min(1, "El ID de la competición es requerido"),
  name: z
    .string()
    .min(2, "El nombre de la competición debe tener al menos 2 caracteres")
    .max(100, "El nombre de la competición no puede exceder los 100 caracteres"),
  year: z.number().min(2020, "El año debe ser posterior a 2020").max(2050, "El año no puede ser posterior a 2050"),
  semester: z.number().min(1, "El semestre debe ser 1 o 2").max(2, "El semestre debe ser 1 o 2"),
  start_timestamp: z.string().min(1, "La fecha y hora de inicio es requerida"),
  end_timestamp: z.string().min(1, "La fecha y hora de fin es requerida"),
});

const competitionDeleteSchema = z.object({
  id: z.number().min(1, "El ID de la competición es requerido"),
});

// Database operations
export async function getCompetitions(): Promise<Competition[]> {
  const { env } = getRequestContext();
  const competitions = await env.DB.prepare(
    `
    SELECT id, name, year, semester, start_timestamp, end_timestamp, created_at
    FROM competitions
    ORDER BY year DESC, semester DESC
  `,
  ).all<Competition>();

  return competitions.results || [];
}

export async function getCompetitionById(id: number): Promise<Competition | null> {
  const { env } = getRequestContext();
  const competition = await env.DB.prepare(
    `
    SELECT id, name, year, semester, start_timestamp, end_timestamp, created_at
    FROM competitions
    WHERE id = ?
  `,
  )
    .bind(id)
    .first<Competition>();

  return competition || null;
}

// Server actions
export async function createCompetition(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      name: string;
      year: number;
      semester: number;
      start_timestamp: string;
      end_timestamp: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para crear competiciones",
      body: {
        name: formData.get("name") as string,
        year: parseInt(formData.get("year") as string) || 0,
        semester: parseInt(formData.get("semester") as string) || 0,
        start_timestamp: formData.get("start_timestamp") as string,
        end_timestamp: formData.get("end_timestamp") as string,
      },
    };
  }

  const body = {
    name: formData.get("name") as string,
    year: parseInt(formData.get("year") as string) || 0,
    semester: parseInt(formData.get("semester") as string) || 0,
    start_timestamp: formData.get("start_timestamp") as string,
    end_timestamp: formData.get("end_timestamp") as string,
  };

  const parsed = competitionCreateSchema.safeParse(body);

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
    const existingCompetition = await env.DB.prepare(
      `
      SELECT id FROM competitions WHERE year = ? AND semester = ?
    `,
    )
      .bind(parsed.data.year, parsed.data.semester)
      .first();

    if (existingCompetition) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe una competición para este año y semestre",
        body,
      };
    }

    const startDate = new Date(parsed.data.start_timestamp);
    const endDate = new Date(parsed.data.end_timestamp);

    if (startDate >= endDate) {
      return {
        success: 0,
        errors: 1,
        message: "La fecha de inicio debe ser anterior a la fecha de fin",
        body,
      };
    }

    await env.DB.prepare(
      `
      INSERT INTO competitions (name, year, semester, start_timestamp, end_timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    )
      .bind(
        parsed.data.name,
        parsed.data.year,
        parsed.data.semester,
        parsed.data.start_timestamp,
        parsed.data.end_timestamp,
      )
      .run();

    revalidatePath("/admin/dashboard/competitions");

    return {
      success: 1,
      errors: 0,
      message: `Competición "${parsed.data.name}" creada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error creating competition:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al crear la competición. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function updateCompetition(
  _prev: {
    errors: number;
    success: number;
    message: string;
    body: {
      id: number;
      name: string;
      year: number;
      semester: number;
      start_timestamp: string;
      end_timestamp: string;
    };
  },
  formData: FormData,
) {
  const { isAdmin } = await getAuthStatus();
  if (!isAdmin) {
    return {
      success: 0,
      errors: 1,
      message: "No tienes permisos para actualizar competiciones",
      body: {
        id: parseInt(formData.get("id") as string) || 0,
        name: formData.get("name") as string,
        year: parseInt(formData.get("year") as string) || 0,
        semester: parseInt(formData.get("semester") as string) || 0,
        start_timestamp: formData.get("start_timestamp") as string,
        end_timestamp: formData.get("end_timestamp") as string,
      },
    };
  }

  const id = parseInt(formData.get("id") as string);
  if (isNaN(id)) {
    return {
      success: 0,
      errors: 1,
      message: "ID de la competición inválido",
      body: {
        id: 0,
        name: formData.get("name") as string,
        year: parseInt(formData.get("year") as string) || 0,
        semester: parseInt(formData.get("semester") as string) || 0,
        start_timestamp: formData.get("start_timestamp") as string,
        end_timestamp: formData.get("end_timestamp") as string,
      },
    };
  }

  const body = {
    id,
    name: formData.get("name") as string,
    year: parseInt(formData.get("year") as string) || 0,
    semester: parseInt(formData.get("semester") as string) || 0,
    start_timestamp: formData.get("start_timestamp") as string,
    end_timestamp: formData.get("end_timestamp") as string,
  };

  const parsed = competitionUpdateSchema.safeParse(body);

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
    const existingCompetition = await env.DB.prepare(
      `
      SELECT id FROM competitions WHERE id = ?
    `,
    )
      .bind(parsed.data.id)
      .first();

    if (!existingCompetition) {
      return {
        success: 0,
        errors: 1,
        message: "La competición no existe",
        body,
      };
    }

    const yearSemesterConflict = await env.DB.prepare(
      `
      SELECT id FROM competitions WHERE year = ? AND semester = ? AND id != ?
    `,
    )
      .bind(parsed.data.year, parsed.data.semester, parsed.data.id)
      .first();

    if (yearSemesterConflict) {
      return {
        success: 0,
        errors: 1,
        message: "Ya existe otra competición para este año y semestre",
        body,
      };
    }

    const startDate = new Date(parsed.data.start_timestamp);
    const endDate = new Date(parsed.data.end_timestamp);

    if (startDate >= endDate) {
      return {
        success: 0,
        errors: 1,
        message: "La fecha de inicio debe ser anterior a la fecha de fin",
        body,
      };
    }

    await env.DB.prepare(
      `
      UPDATE competitions 
      SET name = ?, year = ?, semester = ?, start_timestamp = ?, end_timestamp = ?
      WHERE id = ?
    `,
    )
      .bind(
        parsed.data.name,
        parsed.data.year,
        parsed.data.semester,
        parsed.data.start_timestamp,
        parsed.data.end_timestamp,
        parsed.data.id,
      )
      .run();

    revalidatePath("/admin/dashboard/competitions");

    return {
      success: 1,
      errors: 0,
      message: `Competición "${parsed.data.name}" actualizada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error updating competition:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al actualizar la competición. Inténtalo de nuevo.",
      body,
    };
  }
}

export async function deleteCompetition(
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
      message: "No tienes permisos para eliminar competiciones",
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
      message: "ID de la competición inválido",
      body: {
        id: 0,
      },
    };
  }

  const body = {
    id,
  };

  const parsed = competitionDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return {
      success: 0,
      errors: 1,
      message: "ID de la competición inválido",
      body,
    };
  }

  const { env } = getRequestContext();

  try {
    const existingCompetition = await env.DB.prepare(
      `
      SELECT id, name FROM competitions WHERE id = ?
    `,
    )
      .bind(parsed.data.id)
      .first<{ id: number; name: string }>();

    if (!existingCompetition) {
      return {
        success: 0,
        errors: 1,
        message: "La competición no existe",
        body,
      };
    }

    const hasMatches = await env.DB.prepare(
      `
      SELECT COUNT(*) as count FROM matches WHERE competition_id = ?
    `,
    )
      .bind(parsed.data.id)
      .first<{ count: number }>();

    const hasTeamCompetitions = await env.DB.prepare(
      `
      SELECT COUNT(*) as count FROM team_competitions WHERE competition_id = ?
    `,
    )
      .bind(parsed.data.id)
      .first<{ count: number }>();

    if ((hasMatches?.count ?? 0) > 0 || (hasTeamCompetitions?.count ?? 0) > 0) {
      return {
        success: 0,
        errors: 1,
        message: "No se puede eliminar la competición porque tiene partidos o equipos asociados",
        body,
      };
    }

    await env.DB.prepare(
      `
      DELETE FROM competitions WHERE id = ?
    `,
    )
      .bind(parsed.data.id)
      .run();

    revalidatePath("/admin/dashboard/competitions");

    return {
      success: 1,
      errors: 0,
      message: `Competición "${existingCompetition.name}" eliminada exitosamente`,
      body,
    };
  } catch (error) {
    console.error("Error deleting competition:", error);
    return {
      success: 0,
      errors: 1,
      message: "Error al eliminar la competición. Inténtalo de nuevo.",
      body,
    };
  }
}
