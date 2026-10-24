import { ApiProperty } from '@nestjs/swagger';
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

export class CreateProjectDto {
  @ApiProperty({
    description: 'Unique slug for the project',
    example: 'ecommerce-platform-solution',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  slug: string;

  @ApiProperty({
    description: 'Project title',
    example: 'E-commerce Platform Solution',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Project subtitle or tagline',
    example: 'Modern e-commerce solution with React and Node.js',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  subtitle?: string;

  @ApiProperty({
    description: 'Client name',
    example: 'TechStart Inc.',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  client?: string;

  @ApiProperty({
    description: 'Client logo URL',
    example: 'https://example.com/logos/techstart-logo.png',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiProperty({
    description: 'Services provided in the project',
    example: ['Web Development', 'UI/UX Design', 'Database Design'],
    type: [String],
    maxItems: 20,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  services: string[];

  @ApiProperty({
    description: 'Technologies used in the project',
    example: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
    type: [String],
    maxItems: 50,
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  technologies: string[];

  @ApiProperty({
    description: 'Project website URL',
    example: 'https://techstart-ecommerce.com',
  })
  @IsUrl()
  website: string;

  @ApiProperty({
    description: 'Project thumbnail image URL',
    example: 'https://example.com/projects/ecommerce-platform-thumb.jpg',
  })
  @IsUrl()
  thumbnail: string;

  @ApiProperty({
    description: 'About the project - detailed description',
    example: 'A comprehensive e-commerce platform built with modern technologies...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  about: string;

  @ApiProperty({
    description: 'Project goals and objectives',
    example: 'To create a scalable e-commerce solution that can handle high traffic...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  goal: string;

  @ApiProperty({
    description: 'Project execution details - how it was implemented',
    example: 'We followed an agile development process with bi-weekly sprints...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  execution: string;

  @ApiProperty({
    description: 'Project results and outcomes',
    example: 'The platform successfully increased client sales by 150% and reduced page load time by 60%',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  results: string;

  @ApiProperty({
    description: 'Goal/Planning images URLs',
    example: [
      'https://example.com/projects/ecommerce/wireframe-1.jpg',
      'https://example.com/projects/ecommerce/mockup-1.jpg',
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
      'https://example.com/projects/ecommerce/dashboard-screenshot.jpg',
      'https://example.com/projects/ecommerce/mobile-app.jpg',
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
    description: 'Publication status of the project',
    example: true,
    type: Boolean,
    default: true,
    required: false,
  })
  @IsBoolean()
  published?: boolean;

  @ApiProperty({
    description: 'Project tags/categories',
    example: ['ecommerce', 'react', 'nodejs', 'aws'],
    type: [String],
    maxItems: 20,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  tags?: string[];
}