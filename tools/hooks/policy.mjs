import fs from 'node:fs';
import path from 'node:path';

const allow = { decision: 'allow', reason: 'Routine operation; host permissions still apply.' };
const block = (reason) => ({ decision: 'block', reason });
const confirm = (reason) => ({ decision: 'confirm', reason });
const rank = { allow: 0, confirm: 1, block: 2 };

export function isSecretPath(value) {
  return /(^|[/\\:])(?:\.env(?:[.*].*)?|auth\.json|credentials(?:[.*].*)?|secrets?(?:[.*].*)?|\.ssh|\.aws|\.azure)(?:[/\\]|$)/i.test(value)
    || /\.(?:pem|key|p12|pfx)$/i.test(value);
}

function isProtectedPath(value) {
  return /^(?:\.git(?:[/\\]|$)|\.codex(?:[/\\]|$)|\.githooks(?:[/\\]|$)|tools[/\\]hooks(?:[/\\]|$)|AGENTS\.md$|\.gitattributes$)/i.test(value);
}

export function checkPath(value, root, writing = false) {
  if (isSecretPath(value)) return confirm('Secret access requires explicit human confirmation.');
  const absolute = path.resolve(root, value);
  const relative = path.relative(root, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return confirm('Access outside the repository requires human review.');
  }
  let existing = absolute;
  while (!fs.existsSync(existing) && path.dirname(existing) !== existing) {
    existing = path.dirname(existing);
  }
  if (fs.existsSync(existing)) {
    const realRelative = path.relative(fs.realpathSync(root), fs.realpathSync(existing));
    if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) {
      return confirm('Symlink access outside the repository requires human review.');
    }
    if (isSecretPath(realRelative)) {
      return confirm('Access through a symlink to secrets requires human confirmation.');
    }
    if (writing && isProtectedPath(realRelative)) {
      return block('Writing policy or Git internals through a symlink is prohibited.');
    }
  }
  if (writing && isProtectedPath(relative)) {
    return block('Agent edits to policy, hooks, or Git internals are blocked. A human must review and apply them.');
  }
  if (writing && /(?:^|[/\\])migrations?(?:[/\\]|$)|\.sql$/i.test(relative)) {
    return confirm('Database changes require explicit human confirmation.');
  }
  if (writing && /^(?:package(?:-lock)?\.json|\.npmrc)$/i.test(relative)) {
    return confirm('Dependency and lifecycle-script changes need a separate human review.');
  }
  return allow;
}

// Small grammar: never execute, decode, expand, or evaluate incoming commands.
export function splitCommands(command) {
  const commands = [];
  let words = [], word = '', quote = '';
  const flushWord = () => { if (word) { words.push(word); word = ''; } };
  const flushCommand = () => { flushWord(); if (words.length) commands.push(words); words = []; };

  if (/[$\x60{}@()]|%[^%\s]+%/.test(command)) throw new Error('Shell expansion and dynamic expressions are not reviewed.');
  for (let i = 0; i < command.length; i++) {
    const char = command[i];
    if (quote) {
      if (char === quote) quote = '';
      else word += char;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>' || char === '<' || char === '&' && command[i + 1] !== '&') {
      throw new Error('Redirection or indirect invocation requires human review.');
    } else if (char === ';' || char === '\n' || char === '|' || char === '&') {
      if (command[i + 1] === char) i++;
      flushCommand();
    } else if (/\s/.test(char)) {
      flushWord();
    } else {
      word += char;
    }
  }
  if (quote) throw new Error('Unterminated command quote.');
  flushCommand();
  if (!commands.length) throw new Error('Missing command.');
  return commands;
}

