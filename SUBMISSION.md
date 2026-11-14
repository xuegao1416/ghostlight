# Submission copy

Paste-ready text for the Devpost form. Everything here is either verified in this
repository or explicitly marked as unverified — do not upgrade a claim on the way into
the form.

---

## Title

GHOSTLIGHT — a theatre for the dead

## Tagline (one line, ~140 chars)

The stage is part of the story's data model. Same seventeen-beat play, two costumes, one
cue protocol.

## Category

Costume Contest

## URLs

| Field | Value |
| --- | --- |
| Live app | https://xuegao1416.github.io/ghostlight/ |
| Source | https://github.com/xuegao1416/ghostlight |
| Video | https://xuegao1416.github.io/ghostlight/ghostlight-demo.mp4 (2:51, public, no sign-in) |
| Built with | Kiro · React 19 · TypeScript 5.9 · Vite 6 · Bun · no CSS framework, no animation library |

## Short description (~200 words)

A ghost light is the single bulb left burning on a dark stage so the dead can keep
performing. This one has been on for ninety-four years.

GHOSTLIGHT is an interactive haunting where the room is not decoration around the story —
it is the story's output. Every beat carries a `StageCue`:

```ts
{ mood, intensity, fog, audience, focus, tremble }
```

The beat cannot say `className="scary"`. It says `audience: 1`. A single hook eases that
cue into CSS custom properties on the stage root, and every visual — the arch, the fog, the
swing of the bulb, and the pairs of eyes low in the dark (the script counts a hundred and
forty heads; the DOM spends five gradient fields to imply them) — derives from those
numbers. Press <kbd>C</kbd> and a console reads the same values back **out of the DOM**, not
out of React. Because there is exactly one writer and it eases rather than snaps, the console
cannot lie: when the room stops moving, the numbers stop moving.

The Costume Contest entry is the point of the architecture, not a skin. The same seventeen
beats are performed twice — a candle-lit Victorian séance, then a found-footage camcorder
tape in the same building. Identical beat graph, identical three endings, completely
different register. `bun run parity` fails the build if the two ever drift apart.

## The Kiro part (~150 words)

`.kiro/` is the engineering memory, not a submission tax.

- **Steering** — four files that load before every prompt. `tech.md` forbids CSS frameworks,
  animation libraries, runtime network calls and `any`. `cue-contract.md` explains the
  five-hop pipeline, the three load-bearing properties, and the specific temptation to
  bypass it (a conditional class for a nicer shot, which would make the console a liar).
- **Hooks** — five. Typecheck on save, parity on scene save, an agent hook that reviews a
  saved stage file against the cue contract, session orientation, and a ship gate on
  `AgentStop` that runs the gates before any claim of completion.
- **Spec** — `requirements.md` (nine EARS requirements), `design.md` (the three rejected
  designs and why each would have broken the console's honesty), `tasks.md`.

The hook config is a declaration, not a promise, so `scripts/hooks-selftest.ts` executes
every command hook verbatim and runs every matcher against real paths. It failed on the
first run: two matchers were written `src/scene/…`, which never matches the `src\scene\…` a
Windows checkout hands over — both gates would have stayed green while never firing. Fixed,
re-run, 7/7 fixtures agree. This is documented in the README rather than quietly repaired.

## What to try in 60 seconds

1. Open the live URL. Let the first beat type itself out — the light lags slightly behind
   the text on purpose.
2. Press <kbd>C</kbd>. Watch `INTENSITY` / `FOG` / `AUDIENCE` move as you advance.
3. Press <kbd>Enter</kbd> until the audience appears. `AUDIENCE` climbs to `1.00` at the
   moment one hundred and forty heads turn.
4. Finish, then press **CHANGE COSTUME**. Same play, same choices, different room.
5. `bun run parity` for the proof that the two costumes cannot drift apart.

## Honest gaps

Listed here so they are not discovered by a judge instead:

1. **The agent hook has never run in a live Kiro session.** This machine has no Kiro
   install. `hooks-selftest.ts` validates its shape and then states, in its own output, that
   it cannot execute it. The four `command` hooks are executed, with exit codes as evidence.
2. **The video is machine-recorded, not hand-recorded.** `scripts/film.ts` drives the deployed
   app in a headless Edge over CDP `Page.startScreencast` and assembles the frames with
   ffmpeg, so every frame is a pixel the app actually painted and every key it presses is a
   key a presenter would press. What it cannot do is show the presenter's own screen; if you
   want to check the film against the live app, the last card names both URLs.
3. **No audio.** Deliberate — the piece is text and light; a sound cue would be one more
   thing that can lie about what the stage is doing.
4. **Two acts, three endings.** The beat graph is closed. It is a finished short piece, not
   a platform with generated content, and it does not pretend otherwise.