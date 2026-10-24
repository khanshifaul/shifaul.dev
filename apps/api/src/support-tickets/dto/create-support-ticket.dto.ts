import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from "prisma/generated/client";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

/**
 * DTO for creating a new support ticket.
 * Contains the essential information needed to create a support request.
 */
export class CreateSupportTicketDto {
  @ApiProperty({
    description: 'Title of the support ticket',
    example: 'Issue with login page',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the issue',
    example: 'I cannot access the login page...',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Priority level of the support ticket',
    enum: Priority,
    example: Priority.NORMAL,
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;
}
