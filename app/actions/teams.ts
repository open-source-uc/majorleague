"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { Tables, TablesInsert, TablesUpdate } from "@/lib/types/database";

import { ActionResponse, createErrorResponse, createSuccessResponse } from "./types";

type Team = Tables<"teams">;
type TeamInsert = TablesInsert<"teams">;
type TeamUpdate = TablesUpdate<"teams">;

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

export async function getTeams() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, major, captain_id, created_at")
    .order("name", { ascending: true });

  if (error) return null;

  return data as Team[];
}

export async function createTeam(
  prev: ActionResponse<TeamInsert>,
  formData: FormData,
): Promise<ActionResponse<TeamInsert>> {
  try {
    const supabase = await createClient();

    const schema = z.object({
      name: z.string().min(1, "Team name is required"),
      major: z.string().min(1, "Major is required").optional(),
      captain_id: z.string().uuid().nullable().optional(),
    });

    const body: TeamInsert = {
      name: formData.get("name") as string,
      major: (formData.get("major") as string) || null,
      captain_id: null,
    };

    const { success, data, error: validationError } = schema.safeParse(body);

    if (!success) {
      return createErrorResponse(`Validation failed: ${validationError.errors.map((e) => e.message).join(", ")}`, body);
    }

    const { error } = await supabase.from("teams").insert(data);

    if (error) {
      return createErrorResponse(error.message || "Error creating team", body);
    }

    return createSuccessResponse("Team created successfully", {
      name: "",
      major: null,
      captain_id: null,
    });
  } catch (error) {
    return createErrorResponse("Unexpected error creating team", {
      name: formData.get("name") as string,
      major: (formData.get("major") as string) || null,
      captain_id: null,
    });
  }
}

export async function updateTeam(
  prev: ActionResponse<TeamUpdate & { id: string }>,
  formData: FormData,
): Promise<ActionResponse<TeamUpdate & { id: string }>> {
  try {
    const supabase = await createClient();

    const schema = z
      .object({
        id: uuidSchema,
        name: z.string().min(1, "Team name cannot be empty").optional(),
        major: z.string().min(1, "Major cannot be empty").optional(),
        captain_id: z.string().uuid().nullable().optional(),
      })
      .refine(
        (data) => {
          const hasValidFields = Object.entries(data).some(([key, value]) => {
            if (key === "id") return false;
            return value !== undefined && value !== null && value !== "";
          });
          return hasValidFields;
        },
        {
          message: "At least one field must be provided for update",
        },
      );

    const body: TeamUpdate & { id: string } = {
      id: (formData.get("id") as string).trim(),
      name: (formData.get("name") as string)?.trim() || undefined,
      major: (formData.get("major") as string)?.trim() || undefined,
      captain_id: null,
    };

    const { success, data, error: validationError } = schema.safeParse(body);

    if (!success) {
      return createErrorResponse(`Validation failed: ${validationError.errors.map((e) => e.message).join(", ")}`, body);
    }

    const updateData: TeamUpdate = {};
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined && value !== null && value !== "") {
        updateData[key as keyof TeamUpdate] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse("No valid fields to update", body);
    }

    const { error } = await supabase.from("teams").update(updateData).eq("id", data.id);

    if (error) {
      return createErrorResponse(error.message || "Error updating team", body);
    }

    return createSuccessResponse("Team updated successfully", body);
  } catch (error) {
    return createErrorResponse("Unexpected error updating team", {
      id: (formData.get("id") as string) || "",
      name: (formData.get("name") as string) || undefined,
      major: (formData.get("major") as string) || undefined,
      captain_id: null,
    });
  }
}

export async function deleteTeam(
  prev: ActionResponse<{ id: string }>,
  formData: FormData,
): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createClient();

    const schema = z.object({
      id: uuidSchema,
    });

    const body = {
      id: (formData.get("id") as string).trim(),
    };

    const { success, data, error: validationError } = schema.safeParse(body);

    if (!success) {
      return createErrorResponse(`Validation failed: ${validationError.errors.map((e) => e.message).join(", ")}`, body);
    }

    const { error } = await supabase.from("teams").delete().eq("id", data.id);

    if (error) {
      return createErrorResponse(error.message || "Error deleting team", body);
    }

    return createSuccessResponse("Team deleted successfully", body);
  } catch (error) {
    return createErrorResponse("Unexpected error deleting team", {
      id: (formData.get("id") as string) || "",
    });
  }
}
