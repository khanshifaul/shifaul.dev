import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../utils/logger/logger.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { NewsletterSubscriberQueryDto } from './dto/newsletter-subscriber-query.dto';

@Injectable()
export class NewsletterSubscribersService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  async subscribeNewsletter(dto: SubscribeNewsletterDto) {
    try {
      // Check if email is already subscribed
      const existingSubscriber = await this.prisma.newsletterSubscriber.findUnique({
        where: { email: dto.email },
      });

      if (existingSubscriber) {
        throw new BadRequestException('Email is already subscribed to the newsletter');
      }

      const subscriber = await this.prisma.newsletterSubscriber.create({
        data: {
          email: dto.email,
        },
      });

      this.logger.info(`Newsletter subscription created: ${subscriber.email}`);

      return {
        id: subscriber.id,
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt,
      };
    } catch (error) {
      this.logger.error('Failed to create newsletter subscription', error.message);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create newsletter subscription');
    }
  }

  async getNewsletterSubscribers(query: NewsletterSubscriberQueryDto) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'subscribedAt',
        sortOrder = 'desc',
        email,
      } = query;

      const where: any = {};

      if (email) {
        where.email = email;
      }

      if (search) {
        where.email = { contains: search, mode: 'insensitive' };
      }

      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      const offset = (page - 1) * limit;

      const [subscribers, total] = await Promise.all([
        this.prisma.newsletterSubscriber.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
        }),
        this.prisma.newsletterSubscriber.count({ where }),
      ]);

      return {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get newsletter subscribers', error.message);
      throw new BadRequestException('Failed to retrieve newsletter subscribers');
    }
  }

  async getNewsletterSubscriberById(id: string) {
    try {
      const subscriber = await this.prisma.newsletterSubscriber.findUnique({
        where: { id },
      });

      if (!subscriber) {
        throw new BadRequestException('Newsletter subscriber not found');
      }

      return subscriber;
    } catch (error) {
      this.logger.error(
        `Failed to get newsletter subscriber ${id}`,
        error.message,
      );
      throw error;
    }
  }

  async deleteNewsletterSubscriber(id: string) {
    try {
      const subscriber = await this.prisma.newsletterSubscriber.findUnique({
        where: { id },
      });

      if (!subscriber) {
        throw new BadRequestException('Newsletter subscriber not found');
      }

      await this.prisma.newsletterSubscriber.delete({
        where: { id },
      });

      this.logger.info(`Newsletter subscriber deleted: ${id}`);

      return {
        id,
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete newsletter subscriber ${id}`,
        error.message,
      );
      throw error;
    }
  }

  async checkSubscription(email: string) {
    try {
      const subscriber = await this.prisma.newsletterSubscriber.findUnique({
        where: { email },
      });

      return {
        email,
        isSubscribed: !!subscriber,
        subscribedAt: subscriber?.subscribedAt || null,
      };
    } catch (error) {
      this.logger.error(`Failed to check subscription for ${email}`, error.message);
      throw new BadRequestException('Failed to check subscription status');
    }
  }

  async getNewsletterSubscriberStats() {
    try {
      const totalSubscribers = await this.prisma.newsletterSubscriber.count();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - 7);
      const thisMonth = new Date(today);
      thisMonth.setDate(1);

      const [subscribersToday, subscribersThisWeek, subscribersThisMonth] = await Promise.all([
        this.prisma.newsletterSubscriber.count({
          where: { subscribedAt: { gte: today } },
        }),
        this.prisma.newsletterSubscriber.count({
          where: { subscribedAt: { gte: thisWeek } },
        }),
        this.prisma.newsletterSubscriber.count({
          where: { subscribedAt: { gte: thisMonth } },
        }),
      ]);

      return {
        total: totalSubscribers,
        today: subscribersToday,
        thisWeek: subscribersThisWeek,
        thisMonth: subscribersThisMonth,
      };
    } catch (error) {
      this.logger.error('Failed to get newsletter subscriber stats', error.message);
      throw new BadRequestException('Failed to retrieve newsletter subscriber statistics');
    }
  }

  async unsubscribe(email: string) {
    try {
      const subscriber = await this.prisma.newsletterSubscriber.findUnique({
        where: { email },
      });

      if (!subscriber) {
        throw new BadRequestException('Email is not subscribed to the newsletter');
      }

      await this.prisma.newsletterSubscriber.delete({
        where: { email },
      });

      this.logger.info(`Newsletter unsubscription: ${email}`);

      return {
        email,
        unsubscribedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to unsubscribe ${email}`, error.message);
      throw error;
    }
  }
}