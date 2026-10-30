# The playfield: 40×22 at 1:1, migrated levels, and D-19 auto-tiling

Evidence: `pilot-evidence/playfield_w1_l1.png` … `playfield_w5_l5.png` — five real levels rendered
at the real geometry, 1280×704, one source pixel per screen pixel.

---

## 1. The geometry (REVIEW.md §4)

| | before | after |
|---|---|---|
| grid | 32 × 30 | **40 × 22** |
| pixels | 1024 × 960 | **1280 × 704** |
| SCALE | 0.60 | **1.0** |
| origin | 333, 72 | **0, 8** |

The old field was taller than it was wide, so fitting it into a 16:9 window meant squeezing it to
0.60× — which resampled every asset in the project and threw away 40% of the pixel grid all this
art is authored on. 40×22 is the window's full width and its height less an 8 px letterbox, so
nothing is ever resampled. Landscape also suits the game: lanes run left→right, width is where
the interesting decisions live, and the eight rows lost were mostly margin.

**The HUD now floats over the field** (D-07) rather than flanking it, which means the outer rows
sit under the resource strip and the build tray. Those rows are decorative by contract:

- `CursedHoardGame.SAFE_ROW_LO/HI` = **rows 3…19** — 17 playable rows.
- `LevelBuilder.INSET` = 3, which yields rows 3…18 for generated levels.
- `gen-maps.mjs --check` refuses to write a level whose lane leaves the safe rect.
- Two soft gradients (`drawHudScrim`) sit the HUD on something without turning it back into a panel.

The playfield frame is gone; the field is full-bleed with 8 px of black top and bottom.

---

## 2. The 25 levels, re-cut

The `.map` files are *derived* — `LevelMaps.build()` + `MapExporter` produce them. Re-gridding by
resampling would have squashed 30 rows into 22 and pulled parallel lanes together until the
2-wide stamps merged. So the 25 waypoint polylines were **re-authored** for the landscape field,
keeping each world's design language (W1 rolling S-bends, W2 switchbacks, W3 wide dune arcs, W4
formal geometry, W5 jagged combs) and adding one new rule: every lane's opening segment is
horizontal, so the spawn extends to a side border rather than off the top or bottom — which on
this field is under the HUD.

### Regenerating them without a JDK

There is no `javac` in this environment, so `MapExporter` cannot be run. `scripts/gen-maps.mjs`
is a faithful port — including a bit-exact `java.util.Random` and `Math.fround` at the float
boundaries — and it is **proved faithful**: fed the *old* 32×30 waypoint tables it reproduces all
25 shipped `.map` files **byte for byte**. Only then were the new tables generated.

The script validates before it writes — anchors inside the safe rect, no self-crossing polyline,
parallel lanes ≥ 3 rows apart — and then audits the finished blueprint: exactly one spawn and one
cave, the cave reachable from the spawn by BFS over PATH cells, and enough buildable ground to be
a level.

```
25 lanes validated — 0 problem(s)
wrote 25 maps · 16812 cell records · 2291 decor placements
audit: 25/25 clean · leanest level has 283 buildable cells
```

### ⚠ A real engine bug the audit caught

`LevelMaps.spur()` — the short access road to a major keep — wrote `PATH` over whatever it
crossed, **including the cave marker**. When that happened, `BlueprintLevel`'s BFS had no
destination and the level was unplayable. It had never fired on the old layouts and fired
immediately on w5\_l5's new one. Fixed in both the Java and the port: a spur never demotes a
route endpoint.

---

## 3. D-19 auto-tiling

`TileResolver` was dead code twice over: it built `terrain_*` keys when every sprite in the atlas
is named `tile_*`, and nothing called it. It was also a 4-bit cardinal mask, which cannot express
a corner — so even wired up it would have left a hard 90° staircase wherever two materials meet.

### Layered overlays, not a blob set

