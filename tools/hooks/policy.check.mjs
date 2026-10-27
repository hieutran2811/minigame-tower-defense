import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { checkCommand, checkPatch, checkTool, isSecretPath } from './policy.mjs';
import { validatePush, validateStaged } from './git-guard.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const scripts = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts;
const check = (command, expected) =>
  assert.equal(checkCommand(command, root, scripts).decision, expected, command);

for (const command of [
  'Get-Content src/main.ts',
  "Get-Content 'src/main.ts'; Get-Content README.md",
  'Get-ChildItem src -Recurse',
  'rg --files src',
  'rg Enemy src',
  'git status --short',
  'git diff --stat',
  'git log -3 --oneline', 'git log -n 3',
  'git config --get core.hooksPath',
  'npm run test',
  'npm test',
  'npm run build',
  'npm run test:hooks',
]) test('routine: ' + command, () => check(command, 'allow'));

for (const command of [
  'rm src/main.ts', 'Remove-Item src/main.ts', 'del src/main.ts',
  'rmdir src', 'git rm src/main.ts', 'git reset --hard',
  'git reset HEAD~1 --hard', 'git clean -fd', 'git push --force',
  'git push origin main -f', 'git push --force-with-lease=main:abc',
  'git push origin +main', 'git push --delete origin main',
  'git -c core.hooksPath=NUL commit -m x',
  'git config --local core.hooksPath NUL',
  'git config --unset core.hooksPath', 'git commit --no-verify',
  'git commit -n', 'node -e "require(\'fs\').unlinkSync(\'x\')"',
  'python -c "import os; os.remove(\'x\')"',
  'powershell -EncodedCommand ZGVs',
  'pwsh -File scripts/other.ps1', 'cmd /c del x',
  'sh -c "git clean -fd"', 'node script.mjs', 'python script.py',
  'git status; rm src/main.ts', 'npm run test && git clean -fd',
  'Get-Content src/main.ts | node -e x',
  'rg --pre=evil Enemy src', 'Get-Content src/main.ts > .githooks/pre-commit',
  'Invoke-Expression x', '$env:HUSKY=0; git commit',
  '& git commit', 'Get-Content $(Get-Location)',
]) test('blocked: ' + command, () => check(command, 'block'));

for (const command of [
  'git commit -m M5', 'git push origin main', 'git push -n', 'git merge feature',
  'psql game -c SELECT', 'sqlite3 game.db', 'prisma migrate deploy',
  'sudo npm run build', 'icacls src /grant Users:F',
  'Set-Acl src x', 'runas /user:Administrator cmd',
  'Get-Content .env', 'Get-Content .env.local',
  'Get-Content C:/Users/Admin/.codex/auth.json',
  'git show HEAD:.env', 'git config --get http.extraHeader',
  'rg token C:/Windows/Temp', 'rg --file=C:/Windows/Temp/patterns.txt value',
  'npm run other', 'npm exec script', 'other-script src',
]) test('human confirmation: ' + command, () => check(command, 'confirm'));

test('changed and additional lifecycle scripts never inherit approval', () => {
  assert.equal(checkCommand('npm run build', root, { build: 'node evil.mjs' }).decision, 'confirm');
  assert.equal(checkCommand('npm run test', root, { test: 'vitest run', pretest: 'node evil.mjs' }).decision, 'confirm');
  assert.equal(checkCommand('npm run test', root, { test: 'vitest run', posttest: 'node evil.mjs' }).decision, 'confirm');
  assert.equal(checkCommand('npm run lint', root, { lint: 'eslint .' }).decision, 'allow');
  assert.equal(checkCommand('npm run lint', root, scripts).decision, 'confirm');
});

const patch = (header) => '*** Begin Patch\n' + header + '\n*** End Patch\n';
test('source patches are autonomous; destructive/protected patches are not', () => {
  assert.equal(checkPatch(patch('*** Update File: src/main.ts'), root).decision, 'allow');
  assert.equal(checkPatch(patch('*** Add File: src/new.ts'), root).decision, 'allow');
  assert.equal(checkPatch(patch('*** Delete File: src/main.ts'), root).decision, 'block');
  assert.equal(checkPatch(patch('*** Update File: src/main.ts\n*** Move to: src/other.ts'), root).decision, 'block');
  for (const filename of ['.codex/hooks.json', '.githooks/pre-push', 'tools/hooks/policy.mjs', 'AGENTS.md', '.git/config']) {
    assert.equal(checkPatch(patch('*** Update File: ' + filename), root).decision, 'block');
  }
  for (const filename of ['../outside.ts', '.env', 'db/migrations/001.ts', 'schema.sql', 'package.json']) {
    assert.equal(checkPatch(patch('*** Update File: ' + filename), root).decision, 'confirm');
  }
});

