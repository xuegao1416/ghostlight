import { useEffect, useRef } from 'react';
import type { StageCue } from '../stage/types';

/**
 * The bridge between story and light.
 *
 * Cues do not snap — a lighting board never snaps. Every value eases toward its
 * target, so the stage appears to *notice* the story rather than obey it.
 */
export function useCueStage(target: StageCue) {
  const ref = useRef<HTMLDivElement>(null);
  const current = useRef<StageCue>({ ...target });
  const goal = useRef<StageCue>(target);
  goal.current = target;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const k = 1 - Math.pow(0.0016, dt / 1000); // frame-rate independent easing

      const c = current.current;
      const g = goal.current;

      c.intensity += (g.intensity - c.intensity) * k;
      c.fog += (g.fog - c.fog) * k;
      c.tremble += (g.tremble - c.tremble) * (k * 1.6);
      c.audience += (g.audience - c.audience) * k;
      c.focus += (g.focus - c.focus) * k;
      if (g.mood !== c.mood) c.mood = g.mood;

      el.style.setProperty('--cue-intensity', c.intensity.toFixed(4));
      el.style.setProperty('--cue-fog', c.fog.toFixed(4));
      el.style.setProperty('--cue-audience', c.audience.toFixed(4));
      el.style.setProperty('--cue-focus', c.focus.toFixed(4));
      el.dataset.mood = g.mood;
      el.dataset.tremble =
        c.tremble > 0.42 ? 'high' : c.tremble > 0.12 ? 'mid' : c.tremble > 0.01 ? 'low' : 'none';

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return ref;
}
