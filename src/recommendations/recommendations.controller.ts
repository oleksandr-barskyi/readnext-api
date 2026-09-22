import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProgressService } from '../progress/progress.service';
import { toStorySummary } from '../stories/story.mapper';
import { StoriesService } from '../stories/stories.service';
import { RecommendedQueryDto } from './dto/recommended-query.dto';
import { RecommendationEntity } from './entities/recommendation.entity';
import { ScoringService } from './scoring.service';

const DEFAULT_LIMIT = 5;

@ApiTags('recommendations')
@Controller('readers/:readerId/recommended')
export class RecommendationsController {
  constructor(
    private readonly storiesService: StoriesService,
    private readonly progressService: ProgressService,
    private readonly scoringService: ScoringService,
  ) {}

  @Get()
  @ApiOperation({ summary: "Rank stories the reader has not finished, for that reader" })
  @ApiOkResponse({ type: [RecommendationEntity] })
  getRecommended(@Param('readerId') readerId: string, @Query() query: RecommendedQueryDto): RecommendationEntity[] {
    const allStories = this.storiesService.getAllRecords();
    const progress = this.progressService.getProgress(readerId);

    const finishedStoryIds = new Set(progress.filter((entry) => entry.finished).map((entry) => entry.storyId));
    const readStoryIds = new Set(progress.map((entry) => entry.storyId));

    const candidates = allStories.filter((story) => !finishedStoryIds.has(story.id));
    const readStories = allStories.filter((story) => readStoryIds.has(story.id));

    const ranked = this.scoringService.rank(candidates, readStories);
    const limit = query.limit ?? DEFAULT_LIMIT;

    return ranked.slice(0, limit).map(({ story, breakdown }) => ({
      story: toStorySummary(story),
      score: breakdown,
    }));
  }
}
