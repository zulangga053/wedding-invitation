import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PublicController } from './public.controller';
import { PublicInvitationsService } from './public-invitations.service';
import { GiftsService } from '../gifts/gifts.service';
import { EventsService } from '../events/events.service';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';

describe('PublicController (routing)', () => {
  let app: INestApplication;

  const invitations = { getPublished: jest.fn() };
  const gifts = { listPublic: jest.fn() };
  const events = { listPublishedSlugs: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PublicController],
      providers: [
        { provide: PublicInvitationsService, useValue: invitations },
        { provide: GiftsService, useValue: gifts },
        { provide: EventsService, useValue: events },
      ],
    })
      .overrideGuard(RateLimitGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /public/events/slugs returns the sitemap list and is NOT shadowed by :slug', async () => {
    events.listPublishedSlugs.mockResolvedValue([
      { slug: 'z-a', updatedAt: '2026-01-01T00:00:00.000Z' },
    ]);

    const res = await request(app.getHttpServer())
      .get('/v1/public/events/slugs')
      .expect(200);

    expect(res.body).toEqual([
      { slug: 'z-a', updatedAt: '2026-01-01T00:00:00.000Z' },
    ]);
    expect(events.listPublishedSlugs).toHaveBeenCalled();
    expect(invitations.getPublished).not.toHaveBeenCalled();
  });

  it('GET /public/events/:slug delegates to the invitation service', async () => {
    invitations.getPublished.mockResolvedValue({
      invitation: {},
      sections: [],
    });

    await request(app.getHttpServer()).get('/v1/public/events/z-a').expect(200);

    expect(invitations.getPublished).toHaveBeenCalledWith('z-a');
  });

  it('GET /public/events/:slug/gifts delegates to the gift service', async () => {
    gifts.listPublic.mockResolvedValue([]);

    await request(app.getHttpServer())
      .get('/v1/public/events/z-a/gifts')
      .expect(200);

    expect(gifts.listPublic).toHaveBeenCalledWith('z-a');
  });

  it('GET /public/events/:slug rejects an invalid slug with 400', async () => {
    await request(app.getHttpServer())
      .get('/v1/public/events/Bad%20Slug!')
      .expect(400);
  });
});