A 47-piece blob tileset costs art per *pair* of materials: five biomes × (base, path, water) is
several hundred authored tiles, and a sixth biome would cost another eighty. Instead each material
that stacks gets **one 12-piece kit** — 4 sides, 4 outer corners, 4 inner corners — drawn as a
transparent overlay on the neighbouring cell. Cost is linear in materials, kits compose, and the
editor never places a transition tile by hand. That is the whole of D-19.

Priority is BASE < WATER < PATH, so a stream meeting the lane reads as a culvert.

Each piece is generated from a **signed distance field**, which gives three things uniformly
across all twelve: the fill; a boundary lip whose lit-or-dark state comes from the *gradient*, so
the NW key light is correct on every orientation without anyone deciding per piece; and a
two-pixel cast shadow outside any dark-facing boundary — which is what makes the two layers read
as different heights instead of two colours.

**`rag` is a design lever, not a tuning knob.** One number sets how far the boundary wanders, and
it carries a biome's whole character: grassland banks take 1.0, the frozen river 0.55 (a fractured
plate, not a flowing bank), the Royal Gardens canal **0.12** — masonry-lined, cut to a rule.
Nobody authored a second set of twelve pieces to get a different kind of place.

---

## 4. The tiles

`terrain.js` is retired. Its 44 tiles were 2× density, had no consistent key light, and shipped
hand-authored `*_to_*` transition tiles that D-19 makes unnecessary — and which `DECOR_TILES` was
scattering at random over open ground, putting half-a-road in the middle of fields.

Five modules replace it: **41 beds + 120 auto-edge pieces = 161 tiles**, all 32×32 at 1×.

`lib/tileset.js` holds the machinery (seamless boundaries, the quiet bed, the SDF edge kit);
`tiles/_biome.js` holds the assembly. **Neither holds a biome** — same contract as `lib/pixel.js`
and `troops/_worlds.js`. Five biomes that were one bed with five palettes would be the shared-rig
failure all over again.

| world | the idea | the signal that carries it |
|---|---|---|
| W1 Grasslands | wild, organic | banks wander at `rag` 1.0; wildflowers, ferns, clover, tall growth |
| W2 Holy Mountains | cold read through **hue**, not brightness | neutral iron-grey snow, blue spent only in shadow and catch-light |
| W3 Sea of Sand | two deserts held apart by **surface**, not colour | sand is flat wind-ripple; orange dune is real relief with lit and slip faces |
| W4 Royal Gardens | the only place a human decided where things go | ruled mown stripes, diagonal parterre, mortared courses, `rag` 0.12 canal |
| W5 Shadow Realm | a genuinely dark ground made playable | the **palest road in the game** on the darkest bed; hex-violet reserved for water |

---

## 5. What the renders found

Five bugs, none visible in code, all obvious in a 1280×704 render. Recorded because four of the
five are the same lesson.

1. **Every road was beaded in blue.** `TileResolver.at()` tested `layer >= wanted`, on the theory
   that a higher layer also counts as the ones beneath it. Wrong: a road is not water. The layers
   are a draw *ordering*, not a containment hierarchy.

2. **The road repeated a grit ring every 32 px.** The path fill scattered grit in little clusters
   at fixed positions. Clusters at fixed positions are exactly what makes a tile read as a lattice
   once the lane runs thirty cells. Grit is now per-pixel.

3. **The grass was a faint checkerboard.** Rotation was applied to only a third of base cells, so
   the majority were identical and unrotated. Rotation is free anti-repetition; there is no reason
   to ration it. Now every isotropic bed rotates.

4. **…which then scrambled the mown lawn and wove the desert into a herringbone basket.** Some
   ground has an *up*: stripes, mortar courses, wind ripples, NW-lit hedge faces. `ORIENTED` (in
   both `LevelMaps` and the port) names them and they never rotate. Fix (3) caused this; the same
   render pass caught it.

5. **The cursed water tiled as a grid of identical rosettes.** It was authored as a concentric
   pulse spreading from the middle of the pool — but a motif centred in the cell is centred in
   *every* cell. **A tiling cell can hold texture, never composition.**

