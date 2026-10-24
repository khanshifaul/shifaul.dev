import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsArray, IsNumber, MaxLength } from 'class-validator';

export class ProjectQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term for project title, description, client, or services',
    example: 'ecommerce',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiProperty({
    description: 'Filter by client name',
    example: 'TechStart Inc.',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  client?: string;

  @ApiProperty({
    description: 'Filter by services provided',
    example: ['Web Development', 'UI/UX Design'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiProperty({
    description: 'Filter by technologies used',
    example: ['React', 'Node.js', 'AWS'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @ApiProperty({
    description: 'Filter by tags/categories',
    example: ['ecommerce', 'react', 'nodejs'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['title', 'createdAt', 'updatedAt', 'client'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  sortOrder?: 'asc' | 'desc' = 'desc';
}