function checkProgram(words, root, scripts) {
  const [raw, ...args] = words;
  const program = raw.toLowerCase().replace(/\.exe$/, '');
  const lower = args.map((arg) => arg.toLowerCase());

  if (['rm', 'rmdir', 'rd', 'del', 'erase', 'unlink', 'remove-item', 'ri', 'clear-content', 'git-rm'].includes(program)) {
    return block('File deletion is prohibited.');
  }
  if (program === 'git') {
    if (lower[0] === 'clean' || lower[0] === 'reset' && lower.includes('--hard')) {
      return block('git clean and git reset --hard are prohibited.');
    }
    if (lower[0] === 'rm') return block('File deletion is prohibited.');
    if (lower[0] === 'push' && lower.some((arg) => /^--(?:force|force-with-lease|force-if-includes)(?:=|$)|^-[^-]*f/.test(arg) || arg.startsWith('+') || arg === '--delete')) {
      return block('Force pushes and remote deletion are prohibited.');
    }
    if (lower.some((arg) => arg.includes('hookspath') || arg === '--no-verify' || lower[0] === 'commit' && arg === '-n') && !(
      lower[0] === 'config' && ['--get', '--get-all', '--show-origin'].includes(lower[1])
    )) return block('Changing or bypassing Git hooks is prohibited.');
    if (['commit', 'push', 'merge', 'rebase', 'tag'].includes(lower[0])) {
      return confirm('A plan is not commit/push authorization. The human must explicitly authorize and run this in their own terminal.');
    }
    if (['status', 'diff', 'log', 'show', 'ls-files', 'rev-parse'].includes(lower[0])) {
      if (args.some(isSecretPath)) return confirm('Viewing secrets requires human confirmation.');
      for (const arg of args.filter((arg) => /[/\\\\]|\.\./.test(arg) && !arg.startsWith('-'))) {
        const checked = checkPath(arg, root);
        if (checked.decision !== 'allow') return checked;
      }
      if (lower.some((arg) => arg === '--output' || arg.startsWith('--output=') || arg === '--ext-diff' || arg === '--textconv')) {
        return confirm('Git redirection or external helpers require review.');
      }
      return allow;
    }
    if (lower[0] === 'config' && lower[1] === '--get' && lower[2] === 'core.hookspath' && args.length === 3) return allow;
    return confirm('Git mutations or global options require explicit review.');
  }

  if (['sudo', 'su', 'runas', 'chmod', 'chown', 'icacls', 'takeown', 'set-acl', 'reg', 'net', 'sc'].includes(program)
    || lower.includes('-verb') && lower.includes('runas')) {
    return confirm('Privilege or system-permission changes require explicit human confirmation.');
  }
  if (['psql', 'mysql', 'sqlite3', 'mongosh', 'sqlcmd', 'prisma'].includes(program)) {
    return confirm('Database operations require explicit human confirmation.');
  }
  if (['node', 'nodejs', 'python', 'python3', 'py', 'powershell', 'pwsh', 'cmd', 'bash', 'sh', 'wscript', 'cscript', 'invoke-expression', 'iex', 'invoke-command', 'start-process'].includes(program)) {
    return block('Unreviewed interpreters, scripts, and indirect execution are blocked; changing the wrapper is not an exception.');
  }

  if (program === 'npm' || program === 'npm.cmd') {
    const name = args[0] === 'test' && args.length === 1
      ? 'test' : args[0] === 'run' && args.length === 2 ? args[1] : null;
    const reviewed = {
      test: 'vitest run',
      build: 'tsc && vite build',
      lint: 'eslint .',
      typecheck: 'tsc --noEmit',
      'test:hooks': 'node --test tools/hooks/*.check.mjs',
    };
    if (!name || !reviewed[name] || scripts[name] !== reviewed[name]) {
      return confirm('Only reviewed test/build/lint scripts run autonomously; inspect changed definitions first.');
    }
    if (scripts['pre' + name] || scripts['post' + name]) {
      return confirm('Npm lifecycle hooks require review before executing this script.');
    }
    return allow;
  }

  if (['rg', 'get-content', 'get-childitem', 'get-item', 'test-path', 'resolve-path', 'get-location', 'pwd', 'select-object', 'format-list'].includes(program)) {
    if (lower.some((arg) => ['-command', '-encodedcommand', '--pre', '--hostname-bin'].includes(arg) || arg.startsWith('--pre='))) {
      return block('External helpers and embedded commands are prohibited.');
    }
    for (const argument of args) {
      const arg = argument.startsWith('-') && argument.includes('=')
        ? argument.slice(argument.indexOf('=') + 1) : argument;
      if (isSecretPath(arg)) return confirm('Secret access requires human confirmation.');
      const looksLikePath = /[/\\\\]|\.\./.test(arg);
      if (!arg.startsWith('-') && !['select-object', 'format-list'].includes(program)
        && (program !== 'rg' || looksLikePath)) {
        const result = checkPath(arg, root);
        if (result.decision !== 'allow') return result;
      }
    }
    return allow;
  }
  return confirm('Unknown executable or script requires human review; do not retry via another interpreter.');
}

export function checkCommand(command, root, scripts = {}) {
  let commands;
  try { commands = splitCommands(command); }
  catch (error) { return block(error.message); }
  let result = allow;
  for (const words of commands) {
    const candidate = checkProgram(words, root, scripts);
    if (rank[candidate.decision] > rank[result.decision]) result = candidate;
  }
  return result;
}

export function checkPatch(patch, root) {
  if (/^\*\*\* (?:Delete File|Move to):/m.test(patch)) {
    return block('File deletion and moves are prohibited.');
  }
  const paths = [...patch.matchAll(/^\*\*\* (?:Add|Update) File: (.+)$/gm)].map((match) => match[1].trim());
  if (!paths.length || !patch.startsWith('*** Begin Patch')) return block('Unsupported patch format.');
  for (const filename of paths) {
    const result = checkPath(filename, root, true);
    if (result.decision !== 'allow') return result;
  }
  return allow;
}

export function checkTool(input, root, scripts = {}) {
  if (!input || input.hook_event_name !== 'PreToolUse' || !input.tool_name || !input.tool_input) {
    return block('Malformed hook input.');
  }
  const name = input.tool_name;
  const args = input.tool_input;
  if (name === 'apply_patch' || name === 'Edit' || name === 'Write') {
    return typeof args.command === 'string' ? checkPatch(args.command, root) : block('Unknown edit input.');
  }
  if (['Bash', 'exec_command', 'shell_command'].includes(name)) {
    const command = args.command ?? args.cmd;
    if (typeof command !== 'string') return block('Missing command.');
    const result = checkCommand(command, root, scripts);
    if (result.decision !== 'allow') return result;
    if (args.sandbox_permissions === 'require_escalated') {
      return confirm('Escalation requires human approval; repository policy cannot waive host permissions.');
    }
    return result;
  }
  if (name === 'view_image') return checkPath(args.path ?? '', root);
  if (['update_plan', 'request_user_input', 'request_user_input_async'].includes(name)) return allow;
  return confirm('This local/MCP tool is outside the reviewed policy surface; human review is required.');
}
