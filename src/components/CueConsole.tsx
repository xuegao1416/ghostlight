import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { StageCue } from '../stage/types';

/**
 * The lighting board.
 *
 * Every pixel of this stage is a function of a `StageCue`. This panel proves it:
 * the meters read the *inline* custom properties that `useCueStage` is writing
 * this very frame, so what you see here is the exact number the CSS is consuming
 * (no React state, no second source of truth).
 *
 * Reading `el.style.getPropertyValue(...)` rather than `getComputedStyle` keeps
 * this free — inline custom properties do not force a style recalculation.
 */

const METERS = [
  { key: '--cue-intensity', label: 'intensity' },
  { key: '--cue-fog', label: 'fog' },
  { key: '--cue-audience', label: 'audience' },
  { key: '--cue-focus', label: 'focus' },
] as const;

type Props = {
  cue: StageCue;
  beatId: string;
  stageRef: RefObject<HTMLDivElement | null>;
  open: boolean;
  onClose: () => void;
};

export function CueConsole({ cue, beatId, stageRef, open, onClose }: Props) {
  const barRefs = useRef<Record<string, HTMLElement | null>>({});
  const numRefs = useRef<Record<string, HTMLElement | null>>({});
  const stateRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const stage = stageRef.current;
    if (!stage) return;

    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < 66) return; // ~15fps is plenty for a readout
      last = now;

      for (const m of METERS) {
        const v = Number(stage.style.getPropertyValue(m.key));
        if (!Number.isFinite(v)) continue;
        const norm = m.key === '--cue-focus' ? (v + 1) / 2 : v;
        const bar = barRefs.current[m.key];
        const num = numRefs.current[m.key];
        if (bar) bar.style.transform = `scaleX(${Math.max(0, Math.min(1, norm)).toFixed(3)})`;
        if (num) num.textContent = `${v >= 0 && m.key === '--cue-focus' ? '+' : ''}${v.toFixed(2)}`;
      }

      const el = stateRef.current;
      if (el) {
        el.textContent = `${stage.dataset.mood ?? '—'} · tremble ${stage.dataset.tremble ?? 'none'}`;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, stageRef]);

  return (
    <aside className="board" data-open={open} aria-hidden={!open}>
      <div className="board__head">
        <span className="board__title">Cue sheet</span>
        <button className="board__close" onClick={onClose} aria-label="Close cue sheet">
          ×
        </button>
      </div>

      <div className="board__beat">
        <span className="board__id">{beatId}</span>
        <span className="board__mood" ref={stateRef}>
          {cue.mood} · tremble {cue.tremble > 0.01 ? 'on' : 'none'}
        </span>
      </div>

      <ul className="board__meters">
        {METERS.map((m) => (
          <li key={m.key} className="board__meter">
            <span className="board__label">{m.label}</span>
            <span className="board__track">
              <i
                ref={(el) => {
                  barRefs.current[m.key] = el;
                }}
              />
            </span>
            <b
              ref={(el) => {
                numRefs.current[m.key] = el;
              }}
            >
              —
            </b>
          </li>
        ))}
      </ul>

      <div className="board__raw">
        <span className="board__rawlabel">the cue the story handed the stage</span>
        <code>{JSON.stringify(cue)}</code>
      </div>
    </aside>
  );
}
