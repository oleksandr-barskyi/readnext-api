import { Injectable } from '@nestjs/common';
import { StoryRecord } from '../stories/interfaces/story-record.interface';

export const GENRE_MATCH_WEIGHT = 2;
export const TAG_OVERLAP_WEIGHT = 1;
export const RATING_WEIGHT = 1;

export interface ReaderProfile {
  readonly genres: ReadonlySet<string>;
  readonly tags: ReadonlySet<string>;
}

export interface ScoreBreakdown {
  readonly genreMatch: boolean;
  readonly tagOverlapCount: number;
  readonly rating: number;
  readonly total: number;
}

export interface RankedStory {
  readonly story: StoryRecord;
  readonly breakdown: ScoreBreakdown;
}

@Injectable()
export class ScoringService {
  buildReaderProfile(readStories: readonly StoryRecord[]): ReaderProfile {
    const genres = new Set<string>();
    const tags = new Set<string>();
    for (const story of readStories) {
      genres.add(story.genre);
      for (const tag of story.tags) {
        tags.add(tag);
      }
    }
    return { genres, tags };
  }

  scoreStory(story: StoryRecord, profile: ReaderProfile): ScoreBreakdown {
    const genreMatch = profile.genres.has(story.genre);
    const tagOverlapCount = story.tags.filter((tag) => profile.tags.has(tag)).length;
    const total = (genreMatch ? GENRE_MATCH_WEIGHT : 0) + tagOverlapCount * TAG_OVERLAP_WEIGHT + story.rating * RATING_WEIGHT;
    return { genreMatch, tagOverlapCount, rating: story.rating, total };
  }

  rank(candidates: readonly StoryRecord[], readStories: readonly StoryRecord[]): RankedStory[] {
    const profile = this.buildReaderProfile(readStories);
    return candidates
      .map((story) => ({ story, breakdown: this.scoreStory(story, profile) }))
      .sort((a, b) => {
        if (b.breakdown.total !== a.breakdown.total) {
          return b.breakdown.total - a.breakdown.total;
        }
        if (b.story.rating !== a.story.rating) {
          return b.story.rating - a.story.rating;
        }
        return a.story.title.localeCompare(b.story.title);
      });
  }
}
