import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiAssistantService } from './ai-assistant.service';
import { ChatMessageDto, ChatResponseDto, IngestSourceDto } from './dto/chat.dto';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiTags('AI Assistant')
@Controller('ai-assistant')
export class AiAssistantController {
  constructor(private readonly ai: AiAssistantService) {}

  @Post('chat')
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @ApiOperation({ summary: 'Ask the portfolio AI assistant a question' })
  @ApiResponse({ status: 200, description: 'Assistant answer with sources', type: ChatResponseDto })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async chat(@Body() dto: ChatMessageDto): Promise<{
    success: boolean;
    message: string;
    data: ChatResponseDto;
  }> {
    const data = await this.ai.chat(dto);
    return { success: true, message: 'OK', data };
  }

  @Post('ingest')
  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Ingest a source into the knowledge base (admin only)' })
  @ApiResponse({ status: 201, description: 'Source ingested' })
  async ingest(@Body() dto: IngestSourceDto) {
    const result = await this.ai.ingest(dto);
    return { success: true, message: 'Source ingested', data: result };
  }

  @Get('sources')
  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles('admin', 'staff', 'developer')
  @ApiOperation({ summary: 'List ingested knowledge base sources' })
  async listSources() {
    const data = await this.ai.listSources();
    return { success: true, message: 'OK', data };
  }

  @Delete('sources/:source')
  @HttpCode(200)
  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete all chunks for a given source (admin only)' })
  async removeSource(@Param('source') source: string) {
    const data = await this.ai.removeSource(source);
    return { success: true, message: 'OK', data };
  }
}
