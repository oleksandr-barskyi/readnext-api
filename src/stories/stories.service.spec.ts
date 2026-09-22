import { NotFoundException } from '@nestjs/common';
import { StoryRecord } from './interfaces/story-record.interface';
import { StoriesService } from './stories.service';

const FIXTURE: readonly StoryRecord[] = [
  {
    id: 's1',
    title: 'Alpha',
    genre: 'Fantasy',
    tags: ['magic', 'war'],
    rating: 4.2,
    chapters: [
      { id: 'c1', title: 'One', order: 1, content: 'first' },
      { id: 'c2', title: 'Two', order: 2, content: 'second' },
    ],
  },
  {
    id: 's2',
    title: 'Beta',
    genre: 'Romance',
    tags: ['slow-burn'],
    rating: 3.9,
    chapters: [{ id: 'c1', title: 'One', order: 1, content: 'first' }],
  },
];

describe('StoriesService', () => {
  let storiesService: StoriesService;

  beforeEach(() => {
    storiesService = new StoriesService(FIXTURE);
  });

  describe('findAll', () => {
    it('returns every story with no filter', () => {
      expect(storiesService.findAll().map((s) => s.id)).toEqual(['s1', 's2']);
    });

    it('filters by genre, case-insensitively', () => {
      expect(storiesService.findAll({ genre: 'fantasy' }).map((s) => s.id)).toEqual(['s1']);
    });

    it('filters by tag, case-insensitively', () => {
      expect(storiesService.findAll({ tag: 'SLOW-BURN' }).map((s) => s.id)).toEqual(['s2']);
    });

    it('returns an empty list when nothing matches', () => {
      expect(storiesService.findAll({ genre: 'Horror' })).toEqual([]);
    });

    it('includes chapterCount instead of full chapters in the summary', () => {
      const [alpha] = storiesService.findAll({ genre: 'Fantasy' });
      expect(alpha).toMatchObject({ id: 's1', chapterCount: 2 });
      expect((alpha as unknown as { chapters?: unknown }).chapters).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('returns the story with its table of contents, ordered', () => {
      const detail = storiesService.findOne('s1');
      expect(detail.chapters.map((c) => c.id)).toEqual(['c1', 'c2']);
    });

    it('throws NotFoundException for an unknown id', () => {
      expect(() => storiesService.findOne('missing')).toThrow(NotFoundException);
    });
  });

  describe('findChapter', () => {
    it('returns the full chapter text', () => {
      expect(storiesService.findChapter('s1', 'c2')).toMatchObject({ id: 'c2', content: 'second' });
    });

    it('throws NotFoundException for an unknown story', () => {
      expect(() => storiesService.findChapter('missing', 'c1')).toThrow(NotFoundException);
    });

    it('throws NotFoundException for an unknown chapter on a real story', () => {
      expect(() => storiesService.findChapter('s1', 'missing')).toThrow(NotFoundException);
    });
  });
});
