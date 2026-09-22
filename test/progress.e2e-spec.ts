import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Progress (e2e)', () => {
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

  it('GET /readers/:readerId/progress starts empty for a fresh reader', async () => {
    const response = await request(app.getHttpServer()).get('/readers/fresh-reader/progress').expect(200);
    expect(response.body).toEqual([]);
  });

  it('POST /readers/:readerId/progress records an in-progress chapter as unfinished', async () => {
    const response = await request(app.getHttpServer())
      .post('/readers/reader-1/progress')
      .send({ storyId: 'ember-crown', chapterId: 'c2' })
      .expect(201);

    expect(response.body).toMatchObject({
      readerId: 'reader-1',
      storyId: 'ember-crown',
      chapterId: 'c2',
      chapterOrder: 2,
      finished: false,
    });
  });

  it('GET /readers/:readerId/progress reflects what was recorded', async () => {
    const response = await request(app.getHttpServer()).get('/readers/reader-1/progress').expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toMatchObject({ storyId: 'ember-crown', chapterId: 'c2' });
  });

  it('POST records the last chapter as finished', async () => {
    const response = await request(app.getHttpServer())
      .post('/readers/reader-1/progress')
      .send({ storyId: 'ember-crown', chapterId: 'c4' })
      .expect(201);

    expect(response.body.finished).toBe(true);
  });

  it('POST rejects a body missing required fields', async () => {
    await request(app.getHttpServer()).post('/readers/reader-1/progress').send({ storyId: 'ember-crown' }).expect(400);
  });

  it('POST returns 404 for an unknown story', async () => {
    await request(app.getHttpServer())
      .post('/readers/reader-1/progress')
      .send({ storyId: 'does-not-exist', chapterId: 'c1' })
      .expect(404);
  });

  it('POST returns 400 when the chapter does not belong to the story', async () => {
    await request(app.getHttpServer())
      .post('/readers/reader-1/progress')
      .send({ storyId: 'ember-crown', chapterId: 'no-such-chapter' })
      .expect(400);
  });
});
