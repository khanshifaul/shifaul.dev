import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export enum UserGrowthTimeRange {
  YESTERDAY = 'yesterday',
  TODAY = 'today',
  THIS_WEEK = 'this_week',
  LAST_WEEK = 'last_week',
  THIS_MONTH = 'this_month',
  LAST_MONTH = 'last_month',
  THIS_YEAR = 'this_year',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
}

export enum UserGrowthGrouping {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export enum UserStatusFilter {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export class AdminUserGrowthQueryDto {
  @ApiPropertyOptional({
    description: 'Time range for analytics',
    enum: UserGrowthTimeRange,
    // example: UserGrowthTimeRange.THIS_MONTH,
  })
  @IsOptional()
  @IsEnum(UserGrowthTimeRange)
  timeRange?: UserGrowthTimeRange = UserGrowthTimeRange.THIS_MONTH;

  @ApiPropertyOptional({
    description: 'Custom start date (required when timeRange is CUSTOM)',
    // example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Custom end date (required when timeRange is CUSTOM)',
    // example: '2024-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'How to group the data',
    enum: UserGrowthGrouping,
    // example: UserGrowthGrouping.DAY,
  })
  @IsOptional()
  @IsEnum(UserGrowthGrouping)
  groupBy?: UserGrowthGrouping = UserGrowthGrouping.DAY;

  @ApiPropertyOptional({
    description: 'Filter by user status',
    type: [String],
    enum: UserStatusFilter,
    // example: [UserStatusFilter.ACTIVE],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(UserStatusFilter, { each: true })
  userStatus?: UserStatusFilter[];

  @ApiPropertyOptional({
    description: 'Timezone for date calculations (IANA timezone identifier)',
    // example: 'Asia/Dhaka',
  })
  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';
}
