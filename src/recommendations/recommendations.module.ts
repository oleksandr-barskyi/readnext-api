import { Module } from '@nestjs/common';
import { ProgressModule } from '../progress/progress.module';
import { StoriesModule } from '../stories/stories.module';
import { RecommendationsController } from './recommendations.controller';
import { ScoringService } from './scoring.service';

@Module({
  imports: [StoriesModule, ProgressModule],
  controllers: [RecommendationsController],
  providers: [ScoringService],
})
export class RecommendationsModule {}
