# The Last Beacon — Milestone 11

A desktop-browser 2D tower defense game using Phaser 3, TypeScript, and Vite.
Three 12x8 maps use 64px tiles on a logical 960x640 canvas with a sidebar.
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

1. On first launch, choose **PLAY** in the story menu, or press **Esc** to start
   on Border Watch. No wave starts automatically.
2. Click **BASIC TOWER**, then left-click empty ground to place a tower.
3. Green previews mark valid tiles; red previews mark path/occupied tiles. The
   circle shows the tower's 128px range and is clipped to the map bounds.
4. Selection stays active for more placements. **Esc** or **CANCEL BUILD**
   cancels selection.
5. Click **START WAVE** when ready. It is dimmed and disabled while the wave is
   running, and shows **MATCH OVER** after victory/defeat.
6. After all enemies in a wave are resolved, place more towers or start the
   next wave manually.
7. Click **RESTART** at any time to reset the current map's match.
8. Click **HOW TO PLAY** or press **H** to open help before/between waves or
   after the result. Close it with **H**, **Esc**, or the close button. During a
   wave, the help button is dimmed and reads **HELP AFTER WAVE**.
9. Click **AUDIO: OFF** in the sidebar to enable combat sounds; click **AUDIO: ON**
   to mute immediately. Audio starts off, and your choice survives Restart but
   resets on a page reload. The audio button works during waves, with help open,
   and after a result. It shows **AUDIO UNAVAILABLE** when Web Audio is unavailable.

Keyboard shortcuts use the same actions as the buttons:

| Key | Action |
| --- | --- |
| B | Select/cancel building before or during a wave |
| N | Start the next wave only when ready |
| R | Restart at any time, including with help open or after a result |
| H | Open/close help outside active waves |
| Esc | Close the level menu/help or cancel building/inspection |

Holding B, N, R, or H does not repeat the action. With help open, B and N are
blocked while R still resets the match. After a result, B and N stay locked.
With the level menu open, B/N/H are blocked; R still restarts the current map.

Help explains the objective, placement colors, tower inspection, manual waves,
lives, Restart, and current tower stats. Opening it closes build/inspection
selection and blocks map clicks. Build and Start Wave stay disabled until help
closes; **RESTART** remains available in the sidebar. Help never pauses a wave.

Outside build mode, left-click a built tower's tile to inspect its range and
combat stats. The blue range circle stays visible as you move the pointer and is
clipped to the map. Click another tower to switch, or click a map tile without a
tower or press **Esc** to close. Starting build mode also closes inspection.
Inspection is disabled after victory/defeat and resets on Restart.

The path has **IN** and **OUT** labels, plus arrows pointing along the outgoing
path at each turn. These ground markings render below towers and enemies.

Sidebar/footer clicks never place towers. Placement is allowed before and during
waves, and stops after victory/defeat, when the tower button shows **BUILD LOCKED**.
Towers have no cost. Progress and placement are not saved.

## Campaign: The Last Beacon

The Dawn Guard must keep the Hollow host away from the last beacon. Open
**LEVEL n/3** in the sidebar to read the chapter stories and choose a map before
or between waves, or after a result. Level selection is disabled during a wave.

| Chapter | Setting | Path tiles |
| --- | --- | --- |
| 1. Border Watch | Hold the border road for the Dawn Guard | 19 (original map) |
| 2. Whispering Grove | Protect refugees on a winding forest trail | 29 |
| 3. Dawn Keep | Defend the last beacon until the guard rallies | 25 |

Each chapter has a different path and palette. The beacon gate, IN/OUT markers,
movement, placement rules, and escape warning all use the selected map's path.
Story text and palettes are in `src/data/levels.ts`.

All three chapters are available immediately. Choosing PLAY starts that chapter
fresh: 10 lives, 0 kills/towers, wave 1 waiting for manual input, and no old
enemies/projectiles/effects. Choosing the current chapter replays it. Restart/R
replays the current chapter, with the menu closed and audio preference preserved.
The story menu opens automatically only on first launch; a page reload returns
to Border Watch and resets that first-launch state.

The level menu blocks map clicks and build/Start Wave/help controls while open.
Esc or CLOSE dismisses it. Restart and audio remain available in the sidebar.
Opening the level menu closes help and clears placement/inspection selection.

