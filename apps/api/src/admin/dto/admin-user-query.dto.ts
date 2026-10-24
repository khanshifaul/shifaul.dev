import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export enum AdminUserSortFields {
  ID = 'id',
  EMAIL = 'email',
  NAME = 'name',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  IS_EMAIL_VERIFIED = 'isEmailVerified',
  IS_TWO_FACTOR_ENABLED = 'isTwoFactorEnabled',
  PROVIDER = 'provider',
}

export class AdminUserQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search by user name or email',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by user email',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Filter by user name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by user roles',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roles?: string[];

  @ApiPropertyOptional({
    description: 'Filter by authentication provider',
    enum: ['local', 'google', 'github', 'facebook'],
  })
  @IsOptional()
  @IsEnum(['local', 'google', 'github', 'facebook'])
  provider?: 'local' | 'google' | 'github' | 'facebook';

  @ApiPropertyOptional({
    description: 'Filter by email verification status',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isEmailVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by two-factor authentication status',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isTwoFactorEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Filter users created after this date',
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter users created before this date',
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({
    description: 'Filter users updated after this date',
  })
  @IsOptional()
  @IsDateString()
  updatedAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter users updated before this date',
  })
  @IsOptional()
  @IsDateString()
  updatedBefore?: string;

  @ApiPropertyOptional({
    description: 'Include inactive users',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeInactive?: boolean = false;

  @ApiPropertyOptional({
    description: 'Include users with unverified emails',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeUnverified?: boolean = false;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: AdminUserSortFields,
  })
  @IsOptional()
  @IsEnum(AdminUserSortFields)
  sortBy?: AdminUserSortFields = AdminUserSortFields.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
