/**
 * Costume parity check.
 *
 * GHOSTLIGHT's central claim to the judges is that the two costumes are not two
 * separate stories with a colour swap — they are one play wearing two dresses.
 * This script turns that claim into something falsifiable:
 *
 *   1. both scenes must expose exactly the same beat ids
 *   2. every beat id must resolve through the same edges (choices + next)
 *   3. every beat id must carry a cue, and that cue must be inside the stage's
 *      contract (0..1 meters, focus in -1..1, a mood the palette knows)
 *   4. every reachable beat must be reachable in both, and nothing may be
 *      orphaned
 *
 * Run with: bun run scripts/parity.ts
 */
import { seance } from '../src/scene/seance';
import { tape } from '../src/scene/tape';
import type { Beat, Scene } from '../src/stage/types';

type Shape = Record<string, { next?: string; choices: string[] }>;

/** Mirrors the `Mood` union in src/stage/types.ts. Kept as a value so a beat
 *  that names a mood the stage has no palette for fails the build. */
const MOODS = ['hush', 'ember', 'dread', 'rise', 'blackout', 'flicker'] as const;

const shapeOf = (scene: Scene): Shape => {
  const shape: Shape = {};
  for (const [id, beat] of Object.entries(scene.beats)) {
    shape[id] = {
      next: beat.next,
      choices: (beat.choices ?? []).map((c) => c.next),
    };
  }
  return shape;
};

const reachable = (scene: Scene): Set<string> => {
  const seen = new Set<string>();
  const stack = [scene.entry];
  while (stack.length) {
    const id = stack.pop()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const beat: Beat | undefined = scene.beats[id];
    if (!beat) continue;
    if (beat.next) stack.push(beat.next);
    for (const c of beat.choices ?? []) stack.push(c.next);
  }
  return seen;
};

const problems: string[] = [];
const a = shapeOf(seance);
const b = shapeOf(tape);

const idsA = Object.keys(a).sort();
const idsB = Object.keys(b).sort();

const onlyA = idsA.filter((id) => !b[id]);
const onlyB = idsB.filter((id) => !a[id]);
if (onlyA.length) problems.push(`beats only in seance: ${onlyA.join(', ')}`);
if (onlyB.length) problems.push(`beats only in tape:   ${onlyB.join(', ')}`);

for (const id of idsA) {
  if (!b[id]) continue;
  const x = a[id];
  const y = b[id];
  if (x.next !== y.next) {
    problems.push(`${id}: next differs (seance=${x.next ?? '∅'} tape=${y.next ?? '∅'})`);
  }
  if (x.choices.length !== y.choices.length) {
    problems.push(`${id}: choice count differs (${x.choices.length} vs ${y.choices.length})`);
  } else {
    for (let i = 0; i < x.choices.length; i++) {
      if (x.choices[i] !== y.choices[i]) {
        problems.push(`${id}: choice ${i + 1} points at ${x.choices[i]} vs ${y.choices[i]}`);
      }
    }
  }
}

for (const [label, scene] of [
  ['seance', seance],
  ['tape', tape],
] as const) {
  const seen = reachable(scene);
  const all = new Set(Object.keys(scene.beats));
  const orphans = [...all].filter((id) => !seen.has(id));
  if (orphans.length) problems.push(`${label}: unreachable beats: ${orphans.join(', ')}`);
  for (const [id, beat] of Object.entries(scene.beats)) {
    if (!beat.cue) problems.push(`${label}/${id}: no cue`);
  }
}

/** The stage trusts numbers. A cue of `intensity: 4` would not throw — the CSS
 *  custom property would simply be handed to `radial-gradient` and the room
 *  would go flat, silently. That is exactly the class of bug a language model
 *  writing beats would introduce, so the contract is enforced here rather than
 *  discovered on stage. */
const unit = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 1;

for (const [label, scene] of [
  ['seance', seance],
  ['tape', tape],
] as const) {
  for (const [id, beat] of Object.entries(scene.beats)) {
    if (!beat.cue) continue;
    const c = beat.cue;
    for (const key of ['intensity', 'fog', 'audience', 'tremble'] as const) {
      if (!unit(c[key])) problems.push(`${label}/${id}: cue.${key}=${c[key]} is outside 0..1`);
    }
    if (!unit((c.focus + 1) / 2)) {
      problems.push(`${label}/${id}: cue.focus=${c.focus} is outside -1..1`);
    }
    if (!MOODS.includes(c.mood)) problems.push(`${label}/${id}: unknown mood "${c.mood}"`);
    if (!beat.direction?.trim()) problems.push(`${label}/${id}: no stage direction`);
    if (!beat.text?.trim()) problems.push(`${label}/${id}: no prose`);
    if (beat.next && !scene.beats[beat.next]) {
      problems.push(`${label}/${id}: next points at missing beat "${beat.next}"`);
    }
    for (const ch of beat.choices ?? []) {
      if (!scene.beats[ch.next]) {
        problems.push(`${label}/${id}: choice "${ch.label}" points at missing beat "${ch.next}"`);
      }
    }
  }
}

const endings = (scene: Scene) =>
  Object.entries(scene.beats)
    .filter(([, beat]) => beat.ending)
    .map(([id, beat]) => `${id} → ${beat.ending!.title}`)
    .sort();

console.log(`beats        seance=${idsA.length}  tape=${idsB.length}`);
console.log(`reachable    seance=${reachable(seance).size}  tape=${reachable(tape).size}`);
console.log(`endings      seance: ${endings(seance).join(' | ')}`);
console.log(`             tape:   ${endings(tape).join(' | ')}`);

if (problems.length) {
  console.error('\nCOSTUME DRIFT DETECTED');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(
  `\nOK — both costumes perform the identical beat graph (${idsA.length} beats, ${endings(seance).length} endings each).`,
);