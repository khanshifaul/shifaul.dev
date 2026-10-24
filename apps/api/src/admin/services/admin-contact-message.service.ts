import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { LoggerService } from '../../utils/logger/logger.service';

@Injectable()
export class AdminContactMessageService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly logger: LoggerService,
  ) { }

  async getAllContactMessages(query: any) {
    try {
      const {
        status: _status,
        priority: _priority,
        search,
        sortBy,
        sortOrder,
        email,
      } = query;

      const page = parseInt(query.page as string) || 1;
      const limit = parseInt(query.limit as string) || 10;

      const where: any = {};

      if (email) {
        where.email = email;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } },
        ];
      }

      const orderBy: any = {};
      if (sortBy) {
        orderBy[sortBy] = sortOrder === 'asc' ? 'asc' : 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const offset = (page - 1) * limit;

      const messages = await this.prisma.contactMessage.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
      });

      const total = await this.prisma.contactMessage.count({ where });

      return {
        messages: messages.map((message) => ({
          id: message.id,
          name: message.name,
          email: message.email,
          subject: message.subject,
          message: message.message,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        })),
        total,
        hasMore: total > offset + messages.length,
        summary: await this.getContactMessageSummary(),
      };
    } catch (error) {
      this.logger.error('Failed to fetch contact messages:', error);
      throw error;
    }
  }

  async getContactMessageById(id: string) {
    try {
      const message = await this.prisma.contactMessage.findUnique({
        where: { id },
      });

      if (!message) {
        throw new BadRequestException('Contact message not found');
      }

      return {
        id: message.id,
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch contact message ${id}:`, error);
      throw error;
    }
  }

  async deleteContactMessage(id: string, adminUserId: string, reason?: string) {
    try {
      const message = await this.prisma.contactMessage.findUnique({
        where: { id },
      });

      if (!message) {
        throw new BadRequestException('Contact message not found');
      }

      await this.prisma.contactMessage.delete({
        where: { id },
      });

      // Log admin action
      await this.logAdminAction(adminUserId, 'CONTACT_MESSAGE_DELETED', id, {
        reason,
        message: `${message.name} (${message.email})`,
      });

      this.logger.info(
        `Contact message ${id} deleted by admin ${adminUserId}`,
      );

      return {
        id,
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to delete contact message ${id}:`, error);
      throw error;
    }
  }

  async getContactMessageAnalytics() {
    try {
      const totalMessages = await this.prisma.contactMessage.count();

      const messagesByMonth = await this.prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM contact_messages
        WHERE "createdAt" >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
      `;

      const recentActivity = await this.prisma.contactMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          createdAt: true,
        },
      });

      return {
        overview: {
          totalMessages,
        },
        trends: {
          messagesByMonth,
        },
        recentActivity,
      };
    } catch (error) {
      this.logger.error('Failed to get contact message analytics:', error);
      throw error;
    }
  }

  public async getContactMessageSummary() {
    const totalMessages = await this.prisma.contactMessage.count();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const messagesToday = await this.prisma.contactMessage.count({
      where: { createdAt: { gte: today } },
    });

    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - 7);

    const messagesThisWeek = await this.prisma.contactMessage.count({
      where: { createdAt: { gte: thisWeek } },
    });

    return {
      totalMessages,
      messagesToday,
      messagesThisWeek,
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