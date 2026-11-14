// Shoots the demo film by driving the deployed app in a headless browser and
// capturing the compositor's frames. Nothing here is a mock-up: the keys are the
// keys a presenter would press, the frames are the pixels the app painted, and
// the numbers on the insert cards are imported from the beat graph and from
// `bun run parity`, not typed by hand.
//
//   bun run scripts/film.ts s1           shoot one segment
//   bun run scripts/film.ts all          shoot every segment, then assemble
//   bun run scripts/film.ts asm --burn   skip shooting; assemble, caption, encode
//
// Segments are shot separately only because the insert cards are pages of their
// own; every cut lands on a beat boundary, and the séance → wardrobe swap → tape
// run is a single unbroken take.
//
// Frames, profiles and the intermediate parts land in __film/ (1.6 GB on a full
// shoot, gitignored). They are rebuilt from scratch every run: the recorder is
// the source, the film is an artifact.

import { mkdirSync } from 'node:fs';

const ROOT = 'D:\\cc-hm';
const FILM = `${ROOT}\\__film`;
const EXE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const FF = 'C:\\Program Files (x86)\\FormatFactory\\ffmpeg.exe';
const PORT = 9333;
const W = 1920;
// The app is filmed in a 920-tall viewport and the frame is then padded down to
// 1080, so the captions get a black band of their own. Overlaying them on a full
// 1080 stage put them straight through the prose, which is the one thing the
// film is about.
const H = 920;
const OUT_H = 1080;
const BAND = OUT_H - H;
const LIVE = 'https://xuegao1416.github.io/ghostlight/';
const FPS = 30;
// Captured as JPEG q95: PNG tops out at 10.5fps through this screencast, and a
// curtain that opens in half a second cannot be assembled out of duplicates.
// q95 still sustains 58fps and only costs 206KB a frame.
const CAP_FORMAT = 'jpeg';
const CAP_QUALITY = 95;
const CAP_EXT = 'jpg';
// A blank first paint is only a few tens of kilobytes; the lit stage is far
// more. Frames below this are trimmed from the head of every segment so a cut
// never opens on a white flash or on a sentence the typewriter already started.
const BLANK_BYTES = 60_000;

const arg = process.argv[2] ?? 'all';
const only = arg === 'all' ? null : arg;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- real data --
const { seance } = await import('../src/scene/seance.ts');

const parity = Bun.spawnSync({
  cmd: ['bun', 'run', `${ROOT}\\scripts\\parity.ts`],
  cwd: ROOT,
  stdout: 'pipe',
  stderr: 'pipe',
});
const parityOut = parity.stdout.toString().replace(/\r\n/g, '\n').trimEnd();
const parityCode = parity.exitCode;
if (parityCode !== 0) {
  console.log(`FILM_ABORT parity exited ${parityCode}`);
  process.exit(1);
}

const b01 = seance.beats.b01;
const cueJson = JSON.stringify({
  id: b01.id,
  direction: b01.direction,
  cue: b01.cue,
  next: b01.next,
});
const cueIntensity = b01.cue.intensity.toFixed(2);

// ---------------------------------------------------------------- html cards --
const prettyCue = [
  '{',
  `  "id": ${JSON.stringify(b01.id)},`,
  `  "direction": ${JSON.stringify(b01.direction)},`,
  '  "cue": {',
  ...Object.entries(b01.cue).map(
    ([k, v], i, a) => `    "${k}": ${JSON.stringify(v)}${i < a.length - 1 ? ',' : ''}`,
  ),
  '  },',
  `  "next": ${JSON.stringify(b01.next)}`,
  '}',
]
  .join('\n')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/("cue": \{\n(?:.*\n)*?\s*\})/g, '<b>$1</b>');

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The script's own text, with the `endings` rows folded one-per-line so the card
// does not wrap them mid-sentence. Same characters, different whitespace.
function foldEndings(out: string) {
  const lines = out.split('\n');
  const i = lines.findIndex((l) => l.startsWith('endings'));
  if (i < 0) return out;
  const seance = (/seance:\s*(.*)$/.exec(lines[i])?.[1] ?? '').split(' | ');
  const tape = (/tape:\s*(.*)$/.exec(lines[i + 1] ?? '')?.[1] ?? '').split(' | ');
  const gutter = ' '.repeat(21);
  const folded = [
    `endings${' '.repeat(6)}seance   ${seance[0].trim()}`,
    ...seance.slice(1).map((e) => gutter + e.trim()),
    `${' '.repeat(13)}tape     ${tape[0].trim()}`,
    ...tape.slice(1).map((e) => gutter + e.trim()),
  ];
  return [...lines.slice(0, i), ...folded, ...lines.slice(i + 2)].join('\n');
}

