import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListStoriesQueryDto {
  @ApiPropertyOptional({ example: 'Fantasy', description: 'Filter by exact genre match' })
  @IsOptional()
  @IsString()
  genre?: string;

  @ApiPropertyOptional({ example: 'slow-burn', description: 'Filter by a single tag' })
  @IsOptional()
  @IsString()
  tag?: string;
}
