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

Next proposed implementation:

- Keep the existing enemy as the baseline; add a fast, fragile runner and a slow,
  tougher guard with distinct silhouettes and readable HP bars.
- Describe wave composition in data and introduce the variants gradually across
  chapters, preserving manual wave starts and exact spawn accounting.
- Review speed/HP values and play through each chapter before accepting balance.
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
