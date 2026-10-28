# The Last Beacon expansion

The requested direction is a fantasy tower defense game about protecting a
fortress, with more maps, story, enemy types, tower choices, and stronger visuals.
Implementation stays one reviewable milestone at a time.

## M11: campaign maps and story

- Three chapters: Border Watch, Whispering Grove, and Dawn Keep.
- Keep the original map as chapter one. All chapters retain the 12x8 grid,
  64px tiles, 960x640 canvas, and orthogonal path movement.
- Distinct map palettes and a procedural beacon gate at the exit.
- A story/level menu on first launch and from the sidebar outside active waves.
  All chapters are available for practice; selecting PLAY starts that map fresh.
- NEXT LEVEL after winning chapters one/two advances manually. Chapter three
  closes the story. Restart replays the current chapter.
- Preserve combat constants, 10 starting lives, and manually started 5/8/12 waves
  on every map. No campaign score, unlock requirements, or saved progress yet.
- Validate every map's bounds, continuity, placement, and movement; manually
  verify selection, next chapter, Restart, input blocking, and resource cleanup.

This milestone establishes the data and navigation needed by the next features.
Its code is implemented; automated/browser acceptance is pending as recorded in
the main README.

## M12: enemy variety and wave composition

Implemented in code, awaiting automated/browser acceptance:

- Basic stays at 3 HP / 95px/s. Runner starts at 2 HP / 140px/s; Guard starts at
  7 HP / 65px/s, without armor reduction or other special abilities.
- Diamond/R and larger shield/G silhouettes distinguish the new kinds. HP bars
  use each profile's maximum HP; help lists stats and the footer previews waves.
- Ordered lists in level data keep 5/8/12 counts. Border Watch stays all Basic;
  Grove introduces Runner in wave 1 and Guard in wave 2; Dawn Keep mixes all three.
- Preserve each scheduled index/age through long frames and use the kind's own
  speed. The numeric WaveSystem API and combat systems stay unchanged.
- Review these initial speed/HP values by playing through the mixed chapters
  before accepting balance.
- Preserve path-progress targeting, live-target projectile ownership, one lost
  life per escape, and immediate defeat at zero lives.

## M13: tower choices

- Keep Basic Tower unchanged as a reference.
- Add contrasting options such as a short-range rapid tower and a long-range,
  slower tower; review range/cadence/damage tradeoffs against M12 enemies.
- Extend selection, preview, inspection, and help to display each tower's stats.
- Introduce special mechanics such as splash or slowing only as an explicitly
  reviewed change, with tests for target ownership and effect rules.

## M14: graphics and gameplay polish

- Give enemies and towers recognizable pixel silhouettes, beyond palette swaps.
- Add terrain details, stronger beacon/fortress art, shadows, and restrained
  animation while keeping paths, HP bars, previews, and projectiles readable.
- Playtest wave composition and tower tradeoffs across all maps.
- Check production rendering, scaling, repeated Restart, audio cleanup, and the
  browser console. Keep FPS/development labels limited to development.

Economy, upgrades, selling, backend, and multiplayer are not introduced by this
roadmap. Further business-rule or dependency changes remain separate review items.
