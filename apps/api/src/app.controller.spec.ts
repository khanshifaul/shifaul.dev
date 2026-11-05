import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';

describe('AppController', () => {
  let appController: AppController;
  let queryRaw: jest.Mock;

  const config = {
    NODE_ENV: 'test',
    FRONTEND_URL: 'https://example.test',
  };

  beforeEach(async () => {
    queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(
              (key: string, defaultValue?: unknown) =>
                config[key] ?? defaultValue,
            ),
          },
        },
        {
          provide: DatabaseService,
          useValue: { $queryRaw: queryRaw },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('reports UP when the database answers', async () => {
      const health = await appController.getHealth();

      expect(queryRaw).toHaveBeenCalledTimes(1);
      expect(health.status).toBe('UP');
      expect(health.components.database.status).toBe('UP');
      expect(health.environment).toBe('test');
    });

    it('reports DOWN when the database fails', async () => {
      queryRaw.mockRejectedValueOnce(new Error('connection refused'));

      const health = await appController.getHealth();

      expect(health.status).toBe('DOWN');
      expect(health.components.database.status).toBe('DOWN');
    });
  });

  describe('root', () => {
    it('redirects to FRONTEND_URL', () => {
      const res = { redirect: jest.fn() } as unknown as Parameters<
        AppController['redirectToFrontend']
      >[0];

      appController.redirectToFrontend(res);

      expect(res.redirect).toHaveBeenCalledWith(302, 'https://example.test');
    });
  });
});
