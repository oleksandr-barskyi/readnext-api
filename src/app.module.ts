import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProgressModule } from './progress/progress.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { StoriesModule } from './stories/stories.module';

@Module({
  imports: [StoriesModule, ProgressModule, RecommendationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
