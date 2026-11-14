# Design — the cue engine

## Overview

The cue engine is the three-hop path from an authored beat to a lit room:

```
Beat.cue  →  (ambient blend)  →  useCueStage  →  CSS custom properties  →  every visual
```

Everything in this document exists to keep that path single-file and single-writer. The
design constraint that shapes all others: **the console must be able to prove the path is
real**, which means the values the console displays must be the values the browser is
using, which means they must live in the DOM and not in React.

## Why not the obvious design

Four designs were considered. Three were rejected.

**A. Cue as props to components.** `<Audience visible={beat.cue.audience} />`,
`<House light={beat.cue.intensity} />`. Rejected: every component becomes a branch, every
new meter touches every component, and there is no single place to read "what is the room
doing right now".

**B. Cue as React context.** One provider, components subscribe. Better than A, but the
provider's value is React state, so the console would display React state, not the
browser's. The console would then be a second source of truth — exactly the failure this
project is arguing against.

**C. An animation library (Framer Motion, GSAP).** The library owns the animated value.
The console can only read what the library exposes. Also: these libraries animate React
props or DOM nodes they control; here the target is six CSS custom properties on one node,
which `requestAnimationFrame` writes in ~30 lines with no reconciliation.

**D. Chosen: CSS custom properties on one node, written by one rAF loop.** The story's
cue is eased into `--cue-*` custom properties on `.stage`. Every visual is expressed in CSS
as a function of those properties. The console reads the same properties off the same node.
There is one writer, one reader surface, one source of truth — and the source of truth is
the live DOM, which is what actually renders.

## The ambient blend

Between `Beat.cue` and `useCueStage` sits one transform in `App.tsx`:

```ts
const k = 0.62 + reveal * 0.38;
const ambient = { ...beat.cue, intensity: beat.cue.intensity * k, fog: beat.cue.fog * (0.8 + reveal * 0.2) };
```

`reveal` is 0..1, emitted by the typewriter at ~24 buckets per beat. This makes the light
lag the words: at the start of a beat the house is at 62 % of the target and it climbs as
the prose lands. Without it, the room changes *before* the sentence that justifies the
change, and the causality reads backwards. This is a small effect and it is the difference
between "the page changed" and "the room responded".

`reveal` is quantised inside `useTypewriter` (24 buckets) rather than emitted per frame.
Per-frame emission re-rendered the entire tree 60 times a second; the light looked the
same. This is the one place where a visual effect was traded for frame budget, and it is
invisible.

## useCueStage

```ts
const ref = useRef<HTMLDivElement>(null);
const current = useRef<StageCue>({ ...target });
const goal = useRef<StageCue>(target);
goal.current = target;                       // updated every render, no effect needed
useEffect(() => { /* one rAF loop, empty deps */ }, []);
```

Every frame:

```
dt = min(64, now − last)
k  = 1 − 0.0016^(dt/1000)
c.x += (g.x − c.x) * k          for intensity, fog, audience, focus
c.tremble += (g.tremble − c.tremble) * k * 1.6   ← tremble snaps in faster
el.style.setProperty('--cue-intensity', c.intensity.toFixed(4))   … etc
el.dataset.mood    = g.mood                                ← mood cuts, never eases
el.dataset.tremble = c.tremble > 0.42 ? 'high' : c.tremble > 0.12 ? 'mid' : c.tremble > 0.01 ? 'low' : 'none'
```

Three decisions worth defending:

- **`1 − 0.0016^(dt/1000)`.** A linear lerp with a fixed per-frame coefficient runs at
  half speed on a 30 Hz display and doubles on a 120 Hz one. This form reaches 99.84 % of
  the target after one second *of wall time* regardless of how many frames happened. In
  theatre terms: a cue has a duration, not a frame count.
- **`dt` clamped to 64 ms.** A backgrounded tab returns with a multi-second `dt`; without
  the clamp the first frame back would jump the light from black to full, which is
  precisely the cut this design exists to avoid.
- **`mood` is written from the goal, not the eased value.** Mood selects discrete CSS
  behaviour (scanline roll speed, drop-cap presence). Easing a categorical value is
  meaningless, and a mood that arrives mid-fade would tear.

