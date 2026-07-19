import { createClient } from "@supabase/supabase-js";
import { createApp } from "./app.js";
import { createSupabaseAdminAuthorizer } from "./auth.js";
import { SupabaseBrandStore } from "./branding.js";
import { SupabaseRecordRepository } from "./repository.js";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function createConfiguredApp() {
  const supabase = createClient(required("SUPABASE_URL"), required("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  return createApp({
    repository: new SupabaseRecordRepository(supabase),
    brandStore: new SupabaseBrandStore(supabase),
    authorizeAdmin: createSupabaseAdminAuthorizer(supabase),
    protocolPepper: required("PROTOCOL_PEPPER"),
    allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "").split(",").map((origin) => origin.trim()).filter(Boolean)
  });
}
