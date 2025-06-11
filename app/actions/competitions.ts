"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { Tables, TablesInsert, TablesUpdate } from "@/lib/types/database";

import { ActionResponse, createErrorResponse, createSuccessResponse } from "./types";

type Competition = Tables<"competitions">;
type CompetitionInsert = TablesInsert<"competitions">;
type CompetitionUpdate = TablesUpdate<"competitions">;

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid UUID format");

export async function getCompetitions() {
  // 2 sec promise for testing
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("id, name, year, semester, start_date, end_date")
    .order("name", { ascending: true });

  if (error) return null;

  return data as Competition[];
}

export async function deleteCompetition(
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

    const { error } = await supabase.from("competitions").delete().eq("id", data.id);

    if (error) {
      return createErrorResponse(error.message || "Error deleting competition", body);
    }

    return createSuccessResponse("Competition deleted successfully", body);
  } catch (error) {
    return createErrorResponse("Unexpected error deleting competition", {
      id: (formData.get("id") as string) || "",
    });
  }
}

export async function createCompetition(
  prev: ActionResponse<CompetitionInsert>,
  formData: FormData,
): Promise<ActionResponse<CompetitionInsert>> {
  try {
    const supabase = await createClient();

    const schema = z.object({
      name: z.string().min(1, "Competition name is required"),
      year: z.number().min(2000, "Year must be 2000 or later"),
      semester: z.string().min(1, "Semester is required").optional(),
      start_date: z.string().min(1, "Start date is required").optional(),
      end_date: z.string().min(1, "End date is required").optional(),
    });

    const body: CompetitionInsert = {
      name: (formData.get("name") as string).trim(),
      year: Number(formData.get("year")),
      semester: (formData.get("semester") as string)?.trim() || null,
      start_date: (formData.get("start_date") as string)?.trim() || null,
      end_date: (formData.get("end_date") as string)?.trim() || null,
    };

    const { success, data, error: validationError } = schema.safeParse(body);

    if (!success) {
      return createErrorResponse(`Validation failed: ${validationError.errors.map((e) => e.message).join(", ")}`, body);
    }

    const { error } = await supabase.from("competitions").insert(data);

    if (error) {
      return createErrorResponse(error.message || "Error creating competition", body);
    }

    return createSuccessResponse("Competition created successfully", {
      name: "",
      year: 0,
      semester: null,
      start_date: null,
      end_date: null,
    });
  } catch (error) {
    return createErrorResponse("Unexpected error creating competition", {
      name: (formData.get("name") as string) || "",
      year: Number(formData.get("year")) || 0,
      semester: (formData.get("semester") as string) || null,
      start_date: (formData.get("start_date") as string) || null,
      end_date: (formData.get("end_date") as string) || null,
    });
  }
}

export async function updateCompetition(
  prev: ActionResponse<CompetitionUpdate & { id: string }>,
  formData: FormData,
): Promise<ActionResponse<CompetitionUpdate & { id: string }>> {
  try {
    const supabase = await createClient();

    const schema = z
      .object({
        id: uuidSchema,
        name: z.string().min(1, "Competition name cannot be empty").optional(),
        year: z.number().min(2000, "Year must be 2000 or later").optional(),
        semester: z.string().min(1, "Semester cannot be empty").optional(),
        start_date: z.string().min(1, "Start date cannot be empty").optional(),
        end_date: z.string().min(1, "End date cannot be empty").optional(),
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

    const body: CompetitionUpdate & { id: string } = {
      id: (formData.get("id") as string).trim(),
      name: (formData.get("name") as string)?.trim() || undefined,
      year: formData.get("year") ? Number(formData.get("year")) : undefined,
      semester: (formData.get("semester") as string)?.trim() || undefined,
      start_date: (formData.get("start_date") as string)?.trim() || undefined,
      end_date: (formData.get("end_date") as string)?.trim() || undefined,
    };

    const { success, data, error: validationError } = schema.safeParse(body);

    if (!success) {
      return createErrorResponse(`Validation failed: ${validationError.errors.map((e) => e.message).join(", ")}`, body);
    }

    const updateData: CompetitionUpdate = {};
    Object.entries(data).forEach(([key, value]) => {
      if (key !== "id" && value !== undefined && value !== null && value !== "") {
        (updateData as any)[key] = value;
      }
    });

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse("No valid fields to update", body);
    }

    const { error } = await supabase.from("competitions").update(updateData).eq("id", data.id);

    if (error) {
      return createErrorResponse(error.message || "Error updating competition", body);
    }

    return createSuccessResponse("Competition updated successfully", body);
  } catch (error) {
    return createErrorResponse("Unexpected error updating competition", {
      id: (formData.get("id") as string) || "",
      name: (formData.get("name") as string) || undefined,
      year: formData.get("year") ? Number(formData.get("year")) : undefined,
      semester: (formData.get("semester") as string) || undefined,
      start_date: (formData.get("start_date") as string) || undefined,
      end_date: (formData.get("end_date") as string) || undefined,
    });
  }
}
