import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({
    description: 'The user question to send to the AI assistant',
    example: 'What experience does Shifaul have with Next.js?',
    minLength: 1,
    maxLength: 1000,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message: string;

  @ApiProperty({
    description: 'Optional session key for conversation continuity. Omit for a fresh session.',
    example: 'anon-192.168.1.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sessionKey?: string;
}

export class IngestSourceDto {
  @ApiProperty({
    description: 'Source identifier for the content',
    example: 'resume',
  })
  @IsString()
  source: string;

  @ApiProperty({
    description: 'Plain text content to embed and store',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Optional source URL for citations',
    required: false,
  })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiProperty({
    description: 'Optional metadata (title, slug, etc.)',
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class ChatResponseDto {
  @ApiProperty({ description: 'AI assistant answer' })
  answer: string;

  @ApiProperty({
    description: 'Sources used to generate the answer',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        source: { type: 'string' },
        sourceUrl: { type: 'string' },
        score: { type: 'number' },
        snippet: { type: 'string' },
      },
    },
  })
  sources: Array<{
    source: string;
    sourceUrl?: string;
    score: number;
    snippet: string;
  }>;

  @ApiProperty({ description: 'Session key for follow-up messages' })
  sessionKey: string;

  @ApiProperty({ description: 'Total tokens used (prompt + completion)' })
  tokens: number;

  @ApiProperty({
    description:
      'If a contact request was triggered and successfully sent (e.g. via Telegram), this is the request id. Frontend uses this to show a "Message sent" confirmation.',
    required: false,
  })
  contactRequestId?: string;

  @ApiProperty({
    description:
      'Status of any contact request triggered: "detected" (intent found, awaiting visitor contact info), "pending" (visitor provided contact info, Telegram send in progress), "sent" (delivered), "failed" (delivery failed), or null if no contact intent.',
    required: false,
  })
  contactRequestStatus?: 'detected' | 'pending' | 'sent' | 'failed' | null;
}
