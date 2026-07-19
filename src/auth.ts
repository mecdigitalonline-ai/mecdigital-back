import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthorizeAdmin = (authorizationHeader?: string) => Promise<string | null>;

export function createSupabaseAdminAuthorizer(client: SupabaseClient): AuthorizeAdmin {
  return async (authorizationHeader) => {
    const token = authorizationHeader?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return null;
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return null;
    const { data: admin, error: adminError } = await client
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (adminError || !admin) return null;
    return data.user.id;
  };
}
