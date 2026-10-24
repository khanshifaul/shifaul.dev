import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactMessageQueryDto } from './dto/contact-message-query.dto';
import { ContactMessagesService } from './contact-messages.service';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@ApiTags('Contact Messages')
@Controller('contact-messages')
@Public()
export class ContactMessagesController {
  constructor(private readonly contactMessagesService: ContactMessagesService) {}

  private createSuccessResponse<T>(message: string, data?: T): ApiResponse<T> {
    return { success: true, message, data };
  }

  private createPaginatedResponse<T>(
    message: string,
    data: T,
    pagination: any,
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      pagination,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new contact message' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'email', 'subject', 'message'],
      properties: {
        name: {
          type: 'string',
          example: 'John Doe',
          minLength: 2,
          maxLength: 100,
        },
        email: {
          type: 'string',
          example: 'john.doe@example.com',
        },
        subject: {
          type: 'string',
          example: 'Inquiry about services',
          minLength: 3,
          maxLength: 255,
        },
        message: {
          type: 'string',
          example: 'Hello, I would like to inquire about your services...',
          minLength: 10,
          maxLength: 2000,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Contact message created successfully',
    schema: {
      example: {
        success: true,
        message: 'Contact message sent successfully',
        data: {
          id: 'msg-id',
          name: 'John Doe',
          email: 'john.doe@example.com',
          subject: 'Inquiry about services',
          message: 'Hello, I would like to inquire about your services...',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  async createContactMessage(@Body() dto: CreateContactMessageDto): Promise<ApiResponse> {
    const message = await this.contactMessagesService.createContactMessage(dto);
    return this.createSuccessResponse('Contact message sent successfully', message);
  }

  @Get()
  @ApiOperation({ summary: 'Get contact messages with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Contact messages retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Contact messages retrieved successfully',
        data: [
          {
            id: 'msg-id',
            name: 'John Doe',
            email: 'john.doe@example.com',
            subject: 'Inquiry about services',
            message: 'Hello, I would like to inquire about your services...',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
        },
      },
    },
  })
  async getContactMessages(@Query() query: ContactMessageQueryDto): Promise<ApiResponse> {
    const result = await this.contactMessagesService.getContactMessages(query);
    return this.createPaginatedResponse(
      'Contact messages retrieved successfully',
      result.messages,
      result.pagination,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific contact message by ID' })
  @ApiParam({ name: 'id', description: 'Contact message ID' })
  @ApiResponse({
    status: 200,
    description: 'Contact message retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Contact message retrieved successfully',
        data: {
          id: 'msg-id',
          name: 'John Doe',
          email: 'john.doe@example.com',
          subject: 'Inquiry about services',
          message: 'Hello, I would like to inquire about your services...',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Contact message not found',
  })
  async getContactMessageById(@Param('id') id: string): Promise<ApiResponse> {
    const message = await this.contactMessagesService.getContactMessageById(id);
    return this.createSuccessResponse('Contact message retrieved successfully', message);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact message' })
  @ApiParam({ name: 'id', description: 'Contact message ID' })
  @ApiResponse({
    status: 200,
    description: 'Contact message deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Contact message deleted successfully',
        data: {
          id: 'msg-id',
          deletedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Contact message not found',
  })
  async deleteContactMessage(@Param('id') id: string): Promise<ApiResponse> {
    const result = await this.contactMessagesService.deleteContactMessage(id);
    return this.createSuccessResponse('Contact message deleted successfully', result);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get contact message statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Contact message statistics retrieved successfully',
        data: {
          total: 25,
          today: 3,
          thisWeek: 15,
          thisMonth: 20,
        },
      },
    },
  })
  async getContactMessageStats(): Promise<ApiResponse> {
    const stats = await this.contactMessagesService.getContactMessageStats();
    return this.createSuccessResponse('Contact message statistics retrieved successfully', stats);
  }
}