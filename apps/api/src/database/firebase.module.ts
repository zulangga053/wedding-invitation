import { DynamicModule, Global, Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { FIREBASE_ENV, type FirebaseEnv } from './firebase.tokens';

@Global()
@Module({})
export class FirebaseModule {
  static forRoot(env: FirebaseEnv): DynamicModule {
    return {
      module: FirebaseModule,
      providers: [
        { provide: FIREBASE_ENV, useValue: env },
        FirebaseAdminService,
      ],
      exports: [FirebaseAdminService],
    };
  }
}
