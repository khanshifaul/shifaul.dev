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
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { NewsletterSubscriberQueryDto } from './dto/newsletter-subscriber-query.dto';
import { NewsletterSubscribersService } from './newsletter-subscribers.service';

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

@ApiTags('Newsletter Subscribers')
@Controller('newsletter')
@Public()
export class NewsletterSubscribersController {
  constructor(private readonly newsletterSubscribersService: NewsletterSubscribersService) {}

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

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully subscribed to newsletter',
    schema: {
      example: {
        success: true,
        message: 'Successfully subscribed to newsletter',
        data: {
          id: 'subscriber-id',
          email: 'user@example.com',
          subscribedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Email already subscribed',
  })
  async subscribeNewsletter(@Body() dto: SubscribeNewsletterDto): Promise<ApiResponse> {
    const subscriber = await this.newsletterSubscribersService.subscribeNewsletter(dto);
    return this.createSuccessResponse('Successfully subscribed to newsletter', subscriber);
  }

  @Post('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from newsletter' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email'],
      properties: {
        email: {
          type: 'string',
          example: 'user@example.com',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully unsubscribed from newsletter',
    schema: {
      example: {
        success: true,
        message: 'Successfully unsubscribed from newsletter',
        data: {
          email: 'user@example.com',
          unsubscribedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Email not subscribed',
  })
  async unsubscribeNewsletter(@Body() body: { email: string }): Promise<ApiResponse> {
    const result = await this.newsletterSubscribersService.unsubscribe(body.email);
    return this.createSuccessResponse('Successfully unsubscribed from newsletter', result);
  }

  @Get('check-subscription')
  @ApiOperation({ summary: 'Check if email is subscribed to newsletter' })
  @ApiQuery({ name: 'email', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Subscription status retrieved',
    schema: {
      example: {
        success: true,
        message: 'Subscription status retrieved',
        data: {
          email: 'user@example.com',
          isSubscribed: true,
          subscribedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  async checkSubscription(@Query('email') email: string): Promise<ApiResponse> {
    const result = await this.newsletterSubscribersService.checkSubscription(email);
    return this.createSuccessResponse('Subscription status retrieved', result);
  }

  @Get('subscribers')
  @ApiOperation({ summary: 'Get newsletter subscribers with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, type: String })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Newsletter subscribers retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Newsletter subscribers retrieved successfully',
        data: [
          {
            id: 'subscriber-id',
            email: 'user@example.com',
            subscribedAt: '2024-01-01T00:00:00.000Z',
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
  async getNewsletterSubscribers(@Query() query: NewsletterSubscriberQueryDto): Promise<ApiResponse> {
    const result = await this.newsletterSubscribersService.getNewsletterSubscribers(query);
    return this.createPaginatedResponse(
      'Newsletter subscribers retrieved successfully',
      result.subscribers,
      result.pagination,
    );
  }

  @Get('subscribers/:id')
  @ApiOperation({ summary: 'Get a specific newsletter subscriber by ID' })
  @ApiParam({ name: 'id', description: 'Subscriber ID' })
  @ApiResponse({
    status: 200,
    description: 'Newsletter subscriber retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Newsletter subscriber retrieved successfully',
        data: {
          id: 'subscriber-id',
          email: 'user@example.com',
          subscribedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Newsletter subscriber not found',
  })
  async getNewsletterSubscriberById(@Param('id') id: string): Promise<ApiResponse> {
    const subscriber = await this.newsletterSubscribersService.getNewsletterSubscriberById(id);
    return this.createSuccessResponse('Newsletter subscriber retrieved successfully', subscriber);
  }

  @Delete('subscribers/:id')
  @ApiOperation({ summary: 'Delete a newsletter subscriber' })
  @ApiParam({ name: 'id', description: 'Subscriber ID' })
  @ApiResponse({
    status: 200,
    description: 'Newsletter subscriber deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Newsletter subscriber deleted successfully',
        data: {
          id: 'subscriber-id',
          deletedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Newsletter subscriber not found',
  })
  async deleteNewsletterSubscriber(@Param('id') id: string): Promise<ApiResponse> {
    const result = await this.newsletterSubscribersService.deleteNewsletterSubscriber(id);
    return this.createSuccessResponse('Newsletter subscriber deleted successfully', result);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get newsletter subscriber statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Newsletter subscriber statistics retrieved successfully',
        data: {
          total: 150,
          today: 5,
          thisWeek: 25,
          thisMonth: 60,
        },
      },
    },
  })
  async getNewsletterSubscriberStats(): Promise<ApiResponse> {
    const stats = await this.newsletterSubscribersService.getNewsletterSubscriberStats();
    return this.createSuccessResponse('Newsletter subscriber statistics retrieved successfully', stats);
  }
}