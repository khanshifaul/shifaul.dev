import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Allow,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * DTO for creating a reply to a support ticket.
 * Contains the reply content and optional settings for visibility and attachments.
 */
export class CreateTicketReplyDto {
  @ApiProperty({
    description: 'Content of the ticket reply',
    example: 'This is my reply to the ticket.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Whether this reply is internal (staff only)',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isInternal?: boolean;

  // Allow attachments field for multipart form data compatibility
  @Allow()
  attachments?: any;
}