Also found by eye and corrected: W3's ripple used raw radians (0.55, 0.22) rather than integer
multiples of 2π/32, so the wave never closed on the tile; W3's caravan track was darker than the
desert it crossed (a track is where feet scoured the crust *off*); W2's snow sat on the cyan ramp
and a whole level of it read as a swimming pool; and the Royal Gardens' flowerbeds and W2's ice
were strewn at 14% in full saturation, which is confetti — the §3.3 failure this redesign exists
to undo, reintroduced by me in new clothes.

---

## 6. Obstacles and buildings

Both families were re-authored at 1× on the engine's own draw sizes, so the playfield now renders
end to end with no placeholders left in it.

**Ten obstacles**, 40×52 — the exact size `drawTiledPlayfield` draws them at. They are separated
by mass, not palette: broad oak, narrow birch spindle, weeping willow (its crown hangs below its
own attachment line), tiered pine, a *dead* ash that is mostly empty space, a bare-stemmed palm,
a low blossom umbrella, a lopsided hexwood claw, a buttressed jungle giant, and a bramble with no
trunk at all. That last one matters mechanically as well as visually: the engine draws all trunks
before any canopy, and a trunkless thicket therefore overlaps its neighbours the way a thicket
should.

**Seventeen buildings**, 68×68 for keeps, 56×56 for the gem cave, 52×52 for the rest — again the
engine's own sizes; the old set was one 72×64 canvas scaled three different ways. Separated by
massing: a cluster of three gables (village), one crenellated block with corner turrets (castle),
long-and-low with a huge chimney (tavern), a single tall spire (citadel), a low adobe dome beside
open water (palm spring), a stepped ziggurat (stronghold), a squat drum with two tall stacks
(power station), a glass hemisphere on brass (laboratory), a hollow ring of standing stones
(shadow pool), a freestanding arch you can see the map through (portal), a mine headframe that
grows across three tiers, a well that becomes an obelisk, and a cave *mouth* — the only concave
silhouette in the set.

The four ruined frames each capturable building needs are **derived, not drawn** (`lib/structure.js`).
Eighty-five hand-authored frames would be eighty-five chances to draw a roof that does not match
its own pristine state. Erosion is weighted by height so roofs go before footings, exposed edges
char, and the material that is removed reappears as rubble at the base — a building that simply
faded out would read as a transparency bug rather than as damage.

### ⚠ Measured, and it did not match what I had written

The module header originally claimed "read as black shapes, no two are the same object". Measured
against D-28's 35% bar, that was false: **22 of 45 pairs passed, with oak vs willow at 75%.**
Pushing the crown footprints genuinely apart — oak broad, willow a small high crown over a wide
sparse skirt, blossom flatter and lower, the jungle giant's canopy pinned to the top of the frame
— brought it to **27 of 45, worst pair 52%**, with nothing left in the grossly-similar band.

The remaining failures sit between 36% and 52% and I am leaving them there, with the reasoning on
the record rather than buried: five broadleaf crowns on one 40×52 canvas overlap by construction,
and the 35% bar is a *unit* bar. It exists because a player must tell a healer from a tank at a
glance; scenery does not carry that load. That argument is also exactly the kind that gets abused
the moment it is accepted without a number beside it, which is why the number is here.

---

## 7. Still missing

| family | state |
|---|---|
| tiles + auto-edge kits | ✅ **161 / 161** |
| obstacles | ✅ **10 / 10** |
| buildings | ✅ **17 / 17** (85 frames) |
| overworld nodes + map cards | ⬜ 0 / 55 |
| backgrounds + splash | ⬜ 0 / 10 |
| fx · icons · ui · gems · particles | ⬜ 0 / 92 |

Everything still outstanding is menu and overlay art — nothing the playfield draws.

**Code.** Unchanged and still the largest risk: **`./gradlew test` has never run.** There is no
JDK here and no way to install one — `javac` is absent and the package mirror refuses. Everything
Java was verified statically (brace balance, symbol resolution, constructor arity) and, for the
map generator specifically, by a byte-exact port. That is not the same as compiling. **Please run
`./gradlew test` before trusting any of it.**

