import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { DatabaseService } from './../src/database/database.service';

/**
 * Boots the root routes with the database stubbed.
 *
 * The full AppModule cannot boot without a real database (DatabaseService
 * connects in onModuleInit) and a complete environment, so this spec wires
 * AppController/AppService with the same ConfigService and DatabaseService
 * tokens and exercises the real HTTP routes.
 */
describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  const config = {
    NODE_ENV: 'test',
    FRONTEND_URL: 'https://example.test',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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
          useValue: { $queryRaw: jest.fn().mockResolvedValue([{}]) },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET / redirects to FRONTEND_URL', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(302)
      .expect('Location', 'https://example.test');
  });

  it('GET /health returns 200 with component status', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('UP');
        expect(res.body.components.database.status).toBe('UP');
      });
  });
});
