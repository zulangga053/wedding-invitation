import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { FIREBASE_ENV, type FirebaseEnv } from './firebase.tokens';

/**
 * Wraps the Firebase Admin SDK. Initialization is lazy so the API still boots
 * in environments without credentials (tests) — any data/auth access then
 * throws a descriptive error instead of failing module bootstrap.
 */
@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: App | null = null;

  constructor(@Inject(FIREBASE_ENV) private readonly config: FirebaseEnv) {}

  get isConfigured(): boolean {
    return Boolean(this.config.projectId);
  }

  get firestore(): Firestore {
    return getFirestore(this.ensureApp());
  }

  get auth(): Auth {
    return getAuth(this.ensureApp());
  }

  private ensureApp(): App {
    if (this.app) return this.app;
    const existing = getApps()[0];
    if (existing) {
      this.app = existing;
      return existing;
    }

    const isEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

    if (isEmulator) {
      // For local development, initialize without credentials.
      // The Admin SDK will auto-discover the running emulators.
      this.app = initializeApp({ projectId: 'demo-momentia' });
      this.logger.log(
        'Firebase Admin initialized in EMULATOR mode for project demo-momentia',
      );
      return this.app;
    }

    // For production, require and use service account credentials.
    if (
      !this.config.projectId ||
      !this.config.clientEmail ||
      !this.config.privateKey
    ) {
      throw new Error(
        'Firebase production credentials are not configured — set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY',
      );
    }

    const serviceAccount: ServiceAccount = {
      projectId: this.config.projectId,
      clientEmail: this.config.clientEmail,
      privateKey: this.config.privateKey.replace(/\\n/g, '\n'),
    };

    this.app = initializeApp({
      projectId: this.config.projectId,
      credential: cert(serviceAccount),
    });
    this.logger.log(
      `Firebase Admin initialized in PRODUCTION mode for project ${this.config.projectId}`,
    );
    return this.app;
  }
}
