import type { SupabaseClient } from "@supabase/supabase-js";

export interface Branding {
  logoUrl: string | null;
  logoLink: string | null;
}

export interface BrandStore {
  getBranding(): Promise<Branding>;
  uploadLogo(bytes: Buffer, contentType: string): Promise<string>;
  deleteLogo(): Promise<void>;
  updateLogoLink(logoLink: string | null): Promise<void>;
}

const BUCKET = "branding";
const LOGO_PATH = "logo";

export class SupabaseBrandStore implements BrandStore {
  constructor(private readonly client: SupabaseClient) {}

  async getBranding(): Promise<Branding> {
    const [{ data: objects, error: storageError }, { data: settings, error: settingsError }] = await Promise.all([
      this.client.storage.from(BUCKET).list("", { search: LOGO_PATH, limit: 10 }),
      this.client.from("site_settings").select("logo_link").eq("id", "branding").maybeSingle()
    ]);
    if (storageError) throw storageError;
    if (settingsError) throw settingsError;
    const logo = objects.find((item) => item.name === LOGO_PATH);
    let logoUrl: string | null = null;
    if (logo) {
      const { data } = this.client.storage.from(BUCKET).getPublicUrl(LOGO_PATH);
      const version = logo.updated_at ? new Date(logo.updated_at).getTime() : Date.now();
      logoUrl = `${data.publicUrl}?v=${version}`;
    }
    return { logoUrl, logoLink: settings?.logo_link ?? null };
  }

  async uploadLogo(bytes: Buffer, contentType: string): Promise<string> {
    const { error } = await this.client.storage.from(BUCKET).upload(LOGO_PATH, bytes, {
      contentType,
      cacheControl: "60",
      upsert: true
    });
    if (error) throw error;
    const { data } = this.client.storage.from(BUCKET).getPublicUrl(LOGO_PATH);
    return `${data.publicUrl}?v=${Date.now()}`;
  }

  async deleteLogo(): Promise<void> {
    const { error } = await this.client.storage.from(BUCKET).remove([LOGO_PATH]);
    if (error) throw error;
  }

  async updateLogoLink(logoLink: string | null): Promise<void> {
    const { error } = await this.client.from("site_settings").upsert({ id: "branding", logo_link: logoLink, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
}
