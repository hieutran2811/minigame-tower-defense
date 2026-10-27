import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isSecretPath } from './policy.mjs';

export function validateStaged(deleted, names) {
  if (deleted.length) throw new Error('Staged file deletion is prohibited.');
  if (names.some(isSecretPath)) throw new Error('Potential secret file is staged; human review required.');
}

export function validatePush(input, isAncestor) {
  const zero = /^0+$/;
  for (const line of input.trim().split('\n').filter(Boolean)) {
    const [localRef, localSha, remoteRef, remoteSha] = line.trim().split(/\s+/);
    if (!localRef || !localSha || !remoteRef || !remoteSha) throw new Error('Malformed push input.');
    if (zero.test(localSha)) throw new Error('Remote ref deletion is prohibited.');
    if (!zero.test(remoteSha)) {
      if (remoteRef.startsWith('refs/tags/') && localSha !== remoteSha) {
        throw new Error('Replacing an existing tag is prohibited.');
      }
      if (!isAncestor(remoteSha, localSha)) throw new Error('Non-fast-forward push is prohibited.');
    }
  }
}

if (process.argv[1] && fs.realpathSync(fileURLToPath(import.meta.url)) === fs.realpathSync(process.argv[1])) {
  const git = (args) => execFileSync('git', args, { encoding: 'utf8', windowsHide: true });
  try {
    if (process.argv[2] === 'commit') {
      const list = (args) => git(args).split('\0').filter(Boolean);
      validateStaged(
        list(['diff', '--cached', '--diff-filter=D', '--name-only', '-z']),
        list(['diff', '--cached', '--name-only', '-z']),
      );
    } else if (process.argv[2] === 'push') {
      validatePush(fs.readFileSync(0, 'utf8'), (before, after) => {
        try {
          execFileSync('git', ['merge-base', '--is-ancestor', before, after], {
            windowsHide: true, stdio: 'ignore',
          });
          return true;
        } catch { return false; }
      });
    } else {
      throw new Error('Expected commit or push mode.');
    }
  } catch (error) {
    process.stderr.write('Git guard: ' + error.message + '\n');
    process.exitCode = 1;
  }
}
