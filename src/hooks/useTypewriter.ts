import { useCallback, useEffect, useRef, useState } from 'react';

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Reveal text at a fixed character rate.
 *
 * `onReveal` is quantised to ~24 buckets on purpose: the stage only needs to
 * know "how far along the sentence are we", and a per-frame parent re-render
 * costs more than the visual smoothness it buys (the easing in useCueStage
 * smooths the steps out anyway).
 */
const BUCKETS = 24;

export function useTypewriter(text: string, speed = 46, onReveal?: (p: number) => void) {
  const [shown, setShown] = useState(text);
  const [done, setDone] = useState(true);
  const cancelled = useRef(false);
  const bucket = useRef(-1);
  const revealRef = useRef(onReveal);
  revealRef.current = onReveal;

  useEffect(() => {
    bucket.current = -1;

    const emit = (p: number) => {
      const b = Math.min(BUCKETS, Math.round(p * BUCKETS));
      if (b === bucket.current) return;
      bucket.current = b;
      revealRef.current?.(b / BUCKETS);
    };

    if (prefersReduced()) {
      setShown(text);
      setDone(true);
      emit(1);
      return;
    }

    cancelled.current = false;
    let raf = 0;
    let start = 0;

    setShown('');
    setDone(false);
    emit(0);

    const step = (t: number) => {
      if (cancelled.current) return;
      if (!start) start = t;
      const n = Math.min(text.length, Math.floor(((t - start) / 1000) * speed));
      setShown(text.slice(0, n));
      emit(n / text.length);

      if (n >= text.length) {
        setDone(true);
        emit(1);
        return;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelled.current = true;
      cancelAnimationFrame(raf);
    };
  }, [text, speed]);

  const skip = useCallback(() => {
    cancelled.current = true;
    setShown(text);
    setDone(true);
    revealRef.current?.(1);
  }, [text]);

  return { shown, done, skip };
}
