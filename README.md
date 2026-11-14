# GHOSTLIGHT

**a theatre for the dead**

> A ghost light is the single bulb left burning on a dark stage. Superstition says it is
> there so the ghosts can keep performing after the audience has gone. This one has been
> on for ninety-four years.

GHOSTLIGHT is an interactive haunting. You sit in a theatre that should be empty, and a
play is performed at you. The story does not describe the room — the room *is* the story's
output.

**Kiroween 2026 — Costume Contest.**

**Live:** <https://xuegao1416.github.io/ghostlight/> — no install, no account, sound off is fine.
Add `?sheet=1` to open the cue sheet immediately.

**Demo film (2:51):** <https://xuegao1416.github.io/ghostlight/ghostlight-demo.mp4> — the
same URL as the app, so neither can drift from the other, and no sign-in to watch it.

---

## The argument

Most AI narrative demos work like this: the model returns prose, the front end renders
prose, and then some animations decorate the prose. The story and the visuals are two
systems that happen to share a screen.

GHOSTLIGHT inverts it. **The stage is part of the story's data model.** Every beat in the
script carries a `StageCue`:

```ts
interface StageCue {
  mood: 'hush' | 'ember' | 'dread' | 'rise' | 'blackout' | 'flicker'
  intensity: number   // 0..1 — how much light is in the house
  fog: number         // 0..1 — how much the air is hiding
  audience: number    // 0..1 — how many of them are in the seats
  focus: number       // -1..1 — where the light is pointed
  tremble: number     // 0..1 — whether the camera can hold still
}
```

The beat is not allowed to say `className="scary"`. It says *audience: 1*. Then something
in the dark turns to look at you.

That is the whole submission. Everything below is the engineering that makes it not a lie.

---

## Two costumes, one play

The category is Costume Contest, so the costume had better be load-bearing rather than a
colour scheme. GHOSTLIGHT ships the same seventeen-beat play in two completely different
stagings:

| | **Act I — The Séance** | **Act II — The Tape** |
| --- | --- | --- |
| Register | Candlelit Victorian theatre | Found-footage camcorder |
| Palette | Candle amber `#f0b96b` on near-black | Cold cyan `#6fd6cd` on blue-black |
| Prose | Cormorant Garamond, large, drop cap | Spectral, tighter, no drop cap |
| Surface | Film grain, no scanlines | Scanlines, V-SYNC roll, magenta bleed |
| Voice | "The house is watching." | "REC. 02:14 AM. The camera is on a tripod." |
| Endings | The House Is Full / House Dark / Interval | You Are the Tape / End of Tape / Please Rewind |

Same beat ids. Same edges. Same number of choices, pointing at the same beats. Same three
endings in the same structural positions. **Only the tokens change.**

This is not asserted in a blog post — it is enforced by a script that exits non-zero:

```
$ bun run parity
beats        seance=17  tape=17
reachable    seance=17  tape=17
endings      seance: end_dark → House Dark | end_leave → Interval | end_perform → The House Is Full
             tape:   end_dark → End of Tape | end_leave → Please Rewind | end_perform → You Are the Tape

OK — both costumes perform the identical beat graph (17 beats, 3 endings each).
```

The script also validates the cue contract: every meter inside 0..1, focus inside −1..1,
every mood one the palette knows, every `next` resolving to a real beat. A cue of
`intensity: 4` does not throw — it silently flattens a `radial-gradient` and the stage
quietly stops working. That class of bug is caught at build time, not on opening night.

The gate is proven capable of failing: set one intensity to `4` and it exits 1 with
`COSTUME DRIFT DETECTED`. (Recorded in `.kiro/specs/cue-engine/tasks.md` §6.4.)

---

## The cue engine

```
Beat.cue
   │  ambient blend — the light lags the words and catches up as they land
   ▼
useCueStage  — one rAF loop, one writer
   │  k = 1 − 0.0016^(dt/1000)      frame-rate independent, ~1s to settle
   │  dt clamped to 64 ms           a backgrounded tab cannot teleport the light
   ▼
.stage  inline style
   --cue-intensity  --cue-fog  --cue-audience  --cue-focus
   data-mood        data-tremble
   │
   ▼
CSS — every visual is a function of those properties
   │
   ▼
CueConsole — reads the same properties back out of the DOM
```

Three properties hold the design up:

**One writer.** Only `src/hooks/useCueStage.ts` writes `--cue-*`. Components read. If a
second writer appeared, whichever ran last would win each frame and the room would flicker
at 60 Hz. A Kiro hook reviews every save under `src/styles`, `src/components` and
`src/hooks` for exactly this.

