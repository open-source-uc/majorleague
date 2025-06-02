"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { Tables, TablesInsert, TablesUpdate } from "@/lib/types/database";

import { ActionResponse, createErrorResponse, createSuccessResponse } from "./types";

type Match = Tables<"matches">;
type MatchInsert = TablesInsert<"matches">;
type MatchUpdate = TablesUpdate<"matches">;

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

export async function getMatches() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, local_team_id (id, name), visitor_team_id (id, name), competition_id (id, name), stream_id, date, match_time, location, local_score, visitor_score, created_at",
    )
    .order("date", { ascending: true });

  if (error) return null;

  return data as any; // Complex join result
}

export async function createMatch(
  prev: ActionResponse<MatchInsert>,
  formData: FormData,
): Promise<ActionResponse<MatchInsert>> {
  try {
    const supabase = await createClient();

    const schema = z.object({
      local_team_id: uuidSchema.optional(),
      visitor_team_id: uuidSchema.optional(),
      competition_id: uuidSchema.optional(),
      stream_id: uuidSchema.nullable().optional(),
      date: z.string().min(1, "Date is required").optional(),
      match_time: z.string().min(1, "Match time is required").optional(),
      location: z.string().min(1, "Location is required").optional(),
      local_score: z.number().min(0, "Local score must be 0 or greater").optional(),
      visitor_score: z.number().min(0, "Visitor score must be 0 or greater").optional(),
    });

    const body: MatchInsert = {
      local_team_id: (formData.get("local_team_id") as string)?.trim() || null,
      visitor_team_id: (formData.get("visitor_team_id") as string)?.trim() || null,
      competition_id: (formData.get("competition_id") as string)?.trim() || null,
      stream_id: (formData.get("stream_id") as string)?.trim() || null,
      date: (formData.get("date") as string)?.trim() || null,
      match_time: (formData.get("match_time") as string)?.trim() || null,
      location: (formData.get("location") as string)?.trim() || null,
      local_score: formData.get("local_score") ? Number(formData.get("local_score")) : null,
      visitor_score: formData.get("visitor_score") ? Number(formData.get("visitor_score")) : null,
    };

    const { success, data, error: validationError } = schema.safeParse(body);

    if (!success) {
      return createErrorResponse(`Validation failed: ${validationError.errors.map((e) => e.message).join(", ")}`, body);
    }

    const { error } = await supabase.from("matches").insert(data);

    if (error) {
      return createErrorResponse(error.message || "Error creating match", body);
    }

    return createSuccessResponse("Match created successfully", {
      local_team_id: null,
      visitor_team_id: null,
      competition_id: null,
      stream_id: null,
      date: null,
      match_time: null,
      location: null,
      local_score: null,
      visitor_score: null,
    });
  } catch (error) {
    return createErrorResponse("Unexpected error creating match", {
      local_team_id: (formData.get("local_team_id") as string) || null,
      visitor_team_id: (formData.get("visitor_team_id") as string) || null,
      competition_id: (formData.get("competition_id") as string) || null,
      stream_id: (formData.get("stream_id") as string) || null,
      date: (formData.get("date") as string) || null,
      match_time: (formData.get("match_time") as string) || null,
      location: (formData.get("location") as string) || null,
      local_score: formData.get("local_score") ? Number(formData.get("local_score")) : null,
      visitor_score: formData.get("visitor_score") ? Number(formData.get("visitor_score")) : null,
    });
  }
}

export async function updateMatch(
  prev: ActionResponse<MatchUpdate & { id: string }>,
  formData: FormData,
): Promise<ActionResponse<MatchUpdate & { id: string }>> {
  try {
    const supabase = await createClient();

    const schema = z
      .object({
        id: uuidSchema,
        local_team_id: uuidSchema.optional(),
        visitor_team_id: uuidSchema.optional(),
        competition_id: uuidSchema.optional(),
        stream_id: uuidSchema.nullable().optional(),
        date: z.string().min(1, "Date cannot be empty").optional(),
        match_time: z.string().min(1, "Match time cannot be empty").optional(),
        location: z.string().min(1, "Location cannot be empty").optional(),
        local_score: z.number().min(0, "Local score must be 0 or greater").optional(),
        visitor_score: z.number().min(0, "Visitor score must be 0 or greater").optional(),
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

    const body: MatchUpdate & { id: string } = {
      id: (formData.get("id") as string).trim(),
      local_team_id: (formData.get("local_team_id") as string)?.trim() || undefined,
      visitor_team_id: (formData.get("visitor_team_id") as string)?.trim() || undefined,
      competition_id: (formData.get("competition_id") as string)?.trim() || undefined,
      stream_id: (formData.get("stream_id") as string)?.trim() || undefined,
      date: (formData.get("date") as string)?.trim() || undefined,
      match_time: (formData.get("match_time") as string)?.trim() || undefined,
      location: (formData.get("location") as string)?.trim() || undefined,
      local_score: formData.get("local_score") ? Number(formData.get("local_score")) : undefined,
      visitor_score: formData.get("visitor_score") ? Number(formData.get("visitor_score")) : undefined,
    };

    const { success, data, error: validationError } = schema.safeParse(body);

    if (!success) {
      return createErrorResponse(`Validation failed: ${validationError.errors.map((e) => e.message).join(", ")}`, body);
    }

    const updateData: MatchUpdate = {};
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined && value !== null && value !== "") {
        (updateData as any)[key] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse("No valid fields to update", body);
    }

    const { error } = await supabase.from("matches").update(updateData).eq("id", data.id);

    if (error) {
      return createErrorResponse(error.message || "Error updating match", body);
    }

    return createSuccessResponse("Match updated successfully", body);
  } catch (error) {
    return createErrorResponse("Unexpected error updating match", {
      id: (formData.get("id") as string) || "",
      local_team_id: (formData.get("local_team_id") as string) || undefined,
      visitor_team_id: (formData.get("visitor_team_id") as string) || undefined,
      competition_id: (formData.get("competition_id") as string) || undefined,
      stream_id: (formData.get("stream_id") as string) || undefined,
      date: (formData.get("date") as string) || undefined,
      match_time: (formData.get("match_time") as string) || undefined,
      location: (formData.get("location") as string) || undefined,
      local_score: formData.get("local_score") ? Number(formData.get("local_score")) : undefined,
      visitor_score: formData.get("visitor_score") ? Number(formData.get("visitor_score")) : undefined,
    });
  }
}

export async function deleteMatch(
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

    const { error } = await supabase.from("matches").delete().eq("id", data.id);

    if (error) {
      return createErrorResponse(error.message || "Error deleting match", body);
    }

    return createSuccessResponse("Match deleted successfully", body);
  } catch (error) {
    return createErrorResponse("Unexpected error deleting match", {
      id: (formData.get("id") as string) || "",
    });
  }
}
