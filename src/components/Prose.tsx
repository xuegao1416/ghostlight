import type { ReactNode } from 'react';
import type { Beat, Choice } from '../stage/types';
import { useTypewriter } from '../hooks/useTypewriter';

interface Props {
  beat: Beat;
  onReveal?: (p: number) => void;
  onChoose: (choice: Choice) => void;
  onContinue: () => void;
}

/** Split a leading quote/punctuation off the drop cap — `::first-letter` would
 *  otherwise swallow the opening “ and render it at 2.9em next to the letter. */
const LEADING = /^(["'“‘(]+)?([\s\S])/;

/** Minimal inline emphasis: *word* becomes <em>. The scripts are written in
 *  plain text so a director can edit them without touching markup. */
function emphasise(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;

  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push(<em key={`${keyBase}-e${n++}`}>{m[1]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Prose({ beat, onReveal, onChoose, onContinue }: Props) {
  const { shown, done, skip } = useTypewriter(beat.text, 46, onReveal);

  const paragraphs = shown.split('\n\n');
  const last = paragraphs.length - 1;

  return (
    <div className="script" onClick={() => !done && skip()}>
      <div className="script__direction">
        <span className="script__mark" aria-hidden="true" />
        {beat.direction}
      </div>

      <div className="script__body">
        {paragraphs.map((p, i) => {
          const isLead = i === 0;
          const m = isLead ? LEADING.exec(p) : null;

          return (
            <p key={i} className={isLead ? 'script__p script__p--lead' : 'script__p'}>
              {m ? (
                <>
                  {m[1] && <span className="script__quote">{m[1]}</span>}
                  <span className="script__cap">{m[2]}</span>
                  {emphasise(p.slice(m[0].length), `p${i}`)}
                </>
              ) : (
                emphasise(p, `p${i}`)
              )}
              {i === last && !done && <span className="caret" aria-hidden="true" />}
            </p>
          );
        })}
      </div>

      <div className="script__actions" data-ready={done}>
        {beat.choices ? (
          <ul className="options">
            {beat.choices.map((c, i) => (
              <li key={c.label} style={{ ['--i' as string]: i }}>
                <button
                  className="option"
                  disabled={!done}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChoose(c);
                  }}
                >
                  <span className="option__rule" aria-hidden="true" />
                  <span className="option__label">{c.label}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : beat.ending ? null : (
          <button
            className="continue"
            disabled={!done}
            onClick={(e) => {
              e.stopPropagation();
              onContinue();
            }}
          >
            <span>the light moves on</span>
            <span className="continue__arrow" aria-hidden="true">
              →
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
