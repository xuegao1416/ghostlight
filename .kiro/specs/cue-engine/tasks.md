# Tasks — the cue engine

Work is ordered so that each task leaves the project in a state where the next one is
verifiable. Tasks marked **[gate]** change a verification command's result; they are not
done until the command has been run and its output copied into this file's parent commit
message or the README.

Status legend: `[x]` done and verified · `[~]` done, verification pending · `[ ]` not
started.

## 1. Contract

- [x] 1.1 Define `Costume`, `Mood`, `StageCue`, `Choice`, `Ending`, `Beat`, `Scene` in
      `src/stage/types.ts`. `StageCue` is the only interface a beat may use to address the
      stage.
- [x] 1.2 Add the `cue()` factory so scene files read as prose with numbers in them rather
      than as object literals.
- [x] 1.3 Write `.kiro/steering/cue-contract.md` — the five-hop pipeline, the three
      load-bearing properties (single writer, ease not cut, console reads the DOM), the
      four derived rules, and the temptation to bypass the pipeline.
- [x] 1.4 Write `.kiro/specs/cue-engine/requirements.md` in EARS form, nine requirements.
- [x] 1.5 Write `.kiro/specs/cue-engine/design.md` with the rejected designs and their
      reasons.

## 2. The writer **[gate]**

- [x] 2.1 Implement `useCueStage(target)` — one rAF loop, empty deps, `goal.current`
      updated on every render so no effect dependency is needed.
- [x] 2.2 Frame-rate-independent easing: `k = 1 − 0.0016^(dt/1000)`.
- [x] 2.3 Clamp `dt` to 64 ms so a backgrounded tab cannot teleport the light.
- [x] 2.4 Write the four `--cue-*` custom properties with `toFixed(4)`; write
      `data-mood` from the *goal* and `data-tremble` from the *eased* value using the
      0.42 / 0.12 / 0.01 thresholds.
- [x] 2.5 Ease `tremble` at `k × 1.6` — the shake must already be happening when noticed.
- [x] 2.6 Quantise `reveal` to 24 buckets inside `useTypewriter` so the App tree does not
      re-render every frame.
- [x] 2.7 Verify: `bun run typecheck` → exit 0.

## 3. The stage surface

- [x] 3.1 Build the room as three bands: arch above, prose in the middle, watchers at the
      bottom. No solid objects — only light, haze and implied depth.
- [x] 3.2 Key light: `radial-gradient` centred at `calc(50% + var(--cue-focus) * 30%)`
      with radius `calc(var(--cue-intensity) * 62%)`.
- [x] 3.3 Haze: three drifting layers, `opacity: calc(var(--cue-fog) * …)`.
- [x] 3.4 Ghost light: `box-shadow` spread scaled by `--cue-intensity`, plus a slow
      breathe. It never reaches zero — the bulb is the premise.
- [x] 3.5 Shiver: `.stage[data-tremble='high' | 'mid' | 'low']`, disabled under
      `prefers-reduced-motion`.
- [x] 3.6 Audience: abandon silhouettes. Twelve rows of paired points of light on a
      deterministic hash, `opacity: calc(var(--cue-audience) * 0.98)`, core layer blinking
      out of phase per row so the crowd never blinks together.
- [x] 3.7 Record why silhouettes failed: six attempts, all closed outlines, all read as
      objects. This is in `design.md` so the next maintainer does not re-attempt it.

## 4. The console

- [x] 4.1 `CueConsole` reads `stage.style.getPropertyValue('--cue-*')` — inline
      declarations, not computed style, not props.
- [x] 4.2 Show the eased live value next to the raw `beat.cue` JSON so target and current
      state are both visible in one frame.
- [x] 4.3 Throttle the console loop to ~15 fps and stop it when the drawer closes.
- [x] 4.4 Shift and narrow the prose while the drawer is open; on narrow viewports make it
      a bottom sheet and fade the prose out entirely rather than sitting behind it.
- [x] 4.5 Open the drawer from `?sheet=1` so a share link or a video take can land on the
      proof directly.
- [x] 4.6 Add a focus guard to the key handler and `blur()` on pointer activation only, so
      Enter never both activates a button and advances the story.

## 5. The second costume

- [x] 5.1 Author `src/scene/tape.ts` with the identical beat graph — same ids, same
      edges, same choice counts — in a different register (timecode, audio channels,
      V-SYNC).
- [x] 5.2 Add the `[data-costume='vhs']` token block: palette, Spectral instead of
      Cormorant, tighter prose, higher grain, visible scanlines, magenta bleed.
- [x] 5.3 Express structural costume differences as CSS overrides (`[data-costume='vhs']`
      turns off the drop cap and the letterpress) rather than conditional renders.
- [x] 5.4 Curtain transition between costumes: 620 ms of closed curtain, swap scene, reset
      the run, reopen.
- [x] 5.5 Verify both costumes render and both reach all three endings.

## 6. Parity **[gate]**

