import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { LoggerService } from '../../utils/logger/logger.service';

@Injectable()
export class AdminNewsletterSubscriberService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly logger: LoggerService,
  ) {}

  async getAllNewsletterSubscribers(query: any) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy,
        sortOrder,
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
      if (sortBy) {
        orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderBy.subscribedAt = 'desc';
      }

      const offset = (page - 1) * limit;

      const subscribers = await this.prisma.newsletterSubscriber.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      });

      const total = await this.prisma.newsletterSubscriber.count({ where });

      return {
        subscribers: subscribers.map((subscriber) => ({
          id: subscriber.id,
          email: subscriber.email,
          subscribedAt: subscriber.subscribedAt,
        })),
        total,
        hasMore: total > offset + subscribers.length,
        summary: await this.getNewsletterSubscriberSummary(),
      };
    } catch (error) {
      this.logger.error('Failed to fetch newsletter subscribers:', error);
      throw error;
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

      return {
        id: subscriber.id,
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch newsletter subscriber ${id}:`, error);
      throw error;
    }
  }

  async deleteNewsletterSubscriber(id: string, adminUserId: string, reason?: string) {
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

      // Log admin action
      await this.logAdminAction(adminUserId, 'NEWSLETTER_SUBSCRIBER_DELETED', id, {
        reason,
        email: subscriber.email,
      });

      this.logger.info(
        `Newsletter subscriber ${id} deleted by admin ${adminUserId}`,
      );

      return {
        id,
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to delete newsletter subscriber ${id}:`, error);
      throw error;
    }
  }

  async bulkUnsubscribe(emails: string[], adminUserId: string, reason?: string) {
    try {
      const results: any[] = [];

      for (const email of emails) {
        try {
          const subscriber = await this.prisma.newsletterSubscriber.findUnique({
            where: { email },
          });

          if (subscriber) {
            await this.prisma.newsletterSubscriber.delete({
              where: { email },
            });
            results.push({ email, success: true });
          } else {
            results.push({ email, success: false, error: 'Not subscribed' });
          }
        } catch (error: any) {
          results.push({ email, success: false, error: error.message });
        }
      }

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      // Log bulk operation
      await this.logAdminAction(
        adminUserId,
        'BULK_NEWSLETTER_UNSUBSCRIBE',
        `bulk-${Date.now()}`,
        {
          emails,
          reason,
          successful,
          failed,
        },
      );

      this.logger.info(
        `Bulk unsubscribe completed by admin ${adminUserId}: ${successful} successful, ${failed} failed`,
      );

      return {
        operationId: `bulk-unsubscribe-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        totalEmails: emails.length,
        successful,
        failed,
        results,
      };
    } catch (error) {
      this.logger.error('Bulk unsubscribe failed:', error);
      throw error;
    }
  }

  async getNewsletterSubscriberAnalytics() {
    try {
      const totalSubscribers = await this.prisma.newsletterSubscriber.count();

      const subscribersByMonth = await this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "subscribedAt") as month,
          COUNT(*) as count
        FROM newsletter_subscribers
        WHERE "subscribedAt" >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "subscribedAt")
        ORDER BY month DESC
      `;

      const recentSubscribers = await this.prisma.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          email: true,
          subscribedAt: true,
        },
      });

      const growthStats = await this.getGrowthStats();

      return {
        overview: {
          totalSubscribers,
        },
        trends: {
          subscribersByMonth,
        },
        recentActivity: recentSubscribers,
        growth: growthStats,
      };
    } catch (error) {
      this.logger.error('Failed to get newsletter subscriber analytics:', error);
      throw error;
    }
  }

  async exportSubscribers(format: 'json' | 'csv' = 'json') {
    try {
      const subscribers = await this.prisma.newsletterSubscriber.findMany({
        orderBy: { subscribedAt: 'desc' },
      });

      if (format === 'csv') {
        const csvData = subscribers.map(sub => ({
          email: sub.email,
          subscribedAt: sub.subscribedAt.toISOString(),
        }));
        
        // Convert to CSV format
        const headers = 'email,subscribedAt\n';
        const csvContent = csvData.map(row => 
          `${row.email},${row.subscribedAt}`
        ).join('\n');
        
        return headers + csvContent;
      }

      return subscribers;
    } catch (error) {
      this.logger.error('Failed to export newsletter subscribers:', error);
      throw new BadRequestException('Failed to export newsletter subscribers');
    }
  }

  private async getNewsletterSubscriberSummary() {
    const totalSubscribers = await this.prisma.newsletterSubscriber.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const subscribersToday = await this.prisma.newsletterSubscriber.count({
      where: { subscribedAt: { gte: today } },
    });

    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - 7);

    const subscribersThisWeek = await this.prisma.newsletterSubscriber.count({
      where: { subscribedAt: { gte: thisWeek } },
    });

    return {
      totalSubscribers,
      subscribersToday,
      subscribersThisWeek,
    };
  }

  private async getGrowthStats() {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(currentMonth.getMonth() - 1);

    const [currentMonthSubs, lastMonthSubs] = await Promise.all([
      this.prisma.newsletterSubscriber.count({
        where: { subscribedAt: { gte: currentMonth } },
      }),
      this.prisma.newsletterSubscriber.count({
        where: {
          subscribedAt: { gte: lastMonth, lt: currentMonth },
        },
      }),
    ]);

    const growthRate = lastMonthSubs > 0 
      ? ((currentMonthSubs - lastMonthSubs) / lastMonthSubs) * 100 
      : 0;

    return {
      currentMonth: currentMonthSubs,
      lastMonth: lastMonthSubs,
      growthRate: Math.round(growthRate * 100) / 100,
    };
  }

  private async logAdminAction(
    adminUserId: string,
    action: string,
    resourceId: string,
    changes: any,
  ): Promise<void> {
    try {
      // TODO: Implement audit logging
      this.logger.info(
        `Admin action: ${action} on resource ${resourceId} by admin ${adminUserId}`,
        changes,
      );
    } catch (error) {
      this.logger.error('Failed to log admin action:', error);
    }
  }
}