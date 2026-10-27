# Agent workflow and hook guardrails

## Policy

Routine source reads, edits within approved scope, and reviewed build/test/lint
commands require no conversational confirmation. Existing tool/sandbox permissions
still apply. This session's managed read-only workspace cannot be changed by a
repository file.

The agent must never delete files, run hard resets/clean, force push, disable hooks,
or retry a blocked operation through PowerShell, Python, Node, another tool, an
alias, encoded code, or a downstream script.

Database operations, secrets, system permission changes, and privileged commands
require review and explicit confirmation of the exact action. A plan does not
authorize commit, push, merge, or deploy. Every source change remains subject to
final human review.

## Files and enforcement

| File | Purpose |
| --- | --- |
| AGENTS.md | Approved scope, risk policy, stop-loss, testing and human review workflow |
| .codex/config.toml | Workspace-write intent and on-request approvals; managed policy can override |
| .codex/hooks.json | Synchronous PreToolUse hook; resolves paths from the Git root |
| .codex/hooks/pre-tool-use.mjs | Reads stdin JSON and emits supported deny output |
| .codex/rules/guardrails.rules | Supplemental forbidden/prompt prefixes; no broad allow rules |
| tools/hooks/policy.mjs | Small reviewed-command grammar, patch/path checks and npm-script checks |
| .githooks/pre-commit | Rejects staged deletion/known secret filenames; checks whitespace; asks COMMIT |
| .githooks/pre-push | Rejects ref deletion/non-fast-forward updates; asks PUSH |
| .githooks/install.ps1 | Opt-in installation into local Git config, preserving existing hooks |
| tools/hooks/policy.check.mjs | Safe fixtures and actual hook protocol/noninteractive checks |

The hook accepts canonical Bash and apply_patch events, including nested tool
calls from Codex code mode. Unknown local/MCP tools are not automatically trusted.
Shell wrappers, arbitrary scripts, redirections, substitutions and encoded/inline
interpreters are blocked. Use apply_patch for routine source edits.

Only exact reviewed npm scripts are accepted: test, build, test:hooks, and optional
eslint/typecheck definitions already reviewed by a human. The hook checks the
current package.json each time and stops on changed definitions or pre/post scripts.
This project currently has no lint script. Do not add a dependency just to claim
lint ran.

## Activation

Review these files before activating them.

For this Windows checkout, from the repository root in PowerShell:

```powershell
& .\.githooks\install.ps1
git config --local --get core.hooksPath
npm run test:hooks
```

The expected hook path is .githooks. The installer refuses to overwrite a different
hook path or existing legacy pre-commit/pre-push hooks. It changes only this
repository's Git config; it does not change global config or OS permissions.

Git hooks are not automatically installed by cloning or npm install. Install them
in each checkout. On Unix, a human must also review and set executable bits for
pre-commit and pre-push before using them; do not bypass a permissions prompt.

For Codex, restart/reopen a local session, ensure the project .codex layer is trusted,
then open **/hooks** to review and trust the exact hook definition. New/changed
non-managed hooks are skipped until trusted. Never use a hook-trust bypass flag.
The trusted hook bootstrap uses Node internally; this does not grant permission
for agent-authored inline Node commands.

Documentation verified against official [Hooks](https://learn.chatgpt.com/docs/hooks)
and [Rules](https://learn.chatgpt.com/docs/agent-configuration/rules) documentation.
The local CLI supports these features, but installing files does not establish
that an already-running IDE/Work session has loaded or trusted them.

## Confirmation behavior

The current Codex PreToolUse protocol supports deny, but not ask. This hook does
not output an unsupported ask value and does not auto-allow permission requests.
It stops confirmation-required actions with an explanation. The agent must explain
the exact action and impact for review; after approval the human executes it
in their own terminal. There is no environment-variable or repo-file approval token.

For commit/push, inspect the diff and run the exact Git command yourself.
The Git hook prompts for COMMIT or PUSH through a terminal. Noninteractive calls
fail. The agent must not create a pseudo-terminal or type the confirmation for you.
The approved M4 commit was made before this guardrail change; this is not future
commit authorization.

Host permissions remain an independent layer. The hook never emits allow to
silently approve a tool escalation. Read-only, managed, or untrusted environments
can still deny or prompt for otherwise routine operations.

## Verification

```bash
npm run test:hooks
npm run test
npm run build
```

The hook tests feed destructive command strings as data; they do not execute
deletion, reset, clean, push, DB operations, or secret access. They also execute
the real hook with safe JSON fixtures, test Git shell syntax/noninteractive
confirmation, and verify Git-root resolution from a subdirectory.

To check supplemental rule parsing without executing the dangerous command:

```powershell
codex execpolicy check --rules .codex/rules/guardrails.rules -- git clean -fd
codex execpolicy check --rules .codex/rules/guardrails.rules -- git commit -m example
```

Expected decisions: forbidden for clean; prompt for commit. The tool hook adds
a deny gate for agent commit execution.

## Security boundaries and remaining human setup

Hooks are guardrails, not a security sandbox. The parser intentionally rejects
unsupported syntax rather than claiming to understand arbitrary shell programs.
It cannot prove that allowed tests/build tools, dependencies, plugins, executables,
or transitive scripts are harmless. Filename-based checks cannot discover every
secret or destructive behavior.

Git hooks run after edits have happened, so a pre-commit deletion check cannot undo
an earlier deletion. Their prompts can be spoofed by a process with equivalent
terminal access, and a user can alter local files/configuration. Prefix rules do
not cover every spelling, argument order, or hidden downstream operation.
Some specialized/hosted tool paths are outside hook coverage. Hook startup failures,
missing runtimes, skipped trust, and unmanaged hook changes must be treated as gaps.

Use all layers together:

- Limit tool permissions and filesystem/network access to the project.
- Use a restricted OS account; keep production credentials and databases out of scope.
- Keep hooks/policy under human review; use admin-managed hooks and read-only policy
  files when stronger enforcement is needed.
- Configure remote branch protection to reject force pushes/deletion and require
  pull requests, human review, and successful CI. This must be set on your Git host;
  local files cannot enforce it.
- Review changes to package scripts, tests and dependencies, not only command names.
- Confirm hooks are active in each actual Codex/IDE session; files alone are not proof.


## Verification snapshot for this change

| Logical change | Evidence |
| --- | --- |
| M4 game changes committed separately | Commit 424ad1f; 64 game tests and build passed before commit |
| Command/patch/Git policy and hook protocol | npm run test:hooks: 79 passed, including malformed input and symlink aliases |
| Game regression and static/build checks | npm run test: 64 passed; npm run build: passed |
| Rule parsing | execpolicy reports forbidden for git clean and prompt for git commit |
| Git installation | core.hooksPath is .githooks in local config |
| Actual noninteractive Git hook | git hook run pre-commit exited 1 with the expected human-terminal refusal; no commit was attempted |
| Lint | Not run: this project has no lint script |
| Human activation still required | Reopen Codex and review/trust /hooks; configure remote branch protection and OS/tool restrictions |

The workflow/hook changes are separate from M4 and are left uncommitted for human
review. No dependencies were added. The existing Phaser bundle-size warning remains.
