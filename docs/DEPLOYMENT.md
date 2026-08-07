# Deployment Runbook — Momentia (Production, Biaya Minimal)

Aplikasi di-deploy **gratis / hampir gratis** dengan strategi hemat:

- **Firebase Spark (gratis)** untuk Auth + Firestore.
- **Vercel Hobby (gratis)** untuk Web (Next.js).
- **Google Cloud Run (bayar per pemakaian, ~$0 saat idle)** untuk API (NestJS).
- **Redis opsional** — kosongkan `REDIS_URL` agar fallback in-memory (LRU) dipakai.

Antrean deploy otomatis via GitHub Actions pada `push` ke `main` (`.github/workflows/ci.yml`), yang sudah saya perbaiki agar memakai `cd apps/web && next build` (bukan `turbo`).

---

## Prasyarat Akun Cloud

| Layanan      | Akun yang dibutuhkan                   |
| :----------- | :------------------------------------- |
| Firebase     | console.firebase.google.com            |
| Vercel       | vercel.com (bisa hubungkan via GitHub) |
| Google Cloud | console.cloud.google.com               |

---

## Langkah 1 — Firebase (gratis)

1. Buka [Firebase Console](https://console.firebase.google.com/) → **Add project** (misal `momentia-prod`).
2. **Authentication** → Sign-in method → aktifkan **Email/Password**.
3. **Firestore** → **Create database** → pilih **Production mode** → pilih region.
4. Project settings → add **Web app** → salin `firebaseConfig`:
   `apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId`.

## Langkah 2 — Vercel (gratis)

1. Import repo GitHub di [vercel.com](https://vercel.com).
2. Framework **Next.js** (terdeteksi otomatis). Root Directory = `apps/web`.
3. Di **Settings → Environment Variables**, set **Production**:
   - `NEXT_PUBLIC_APP_ENV=production`
   - `NEXT_PUBLIC_SITE_URL=https://<app>.vercel.app`
   - `NEXT_PUBLIC_API_URL=https://<api-url>.run.app/v1`
   - `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false`
   - 6 variabel `NEXT_PUBLIC_FIREBASE_*` dari Firebase.
4. Deploy → kunjungi URL Vercel Anda.

## Langkah 3 — GitHub Secrets (untuk CI otomatis)

Di GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:

- `VERCEL_TOKEN` — dari [vercel.com/account/tokens](https://vercel.com/account/tokens)
- `VERCEL_ORG_ID` & `VERCEL_PROJECT_ID` → lihat `vercel pull` / dashboard
- `GCP_SA_KEY` → isi dengan JSON kunci service account GCP
- `GCP_PROJECT_ID` → ID proyek GCP
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` → kredensial service account Firebase Admin **Production**
- `REDIS_URL` → kosongkan agar memakai rate-limit in-memory (LRU)

## Langkah 4 — Cloud Run

CI (`deploy` job) akan otomatis:

1. `docker build` (pakai `apps/api/Dockerfile` multi-stage, tanpa turbo).
2. Push ke Google Artifact Registry.
3. `deploy-cloudrun` ke `momentia-api`, region `us-central1`, scale `0–1` instance, `256Mi` (biaya minimal).

---

## Verifikasi Setelah Deploy

- `curl https://<api-url>/v1/health` → `{"status":"ok","firebaseConfigured":true}`
- Buka URL Vercel → register → login → buat undangan → publish → buka `/invitation/<slug>`.

## Catatan Biaya (estimasi real)

- Spark + Hobby + Cloud Run idle = **$0/bulan**
- Trafik aktif: Vercel Hobby sudah cukup; Cloud Run billing ~$0.03/1M invocations; Firestore Spark gratis s.d. kuota.
- Upgrade ke Vercel Pro ($20/bln) / Blaze hanya jika dibutuhkan.
