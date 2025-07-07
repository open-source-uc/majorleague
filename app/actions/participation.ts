// "use server";

// import { z } from "zod";

// import { createErrorResponse, createSuccessResponse } from "@/actions/types";
// import { createClient } from "@/lib/supabase/server";

// const schema = z.object({
//   birthdate: z.string().min(1, "Fecha de nacimiento es requerida"),
//   major: z.string().min(1, "Major es requerido"),
//   position: z.string().min(1, "Posición es requerida"),
//   generation: z.string().min(1, "Generación es requerida"),
//   teamId: z.string().min(1, "Equipo es requerido"),
//   notes: z.string().optional(),
// });

// export async function ActionParticipation(
//   prev: {
//     errors: number;
//     success: number;
//     message: string;
//     body: {
//       birthdate: string;
//       major: string;
//       position: string;
//       generation: string;
//       teamId: string;
//       notes: string;
//     };
//   },
//   formData: FormData,
// ) {
//   try {
//     const supabase = await createClient();

//     // Get current user session
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();

//     if (!session) {
//       return createErrorResponse("Debes iniciar sesión para participar", {
//         birthdate: "",
//         major: "",
//         position: "",
//         generation: "",
//         teamId: "",
//         notes: "",
//       });
//     }

//     const userId = session.user.id;

//     const body = {
//       birthdate: (formData.get("birthdate") as string).trim(),
//       major: (formData.get("major") as string).trim(),
//       position: (formData.get("position") as string).trim(),
//       generation: (formData.get("generation") as string).trim(),
//       teamId: (formData.get("teamId") as string).trim(),
//       notes: (formData.get("notes") as string).trim(),
//     };

//     const { success, data, error: validationError } = schema.safeParse(body);

//     if (!success) {
//       return createErrorResponse(`${validationError.errors.map((e) => e.message).join(", ")}`, body);
//     }

//     const { error } = await supabase.from("join_team_requests").insert({
//       profile_id: userId,
//       birthdate: data.birthdate,
//       major: data.major,
//       preferred_position: data.position,
//       gen: data.generation,
//       team_id: data.teamId,
//       notes: data.notes,
//     });

//     if (error) {
//       return createErrorResponse(error.message || "Error creating participation", body);
//     }

//     return createSuccessResponse("Tu solicitud ha sido enviada con éxito", body);
//   } catch (error) {
//     return createErrorResponse("Error inesperado al crear la participación", {
//       birthdate: (formData.get("birthdate") as string)?.trim() || "",
//       major: (formData.get("major") as string)?.trim() || "",
//       position: (formData.get("position") as string)?.trim() || "",
//       generation: (formData.get("generation") as string)?.trim() || "",
//       teamId: (formData.get("teamId") as string)?.trim() || "",
//       notes: (formData.get("notes") as string)?.trim() || "",
//     });
//   }
// }

// export async function hasParticipated(userId: string) {
//   const supabase = await createClient();
//   const { data, error } = await supabase
//     .from("join_team_requests")
//     .select("status")
//     .eq("profile_id", userId)
//     .limit(1)
//     .maybeSingle();
//   if (error) {
//     return false;
//   }
//   return data?.status == "pending" ? true : false;
// }

// export async function getParticipation(userId: string) {
//   const supabase = await createClient();
//   const { data, error } = await supabase
//     .from("join_team_requests")
//     .select("*")
//     .eq("profile_id", userId)
//     .limit(1)
//     .maybeSingle();
//   if (error) {
//     return null;
//   }
//   return data;
// }

// export async function deleteParticipation(userId: string) {
//   const supabase = await createClient();
//   const { error } = await supabase.from("join_team_requests").delete().eq("profile_id", userId);
//   if (error) {
//     return false;
//   }
//   return true;
// }
