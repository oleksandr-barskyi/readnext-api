import { ApiProperty } from '@nestjs/swagger';

export class ChapterSummaryEntity {
  @ApiProperty({ example: 'c1' })
  id!: string;

  @ApiProperty({ example: 'The Entrance Exam' })
  title!: string;

  @ApiProperty({ example: 1, description: 'Reading order within the story, starting at 1' })
  order!: number;
}

export class ChapterEntity extends ChapterSummaryEntity {
  @ApiProperty({ example: 'Kira burns her acceptance letter by accident.' })
  content!: string;
}
