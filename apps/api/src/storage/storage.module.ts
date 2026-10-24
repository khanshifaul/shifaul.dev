import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { LoggerService } from '../utils/logger/logger.service';

@Module({
    controllers: [StorageController],
    providers: [StorageService, LoggerService],
    exports: [StorageService],
})
export class StorageModule {}
