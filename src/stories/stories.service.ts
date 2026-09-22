import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { STORIES_SEED } from '../seed/stories-seed.token';
import { ListStoriesQueryDto } from './dto/list-stories-query.dto';
import { ChapterEntity } from './entities/chapter.entity';
import { StoryDetailEntity, StorySummaryEntity } from './entities/story.entity';
import { StoryRecord } from './interfaces/story-record.interface';
import { toChapterEntity, toStoryDetail, toStorySummary } from './story.mapper';

@Injectable()
export class StoriesService {
  constructor(@Inject(STORIES_SEED) private readonly stories: readonly StoryRecord[]) {}

  findAll(query: ListStoriesQueryDto = {}): StorySummaryEntity[] {
    return this.stories
      .filter((story) => (query.genre ? story.genre.toLowerCase() === query.genre.toLowerCase() : true))
      .filter((story) => (query.tag ? story.tags.some((tag) => tag.toLowerCase() === query.tag!.toLowerCase()) : true))
      .map(toStorySummary);
  }

  findOne(id: string): StoryDetailEntity {
    return toStoryDetail(this.getRecord(id));
  }

  findChapter(storyId: string, chapterId: string): ChapterEntity {
    const story = this.getRecord(storyId);
    const chapter = story.chapters.find((candidate) => candidate.id === chapterId);
    if (!chapter) {
      throw new NotFoundException(`Chapter ${chapterId} was not found in story ${storyId}`);
    }
    return toChapterEntity(chapter);
  }

  getRecord(id: string): StoryRecord {
    const story = this.stories.find((candidate) => candidate.id === id);
    if (!story) {
      throw new NotFoundException(`Story ${id} was not found`);
    }
    return story;
  }

  getAllRecords(): readonly StoryRecord[] {
    return this.stories;
  }
}
