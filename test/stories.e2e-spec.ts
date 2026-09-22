import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Stories (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /stories returns every seeded story', async () => {
    const response = await request(app.getHttpServer()).get('/stories').expect(200);
    expect(response.body).toHaveLength(10);
    expect(response.body[0]).toMatchObject({ id: 'ember-crown', genre: 'Fantasy' });
  });

  it('GET /stories?genre=Fantasy filters by genre', async () => {
    const response = await request(app.getHttpServer()).get('/stories?genre=Fantasy').expect(200);
    expect(response.body.map((s: { id: string }) => s.id)).toEqual(['ember-crown', 'bloodline-of-ash']);
  });

  it('GET /stories?tag=slow-burn filters by tag', async () => {
    const response = await request(app.getHttpServer()).get('/stories?tag=slow-burn').expect(200);
    expect(response.body.map((s: { id: string }) => s.id)).toEqual([
      'midnight-in-verona-falls',
      'whistling-hollow',
      'paper-moons',
    ]);
  });

  it('GET /stories rejects an unknown query field', async () => {
    await request(app.getHttpServer()).get('/stories?bogus=1').expect(400);
  });

  it('GET /stories/:id returns the story with an ordered table of contents', async () => {
    const response = await request(app.getHttpServer()).get('/stories/ember-crown').expect(200);
    expect(response.body.chapterCount).toBe(4);
    expect(response.body.chapters.map((c: { id: string }) => c.id)).toEqual(['c1', 'c2', 'c3', 'c4']);
    expect(response.body.chapters[0].content).toBeUndefined();
  });

  it('GET /stories/:id returns 404 for an unknown story', async () => {
    await request(app.getHttpServer()).get('/stories/does-not-exist').expect(404);
  });

  it('GET /stories/:id/chapters/:chapterId returns the full chapter text', async () => {
    const response = await request(app.getHttpServer()).get('/stories/ember-crown/chapters/c2').expect(200);
    expect(response.body).toMatchObject({ id: 'c2', order: 2 });
    expect(typeof response.body.content).toBe('string');
    expect(response.body.content.length).toBeGreaterThan(0);
  });

  it('GET /stories/:id/chapters/:chapterId returns 404 for an unknown chapter', async () => {
    await request(app.getHttpServer()).get('/stories/ember-crown/chapters/does-not-exist').expect(404);
  });

  it('GET /stories/:id/chapters/:chapterId returns 404 for an unknown story', async () => {
    await request(app.getHttpServer()).get('/stories/does-not-exist/chapters/c1').expect(404);
  });
});