Win chapter one/two to reveal **NEXT LEVEL**. Clicking it starts a fresh match on
the next map; its first wave still waits for input. No chapter advances
automatically. The final chapter ends the story and offers Restart or level
selection. There are no unlock requirements or persistent campaign scores.

## Waves, lives, and outcomes

These rules apply separately to every chapter:

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
The result panel shows the wave reached, kills, remaining lives, and towers built.

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

M7 adds visual feedback without changing combat:

- A tower's muzzle flashes for 100ms when it actually fires.
- A surviving enemy flashes white for 120ms when its HP decreases. Multiple hits
  in one frame share one flash; lethal hits show a pixel burst instead.
- A killed enemy leaves a small pixel burst that fades over 180ms. Escaped enemies
  and enemies cleared at match end do not produce death bursts.
- Each actual lost life flashes the exit tile for 240ms and pulses the LIVES text
  red for 400ms, then restores it. Closely grouped escapes restart the warning.

These effects never apply damage or delay enemy removal. Effects already running
may finish after the result appears; no new shots or enemies are created. Restart
clears the scene's display objects and tweens, including all active effects.

M10 adds short generated tones for shots, nonlethal hits, kills, and escapes.
Lethal hits use the kill cue instead of a separate hit cue. Closely grouped hits
on one surviving enemy share one hit cue per frame. Audio never changes damage,
cooldowns, wave timing, or removal. Existing tones can finish after the result;
Restart and mute stop all active tones. Muted/suspended audio does not queue old
events to play later. Up to 16 tones may overlap; extra cues are skipped, and an
escape warning replaces other active tones so the lost life remains audible.

Combat constants are in `src/config/combatConfig.ts`; wave counts, spawn interval,
and starting lives are in `src/config/waveConfig.ts`.

## Quick play checks

On Border Watch, test victory by placing towers on these zero-based tiles:

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

### Milestone 11 verification status

The approved expansion direction is fantasy maps/story, followed by enemy/tower
variety and stronger visuals. M11 implements the campaign foundation only:
three chapter definitions, a story/selection panel, selected-map rendering and
path usage, fresh matches on selection, and manual NEXT LEVEL after victory.
The initial chapter preserves the original path and combat/wave rules.

- Added 11 tests in `levels.test.ts` for the original map, three unique chapters,
  path bounds/continuity, valid placement, and movement along each actual route.
- A separate static coordinate check passed for all three definitions: 19/29/25
  path tiles, no repeated cells, no diagonal/gapped steps, and valid edge endpoints.
  This check does not execute Vitest or Phaser.
- `npm run test` and `npm run build` were attempted after M11 implementation. Both
  exited before their scripts ran with Node `EPERM: operation not permitted,
  lstat 'C:\Users\Admin'`. The new tests and M11 build are not yet confirmed.
- Source review covered shared selected-path use, input blocking, fresh-match
  transitions, Restart's selected chapter, and captured NEXT LEVEL callbacks.
  Browser verification of all three maps and repeated transitions is pending.
- No dependencies were added. Enemy/tower variety remains for subsequent
  milestones in [docs/roadmap.md](docs/roadmap.md).

### Milestone 10 verification status (previously recorded)

The approved M10 scope is combat audio with an on/off button. `CombatAudio.ts`
generates tones using Phaser's shared Web Audio context/destination; it does not
create or close an AudioContext. `GameScene.ts` owns the default-off preference,
toggle, actual-event triggers, and scene cleanup. `Enemy.refreshHealthBar()` now
reports whether HP decreased so the scene can emit a nonlethal hit cue.
No dependencies, audio assets, or system/game-rule changes were added.

- Added five `CombatAudio.test.ts` tests for default mute/suspended context,
  mute/unmute without replay, natural completion, repeated cleanup without closing
  the shared context, and escape-warning priority.
- `npm run test` and `npm run build` were attempted after M10 implementation. Both
  exited before their scripts ran with Node `EPERM: operation not permitted,
  lstat 'C:\Users\Admin'`. The new tests and M10 build are not yet confirmed.
- Source review covered cue ownership, node cleanup, shared-context use, silent
  fallback, and Restart preference retention. Browser checks of audible output,
  volume, tab switching, and repeated Restart are pending.

### Milestone 9 verification status (previously recorded)

