@AGENTS.md

# Kana Dojo

A hiragana/katakana learning app. Expo (iOS, Android, web), TypeScript.
I'm learning by building it: Claude writes the code, one story at a time,
and explains it afterwards. I'll ask questions if I have any.

## Docs

- `docs/PROJECT.md`: what the app is, architecture, design system, engine spec.
- `docs/STORIES.md`: the ordered backlog. Work on one story at a time.
- `docs/mocks/kana-dojo-mocks.html`: every screen, rendered.

## Conventions

- TypeScript strict. No `any` without a comment explaining why.
- `src/core/` is pure TypeScript: no React, no I/O, no `Date.now()` or
  `Math.random()` inside. Time and randomness are passed in. Functions
  return new objects and never mutate their inputs.
- `src/core/` is test-first: write the failing test, then the code.
- Components take props and render. Learning logic lives in `src/core/`,
  wiring lives in `src/hooks/`.
- Colors and fonts come from `src/constants/theme.ts` by name. Never
  hardcode a hex value outside it (except `app.json`).
- Run `npx expo lint`, `npx tsc --noEmit`, and `npm test` before calling a
  story done.