Also outstanding from earlier: the six spec/code contradictions M-1…M-6, the wave-authoring gap
W-1, and the Demon pyre-wing D-27 amendment.

---

## 8. Are the 25 tracks actually individual? — measured

You asked. I measured rather than answered, and the answer was half yes.

### Lane shape: yes, comfortably

Pairwise overlap of the 25 lane masks, all 300 pairs:

| | |
|---|---|
| mean overlap, same world | **16%** |
| worst pair, same world | 37% (w2_l1 / w2_l5) |
| worst pair, any two levels | 49% (w2_l5 / w3_l3) |
| lane length range | **114 – 232 cells**, a 2× spread |

No two levels walk the same route, and they are not even the same *size* of route.

### Terrain: no — and this was a real finding

Before the fix, within any world **all five levels used an identical tile palette and zero tiles
were unique to any one level.** W2, W4 and W5 used exactly the same 7/6/6 keys across all five.
The lanes were individual; the ground under them was not, so a world's five levels read as one
place five times over.

Three causes, all fixed:

1. **`paintVariety` used every variety tile at a fixed 14% on every level.** Each level now takes
   its own rotating slice — 2 or 3 of its world's tiles — at its own density (10/17/13/22/15%).
   W1 L1 is a clover meadow, L3 is fern woodland, L5 is tall grass, and all three are still
   unmistakably the Great Grasslands.
2. **Three of five worlds had no secondary biome at all** (`PATCH` was `null` for W2, W4, W5).
   Every world now has one — glacier field, formal/industrial quarter, ash waste — applied on
   three levels in five, in a level-dependent corner.
3. **W2, W4 and W5 simply did not have enough tiles to vary.** That is an art gap, not a
   generator one, and no amount of clever slicing fixes it. Seven new beds were authored:
   `tile_mountain_scree` (a talus slope, no snow), `tile_mountain_pine_snow` (needle litter — the
   only green in the world), `tile_sand_cracked` (a Voronoi-cracked dry pan, flat where the rest
   of W3 is rippled or in relief), `tile_garden_topiary`, `tile_garden_gravel` (raked furrows),
   `tile_shadow_bone` (W5's only pale material off the road) and `tile_shadow_obsidian` (same
   value as the void bed, distinguished by *finish* rather than colour).

| tiles appearing in all five levels of a world | before | after |
|---|---|---|
| W1 · W2 · W3 · W4 · W5 | 8 · 7 · 6 · 6 · 6 | **3 · 3 · 4 · 4 · 5** |
| world tile union | 10 · 7 · 8 · 6 · 6 | **10 · 9 · 9 · 9 · 8** |

Still honest about the limit: "unique to exactly one level" remains 0 everywhere. With four or
five variety tiles per world and each level taking two or three, some overlap is arithmetic. What
changed is that levels now share **three to five of their seven tiles instead of all of them**,
at different densities, with different secondary biomes in different corners.

---

## 9. Buildings on the road, and the gem caves that were never missing

**Hostile buildings now sit directly against the lane** — 149 of 150 touch it, against none
before. `freeForBuilding` grew a clearance parameter: keeps and homes are placed with a 0-cell
ring so they crowd the road the enemy marches down; gold mines and mana wells keep their 1-cell
ring, because they are scattered decoration and want breathing room. Placement also now prefers
the side that puts a building **north** of the lane in editor space — sprites are foot-anchored
and rise up the screen, so a building south of the road would draw its 96 px mass straight over
the road and hide the units walking on it.

**The gem caves were already in every level.** The engine builds one at runtime from
`map.cavePosition`, which `BlueprintLevel` sets to the end of the traced route, and the map editor
draws it from the `CAVE` overlay marker. What was wrong was my *evidence renderer*, which drew
decor from the `.map` decor layer only — and the cave is deliberately not decor, because a
`bld_gem_cave` entry there would make `BlueprintLevel` construct a **second** cave building. So
five evidence images showed no cave while the game had one all along. The renderer now draws it
where the engine does. A reminder that a verification tool is itself a thing that can be wrong.
