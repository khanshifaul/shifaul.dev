import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class AdminUserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://gravatar.com/avatar/...jpg',
  })
  @Expose()
  avatar?: string;

  @ApiProperty({
    description: 'Authentication provider',
    example: 'local',
    enum: ['local', 'google', 'github', 'facebook'],
  })
  @Expose()
  provider: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true,
  })
  @Expose()
  isEmailVerified: boolean;

  @ApiPropertyOptional({
    description: 'Email verification timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  emailVerifiedAt?: string;

  @ApiProperty({
    description: 'Two-factor authentication status',
    example: false,
  })
  @Expose()
  isTwoFactorEnabled: boolean;

  @ApiProperty({
    description: 'User roles',
    example: ['user'],
    type: [String],
  })
  @Expose()
  roles: string[];

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  updatedAt: string;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  lastLoginAt?: string;

  @ApiPropertyOptional({
    description: 'User status',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'],
  })
  @Expose()
  status?: string;

  @ApiPropertyOptional({
    description: 'Suspension reason if applicable',
    example: 'Violation of terms of service',
  })
  @Expose()
  suspensionReason?: string;

  @ApiPropertyOptional({
    description: 'Suspension timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  @Expose()
  @Transform(({ value }) => value?.toISOString())
  suspendedAt?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    example: {
      signupSource: 'website',
      referralCode: 'REF123',
    },
  })
  @Expose()
  @ApiPropertyOptional({
    description: 'SGTM containers owned by the user',
    example: [
      {
        id: 'container-1',
        name: 'My SGTM Container',
        status: 'RUNNING',
        regionKey: 'us-east',
        createdAt: '2024-01-15T10:30:00Z',
      },
    ],
  })
  @Expose()
  sgtmContainers?: Array<{
    id: string;
    name: string;
    status: string;
    regionKey: string;
    createdAt: string;
  }>;

  @ApiPropertyOptional({
    description: 'Meta CAPI containers owned by the user',
    example: [
      {
        id: 'capi-1',
        name: 'My Meta CAPI Container',
        status: 'RUNNING',
        regionKey: 'us',
        fbPixelId: '123456789',
        createdAt: '2024-01-15T10:30:00Z',
      },
    ],
  })
  @Expose()
  metaCapiContainers?: Array<{
    id: string;
    name: string;
    status: string;
    regionKey: string;
    fbPixelId: string;
    createdAt: string;
  }>;
  metadata?: Record<string, any>;
}

export class AdminUserListResponseDto {
  @ApiProperty({
    description: 'List of users',
    type: [AdminUserResponseDto],
  })
  users: AdminUserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 15,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there are more pages',
    example: true,
  })
  hasMore: boolean;

  @ApiPropertyOptional({
    description: 'User summary statistics',
    example: {
      totalUsers: 150,
      activeUsers: 140,
      verifiedUsers: 135,
      twoFactorEnabled: 45,
    },
  })
  summary?: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    twoFactorEnabled: number;
    totalRevenue?: number;
  };
}