**Ease, never cut.** `1 − 0.0016^(dt/1000)` reaches 99.8 % of the target after one second
of wall time regardless of refresh rate — a cue has a duration, not a frame count. Even
`blackout` eases to a non-zero floor, because a stage is never truly black; the ghost light
is always there.

**The console reads the DOM.** Not React props, not a store. `stage.style.getPropertyValue
('--cue-intensity')` — the same value the browser is mid-way through rendering. This
matters because the console is the evidence. If it read props it would show the *target*,
and a judge would be watching a simulation of a stage rather than a stage.

Open the drawer with the **CUE SHEET** button, press <kbd>C</kbd>, or link directly with
`?sheet=1`. You will see the raw cue as JSON on top and the eased live meters chasing it
below. That lag is real. It is one `requestAnimationFrame` loop, not a video.

---

## The dark parts

Drawing a crowd failed six times. Shoulders-and-heads produced beads; overlapping circles
produced grapes; a continuous `clip-path` silhouette produced a decorative sawtooth; adding
a rim light produced a dome *with an outline*, which is even more obviously an object. The
lesson is uncomfortable and now written into `.kiro/specs/cue-engine/design.md`: **in a
dark room, drawing a solid thing means drawing its edge, and an edge gives you away.**

The seventh attempt stopped drawing people. It draws the only thing a crowd does that a
room full of furniture does not: it *watches you*. Twelve rows of paired points of light,
staggered by depth, dimming with distance, generated from a deterministic hash and blinking
out of phase so they never blink together. Nothing is drawn. Something is looking.

It is also cheaper — a dozen gradient fields instead of eighty DOM nodes.

---

## How Kiro was used

Kiro was the environment this was designed in, and the `.kiro/` directory is not decoration
— it is the project's engineering memory. Every file below changed how the code got written.

### Steering — the rules that load before every prompt

| File | What it prevents |
| --- | --- |
| `.kiro/steering/product.md` | Drift toward "scary-themed UI". Five principles, including *dark is the default, light is an event* and *the machine is visible only when asked*. |
| `.kiro/steering/tech.md` | Dependency creep. No CSS framework, no animation library, no runtime network, no `any`. Production dependencies are `react` and `react-dom` and nothing else. |
| `.kiro/steering/structure.md` | Five invariants — `types.ts` is the only definition of the cue shape; the two scenes must be structurally identical; the stage reads custom properties and never props; costume is a token swap not a branch; components hold no stage state. |
| `.kiro/steering/cue-contract.md` | The one that matters. Explains the five-hop pipeline, why each hop exists, and the specific temptation to bypass it — adding a conditional class for a nicer shot, which would make the console a liar. |

### Hooks — the checks that fire without being asked

`.kiro/hooks/stage-integrity.json` defines five:

1. **typecheck on source save** — `tsc --noEmit` on every `.ts`/`.tsx` save. Strict mode
   with `noUnusedLocals` means a single stray import fails the build, so the gap between
   "it compiles" and "it doesn't" must be zero.
2. **costume parity on scene save** — `parity.ts` the moment a scene file changes. The
   project's central claim is defended before the change can be believed, not at the end of
   the session.
3. **stage contract review on source save** — an agent hook that asks four questions about
   the saved file: does it write a `--cue-*`; does any visual depend on a beat id; is there
   a second source of truth; are ranges still in contract. It is instructed to report
   violations and stop, not to refactor.
4. **session orientation** — on `SessionStart`, echoes what the project is, the four gates,
   and the one rule that must never be broken.
5. **ship gate on agent stop** — typecheck, parity and build before any claim of
   completion. A drifted costume must be reported, not announced as done.

A hook configuration is a declaration, not a promise. A hook that never fires looks
exactly like a hook that passes, which is the most expensive kind of silence. So
`scripts/hooks-selftest.ts` makes the declaration falsifiable on two axes: every `command`
hook is executed verbatim with its own timeout, and every `matcher` is compiled and run
against real repository paths in both separator styles.

It earned its keep immediately. The first run failed:

```
FAIL costume parity on scene save...... 2/7 fixtures disagree
     expected match for "src\scene\tape.ts" — got the opposite
FAIL stage contract review on source save 2/7 fixtures disagree
     expected match for "src\styles\stage.css" — got the opposite
```

Both matchers had been written `src/scene/…`. That matches on the machine the config was
typed on and never matches the `src\scene\…` a Windows checkout hands over — so the parity
gate and the contract review would have stayed green while never once firing. Fixed to
`src[\\/]scene[\\/]…`, re-run, 7/7 fixtures agree. The self-test now runs as part of
`bun run verify`, ahead of the build.

