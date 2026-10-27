# Mini Tower Defense — Milestone 3

A minimal desktop-browser tower defense demo built with Phaser 3, TypeScript,
and Vite. Graphics use procedural pixel-style shapes without external art assets.

## Requirements

Node.js LTS and npm.

## Run in development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).
FPS and the development build label appear only in development mode.

## Controls

1. Click **BASIC TOWER** in the sidebar.
2. Move over the map: green marks available grass; red marks path/occupied tiles.
3. Left-click an empty grass tile to place a tower.
4. Selection stays active for additional placements.
5. Press **Esc** or click **BASIC TOWER** again to cancel selection.

Sidebar/footer clicks do not place towers. The sidebar shows placement feedback,
tower count, current enemy HP, and kills. Towers have no placement cost and remain
until the page reloads. Placement is not saved.

## Combat rules

| Setting | Value |
| --- | --- |
| Tower range | 128px, including the boundary |
| Fire interval | 1 second per tower |
| Damage | 1 HP per projectile impact |
| Enemy health | 3 HP |
| Projectile speed | 320px/second |
| Demo enemy speed | 95px/second |

Combat constants live in `src/config/combatConfig.ts`.

Towers aim at the single live demo enemy and fire as soon as it is in range
and their cooldown is ready. A slow frame does not queue a burst of missed shots.
Projectiles follow their original target after firing, even if it leaves tower
range. A projectile deals damage once, on impact.

A killed enemy increases KILLS and immediately respawns at the entrance with
3 HP. Reaching the endpoint also respawns the enemy, without adding a kill.
All remaining projectiles are removed on either kind of respawn, so old shots
cannot damage a new enemy. There are no waves, economy, or player-life rules.

For a quick combat check, place a tower at tile **(2, 4)** using zero-based
coordinates: its logical center is **(160, 288)**. It covers enough of the early
path to kill the enemy with three hits.

## Verify

```bash
npm run test
npm run build
npm run preview
```

Open the preview URL to check the production build. FPS and the development
build label are hidden in production.

### Automated checks

- Movement: timing, exact corners, multiple corners per update, endpoint,
  nonpositive elapsed time, invalid input, and unchanged waypoint data.
- Map: dimensions, tile bounds, orthogonal adjacency, and actual path movement.
- Placement: valid grass, duplicate towers, all path tiles, bounds, invalid
  coordinates, corners, preview side effects, and fresh scene state.
- Combat: range boundaries, dead/out-of-range targets, cooldown, long/negative
  time steps, moving targets, exact/overshooting impacts, damage applied once,
  three-hit kills, health clamping, and expired targets.

### Verification results

- Unit tests: **44 passed** across four test files.
- TypeScript check and Vite production build: **passed**.
- Chrome headless checks passed in development and production:
  - Canvas measured 960x640.
  - Placement, rejection, cancellation, and scaled pointer coordinates worked.
  - Enemy moved and respawned at the endpoint without towers in range.
  - Out-of-range towers did not damage the enemy.
  - A tower near the path rendered projectiles.
  - Enemy HP decreased through 2/3 and 1/3 before KILLS increased.
  - The replacement enemy appeared at full 3/3 HP.
  - FPS/development label appeared only in development.
  - No uncaught exceptions or console.error calls were observed.

Headless checks used Canvas rendering; combat screenshots were inspected.
Default WebGL rendering and visual sharpness on other screen sizes still need
manual verification.

### Manual acceptance checklist

In development mode:

- [ ] Confirm the 12x8 map, 64px tiles, sidebar, and logical 960x640 canvas.
- [ ] With no towers, watch the enemy follow every orthogonal corner and respawn.
- [ ] Select BASIC TOWER; check green/red previews and placement on grass.
- [ ] Verify path, occupied, sidebar, and footer clicks do not add towers.
- [ ] Verify Esc and the tower button cancel selection.
- [ ] Resize the window and verify preview/placement follows the cursor.
- [ ] Place a tower at (2, 4); watch it rotate, fire, and reduce enemy HP.
- [ ] Check that the health bar shrinks, KILLS increases, and a fresh enemy spawns.
- [ ] Place several towers near the path; verify old projectiles disappear
      when the enemy dies and do not damage its replacement.
- [ ] Confirm readable text, crisp graphics, FPS, and no console errors.

In production preview:

- [ ] Repeat placement and combat checks.
- [ ] Confirm FPS and the development label are absent.
- [ ] Confirm the console has no errors.

Leave manual items unchecked until verified in a browser.

## Project structure

- `src/config`: canvas/tile dimensions and combat constants.
- `src/data`: fixed path in tile coordinates.
- `src/systems`: pure movement, placement, targeting, cooldown, and projectile
  logic, without Phaser imports.
- `src/entities`: enemy, tower, and projectile presentation/lifecycle.
- `src/scenes`: rendering, input, combat orchestration, and respawning.
- `src/tests`: movement, map, placement, and combat unit tests.

## Scope and build notes

M3 adds basic combat to the M1/M2 demo. Economy, waves, upgrades, selling, and
multiple enemy types remain outside this milestone.

No dependencies were added for M3. The production build still warns about a
JavaScript chunk larger than 500 kB because it includes Phaser; the build passes.
