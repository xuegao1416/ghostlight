# Requirements — the cue engine

## Introduction

GHOSTLIGHT performs an authored script on a stage rendered entirely by CSS custom
properties. This spec covers the layer between the two: how a beat's `StageCue` becomes
the room the player is sitting in, and what must remain true no matter which costume is
wearing the play.

The intent is not "add animations". The intent is that **the story's data model contains
the stage**, so that a choice made in prose is visible in the light, the haze, the number
of people watching, and the steadiness of the camera — with no component deciding any of
it by inspecting the story.

These requirements are written in EARS form so they can be verified mechanically.

## Glossary

| Term | Meaning |
| --- | --- |
| **Beat** | One unit of script: a stage direction, prose, a cue, and either choices or a next beat. |
| **Cue** | A `StageCue`: six numbers and one mood name. The only thing a beat may say to the stage. |
| **Costume** | A token block (`seance` \| `vhs`) selecting palette, fonts and grain. Not a component branch. |
| **Stage** | The single `.stage` DOM node that carries all `--cue-*` custom properties. |
| **Console** | The cue sheet drawer that reads those custom properties back out of the DOM. |

## Requirements

### Requirement 1 — Cue authorship

**User story:** As the writer of a beat, I want to specify how the room responds to my
line, so that the light is part of the sentence rather than an effect applied afterwards.

#### Acceptance criteria

1. THE SYSTEM SHALL require every beat to declare a `cue`.
2. THE SYSTEM SHALL reject a beat whose cue meter (`intensity`, `fog`, `audience`,
   `tremble`) is outside the closed range 0..1.
3. THE SYSTEM SHALL reject a beat whose `focus` is outside the closed range −1..1.
4. THE SYSTEM SHALL reject a beat whose `mood` is not one of `hush`, `ember`, `dread`,
   `rise`, `blackout`, `flicker`.
5. THE SYSTEM SHALL reject a beat whose `next` or whose any `choice.next` names a beat
   that does not exist in the same scene.
6. THE SYSTEM SHALL reject a beat with an empty `direction` or an empty `text`.
7. WHERE a scene is the second or later costume, THE SYSTEM SHALL NOT require the cue
   *values* to match the first costume — only the graph.

### Requirement 2 — Single writer

**User story:** As a maintainer, I want exactly one place that writes the stage's visual
state, so that a debugging session has one suspect.

#### Acceptance criteria

1. THE SYSTEM SHALL write `--cue-intensity`, `--cue-fog`, `--cue-audience` and
   `--cue-focus` from exactly one module (`src/hooks/useCueStage.ts`).
2. THE SYSTEM SHALL set `data-mood` and `data-tremble` on the same `.stage` element from
   that module and no other.
3. WHEN a component needs a visual to change, THE SYSTEM SHALL derive it in CSS from a
   `--cue-*` custom property rather than accept it as a React prop.
4. THE SYSTEM SHALL NOT derive any visual from a beat id, scene id or costume name,
   except where the costume name selects a token block.

### Requirement 3 — Easing

**User story:** As a player, I want the room to change the way a lighting board changes —
a fade with a duration — so that the stage feels operated rather than switched.

#### Acceptance criteria

1. WHEN a cue changes, THE SYSTEM SHALL ease every meter toward its new value over
   approximately one second, independently of frame rate.
2. THE SYSTEM SHALL compute the easing factor as `1 − 0.0016^(dt/1000)` with `dt` clamped
   to 64 ms, so that a stalled tab cannot teleport the light.
3. WHILE the prose is revealing, THE SYSTEM SHALL hold the key light below its target and
   raise it as characters land, so the light lags the words and catches up.
4. WHEN the cue's mood is `blackout`, THE SYSTEM SHALL ease to a non-zero intensity,
   because a stage is never truly black.

### Requirement 4 — Tremble thresholds

**User story:** As the writer, I want to ask for "the camera cannot hold still" as one
number, so that I do not hand-tune animation durations per beat.

#### Acceptance criteria

1. WHEN eased `tremble` exceeds 0.42, THE SYSTEM SHALL set `data-tremble="high"`.
2. WHEN eased `tremble` is above 0.12 and at most 0.42, THE SYSTEM SHALL set
   `data-tremble="mid"`.
