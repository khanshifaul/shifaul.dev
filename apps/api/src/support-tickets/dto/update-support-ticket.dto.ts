import { ApiPropertyOptional } from '@nestjs/swagger';
import { Priority, TicketStatus } from "prisma/generated/client";
import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * DTO for updating an existing support ticket.
 * All fields are optional - only provided fields will be updated.
 */
export class UpdateSupportTicketDto {
  @ApiPropertyOptional({
    description: 'Updated title for the support ticket',
    example: 'Updated issue title',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated description of the issue',
    example: 'Updated description...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated priority level of the support ticket',
    enum: Priority,
    example: Priority.HIGH,
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Updated status of the support ticket',
    enum: TicketStatus,
    example: TicketStatus.IN_PROGRESS,
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;
}
