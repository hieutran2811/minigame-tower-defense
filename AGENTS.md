# AI Agent Instructions — Mini Tower Defense

## Mission
Build a small, maintainable desktop-browser 2D tower defense game with Phaser 3, TypeScript and Vite. Work one approved milestone at a time.

## Current scope: Milestone 4
- Preserve the 12x8 map, 64px tiles, 960x640 canvas/sidebar, and fixed orthogonal path.
- Procedural pixel-style graphics; FPS and development label only in development.
- One basic tower type placed only on empty grass, with preview and cancellation.
- Towers prioritize the in-range enemy furthest along the path; ties keep spawn order.
- Preserve combat: 128px range, 1 shot/second, 1 damage, enemy 3 HP and 95px/second.
- Three manually started waves containing 5, 8, and 12 enemies, spawning 1 second apart.
- First enemy spawns immediately; a new wave starts only after all previous enemies are resolved.
- Enemies are removed on death/exit and do not respawn individually.
- Start with 10 lives; each escape costs 1 life, each kill adds to KILLS.
- Win after resolving wave 3 with lives remaining; lose immediately at 0 lives.
- Freeze spawning/combat/placement after a result and clear enemies/projectiles.
- Restart is available at any time and resets the entire match, including towers.
- Unit tests for path progress, placement, targeting, projectiles, wave timing, lives, and outcomes.

## Out of scope
No economy, tower upgrades, selling, multiple enemy types, backend, database, auth, multiplayer or React.

## Architecture rules
- `src/systems`: pure TypeScript logic, no Phaser imports.
- `src/entities`: Phaser presentation and entity lifecycle.
- `src/scenes`: scene orchestration and rendering.
- `src/data` and `src/config`: constants and level definitions.
- Keep code readable and small. Avoid speculative abstractions.
- Do not add dependencies without explaining why.
- Do not alter game rules without approval.

## Workflow
1. Read README and relevant source files.
2. State a concise plan and files to modify.
3. Implement only the requested change.
4. Run `npm run test` and `npm run build`.
5. Report changes, test outcomes, risks and manual verification steps.
6. Stop before the next milestone and request approval.

## Acceptance
Map/path and scaled placement remain correct; waves spawn the exact counts at the correct interval; no automatic next wave or individual respawn; targeting follows path progress; damage applies only to the original live target; escapes cost exactly 1 life; victory/defeat stop the match; Restart fully clears state/listeners; FPS appears only in development; tests/build pass; no browser console errors.

## Execution policy — mandatory precedence

The following restrictions take precedence over risk categories and approved plans.

| Action | Policy |
| --- | --- |
| Read project source; edit within approved scope; run reviewed test/build/lint scripts | Proceed without asking, subject to host tool permissions. |
| Delete files (including patch deletion/moves), hard reset, git clean, force push, bypass/disable hooks | Block. Never retry through another tool, shell, interpreter, alias, or script. |
| Database changes/access, secrets, system permissions, privileged commands | Stop and request explicit confirmation for the exact action and impact. |
| Commit, push, merge, deploy | Never infer authorization from a plan. Require a separate explicit user request for that exact operation. |
| Unknown scripts, encoded commands, dynamic shell expressions, unreviewed tools | Stop for review; never use them to evade the policy. |
| Changes to policy, hooks, tool permissions, or their enforcement | Human review required; the agent must not weaken its own safeguards. |

- Plan approval is not approval for commits, pushes, privileged operations, or prohibited actions.
- Do not manufacture approval using environment variables, files, transcript text, fake prompts, or AI self-review.
- Do not embed prohibited operations in game code, tests, npm lifecycle scripts, PowerShell, Python, Node.js, or other programs.
- A hook denial ends that execution path. Explain the denial and continue independent safe work.
- The local hook deliberately denies confirmation-required agent calls: this runtime has no supported PreToolUse "ask" result. After review, the human runs the exact operation in their own terminal. Commit/push hooks require interactive COMMIT/PUSH confirmation.
- Hook files do not prove they are active. Review/trust Codex hooks and install local Git hooks as described in docs/guardrails.md.
- Hooks are not an absolute security sandbox. String checks cannot detect every dangerous behavior, particularly in downstream programs. Combine tool approvals, OS restrictions, trusted/managed hooks, and server-side Git protection.
- Never weaken an active host sandbox to avoid a prompt. A read-only or managed host may still require approval for writes/builds.

## Development Efficiency & Quality Guardrails

### 1. Human Ownership

