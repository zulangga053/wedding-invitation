import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { FirebaseAdminService } from '../../database/firebase-admin.service';

@Controller('health')
export class HealthController {
  constructor(private readonly firebase: FirebaseAdminService) {}

  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'momentia-api',
      version: '0.1.0',
      firebaseConfigured: this.firebase.isConfigured,
      timestamp: new Date().toISOString(),
    };
  }
}
