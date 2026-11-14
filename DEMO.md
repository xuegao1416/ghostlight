# GHOSTLIGHT — 3-minute demo script

Kiroween 2026 · Costume Contest · hard limit 3:00.

The video has to prove three things a still screenshot cannot:

1. the room is **driven by the story**, not decorated after it;
2. the **same play** runs in a second costume;
3. the claim is **checkable** — a script enforces it.

Nothing in the video should be narrated as a promise. Every claim gets shown.

---

## How the film is made

This file is the script the film follows. The film itself is not hand-recorded:

```bash
bun run film all --burn     # shoot every segment, assemble, caption, encode
bun run film asm --burn     # re-assemble an existing shoot (3 minutes instead of 12)
```

`scripts/film.ts` drives the **deployed** app in a headless Edge over CDP
(`Page.startScreencast`), presses the keys a presenter would press, and assembles the frames
with ffmpeg. So every frame is a pixel the app actually painted, and none of the numbers on
screen are typed by hand: the beat object comes from importing `src/scene/seance.ts`, and the
parity output comes from running `bun run parity` at record time — if that script exits
non-zero the recorder aborts rather than filming a stale claim.

Three things the recorder has to get right, for anyone re-shooting it:

| | |
| --- | --- |
| Viewport | Shot at 1920×**920**, then padded down to 1080 so the captions get a black band of their own. Overlaying them on a full-height stage put them straight through the prose. |
| Capture | JPEG q95, ~58fps. PNG tops out at 10.5fps through this screencast, and a curtain that opens in half a second cannot be assembled out of duplicates. |
| Timing | Every wait is an absolute offset from the segment's first frame, and each assembled segment is checked against its plan (`PART_DRIFT` aborts if a segment is more than 0.75s out). A screencast emits nothing while the page holds still, so an insert card is exactly where a segment silently collapses. |

The finished film is published next to the app rather than on a video host:
<https://xuegao1416.github.io/ghostlight/ghostlight-demo.mp4> — 2:51.6, no sign-in, and the
same origin as the build it shows, so the two cannot drift apart.

The rest of this file is what happens on screen and why. Timecodes are targets, not law.

### 0:00 — 0:14 · Cold open, no narration

The séance first frame, already live. A match is struck. Let the typewriter run to the end of
b01 without touching anything.

**On-screen caption (lower third):**
> A ghost light is the one bulb left burning on a dark stage, so the dead can keep performing.

**Do not speak.** Let the room be a room for fourteen seconds. This is the only moment in the
video where nothing is being explained, and it is the reason anyone will keep watching.

### 0:14 — 0:34 · The argument

Cut to a card over black. The card's contents are not typed by hand — the recorder imports the
beat and prints it:

```bash
bun -e "const {seance}=await import('./src/scene/seance.ts'); const {text,...rest}=seance.beats.b01; console.log(JSON.stringify(rest,null,2))"
```

which is the beat the room is performing right now, with the prose elided:

```json
{ "id": "b01", "direction": "A MATCH, STRUCK. …", "cue": { "mood": "ember", "intensity": 0.46, … }, "next": "b02" }
```

The card shows that object with `"cue"` picked out in the accent colour, and one line under it:
*No colour. No class name. Six numbers, and the room takes it from here.*

**On-screen captions:**
> Every line the story speaks becomes a lighting cue.
>
> The beat never names a colour, a sound, or a class. It hands over six numbers and the room is
> obliged to answer.

Back to the browser. Look at the cue sheet, which is still easing:

**Caption — this is the whole argument, so let it land:**
> The cue says **0.46**. The room says **0.33**. It is not a bug — the light leaves a little
> behind the words and catches up as they land. The console reads the numbers off the stage
> itself, so it can show you the room mid-arrival.

That gap is the difference between a story that describes a room and a story that is performed
in one. Nothing is animating for decoration; the prose and the light are the same event, at two
different lags.

### 0:34 — 1:02 · First choice, and the console chasing it

<kbd>Enter</kbd> → b02, the house speaks. Then <kbd>2</kbd>: *"Ask who is sitting in the
second."*

The mood drops to `dread`, fog climbs, the focus slides left.

Open the cue sheet (<kbd>C</kbd> or the toggle, bottom right). Hold for a beat so the numbers
are readable while they are still easing:

> `seance/b03b · DREAD · tremble none` — `intensity 0.24 · fog 0.40 · audience 0.18 · focus +0.25`

Read it while it is short of the cue and it settles: `0.26 · 0.42 · 0.18 · +0.25`. Both numbers
are true, one second apart. That lag *is* the demo — if you wait for the settled value you have
only shown a readout, not a performance.

**Caption:**
> These numbers are not read from React. The console reads the CSS custom properties the
> stage writes to itself — so if the easing stops, the console stops. It cannot lie about the
> picture it is sitting on.

Leave the sheet open for the rest of the séance run. It is the proof.

### 1:02 — 1:30 · The turn

<kbd>Enter</kbd> ×2 → b04, the ghost light → b05, *"Name it."*

Pause on b05 for two seconds. Four choices, and only one of them is about a person.

