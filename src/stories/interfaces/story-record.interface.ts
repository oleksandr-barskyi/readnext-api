export interface ChapterRecord {
  readonly id: string;
  readonly title: string;
  readonly order: number;
  readonly content: string;
}

export interface StoryRecord {
  readonly id: string;
  readonly title: string;
  readonly genre: string;
  readonly tags: readonly string[];
  readonly rating: number;
  readonly chapters: readonly ChapterRecord[];
}
