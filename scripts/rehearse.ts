/* ============================================================
   REHEARSAL — DEMO.md is a script, so it gets run.

   The demo video tells a presenter to press a fixed sequence of keys
   and promises where it lands. That is a claim about the beat graph,
   and it rots the moment someone re-routes a choice: the recording
   would then end on the wrong card, in one take, with no time to
   discover it. So the key sequence is replayed here against the real
   scene data, and the quoted numbers are asserted against the cues
   the console would read once the easing settles.

   Exits 1 on any drift. Cheap enough to run before every take.
   ============================================================ */

import { seance } from '../src/scene/seance.ts';
import { tape } from '../src/scene/tape.ts';
import type { Scene } from '../src/stage/types.ts';

type Key = 'E' | 1 | 2 | 3 | 4;

const play = (scene: Scene, keys: Key[]) => {
  let id: string = scene.entry;
  const trail: string[] = [];
  for (const k of keys) {
    const b = scene.beats[id];
    if (!b) throw new Error(`${scene.id}: beat "${id}" does not exist`);
    if (b.ending) throw new Error(`${scene.id}: reached ending ${id} with keys left over`);
    if (k === 'E') {
      if (b.choices) throw new Error(`${scene.id}: Enter at a choice (${id}) would hang the take`);
      if (!b.next) throw new Error(`${scene.id}: no next from ${id}`);
      id = b.next;
    } else {
      const c = b.choices?.[k - 1];
      if (!c) throw new Error(`${scene.id}: no choice ${k} at ${id} (has ${b.choices?.length ?? 0})`);
      id = c.next;
    }
    trail.push(id);
  }
  return { id, trail };
};

const problems: string[] = [];
const check = (ok: boolean, line: string) => {
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${line}`);
  if (!ok) problems.push(line);
};

/* ---- the two takes promised by DEMO.md ---- */

// 0:34 Enter · 0:34 key 2 · 1:02 Enter ×2 · 1:02 key 1 · 1:02 Enter ×2 · 1:30 Enter · 1:30 key 1
const SEANCE_KEYS: Key[] = ['E', 2, 'E', 'E', 1, 'E', 'E', 'E', 1];
// 1:58 Enter · key 2 · Enter ×2 · key 1 · Enter ×2 · Enter · key 2
const TAPE_KEYS: Key[] = ['E', 2, 'E', 'E', 1, 'E', 'E', 'E', 2];

const runTake = (scene: Scene, keys: Key[], want: string, wantTitle: string) => {
  console.log(`\n${scene.id} — ${keys.join(' ')}`);
  const { id, trail } = play(scene, keys);
  console.log(`       ${trail.join(' → ')}`);
  const ending = scene.beats[id]?.ending;
  check(id === want, `${scene.id} lands on ${want} (got ${id})`);
  check(!!ending, `${id} is an ending`);
  check(ending?.title === wantTitle, `"${wantTitle}" (got "${ending?.title}")`);
  return scene.beats[id];
};

runTake(seance, SEANCE_KEYS, 'end_perform', 'The House Is Full');
const dark = runTake(tape, TAPE_KEYS, 'end_dark', 'End of Tape');

/* ---- the numbers the captions read out loud ---- */

console.log('\ncaptions');

// DEMO.md 1:30 · the séance climax, and the frame the fix in App.tsx rescued:
// the cue says 0.95 and the stage must actually reach it, not 62% of it.
const climax = seance.beats.end_perform.cue;
check(climax.intensity === 0.95, `end_perform cue intensity is 0.95 (got ${climax.intensity})`);
check(climax.audience === 1, `end_perform cue audience is 1 (got ${climax.audience})`);

// DEMO.md 1:24 · "Now the console reads audience 1.00" — the single number the
// eyes-arrive caption points at, and one of the four things that must stay
// legible at 480p. b09 then quotes 0.95 before the final choice.
const b08 = seance.beats.b08.cue;
check(b08.audience === 1, `seance/b08 audience is 1.00 (got ${b08.audience})`);
const b09 = seance.beats.b09.cue;
check(b09.audience === 0.95, `seance/b09 audience is 0.95 (got ${b09.audience})`);

// DEMO.md 0:34 · the séance's third beat is quoted by number on screen.
const b03b = seance.beats.b03b.cue;
check(b03b.mood === 'dread', `seance/b03b reads DREAD (got ${b03b.mood})`);
check(b03b.intensity === 0.26, `seance/b03b intensity is 0.26 (got ${b03b.intensity})`);
check(b03b.fog === 0.42, `seance/b03b fog is 0.42 (got ${b03b.fog})`);
check(b03b.audience === 0.18, `seance/b03b audience is 0.18 (got ${b03b.audience})`);
check(b03b.focus === 0.25, `seance/b03b focus is +0.25 (got ${b03b.focus})`);

// DEMO.md 2:16 · the blackout is quoted as TREMBLE HIGH, which is the console's
// own threshold (useCueStage: > 0.42), not a number typed into the script.
const trem = dark.cue.tremble;
check(trem > 0.42, `end_dark tremble ${trem} crosses the HIGH threshold (> 0.42)`);
check(dark.cue.mood === 'blackout', `end_dark reads BLACKOUT (got ${dark.cue.mood})`);

// DEMO.md 1:58 · "the same choice in the other costume" is only true if the
// second choice exists in both plays and is about the same thing.
const s2 = seance.beats.b02.choices?.[1];
const t2 = tape.beats.b02.choices?.[1];
check(!!s2 && !!t2, 'choice 2 exists in both costumes at b02');
check(s2?.next === 'b03b' && t2?.next === 'b03b', 'choice 2 lands on b03b in both costumes');

/* ---- verdict ---- */

console.log('');
if (problems.length) {
  console.error(`DRIFT — ${problems.length} problem(s). DEMO.md no longer describes this build.`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('OK — both takes land where DEMO.md says, and every caption number matches its cue.');
