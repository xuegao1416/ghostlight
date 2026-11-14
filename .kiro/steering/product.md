---
inclusion: always
---

# GHOSTLIGHT — product steering

## What this is

GHOSTLIGHT is an interactive haunting that runs in a browser. The player sits alone in
the Orpheum, a theatre that has been dark for ninety-four years, and the play is performed
*at* them. There is no illustrated scene, no character portrait, no inventory. The stage
itself is the interface.

A ghost light is the single bare bulb theatres leave burning on an empty stage overnight.
The superstition is that every theatre is haunted, and the ghosts need light in order to
perform. Turn it off and you have told them the show is over.

That superstition is the entire interaction model. The player holds one lamp, and the
question the piece asks is what they are willing to illuminate.

## Why it is a Costume Contest entry

The category is **Costume Contest** — the entry must be judged on the quality and
conviction of its visual dressing. GHOSTLIGHT's answer is that a costume is not a skin,
it is a *contract*. The same seventeen beats, the same three endings, the same cue
protocol are performed twice:

| Act | Costume | Register |
| --- | --- | --- |
| I | `seance` | Candle-lit Victorian parlour theatre. Cormorant Garamond, warm amber, no scanlines. |
| II | `vhs` | Recovered security tape. Spectral, cold cyan, scanlines, tracking error, analog bleed. |

Act II is not Act I recoloured. It is the same play restaged by a different company with
a different vocabulary — "the match is struck" becomes "REC. 02:14 AM", the ghost light
becomes a lens that will not stop hunting focus, and the audience that turns to look
becomes a hundred and forty faces turning toward the lens.

`scripts/parity.ts` is the falsifiable proof of that claim. If the two costumes ever
drift apart — different beats, different edges, different endings — the build fails.

## What the player does

1. Sit. The prose types itself out; the light lags a beat behind the words and catches up.
2. Choose. Three or four lines of dialogue, each a different kind of courage.
3. Watch the room change. Every choice hands the stage a new cue.
4. Reach an ending. There are three per costume, six in total, and none of them is a win.

## Product principles

- **The stage must not decorate the story — it must perform it.** Anything ambient that
  is not driven by the current cue is decoration and should be deleted.
- **Nothing is explained in the UI.** No tooltips, no tutorial modal, no "click here".
  One line of key hints appears on the first beat and never again.
- **Dark is the default state, light is the event.** The house is black until something
  in the fiction earns illumination.
- **Terror comes from attention, not from gore.** The audience in this theatre is
  rendered as paired points of light that blink out of sync. Nothing is drawn. Something
  is *looking*.
- **The machine may be visible, but only on request.** The cue sheet drawer exists so a
  judge can watch the story drive the stage in real time. It is off by default (`?sheet=1`
  or the `c` key), because a magic trick explained before it is performed is not a trick.

## Non-goals

- No backend, no accounts, no saved progress. The Orpheum forgets you when you close it.
- No procedurally generated prose at runtime. The beats are authored and reviewed; the
  *stage* is what reacts.
- No audio. The silence is doing work.

## Related steering

- `#[[file:.kiro/steering/cue-contract.md]]` — the one architectural invariant.
- `#[[file:.kiro/steering/tech.md]]` — stack and constraints.
- `#[[file:.kiro/steering/structure.md]]` — where things live.