The approved M9 scope is B/N/R shortcuts and matching in-game instructions.
Keyboard and mouse controls share handlers in `GameScene.ts`, preserving existing
placement, wave-start, and Restart rules. `createHelpPanel.ts` and this README
document the keys. No dependencies or system logic were changed.

- `npm run test` and `npm run build` were attempted after M9 implementation. Both
  exited before their scripts ran with Node `EPERM: operation not permitted,
  lstat 'C:\Users\Admin'`. M9 test/build success is not yet confirmed.
- Source review covered key-repeat guards, help/result restrictions, immediate
  placement preview when the pointer is over the game, and B/N/R listener cleanup.
- Browser checks of shortcuts, held keys, mixed mouse/keyboard input, and repeated
  Restart are pending. Use the checklist below.

### Milestone 8 verification status (previously recorded)

The approved M8 scope is in-game instructions. The panel uses existing game
constants and Phaser display objects, with no dependencies or game-rule changes.
`createHelpPanel.ts` renders the panel; `GameScene.ts` owns availability and input.

- `npm run test` and `npm run build` were attempted after M8 implementation. Both
  exited before their scripts ran with Node `EPERM: operation not permitted,
  lstat 'C:\Users\Admin'`. M8 test/build success is not yet confirmed.
- Source review covered wave gating, map-click blocking, close-button event
  propagation, Restart availability, and H/Esc listener cleanup.
- Browser checks are pending: keyboard/button controls, text fit after resizing,
  click blocking, and repeated Restart with help open. Use the checklist below.

### Milestone 7 verification status (previously recorded)

The approved M7 scope is muzzle, hit, kill, and escape feedback. Implementation
changes only `Tower.ts`, `Enemy.ts`, `GameScene.ts`, and this README. Effects use
Phaser's existing Graphics/Tween support; no dependencies or system logic changed.

- `npm run test` and `npm run build` were attempted after M7 implementation. Both
  exited before their scripts ran with Node `EPERM: operation not permitted,
  lstat 'C:\Users\Admin'`. M7 test/build success is not yet confirmed.
- Source review checked actual-shot/HP/life triggers, entity removal, layering,
  and tween lifecycle. Phaser's scene TweenManager cancels its tweens on shutdown;
  enemy removal also cancels the enemy's hit flash before destroying its sprite.
- Browser verification of visual timing, edge towers, result transitions, and
  Restart during active effects is pending. Use the acceptance checklist below.

### Milestone 6 verification status (previously recorded)

M6 adds tower inspection and path guides. Range and combat stats use the existing
combat constants. Build mode keeps its placement behavior, including rejection of
occupied tiles. Escape after a result preserves the locked button and match text.
No dependencies, combat rules, wave rules, or system logic were changed.

- `npm run test` and `npm run build` were attempted after M6 integration. Both
  exited before their scripts ran with Node `EPERM: operation not permitted,
  lstat 'C:\Users\Admin'`. M6 test/build success is not yet confirmed.
- Source review covered input routing, map clipping, draw order, and scene cleanup.
  Browser checks of inspection, guides, resizing, and repeated Restart are pending.

### Milestone 5 verification status (previously recorded)

M5 changes presentation only: range preview, button states, and result statistics.
No dependencies, combat settings, wave rules, or system logic were changed.

- `npm run test` and `npm run build` were attempted in the agent environment.
  Both exited before their scripts ran with Node `EPERM: operation not permitted,
  lstat 'C:\Users\Admin'`. M5 test/build success is not yet confirmed.
- Browser verification of M5 is still pending. Run the commands above locally,
  then use the acceptance checklist below in both development and production.

### Milestone 4 baseline results (previously recorded)

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

- [ ] Reload: confirm the first-launch story menu has three readable chapters.
      Choose PLAY or close with Esc; confirm no enemy appears before Start Wave.
- [ ] Play each map: compare the path with markers, movement, placement rejection,
      and exit warning. Check distinct palettes and the gate below enemies/HP bars.
- [ ] Open LEVEL while building/inspecting: selection must clear; B/N/H and map
      clicks must not act through the menu. Closing it must restore valid controls.
- [ ] During a wave, confirm level selection is disabled while building/Restart
      continue to work. Check it becomes available between waves and after results.
- [ ] Select/replay a chapter after building or losing lives: confirm 10 lives,
      0 kills/towers, no old entities/effects, and a manually waiting first wave.
