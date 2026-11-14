import { useCallback, useEffect, useMemo, useState } from 'react';
import { Audience } from './components/Audience';
import { CueConsole } from './components/CueConsole';
import { Dust } from './components/Dust';
import { Prose } from './components/Prose';
import { useCueStage } from './hooks/useCueStage';
import { seance } from './scene/seance';
import { tape } from './scene/tape';
import type { Choice, Costume, Mood, Scene, StageCue } from './stage/types';

const SCENES: Scene[] = [seance, tape];

const beatCount = (s: Scene) => Object.keys(s.beats).length;

/** The kicker is a stage report, not a mood label: it must agree with the cue
 *  that is actually playing. "The house is dark" over a fully-lit house reads
 *  as a bug, so the cue's mood decides the line. */
const KICKER: Record<Mood, string> = {
  hush: 'The house is quiet',
  ember: 'The house is warm',
  dread: 'The house is watching',
  rise: 'The house is full',
  blackout: 'The house is dark',
  flicker: 'The house is unstable',
};

export default function App() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [beatId, setBeatId] = useState(SCENES[0].entry);
  const [history, setHistory] = useState<string[]>([]);
  const [visited, setVisited] = useState(0);
  const [curtain, setCurtain] = useState(true);
  const [endingKey, setEndingKey] = useState(0);
  // `?sheet=1` opens the cue sheet on load — useful for sharing a link that
  // already shows the machinery, and for shooting the demo video.
  const [sheet, setSheet] = useState(
    () => new URLSearchParams(window.location.search).get('sheet') === '1',
  );

  const scene = SCENES[sceneIndex];
  const beat = scene.beats[beatId] ?? scene.beats[scene.entry];

  // the light begins a little behind the words and catches up as they land
  const [reveal, setReveal] = useState(0);
  const ambient: StageCue = useMemo(() => {
    const b = beat.cue;
    const k = 0.62 + reveal * 0.38;
    return {
      ...b,
      intensity: b.intensity * k,
      fog: b.fog * (0.8 + reveal * 0.2),
    };
  }, [beat, reveal]);

  const stageRef = useCueStage(ambient);

  // the house opens once, shortly after the lights come up
  useEffect(() => {
    const t = window.setTimeout(() => setCurtain(false), 520);
    return () => window.clearTimeout(t);
  }, []);

  // costume swap is a real change of contract, so the room must go dark first
  const swapCostume = useCallback(
    (next: Costume) => {
      const idx = SCENES.findIndex((s) => s.costume === next);
      if (idx < 0 || idx === sceneIndex) return;
      setCurtain(true);
      window.setTimeout(() => {
        setSceneIndex(idx);
        setBeatId(SCENES[idx].entry);
        setHistory([]);
        setVisited(1);
        setReveal(0);
        setEndingKey((k) => k + 1);
        window.setTimeout(() => setCurtain(false), 260);
      }, 620);
    },
    [sceneIndex],
  );

  const go = useCallback(
    (id: string) => {
      setHistory((h) => [...h, beatId]);
      setBeatId(id);
      setVisited((v) => v + 1);
      setReveal(0);
    },
    [beatId],
  );

  const restart = useCallback(() => {
    setBeatId(scene.entry);
    setHistory([]);
    setVisited(1);
    setReveal(0);
    setEndingKey((k) => k + 1);
  }, [scene.entry]);

  const back = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setBeatId(prev);
      setReveal(0);
      return h.slice(0, -1);
    });
  }, []);

  // keyboard: 1-4 choose, space/enter continue, esc back, c cue sheet
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // A focused control owns its own keys. Without this, clicking "cue sheet"
      // (which leaves focus on the button) means the next Enter toggles the
      // drawer *and* advances the story — the browser fires the click, and this
      // handler fires too.
      const target = e.target as HTMLElement | null;
      const onControl = !!target?.closest('button, a, input, textarea, select');
      if (onControl && (e.key === ' ' || e.key === 'Enter')) return;

      if (e.key === 'c' || e.key === 'C') {
        setSheet((s) => !s);
        return;
      }
      if (e.key === 'Escape') {
        if (sheet) {
          setSheet(false);
          return;
        }
        back();
        return;
      }
      if (beat.ending) return;
      if (beat.choices) {
        const n = Number(e.key);
        if (n >= 1 && n <= beat.choices.length) go(beat.choices[n - 1].next);
        return;
      }
      if ((e.key === ' ' || e.key === 'Enter') && beat.next) {
        e.preventDefault();
        go(beat.next);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [beat, go, back, sheet]);

  const act = sceneIndex === 0 ? 'I' : 'II';
  const progress = Math.min(1, visited / beatCount(scene));

  return (
    <div
      ref={stageRef}
      className="stage"
      data-costume={scene.costume}
      data-mood={beat.cue.mood}
      data-sheet={sheet}
    >
      <div className="house" />

      <div className="arch" aria-hidden="true">
        <div className="arch__opening" />
        <div className="drape drape--l" />
        <div className="drape drape--r" />
      </div>
      <div className="deck" aria-hidden="true" />

      <div className="ghostlight" aria-hidden="true">
        <div className="ghostlight__bulb" />
        <div className="ghostlight__stand" />
      </div>

      <div className="fog" aria-hidden="true">
        <div className="fog__layer fog__layer--a" />
        <div className="fog__layer fog__layer--b" />
        <div className="fog__layer fog__layer--c" />
      </div>

      <Dust />
      <Audience />

      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div className="scanlines" aria-hidden="true" />

      <header className="bill">
        <div className="bill__left">
          <span className="bill__ghost">GHOSTLIGHT</span>
          <span className="bill__sub">a theatre for the dead</span>
        </div>
        <div className="bill__right">
          <span className="bill__act">
            ACT {act} · {scene.title}
          </span>
          <span className="bill__bar" aria-hidden="true">
            <i style={{ transform: `scaleX(${progress})` }} />
          </span>
        </div>
      </header>

      <nav className="costumier" aria-label="Costume">
        <span className="costumier__label">Wardrobe</span>
        {SCENES.map((s) => (
          <button
            key={s.costume}
            className="costumier__btn"
            data-active={s.costume === scene.costume}
            onClick={() => swapCostume(s.costume)}
          >
            {s.costume === 'seance' ? 'Séance' : 'VHS'}
          </button>
        ))}
      </nav>

      {!beat.ending && <Prose key={beat.id} beat={beat} onReveal={setReveal} onChoose={(c: Choice) => go(c.next)} onContinue={() => beat.next && go(beat.next)} />}

      {beat.ending && (
        <div className="ending" key={endingKey}>
          <div className="ending__card">
            <div className="ending__kicker">
              {beat.ending.kicker ?? KICKER[beat.cue.mood]}
            </div>
            <h1 className="ending__title">{beat.ending.title}</h1>
            <p className="ending__note">{beat.ending.note}</p>
            <div className="ending__actions">
              <button className="ending__btn" onClick={restart}>
                Play again
              </button>
              <button
                className="ending__btn"
                onClick={() => swapCostume(scene.costume === 'seance' ? 'vhs' : 'seance')}
              >
                Change costume
              </button>
              <button className="ending__btn" onClick={back} disabled={!history.length}>
                Step back
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="curtain" data-closed={curtain} aria-hidden="true">
        <div className="curtain__panel curtain__panel--l" />
        <div className="curtain__panel curtain__panel--r" />
      </div>

      {/* onboarding only: once the viewer has moved once, the stage is clean */}
      {visited <= 1 && !beat.ending && (
        <div className="hint" aria-hidden="true">
          <span className="hint__keys">
            <kbd>1</kbd>–<kbd>4</kbd> choose · <kbd>space</kbd> continue ·{' '}
            <kbd>esc</kbd> back
          </span>
          <span className="hint__tap">tap the text to reveal it</span>
        </div>
      )}

      <button
        className="board__toggle"
        onClick={(e) => {
          // A mouse click leaves focus on the button, where it steals Space and
          // Enter from the stage. `detail > 0` means a real pointer pressed it;
          // keyboard activation leaves focus alone so Tab users stay put.
          if (e.detail > 0) e.currentTarget.blur();
          setSheet((s) => !s);
        }}
        aria-expanded={sheet}
      >
        <span className="board__dot" />
        {sheet ? 'hide cue sheet' : 'cue sheet'}
      </button>

      <CueConsole
        cue={beat.cue}
        beatId={`${scene.costume}/${beat.id}`}
        stageRef={stageRef}
        open={sheet}
        onClose={() => setSheet(false)}
      />
    </div>
  );
}