`tremble` eases at `k × 1.6` because a camera that takes a full second to start shaking
reads as an animation; a camera that is already shaking when you notice reads as a camera.

## The stage's visual grammar

Every visual in `stage.css` is a pure function of `--cue-*`. The important ones:

| Construct | Derivation |
| --- | --- |
| Key light pool | `radial-gradient` centred at `calc(50% + var(--cue-focus) * 30%)`, radius `calc(var(--cue-intensity) * 62%)` |
| Haze | three drifting layers, each `opacity: calc(var(--cue-fog) * …)` |
| Audience | twelve gradient fields, `opacity: calc(var(--cue-audience) * 0.98)`, core layer blinking out of phase |
| Ghost light bulb | `box-shadow` spread scaled by `--cue-intensity`; never goes fully dark |
| Shiver | `.stage[data-tremble='high'] { animation: shiver 0.9s steps(5, end) infinite }` |

The audience deserves a note, because six earlier attempts failed. Drawing people —
shoulders, heads, a continuous silhouette — always produced a *closed outline*, and a
closed outline reads as an object: beads, a chessboard, grapes, a dome. The available
vertical space (about 12 % of the viewport below the prose) cannot render a body anyway.

The successful design draws the only thing a crowd does that a room full of furniture does
not: it *watches you*. Twelve rows' worth of paired points of light, offset by depth,
dimming with distance, blinking out of sync — generated from a deterministic hash so the
geometry never changes between renders. Nothing is drawn. Something is looking. This is
both cheaper (a dozen gradient layers instead of ~80 DOM nodes) and dramatically more
effective.

## The console

`CueConsole` is a ~15 fps loop that does:

```ts
const v = Number(stage.style.getPropertyValue('--cue-intensity'));
bar.style.transform = `scaleX(${v})`;
num.textContent = v.toFixed(2);
```

Reading `element.style.getPropertyValue` reads the inline declaration, not the computed
style — no style recalc, no layout. 15 fps because a number that updates 60 times a second
is unreadable, and because this loop must not compete with the stage loop.

The panel additionally shows the raw `JSON.stringify(beat.cue)` — the *target* — next to
the eased live values. A judge watching a beat land sees the target jump and the meters
chase it. That is the whole argument of the piece, made visible in about 40 lines.

When opened, the prose shifts left and narrows so the drawer does not cover it:

```css
.stage[data-sheet='true'] .script {
  left: calc(50% - min(170px, 43vw));
  width: min(88vw, 700px, calc(100vw - min(340px, 86vw) - 72px));
}
```

On narrow viewports the drawer becomes a bottom sheet and the prose fades out entirely
rather than sitting at 18 % opacity behind it — a partially-visible paragraph behind a
translucent panel reads as a rendering bug, not as restraint.

## Failure modes and their guards

| Failure | Why it is dangerous | Guard |
| --- | --- | --- |
| Cue meter out of range | Gradient goes flat, silently. No exception, no console error. | `scripts/parity.ts` range check |
| Two writers to `--cue-*` | Whichever runs last wins per frame; result flickers at 60 Hz | Only `useCueStage` writes; enforced by the agent hook |
| Console reads props | Console and stage can disagree; the proof becomes theatre | Console reads the DOM by construction |
| Costumes drift | The central claim becomes a lie in exactly the way a judge would check | `parity.ts` graph comparison |
| `dt` spike after tab switch | Light teleports; the fade premise breaks | `min(64, dt)` |
| Per-frame `reveal` emission | Full-tree re-render at 60 fps | 24-bucket quantisation in `useTypewriter` |
| Focus stolen by a clicked control | Enter both activates the button and advances the story | Focus guard in the key handler + `blur()` on pointer activation only |

## Verification

| Claim | Check |
| --- | --- |
| Types are sound | `bun run typecheck` |
| Beat graphs identical, cues in range | `bun run parity` |
| Static build succeeds | `bun run build` |
| The stage is driven, not painted | Open `?sheet=1` and watch the meters chase the raw cue |
| Both costumes restage the play | Switch wardrobe mid-run; the graph is unchanged |
| Narrow viewports are usable | `__lab/mobile.html` (three iframes, real viewport media queries) |