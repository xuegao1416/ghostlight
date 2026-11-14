import { memo, useMemo } from 'react';

/**
 * The dead, seated.
 *
 * Six attempts at drawing the crowd failed the same way: any silhouette we
 * can afford — beads, domes, hills, outlined domes — is a *closed outline*,
 * and a closed outline reads as an object, never as people. There is also
 * only ~12vh of frame below the prose to work with, which is not enough to
 * render a body at all.
 *
 * So we stop drawing the crowd and draw the one thing a crowd does that a
 * room full of objects never does: look at you.
 *
 * Pairs of pinpricks, in rows, staggered, thinning and dimming with depth.
 * In the dark that reads as faces immediately — it is how every film since
 * the silents has staged a watching crowd, and it costs one gradient field
 * per row instead of a hundred elements.
 */

const hash = (i: number, salt: number) => {
  let h = (Math.imul(i + 1, 374761393) + Math.imul(salt, 668265263)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

type Row = {
  /** patrons across the frame */
  n: number;
  /** eye-to-eye spacing in vw (roughly a third of a face width) */
  span: number;
  /** eye radius in px */
  eye: number;
  /** how far up from the bottom of the frame the eye line sits, in vh */
  y: number;  /** 0 = nearest and brightest, 1 = nearly lost */
  dim: number;
  blur: number;
  /** fraction of this row that is actually lit */
  lit: number;
  salt: number;
};

const ROWS: Row[] = [
  { n: 5, span: 3.1, eye: 3.1, y: 0.6, dim: 0, blur: 0, lit: 0.72, salt: 11 },
  { n: 7, span: 2.3, eye: 2.5, y: 2.2, dim: 0.12, blur: 0.3, lit: 0.7, salt: 37 },
  { n: 9, span: 1.8, eye: 2.1, y: 3.7, dim: 0.24, blur: 0.6, lit: 0.68, salt: 71 },
  { n: 11, span: 1.5, eye: 1.75, y: 5.1, dim: 0.36, blur: 1, lit: 0.64, salt: 109 },
  { n: 14, span: 1.2, eye: 1.5, y: 6.4, dim: 0.5, blur: 1.4, lit: 0.6, salt: 151 },
];

function eyeField(row: Row, colour: string, scale: number): string {
  const layers: string[] = [];

  for (let i = 0; i < row.n; i++) {
    // a patron whose eyes are shut, or turned away, or simply not there
    if (hash(i, row.salt + 61) > row.lit) continue;

    const stagger = row.n % 2 === 0 ? 0.5 : 0;
    const cx = Math.min(
      98,
      Math.max(
        2,
        ((i + stagger) / row.n) * 100 +
          (hash(i, row.salt) - 0.5) * 2 * (row.span * 0.5),
      ),
    );

    // measured up from the floor of the frame, so a bigger y is further away
    const y = row.y + (hash(i, row.salt + 7) - 0.5) * 0.9;

    // the two of them, spaced by a third of a face — and never quite level,
    // because a head is never quite level
    for (const side of [-1, 1]) {
      const x = cx + side * (row.span / 2) * 0.34;
      const r =
        row.eye * scale * (0.85 + hash(i * 2 + side, row.salt + 13) * 0.3);
      const dy = y + side * (hash(i, row.salt + 29) - 0.5) * 0.28;
      layers.push(
        `radial-gradient(circle at ${x.toFixed(2)}% calc(100% - ${dy.toFixed(
          2,
        )}vh), ${colour} 0 ${r.toFixed(2)}px, transparent calc(${r.toFixed(
          2,
        )}px + 0.8px))`,
      );
    }
  }

  return layers.join(', ');
}

export const Audience = memo(function Audience() {
  const rows = useMemo(
    () =>
      ROWS.map((row, i) => ({
        ...row,
        glow: eyeField(
          row,
          `color-mix(in oklab, var(--accent) ${
            i === 0 ? 62 : 50 - i * 5
          }%, transparent)`,
          2.8,
        ),
        core: eyeField(
          row,
          `color-mix(in oklab, #fff ${i === 0 ? 62 : 48 - i * 5}%, var(--accent))`,
          1,
        ),
      })),
    [],
  );

  return (
    <div className="audience" aria-hidden="true">
      {rows.map((row) => (
        <div
          key={row.salt}
          className="audience__row"
          style={{
            opacity: Math.max(0, 1 - row.dim),
            filter: row.blur ? `blur(${row.blur}px)` : undefined,
          }}
        >
          <div className="audience__glow" style={{ backgroundImage: row.glow }} />
          <div className="audience__core" style={{ backgroundImage: row.core }} />
        </div>
      ))}
    </div>
  );
});
