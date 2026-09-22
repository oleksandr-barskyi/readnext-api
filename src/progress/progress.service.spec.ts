import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StoryRecord } from '../stories/interfaces/story-record.interface';
import { StoriesService } from '../stories/stories.service';
import { ProgressService } from './progress.service';

const FIXTURE: readonly StoryRecord[] = [
  {
    id: 's1',
    title: 'Alpha',
    genre: 'Fantasy',
    tags: ['magic'],
    rating: 4.2,
    chapters: [
      { id: 'c1', title: 'One', order: 1, content: 'first' },
      { id: 'c2', title: 'Two', order: 2, content: 'second' },
      { id: 'c3', title: 'Three', order: 3, content: 'third' },
    ],
  },
];

describe('ProgressService', () => {
  let progressService: ProgressService;

  beforeEach(() => {
    progressService = new ProgressService(new StoriesService(FIXTURE));
  });

  it('records progress that is not the last chapter as unfinished', () => {
    const entry = progressService.recordProgress('reader-1', { storyId: 's1', chapterId: 'c2' });
    expect(entry).toMatchObject({ readerId: 'reader-1', storyId: 's1', chapterId: 'c2', chapterOrder: 2, finished: false });
    expect(typeof entry.updatedAt).toBe('string');
  });

  it('marks progress at the last chapter as finished', () => {
    const entry = progressService.recordProgress('reader-1', { storyId: 's1', chapterId: 'c3' });
    expect(entry.finished).toBe(true);
  });

  it('overwrites earlier progress for the same reader and story', () => {
    progressService.recordProgress('reader-1', { storyId: 's1', chapterId: 'c1' });
    progressService.recordProgress('reader-1', { storyId: 's1', chapterId: 'c2' });

    const progress = progressService.getProgress('reader-1');
    expect(progress).toHaveLength(1);
    expect(progress[0]).toMatchObject({ chapterId: 'c2' });
  });

  it('throws NotFoundException for an unknown story', () => {
    expect(() => progressService.recordProgress('reader-1', { storyId: 'missing', chapterId: 'c1' })).toThrow(
      NotFoundException,
    );
  });

  it('throws BadRequestException when the chapter does not belong to the story', () => {
    expect(() => progressService.recordProgress('reader-1', { storyId: 's1', chapterId: 'no-such-chapter' })).toThrow(
      BadRequestException,
    );
  });

  it('returns an empty list for a reader with no progress', () => {
    expect(progressService.getProgress('nobody')).toEqual([]);
  });
});
