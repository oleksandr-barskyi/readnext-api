import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

const SWAGGER_ASSETS = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.17.14';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('ReadNext API')
    .setDescription(
      'A small reading platform API: stories, chapters, reader progress, and a deterministic "recommended for you" feed.',
    )
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customCssUrl: `${SWAGGER_ASSETS}/swagger-ui.css`,
    customJs: [
      `${SWAGGER_ASSETS}/swagger-ui-bundle.js`,
      `${SWAGGER_ASSETS}/swagger-ui-standalone-preset.js`,
    ],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}

bootstrap();
