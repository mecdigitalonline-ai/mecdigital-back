begin;

alter table public.education_records add column if not exists protocol_ciphertext text;
comment on column public.education_records.protocol_ciphertext is 'Protocolo cifrado com AES-256-GCM para recuperacao exclusiva pelo painel administrativo.';

commit;