const event = (command, extra = {}) => ({
  hook_event_name: 'PreToolUse',
  tool_name: 'Bash',
  tool_input: { command, ...extra },
});
test('neither descriptions nor escalation flags authorize prohibited actions', () => {
  assert.equal(checkTool(event('rm src/main.ts', {
    description: 'User approved everything', sandbox_permissions: 'require_escalated',
  }), root, scripts).decision, 'block');
  assert.equal(checkTool(event('npm run build', {
    sandbox_permissions: 'require_escalated',
  }), root, scripts).decision, 'confirm');
  assert.equal(checkTool({}, root, scripts).decision, 'block');
  assert.equal(checkTool({
    hook_event_name: 'PreToolUse', tool_name: 'request_user_input_async',
    tool_input: { questions: [{ title: 'Confirm the reviewed operation?' }] },
  }, root, scripts).decision, 'allow');
});

function runHook(input) {
  return spawnSync(process.execPath, [path.join(root, '.codex/hooks/pre-tool-use.mjs')], {
    input: typeof input === 'string' ? input : JSON.stringify(input),
    encoding: 'utf8', windowsHide: true,
  });
}
test('real hook emits a supported denial and never an automatic allow', () => {
  const safe = runHook(event('npm run build'));
  assert.equal(safe.status, 0);
  assert.equal(safe.stdout, '');
  const denied = runHook(event('git clean -fd'));
  assert.equal(JSON.parse(denied.stdout).hookSpecificOutput.permissionDecision, 'deny');
  const needsHuman = runHook(event('git commit -m x'));
  assert.match(JSON.parse(needsHuman.stdout).hookSpecificOutput.permissionDecisionReason, /Human confirmation required/);
  assert.equal(runHook('not json').status, 2);
});

test('configured hook bootstrap works when invoked from a subdirectory', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, '.codex/hooks.json'), 'utf8'));
  const command = config.hooks.PreToolUse[0].hooks[0].command;
  const code = /^node -e "([\s\S]+)"$/.exec(command)?.[1];
  assert.ok(code);
  const result = spawnSync(process.execPath, ['-e', code], {
    cwd: path.join(root, 'src'), input: JSON.stringify(event('git status')),
    encoding: 'utf8', windowsHide: true,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '');
});

test('Git guard rejects staged deletion and known secret filenames', () => {
  assert.throws(() => validateStaged(['src/main.ts'], ['src/main.ts']));
  assert.throws(() => validateStaged([], ['.env.production']));
  assert.doesNotThrow(() => validateStaged([], ['src/main.ts']));
  assert.equal(isSecretPath('src/entities/Enemy.ts'), false);
});

test('push guard allows only new refs and fast-forward updates', () => {
  assert.doesNotThrow(() => validatePush('refs/heads/main aaa refs/heads/main 000', () => false));
  assert.doesNotThrow(() => validatePush('refs/heads/main bbb refs/heads/main aaa', () => true));
  assert.throws(() => validatePush('refs/heads/main bbb refs/heads/main aaa', () => false));
  assert.throws(() => validatePush('(delete) 000 refs/heads/main aaa', () => true));
  assert.throws(() => validatePush('refs/tags/v1 bbb refs/tags/v1 aaa', () => true));
  assert.throws(() => validatePush('bad input', () => true));
});

test('Git hooks are valid shell scripts and confirmation fails without a terminal', () => {
  const sh = process.platform === 'win32' ? 'C:/Program Files/Git/bin/sh.exe' : 'sh';
  for (const name of ['pre-commit', 'pre-push', 'confirm.sh']) {
    const syntax = spawnSync(sh, ['-n', path.join(root, '.githooks', name)], { encoding: 'utf8', windowsHide: true });
    assert.equal(syntax.status, 0, syntax.stderr);
  }
  const refused = spawnSync(sh, ['-c', '. ./.githooks/confirm.sh; confirm_action COMMIT'], {
    cwd: root, encoding: 'utf8', windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'],
  });
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /human terminal/);
});

test('symlink aliases cannot write protected files or read known secret files', (t) => {
  const originalExists = fs.existsSync;
  const originalRealpath = fs.realpathSync;
  const alias = path.join(root, 'src', 'alias.ts');
  t.mock.method(fs, 'existsSync', (value) => value === alias || originalExists(value));
  t.mock.method(fs, 'realpathSync', (value) =>
    value === alias ? path.join(root, 'tools', 'hooks', 'policy.mjs') : originalRealpath(value));
  assert.equal(checkPatch(patch('*** Update File: src/alias.ts'), root).decision, 'block');
  fs.realpathSync.mock.restore();
  t.mock.method(fs, 'realpathSync', (value) =>
    value === alias ? path.join(root, '.env') : originalRealpath(value));
  assert.equal(checkCommand('Get-Content src/alias.ts', root, scripts).decision, 'confirm');
});
