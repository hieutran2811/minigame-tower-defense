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

Implemented in code, awaiting automated/browser acceptance:

- Basic stays 128px / 1s / 1 damage. Rapid starts at 96px / 0.4s / 1 damage;
  Longbow starts at 192px / 1.5s / 2 damage. All retain free placement.
- Three type buttons choose the profile used by B / BUILD. Switching during
  building updates preview; inspecting uses the placed tower's own profile.
- Green twin-barrel and amber bow silhouettes plus shot colors distinguish the
  additions. Help lists all profiles; Restart/chapter changes select Basic again.
- Reuse pure targeting/cooldown/projectile algorithms. Damage comes from the
  firing tower; projectile speed, original-target ownership, and all waves stay
  unchanged. No splash, slowing, piercing, economy, upgrades, or selling.
- Entity-level tests stub drawing but exercise actual Tower/Projectile wiring.
  Test/build execution is blocked as recorded in the README. Browser text fit,
  controls, and balance against M12 enemies remain for human acceptance.

## M14: graphics and gameplay polish

Rendering implemented; automated/browser acceptance and balance playtests pending:

- Deterministic flat terrain details distinguish border/forest/ruins; route-edge
  shoulders and sparse pebbles retain readable paths. Empty ground stays buildable.
- A crenellated gate and one ambient beacon pulse fit inside each map's exit tile.
- Ground shadows, feet, horns/cape/armor, tower masonry and a bow string enrich
  silhouettes. Walking moves only the figure; combat positions/HP bars stay stable.
- Reuse existing rendering APIs and lifecycle. No dependencies, stat changes,
  wave changes, new obstacles, or extra enemy/tower mechanics.
- Six entity presentation tests protect combat coordinates, HP and cleanup; tower
  test fixtures only gain drawing methods. npm test/build are blocked as recorded
  in the README, so those tests and production output remain unconfirmed.
- Use [playtest-M14.md](playtest-M14.md) for nine chapter/type comparisons and
  production rendering, scaling, repeated Restart, audio cleanup, and console
  checks. FPS/development labels remain development-only. No balance conclusions
  are made before playing these runs.

## M15: combat and wave feedback

Implemented as the next visual improvement, awaiting automated/browser acceptance:

- Shaped Basic sparks, compact Rapid bolts, and Longbow arrows turn along their
  actual homing motion, reusing the existing pure projectile logic.
- Floating numbers report HP actually removed, combining hits per enemy/frame
  and excluding overkill, escapes, cleanup, and expired projectiles.
- One short banner reports the wave number/count after manual start without
  blocking input, adding a countdown, or delaying the first spawn.
- Scene-owned text/containers fade and clean up; no new keys, dependencies,
  profiles, stats, levels, mechanics, or campaign rules.
- Five feedback tests extend the existing entity suite. npm test/build remain
  blocked as recorded in the README; clustered readability, scaling, production,
  and Restart/audio/browser-console verification remain for human review.

## Approved M16–M20 plan: illustrated fantasy art

The user selected hand-painted 2D fantasy with a three-quarter overhead view.
The plan in [art-plan.md](art-plan.md) was approved on 28 October 2026.
Implementation proceeds one milestone at a time, reviewing each result before
continuing. The [M16 review package](art/m16/README.md) now contains selected
concept/map PNGs and a [960x640 preview](art/m16/review.html) with a source overlay.
The user approved continuing into M17 with this art direction. Generated-map
geometry remains a concept limitation; runtime map geometry stays defined by source.

| Milestone | Reviewable result |
| --- | --- |
| M16 | Shared concept board and a Border Watch mockup at actual game scale; palette, character silhouettes, towers, entrance and fortress direction |
| M17 | Goblin raider, Goblin scout and armored Ogre sprites/animation for the existing Basic/Runner/Guard roles |
| M18 | Three illustrated Dawn Guard towers with fixed bases, aimed upper parts, matching arrows/bolts and portraits |
| M19 | Three terrain sets, entry gates and fortress gates fitted to existing map paths and buildable tiles |
| M20 | Chapter/fortress illustrations, matching UI art, and full browser/performance/gameplay acceptance |

Existing IDs, stats, path coordinates, placement and wave/outcome rules stay the
reference. Art source/export/alpha/pivot checks, filtering at the current canvas
size, cleanup, test/build and manual acceptance are detailed in the art plan.
The current item is [M17's three illustrated enemies](art/m17/README.md).
The user approved separate atlas metadata, then requested finer leg motion.
The current revision uses eight walk poses per direction with distance-based
phase through turns/idle/long frames. There are 116 new poses plus four original
Ogre death frames; the new Ogre death silhouettes were rejected after three
attempts. Four runtime PNGs total 9,142,407 bytes, exceeding the suggested 8MB art
budget. The [v1/v2 preview](art/m17/walk-v2/review.html), crop/pivot/alpha data and
tradeoffs are recorded. Test/build and browser/performance acceptance remain
pending. Review M17 before beginning M18.

Economy, upgrades, selling, backend, and multiplayer are not introduced by this
roadmap. Further business-rule or dependency changes remain separate review items.
