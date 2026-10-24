import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @ApiProperty({
    description: 'Project title',
    example: 'Updated E-commerce Platform Solution',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'Project subtitle or tagline',
    example: 'Updated modern e-commerce solution with React and Node.js',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitle?: string;

  @ApiProperty({
    description: 'Client name',
    example: 'Updated TechStart Inc.',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  client?: string;

  @ApiProperty({
    description: 'Client logo URL',
    example: 'https://example.com/logos/updated-techstart-logo.png',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({
    description: 'Services provided in the project',
    example: ['Web Development', 'UI/UX Design', 'Database Design', 'DevOps'],
    type: [String],
    maxItems: 20,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  services?: string[];

  @ApiProperty({
    description: 'Technologies used in the project',
    example: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    type: [String],
    maxItems: 50,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  technologies?: string[];

  @ApiProperty({
    description: 'Project website URL',
    example: 'https://updated-techstart-ecommerce.com',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    description: 'Project thumbnail image URL',
    example: 'https://example.com/projects/updated-ecommerce-platform-thumb.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  thumbnail?: string;

  @ApiProperty({
    description: 'About the project - detailed description',
    example: 'An updated comprehensive e-commerce platform built with modern technologies...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  about?: string;

  @ApiProperty({
    description: 'Project goals and objectives',
    example: 'To create an updated scalable e-commerce solution that can handle even higher traffic...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  goal?: string;

  @ApiProperty({
    description: 'Project execution details - how it was implemented',
    example: 'We followed an updated agile development process with more frequent sprints...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  execution?: string;

  @ApiProperty({
    description: 'Project results and outcomes',
    example: 'The updated platform successfully increased client sales by 200% and reduced page load time by 70%',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  results?: string;

  @ApiProperty({
    description: 'Goal/Planning images URLs',
    example: [
      'https://example.com/projects/ecommerce/updated-wireframe-1.jpg',
      'https://example.com/projects/ecommerce/updated-mockup-1.jpg',
    ],
    type: [String],
    maxItems: 10,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUrl(undefined, { each: true })
  @ArrayMaxSize(10)
  goalImages?: string[];

  @ApiProperty({
    description: 'Result/Outcome images URLs',
    example: [
      'https://example.com/projects/ecommerce/updated-dashboard-screenshot.jpg',
      'https://example.com/projects/ecommerce/updated-mobile-app.jpg',
    ],
    type: [String],
    maxItems: 10,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUrl(undefined, { each: true })
  @ArrayMaxSize(10)
  resultImages?: string[];

  @ApiProperty({
    description: 'Project tags/categories',
    example: ['ecommerce', 'react', 'nodejs', 'aws', 'mobile'],
    type: [String],
    maxItems: 20,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  tags?: string[];

  @ApiProperty({
    description: 'Whether the project is published and visible to public',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}