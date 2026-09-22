import { ApiProperty } from '@nestjs/swagger';
import { ChapterSummaryEntity } from './chapter.entity';

export class StorySummaryEntity {
  @ApiProperty({ example: 'ember-crown' })
  id!: string;

  @ApiProperty({ example: 'The Ember Crown' })
  title!: string;

  @ApiProperty({ example: 'Fantasy' })
  genre!: string;

  @ApiProperty({ example: ['magic-school', 'found-family', 'epic'], type: [String] })
  tags!: string[];

  @ApiProperty({ example: 4.6, minimum: 0, maximum: 5 })
  rating!: number;

  @ApiProperty({ example: 4 })
  chapterCount!: number;
}

export class StoryDetailEntity extends StorySummaryEntity {
  @ApiProperty({ type: [ChapterSummaryEntity] })
  chapters!: ChapterSummaryEntity[];
}
