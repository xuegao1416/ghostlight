---
inclusion: always
---

# The cue contract

This is the one invariant everything else in GHOSTLIGHT serves. If a change violates it,
the change is wrong — regardless of how good it looks.

## The claim

Most "immersive AI story" demos return prose and then *decorate* it. The picture is
chosen by the frontend from a mood label, or worse, hard-coded per scene. The story and
the visuals are two systems that happen to be on screen together.

GHOSTLIGHT inverts that. **The story's data model contains the stage.**

```ts
// src/stage/types.ts
export interface StageCue {
  mood: Mood;        // a lighting state, not an emotion
  intensity: number; // 0..1  key light
  fog: number;       // 0..1  haze density
  audience: number;  // 0..1  how much of the house is present
  tremble: number;   // 0..1  camera shake (0.42+ = high)
  focus: number;     // −1..1 pan the key light left/right
}

export interface Beat {
  id: string;
  direction: string;   // stage direction, set in mono caps
  text: string;        // the prose
  cue: StageCue;       // ← the beat hands the stage a cue
  choices?: Choice[];
  next?: string;
  ending?: Ending;
}
```

There is no `mood` string on the scene, no `theme` prop on a component, no CSS class
derived from the beat id. The only thing a beat can say to the stage is a `StageCue`.

## The pipeline

```
Beat.cue                       (authored, per beat, in both scene files)
   ↓  App.tsx: intensity × (0.62 + reveal × 0.38)      ← the light lags the words
ambient: StageCue
   ↓  useCueStage: rAF, k = 1 − 0.0016^(dt/1000)       ← framerate-independent easing
.stage inline style:
   --cue-intensity / --cue-fog / --cue-audience / --cue-focus
   data-mood / data-tremble
   ↓  CSS
radial-gradient(house)      fog layers      audience opacity      shiver animation
   ↓  CueConsole
same custom properties, read back out of the DOM at 15 fps
```

Three properties of this pipeline are load-bearing:

### 1. One writer

`useCueStage` is the only code that writes `--cue-*`. Components read. If a component
needs a new visual dimension, it gets a new meter in `StageCue` — it does not get a prop.
This is why `Audience`'s visibility is `opacity: calc(var(--cue-audience) * 0.98)` and
not `visible={beat.id === 'b08'}`.

### 2. Easing, not switching

`k = 1 − Math.pow(0.0016, dt / 1000)` reaches ~99.8 % of the target in one second
regardless of frame timing. Lights do not cut in a theatre; a cue is a *fade* with a
duration, and the easing constant is that duration. `blackout` is the exception the
fiction demands — it still fades, but to 0.02, because a stage is never truly black.

### 3. The console reads the DOM, not the props

`CueConsole` could have rendered `cue.intensity` from React. It deliberately does not:
it does `stage.style.getPropertyValue('--cue-intensity')` every ~66 ms. That means the
number on screen is the number the *browser* is using. If the easing stalls, the console
stalls. If someone rewires the pipeline incorrectly, the console shows the truth and the
lie is visible.

## Rules that follow

- **Never read a cue in a component to decide a layout.** Layout is fixed; only light,
  haze, presence, shake and focus move.
- **Never derive a visual from `beat.id`.** If beat `b08` needs the audience, it needs it
  because its cue says `audience: 1` — not because it is beat eight.
- **Never add a second data source for the same value.** `CueConsole` and the stage both
  read the same custom property. Two sources would drift, and the drift would be invisible
  until a judge noticed the numbers disagreeing with the room.
- **Ranges are enforced, not assumed.** `scripts/parity.ts` rejects any cue with a meter
  outside 0..1, a focus outside −1..1, or a mood the palette does not know. An out-of-range
  value would not throw at runtime — it would silently flatten a gradient — which is
  exactly the failure mode this project cannot afford.

## What "costume" means here, precisely

`Costume` is `'seance' | 'vhs'`. It is not passed to any component as a visual hint. It
selects a token block:

```css
[data-costume='seance'] { --accent: #f0b96b; --font-prose: 'Cormorant Garamond'; --scanline-opacity: 0; … }
[data-costume='vhs']    { --accent: #6fd6cd; --font-prose: 'Spectral';          --scanline-opacity: 0.14; … }
```

The *same* `StageCue` values drive both. That is the technical meaning of "the same play
wearing two dresses": the cue protocol is the play, the token block is the dress. A
costume that required different cue values to look right would be a different play.

`scripts/parity.ts` asserts the beat graph is identical across costumes. It cannot assert
the aesthetic, but it can assert that the aesthetic is not compensating for a different
story.

## The temptation to avoid

When something looks wrong, the fastest fix is always to bypass the pipeline: add a
conditional class, hard-code an opacity for one beat, special-case `b08`. Every one of
those fixes makes the console a liar. The console is the proof; a proof that has been
patched for the camera is not a proof.

If a beat does not look right, fix the cue. If the cue cannot express what the beat needs,
add a meter to `StageCue` and wire it through all five files listed in
`#[[file:.kiro/steering/structure.md]]`. That is slower, and it is the whole point.

## Related steering

- `#[[file:.kiro/steering/structure.md]]` — where each stage of the pipeline lives.
- `#[[file:.kiro/steering/tech.md]]` — why there is no animation library.