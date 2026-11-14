---
inclusion: always
---

# GHOSTLIGHT — technology steering

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Runtime | Browser, ES2022 | A judge must be able to open a URL and be haunted within one second. |
| UI | React 19.3 | Strict-mode double invocation catches every impure render in the cue loop. |
| Build | Vite 6.4 | Sub-second rebuilds make visual iteration cheap; that is most of this project. |
| Language | TypeScript 5.9, `strict` | The cue protocol is the contract; it must be unrepresentable if violated. |
| Styling | Hand-written CSS, custom properties | The stage is animated by writing CSS variables from `requestAnimationFrame`. A CSS-in-JS layer would add a reconciliation step between the story and the light. |
| Fonts | Google Fonts (Cormorant Garamond, Spectral, IBM Plex Mono) | Period-correct serif for the parlour, a tape-era serif for Act II, one mono for all stage machinery. |
| Package manager | bun 1.3 | Lockfile committed; `bun install && bun run build` is the whole build. |

## Hard constraints

- **No CSS framework.** Tailwind's utility scale cannot express `radial-gradient` focus
  offsets computed from a live cue. The stage is ~700 lines of hand-written CSS and that
  is the point.
- **No animation library.** Framer Motion animates React state. Here the animation target
  is six CSS custom properties on one DOM node, updated in a single rAF loop. Introducing
  a reconciler between the cue and the pixels would be a regression.
- **No backend, no network calls at runtime.** The piece must work offline after load.
- **No `any`.** `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`,
  `verbatimModuleSyntax` are all on. `tsc --noEmit` is part of `bun run build`.
- **No new runtime dependency without a stated reason.** Current `dependencies` are
  `react` and `react-dom`. That is the entire production dependency tree.

## Verification commands

| Command | Gate |
| --- | --- |
| `bun run typecheck` | `tsc --noEmit`. Zero errors, zero warnings. |
| `bun run parity` | Both costumes expose the identical beat graph **and** every cue is inside the stage contract (0..1 meters, focus −1..1, known mood, no dangling edges). Must exit 0. |
| `bun run build` | Typecheck + `vite build`. Must exit 0. |

`scripts/parity.ts` is not a nice-to-have. It is the only automated defence of the
project's central claim, and it is wired into `.kiro/hooks/`.

## Performance budget

- Total JS after gzip must stay under 90 kB. Current: 78.25 kB.
- The cue loop must run at display refresh rate on a 2019 laptop. It writes ≤6 custom
  properties per frame and reads none — no layout thrash.
- The cue *console* runs at ~15 fps because it reads `stage.style.getPropertyValue`,
  and a human cannot read numbers faster than that anyway.

## Accessibility

- `prefers-reduced-motion` skips the typewriter entirely and disables the shiver animation.
- All prose is real text in the DOM, selectable, and announced normally. The typewriter
  reveals characters rather than replacing them, so screen readers see the full beat.
- Every control is a real `<button>` with a visible `:focus-visible` ring.
- The stage is decorative and marked `aria-hidden`; the cue sheet is a complementary
  `<aside>`.

## Deployment

Static output in `dist/`. Any static host works; the build has no server-side step and no
environment variables. `vite.config.ts` pins `host: 127.0.0.1` and `port: 5199` for local
development only — production is whatever the host serves.

## Related steering

- `#[[file:.kiro/steering/product.md]]` — what the piece is for.
- `#[[file:.kiro/steering/cue-contract.md]]` — the invariant this stack exists to serve.
- `#[[file:.kiro/steering/structure.md]]` — file layout.