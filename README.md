# Momentia

Enterprise SaaS digital invitation platform — create, customize, publish, and manage premium event websites without writing code. Multi-tenant, extensible, and production-focused.

## Monorepo (pnpm + Turborepo)

| Package | Path | Description |
|---|---|---|
| `@momentia/web` | `apps/web` | Next.js 16 App Router (landing, dashboard, public invitations) |
| `@momentia/api` | `apps/api` | NestJS modular monolith — REST API (REST, DDD, multi-tenant) |
| `@momentia/shared` | `packages/shared` | Entities, zod schemas, enums — source of truth |
| `@momentia/firebase` | `packages/firebase` | Firestore rules, indexes, local emulator tooling |
| `@momentia/config` | `packages/config` | Shared eslint / tsconfig bases |

## Requirements

- Node.js ≥ 20.11.1
- pnpm ≥ 9 (corepack recommended)
- Java 11+ (17 recommended) for Firebase Emulators — **no Docker required**

## Getting started

```bash
pnpm install
pnpm db:emulate          # start Firestore/Auth/Storage emulator (Java + firebase-tools)
pnpm dev                # run web + api with watch (Turbo)
```

### Env config

Copy the examples before running:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Development runs against the local emulators, so **no real Firebase credentials are required to start coding or testing**. Production / Cloud Run needs a Firebase service account (set `FIREBASE_*`).

## Commands (from repo root)

```bash
pnpm lint       # ESLint across all packages
pnpm typecheck  # tsc --noEmit
pnpm test       # unit + integration (vitest/jest + Firestore emulator for rules)
pnpm build      # production build (turbo, dependency-ordered)
pnpm db:test    # Firestore security rules assertions
```

## Architecture highlights

- **Clean Architecture** with feature-based modules and the repository pattern (see `docs/ARCHITECTURE.md`).
- **Multi-tenant isolation** — every tenant owns its data under `tenants/{id}/...`; access enforced server-side.
- **Materialized read model** (`invitations/{slug}`) so the public page reads a single document — fast SSR + ISR/CDN caching.
- **ADR-003**: Firestore is a private datastore — all writes go through the API (validation/rate-limiting/audit centralized).
- **Pluggable payments & AI**: provider-agnostic interfaces (`PaymentProvider`, `AiProvider`) ready for Midtrans/Xendit and any AI model.

## Documentation

See `docs/`:
- `docs/SRS.md` — requirements
- `docs/ARCHITECTURE.md` — architecture & decisions
- `docs/DATABASE.md` — schema, collections, indexes

## License

UNLICENSED (private). © Momentia.