One honest gap: the `agent` hook (`stage contract review`) has never run inside a live Kiro
session. The self-test validates its shape and then prints, rather than hides, that it
cannot execute it. The four `command` hooks have no such gap — they are run, and their exit
codes are the evidence.

### Spec — the reasoning, written down

`.kiro/specs/cue-engine/` is a full three-piece spec: `requirements.md` (nine EARS
requirements, ~45 acceptance criteria), `design.md` (the three rejected designs and why,
the easing maths, the failure-mode-to-guard table, the audience post-mortem) and `tasks.md`
(nine work sections, each ordered so the next is verifiable).

`design.md` is the document a judge should read if they only read one thing. It contains
the rejected alternatives — cue-as-props, cue-as-context, cue-via-animation-library — and
the specific reason each one would have broken the console's honesty.

---

## Run it

Live: <https://xuegao1416.github.io/ghostlight/>

```bash
bun install
bun run dev          # http://127.0.0.1:5199
```

```bash
bun run verify       # typecheck + parity + hooks + build — all four must pass
```

| Command | What it proves |
| --- | --- |
| `bun run typecheck` | The cue shape cannot be constructed wrong anywhere in the app. |
| `bun run parity` | Both costumes perform the identical play, and every cue is inside the contract. |
| `bun run hooks` | The Kiro hooks actually fire and actually pass — commands executed, matchers run against real paths. |
| `bun run rehearse` | The demo video's key sequence still lands on the card it promises, and every number its captions speak is still the cue's number. |
| `bun run build` | Ships as a static folder. No env vars, no server, no runtime calls. |
| `bun run film` | Re-shoots the demo film from the deployed app. Not part of `verify` — it needs a headless browser, ffmpeg and twelve minutes. |

`bun run rehearse` exists because the demo is one take. `DEMO.md` tells a presenter to press a
specific sequence of keys and stay on specific frames for specific numbers; that is a claim
about the beat graph, and re-routing one choice would silently make the recording end on the
wrong card. The rehearsal replays both takes against the real scene data and asserts the
quoted cues. It is falsifiable the same way `parity` is: change `end_perform`'s audience from
`1` to `0.9` and it exits 1 with `FAIL end_perform cue audience is 1 (got 0.9)`; record the
tape's last key as `3` instead of `2` and it exits 1 with
`FAIL tape lands on end_dark (got end_leave)`.

Build output — 80 kB gzipped of JavaScript for the whole theatre (hashes are content hashes,
so they change with the source; sizes are the stable part):

```
dist/index.html                   1.07 kB │ gzip:  0.56 kB
dist/assets/index-BoGCFUsT.css   23.37 kB │ gzip:  5.55 kB
dist/assets/index-FVMJH5W8.js   252.85 kB │ gzip: 80.01 kB
```

### Controls

| | |
| --- | --- |
| <kbd>1</kbd>–<kbd>4</kbd> | Choose |
| <kbd>Space</kbd> / <kbd>Enter</kbd> | Continue |
| <kbd>Esc</kbd> | Step back |
| <kbd>C</kbd> | Cue sheet |
| Click the prose | Skip the reveal |

### Accessibility

`prefers-reduced-motion` skips the typewriter and disables the shiver. All prose is real
text. Every control is a real `<button>` with a visible focus ring. Decorative stage layers
are `aria-hidden`. On narrow viewports the keyboard chords are replaced by a tap hint, and
the wardrobe moves below the bill rather than guessing where the prose ends.

---

## Structure

```
.kiro/
  steering/          product · tech · structure · cue-contract
  hooks/             stage-integrity.json (5 hooks)
  specs/cue-engine/  requirements · design · tasks
scripts/parity.ts    costume parity + cue contract gate
scripts/rehearse.ts  the demo's key sequence, replayed against the real graph
scripts/film.ts      shoots the demo film: headless Edge over CDP, assembled with ffmpeg
src/
  stage/types.ts     StageCue, Beat, Scene — the only definition
  scene/             seance.ts · tape.ts — the same play, twice
  hooks/             useCueStage (the writer) · useTypewriter
  components/        Prose · Audience · Dust · CueConsole
  styles/            tokens (the costumes) · stage · prose · chrome · base
__lab/mobile.html    three iframes at real narrow viewports
```

---

## What it does not do

No audio — the silence is doing work. No accounts, no saved progress — the Orpheum forgets
you when you close it. No runtime prose generation — the beats are authored; what reacts is
the stage. No server.

---

*Kiroween 2026 · Costume Contest · built with Kiro*
