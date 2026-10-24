import { Module } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../utils/logger/logger.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [],
  controllers: [ProjectsController],
  providers: [ProjectsService, DatabaseService, LoggerService],
  exports: [ProjectsService],
})
export class ProjectsModule {}