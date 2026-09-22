import { StoryRecord } from '../stories/interfaces/story-record.interface';
import { ScoringService } from './scoring.service';

function story(overrides: Partial<StoryRecord> & Pick<StoryRecord, 'id' | 'title'>): StoryRecord {
  return {
    genre: 'Fantasy',
    tags: [],
    rating: 4.0,
    chapters: [{ id: 'c1', title: 'One', order: 1, content: 'placeholder' }],
    ...overrides,
  };
}

describe('ScoringService', () => {
  let scoringService: ScoringService;

  beforeEach(() => {
    scoringService = new ScoringService();
  });

  describe('scoreStory', () => {
    it('scores genre match, tag overlap and rating with the documented weights', () => {
      const readStory = story({ id: 'a', title: 'Alpha', genre: 'Fantasy', tags: ['magic', 'war'] });
      const candidate = story({ id: 'b', title: 'Beta', genre: 'Fantasy', tags: ['magic', 'romance'], rating: 3.0 });

      const profile = scoringService.buildReaderProfile([readStory]);
      const breakdown = scoringService.scoreStory(candidate, profile);

      expect(breakdown.genreMatch).toBe(true);
      expect(breakdown.tagOverlapCount).toBe(1);
      expect(breakdown.rating).toBe(3.0);
      expect(breakdown.total).toBe(2 + 1 + 3.0);
    });

    it('scores zero overlap as rating alone', () => {
      const candidate = story({ id: 'c', title: 'Gamma', genre: 'Sci-Fi', tags: ['space'], rating: 4.5 });
      const profile = scoringService.buildReaderProfile([]);

      expect(scoringService.scoreStory(candidate, profile)).toEqual({
        genreMatch: false,
        tagOverlapCount: 0,
        rating: 4.5,
        total: 4.5,
      });
    });
  });

  describe('rank: cold start', () => {
    it('falls back to sorting by rating when the reader has no history, with no special-cased branch', () => {
      const a = story({ id: 'a', title: 'Alpha', genre: 'Fantasy', tags: ['magic'], rating: 4.0 });
      const b = story({ id: 'b', title: 'Beta', genre: 'Romance', tags: ['romance'], rating: 3.0 });
      const c = story({ id: 'c', title: 'Gamma', genre: 'Sci-Fi', tags: ['space'], rating: 4.5 });

      const ranked = scoringService.rank([a, b, c], []);

      expect(ranked.map((entry) => entry.story.id)).toEqual(['c', 'a', 'b']);
      expect(ranked.every((entry) => entry.breakdown.genreMatch === false)).toBe(true);
      expect(ranked.every((entry) => entry.breakdown.tagOverlapCount === 0)).toBe(true);
    });
  });

  describe('rank: overlap weighting', () => {
    it('ranks genre and tag overlap above a higher-rated story with no overlap', () => {
      const readFantasy = story({ id: 'a', title: 'Alpha', genre: 'Fantasy', tags: ['magic', 'war'], rating: 4.0 });
      const overlapping = story({ id: 'b', title: 'Beta', genre: 'Fantasy', tags: ['magic', 'romance'], rating: 3.0 });
      const noOverlapHighRating = story({ id: 'c', title: 'Gamma', genre: 'Sci-Fi', tags: ['space'], rating: 4.5 });
      const noOverlapLowRating = story({ id: 'd', title: 'Delta', genre: 'Romance', tags: ['romance'], rating: 4.0 });

      const ranked = scoringService.rank([overlapping, noOverlapHighRating, noOverlapLowRating], [readFantasy]);

      expect(ranked.map((entry) => entry.story.id)).toEqual(['b', 'c', 'd']);
      expect(ranked[0]!.breakdown.total).toBe(6.0);
    });
  });

  describe('rank: tie-breaking', () => {
    it('breaks an equal total by rating when genre and tag scoring produced the same number', () => {
      const higherRatingNoOverlap = story({ id: 'y', title: 'Yankee', genre: 'Horror', tags: [], rating: 5.0 });
      const lowerRatingWithGenreMatch = story({ id: 'x', title: 'Xray', genre: 'Fantasy', tags: [], rating: 3.0 });
      const readStory = story({ id: 'r', title: 'Reference', genre: 'Fantasy', tags: [] });

      const ranked = scoringService.rank([higherRatingNoOverlap, lowerRatingWithGenreMatch], [readStory]);

      expect(ranked[0]!.breakdown.total).toBe(ranked[1]!.breakdown.total);
      expect(ranked.map((entry) => entry.story.id)).toEqual(['y', 'x']);
    });

    it('breaks a fully equal score alphabetically by title', () => {
      const n = story({ id: 'n', title: 'November', genre: 'Horror', tags: [], rating: 4.0 });
      const m = story({ id: 'm', title: 'Mike', genre: 'Horror', tags: [], rating: 4.0 });

      const ranked = scoringService.rank([n, m], []);

      expect(ranked[0]!.breakdown.total).toBe(ranked[1]!.breakdown.total);
      expect(ranked.map((entry) => entry.story.id)).toEqual(['m', 'n']);
    });
  });
});
