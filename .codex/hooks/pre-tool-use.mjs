import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkTool } from '../../tools/hooks/policy.mjs';

try {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const scripts = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).scripts;
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const result = checkTool(input, root, scripts);
  if (result.decision !== 'allow') {
    const reason = result.decision === 'confirm'
      ? 'Human confirmation required: ' + result.reason + ' Stop and explain; do not bypass this denial. A human can execute the reviewed operation outside the agent.'
      : result.reason;
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }));
  }
  // No automatic "allow": host permissions still apply to every safe operation.
} catch {
  process.stderr.write('Policy hook failed to validate input. Operation blocked.\n');
  process.exitCode = 2;
}
