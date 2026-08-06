/**
 * Firestore security rules test (ADR-003).
 * Run under `firebase emulators:exec --only firestore` via `pnpm --filter @momentia/firebase test:rules`.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rules = readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8');

const env = process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';
const [host, port] = env.split(':');

const testEnv = await initializeTestEnvironment({
  projectId: 'demo-momentia',
  firestore: { rules, host, port },
});

const uid = 'test-user-123';
const authed = testEnv.authenticatedContext(uid);

async function seed() {
  const admin = testEnv.unauthenticatedContext();
  // Seed via Admin SDK paths isn't allowed by rules; write directly using the
  // Firestore emulator's unrestricted path (bypasses rules) through setOverride.
  const ref = testEnv.withSecurityRulesDisabled(async (ctx) => {
    await ctx.firestore().doc('invitations/zul-angga').set({
      status: 'published',
      slug: 'zul-angga',
      updatedAt: '2026-08-06T00:00:00.000Z',
    });
    await ctx.firestore().doc('invitations/draft-event').set({ status: 'draft', slug: 'draft-event' });
    await ctx.firestore().doc('tenants/tenant-a').set({ name: 'Tenant A' });
    return true;
  });
  await ref;
}

try {
  await seed();

  // 1. Public can read a published invitation (SSR read path).
  await assertSucceeds(testEnv.unauthenticatedContext().firestore().doc('invitations/zul-angga').get());

  // 2. Public CANNOT read a draft invitation.
  await assertFails(testEnv.unauthenticatedContext().firestore().doc('invitations/draft-event').get());

  // 3. Anonymous clients cannot write anything (all writes go through NestJS API).
  await assertFails(
    testEnv.unauthenticatedContext().firestore().doc('tenants/tenant-a').update({ name: 'Hacked' })
  );

  // 4. Even an authenticated client cannot write to tenants directly.
  await assertFails(authed.firestore().doc('tenants/tenant-a').update({ name: 'Hacked' }));

  // 5. Public can read the theme catalog.
  await assertSucceeds(testEnv.unauthenticatedContext().firestore().doc('themes/luxury').get());

  // 6. No client can create arbitrary documents.
  await assertFails(
    testEnv.unauthenticatedContext().firestore().doc('couples/anything').set({ pwned: true })
  );

  console.log('✅ Firestore rules: all assertions passed');
} finally {
  await testEnv.cleanup();
}