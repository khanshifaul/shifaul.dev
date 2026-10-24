import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../utils/logger/logger.service';

@Injectable()
export class StorageService {
    private s3Client: S3Client;
    private bucketName: string;
    private publicUrl: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: LoggerService,
    ) {
        const accessKeyId = this.configService.get<string>('R2_ACCESS_KEY_ID') || '';
        const secretAccessKey = this.configService.get<string>('R2_SECRET_ACCESS_KEY') || '';
        const accountId = this.configService.get<string>('R2_ACCOUNT_ID') || '';
        this.bucketName = this.configService.get<string>('R2_BUCKET_NAME') || '';
        this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL') || '';

        this.s3Client = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }

    /**
     * Generates a presigned URL for uploading a file to Cloudflare R2
     * @param fileName Original file name
     * @param contentType MIME type of the file
     * @param folder Optional folder path in the bucket
     * @returns Presigned URL and the final public URL of the file
     */
    async getPresignedUrl(fileName: string, contentType: string, folder?: string) {
        try {
            const fileExtension = fileName.split('.').pop();
            const uniqueFileName = `${uuidv4()}.${fileExtension}`;
            const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
            });

            // URL expires in 15 minutes (900 seconds)
            const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });

            // Clean up public URL (ensure no trailing slash)
            const basePublicUrl = this.publicUrl.endsWith('/')
                ? this.publicUrl.slice(0, -1)
                : this.publicUrl;

            const finalPublicUrl = `${basePublicUrl}/${key}`;

            return {
                uploadUrl: presignedUrl,
                fileUrl: finalPublicUrl,
                key,
            };
        } catch (error) {
            this.logger.error('Error generating presigned URL', error.message);
            throw new InternalServerErrorException('Could not generate upload URL');
        }
    }

    /**
     * Uploads a file directly to Cloudflare R2
     * @param file File buffer
     * @param fileName Original file name
     * @param contentType MIME type of the file
     * @param folder Optional folder path in the bucket
     * @returns The public URL of the uploaded file
     */
    async uploadFile(
        file: Buffer,
        fileName: string,
        contentType: string,
        folder?: string,
    ) {
        try {
            const fileExtension = fileName.split('.').pop();
            const uniqueFileName = `${uuidv4()}.${fileExtension}`;
            const key = folder ? `${folder}/${uniqueFileName}` : uniqueFileName;

            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
                Body: file,
            });

            await this.s3Client.send(command);

            // Clean up public URL (ensure no trailing slash)
            const basePublicUrl = this.publicUrl.endsWith('/')
                ? this.publicUrl.slice(0, -1)
                : this.publicUrl;

            const finalPublicUrl = `${basePublicUrl}/${key}`;

            return {
                fileUrl: finalPublicUrl,
                key,
            };
        } catch (error) {
            this.logger.error('Error uploading file to R2', error.message);
            throw new InternalServerErrorException('Could not upload file');
        }
    }
}
