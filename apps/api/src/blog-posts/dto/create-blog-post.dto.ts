import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

/**
 * DTO for creating a new blog post.
 * Contains the essential information needed to create a blog post with MDX content.
 */
export class CreateBlogPostDto {
  @ApiProperty({
    description: 'Title of the blog post',
    example: 'Understanding TypeScript Generics',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'URL-friendly slug for the blog post',
    example: 'understanding-typescript-generics',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'MDX content of the blog post',
    example: '# Introduction\n\nThis is a blog post about TypeScript generics...\n\n```typescript\nfunction identity<T>(arg: T): T {\n  return arg;\n}\n```',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'URL of the thumbnail image',
    example: 'https://example.com/images/typescript-generics.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Array of tag names for the blog post',
    example: ['typescript', 'programming', 'generics'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether the blog post should be published immediately',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}