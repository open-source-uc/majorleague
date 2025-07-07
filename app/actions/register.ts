// // Server action to register a new user
// "use server";

// import { revalidatePath } from "next/cache";

// import { z } from "zod";

// import { createClient } from "@/lib/supabase/server";

// export async function ActionRegister(
//   prev: {
//     errors: number;
//     success: number;
//     message: string;
//     body: {
//       first_name: string;
//       last_name: string;
//       email: string;
//       password: string;
//     };
//   },
//   formData: FormData,
// ) {
//   const supabase = await createClient();

//   const schema = z.object({
//     first_name: z.string().min(1, "First name is required"),
//     last_name: z.string().min(1, "Last name is required"),
//     email: z.string().email(),
//     password: z.string().min(6),
//   });

//   const body = {
//     first_name: formData.get("first_name") as string,
//     last_name: formData.get("last_name") as string,
//     email: formData.get("email") as string,
//     password: formData.get("password") as string,
//   };

//   const { success, data } = schema.safeParse(body);

//   if (!success) {
//     return {
//       errors: 1,
//       success: 0,
//       message: "Datos inválidos",
//       body,
//     };
//   }

//   const { error } = await supabase.auth.signUp({
//     email: data.email,
//     password: data.password,
//     options: {
//       data: {
//         first_name: data.first_name,
//         last_name: data.last_name,
//       },
//     },
//   });
//   console.log(error);

//   if (error) {
//     return {
//       errors: 1,
//       success: 0,
//       message: "Registro fallido: " + error.message,
//       body,
//     };
//   } else {
//     revalidatePath("/");
//     return {
//       errors: 0,
//       success: 1,
//       message: "Registro exitoso, por favor revisa tu correo electrónico para verificar tu cuenta.",
//       body,
//     };
//   }
// }
