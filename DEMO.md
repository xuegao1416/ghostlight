# GHOSTLIGHT — 3-minute demo script

Kiroween 2026 · Costume Contest · hard limit 3:00.

The video has to prove three things a still screenshot cannot:

1. the room is **driven by the story**, not decorated after it;
2. the **same play** runs in a second costume;
3. the claim is **checkable** — a script enforces it.

Nothing in the video should be narrated as a promise. Every claim gets shown.

---

## Before you hit record

| | |
| --- | --- |
| Open | <https://xuegao1416.github.io/ghostlight/?sheet=1> |
| Window | 1280×800 or larger. Full screen the browser, hide bookmarks bar (`Ctrl+Shift+B`). |
| Cursor | Park it bottom-left and leave it alone until the wardrobe swap. |
| Notifications | Off. Do Not Disturb on. |
| Audio | **None.** The piece is silent by design — captions carry it. Do not add music; it will fight the typewriter rhythm. |
| Terminal | One window, large font (≥16pt), dark background, `cd D:\cc-hm`, cleared. |
| Capture | 1920×1080 @ 30fps. If you use OBS, set the stage as a window capture, not a screen capture — no desktop chrome in frame. |

Record in one take. The typewriter is deterministic; the eyes and fog are not, so a cut
mid-beat reads as a glitch.

---

## The script

Timecodes are targets, not law. The typewriter has a 46 ms/char rate and every beat can be
skipped by pressing <kbd>Enter</kbd> — so you are always ahead of the clock, never behind it.

### 0:00 — 0:14 · Cold open, no narration

The séance first frame, already live. A match is struck. Let the typewriter run to the end of
b01 without touching anything.

**On-screen caption (lower third):**
> A ghost light is the one bulb left burning on a dark stage, so the dead can keep performing.

**Do not speak.** Let the room be a room for fourteen seconds. This is the only moment in the
video where nothing is being explained, and it is the reason anyone will keep watching.

### 0:14 — 0:34 · The argument

Cut to the terminal. Run:

```bash
sed -n '16,24p' src/scene/seance.ts
```

**On-screen caption:**
> The beat is not allowed to say `className="scary"`. It says `audience: 0.46`.

Back to the browser. Point at the frame and say (voiceover, if you are using voice — otherwise
caption):

> The story and the stage are one data model. Every beat carries a cue. The cue is the
> performance.

### 0:34 — 1:02 · First choice, and the console chasing it

<kbd>Enter</kbd> → b02, the house speaks. Then <kbd>2</kbd>: *"Ask who is sitting in the
second."*

The mood drops to `dread`, fog climbs, the focus slides left.

Open the cue sheet (<kbd>C</kbd> or the toggle, bottom right). Hold for a beat so the numbers
are readable while they are still easing:

> `seance/b03b · DREAD · tremble none` — `intensity 0.26 · fog 0.42 · audience 0.18 · focus +0.25`

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

Cut to the terminal, clear, run:

```bash
bun run parity
```

Full output, uncut:

```
beats      seance=17  tape=17
reachable  seance=17  tape=17
endings    seance: end_dark → House Dark | end_leave → Interval | end_perform → The House Is Full
           tape:   end_dark → End of Tape | end_leave → Please Rewind | end_perform → You Are the Tape
OK — both costumes perform the identical beat graph (17 beats, 3 endings each).
```

**Caption:**
> "Same play in two costumes" is not a claim in the README. It is a script that exits 1 when
> it stops being true. Break one next-pointer in `tape.ts` and the build fails.

Final card over black:

> **GHOSTLIGHT** · a theatre for the dead
> xuegao1416.github.io/ghostlight
> Kiroween 2026 — Costume Contest

Stop recording at 2:52 so the platform's own end-screen does not push you past 3:00.

---

## What must be legible on screen, even at 480p

- The cue sheet numbers moving while the fog moves.
- `audience 1.00` at the moment the eyes appear.
- The whole room changing colour between the two costumes.
- The parity output, all five lines, readable without pausing.

If a line is not readable at 480p, re-record it larger. Judges watch on laptops, often
without sound — the video is a silent film with subtitles, or it is nothing.

---

## Failure modes to avoid while recording

| Don't | Why |
| --- | --- |
| Narrate over the cold open | Kills the only genuinely eerie moment you have. |
| Skip the typewriter with Enter during b01 | The match lighting is the hook; it costs 8 seconds. |
| Open the cue sheet after the eyes arrive | The point is to see the number *climb* into 1.00, not to see it sitting at 1.00. |
| Cut on the blackout | The shake needs four seconds to register as deliberate. |
| Add music | The piece is silent. Music reads as "this demo needed help". |
| Show the file tree | Nobody is impressed by a tree. Show the beat object and the parity output. |
| Say "AI-powered" | Say what the machine does: it hands the stage a cue. |

---

## Upload

- YouTube or Vimeo, **public** (not unlisted — the rules require public).
- Title: `GHOSTLIGHT — a theatre for the dead (Kiroween 2026, Costume Contest)`
- Description: the live URL, the repo URL, and the parity output pasted as text.
- Thumbnail: the b08 frame with the eyes. That frame is the whole pitch.
- After upload, open it in a private window and confirm it plays without signing in. Then tick
  `tasks.md` 9.6.
