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
    if (!this.config.projectId) {
      throw new Error(
        'Firebase is not configured — set FIREBASE_PROJECT_ID (or run the emulator)',
      );
    }

    const serviceAccount: ServiceAccount | undefined =
      this.config.clientEmail && this.config.privateKey
        ? {
            projectId: this.config.projectId,
            clientEmail: this.config.clientEmail,
            privateKey: this.config.privateKey.replace(/\\n/g, '\n'),
          }
        : undefined;

    this.app = initializeApp({
      projectId: this.config.projectId,
      credential: serviceAccount ? cert(serviceAccount) : undefined,
    });
    this.logger.log(
      `Firebase Admin initialized for project ${this.config.projectId}`,
    );
    return this.app;
  }
}
