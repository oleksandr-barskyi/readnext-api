import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Recommendations (e2e)', () => {
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

  it('falls back to the top rated stories for a brand-new reader (cold start)', async () => {
    const response = await request(app.getHttpServer()).get('/readers/cold-start-reader/recommended').expect(200);

    expect(response.body).toHaveLength(5);
    expect(response.body.map((r: { story: { id: string } }) => r.story.id)).toEqual([
      'bloodline-of-ash',
      'ember-crown',
      'a-quiet-kind-of-ruin',
      'the-debt-collectors-daughter',
      'midnight-in-verona-falls',
    ]);
    expect(response.body.every((r: { score: { genreMatch: boolean } }) => r.score.genreMatch === false)).toBe(true);
  });

  it('respects a custom limit', async () => {
    const response = await request(app.getHttpServer()).get('/readers/limit-reader/recommended?limit=3').expect(200);
    expect(response.body).toHaveLength(3);
    expect(response.body.map((r: { story: { id: string } }) => r.story.id)).toEqual([
      'bloodline-of-ash',
      'ember-crown',
      'a-quiet-kind-of-ruin',
    ]);
  });

  it('rejects a limit outside the valid range', async () => {
    await request(app.getHttpServer()).get('/readers/limit-reader/recommended?limit=0').expect(400);
    await request(app.getHttpServer()).get('/readers/limit-reader/recommended?limit=51').expect(400);
  });

  it('excludes a story the reader has finished and boosts genre and tag overlap', async () => {
    await request(app.getHttpServer())
      .post('/readers/finisher/progress')
      .send({ storyId: 'ember-crown', chapterId: 'c4' })
      .expect(201);

    const response = await request(app.getHttpServer()).get('/readers/finisher/recommended').expect(200);

    const ids = response.body.map((r: { story: { id: string } }) => r.story.id);
    expect(ids).not.toContain('ember-crown');
    expect(ids[0]).toBe('bloodline-of-ash');
    expect(response.body[0]).toMatchObject({
      score: { genreMatch: true, tagOverlapCount: 2, total: 8.7 },
    });
  });
});
