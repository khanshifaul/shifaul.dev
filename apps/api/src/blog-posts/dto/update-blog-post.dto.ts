import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

/**
 * DTO for updating an existing blog post.
 * All fields are optional to allow partial updates.
 */
export class UpdateBlogPostDto {
  @ApiPropertyOptional({
    description: 'Updated title of the blog post',
    example: 'Advanced TypeScript Generics: Practical Examples',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated URL-friendly slug for the blog post',
    example: 'advanced-typescript-generics-practical-examples',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Updated MDX content of the blog post',
    example: '# Advanced Introduction\n\nThis is an updated blog post about TypeScript generics...\n\n```typescript\nfunction advancedIdentity<T>(arg: T): T {\n  console.log(`Processing: ${arg}`);\n  return arg;\n}\n```',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Updated URL of the thumbnail image',
    example: 'https://example.com/images/advanced-typescript-generics.jpg',
  })
  @IsUrl()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({
    description: 'Updated array of tag names for the blog post',
    example: ['typescript', 'programming', 'generics', 'advanced'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Whether the blog post should be published',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}