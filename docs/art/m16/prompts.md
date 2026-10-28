# M16 image briefs

The skill instructions were read from the user-provided workspace copy. After
the user updated the hook, imagegen built-in generated the concept board, two
full-UI mockup candidates, and a map-only candidate. The board and map-only PNG
are saved in this folder and used by [review.html](review.html).

[generation-log.json](generation-log.json) contains the exact requests, native
dimensions, selected output paths and reasons for not selecting the two UI
candidates. [board-request.json](board-request.json) preserves the board request.
The briefs below record the original intent; the actual mockup approach separates
raster world art from a code-native UI frame to keep the viewport dimensions exact.
The artwork still differs from the canonical geometry; this remains for human review.

## A. Shared art-direction board

Create a cohesive landscape art-direction board for an original 2D hand-painted
fantasy tower defense game, The Last Beacon. Use a three-quarter overhead view
suited to a square-tile game. Soft painted materials, clear readable silhouettes,
consistent upper-left daylight, subtle shadows, warm parchment presentation.

Arrange three columns with generous spacing. The top row contains full-body
enemy concepts: (1) a small moss-green goblin raider with pointed ears, a hunched
back, chipped short blade, worn purple tunic and loot pouch; (2) a slender green
goblin scout leaning into a run, long legs, a short ochre-orange cape, leather
hood and two small daggers; (3) a broad armored ogre with tusks, dark blue-gray
iron shoulder armor, a reinforced wooden shield and a worn purple Hollow emblem.
Their body shapes must be distinct at small size, with coherent clan motifs.

The middle row contains three matching Dawn Guard defense towers on compact
square stone-and-oak bases: a blue-steel single crossbow watchtower with a small
blue/gold banner; a lower green-trimmed rapid repeater with two crossbow limbs
and a visible bolt magazine; a taller amber-wood longbow tower with long bow
limbs, taut string and reinforced stonework. Keep their mechanisms and materials
believable and their aiming parts distinguishable from fixed bases.

The bottom row contains three small environment vignettes sharing the same
painting style: warm border grass and a dirt road with a crude goblin timber
entry and a Dawn watchpost gate; a mossy forest trail with low roots, an old-root
entry arch and a moss-covered defense gate; and a cracked-stone keep approach
with ruined entry masonry and the golden last beacon over the fortress gate.
Use subdued ground values, restrained violet enemy motifs and warm gold beacon
light. Concept details must support final enemy heights of about 36–48 pixels
and 64-pixel game tiles. Avoid tiny ornamental clutter that vanishes at that size.
Use minimal headings if needed; leave clean margins. This is a concept board,
not a sprite sheet, screenshot or production atlas.

## B. Border Watch mockup

Use the approved board as the style reference. Create a hand-painted fantasy
tower defense gameplay mockup at the composition ratio 960:640. The play map
occupies the left 768 by 512 area, the right sidebar is 192 pixels wide, and the
bottom-left 768 by 128 area is reserved for the existing footer. Keep the view
orthogonal in screen coordinates while painting buildings and characters from
three-quarter overhead. Maintain the board's upper-left light and materials.

Use a 12-column, 8-row logical map with 64-pixel square tiles. Follow this exact
ordered road in zero-based tile coordinates:

```text
(0,3) (1,3) (2,3) (3,3) (3,4) (3,5) (4,5) (5,5) (5,4)
(5,3) (5,2) (6,2) (7,2) (8,2) (8,3) (8,4) (9,4) (10,4) (11,4)
```

The timber goblin entry sits within tile (0,3) centered at pixel (32,224).
The small Dawn stone-and-timber fortress gate and warm beacon fit within tile
(11,4) centered at (736,288). Ground is muted warm grass with small corner
plants, wheel-worn dirt and sparse pebbles. Keep the road and empty buildable
ground readable.

Place illustrative towers only on these empty-ground tiles: Basic at (1,2)
and (4,4), Rapid at (3,2) and (1,4), Longbow at (4,3) and (9,3). All bases fit
one tile. Show only purple-clothed goblin raiders on the road in this chapter;
other monster variants belong to the board. Add restrained ground shadows,
readable thin HP bars and a few bolts/arrows without covering the route.

Use the SVG layout guide for geometry when the image workflow supports it.
The guide's block shapes and labels are placeholders; apply the approved painted
art to them. Sidebar/footer retain their space and hierarchy. Any UI values are
illustrative, not recorded playtest results. This is an art mockup, not an image
of a working new runtime.

## C. Scale review after generation

Inspect the generated board and mockup at the actual target canvas size, plus
close crops of the enemy cluster, the three tower types, entry and exit. Record
which small details survive downscaling, any change needed in palette/outline,
and deviations from the SVG geometry. Only mark outputs review-ready after this
inspection; production frame/alpha/pivot work belongs to M17 and later.
