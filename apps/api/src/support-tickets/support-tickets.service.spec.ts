import { DatabaseService } from '../database/database.service';
import { LoggerService } from '../utils/logger/logger.service';
import { StorageService } from '../storage/storage.service';
import { SupportTicketsService } from './support-tickets.service';

// storage.service pulls in uuid, which is ESM-only and breaks this Jest config.
jest.mock('../storage/storage.service', () => ({
  StorageService: class StorageService {},
}));

type ClosedTicket = {
  createdAt: Date;
  closedAt: Date | null;
  priority: string;
};

type StaffReply = {
  ticketId: string;
  createdAt: Date;
  ticket: { createdAt: Date };
};

interface Scenario {
  total?: number;
  thisMonth?: number;
  lastMonth?: number;
  byStatus?: Record<string, number>;
  byPriority?: Record<string, number>;
  resolved?: ClosedTicket[];
  replies?: StaffReply[];
}

function createService(scenario: Scenario) {
  const prisma = {
    supportTicket: {
      count: jest.fn(
        (args?: { where?: { createdAt?: { lt?: Date } } }): Promise<number> => {
          if (!args?.where?.createdAt) {
            return Promise.resolve(scenario.total ?? 0);
          }
          return Promise.resolve(
            args.where.createdAt.lt
              ? (scenario.lastMonth ?? 0)
              : (scenario.thisMonth ?? 0),
          );
        },
      ),
      groupBy: jest.fn((args: { by: string[] }): Promise<unknown[]> => {
        if (args.by.includes('status')) {
          return Promise.resolve(
            Object.entries(scenario.byStatus ?? {}).map(([status, count]) => ({
              status,
              _count: { id: count },
            })),
          );
        }
        if (args.by.includes('priority')) {
          return Promise.resolve(
            Object.entries(scenario.byPriority ?? {}).map(
              ([priority, count]) => ({
                priority,
                _count: { id: count },
              }),
            ),
          );
        }
        return Promise.resolve([]);
      }),
      findMany: jest.fn(() => Promise.resolve(scenario.resolved ?? [])),
    },
    ticketReply: {
      findMany: jest.fn(() => Promise.resolve(scenario.replies ?? [])),
    },
  };

  const logger = { info: jest.fn(), error: jest.fn() };

  return new SupportTicketsService(
    // The service only touches the two delegates mocked above; the constructor
    // logs once through the logger stub.
    prisma as unknown as DatabaseService,
    logger as unknown as LoggerService,
    {} as unknown as StorageService,
  );
}

describe('SupportTicketsService.getEnhancedAnalytics', () => {
  it('reports unknown metrics as null instead of zero when no data exists', async () => {
    const service = createService({ total: 1, resolved: [], replies: [] });

    const analytics = await service.getEnhancedAnalytics('admin-1', ['admin']);

    expect(analytics.overview.customerSatisfaction).toBeNull();
    expect(analytics.overview.firstResponseTime).toBeNull();
    expect(analytics.overview.averageResolutionTime).toBeNull();
  });

  it('computes first response in minutes from the first staff reply on each ticket', async () => {
    const ticketCreated = new Date('2026-11-01T10:00:00.000Z');
    const service = createService({
      total: 1,
      replies: [
        {
          ticketId: 't1',
          createdAt: new Date('2026-11-01T10:30:00.000Z'),
          ticket: { createdAt: ticketCreated },
        },
        {
          ticketId: 't1',
          createdAt: new Date('2026-11-01T13:00:00.000Z'),
          ticket: { createdAt: ticketCreated },
        },
      ],
    });

    const analytics = await service.getEnhancedAnalytics('admin-1', ['admin']);

    expect(analytics.overview.firstResponseTime).toBe(30);
  });

  it('counts tickets this month against last month and derives growth', async () => {
    const service = createService({ total: 3, thisMonth: 2, lastMonth: 1 });

    const analytics = await service.getEnhancedAnalytics('admin-1', ['admin']);

    expect(analytics.trends.ticketsThisMonth).toBe(2);
    expect(analytics.trends.ticketsLastMonth).toBe(1);
    expect(analytics.trends.growthRate).toBe(100);
  });

  it('computes average resolution time per priority from closed tickets', async () => {
    const service = createService({
      total: 4,
      byPriority: { LOW: 1, HIGH: 2, URGENT: 1 },
      resolved: [
        {
          priority: 'HIGH',
          createdAt: new Date('2026-11-01T00:00:00.000Z'),
          closedAt: new Date('2026-11-01T02:00:00.000Z'),
        },
        {
          priority: 'HIGH',
          createdAt: new Date('2026-11-02T00:00:00.000Z'),
          closedAt: new Date('2026-11-02T04:00:00.000Z'),
        },
        {
          priority: 'LOW',
          createdAt: new Date('2026-11-03T00:00:00.000Z'),
          closedAt: new Date('2026-11-03T12:00:00.000Z'),
        },
      ],
    });

    const analytics = await service.getEnhancedAnalytics('admin-1', ['admin']);

    // (2h + 4h + 12h) / 3 tickets = 6 hours
    expect(analytics.overview.averageResolutionTime).toBe(6);
    expect(
      analytics.byPriority.find(
        (row: { priority: string }) => row.priority === 'HIGH',
      ),
    ).toEqual({ priority: 'HIGH', count: 2, averageResolutionTime: 3 });
    expect(
      analytics.byPriority.find(
        (row: { priority: string }) => row.priority === 'LOW',
      ),
    ).toEqual({ priority: 'LOW', count: 1, averageResolutionTime: 12 });
    expect(
      analytics.byPriority.find(
        (row: { priority: string }) => row.priority === 'URGENT',
      ),
    ).toEqual({ priority: 'URGENT', count: 1, averageResolutionTime: null });
  });
});