- [ ] Win Border Watch, click NEXT LEVEL, then repeat through Dawn Keep. Check
      fresh state each time, no automatic waves, and no NEXT LEVEL after chapter 3.
- [ ] Restart/R on maps 2 and 3, including with menus open: keep that map selected,
      close panels, clear match state, preserve audio choice, and avoid duplicate
      spawns or listeners. Repeat level changes and inspect the browser console.
- [ ] Reload the page: AUDIO: OFF is the default. Play briefly while muted and
      confirm silence. Enable audio and hear new shot/hit/kill/escape cues only.
- [ ] Mute during combat: all current tones should stop immediately. Unmute and
      confirm old events are not replayed; shots without impact must not make hit
      sounds, and an escape must not make a kill sound.
- [ ] Restart with R and the button while sounds play; old tones must stop, while
      the selected AUDIO: ON/OFF preference remains. Repeat after victory/defeat.
- [ ] Toggle audio with help open and after a result; check labels update without
      placing towers or starting a wave. Check the button fits after resizing and
      in production preview.
- [ ] Switch away from and back to the tab: suspended audio must not accumulate a
      burst of old cues. With many towers, check volume stays reasonable and the
      escape warning remains audible. Check the console for audio errors.
- [ ] If Web Audio is unavailable, confirm AUDIO UNAVAILABLE is disabled while
      all game controls, combat, and outcomes still work normally.
- [ ] Press B over grass: show building selection/preview immediately. Press B
      again to cancel, then repeat using BASIC TOWER/CANCEL BUILD. A pointer
      outside the game must not show a stale placement preview when B is pressed.
- [ ] Hold B: selection must toggle once per press, including during a wave.
      Check grass/path/occupied placement and Esc after mixing keyboard and mouse.
- [ ] Press N when ready: start one wave. Press/hold N during that wave and keep
      holding until it clears; the next wave must still wait for a new press.
- [ ] With help open, B/N must leave towers, selection, and wave unchanged. R must
      restart the whole match and close help, just like the RESTART button.
- [ ] Press R before/during a wave and after victory/defeat. Hold R and confirm
      only one reset occurs per press. After a result, B/N must remain inactive.
- [ ] Restart repeatedly using mouse and R; verify B/N/R/H each act only once per
      press and that text, buttons, inspection, and all effects reset correctly.
- [ ] Before wave 1, open help using HOW TO PLAY and H. Confirm instructions and
      tower stats match the game and fit at the normal size and after resizing.
- [ ] Close with H, Esc, and CLOSE. Holding H should not repeatedly toggle help.
- [ ] Open help while building/inspecting; selection must clear. Map clicks and
      clicks on CLOSE must not place/select a tower or start a wave.
- [ ] During a wave, confirm HELP AFTER WAVE is disabled and H does not open help;
      placement, movement, combat, and spawn timing must continue normally.
- [ ] Open help between waves and after victory/defeat. Close it and confirm
      correct build/Start Wave availability, including BUILD LOCKED after a result.
- [ ] Click RESTART with help open, then repeat H/Esc several times. Confirm the
      panel starts closed and one key press causes only one toggle after restart.
- [ ] Confirm the map dimensions, orthogonal path, sidebar, and crisp graphics.
- [ ] Check placement previews, occupied/path rejection, Esc, and resizing.
- [ ] Check the 128px range circle on grass, path, and occupied tiles; it must
      stay inside the map and disappear on Esc, pointer exit, and match end.
- [ ] Check BASIC TOWER / CANCEL BUILD / BUILD LOCKED states and the dimmed,
      disabled wave button during play and after the result.
- [ ] Outside build mode, click a built tower and confirm the blue range circle
      and stats match 128px / 1s / 1 DMG without changing the tower count.
- [ ] Move the pointer and click another tower; only the selected tower's range
      should remain. Check map clipping on edge and corner towers after resizing.
- [ ] Click grass/path without a tower or press Esc to close inspection. Sidebar
      and footer clicks should not select towers or change the tower count.
- [ ] Enter build mode while inspecting a tower; inspection must close and an
      occupied tile must still reject placement rather than select the tower.
- [ ] Check IN / OUT labels and arrows at every turn; enemies and HP bars must
      remain visible above the markings.
- [ ] Verify no enemies appear before Start Wave.
- [ ] Watch several enemies move simultaneously with individual HP bars.
- [ ] Verify muzzle flashes happen only when a shot is fired, with none while
      idle or cooling down. Check edge/corner towers do not flash over the sidebar.
