import { DatabaseService } from '../../database/database.service';
import { AdminSupportTicketService } from './admin-support-ticket.service';

type ResolvedTicket = {
  createdAt: Date;
  updatedAt: Date;
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
  resolved?: ResolvedTicket[];
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
    user: {
      findUnique: jest.fn(() => Promise.resolve(null)),
    },
  };

  return {
    prisma,
    service: new AdminSupportTicketService(
      // The service only touches the four delegates mocked above.
      prisma as unknown as DatabaseService,
    ),
  };
}

const priorityRow = (
  rows: { priority: string; averageResolutionTime: number | null }[],
  priority: string,
) => rows.find((row) => row.priority === priority);

describe('AdminSupportTicketService.getTicketAnalytics', () => {
  it('reports unknown metrics as null instead of zero when no data exists', async () => {
    const { service } = createService({ total: 1, resolved: [], replies: [] });

    const analytics = await service.getTicketAnalytics();

    expect(analytics.overview.customerSatisfaction).toBeNull();
    expect(analytics.overview.firstResponseTime).toBeNull();
    expect(analytics.overview.averageResolutionTime).toBeNull();
  });

  it('computes first response in minutes from the first staff reply on each ticket', async () => {
    const ticketCreated = new Date('2026-11-01T10:00:00.000Z');
    const { service } = createService({
      total: 1,
      replies: [
        {
          ticketId: 't1',
          createdAt: new Date('2026-11-01T10:30:00.000Z'),
          ticket: { createdAt: ticketCreated },
        },
        // A later reply on the same ticket must not move the mean.
        {
          ticketId: 't1',
          createdAt: new Date('2026-11-01T13:00:00.000Z'),
          ticket: { createdAt: ticketCreated },
        },
      ],
    });

    const analytics = await service.getTicketAnalytics();

    expect(analytics.overview.firstResponseTime).toBe(30);
  });

  it('counts tickets this month against last month and derives growth', async () => {
    const { service } = createService({
      total: 3,
      thisMonth: 2,
      lastMonth: 1,
    });

    const analytics = await service.getTicketAnalytics();

    expect(analytics.trends.ticketsThisMonth).toBe(2);
    expect(analytics.trends.ticketsLastMonth).toBe(1);
    expect(analytics.trends.growthRate).toBe(100);
  });

  it('computes average resolution time per priority from resolved tickets', async () => {
    const { service } = createService({
      total: 4,
      byPriority: { LOW: 1, HIGH: 2, URGENT: 1 },
      resolved: [
        {
          priority: 'HIGH',
          createdAt: new Date('2026-11-01T00:00:00.000Z'),
          updatedAt: new Date('2026-11-01T01:00:00.000Z'),
        },
        {
          priority: 'HIGH',
          createdAt: new Date('2026-11-02T00:00:00.000Z'),
          updatedAt: new Date('2026-11-02T03:00:00.000Z'),
        },
        {
          priority: 'LOW',
          createdAt: new Date('2026-11-03T00:00:00.000Z'),
          updatedAt: new Date('2026-11-03T10:00:00.000Z'),
        },
      ],
    });

    const analytics = await service.getTicketAnalytics();

    // (1h + 3h + 10h) / 3 tickets = 4.666... hours
    expect(analytics.overview.averageResolutionTime).toBe(4.67);
    expect(priorityRow(analytics.byPriority, 'HIGH')).toEqual({
      priority: 'HIGH',
      count: 2,
      averageResolutionTime: 2,
    });
    expect(priorityRow(analytics.byPriority, 'LOW')).toEqual({
      priority: 'LOW',
      count: 1,
      averageResolutionTime: 10,
    });
    // URGENT has tickets but none resolved: no measurement, not zero.
    expect(priorityRow(analytics.byPriority, 'URGENT')).toEqual({
      priority: 'URGENT',
      count: 1,
      averageResolutionTime: null,
    });
  });
});
