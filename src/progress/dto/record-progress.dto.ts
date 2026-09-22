import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RecordProgressDto {
  @ApiProperty({ example: 'ember-crown' })
  @IsString()
  @IsNotEmpty()
  storyId!: string;

  @ApiProperty({ example: 'c2' })
  @IsString()
  @IsNotEmpty()
  chapterId!: string;
}