<kbd>1</kbd>: *"A person. Somebody I lost."* → <kbd>Enter</kbd> → <kbd>Enter</kbd>.

b07: the curtain rises on the auditorium again. b08: a hundred and forty heads turn.

The eyes arrive at the bottom of the frame. Now the console reads **`audience 1.00`**.

**Caption:**
> We could not draw a crowd. Six attempts, six silhouettes that read as objects. So we drew
> the only thing a room full of people does that a room full of furniture does not: it looks
> back.

### 1:30 — 1:58 · The wardrobe swap

<kbd>Enter</kbd> → b09 → <kbd>1</kbd> *"Perform."* → the end_perform card: **The House Is
Full**, `intensity 0.95`, `audience 1.00`.

Let it sit for three seconds. Then click **CHANGE COSTUME**.

The curtain comes in. When it goes back out the room is `#03060a`, the light is teal, the
typewriter is a timecode, and the same play is starting from the top.

**Caption:**
> Same beat graph. Same cue protocol. Different costume. The play did not change — the tokens
> did.

### 1:58 — 2:30 · The same choice, in the other costume

VHS line, deliberately the *same* branch:

<kbd>Enter</kbd> → b02 → <kbd>2</kbd> (the séance's choice two was *"Ask who is sitting in
the second"*; here it is *"Play back the second row"*) → <kbd>Enter</kbd> ×2 → b05 →
<kbd>1</kbd> → <kbd>Enter</kbd> ×2.

b08 in night vision: the eyes are teal now, the scanlines roll, the prose has no drop cap.

**Caption:**
> Identical choice. Identical beat. The room answers in a completely different register.

<kbd>Enter</kbd> → b09 → <kbd>2</kbd> *"Blow out the ghost light."*

`End of Tape`. The console reads **`BLACKOUT · TREMBLE HIGH`** and the frame is shaking at 0.9 s
per step, because the camera cannot hold still in a room that just went blind.

Hold the black frame for four full seconds. Do not cut early. The silence after the ending is
part of it.

### 2:30 — 3:00 · The last frame is the check

Cut to a card over black carrying the real output of:

```bash
bun run parity
```

which the recorder ran at shoot time (it aborts if this exits non-zero). Full output, uncut —
the `endings` rows are folded one ending per line on the card so they stay readable at 480p:

```
beats        seance=17  tape=17
reachable    seance=17  tape=17
endings      seance   end_dark → House Dark
                      end_leave → Interval
                      end_perform → The House Is Full
             tape     end_dark → End of Tape
                      end_leave → Please Rewind
                      end_perform → You Are the Tape

OK — both costumes perform the identical beat graph (17 beats, 3 endings each).
```

**Caption:**
> "Same play in two costumes" is not a claim in the README. It is a script that exits 1 when
> it stops being true. Break one next-pointer in `tape.ts` and the build fails.

Final card over black:

> **GHOSTLIGHT** — a theatre for the dead
> xuegao1416.github.io/ghostlight
> github.com/xuegao1416/ghostlight
> KIROWEEN 2026 · COSTUME CONTEST

The film lands at **2:51.6**, just under the platform's 3:00 ceiling, so the host's own
end-screen cannot push the submission over it.

---

## What must be legible on screen, even at 480p

- The cue sheet numbers moving while the fog moves.
- `audience 1.00` at the moment the eyes appear.
- The whole room changing colour between the two costumes.
- The parity output in full, readable without pausing — all six rows, including the `endings`
  rows folded one ending per line so they do not wrap mid-title.

If a line is not readable at 480p, shoot it larger. Judges watch on laptops, often without
sound — the video is a silent film with subtitles, or it is nothing.

---

## Failure modes to avoid

| Don't | Why |
| --- | --- |
| Narrate over the cold open | Kills the only genuinely eerie moment you have. |
| Skip the typewriter with Enter during b01 | The match lighting is the hook; it costs 8 seconds. |
| Open the cue sheet after the eyes arrive | The point is to see the number *climb* into 1.00, not to see it sitting at 1.00. |
| Cut on the blackout | The shake needs four seconds to register as deliberate. |
| Add music | The piece is silent. Music reads as "this demo needed help". |
| Show the file tree | Nobody is impressed by a tree. Show the beat object and the parity output. |
| Say "AI-powered" | Say what the machine does: it hands the stage a cue. |
| Put captions on the stage | They go through the prose, which is the one thing the film is about. Hence the padded band. |

---

## Publishing

The film is served from the app's own origin, which is why the URL in the README, the submission
form and the closing card all agree:

<https://xuegao1416.github.io/ghostlight/ghostlight-demo.mp4>

- Public in the sense that matters: `200`, `Content-Type: video/mp4`, no cookies, no sign-in.
  Serve it next to the build and it cannot go stale behind the thing it demonstrates.
- The `ftyp` box is at byte 0 (`+faststart`), so it streams before it finishes downloading.
- Title, if you cross-post it to a video host: `GHOSTLIGHT — a theatre for the dead (Kiroween
  2026, Costume Contest)`; description: the live URL, the repo URL, and the parity output
  pasted as text.
