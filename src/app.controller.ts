import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(
    private readonly appService: AppService,
    private health: HealthCheckService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @HealthCheck()
  async getHealth() {
    const health = await this.health.check([]);

    this.logger.log(health.status);
    return health;
  }
}
