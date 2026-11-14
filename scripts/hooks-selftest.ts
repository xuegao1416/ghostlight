#!/usr/bin/env bun
/**
 * hooks-selftest
 *
 * `.kiro/hooks/*.json` is a declaration, not a promise. A hook that never fires
 * is indistinguishable from a hook that passes, which is the most expensive kind
 * of silence. This script makes the declaration falsifiable on two axes:
 *
 *   1. SHAPE     — the file parses, every hook names a trigger Kiro actually
 *                  ships, every action has the field its type requires.
 *   2. MATCHER   — the regex is run against real paths from this repository, in
 *                  both separator styles. A matcher tuned for POSIX silently
 *                  stops matching when the editor hands over `src\scene\seance.ts`,
 *                  and the gate goes quiet instead of going red.
 *   3. EXECUTION — every `command` hook is run verbatim, in this working
 *                  directory, with its own timeout. The exit code is the result;
 *                  nothing here is inferred.
 *
 * `agent` hooks cannot be executed from a terminal — they need a live Kiro
 * session to inject a prompt into. They are checked for shape only, and this
 * script says so out loud rather than pretending they ran.
 *
 * Usage:  bun run scripts/hooks-selftest.ts
 * Exit:   0 = every hook is shaped correctly, matches what it claims to match,
 *              and every runnable command exits 0.
 *         1 = something above is false.
 */

type CommandAction = { type: 'command'; command: string };
type AgentAction = { type: 'agent'; prompt: string };
type Action = CommandAction | AgentAction;

type Hook = {
  name: string;
  description?: string;
  trigger: string;
  matcher?: string;
  action: Action;
  timeout?: number;
  enabled?: boolean;
};

type HookFile = { version: string; hooks: Hook[] };

/** Triggers Kiro documents for IDE and CLI V3. `Manual` is CLI-V3/Web only and
 *  is deliberately not in a FileSave-style config like this one. */
const TRIGGERS = new Set([
  'PromptSubmit',
  'AgentStop',
  'SessionStart',
  'PreToolUse',
  'PostToolUse',
  'FileCreate',
  'FileSave',
  'FileDelete',
  'PreTaskExecution',
  'PostTaskExecution',
  'PreCompact',
  'PostCompact',
  'Manual',
]);

/**
 * Fixtures: the paths a hook realistically receives, in the two spellings that
 * occur on Windows checkouts. `want` is the answer the matcher must give.
 *
 * These are expectations about intent, written down so they cannot quietly
 * drift: the whole point is that a matcher which stops matching fails here
 * instead of shipping.
 */
type Fixture = { path: string; want: boolean };

const FIXTURES: Record<string, Fixture[]> = {
  'typecheck on source save': [
    { path: 'src/App.tsx', want: true },
    { path: 'src\\App.tsx', want: true },
    { path: 'src/hooks/useCueStage.ts', want: true },
    { path: 'src\\scene\\tape.ts', want: true },
    { path: 'src/styles/stage.css', want: false },
    { path: 'README.md', want: false },
    { path: 'package.json', want: false },
  ],
  'costume parity on scene save': [
    { path: 'src/scene/seance.ts', want: true },
    { path: 'src\\scene\\tape.ts', want: true },
    { path: 'src\\scene\\seance.ts', want: true },
    { path: 'src/stage/types.ts', want: false },
    { path: 'src\\stage\\types.ts', want: false },
    { path: 'src/scene-notes.md', want: false },
    { path: 'README.md', want: false },
  ],
  'stage contract review on source save': [
    { path: 'src/hooks/useCueStage.ts', want: true },
    { path: 'src\\styles\\stage.css', want: true },
    { path: 'src/components/Prose.tsx', want: true },
    { path: 'src\\components\\Audience.tsx', want: true },
    { path: 'src/App.tsx', want: false },
    { path: 'src\\scene\\seance.ts', want: false },
    { path: 'README.md', want: false },
  ],
};

const SHELL = process.platform === 'win32' ? ['cmd', '/c'] : ['sh', '-c'];

const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

const problems: string[] = [];
const fail = (hook: string, msg: string) => problems.push(`${hook}: ${msg}`);

const label = (s: string) => s.padEnd(34, '.');

// ── 1. parse ────────────────────────────────────────────────────────────────
const path = '.kiro/hooks/stage-integrity.json';
let file: HookFile;
try {
  file = JSON.parse(await Bun.file(path).text()) as HookFile;
} catch (err) {
  console.error(`${red('FAIL')} ${path} does not parse: ${(err as Error).message}`);
  process.exit(1);
}

if (file.version !== 'v1') {
  console.error(`${red('FAIL')} ${path}: version must be "v1", found ${JSON.stringify(file.version)}`);
  process.exit(1);
}

const hooks = file.hooks ?? [];
const commandHooks = hooks.filter((h): h is Hook & { action: CommandAction } => h.action?.type === 'command');
const agentHooks = hooks.filter((h): h is Hook & { action: AgentAction } => h.action?.type === 'agent');

