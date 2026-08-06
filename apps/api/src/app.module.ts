import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { loadEnv } from './config/env';
import { FirebaseModule } from './database/firebase.module';
import type { FirebaseEnv } from './database/firebase.tokens';
import { AuthGuard } from './common/guards/auth.guard';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AuditModule } from './modules/audit/audit.module';
import { EventsModule } from './modules/events/events.module';
import { HealthModule } from './modules/health/health.module';
import { SectionsModule } from './modules/sections/sections.module';
import { TenantsModule } from './modules/tenants/tenants.module';

function firebaseEnv(): FirebaseEnv {
  const env = loadEnv();
  return {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY,
  };
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => loadEnv(config),
    }),
    FirebaseModule.forRoot(firebaseEnv()),
    AuditModule,
    HealthModule,
    TenantsModule,
    EventsModule,
    SectionsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
