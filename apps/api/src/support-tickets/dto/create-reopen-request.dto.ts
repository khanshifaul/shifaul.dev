import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for creating a request to reopen a closed support ticket.
 * Contains the reason why the ticket should be reopened.
 */
export class CreateReopenRequestDto {
  @ApiProperty({
    description: 'Reason for reopening the support ticket',
    example:
      'The issue is still not resolved. I still cannot access the login page.',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
