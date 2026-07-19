begin;

create table if not exists public.site_settings (
  id text primary key,
  logo_link text check (logo_link is null or logo_link ~ '^https?://'),
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton_check check (id = 'branding')
);

insert into public.site_settings (id, logo_link) values ('branding', null) on conflict (id) do nothing;
alter table public.site_settings enable row level security;
revoke all on public.site_settings from anon, authenticated;

commit;
