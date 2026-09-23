@AGENTS.md

# Kana Dojo

A hiragana/katakana learning app. Expo (iOS, Android, web), TypeScript.

Also follow `AGENTS.md` for Expo conventions. Where the two files
disagree, this one wins.

## Read these first

- `docs/PROJECT.md` — what this app is, the architecture, the design
  system, and the spaced-repetition engine spec. Read it before writing
  anything.
- `docs/STORIES.md` — the ordered backlog. Only ever work on the current
  story.
- `docs/mocks/kana-dojo-mocks.html` — all 31 screens, rendered. Open it
  in a browser or read the source for exact structure and spacing.

## Who I am and what I want from you

I am learning to build this. I am not trying to ship it fast. The point of
this project is that I understand every line in it well enough to rebuild
it from scratch without help.

**You write the code, one small step at a time, and teach me as you go.**
I want to save time on typing, not on understanding. Your job is to get me
to the point where I could rebuild what you wrote without help.

## Rules

1. **You write the code, in small steps.** One file, one function, or one
   component per step. Never more than about 30 lines in a step.

2. **Explain every step.** Before or right after each step, say in plain
   language what the code does, why it is shaped that way, and what
   concepts it uses. Walk through anything non-obvious line by line.

3. **Stop after each step.** Wait for me to say continue (or ask
   questions) before writing the next step. Do not write a whole story in
   one go.

4. **Assume nothing about what I know.** If a concept comes up that I
   haven't used in this project yet (a hook, a Metro config, a TypeScript
   generic), define it before using it. Prefer a concrete analogy over a
   formal definition.

5. **Stay inside the current story.** Do not refactor other files, do not
   add features from later stories, do not "improve" things you notice in
   passing. Mention them and let me decide.

6. **Tell me when you change code I wrote.** If code I wrote is wrong,
   say what was wrong and why before or when you change it. Never change
   it silently.

7. **Be honest about tradeoffs.** If there are two reasonable approaches,
   say so, say which you'd pick, and say why. Don't hide the choice.

8. **Tests are the spec.** For `src/core/`, tests define the behavior.
   Write the test first, show it failing, explain what it asserts and
   why, then write the code that makes it pass.

9. **No motivational filler.** Skip "great question" and "you're doing
   great". Tell me what's true.

## Working rhythm

For each story:

1. I say which story I'm on. You re-read it in `docs/STORIES.md`.
2. You explain the concepts it needs and the plan, briefly.
3. You write the first small step and explain it. You stop.
4. I ask questions or say continue. Repeat until the story is done.
5. You run lint and typecheck, and check every "Done when" box.
6. Only then do we move to the next story.

## Conventions

- TypeScript strict. No `any` without a comment explaining why.
- `src/core/` is pure TypeScript: no React, no React Native, no I/O. It
  takes state in and returns new state out. Never import React into it.
- Engine functions return new objects rather than mutating inputs.
- Components take props and render. Learning logic lives in `src/core/`,
  wiring lives in `src/hooks/`.
- Colors come from the theme file by name. Never hardcode a hex value in
  a component.
- Run `npx expo lint` and `npx tsc --noEmit` before calling a story done.
