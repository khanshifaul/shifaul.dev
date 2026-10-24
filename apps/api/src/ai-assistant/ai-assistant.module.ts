import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiAssistantController } from './ai-assistant.controller';
import { AiAssistantService } from './ai-assistant.service';
import { VectorStoreService } from './vector-store.service';
import { LlmService } from './llm.service';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../utils/logger/logger.service';

@Module({
  imports: [HttpModule],
  controllers: [AiAssistantController],
  providers: [
    AiAssistantService,
    VectorStoreService,
    LlmService,
    DatabaseService,
    LoggerService,
  ],
})
export class AiAssistantModule {}
