// src/admin/admin.controller.ts
import {
  Controller,
  Logger,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

@ApiTags('Impersonation')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Roles('admin', 'crm_agent', 'developer') // Configurable via environment
@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private readonly adminService: AdminService) {}

  private createSuccessResponse<T>(message: string, data?: T): ApiResponse<T> {
    return { success: true, message, data };
  }

  private createErrorResponse(
    message: string,
    code?: string,
    error?: string,
  ): ApiResponse {
    return { success: false, message, error, code };
  }

  
}
