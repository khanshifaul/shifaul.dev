import { Module } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../utils/logger/logger.service';
import { BlogPostsController } from './blog-posts.controller';
import { BlogPostsService } from './blog-posts.service';

@Module({
  imports: [],
  controllers: [BlogPostsController],
  providers: [BlogPostsService, DatabaseService, LoggerService],
  exports: [BlogPostsService],
})
export class BlogPostsModule {}