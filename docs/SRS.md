# Momentia — Software Requirements (SRS)

## 1. Purpose

Momentia is a multi-tenant SaaS platform for creating, customizing, publishing, and managing
premium event websites (weddings, engagements, birthdays, graduations, aqiqah, corporate events,
seminars, conferences, gatherings, religious events, and future types via plugins).

## 2. Personas

| Persona | Capabilities |
|---|---|
| Platform Owner | Tenant management, revenue, marketplace, plugins, feature flags, monitoring, audit logs |
| Event Organizer / Customer | Create tenants, events; build pages; manage guests; analytics; subscription |
| Guest | View invitation, RSVP, send wishes, gift confirmation, share — no account required |

## 3. Functional requirements (by module)

### Public invitation
- Hero with personalized greeting, countdown, story/timeline, event schedule + maps,
  gallery (masonry + lightbox), video, live stream, gift (bank/QRIS), RSVP, wishes,
  FAQ, contact, share, music player.
- Every section is a **page-builder block** (reorderable, enable/disable, per-block config).

### Customer dashboard
- Tenant & event management, page builder, gallery manager, guest manager (CRUD/import/export/QR),
  RSVP manager, gift settings, music, SEO settings, analytics, domain, subscription.

### Super admin
- Tenant management (suspend/activate), revenue dashboard, user management, content moderation,
  theme marketplace, plugin registry, feature flags, system monitoring, audit trail.

## 4. Non-functional requirements

| Aspect | Target |
|---|---|
| Performance | Lighthouse ≥ 95, LCP < 1.5s, TTFB < 100ms (read-model + ISR/CDN), lazy images |
| Security | OWASP Top 10, tenant isolation, no client Firestore writes, CSP, rate limiting |
| Accessibility | WCAG 2.1 AA |
| Scalability | 10k+ tenants, 1M+ guests; public pages served from cache |
| Reliability | 99.9%; heavy jobs async (Cloud Tasks in later phases) |
| Observability | Vercel Analytics, GA4, Sentry, structured audit logs |
| Maintainability | Clean Architecture, strict TS, coverage > 80%, small focused commits |

## 5. Validation rules

All entity/schema validation lives in `packages/shared` (zod) and is enforced at the API
boundary via `ZodPipe`:
- Slug: `^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$` (1–63 chars).
- RSVP/wishes/gift public submissions include a honeypot field (must be empty) and are rate-limited.
- Block data is validated against the per-block registry schema by `blockType`.

## 6. API surface (v1)

Public (rate-limited):
`POST /v1/public/events/:slug/rsvp`, `/wishes`, `/gifts/:giftId/confirm`, `/views`,
`GET /v1/public/events/:slug/wishes`.

Customer (Bearer):
`/v1/tenants` (CRUD), `/v1/tenants/:id/events` (CRUD + publish/unpublish),
`.../events/:id/sections` (builder), `.../guests` (+ import/export/QR), `.../gallery`,
`.../gifts`, `/v1/checkin`, `/v1/analytics/*`, `/v1/files/upload-url`.

Super admin (superAdmin claim):
`/v1/admin/tenants`, `/v1/admin/revenue`, `/v1/admin/themes`, `/v1/admin/plugins`,
`/v1/admin/feature-flags`, `/v1/admin/audit-logs`, `/v1/admin/monitoring`.

## 7. Out of scope for MVP

Payments (Midtrans/Xendit) and AI providers are **interfaces only**; concrete integrations land in V2.