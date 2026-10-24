import { Controller, Get, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response as ExpressResponse } from 'express';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Application')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Redirect to frontend' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend' })
  redirectToFrontend(@Res() res: ExpressResponse) {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'https://shifaul.dev',
    );
    return res.redirect(302, frontendUrl);
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Health check passed' })
  getHealth() {
    return this.appService.getHealth();
  }
}
