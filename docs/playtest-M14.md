# M14 playtest sheet

Status: not run in the agent environment. Node fails before npm scripts with
`EPERM: lstat 'C:\Users\Admin'`; browser/production acceptance is pending.

## Rendering and lifecycle

Run `npm run test`, `npm run build`, then `npm run preview` in your terminal.
Use both development and production views for the checks below.

- [ ] Each chapter has its own flat terrain details. All empty ground remains
      buildable; decorations never add obstacles or cover the path's markers.
- [ ] OUT, the gate, and the beacon fit inside the exit tile on all three maps.
      Enemy HP bars, projectiles, and the lost-life warning remain readable.
- [ ] Horned Basic, caped Runner/R, and armored Guard/G remain distinct when
      clustered. Feet/body move slightly; HP bars and ground shadows stay steady.
- [ ] Tower shadows, stone bases, Rapid barrels, and the Longbow string are clear.
      Check all three aiming directions, muzzle flashes, previews and inspection.
- [ ] Resize the window smaller/larger. Check pixel clarity, labels, click targets,
      map boundaries, sidebar stats and the two-column help panel.
- [ ] FPS and the development label appear only in development.
- [ ] Restart during movement, hit/death/escape effects and enabled audio. Repeat
      ten times and switch chapters. Check no duplicate listeners, enemies,
      flashes or tones, and no old objects or extra beacon animations.
- [ ] Test victory/defeat, NEXT LEVEL, help/menu blocking, held B/N/R/H keys,
      audio mute/unmute and tab switching. Inspect the browser console for errors.

The beacon has one ambient alpha tween per scene. It can continue behind menus
and the result overlay. Enemy walking uses traveled distance and creates no
timers or ongoing tweens. Both are presentation only.

## Campaign and tower comparison

Use these zero-based empty-ground tiles. Place eight towers before starting and
do not add towers during the match. For each chapter, repeat once with all Basic,
once with all Rapid, and once with all Longbow. Start every wave manually and
wait for every enemy to die or escape. These layouts compare the same positions;
they are not intended as optimal strategies or a promise that every type wins.

| Chapter | Eight tower tiles |
| --- | --- |
| Border Watch | (0,2) (1,2) (2,2) (3,2) (0,4) (1,4) (2,4) (4,3) |
| Whispering Grove | (1,2) (3,2) (4,2) (6,2) (7,3) (6,5) (8,5) (9,5) |
| Dawn Keep | (0,5) (2,5) (4,5) (2,2) (4,2) (7,2) (8,4) (10,4) |

| Chapter | Towers | Lives after waves 1 / 2 / 3 | Kills / result | Observations |
| --- | --- | --- | --- | --- |
| Border Watch | Basic | pending | pending | Baseline regression |
| Border Watch | Rapid | pending | pending | Short range and fast cadence |
| Border Watch | Longbow | pending | pending | Range versus slower cadence |
| Whispering Grove | Basic | pending | pending | Runner overtaking, Guard introduction |
| Whispering Grove | Rapid | pending | pending | Short-range coverage gaps |
| Whispering Grove | Longbow | pending | pending | Damage and wasted finishing shots |
| Dawn Keep | Basic | pending | pending | Mixed formations and late Guards |
| Dawn Keep | Rapid | pending | pending | Guard damage in short windows |
| Dawn Keep | Longbow | pending | pending | Long approach coverage |

Border Watch/Basic should retain the previously recorded 25 kills and 10 lives.
Compare the nine runs before proposing stat or wave changes. Record leaks,
overkill, readability, and cases where one option is consistently stronger.
M14 does not adjust balance without observations from these runs.

During separate diagnostic runs, verify a full-health Runner takes one Longbow
hit and a Guard takes four; Rapid fires one projectile per shot. Under CPU
throttling, check exact 5/8/12 spawns, original-target damage, and waiting for slow
Guards before the next wave. Finish with a mixed-tower run on each chapter.
