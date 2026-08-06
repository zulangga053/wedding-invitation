# Momentia — Architecture

## 1. Layered architecture (3-layer)

```
[apps/web — Next.js]         SSR/ISR, rendering, SEO, server actions (lightweight admin forms)
        │  REST (Bearer Firebase ID token)
        ▼
[apps/api — NestJS]          Business logic, validation, rate limiting, audit, multi-tenant guards
        │  Firebase Admin SDK (service account)
        ▼
[Firestore · Firebase Storage · Firebase Auth]
```

- `apps/web` never touches Firestore for writes; it reads only public read-models server-side.
- `apps/api` is a **modular monolith** (DDD): each business domain is a Nest module
  (`tenants`, `events`, `sections`, `guests`, `rsvp`, `wishes`, `gallery`, `gifts`, `analytics`,
  `themes`, `plugins`, `subscriptions`, `billing`, `ai`, `admin`, `audit`, `files`).
- Both apps consume `packages/shared` (entities + zod) — a single source of truth.

## 2. Data model

- `tenants/{tenantId}` — a brand/organization. Owns members, events, settings, stats.
- `tenants/{tenantId}/events/{eventId}` — a generic event (wedding, birthday, seminar, ...).
- `tenants/{tenantId}/events/{eventId}/sections/{sectionId}` — page-builder blocks.
- `invitations/{slug}` — **materialized read model** rebuilt on publish/update (ADR-002).
- `reserved-slugs/{slug}` — transactional uniqueness lock for global invitation URLs.
- `themes`, `plans`, `featureFlags`, `auditLogs`.

## 3. Multi-tenant isolation

- Data lives under `tenants/{id}/...` (path-based isolation).
- `TenantGuard` verifies `tenants/{id}/members/{uid}` on every tenant-scoped route.
- Super admins (custom claim `superAdmin`) bypass membership checks.

## 4. Security model (ADR-003)

Firestore is treated as a **private datastore**. Clients can only:
- read published `invitations/{slug}`,
- read public `themes`, `plans`, `featureFlags`.

All writes flow through the API which enforces zod validation, rate limiting, and audit.
Storage is private except a validated `public/**` prefix (served read-only).

## 5. API conventions

- Global prefix `/v1`.
- Consistent error envelope: `{ statusCode, message, code?, issues?, path, timestamp }` via `AllExceptionsFilter`.
- Request payloads validated at the boundary with `ZodPipe`.
- Auth: `Authorization: Bearer <Firebase ID token>`; routes opt out with `@Public()`.

## 6. Deployment

- `apps/web` → Vercel (functions + ISR).
- `apps/api` → Cloud Run (asia-southeast2) — long-running process, warm instances, Redis nearby.
- Firebase → Firestore (asia-southeast2), Storage, Auth.
- CI: GitHub Actions (`lint → typecheck → test → build`, plus Firestore rules assertions).

## 7. Roadmap phases

- **MVP**: auth, tenants, events, page-builder sections, public invitation (SSR + read-model),
  RSVP/wishes/gifts, guest CRUD, analytics counters, i18n, SEO.
- **V1**: QR check-in + import/export, sharing, streaming, subdomains, super-admin.
- **V2**: theme marketplace, plugin registry, custom domains, AI providers, payments.
- **SaaS**: billing/tiering, white-label, public API.