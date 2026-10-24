import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AdminUpdateUserDto {
  @ApiPropertyOptional({
    description: 'User full name',
    example: 'John Doe',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'User roles',
    example: ['user', 'admin'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({
    description: 'Email verification status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Two-factor authentication status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isTwoFactorEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'User status',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
  })
  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

  @ApiPropertyOptional({
    description: 'Suspension reason (required when suspending)',
    example: 'Violation of terms of service',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  suspensionReason?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata to update',
    example: {
      signupSource: 'website',
      referralCode: 'REF123',
    },
  })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Admin user ID performing the update (for audit)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  updatedBy?: string;

  @ApiPropertyOptional({
    description: 'Update reason',
    example: 'User requested email change',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  updateReason?: string;
}

export class AdminBulkUpdateUsersDto {
  @ApiPropertyOptional({
    description: 'User IDs to update',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
    ],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  userIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter criteria for bulk update',
    example: {
      roles: ['user'],
      status: 'active',
    },
  })
  @IsOptional()
  filters?: {
    roles?: string[];
    status?: string;
    isEmailVerified?: boolean;
    createdAfter?: string;
    createdBefore?: string;
  };

  @ApiPropertyOptional({
    description: 'Updates to apply to all matching users',
    type: AdminUpdateUserDto,
  })
  @IsOptional()
  updates?: AdminUpdateUserDto;

  @ApiPropertyOptional({
    description: 'Admin user ID performing the bulk update',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  updatedBy?: string;

  @ApiPropertyOptional({
    description: 'Bulk update reason',
    example: 'Mass role assignment for new feature',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  updateReason?: string;
}
