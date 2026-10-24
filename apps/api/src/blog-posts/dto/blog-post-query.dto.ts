import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

/**
 * DTO for querying blog posts with pagination, filtering, and search capabilities.
 */
export class BlogPostQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Search term to filter blog posts by title or content',
    example: 'typescript',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter blog posts by publication status',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;

  @ApiPropertyOptional({
    description: 'Filter blog posts by author name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({
    description: 'Filter blog posts by tag names',
    example: ['typescript', 'programming'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Sort field for the results',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'title', 'views', 'reactions'],
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order for the results',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Filter by minimum view count',
    example: 100,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minViews?: number;

  @ApiPropertyOptional({
    description: 'Filter by minimum reaction count',
    example: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minReactions?: number;
}