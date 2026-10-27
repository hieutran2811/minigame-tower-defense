# AI Agent Instructions — Mini Tower Defense

## Mission
Build a small, maintainable desktop-browser 2D tower defense game with Phaser 3, TypeScript and Vite. Work one approved milestone at a time.

## Current scope: Milestone 3
- Preserve M1/M2: 12x8 map, 64px tiles; 960x640 canvas with sidebar.
- Fixed orthogonal path and one demo enemy; respawn after death or reaching the endpoint.
- FPS and development label in development only.
- Procedural pixel-style rendering without paid assets.
- Select/place one basic tower type only on empty grass; preview, feedback, cancellation.
- Towers aim at the demo enemy within 128px and fire at most once per second.
- Homing projectiles deal 1 damage on impact; enemies have 3 HP.
- Show the enemy health bar, current HP, and kill count.
- Clear projectiles when the enemy respawns; old shots must never damage a new enemy.
- Unit tests for movement, map constraints, placement, targeting, cooldown, and projectiles.

## Out of scope
No economy, waves, tower upgrades, selling, multiple enemy types, backend, database, auth, multiplayer or React.

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
Map 12x8; enemy stays on the orthogonal path and respawns at full HP on death/exit; FPS visible only in development; placement works only on empty grass and follows canvas scaling; towers aim/fire only in range with the approved cooldown; projectiles apply damage once and never carry over to respawn; health bar and kill count update; tests/build pass; no browser console errors.
