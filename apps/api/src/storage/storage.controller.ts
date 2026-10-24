import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../common/guards/access-token.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { StorageService } from './storage.service';
import { CreatePresignedUrlDto } from './dto/create-presigned-url.dto';

@ApiTags('Storage')
@Controller('storage')
@UseGuards(AccessTokenGuard, RolesGuard)
@ApiBearerAuth('access-token')
export class StorageController {
    constructor(private readonly storageService: StorageService) {}

    @Post('presigned-url')
    @Roles('admin', 'staff')
    @ApiOperation({ summary: 'Get a presigned URL for file upload to Cloudflare R2' })
    @ApiResponse({
        status: 201,
        description: 'Presigned URL generated successfully',
        schema: {
            example: {
                uploadUrl: 'https://...',
                fileUrl: 'https://...',
                key: '...',
            },
        },
    })
    async getPresignedUrl(@Body() dto: CreatePresignedUrlDto) {
        return await this.storageService.getPresignedUrl(
            dto.fileName,
            dto.contentType,
            dto.folder,
        );
    }

    @Post('upload')
    @Roles('admin', 'staff')
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload a file directly to Cloudflare R2 via backend proxy' })
    @ApiResponse({
        status: 201,
        description: 'File uploaded successfully',
        schema: {
            example: {
                fileUrl: 'https://...',
                key: '...',
            },
        },
    })
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder?: string,
    ) {
        return await this.storageService.uploadFile(
            file.buffer,
            file.originalname,
            file.mimetype,
            folder,
        );
    }
}
