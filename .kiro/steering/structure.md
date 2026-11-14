---
inclusion: always
---

# GHOSTLIGHT — project structure

## Tree

```
D:\cc-hm
├─ .kiro/                  Kiro configuration — submission requirement, never gitignored
│  ├─ steering/            Persistent context (this file, product, tech, cue-contract)
│  ├─ hooks/               Event-driven automation, auto-activated at session start
│  └─ specs/               requirements / design / tasks for the cue engine
├─ src/
│  ├─ stage/types.ts       The cue protocol. Single source of truth.
│  ├─ scene/               The script. Two files, same beat graph.
│  │  ├─ seance.ts         Act I — Victorian séance
│  │  └─ tape.ts           Act II — recovered VHS
│  ├─ hooks/
│  │  ├─ useCueStage.ts    rAF loop: eases a StageCue into CSS custom properties
│  │  └─ useTypewriter.ts  Character reveal, bucketed to ~24 emits per beat
│  ├─ components/
│  │  ├─ Prose.tsx         The script: direction, prose, choices, caret
│  │  ├─ Audience.tsx      Two hundred eyes, generated from a deterministic hash
│  │  ├─ Dust.tsx          Thirty-four motes in the light
│  │  └─ CueConsole.tsx    The cue sheet drawer (reads the live stage DOM)
│  ├─ styles/
│  │  ├─ tokens.css        Two costume palettes, selected by [data-costume]
│  │  ├─ base.css          Reset, selection, focus, reduced-motion
│  │  ├─ stage.css         The room: house, arch, drapes, deck, fog, ghost light
│  │  ├─ prose.css         The script typography and the ending card
│  │  └─ chrome.css        Bill, wardrobe, curtain, cue sheet, responsive rules
│  ├─ App.tsx              State machine + composition. 283 lines.
│  └─ main.tsx             Entry
├─ scripts/parity.ts       Costume parity + cue contract gate
├─ __lab/mobile.html       Three-iframe narrow-viewport harness
└─ index.html              Single root, data-costume="seance"
```

## Invariants

1. **`src/stage/types.ts` is the only place the cue shape is defined.** `useCueStage`,
   `CueConsole`, both scenes and `scripts/parity.ts` all import from it. Adding a meter
   means editing one interface and one `METERS` array — nothing else.
2. **The two scenes must be structurally identical.** Same ids, same edges, same ending
   count. Only `direction`, `text`, `title`, `subtitle`, `ending.title`,
   `ending.note`, `ending.kicker` and cue *values* may differ. `scripts/parity.ts` enforces
   this in CI.
3. **Stage visuals read CSS custom properties, never React props.** `useCueStage` writes
   `--cue-intensity`, `--cue-fog`, `--cue-audience`, `--cue-focus`, `data-mood`,
   `data-tremble` onto the `.stage` element. Every visual in `stage.css` derives from
   those. `CueConsole` reads the same custom properties back out of the DOM, so the drawer
   cannot drift from the stage.
4. **Costume is a token swap, not a branch.** Components never test
   `costume === 'vhs'`. `tokens.css` redefines the palette and the font stacks under
   `[data-costume='vhs']`; `prose.css` and `stage.css` contain at most a handful of
   `[data-costume='vhs']` overrides for *structural* differences (no drop cap, no
   letterpress).
5. **No component may own stage state.** The only stateful things are `App` (progress),
   `useCueStage` (eased values in a ref) and `CueConsole` (its own animation frame).
   `Audience` and `Dust` are `memo()`-frozen because their geometry is deterministic and
   must never re-render.

## Naming

- CSS: BEM-ish `block__element--modifier`. Stage constructs are named after theatre
  hardware (`house`, `arch`, `drape`, `deck`, `proscenium` was removed — it was drawing a
  closed outline that read as furniture).
- Beats: `b01`…`b09`, with branches `b03a`/`b06b`. Endings are `end_perform`,
  `end_dark`, `end_leave`.
- Cue moods: `hush`, `ember`, `dread`, `rise`, `blackout`, `flicker`. These are lighting
  states, not emotions — a mood must be renderable by a lighting board.

## Where to add things

| Task | File |
| --- | --- |
| A new beat | both `src/scene/seance.ts` and `src/scene/tape.ts`, same id |
| A new visual reaction to a cue | `src/styles/stage.css`, derived from a `--cue-*` property |
| A new cue dimension | `src/stage/types.ts` → `useCueStage.ts` → `CueConsole.ts` `METERS` → `scripts/parity.ts` range check |
| A new costume | `src/scene/<name>.ts` + a `[data-costume='<name>']` block in `tokens.css` + an entry in `SCENES` in `App.tsx` |
| Anything that introduces a second source of truth | don't |

## Related steering

- `#[[file:.kiro/steering/cue-contract.md]]` — the rule that makes this layout work.
- `#[[file:.kiro/steering/tech.md]]` — stack constraints.
- `#[[file:.kiro/steering/product.md]]` — the fiction this structure serves.