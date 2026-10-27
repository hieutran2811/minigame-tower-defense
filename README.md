# Mini Tower Defense — Milestone 2

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

## Controls

1. Click **BASIC TOWER** in the sidebar to select the tower.
2. Move over the map: green marks an available grass tile; red marks a path
   tile or a tile that already contains a tower.
3. Left-click an empty grass tile to place a tower centered on that tile.
4. Selection stays active so you can place more towers.
5. Press **Esc**, or click **BASIC TOWER** again, to cancel selection.

The sidebar shows the number of towers placed and explains rejected placements.
Clicks in the sidebar or footer do not place towers. Towers remain until the page
reloads; placement is not saved. There is no placement cost in this milestone.
HP, GOLD, and WAVE remain placeholders.

## Verify

```bash
npm run test
npm run build
npm run preview
```

Open the URL printed by the preview command to check the production build.
Production hides FPS and the development build label.

### Automated checks

Movement tests cover timing, exact corners, multiple corners in one update,
stopping at the endpoint, nonpositive elapsed time, invalid paths and speeds,
and keeping the supplied waypoints unchanged.

Map tests check dimensions, tile bounds, orthogonal adjacency, and movement
through the actual path centers across two follower lifecycles.

Placement tests cover valid grass, duplicate towers, every path tile, map
boundaries, invalid coordinates, all four corners, previews without side effects,
filling available tiles, and independent placement state for a new scene.

### Verification results

- Unit tests: **28 passed** across three test files.
- TypeScript check and Vite production build: **passed**.
- Chrome headless smoke checks passed in both development and production:
  - Logical canvas measured 960x640.
  - Clicking without a selected tower did not place one.
  - Valid placement rendered a tower and updated the counter.
  - Occupied/path tiles were rejected with feedback.
  - Sidebar/footer clicks did not place towers.
  - Escape and clicking the selected tower button canceled placement.
  - Placement remained accurate after resizing the browser to 1200x800.
  - The demo enemy continued moving and respawned after towers were placed.
  - FPS and the development label were shown only in development.
  - No uncaught exceptions or console.error calls were observed.

Browser smoke checks used Canvas rendering, and screenshots were inspected.
Default WebGL rendering and visual sharpness across other screen sizes still
need manual verification.

### Manual acceptance checklist

Run development mode and check:

- [ ] The logical canvas is 960x640 with a 12x8 map of 64px tiles and a sidebar.
      The canvas scales to fit the browser window.
- [ ] Exactly one purple enemy follows the brown path through every corner.
- [ ] The enemy stays centered on the path and never cuts diagonally.
- [ ] Watch at least two full trips; the enemy respawns at the entrance each time.
      Each trip takes about 12 seconds at the configured speed.
- [ ] FPS appears in the sidebar and updates while the game runs.
- [ ] Select BASIC TOWER; check green previews on grass and red previews on
      path/occupied tiles.
- [ ] Place towers on several grass tiles, including map edges.
- [ ] Click a path tile and an occupied tile; no extra tower should appear.
- [ ] Click the sidebar/footer; the tower count should remain unchanged.
- [ ] Cancel with Esc and with the button; map clicks should then do nothing.
- [ ] Resize the window and verify that preview and placement follow the cursor.
- [ ] Graphics remain crisp, text fits the sidebar, and the console has no errors.

Run the production preview and check:

- [ ] Placement, cancellation, and the looping enemy still work.
- [ ] FPS and the development build label are absent.
- [ ] The browser console has no errors.

Leave manual items unchecked until verified in a browser.

## Project structure

- `src/config`: canvas and tile dimensions.
- `src/data`: fixed path in tile coordinates.
- `src/systems`: pure movement and tower placement logic, without Phaser imports.
- `src/entities`: enemy and tower presentation; Phaser manages scene objects.
- `src/scenes`: map rendering, HUD, placement input, and enemy respawning.
- `src/tests`: movement, map, and placement unit tests.

## Scope

Milestone 2 adds selection and placement of one basic tower type to the M1 demo.
Towers are static. Combat, targeting, projectiles, economy, waves, upgrades, and
selling are outside this milestone.

No dependencies were added for M2. The production build may warn about a
JavaScript chunk larger than 500 kB because it includes Phaser. This does not
prevent the build from completing.