console.log(`hook file ........... ${path}`);
console.log(`hooks ............... ${hooks.length} (${commandHooks.length} command, ${agentHooks.length} agent)`);
console.log('');

// ── 2. shape ────────────────────────────────────────────────────────────────
const names = new Set<string>();
for (const hook of hooks) {
  const where = hook.name || '(unnamed hook)';
  if (!hook.name?.trim()) fail(where, 'name is required');
  if (names.has(hook.name)) fail(where, 'name is not unique');
  names.add(hook.name);

  if (!TRIGGERS.has(hook.trigger)) fail(where, `unknown trigger "${hook.trigger}"`);
  if (hook.enabled !== undefined && typeof hook.enabled !== 'boolean') {
    fail(where, 'enabled must be a boolean');
  }
  if (hook.timeout !== undefined) {
    if (typeof hook.timeout !== 'number' || !Number.isFinite(hook.timeout) || hook.timeout <= 0) {
      fail(where, 'timeout must be a positive number of seconds');
    }
  }
  if (!hook.action || typeof hook.action !== 'object') {
    fail(where, 'action is required');
    continue;
  }
  if (hook.action.type === 'command' && !hook.action.command?.trim()) {
    fail(where, 'command action needs a non-empty command');
  }
  if (hook.action.type === 'agent' && !hook.action.prompt?.trim()) {
    fail(where, 'agent action needs a non-empty prompt');
  }
  if (hook.action.type !== 'command' && hook.action.type !== 'agent') {
    fail(where, `unknown action type "${(hook.action as { type?: string }).type}"`);
  }
}

console.log(
  problems.length === 0
    ? `${green('ok')}   ${label('shape')} ${hooks.length} hooks, every trigger and action valid`
    : `${red('FAIL')} ${label('shape')} ${problems.length} problem(s)`,
);
console.log('');

// ── 3. matchers against real paths ──────────────────────────────────────────
let matcherFailures = 0;
for (const hook of hooks) {
  if (!hook.matcher) {
    console.log(`${dim('--')}   ${label(hook.name)} no matcher (fires on every ${hook.trigger})`);
    continue;
  }
  let re: RegExp;
  try {
    re = new RegExp(hook.matcher);
  } catch (err) {
    console.log(`${red('FAIL')} ${label(hook.name)} matcher does not compile: ${(err as Error).message}`);
    matcherFailures++;
    continue;
  }

  const fixtures = FIXTURES[hook.name];
  if (!fixtures) {
    console.log(`${dim('??')}   ${label(hook.name)} compiles, but no fixtures describe its intent`);
    continue;
  }

  const wrong = fixtures.filter((f) => re.test(f.path) !== f.want);
  if (wrong.length === 0) {
    console.log(`${green('ok')}   ${label(hook.name)} ${fixtures.length}/${fixtures.length} fixtures agree`);
  } else {
    matcherFailures++;
    console.log(`${red('FAIL')} ${label(hook.name)} ${wrong.length}/${fixtures.length} fixtures disagree`);
    for (const f of wrong) {
      console.log(`       expected ${f.want ? 'match' : 'no match'} for ${JSON.stringify(f.path)} — got the opposite`);
    }
  }
}
console.log('');

// ── 4. run every command hook, verbatim ─────────────────────────────────────
let runFailures = 0;
for (const hook of commandHooks) {
  const started = performance.now();
  const proc = Bun.spawnSync({
    cmd: [...SHELL, hook.action.command],
    cwd: process.cwd(),
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: (hook.timeout ?? 60) * 1000,
  });
  const seconds = ((performance.now() - started) / 1000).toFixed(1);
  const out = `${new TextDecoder().decode(proc.stdout)}${new TextDecoder().decode(proc.stderr)}`.trim();
  const tail = out.split('\n').filter(Boolean).slice(-1)[0] ?? '';

  if (proc.exitCode === 0) {
    console.log(`${green('ok')}   ${label(hook.name)} exit 0 in ${seconds}s  ${dim(tail.slice(0, 96))}`);
  } else {
    runFailures++;
    console.log(`${red('FAIL')} ${label(hook.name)} exit ${proc.exitCode} in ${seconds}s`);
    for (const line of out.split('\n').filter(Boolean).slice(-12)) console.log(`       ${line}`);
  }
}

if (agentHooks.length) {
  console.log('');
  for (const hook of agentHooks) {
    console.log(
      `${dim('--')}   ${label(hook.name)} not runnable here — agent action needs a live Kiro session`,
    );
  }
}

// ── 5. verdict ──────────────────────────────────────────────────────────────
console.log('');
if (problems.length || matcherFailures || runFailures) {
  console.error(
    red(
      `FAILED — ${problems.length} shape, ${matcherFailures} matcher, ${runFailures} execution problem(s).`,
    ),
  );
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}

console.log(
  green(
    `OK — ${hooks.length} hooks declared, ${commandHooks.length} commands executed successfully, ` +
      `${Object.keys(FIXTURES).length} matchers agree with their fixtures. ` +
      `${agentHooks.length} agent hook(s) need a live Kiro session and are not executed here.`,
  ),
);
