import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePresignedUrlDto {
    @ApiProperty({
        description: 'The original name of the file',
        example: 'image.jpg',
    })
    @IsNotEmpty()
    @IsString()
    fileName: string;

    @ApiProperty({
        description: 'The MIME type of the file',
        example: 'image/jpeg',
    })
    @IsNotEmpty()
    @IsString()
    contentType: string;

    @ApiProperty({
        description: 'Optional folder path in the bucket',
        example: 'blog-posts/thumbnails',
        required: false,
    })
    @IsOptional()
    @IsString()
    folder?: string;
}
