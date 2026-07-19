begin;

create extension if not exists pgcrypto;

create type public.education_record_status as enum ('active', 'archived');
create type public.education_document_type as enum ('RG', 'RNE', 'CPF', 'OTHER');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.education_records (
  id uuid primary key default gen_random_uuid(),
  protocol_hash text not null,
  status public.education_record_status not null default 'active',
  student_name text not null check (char_length(student_name) between 3 and 180),
  birth_date date not null,
  document_type public.education_document_type not null,
  document_number text not null check (char_length(document_number) between 3 and 40),
  mother_name text check (mother_name is null or char_length(mother_name) between 3 and 180),
  father_name text check (father_name is null or char_length(father_name) between 3 and 180),
  education_level text not null check (char_length(education_level) between 2 and 180),
  completion_date date not null,
  notes text check (notes is null or char_length(notes) <= 1000),
  institution_name text not null check (char_length(institution_name) between 3 and 220),
  institution_creation_act text check (institution_creation_act is null or char_length(institution_creation_act) <= 1000),
  publication_text text check (publication_text is null or char_length(publication_text) <= 1000),
  created_by uuid not null references public.admin_users(user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint education_records_dates_check check (completion_date >= birth_date)
);

create unique index education_records_protocol_hash_uq on public.education_records(protocol_hash);
create index education_records_created_at_idx on public.education_records(created_at desc);
create index education_records_student_name_idx on public.education_records using gin (to_tsvector('portuguese', student_name));

alter table public.admin_users enable row level security;
alter table public.education_records enable row level security;

revoke all on public.admin_users from anon, authenticated;
revoke all on public.education_records from anon, authenticated;

comment on table public.admin_users is 'Allowlist de usuarios do Supabase Auth autorizados como administradores.';
comment on column public.education_records.protocol_hash is 'HMAC SHA-256 do protocolo; o valor em claro nao e persistido.';

commit;