3. WHEN eased `tremble` is above 0.01 and at most 0.12, THE SYSTEM SHALL set
   `data-tremble="low"`.
4. WHEN eased `tremble` is at most 0.01, THE SYSTEM SHALL set `data-tremble="none"`.
5. WHILE `prefers-reduced-motion: reduce` is set, THE SYSTEM SHALL NOT animate the shiver.

### Requirement 5 — The console must not lie

**User story:** As a judge, I want to see the numbers the browser is actually using, so
that I can tell the difference between a stage that is driven and a stage that is painted.

#### Acceptance criteria

1. THE SYSTEM SHALL read the four `--cue-*` values from `stage.style.getPropertyValue`,
   not from React props.
2. THE SYSTEM SHALL display `data-mood` and `data-tremble` as read from the live element.
3. THE SYSTEM SHALL display the beat's raw cue as JSON alongside the eased live values, so
   that the target and the current state are both visible.
4. THE SYSTEM SHALL NOT introduce a second data source for any displayed value.
5. WHEN the drawer is closed, THE SYSTEM SHALL stop its animation frame.
6. THE SYSTEM SHALL open the drawer from the URL when `?sheet=1` is present.

### Requirement 6 — Costume parity

**User story:** As a judge in the Costume Contest category, I want proof that the second
costume is a restaging rather than a recolour.

#### Acceptance criteria

1. THE SYSTEM SHALL expose the identical set of beat ids in every costume.
2. THE SYSTEM SHALL expose the identical `next` edge for every beat id in every costume.
3. THE SYSTEM SHALL expose the identical ordered list of `choice.next` for every beat id
   in every costume.
4. THE SYSTEM SHALL expose the same number of endings in every costume.
5. WHEN any of criteria 1–4 fails, THE SYSTEM SHALL exit non-zero from
   `scripts/parity.ts` with a report naming the drifted beat.
6. THE SYSTEM SHALL run that check on every save of a scene file and before any
   declaration of completion.

### Requirement 7 — Costume is a token swap

**User story:** As a maintainer adding a third costume, I want to add one scene file and
one token block, so that I do not have to touch components.

#### Acceptance criteria

1. THE SYSTEM SHALL select palette, prose font, mono font, prose size, prose leading,
   grain opacity and scanline opacity exclusively through `[data-costume='…']` blocks in
   `src/styles/tokens.css`.
2. THE SYSTEM SHALL NOT test the costume name inside a component to choose a layout.
3. WHERE a structural difference is required (drop cap absent on tape, letterpress absent
   on tape), THE SYSTEM SHALL express it as a `[data-costume='…']` CSS override rather than
   a conditional render.
4. WHEN a costume is added to `SCENES`, THE SYSTEM SHALL require no change to
   `Prose`, `Audience`, `Dust`, `CueConsole` or `useCueStage`.

### Requirement 8 — Accessibility and restraint

**User story:** As a player who did not ask for a haunted house, I want to be able to read
the story without being fought by the interface.

#### Acceptance criteria

1. WHILE `prefers-reduced-motion: reduce` is set, THE SYSTEM SHALL reveal prose instantly
   and SHALL NOT run the typewriter or the shiver animation.
2. THE SYSTEM SHALL keep all prose as real text in the DOM.
3. THE SYSTEM SHALL render every control as a real `<button>` with a visible
   `:focus-visible` ring.
4. THE SYSTEM SHALL mark decorative stage layers `aria-hidden`.
5. THE SYSTEM SHALL show the keyboard hint only on the first beat of a run.
6. WHILE the pointer is absent (narrow viewport), THE SYSTEM SHALL replace the key hint
   with a tap hint and SHALL NOT display the keyboard chords.

### Requirement 9 — Dormancy

**User story:** As the person paying for hosting, I want the whole thing to be one static
folder, so that there is nothing to keep alive.

#### Acceptance criteria

1. THE SYSTEM SHALL require no runtime network request after initial load.
2. THE SYSTEM SHALL require no environment variables at build time.
3. THE SYSTEM SHALL build to a static `dist/` directory.
4. THE SYSTEM SHALL keep total JS under 90 kB gzipped.

## Out of scope

- Audio. The silence is doing work.
- Persistence. The Orpheum forgets you when you close it.
- Runtime prose generation. The beats are authored; the stage is what reacts.
- Any server-side component.
