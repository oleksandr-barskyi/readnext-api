# Session state

2026-09-22. Standalone NestJS API demo: stories and chapters, reader progress,
and a rules-based recommendation feed. Sibling to `tickstream` and `quakefeed`.

## Сделано

- Scaffolded the NestJS project by hand (no `nest new`, no interactive CLI).
- `StoriesModule`, `ProgressModule`, `RecommendationsModule` wired end to end.
- In-memory seed: 10 stories, 2-4 chapters each, across Fantasy, Romance,
  Sci-Fi, Thriller, Horror, YA and Drama, so the recommendation feed has
  enough genre and tag variety to actually rank something.
- `ScoringService`: deterministic rules-based formula, documented in the
  README, no ML or AI framing anywhere in code or docs.
- Global `ValidationPipe` (whitelist, forbidNonWhitelisted, transform).
- Swagger at `/docs`, DTOs annotated with `@ApiProperty`.
- 42 tests: 22 unit (`src/**/*.spec.ts`), 20 e2e (`test/*.e2e-spec.ts`), all
  passing. `tsc --noEmit` clean, strict mode, no `any` anywhere.
- README in the same style as the sibling repos: pitch, quickstart,
  architecture, scoring formula in plain language, curl examples, tests,
  license.

## Решения и compromises, стоит знать

- Pinned NestJS to `^11.2.x`, not the newly-released `^12.x`: Nest 12's
  `@nestjs/common` ships `"type": "module"` (ESM-only), which breaks the
  standard `ts-jest`/CommonJS toolchain outright (`Must use import to load ES
  Module`). Nest 11 is the latest line that still works with the conventional
  Jest setup used here. Documented as a version choice, not hidden.
- `overrides.multer` pinned to `^2.3.0` (npm's `overrides` field needed an
  `npm update multer` to actually take effect on npm 8.5.5 — plain
  `npm install` alone did not apply it) to clear a transitive high-severity
  advisory in `@nestjs/platform-express`'s unused file-upload dependency.
  `npm audit` is clean.
- `npm run build` uses `tsc -p tsconfig.build.json` directly, not `nest
  build`. `nest build` (and `nest start`) silently deleted `dist/` and exited
  0 with zero output in this environment (Windows + Git Bash + Node 22.19,
  reproduced 3x, including invoking the CLI's bin script directly) — never
  actually re-emitted anything. Raw `tsc` was verified reliable, so the
  scripts use it directly instead of chasing the CLI wrapper bug.
- `npm run start` uses `ts-node src/main.ts` (no separate build step) — also
  verified working end to end, including `/docs`.
- One documented, deliberate weakness in the scoring formula: a story a
  reader is mid-way through (started, not finished) is still a legal
  recommendation candidate and typically ranks itself near the top, since it
  trivially matches its own genre and tags. Noted in the README as a known
  simplification, not silently swept under the rug.

## Следующий шаг

Nothing in flight.

## Проверить

```bash
npm install
npm test           # 22 unit tests
npm run test:e2e   # 20 e2e tests
npm run build      # tsc -p tsconfig.build.json -> dist/
npm run start      # ts-node, http://localhost:3000/docs
```
