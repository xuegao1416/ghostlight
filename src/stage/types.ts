/**
 * The cue protocol.
 *
 * A scene does not animate itself. The script emits *stage directions* — abstract,
 * semantic cues — and the costume decides what those directions look like.
 *
 * That separation is the whole thesis: one script, many costumes.
 */

export type Costume = 'seance' | 'vhs';

/**
 * Mood is semantic, not visual. A costume maps mood onto its own palette,
 * so "dread" is candle-smoke in one costume and chroma-bleed in another.
 */
export type Mood = 'hush' | 'ember' | 'dread' | 'rise' | 'blackout' | 'flicker';

export interface StageCue {
  mood: Mood;
  /** 0..1 — how much of the house is lit */
  intensity: number;
  /** 0..1 — fog density */
  fog: number;
  /** 0..1 — camera tremor */
  tremble: number;
  /** 0..1 — how much of the dead audience is visible */
  audience: number;
  /** -1 far left .. 1 far right — where the light falls */
  focus: number;
}

export interface Choice {
  label: string;
  next: string;
}

export interface Ending {
  title: string;
  note: string;
  /** Optional house report printed above the title. Authored by the script so it
   *  can never contradict the cue that is playing, and can never echo the title. */
  kicker?: string;
}

export interface Beat {
  id: string;
  /** Stage direction. Rendered as a playscript line, in mono, faint. */
  direction: string;
  /** The spoken / narrated text. */
  text: string;
  cue: StageCue;
  choices?: Choice[];
  /** Linear continuation when there is no choice. */
  next?: string;
  ending?: Ending;
}

export interface Scene {
  id: string;
  costume: Costume;
  title: string;
  subtitle: string;
  entry: string;
  beats: Record<string, Beat>;
}

export const cue = (
  mood: Mood,
  intensity: number,
  fog: number,
  audience: number,
  focus: number,
  tremble = 0,
): StageCue => ({ mood, intensity, fog, tremble, audience, focus });
