import { ApiProperty } from '@nestjs/swagger';

export class ProgressEntryEntity {
  @ApiProperty({ example: 'reader-42' })
  readerId!: string;

  @ApiProperty({ example: 'ember-crown' })
  storyId!: string;

  @ApiProperty({ example: 'c2' })
  chapterId!: string;

  @ApiProperty({ example: 2, description: 'Reading order of chapterId within the story' })
  chapterOrder!: number;

  @ApiProperty({ example: false, description: 'True when chapterId is the story\'s last chapter' })
  finished!: boolean;

  @ApiProperty({ example: '2026-09-22T18:04:00.000Z' })
  updatedAt!: string;
}
