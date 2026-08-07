# AGENTS.md — Konvensi Pengembangan Momentia

Panduan konvensi bagi developer & AI agent yang bekerja di repo ini. Ikuti selalu.

## Repo & Tooling

- **Monorepo pnpm + Turborepo.** Jangan jalankan `turbo build` di lokal — ada bug pnpm `runDepsStatusCheck`. Selalu build per-package:
  - `cd apps/web && pnpm build`
  - `cd apps/api && pnpm build`
  - `cd packages/shared && pnpm build`

## Perintah Standar

| Aksi      | Command                                                                        |
| :-------- | :----------------------------------------------------------------------------- |
| Dev web   | `cd apps/web && npx next dev`                                                  |
| Dev api   | `cd apps/api && pnpm start:dev`                                                |
| Emulator  | `cd packages/firebase && npx firebase emulators:start --project demo-momentia` |
| Lint web  | `cd apps/web && pnpm lint`                                                     |
| Typecheck | `cd apps/web && pnpm typecheck` (api: `npx tsc --noEmit`)                      |
| Test web  | `cd apps/web && npx vitest run`                                                |
| Build     | `cd apps/web && pnpm build` · `cd apps/api && pnpm build`                      |

## Firebase

- **Emulator mode** diaktifkan otomatis saat `NODE_ENV=development`. Backend inisialisasi tanpa kredensial & pakai `projectId: demo-momentia`.
- Token ID Firebase didapat via `getAuthToken()` di hooks `useApiQuery`/`useApiMutation`.
- Jangan commit `.env.local` / `.env` (kecuali `.env.example`). Secret & API key tidak boleh masuk git.

## Arsitektur

- **ADR-002**: Materialized read-model `invitations/{slug}` utk public page (1 read, ISR).
- **ADR-003**: Firestore = private datastore. Semua write lewat NestJS API. Client TIDAK boleh write langsung.
- Semua input divalidasi Zod di `packages/shared`, dipakai bersama frontend & backend.

## Testing

- Frontend pakai **Vitest + React Testing Library**. Test files: `*.test.tsx` di `__tests__/`. Dikecualikan dari typecheck/build Next.
- Backend pakai **Jest** (`*.spec.ts`).
- Rules Firestore: `pnpm db:test` (emulator).

## Git

- Commit message mengikuti **Conventional Commits** (`feat:`, `fix:`, `test:`, `ci:`, `docs:`).
- Sebelum push: jalankan `lint`, `typecheck`, dan `test` utk package yang diubah.
- Jangan commit file `.playwright-mcp/`, `screenshots/`, `.next/`, `dist/`.

## Keamanan

- Tidak ada secret/binding native esbuild bila perlu di bootstrap `pnpm approve-builds`.
- Rate-limit memakai `LRUCache` (in-memory) dengan fallback Redis bila `REDIS_URL` diset.
