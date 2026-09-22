import { BadRequestException, Injectable } from '@nestjs/common';
import { lastChapterOf } from '../stories/story.mapper';
import { StoriesService } from '../stories/stories.service';
import { RecordProgressDto } from './dto/record-progress.dto';
import { ProgressEntryEntity } from './entities/progress-entry.entity';

@Injectable()
export class ProgressService {
  private readonly progressByReader = new Map<string, Map<string, ProgressEntryEntity>>();

  constructor(private readonly storiesService: StoriesService) {}

  recordProgress(readerId: string, dto: RecordProgressDto): ProgressEntryEntity {
    const story = this.storiesService.getRecord(dto.storyId);
    const chapter = story.chapters.find((candidate) => candidate.id === dto.chapterId);
    if (!chapter) {
      throw new BadRequestException(`Chapter ${dto.chapterId} does not belong to story ${dto.storyId}`);
    }

    const entry: ProgressEntryEntity = {
      readerId,
      storyId: story.id,
      chapterId: chapter.id,
      chapterOrder: chapter.order,
      finished: chapter.order === lastChapterOf(story).order,
      updatedAt: new Date().toISOString(),
    };

    const readerProgress = this.progressByReader.get(readerId) ?? new Map<string, ProgressEntryEntity>();
    readerProgress.set(story.id, entry);
    this.progressByReader.set(readerId, readerProgress);

    return entry;
  }

  getProgress(readerId: string): ProgressEntryEntity[] {
    const readerProgress = this.progressByReader.get(readerId);
    if (!readerProgress) {
      return [];
    }
    return [...readerProgress.values()].sort((a, b) => a.storyId.localeCompare(b.storyId));
  }
}
