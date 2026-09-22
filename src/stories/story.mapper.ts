import { ChapterEntity, ChapterSummaryEntity } from './entities/chapter.entity';
import { StoryDetailEntity, StorySummaryEntity } from './entities/story.entity';
import { ChapterRecord, StoryRecord } from './interfaces/story-record.interface';

export function toChapterSummary(chapter: ChapterRecord): ChapterSummaryEntity {
  return { id: chapter.id, title: chapter.title, order: chapter.order };
}

export function toChapterEntity(chapter: ChapterRecord): ChapterEntity {
  return { ...toChapterSummary(chapter), content: chapter.content };
}

export function toStorySummary(story: StoryRecord): StorySummaryEntity {
  return {
    id: story.id,
    title: story.title,
    genre: story.genre,
    tags: [...story.tags],
    rating: story.rating,
    chapterCount: story.chapters.length,
  };
}

export function toStoryDetail(story: StoryRecord): StoryDetailEntity {
  return {
    ...toStorySummary(story),
    chapters: story.chapters.map(toChapterSummary).sort((a, b) => a.order - b.order),
  };
}

export function lastChapterOf(story: StoryRecord): ChapterRecord {
  return [...story.chapters].sort((a, b) => b.order - a.order)[0];
}