- [ ] Watch surviving enemies flash on actual damage while HP bars stay readable.
      Expired projectiles must not flash or damage a replacement enemy.
- [ ] Check one pixel burst per kill at the enemy's last position, including
      multiple kills in one frame; escapes must not show a death burst.
- [ ] Start without towers: each lost life must trigger the exit/LIVES warning,
      then restore the normal LIVES appearance without changing other HUD text.
- [ ] Check that towers prioritize enemies further along the path when in range.
- [ ] Verify wave counts are exactly 5, 8, and 12, with one-second spacing.
- [ ] Verify the next wave waits until the current wave clears and you click Start.
- [ ] Play through victory using the example layout.
- [ ] Play through defeat without towers and check one lost life per escape.
- [ ] Compare the result panel's wave, kills, lives, and towers with the sidebar.
- [ ] Check that placement and Start Wave stop after the result.
- [ ] Finish a match while inspecting a tower; its range must disappear. Press
      Esc after the result and confirm BUILD LOCKED and match text stay intact.
- [ ] Restart during play and after each outcome; confirm full state reset.
- [ ] Restart repeatedly while muzzle/hit/death/escape effects are active. Confirm
      no old flashes, bursts, or delayed color changes appear in the new match.
- [ ] After the result, allow current effects to finish; confirm no new shots,
      damage, spawns, or changes to lives/kills occur.
- [ ] After Restart, confirm BASIC TOWER and START WAVE 1 are available and
      there is no range preview, tower inspection, or previous result panel.
- [ ] Repeat in production preview; confirm no FPS/development label.
- [ ] Confirm there are no browser console errors.

## Project structure

- `src/config`: dimensions, combat constants, and wave/life settings.
- `src/data`: chapter stories, palettes, orthogonal paths, and the original map.
- `src/systems`: pure movement, placement, combat, and wave/match logic.
- `src/entities`: Phaser enemy, tower, and projectile presentation.
- `src/scenes`: rendering, input, wave/combat orchestration, and result UI.
- `src/tests`: movement, map, placement, combat, and wave unit tests.

## Scope and build notes

M4 adds waves, multiple enemies, lives, victory/defeat, and Restart.
M5 adds a map-clipped range preview, explicit build/wave button states, Restart
hover feedback, and match statistics on the result panel. The preview uses the
existing combat range constant, and statistics use the existing match state.
M6 adds inspection of built towers and path entry/exit/turn guides. The small
`src/scenes/drawPathGuides.ts` renderer keeps static ground markings separate from
scene input and combat orchestration; scene shutdown owns its display objects.
M7 adds short muzzle/hit flashes, pixel death bursts, and exit/lives warnings.
Visual triggers follow existing combat results, while entity removal and match
timing remain immediate. Scene-owned tweens handle animation and Restart cleanup.
M8 adds a HOW TO PLAY panel and H/Esc controls, available outside active waves.
The panel covers the map while Restart remains accessible in the sidebar.
M9 adds B/N/R shortcuts using the same scene handlers as their mouse buttons,
ignores repeated keydown events, and updates help/footer instructions.
M10 adds optional generated combat tones, a sidebar audio toggle, resource cleanup
on mute/Restart, and audio lifecycle unit tests. The UI preference persists across
Restart; game state still resets completely. Phaser handles context unlocking and
tab suspension/resume. The game stays playable without Web Audio.
M11 adds the three-map fantasy campaign, story menu, level selection, map palettes,
beacon gate, and manual next chapter. Combat and waves remain the same per map.
Enemy and tower variety is planned next; economy, upgrades, and selling remain out
of scope. See [docs/roadmap.md](docs/roadmap.md) for the expansion sequence.

No dependencies were added. The previously recorded M4 build passed with Vite's
warning about a JavaScript chunk larger than 500 kB because it includes Phaser.
M5 through M11 build verification is pending as described above.

## Agent workflow and hooks

The execution policy and review workflow are in [AGENTS.md](AGENTS.md).
Read [docs/guardrails.md](docs/guardrails.md) for activation, verification,
manual commit/push confirmation, and security limitations.

```bash
npm run test:hooks
```

Hook checks use Node's built-in test runner and add no dependency.
The project currently has no lint script; do not report lint as passed.
