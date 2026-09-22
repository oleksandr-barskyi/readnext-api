# ReadNext API

A NestJS REST API for a small reading platform: stories and chapters, a reader's
progress through them, and a "recommended for you" feed built on a scoring
function you can read top to bottom in one sitting.

No database, no API key, no account. Clone it and it runs.

```bash
npm install
npm run start
```

Then open [http://localhost:3000/docs](http://localhost:3000/docs) for the
interactive Swagger UI, or use the curl examples below. `npm run build` compiles
to `dist/`, `npm run start:prod` runs the compiled build.

## What this project demonstrates

This is a portfolio project, so the interesting parts are deliberate.

**A recommendation feed that is math, not marketing.** `ScoringService` ranks
stories with three additions and a sort. No model, no training data, no vector
store. The formula is spelled out below, including where it falls apart, because
a scoring function you cannot explain to a reviewer is not one you should ship.

**Cold start with no special-cased branch.** A reader with no reading history
gets a "top rated" feed. That is not an `if (noHistory)` shortcut anywhere in the
code: an empty taste profile has zero genre and tag overlap by construction, so
the overlap terms drop to zero and rating is the only signal left standing. The
degenerate case is a consequence of the formula, not a separate code path, which
is also why it is covered by a test instead of a comment explaining it.

**A domain that stays out of the framework.** `ScoringService`, `StoriesService`
and `ProgressService` take plain data in their constructors and return plain
data. None of them import `@nestjs/testing`. The unit tests construct them with
`new`, feed in fixture data, and assert on return values, so they run in
milliseconds and do not need a DI container to prove the logic works. Only the
e2e tests spin up a real Nest application.

**Validation that rejects garbage instead of guessing.** A global
`ValidationPipe` with `whitelist` and `forbidNonWhitelisted` turns an unknown
query parameter or a body with a typo'd field into a 400, not a silently ignored
value. `RecordProgressDto` and `ListStoriesQueryDto` are the actual contract, not
documentation that can drift from it.

**Read-side and write-side kept honest about what they store.** A story's list
view returns a `chapterCount`, not the chapter bodies. A chapter's own endpoint
returns the text. Progress is recorded as "reader X reached chapter Y in story
Z"; whether that counts as finished is derived from the story's own chapter
order, not a second field a caller could set inconsistently.

## Architecture

```
src/
  seed/                static in-memory story data, one module, no logic
  stories/
    entities/          Swagger response shapes (StorySummary, StoryDetail, Chapter)
    interfaces/         internal StoryRecord/ChapterRecord shape used everywhere else
    dto/                ListStoriesQueryDto
    story.mapper.ts     pure functions: StoryRecord -> API response shape
    stories.service.ts  lookup, filter, 404s
    stories.controller.ts
  progress/
    progress.service.ts in-memory store keyed by readerId, then storyId
    progress.controller.ts
  recommendations/
    scoring.service.ts        the formula, framework-free
    recommendations.controller.ts
  app.module.ts, main.ts       wiring, global ValidationPipe, Swagger setup
test/                          e2e specs against a real Nest app + supertest
```

`StoriesModule` exports `StoriesService`. `ProgressModule` imports it to
validate that a `storyId`/`chapterId` pair is real before recording progress.
`RecommendationsModule` imports both, so `ScoringService` never has to know
where stories or progress come from, only what to do with them.

## The scoring formula

For a reader and a candidate story that reader has not finished:

```
total = (genreMatch ? 2 : 0) + tagOverlapCount * 1 + rating
```

- **Reader profile.** Every story the reader has any progress on (started,
  not necessarily finished) contributes its genre and its tags to a profile:
  a set of genres and a set of tags.
- **genreMatch** is `true` if the candidate's genre is in that set. Worth 2
  points, flat, regardless of how many read stories share that genre.
- **tagOverlapCount** is how many of the candidate's own tags appear in the
  reader's tag set. Worth 1 point per shared tag, no cap.
- **rating** is the candidate's own 0-5 rating, added as-is. A story with no
  overlap at all can still surface on the strength of being well rated.

Stories are sorted by `total` descending. Ties break on the candidate's rating,
then alphabetically on title, so the order is fully deterministic and two
requests for the same reader always come back the same way.

**Cold start.** A reader with no progress has an empty profile, so `genreMatch`
is always `false` and `tagOverlapCount` is always `0` for every candidate. The
formula collapses to `total = rating`, i.e. a top-rated list. Nothing in the
code checks for this case directly; it falls out of the math.

**What this formula gets wrong, on purpose left unfixed for a demo:**

- A story only has to share the genre or a tag, not be similar in tone, length
  or age rating. Two romances with one overlapping tag and nothing else in
  common score identically to two that are near-duplicates in theme.
- A story the reader is *mid-way through but has not finished* is still a
  legal candidate, and it will usually score at or near the top of its own
  recommendation list, because it trivially matches its own genre and every
  one of its own tags. That reads as "continue reading" more than "discover
  something new"; a real product would split those into two feeds. This demo
  does not.
- Weights (2 for genre, 1 per tag, rating added at face value) are picked to be
  legible in an interview, not tuned against any data. There is no A/B test
  behind the "2".
- This is a deterministic, hand-written scoring function, not a machine
  learning model. There is no training step and nothing here should be
  described as AI-generated recommendations.

## Endpoints

Default port is 3000; set `PORT` to override.

**List stories, optionally filtered**
```bash
curl "http://localhost:3000/stories"
curl "http://localhost:3000/stories?genre=Fantasy"
curl "http://localhost:3000/stories?tag=slow-burn"
```

**One story, with its table of contents**
```bash
curl "http://localhost:3000/stories/ember-crown"
```

**One chapter's full text**
```bash
curl "http://localhost:3000/stories/ember-crown/chapters/c2"
```

**Record a reader's progress** (no auth: `readerId` is just a path segment you
choose, there is no login and nothing stops one reader from posting as another)
```bash
curl -X POST "http://localhost:3000/readers/alex/progress" \
  -H "Content-Type: application/json" \
  -d '{"storyId": "ember-crown", "chapterId": "c2"}'
```

**Read a reader's progress back**
```bash
curl "http://localhost:3000/readers/alex/progress"
```

**Get that reader's recommended feed**
```bash
curl "http://localhost:3000/readers/alex/recommended"
curl "http://localhost:3000/readers/alex/recommended?limit=3"
```

Full interactive docs, generated from the same DTOs, at
[http://localhost:3000/docs](http://localhost:3000/docs).

## Tests

```bash
npm test
npm run test:e2e
```

42 tests: 22 unit tests (`ScoringService` including the cold-start case and two
tie-breaking cases, `StoriesService` filtering and 404s, `ProgressService`
including the finished/unfinished boundary and the bad-chapter-id case) and 20
end-to-end tests against a real Nest application with supertest, covering the
main flow through every endpoint plus validation and 404 handling.

TypeScript runs in strict mode with no `any` in application code.

## License

MIT