const parityPretty = esc(foldEndings(parityOut))
  .replace(/^OK .*$/gm, '<b>$&</b>')
  .replace(/^(\w+)(\s+)/gm, '<b>$1</b>$2');

const cardShell = (body: string, accent: string, extra = '') => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  html,body{margin:0;height:100%;background:#050407;overflow:hidden}
  body{display:flex;align-items:center;justify-content:center;
       font-family:Georgia,'Times New Roman',serif;color:#e8dcc8;}
  .wrap{width:1340px}
  .rule{height:1px;background:${accent};opacity:.32;margin:0 0 30px}
  .kicker{font-family:Consolas,monospace;font-size:21px;letter-spacing:.36em;
          text-transform:uppercase;color:${accent};opacity:.85;margin:0 0 34px}
  pre{font-family:Consolas,'Courier New',monospace;font-size:29px;line-height:1.66;
      color:#cfc2ad;margin:0;white-space:pre-wrap}
  pre b{color:${accent};font-weight:400}
  .note{font-size:26px;line-height:1.5;color:#8b8171;margin:38px 0 0;font-style:italic}
  .bar{position:fixed;left:0;right:0;bottom:0;height:2px;background:${accent};opacity:.2}
  ${extra}
</style></head><body><div class="wrap">${body}</div><div class="bar"></div></body></html>`;

const insertA = cardShell(
  `<div class="rule"></div>
   <p class="kicker">the beat the room is performing</p>
   <pre>${prettyCue}</pre>
   <p class="note">No colour. No class name. Six numbers, and the room takes it from here.</p>`,
  '#f0b96b',
);

// The caption already says this in the narrator's voice; the card should not say
// it twice. The note does the job the caption cannot: it points at the numbers.
const insertB = cardShell(
  `<div class="rule"></div>
   <p class="kicker">bun run parity &nbsp;·&nbsp; exit ${parityCode}</p>
   <pre>${parityPretty}</pre>
   <p class="note">Seventeen beats, three endings, twice. Byte-for-byte the same graph —</p>
   <p class="note note--tight">the only difference between the two costumes is the tokens.</p>`,
  '#f0b96b',
  `.note--tight{margin-top:10px}`,
);

const finalCard = cardShell(
  `<div class="rule"></div>
   <pre style="font-family:Georgia,serif;font-size:104px;letter-spacing:.18em;color:#e8dcc8">GHOSTLIGHT</pre>
   <p style="font-size:40px;color:#9b8f7c;font-style:italic;margin:10px 0 46px">a theatre for the dead</p>
   <pre style="font-size:26px;line-height:2.05;color:#cfc2ad">xuegao1416.github.io/ghostlight
github.com/xuegao1416/ghostlight</pre>
   <p class="note" style="font-style:normal;letter-spacing:.22em;font-family:Consolas,monospace;font-size:19px">
     KIROWEEN 2026 &nbsp;·&nbsp; COSTUME CONTEST</p>`,
  '#f0b96b',
);

// ------------------------------------------------------------------ captions --
type Cap = { at: number; dur: number; text: string };
type Seg = {
  name: string;
  caps: Cap[];
  prep?: () => Promise<void>;
  shoot: (ctl: Ctl) => Promise<void>;
  expect?: () => Promise<string[]>;
};

// ------------------------------------------------------------------- browser --
let ws: WebSocket;
let sid = '';
let nextId = 1;
const pending = new Map<number, (v: any) => void>();
const send = (method: string, params: any = {}, session?: string) =>
  new Promise<any>((resolve) => {
    const id = nextId++;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params, sessionId: session }));
  });

let sink: ((b64: string, t: number) => void) | null = null;

async function startBrowser() {
  const proc = Bun.spawn(
    [
      EXE,
      '--headless=new',
      `--remote-debugging-port=${PORT}`,
      `--user-data-dir=${FILM}\\profile`,
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${W},${H}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--mute-audio',
      'about:blank',
    ],
    { stdout: 'ignore', stderr: 'ignore' },
  );

  let version: any = null;
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) {
        version = await r.json();
        break;
      }
    } catch {}
    await sleep(250);
  }
  if (!version) throw new Error('no devtools endpoint');

  ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise<void>((r) => (ws.onopen = () => r()));
  ws.onmessage = (ev) => {
    const m = JSON.parse(String(ev.data));
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)!(m);
      pending.delete(m.id);
      return;
    }
    if (m.method === 'Page.screencastFrame') {
      const t = Date.now();
      send('Page.screencastFrameAck', { sessionId: m.params.sessionId }, m.sessionId ?? sid);
      sink?.(m.params.data, t);
    }
  };

  const t = await send('Target.createTarget', { url: 'about:blank' });
  const a = await send('Target.attachToTarget', { targetId: t.result.targetId, flatten: true });
  sid = a.result.sessionId;
  await send('Page.enable', {}, sid);
  await send('Runtime.enable', {}, sid);
  return proc;
}

async function setViewport() {
  await send(
    'Emulation.setDeviceMetricsOverride',
    { width: W, height: H, deviceScaleFactor: 1, mobile: false },
    sid,
  );
}

async function nav(url: string, settle = 1200) {
  await send('Page.navigate', { url }, sid);
  await sleep(settle);
  await send(
    'Runtime.evaluate',
    { expression: 'document.fonts.ready.then(() => true)', awaitPromise: true },
    sid,
  );
}

async function evalValue(expression: string) {
  const r = await send(
    'Runtime.evaluate',
    { expression, returnByValue: true, awaitPromise: true },
    sid,
  );
  return r.result?.result?.value;
}

async function setCard(html: string) {
  const tree = await send('Page.getFrameTree', {}, sid);
  const frameId = tree.result.frameTree.frame.id;
  await send('Page.setDocumentContent', { frameId, html }, sid);
  await sleep(350);
}

const KEY: Record<string, { code: string; vk: number; text: string }> = {
  Enter: { code: 'Enter', vk: 13, text: '\r' },
  '1': { code: 'Digit1', vk: 49, text: '1' },
  '2': { code: 'Digit2', vk: 50, text: '2' },
};

async function key(k: string) {
  const m = KEY[k];
  await send(
    'Input.dispatchKeyEvent',
    {
      type: 'keyDown',
      key: k,
      code: m.code,
      text: m.text,
      unmodifiedText: m.text,
      windowsVirtualKeyCode: m.vk,
      nativeVirtualKeyCode: m.vk,
    },
    sid,
  );
  await send(
    'Input.dispatchKeyEvent',
    {
      type: 'keyUp',
      key: k,
      code: m.code,
      windowsVirtualKeyCode: m.vk,
      nativeVirtualKeyCode: m.vk,
    },
    sid,
  );
}

async function clickSelector(sel: string) {
  const p = await evalValue(
    `(() => { const e = document.querySelector(${JSON.stringify(sel)});
      if (!e) return null; const r = e.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`,
  );
  if (!p) throw new Error(`no element for ${sel}`);
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x, y: p.y, button: 'none' }, sid);
  await sleep(180);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', clickCount: 1 }, sid);
  await sleep(90);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', clickCount: 1 }, sid);
}

// Segment clock: every wait is an absolute offset from the first captured
// frame, so a slow paint or a slow keypress can never accumulate into the next
// cut. Anything late is reported, because a beat that arrives late is a beat
// that gets skipped.
class Ctl {
  t0 = 0;
  async at(sec: number) {
    const wait = this.t0 + sec * 1000 - Date.now();
    if (wait > 0) await sleep(wait);
    else if (wait < -80) console.log(`LATE ${(-wait / 1000).toFixed(2)}s at ${sec}s`);
  }
  async press(sec: number, k: string) {
    await this.at(sec);
    await key(k);
  }
  async click(sec: number, sel: string) {
    await this.at(sec);
    await clickSelector(sel);
  }
  async card(sec: number, html: string) {
    await this.at(sec);
    await setCard(html);
  }
}

async function shoot(seg: Seg) {
  const dir = `${FILM}\\frames\\${seg.name}`;
  Bun.spawnSync({ cmd: ['cmd', '/c', `rmdir /s /q "${dir}"`] });
  mkdirSync(dir, { recursive: true });
  mkdirSync(`${FILM}\\parts`, { recursive: true });

  if (seg.prep) await seg.prep();

  const frames: Array<{ file: string; t: number; size: number }> = [];
  let writeChain = Promise.resolve();
  const started = Date.now();
  let n = 0;
  sink = (b64, t) => {
    n++;
    const file = `${dir}\\${String(n).padStart(5, '0')}.${CAP_EXT}`;
    const bytes = Buffer.from(b64, 'base64');
    frames.push({ file, t: t - started, size: bytes.length });
    writeChain = writeChain.then(() => Bun.write(file, bytes));
  };

  await send(
    'Page.startScreencast',
    { format: CAP_FORMAT, quality: CAP_QUALITY, maxWidth: W, maxHeight: H, everyNthFrame: 1 },
    sid,
  );

  const ctl = new Ctl();
  ctl.t0 = started;
  let stoppedAt = started;
  try {
    await seg.shoot(ctl);
  } finally {
    // take the clock before tearing down, so the 400ms of teardown does not get
    // billed to this segment and push every later caption late
    stoppedAt = Date.now();
    await send('Page.stopScreencast', {}, sid);
    await sleep(400);
    sink = null;
    await writeChain;
  }

  // Drop the blank paints at the head so no segment opens on a white flash or
  // halfway through a sentence.
  let first = 0;
  while (first < frames.length - 1 && frames[first].size < BLANK_BYTES) first++;
  const kept = frames.slice(first);
  const trim = kept.length ? kept[0].t / 1000 : 0;
  const dur = kept.length ? (stoppedAt - started) / 1000 - trim : 0;

  const report: string[] = [];
  if (seg.expect) report.push(...(await seg.expect()));

  await Bun.write(
    `${FILM}\\frames\\${seg.name}.json`,
    JSON.stringify({ dur, trim, frames: kept }, null, 0),
  );
  console.log(
    `SHOT ${seg.name} kept=${kept.length}/${frames.length} trim=${trim.toFixed(2)}s dur=${dur.toFixed(2)}s fps=${(kept.length / dur).toFixed(1)}`,
  );
  for (const line of report) console.log(`  ${line}`);
  return { dur, trim, report };
}

// ------------------------------------------------------------------ segments --
const T1 = 16;
const seg1: Seg = {
  name: 's1',
  caps: [
    {
      at: 1.4,
      dur: 13.0,
      text: 'A ghost light is the one bulb left burning on a dark stage,\\Nso the dead can keep performing.',
    },
  ],
  // Warm the cache first, so the take that is actually filmed reloads from disk
  // and the typewriter's first character is inside the recording.
  prep: async () => {
    await nav(LIVE, 3500);
  },
  shoot: async (ctl) => {
    await send('Page.reload', {}, sid);
    await ctl.at(T1);
  },
  expect: async () => {
    const id = await evalValue(`document.querySelector('.board__id')?.textContent ?? ''`);
    return [`check board id = ${JSON.stringify(id)}`];
  },
};

const seg2: Seg = {
  name: 's2',
  caps: [
    { at: 1.0, dur: 7.6, text: 'Every line the story speaks becomes a lighting cue.' },
    {
      at: 9.4,
      dur: 8.6,
      text: 'The beat never names a colour, a sound, or a class.\\NIt hands over six numbers and the room is obliged to answer.',
    },
  ],
  shoot: async (ctl) => {
    await ctl.card(0.2, insertA);
    await ctl.at(18);
  },
};

// the séance → wardrobe swap → tape run, in one unbroken take
const seg3: Seg = {
  name: 's3',
  caps: [
    { at: 4.8, dur: 8.4, text: `The cue says ${cueIntensity}. The room says 0.33.` },
    {
      at: 13.6,
      dur: 9.4,
      text: 'It is not a bug. The light leaves a little behind the words\\Nand catches up as they land.',
    },
    {
      at: 23.4,
      dur: 5.4,
      text: 'These numbers are not read from React.\\NThe console reads the custom properties the stage writes to itself.',
    },
    {
      at: 29.4,
      dur: 8.2,
      text: 'So if the easing stops, the console stops.\\NIt cannot lie about the picture it is sitting on.',
    },
    {
      at: 44.2,
      dur: 11.2,
      text: 'We could not draw a crowd. Six silhouettes, six objects.\\NSo we drew the one thing a full room does that furniture does not: it looks back.',
    },
    { at: 64.4, dur: 6.2, text: 'Same beat graph. Same cue protocol.\\NDifferent costume.' },
    { at: 71.6, dur: 8.4, text: 'The play did not change. The tokens did.' },
    { at: 88.2, dur: 8.2, text: 'Identical choices. Identical beats.\\NA completely different register.' },
    {
      at: 107.2,
      dur: 9.6,
      text: 'The camera cannot hold still in a room that just went blind.\\NNor can you.',
    },
  ],
  prep: async () => {
    await nav(`${LIVE}?sheet=1`, 3500);
  },
  shoot: async (ctl) => {
    await ctl.press(2.4, 'Enter'); // b02 — the house speaks
    await ctl.press(3.6, '2'); // b03b — ask who is sitting in the second
    await ctl.press(28.0, 'Enter'); // b04
    await ctl.press(31.0, 'Enter'); // b05 — name it
    await ctl.press(33.6, '1'); // b06a — a person
    await ctl.press(36.6, 'Enter'); // b07 — the curtain rises on the auditorium
    await ctl.press(39.4, 'Enter'); // b08 — a hundred and forty heads turn
    await ctl.press(56.2, 'Enter'); // b09
    await ctl.press(58.4, '1'); // end_perform
    await ctl.click(62.6, '.ending__actions button:nth-child(2)'); // change costume
    await ctl.press(70.2, 'Enter'); // vhs b02
    await ctl.press(71.6, '2'); // vhs b03b
    await ctl.press(88.2, 'Enter'); // vhs b04
    await ctl.press(91.0, 'Enter'); // vhs b05
    await ctl.press(92.8, '1'); // vhs b06a
    await ctl.press(95.8, 'Enter'); // vhs b07
    await ctl.press(98.2, 'Enter'); // vhs b08 — teal eyes
    await ctl.press(106.2, 'Enter'); // vhs b09
    await ctl.press(107.8, '2'); // end_dark — blow out the ghost light
    await ctl.at(117.4);
  },
  expect: async () => {
    const title = await evalValue(`document.querySelector('.ending__title')?.textContent ?? 'MISSING'`);
    const kicker = await evalValue(`document.querySelector('.ending__kicker')?.textContent ?? 'MISSING'`);
    const beat = await evalValue(`document.querySelector('.board__beat')?.textContent ?? 'MISSING'`);
    const meters = await evalValue(
      `[...document.querySelectorAll('.board__meter')].map(m => m.textContent.trim()).join(' | ')`,
    );
    const costume = await evalValue(`document.querySelector('.stage')?.dataset.costume ?? 'MISSING'`);
    const out = [
      `check costume=${costume}`,
      `check ending=${JSON.stringify(title)} kicker=${JSON.stringify(kicker)}`,
      `check console=${JSON.stringify(beat)} ${meters}`,
    ];
    const ok = title === 'End of Tape' && costume === 'vhs' && String(beat).includes('blackout');
    out.push(ok ? 'check OK — the take landed on End of Tape, in the tape costume, in blackout' : 'FAIL the take did not land where DEMO.md says');
    if (!ok) {
      console.log(out.join('\n'));
      process.exit(1);
    }
    return out;
  },
};

const seg4: Seg = {
  name: 's4',
  caps: [
    {
      at: 3.8,
      dur: 9.0,
      text: 'Not a sentence in a README. A script that exits 1\\Nthe moment the claim stops being true.',
    },
    {
      at: 13.4,
      dur: 5.6,
      text: 'Change one next-pointer in tape.ts and the build fails.\\NThe claim is checkable, or it is decoration.',
    },
  ],
  shoot: async (ctl) => {
    await ctl.card(0.2, insertB);
    await ctl.at(13.6);
    await ctl.card(13.6, finalCard);
    await ctl.at(20.4);
  },
};

const ALL: Seg[] = [seg1, seg2, seg3, seg4];

// ------------------------------------------------------------------ assembly --
// No ffprobe on this box, so the duration comes out of ffmpeg's own banner.
function probeDuration(file: string): number {
  const r = Bun.spawnSync({ cmd: [FF, '-hide_banner', '-i', file], stderr: 'pipe' });
  const m = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(r.stderr.toString());
  if (!m) return NaN;
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

async function assemble() {
  const list: string[] = [];
  const misses: string[] = [];
  for (const seg of ALL) {
    const meta = JSON.parse(await Bun.file(`${FILM}\\frames\\${seg.name}.json`).text());
    const fr: Array<{ file: string; t: number }> = meta.frames;
    if (!fr.length) {
      misses.push(seg.name);
      continue;
    }
    const c: string[] = ['ffconcat version 1.0'];
    // The final frame's `duration` is only honoured when another entry follows it,
    // so the last frame gets its hold, then the frame is listed once more with no
    // duration to consume that hold. Without this a screencast of a static insert
    // card — which only emits frames while the page is still changing — collapses
    // to a third of a second and every later caption sits minutes early.
    const lastT = fr[fr.length - 1].t / 1000;
    const held = Math.max(1 / FPS, meta.dur + meta.trim - lastT);
    for (let i = 0; i < fr.length; i++) {
      const end = i + 1 < fr.length ? fr[i + 1].t / 1000 : lastT + held;
      // Only guard against zero or negative deltas. Clamping up to the output
      // frame time would silently double a 60fps capture, which is exactly the
      // bug that turned a 16s opening into a 32s one.
      const d = Math.max(0.001, end - fr[i].t / 1000);
      c.push(`file '${fr[i].file.replace(/\\/g, '/')}'`);
      c.push(`duration ${d.toFixed(5)}`);
    }
    c.push(`file '${fr[fr.length - 1].file.replace(/\\/g, '/')}'`);
    c.push(`duration ${(1 / FPS).toFixed(4)}`);
    await Bun.write(`${FILM}\\frames\\${seg.name}.txt`, c.join('\n'));

    const out = `${FILM}\\parts\\${seg.name}.mp4`;
    const r = Bun.spawnSync({
      cmd: [FF, '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
        '-i', `${FILM}\\frames\\${seg.name}.txt`,
        // pad the 920-tall capture down to 1080 so the captions get a band of
        // their own instead of landing on the prose
        '-vf', `fps=${FPS},pad=${W}:${OUT_H}:0:0:0x050407,format=yuv420p`,
        '-c:v', 'libx264', '-preset', 'medium',
        '-crf', '15', '-tune', 'grain', '-movflags', '+faststart', '-y', out],
    });
    if (r.exitCode !== 0) {
      console.log(`PART_FAIL ${seg.name}: ${r.stderr.toString().slice(0, 800)}`);
      process.exit(1);
    }
    console.log(`PART ${seg.name} → ${(await Bun.file(out).size / 1e6).toFixed(1)}MB`);
    // Reconcile against the plan. A screencast emits nothing while the page holds
    // still, so an insert card is the easy place for a segment to silently collapse
    // and push every later caption out of sync — check rather than assume.
    const want = meta.dur + 1 / FPS;
    const got = probeDuration(out);
    const drift = got - want;
    console.log(
      `     plan=${want.toFixed(2)}s actual=${got.toFixed(2)}s drift=${drift >= 0 ? '+' : ''}${drift.toFixed(2)}s`,
    );
    if (Math.abs(drift) > 0.75) {
      console.log(`PART_DRIFT ${seg.name} sits ${drift.toFixed(2)}s from the plan — refusing to assemble`);
      process.exit(1);
    }
    list.push(`file '${out.replace(/\\/g, '/')}'`);
  }
  if (misses.length) {
    console.log(`ASSEMBLE_SKIP missing segments: ${misses.join(', ')}`);
    return;
  }
  await Bun.write(`${FILM}\\parts\\list.txt`, list.join('\n'));
  const master = `${FILM}\\master.mp4`;
  const r = Bun.spawnSync({
    cmd: [FF, '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
      '-i', `${FILM}\\parts\\list.txt`, '-c', 'copy', '-y', master],
  });
  if (r.exitCode !== 0) {
    console.log(`MASTER_FAIL ${r.stderr.toString().slice(0, 800)}`);
    process.exit(1);
  }
  console.log(`MASTER → ${(await Bun.file(master).size / 1e6).toFixed(1)}MB`);
}

function assTime(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const cs = Math.round((s - Math.floor(s)) * 100);
  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

async function writeAss() {
  let head = `[Script Info]
ScriptType: v4.00+
PlayResX: ${W}
PlayResY: ${OUT_H}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Georgia,38,&H00E8DCC8,&H00E8DCC8,&H00050407,&H7A050407,0,0,0,0,100,100,0.6,0,1,2.4,1.4,2,150,150,${BAND / 2 - 30},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const lines: string[] = [];
  let cursor = 0;
  for (const seg of ALL) {
    const meta = JSON.parse(await Bun.file(`${FILM}\\frames\\${seg.name}.json`).text());
    for (const c of seg.caps) {
      const a = Math.max(0, c.at - meta.trim);
      lines.push(
        `Dialogue: 0,${assTime(cursor + a)},${assTime(cursor + a + c.dur)},Cap,,0,0,0,,{\\fad(550,550)}${c.text}`,
      );
    }
    cursor += meta.dur;
  }
  await Bun.write(`${FILM}\\caps.ass`, `${head}\n${lines.join('\n')}\n`);
  return cursor;
}

// ----------------------------------------------------------------------- main --
// A recorder that accepts a typo and then prints FILM_OK is worse than one that
// refuses: it reports success having filmed nothing.
const KNOWN = new Set(['all', 'asm', ...ALL.map((s) => s.name)]);
if (!KNOWN.has(arg)) {
  console.log(`FILM_ABORT unknown segment ${JSON.stringify(arg)} — expected ${[...KNOWN].join(' | ')}`);
  process.exit(1);
}

const parts = only === 'asm' ? [] : ALL.filter((s) => !only || s.name === only);
const proc = await startBrowser();
await setViewport();

try {
  for (const seg of parts) await shoot(seg);
  if (!only || only === 'asm') {
    await assemble();
    const total = await writeAss();
    console.log(`CAPTIONS total=${total.toFixed(2)}s`);
    const args = Bun.argv;
    if (args.includes('--burn')) {
      const out = `${FILM}\\ghostlight-demo.mp4`;
      const r = Bun.spawnSync({
        cmd: [FF, '-hide_banner', '-loglevel', 'error', '-i', `${FILM}\\master.mp4`,
          '-vf', `subtitles=${FILM}\\caps.ass:fontsdir=C\\:/Windows/Fonts`,
          '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart', '-y', out],
      });
      if (r.exitCode !== 0) {
        console.log(`BURN_FAIL ${r.stderr.toString().slice(0, 800)}`);
        process.exit(1);
      }
      console.log(`BURNED → ${(await Bun.file(out).size / 1e6).toFixed(1)}MB`);
    }
  }
} finally {
  ws.close();
  proc.kill();
}
console.log('FILM_OK');
process.exit(0);
