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
