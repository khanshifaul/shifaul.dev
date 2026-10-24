import { ApiPropertyOptional } from '@nestjs/swagger';
import { Priority, TicketStatus } from "prisma/generated/client";
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

/**
 * DTO for querying support tickets with various filters and pagination.
 * Supports filtering by status, priority, search terms, and user assignments.
 */
export class TicketQueryDto {
  @ApiPropertyOptional({
    description: 'Filter tickets by status',
    enum: TicketStatus,
    // example: TicketStatus.OPEN,
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiPropertyOptional({
    description: 'Filter tickets by priority level',
    enum: Priority,
    // example: Priority.HIGH,
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Search tickets by title or description content',
    // example: 'login',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter tickets by assigned user ID',
    // example: 'uuid-string',
  })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Filter tickets by creator user ID',
    // example: 'uuid-string',
  })
  @IsUUID()
  @IsOptional()
  creatorId?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort results by',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'priority', 'status'],
    default: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order direction',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
