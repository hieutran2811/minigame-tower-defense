# Mini Tower Defense — Milestone 1

A minimal desktop-browser tower defense starter built with Phaser 3, TypeScript,
and Vite. Graphics use procedural pixel-style shapes and require no external art
assets.

## Requirements

Node.js LTS and npm.

## Run in development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually http://localhost:5173).
FPS and the development build label appear only in this mode.

## Verify

```bash
npm run test
npm run build
npm run preview
```

Open the URL printed by the preview command to check the production build.
Production hides FPS and the development build label.

### Automated checks

The tests cover movement timing, exact corners, multiple corners in one update,
stopping at the endpoint, nonpositive elapsed time, invalid paths and speeds,
and keeping the supplied waypoints unchanged.

Map tests check dimensions, tile bounds, orthogonal adjacency, and movement
through the actual path centers across two follower lifecycles. These tests
exercise pure logic; they do not verify Phaser rendering or scene respawning.

### Manual acceptance checklist

Run development mode and check:

- [ ] The logical canvas is 960×640 with a 12×8 map of 64px tiles and a sidebar.
      The canvas scales to fit the browser window.
- [ ] Exactly one purple enemy follows the brown path through every corner.
- [ ] The enemy stays centered on the path and never cuts diagonally.
- [ ] Watch at least two full trips; the enemy respawns at the entrance each time.
      Each trip takes about 12 seconds at the configured speed.
- [ ] FPS appears in the sidebar and updates while the game runs.
- [ ] Graphics remain crisp when resizing the browser window.
- [ ] The browser console has no errors.

Run the production preview and check:

- [ ] The map and looping enemy still work.
- [ ] FPS and the development build label are absent.
- [ ] The browser console has no errors.

Leave manual items unchecked until verified in a browser.

## Project structure

- `src/config`: canvas and tile dimensions.
- `src/data`: fixed path in tile coordinates.
- `src/systems`: pure TypeScript movement logic, without Phaser imports.
- `src/entities`: enemy presentation and lifecycle.
- `src/scenes`: map rendering, HUD, and enemy respawning.
- `src/tests`: movement and map unit tests.

## Scope

Milestone 1 only: a fixed map and one looping demo enemy. HUD values are
placeholders. No towers, combat, economy, or waves are implemented.

The production build may warn about a JavaScript chunk larger than 500 kB because
it includes Phaser. This does not prevent the build from completing.
