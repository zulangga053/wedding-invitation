#!/usr/bin/env bash
#
# setup-secrets.sh — Set GitHub Actions secrets untuk deploy Momentia.
#
# AMAN: nilai dibaca dari environment variable lokal (jangan ditulis di sini),
# bukan dari chat. Jalankan:
#   chmod +x scripts/setup-secrets.sh
#   ./scripts/setup-secrets.sh
#
# Sebelum menjalankan, export nilai-nilai dulu di terminal Anda:
#   export VERCEL_TOKEN="..." GCP_SA_KEY="$(cat sa.json)" ... dst
#
set -euo pipefail

REPO="zulangga053/wedding-invitation"

# Daftar secret: NAMA_VARIABEL_LOCAL|NAMA_SECRET_GITHUB
SECRETS=(
  "VERCEL_TOKEN|VERCEL_TOKEN"
  "VERCEL_ORG_ID|VERCEL_ORG_ID"
  "VERCEL_PROJECT_ID|VERCEL_PROJECT_ID"
  "NEXT_PUBLIC_FIREBASE_API_KEY|NEXT_PUBLIC_FIREBASE_API_KEY"
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN|NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID|NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET|NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID|NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  "NEXT_PUBLIC_FIREBASE_APP_ID|NEXT_PUBLIC_FIREBASE_APP_ID"
  "GCP_SA_KEY|GCP_SA_KEY"
  "GCP_PROJECT_ID|GCP_PROJECT_ID"
  "FIREBASE_PROJECT_ID|FIREBASE_PROJECT_ID"
  "FIREBASE_CLIENT_EMAIL|FIREBASE_CLIENT_EMAIL"
  "FIREBASE_PRIVATE_KEY|FIREBASE_PRIVATE_KEY"
  "REDIS_URL|REDIS_URL"
)

echo "→ Menyiapkan secrets ke repo: $REPO"
for entry in "${SECRETS[@]}"; do
  local_var="${entry%%|*}"
  gh_secret="${entry##*|}"
  if [ -z "${!local_var:-}" ]; then
    echo "  ⚠ skip ${gh_secret} (env ${local_var} kosong)"
    continue
  fi
  val="${!local_var}"
  # Kirim via stdin agar aman dari arg/riwayat shell
  printf '%s' "$val" | gh secret set "$gh_secret" --repo "$REPO"
  echo "  ✓ ${gh_secret} ter-set"
done

echo ""
echo "→ Set variable publik non-secret:"
if [ -n "${VERCEL_PROJECT_NAME:-}" ]; then
  gh variable set VERCEL_PROJECT_NAME --body "$VERCEL_PROJECT_NAME" --repo "$REPO" || true
  echo "  ✓ VERCEL_PROJECT_NAME = ${VERCEL_PROJECT_NAME}"
fi

echo ""
echo "Selesai. Secret yang belum di-export akan di-skip; jalankan lagi setelah diisi."