- [x] 6.1 `scripts/parity.ts` — compare beat id sets, `next` edges, ordered
      `choice.next` lists, and ending counts between `seance` and `tape`.
- [x] 6.2 Reachability DFS from each scene's `entry`; report unreachable beats.
- [x] 6.3 Cue contract checks: meters in 0..1, focus in −1..1, mood in the known set,
      non-empty direction and text, every `next` resolves.
- [x] 6.4 Prove the gate can fail: set one `intensity` to `4` and confirm exit 1 with
      `COSTUME DRIFT DETECTED`, then restore and confirm exit 0.
- [x] 6.5 Wire `parity` and `verify` into `package.json`.

## 7. Kiro integration **[gate]**

- [x] 7.1 `.kiro/steering/product.md`, `tech.md`, `structure.md`.
- [x] 7.2 `.kiro/hooks/stage-integrity.json` — typecheck on save, parity on scene save,
      contract review on stage-file save, session orientation, ship gate on agent stop.
- [x] 7.3 `.kiro/specs/cue-engine/` three-piece spec.
- [x] 7.4 `scripts/hooks-selftest.ts` — every `command` hook is executed verbatim with its
      own timeout, and every `matcher` is run against real repository paths in both
      separator styles. Exit 0 means the declaration is true, not merely present.
- [x] 7.5 Prove the self-test can fail: the first run caught four real defects — the parity
      and stage-contract matchers were written `src/scene/…`, which never matches the
      `src\scene\…` a Windows checkout hands over, so both gates would have stayed green
      while never firing. Fixed to `src[\\/]scene[\\/]…` and re-run to 7/7 fixtures agreed.
- [x] 7.6 Wire `bun run hooks` into `bun run verify`, before `build`. Not into the
      `AgentStop` ship gate: that hook calls `verify`, so calling the self-test from it
      would re-execute the self-test from inside the self-test.
- [ ] 7.7 **Not verified, and not claimed:** the `agent` hook (`stage contract review`)
      has never run inside a live Kiro session, so nothing here proves that Kiro injects
      its prompt or that the prompt produces a useful answer. The self-test checks its
      shape and says out loud that it cannot run it. This is the one honest gap in the
      Kiro integration; the four `command` hooks have no such gap.
- [ ] 7.8 Watch the hooks fire in a real Kiro session and paste what each printed. Requires
      a Kiro install, which this machine does not have.

## 8. Accessibility and narrow viewports

- [x] 8.1 `prefers-reduced-motion` skips the typewriter and the shiver.
- [x] 8.2 Real `<button>`s, visible `:focus-visible`, decorative layers `aria-hidden`.
- [x] 8.3 `__lab/mobile.html` — three iframes at 390×844, 360×740 and 768×1024 so the
      media queries evaluate against real viewports rather than a scaled desktop.
- [x] 8.4 Fix the wardrobe capsule overlapping the prose on narrow screens by anchoring it
      below the bill instead of guessing the prose's height.
- [x] 8.5 Replace the keyboard hint with a tap hint on narrow screens.

## 9. Ship

- [x] 9.1 `bun run verify` green; paste the four command results into the README.
- [x] 9.2 README: what it is, how the cue engine works, how Kiro was used, how to run it.
- [x] 9.3 `git init`, initial commit, public GitHub repository, push.
- [x] 9.4 Deploy `dist/` to a public URL; put it in the README and the Devpost form.
- [x] 9.5 3-minute demo script: open on the house dark, one beat showing the console
      chasing a cue, the wardrobe swap, the same choice in the other costume, ending card,
      parity output as the last frame. → `DEMO.md`
- [x] 9.6 Record, upload, and confirm the video is public. → `scripts/film.ts` drives a
      headless Edge over CDP and assembles the film with ffmpeg; the result is
      <https://xuegao1416.github.io/ghostlight/ghostlight-demo.mp4>, served `200`,
      `Content-Type: video/mp4`, 44,425,644 bytes, 2:51.6, and its `ftyp` box answers a
      range request at byte 0 — so it streams without sign-in. Uploaded next to the app it
      shows, so the film and the build cannot drift apart. Re-runnable:
      `bun run film all --burn` re-shoots it; `bun run film asm --burn` re-assembles an
      existing shoot in about three minutes.

## Known-good command output (for the README)

```
$ bun run parity
beats      seance=17  tape=17
reachable  seance=17  tape=17
endings    seance: end_dark → House Dark | end_leave → Interval | end_perform → The House Is Full
           tape:   end_dark → End of Tape | end_leave → Please Rewind | end_perform → You Are the Tape
OK — both costumes perform the identical beat graph (17 beats, 3 endings each).
```

```
$ bun run build
dist/index.html                 1.07 kB │ gzip:  0.55 kB
dist/assets/index-*.css        17.28 kB │ gzip:  4.63 kB
dist/assets/index-*.js        248.27 kB │ gzip: 78.25 kB
```