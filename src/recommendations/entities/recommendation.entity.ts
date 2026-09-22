import { ApiProperty } from '@nestjs/swagger';
import { StorySummaryEntity } from '../../stories/entities/story.entity';

export class ScoreBreakdownEntity {
  @ApiProperty({ example: true, description: "Whether the story's genre matches something the reader has already read" })
  genreMatch!: boolean;

  @ApiProperty({ example: 2, description: 'How many tags this story shares with stories the reader has already read' })
  tagOverlapCount!: number;

  @ApiProperty({ example: 4.6, description: "The story's own rating, 0 to 5" })
  rating!: number;

  @ApiProperty({ example: 8.6, description: 'genreMatch * 2 + tagOverlapCount * 1 + rating * 1' })
  total!: number;
}

export class RecommendationEntity {
  @ApiProperty({ type: StorySummaryEntity })
  story!: StorySummaryEntity;

  @ApiProperty({ type: ScoreBreakdownEntity })
  score!: ScoreBreakdownEntity;
}
