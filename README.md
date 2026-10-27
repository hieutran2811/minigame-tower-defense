# Mini Tower Defense — Milestone 4

A desktop-browser 2D tower defense game using Phaser 3, TypeScript, and Vite.
The 12x8 map uses 64px tiles on a logical 960x640 canvas with a sidebar.
All graphics are procedural pixel-style shapes.

## Requirements and development

Node.js LTS and npm.

```bash
npm install
npm run dev
```

Open the Vite URL (usually http://localhost:5173). FPS and the development
build label appear only in development.

## Controls

1. Click **BASIC TOWER**, then left-click empty grass to place a tower.
2. Green previews mark valid tiles; red previews mark path/occupied tiles.
3. Selection stays active for more placements. **Esc** or the tower button
   cancels selection.
4. Click **START WAVE** when ready. It is disabled while the wave is running.
5. After all enemies in a wave are resolved, place more towers or start the
   next wave manually.
6. Click **RESTART** at any time to reset the entire match.

Sidebar/footer clicks never place towers. Placement is allowed before and during
waves, and stops after victory/defeat. Towers have no cost in M4. Progress and
placement are not saved.

## Waves, lives, and outcomes

| Wave | Enemies | Spawn interval |
| --- | --- | --- |
| 1 | 5 | 1 second |
| 2 | 8 | 1 second |
| 3 | 12 | 1 second |

The first enemy appears immediately after starting a wave. Multiple enemies can
be on the path at once. A wave clears only when all scheduled enemies have
spawned and have either died or escaped. The next wave never starts automatically.

- Start with **10 lives**.
- Each enemy reaching the endpoint costs **1 life**.
- Each killed enemy increases **KILLS**.
- Enemies are removed on death/exit; they do not individually respawn.
- Resolve wave 3 with at least one life remaining to win.
- Reaching zero lives immediately loses, including on the final enemy.
- Victory/defeat clears enemies and projectiles, and blocks combat and placement.
- Restart resets lives, kills, waves, spawn timing, towers, enemies, projectiles,
  placement selection, and the result screen.

The sidebar shows lives, wave number, active enemies, kills, and tower count.
The footer reports the wave's spawn progress.

## Combat

| Setting | Value |
| --- | --- |
| Tower range | 128px, including the boundary |
| Fire interval | 1 second per tower |
| Damage | 1 HP per projectile impact |
| Enemy health | 3 HP |
| Enemy speed | 95px/second |
| Projectile speed | 320px/second |

Each tower chooses the live in-range enemy with the greatest distance traveled
along the path, so enemies closest to the exit have priority. Equal progress
keeps spawn order. Cooldowns continue while no target is available; a slow frame
does not queue a burst of old shots.

Projectiles follow their original target after firing, even if it leaves range.
They apply damage once and expire when that target is removed. Removing one
enemy does not clear shots aimed at other enemies. Health bars show each enemy's
remaining HP.

Combat constants are in `src/config/combatConfig.ts`; wave counts, spawn interval,
and starting lives are in `src/config/waveConfig.ts`.

## Quick play checks

To test victory, place towers on these zero-based tiles before starting:

```text
(0,2) (1,2) (2,2) (3,2)
(0,4) (1,4) (2,4) (4,3)
```

Start each wave manually. This layout cleared all 25 enemies with 10 lives
remaining in browser verification.

To test defeat, start waves without towers. After wave 1, lives should be 5.
Start wave 2; the match should end when lives reach 0. Press Restart to try again.

## Verify

```bash
npm run test
npm run build
npm run preview
```

Open the preview URL to test production. FPS and the development label are hidden.

### Automated checks and results

- **64 unit tests passed** across five files.
- **TypeScript check and production build passed**.
- Tests cover orthogonal movement, traveled distance, map constraints, placement,
  range/cooldown, target priority, projectile ownership/damage, exact wave counts,
  spawn timing across long frames, wave completion, lives, outcomes, and fresh
  match state.
- Chrome headless checks verified:
  - Multiple enemies rendered together and Start Wave could not skip a wave.
  - With no towers, all 5 enemies in wave 1 escaped and cost exactly 5 lives.
  - Wave 2 stopped at 0 lives with defeat, cleared entities, and blocked placement.
  - All three waves cleared with 25 kills and 10 lives in dev and production.
  - Waves waited for manual input, placement/cancellation worked, and controls
    remained correct after resizing to 1200x800.
  - Restart worked after victory/defeat, during a wave, and repeatedly without
    duplicate spawns or leftover entities.
  - FPS/development label appeared only in development.
  - No uncaught exceptions or console.error calls were observed.

Headless checks used Canvas rendering. Default WebGL rendering and visual
sharpness on other displays still need manual verification.

### Manual acceptance checklist

- [ ] Confirm the map dimensions, orthogonal path, sidebar, and crisp graphics.
- [ ] Check placement previews, occupied/path rejection, Esc, and resizing.
- [ ] Verify no enemies appear before Start Wave.
- [ ] Watch several enemies move simultaneously with individual HP bars.
- [ ] Check that towers prioritize enemies further along the path when in range.
- [ ] Verify wave counts are exactly 5, 8, and 12, with one-second spacing.
- [ ] Verify the next wave waits until the current wave clears and you click Start.
- [ ] Play through victory using the example layout.
- [ ] Play through defeat without towers and check one lost life per escape.
- [ ] Check that placement and Start Wave stop after the result.
- [ ] Restart during play and after each outcome; confirm full state reset.
- [ ] Repeat in production preview; confirm no FPS/development label.
- [ ] Confirm there are no browser console errors.

## Project structure

- `src/config`: dimensions, combat constants, and wave/life settings.
- `src/data`: the fixed orthogonal path.
- `src/systems`: pure movement, placement, combat, and wave/match logic.
- `src/entities`: Phaser enemy, tower, and projectile presentation.
- `src/scenes`: rendering, input, wave/combat orchestration, and result UI.
- `src/tests`: movement, map, placement, combat, and wave unit tests.

## Scope and build notes

M4 adds waves, multiple enemies, lives, victory/defeat, and Restart.
Economy, upgrades, selling, and multiple enemy types remain out of scope.

No dependencies were added. Vite still warns about a JavaScript chunk larger than
500 kB because it includes Phaser; the production build succeeds.

## Agent workflow and hooks

The execution policy and review workflow are in [AGENTS.md](AGENTS.md).
Read [docs/guardrails.md](docs/guardrails.md) for activation, verification,
manual commit/push confirmation, and security limitations.

```bash
npm run test:hooks
```

Hook checks use Node's built-in test runner and add no dependency.
The project currently has no lint script; do not report lint as passed.