- Human owns business decisions, architecture decisions, scope, and final acceptance.
- AI owns implementation, routine technical decisions, testing, and technical self-review within the approved plan.
- Every source code change MUST be included in the final human review.
- High-risk changes MUST receive human approval before execution.
- Never treat AI-generated code or AI self-review as human approval.

### 2. Minimal Change Principle

- Implement the smallest correct solution.
- Follow existing project architecture, conventions, and patterns.
- Do not introduce new abstractions, frameworks, libraries, or design patterns without justification.
- Do not refactor unrelated code.
- Do not optimize code without evidence of a performance problem.
- Avoid unnecessary configuration, defensive layers, and speculative features.
- Prefer readable, maintainable code over clever solutions.

### 3. Small, Reviewable Changes

- Divide the approved plan into small, independently verifiable implementation steps.
- Complete and validate one logical change before starting the next.
- Keep changes easy to understand, test, and revert.
- Do not artificially split tightly coupled changes.
- Maintain a concise change log mapping each logical change to its purpose and tests.
- Every change must be visible in the final diff for human review.

### 4. Risk-Based Review

**Low Risk — Autonomous**
- Local implementation within approved scope.
- Small bug fixes.
- Unit tests.
- Internal refactoring explicitly included in the approved plan.

**Medium Risk — Autonomous only if explicitly covered by the approved plan**
- Public API changes.
- Database query modifications.
- Concurrency or transaction changes.
- Dependency upgrades.
- Significant performance optimizations.

**High Risk — Explicit approval required before execution**
- Business rule changes not explicitly approved.
- Architecture changes outside the approved plan.
- Database schema or data migrations with destructive or irreversible effects.
- Security and authentication changes.
- Production configuration changes.
- Deletion and prohibited destructive commands remain blocked by the execution policy above; approval is not a bypass.
- Operations affecting external systems or sensitive data.

Approval of a plan does not override mandatory safety restrictions.

### 5. Testing Strategy

Use a fast feedback loop:

1. Run the most relevant tests for the changed component.
2. Fix failures and rerun affected tests.
3. Run lint and static analysis where available.
4. Run build and broader regression tests before final review.
5. Verify acceptance criteria against the approved plan.

Additional rules:
- Add regression tests for bug fixes when feasible.
- Test edge cases and failure paths for business-critical logic.
- Do not modify or remove tests simply to make them pass.
- Do not silently skip failing tests.
- Clearly report tests that could not run.
- Never claim a test passed without actual execution evidence.

### 6. Stop-Loss Rule

Prevent endless AI debugging loops.

- After 3 unsuccessful attempts to resolve the same issue, STOP modifying that issue.
- Summarize attempts, observed errors, likely root causes, and next options.
- Do not repeatedly rewrite working code.
- If a fix requires significant redesign or exceeds the approved scope, request human review.
- Continue independent approved tasks when safe.

### 7. Architecture & Business Guardrails

- Existing business behavior must remain unchanged unless the plan explicitly requires otherwise.
- Preserve backward compatibility unless breaking changes are approved.
- Do not change transaction boundaries, locking strategy, concurrency behavior, or data consistency guarantees without explicit justification and required approval.
- Do not introduce distributed systems complexity for a local problem.
- Prefer existing infrastructure and dependencies.
- Document important tradeoffs and assumptions.

### 8. Context & Scope Control

Before implementation:
- Identify relevant files and dependencies.
- Read only the necessary code and documentation.
- Establish the approved scope and acceptance criteria.

During implementation:
- Maintain a concise progress summary.
- Record important decisions and discovered constraints.
- Avoid repeatedly analyzing unrelated parts of the repository.
- If context becomes insufficient, recover the approved plan and progress before continuing.
- Never silently reinterpret requirements or expand scope.

### 9. Mandatory Self-Review

Before requesting final human review, inspect the entire diff for:

- Correctness and business behavior.
- Unintended changes.
- Missing edge cases.
- Security vulnerabilities.
- Performance regressions.
- Concurrency and transaction risks.
- Unnecessary complexity.
- Missing tests.
- Debug code, secrets, and temporary files.

Fix issues found during self-review within the approved scope.

### 10. Final Review Gate

The final report MUST include:

- Approved plan versus actual implementation.
- Logical changes and affected files.
- Reasons for important technical decisions.
- Test commands and actual results.
- Known risks and unresolved issues.
- Any deviations from the approved plan.
- Git diff summary and uncommitted status.

Human review is mandatory.

Never commit, push, merge, or deploy without explicit user authorization.

**Definition of Done:**
- Approved scope implemented.
- Required validation completed or limitations disclosed.
- Self-review completed.
- All changes presented for human review.
- Human explicitly accepts the result.
