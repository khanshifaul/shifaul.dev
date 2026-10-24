import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../utils/logger/logger.service';
import { TelegramService } from '../notifier/telegram.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactMessageQueryDto } from './dto/contact-message-query.dto';

@Injectable()
export class ContactMessagesService {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly logger: LoggerService,
    private readonly telegram: TelegramService,
  ) {}

  async createContactMessage(dto: CreateContactMessageDto) {
    try {
      const contactMessage = await this.prisma.contactMessage.create({
        data: {
          name: dto.name,
          email: dto.email,
          subject: dto.subject,
          message: dto.message,
        },
      });

      this.logger.info(
        `Contact message created: ${contactMessage.id} from ${contactMessage.email}`,
      );

      // Notify Shifaul via Telegram — fire-and-forget so the form response is fast.
      this.telegram
        .sendContactForm({
          name: dto.name,
          email: dto.email,
          subject: dto.subject,
          message: dto.message,
        })
        .then((sent) => {
          this.logger.info(
            `Contact form ${contactMessage.id} telegram notification ${sent ? 'sent' : 'skipped/failed'}`,
          );
        })
        .catch((err) => {
          this.logger.error(
            `Contact form telegram notification crashed: ${err instanceof Error ? err.message : String(err)}`,
          );
        });

      return {
        id: contactMessage.id,
        name: contactMessage.name,
        email: contactMessage.email,
        subject: contactMessage.subject,
        message: contactMessage.message,
        createdAt: contactMessage.createdAt,
        updatedAt: contactMessage.updatedAt,
      };
    } catch (error) {
      this.logger.error('Failed to create contact message', error.message);
      throw new BadRequestException('Failed to create contact message');
    }
  }

  async getContactMessages(query: ContactMessageQueryDto) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        email,
      } = query;

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
      orderBy[sortBy] = sortOrder;

      const offset = (page - 1) * limit;

      const [messages, total] = await Promise.all([
        this.prisma.contactMessage.findMany({
          where,
          orderBy,
          skip: offset,
          take: limit,
        }),
        this.prisma.contactMessage.count({ where }),
      ]);

      return {
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get contact messages', error.message);
      throw new BadRequestException('Failed to retrieve contact messages');
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

      return message;
    } catch (error) {
      this.logger.error(
        `Failed to get contact message ${id}`,
        error.message,
      );
      throw error;
    }
  }

  async deleteContactMessage(id: string) {
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

      this.logger.info(`Contact message deleted: ${id}`);

      return {
        id,
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete contact message ${id}`,
        error.message,
      );
      throw error;
    }
  }

  async getContactMessageStats() {
    try {
      const totalMessages = await this.prisma.contactMessage.count();

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - 7);
      const thisMonth = new Date(today);
      thisMonth.setDate(1);

      const [messagesToday, messagesThisWeek, messagesThisMonth] = await Promise.all([
        this.prisma.contactMessage.count({
          where: { createdAt: { gte: today } },
        }),
        this.prisma.contactMessage.count({
          where: { createdAt: { gte: thisWeek } },
        }),
        this.prisma.contactMessage.count({
          where: { createdAt: { gte: thisMonth } },
        }),
      ]);

      return {
        total: totalMessages,
        today: messagesToday,
        thisWeek: messagesThisWeek,
        thisMonth: messagesThisMonth,
      };
    } catch (error) {
      this.logger.error('Failed to get contact message stats', error.message);
      throw new BadRequestException('Failed to retrieve contact message statistics');
    }
  }
}