import { memo, useMemo } from 'react';
import type { CSSProperties } from 'react';

export const Dust = memo(function Dust() {
  const motes = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const r = (n: number) => {
          const x = Math.sin(n * 12.9898 + i * 4.1414) * 43758.5453;
          return x - Math.floor(x);
        };
        return {
          key: `mote-${i}`,
          left: `${r(1) * 100}%`,
          top: `${30 + r(2) * 68}%`,
          drift: `${(r(3) - 0.5) * 90}px`,
          duration: `${11 + r(4) * 20}s`,
          delay: `${-r(5) * 24}s`,
          scale: 0.6 + r(6) * 1.5,
        };
      }),
    [],
  );

  return (
    <div className="dust" aria-hidden="true">
      {motes.map((m) => (
        <span
          key={m.key}
          style={
            {
              left: m.left,
              top: m.top,
              animationDuration: m.duration,
              animationDelay: m.delay,
              transform: `scale(${m.scale})`,
              '--drift': m.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
});
