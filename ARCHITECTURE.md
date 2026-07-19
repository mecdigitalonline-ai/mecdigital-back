# ARCHITECTURE — MecDigital Back

**Fonte:** análise direta do código
**Data:** 2026-07-18

Express 5 exportado como Vercel Function. `app.ts` possui rotas/middlewares, `domain/protocol.ts` possui protocolo e máscaras, `repository.ts` encapsula Supabase e `auth.ts` valida o administrador. A aplicação é stateless. Gates: `npm test`, `npm run typecheck`, `npm run build` e `npm audit`.
