import { ApiProperty } from '@nestjs/swagger';

export class UserGrowthDataPoint {
  @ApiProperty({
    description: 'Period identifier (date string or period label)',
    example: '2024-01-15',
  })
  period: string;

  @ApiProperty({
    description: 'Total users at the end of this period',
    example: 150,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'New users in this period',
    example: 12,
  })
  newUsers: number;

  @ApiProperty({
    description: 'Growth percentage compared to previous period',
    example: 8.7,
  })
  growthPercentage: number;

  @ApiProperty({
    description: 'Cumulative growth percentage from the start of the range',
    example: 25.3,
  })
  cumulativeGrowth: number;
}

export class UserGrowthSummary {
  @ApiProperty({
    description: 'Total users at the start of the period',
    example: 120,
  })
  initialUsers: number;

  @ApiProperty({
    description: 'Total users at the end of the period',
    example: 150,
  })
  finalUsers: number;

  @ApiProperty({
    description: 'Total new users in the period',
    example: 30,
  })
  totalNewUsers: number;

  @ApiProperty({
    description: 'Average growth percentage per period',
    example: 7.2,
  })
  averageGrowthRate: number;

  @ApiProperty({
    description: 'Highest growth percentage in any period',
    example: 15.8,
  })
  peakGrowthRate: number;

  @ApiProperty({
    description: 'Overall growth percentage for the entire period',
    example: 25.0,
  })
  overallGrowthPercentage: number;
}

export class AdminUserGrowthResponseDto {
  @ApiProperty({
    description: 'Time range used for the analytics',
    example: 'this_month',
  })
  timeRange: string;

  @ApiProperty({
    description: 'Grouping method used',
    example: 'day',
  })
  groupBy: string;

  @ApiProperty({
    description: 'Timezone used for calculations',
    example: 'Asia/Dhaka',
  })
  timezone: string;

  @ApiProperty({
    description: 'Actual start date used',
    example: '2024-01-01T00:00:00.000Z',
  })
  startDate: string;

  @ApiProperty({
    description: 'Actual end date used',
    example: '2024-01-31T23:59:59.999Z',
  })
  endDate: string;

  @ApiProperty({
    description: 'Array of growth data points',
    type: [UserGrowthDataPoint],
  })
  data: UserGrowthDataPoint[];

  @ApiProperty({
    description: 'Summary statistics for the growth period',
    type: UserGrowthSummary,
  })
  summary: UserGrowthSummary;

  @ApiProperty({
    description: 'Total number of data points',
    example: 31,
  })
  totalPoints: number;

  @ApiProperty({
    description: 'Filters applied to the data',
    example: {
      userStatus: ['ACTIVE'],
    },
  })
  filters: Record<string, any>;
}
