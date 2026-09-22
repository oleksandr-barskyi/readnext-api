import { Module } from '@nestjs/common';
import { STORIES } from '../seed/stories.seed';
import { STORIES_SEED } from '../seed/stories-seed.token';
import { StoriesController } from './stories.controller';
import { StoriesService } from './stories.service';

@Module({
  controllers: [StoriesController],
  providers: [StoriesService, { provide: STORIES_SEED, useValue: STORIES }],
  exports: [StoriesService],
})
export class StoriesModule {}
