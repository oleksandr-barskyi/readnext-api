import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListStoriesQueryDto } from './dto/list-stories-query.dto';
import { ChapterEntity } from './entities/chapter.entity';
import { StoryDetailEntity, StorySummaryEntity } from './entities/story.entity';
import { StoriesService } from './stories.service';

@ApiTags('stories')
@Controller('stories')
export class StoriesController {
  constructor(private readonly storiesService: StoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List stories, optionally filtered by genre or tag' })
  @ApiOkResponse({ type: [StorySummaryEntity] })
  findAll(@Query() query: ListStoriesQueryDto): StorySummaryEntity[] {
    return this.storiesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one story with its table of contents' })
  @ApiOkResponse({ type: StoryDetailEntity })
  findOne(@Param('id') id: string): StoryDetailEntity {
    return this.storiesService.findOne(id);
  }

  @Get(':id/chapters/:chapterId')
  @ApiOperation({ summary: 'Get the full text of one chapter' })
  @ApiOkResponse({ type: ChapterEntity })
  findChapter(@Param('id') id: string, @Param('chapterId') chapterId: string): ChapterEntity {
    return this.storiesService.findChapter(id, chapterId);
  }
}
