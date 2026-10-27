# AI Agent Instructions — Mini Tower Defense

## Mission
Build a small, maintainable desktop-browser 2D tower defense game with Phaser 3, TypeScript and Vite. Work one approved milestone at a time.

## Current scope: Milestone 2
- Preserve the M1 foundation: 12x8 tile map, 64px tiles; 960x640 canvas with sidebar.
- Fixed orthogonal path and one looping demo enemy.
- FPS overlay in development only.
- Pixel-art rendering using procedural shapes (no paid assets).
- Select and place one basic tower type on empty grass tiles.
- Reject placement on the path, occupied tiles, or outside the map.
- Show placement preview and feedback; Escape or the tower button cancels selection.
- Unit tests for movement, map constraints, and tower placement.

## Out of scope
No combat, projectiles, targeting, economy, waves, tower upgrades, selling, backend, database, auth, multiplayer or React.

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
Map 12x8; no diagonal enemy movement; enemy stays on path and loops; FPS visible in development only; basic towers can be selected and placed only on empty grass tiles; preview and cancellation work; placement stays correct when canvas scales; tests/build pass; no browser console errors.
