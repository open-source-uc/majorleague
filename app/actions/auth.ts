import { createClient } from "@/lib/supabase/server";

export async function isAdmin() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    // Query profile with role in one call
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, first_name, last_name")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== 1) {
      return false;
    }

    return {
      ...user,
      profile: {
        role: profile.role,
        first_name: profile.first_name,
        last_name: profile.last_name,
      },
    };
  } catch (error) {
    return false;
  }
}

export async function isAuthUser() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return false;
    }

    return {
      ...user,
    };
  } catch (error) {
    return false;
  }
}
