# Changes

Human-readable changelog of redesign decisions and the doc edits that carry them.
**Newest first.** Each entry: the decision (it lives in full in `DECISIONS.md`), what
changed, why, scope/impact, and the **files touched**.

> NOTE: see `## 2026-06-05 — in-game map editor` below for the hand-painting Map Builder.

> The authoritative spec is always `DECISIONS.md` + the four spec docs
> (`claude_design_instructions.md`, `STYLEGUIDE.md`, `INVENTORY.md`, `TOWERS.md`) and
> their design-extract copies under `instructions for claude design/`. This file is the
> digest, not the source of truth.

---

## 2026-07-13 (2) — combat identity per faction, transport controls, six enchants, UI overhaul

Second pass on the finished game (full user list, pushed through end-to-end):

- **Maps:** every lane now starts at the very map border (heroes march in from off-map);
  Grasslands and Holy Mountains carry dense, mostly homogeneous forest masses (oak woods /
  pine woods — all clearable build ground); Royal Gardens canals cross the whole map.
- **Orc/Goblin turrets actually aim**: the 8-frame armed sheets are the 8 facings — towers now
  draw the static `_base` plus the facing frame tracking the target (no more time-cycled
  "spinning"). Harpoon line fires **piercing harpoons that glide past** the strike; scattergun
  line fires **volleys of small shots**; mortar line lobs **slow parabolic splash shells**, and
  both T6 double-mortars (Doomsday Cannon, Magma Mortar) **alternate left/right barrels**.
- **Crypt spires bank up to 3 orbiting charges** while idle (visible orbs), dump them in rapid
  succession when an enemy appears, then face a long reload.
- **Demon paths**: beam line burns with a continuous inferno beam (CoC-style, per-tower beam
  colours); nova line is a **permanent fire aura** with a live ground-glow (Infernal Caldera now
  shares Lake of Fire's burn-field flames — its projectile mismatch is gone); mortar line arcs
  parabolic firebombs. **Goblin bombers** are bigger, glide along the track dropping a visible
  carpet of bombs (7/10), and take longer to rearm.
- **48/48 unique projectiles** pinned by test (`ProjectileUniquenessTest`): bijective, faction-
  local, plus the turret art contract (armed sheet + separate base).
- **Transport:** pause works (button + P), new **2× speed** button (X key) with a Settings
  option for **tap-toggle vs hold**; garrisons: hostile buildings start pristine (frame 0 — the
  other frames are damage states) and **send troops to the lane** every 16 s (keeps muster the
  roster elite). Gems now fan out in a **pentagon** around the cave mouth (smaller, all visible).
- **All six player enchants** castable from HUD slots with mana costs and cast-modes (point AoE,
  gem-carrier target, tower target, global tribute); armed-slot → click-to-cast flow with hints.
- **UI:** live level previews rendered from the actual `.map` blueprints (baked art was stale);
  world map shrunk clear of the back button and its caption removed; Settings reflowed (no text
  overflow) + 2×-mode toggle; skill tree rows rebuilt (no overlaps) with **click-tooltips** per
  skill icon (second click closes); mines/wells drawn 2×; bottom-left HUD text no longer clipped.
- **Balance:** later worlds sharply harder (counts scale with world, tighter intervals, more
  champions, garrison pressure, leaner starting gold). Tests **45 → 47**, all green.

---

## 2026-07-13 — the finished game: 25 authored maps, full campaign loop, 2×2 towers, balance

**"Finish the game."** The campaign now plays end-to-end on hand-authored maps with real waves,
tower upgrades, win/lose flow and a tuned difficulty curve. Full game mode is the default
(maps-only preview stays a Settings toggle; a one-time pref migration flips old saves).

- **25 authored campaign maps** (`LevelMaps` → `MapExporter` → `assets/maps/w<W>_l<L>.map`, the
  map editor's own format — every level is editable in the Map Builder). Design per researched TD
  practice: unique hand-placed waypoint lanes, **2 tiles wide**, never touching the border, 2–4
  chokepoints each; per-world biome palettes with variety tiles + rotation; **water in the world's
  idiom** (winding grass brooks, frozen lakes, oases, formal garden canals, cursed pools — brook/
  canal tiles are directional stream art, so they are painted as lines, not blobs); hostile
  settlements (`HostileBuildings` composition) seated beside the lane with **2-wide sub-path
  spurs to the major keeps**; obstacle clusters on turn elbows as clearable build spots.
- **`BlueprintLevel`** bridges `.map` → gameplay: exact editor tile/rotation rendering, BFS lane
  centreline as the hero route (heroes fan out across the 2-wide lane), buildings/decor placed,
  spawn/cave wired. `startLevel` loads the authored map; `LevelBuilder` is only the fallback.
- **Towers occupy 2×2** (hover shows the footprint + range from its centre), are selectable, and
  carry the full **upgrade lattice** (explicit parent edges per faction, T1→T6 with branches),
  costs per tier (70…550), sell at 70% of invested. Bottom-centre panel: stats, up to two
  upgrade branches, sell. **LOB/NOVA now actually splash, CHAIN lightning forks** to 2 extra
  targets; fixed a real bug where projectile kills paid no bounty (`Hero.rewarded`).
- **Campaign loop:** `WavePlan` builds per-level schedules from each world's own troop roster —
  5→9 waves (L5 ends on the world boss), intermission countdown with early-call gold, victory/
  defeat overlays with gem-based stars, progression +3 skill points on first clear.
- **Balance:** quadratic tower damage (upgrading beats T1 spam), starting gold/intermission
  tighten across the campaign, wave pressure grows per level (unit-tested monotonic).
- **Tests 30 → 45**, all green: `AuthoredMapsTest` (lane width/connectivity/uniqueness/border,
  water, buildings near lane, sprite keys, disk-drift gate), `WavePlanTest` (roster locality,
  boss placement, growing pressure), `TowerUpgradeTest` (lattice sanity, no gold pumps),
  `GameplaySimulationTest` (headless proof: defended w1_l1 is winnable, undefended is lost,
  lane towers acquire targets, splash/chain work).

Files: `game/LevelMaps.java`, `game/BlueprintLevel.java`, `game/MapExporter.java`,
`game/WavePlan.java` (new); `CursedHoardGame.java`, `TowerType.java`, `Tower.java`, `World.java`,
`Hero.java` (reworked); `assets/maps/*.map` (25 new); 4 new test classes.

---

## 2026-06-05 — map import (pipeline step 5) + asset-use review

**The in-game playfield never matched the authored maps** because `createLevelMap()` generated a
procedural sine-wave path and ignored the 25 authored `map_*` role grids entirely (README pipeline
step 5 — map import — was never wired). Fixed:

- **`MapImporter`** (pure, headless-tested) parses a `map_*` 64×60 role grid into a `GameMap`:
  per-cell terrain/role + a **weighted-Dijkstra spawn→cave path** that hugs the authored lane and
  bridges its dithered gaps, the gem-cave position, and the hostile-building cluster centroids.
  `PixelArtAtlas` now retains the raw map grids; `startLevel` imports (procedural is the fallback).
- **Playfield art = the baked `map_*` sprite** (correct path/tree/water density), with the imported
  `GameMap` driving gameplay. Rendering per-tile turned the authored *textured* forests into walls
  of trees — the baked sprite is the faithful, intended layout art. Buildings now sit at the
  authored clusters; the gem cave at the authored cave.
- **Regression gate:** `MapImporterTest` imports **all 25** maps and asserts each yields a connected
  spawn→cave path + cave — so this divergence can't silently return.
- **Asset-use review:** restored the 5 `bg_level_select_*` backdrops (orphaned when level-select
  moved to the map fragment; they are the intended per-world backdrop, STRUCTURE.md §3). Per-tile
  `tile_*`/`obstacle_*` now serve the procedural fallback. Hardcoded waves remain (no authored wave
  assets exist).

**Files:** new `game/MapImporter.java`, `MapImporterTest.java`; `assets/PixelArtAtlas.java`,
`CursedHoardGame.java`.

---

## 2026-06-05 — in-game map editor (hand-painting Map Builder)

A hand-painting level editor so maps can be authored by hand and exported.

- **`game/MapBlueprint.java`** — the shared 32×30 model: three layers (terrain `tile_*` key · overlay
  `NONE/PATH/CAVE/SPAWN` · decor `obstacle_*`/`bld_*` at the anchor) stored as raw atlas keys so
  **every asset is paintable**. `toText()`/`parse()` give a diff-friendly, round-trippable `.map`
  export (round-trip unit-tested).
- **`MapBuilderScreen.java`** — reachable from **Settings → MAP BUILDER**. Left: the 32×30 grid you
  paint by click/drag. Right: category tabs (TERRAIN · OBSTACLE · BUILDING · PATH · CAVE · SPAWN ·
  ERASE) over a scrollable palette of the matching atlas sprites. Toolbar NEW · FILL · SAVE · LOAD ·
  BACK; **Ctrl+Z/Y undo-redo**. SAVE writes `custom_maps/<name>.map` and shows the absolute path.
- **2×2 footprint rules**: buildings and obstacles are 2×2 sprites **centred on their footprint**;
  obstacles may freely overlap, buildings need a 1-cell border buffer + no other building anchor
  within 1 (≥2 apart per axis). Decor is drawn in a second top-to-bottom pass so later terrain never
  overdraws a 2×2 sprite. Erase clears whichever 2×2 anchor covers the clicked cell.
- Tests: `MapBlueprintTest` (export round-trip + deep copy). 28 tests green.

**Files:** new `game/MapBlueprint.java`, `MapBuilderScreen.java`, `MapBlueprintTest.java`;
`CursedHoardGame.java` (state + Settings entry).

---

## 2026-06-05 — dedicated skill-icon brief + Almanac de-overlap

- **Dedicated skill icons brief** — `instructions for claude design/SKILL_ICONS.md` gains a
  **DESIGN DIRECTIVE + art-generation brief** for **40 bespoke 48×48 icons** (one per skill, module
  `skill_icons.js`, keys `icon_skill_<faction>_<n>`): authoring contract (iconkit primitives, D-08
  ink border), per-faction palette accents, and a **per-skill visual concept** for all 40. The old
  reuse mapping is demoted to the engine's placeholder fallback.
- **Almanac no longer self-overlaps** — moved the title banner clear of the left-aligned tab row;
  widened the troop grid to 5 columns (and effects to 6) so the wider pixel-font name labels no
  longer collide. Verified clean on troops + effects tabs.

**Files:** `instructions for claude design/SKILL_ICONS.md`; `CursedHoardGame.java` (Almanac layout).

---

## 2026-06-05 — skill-icon config + spacing/contrast pass

- **Skill-icon spec** — new `instructions for claude design/SKILL_ICONS.md` maps each faction's
  10 skills (the SYSTEMS.md trees) to an existing `icon_*`/enchant icon (D-14 reuse, no bespoke
  art). Enchant-upgrade nodes carry their enchant's own icon so the faction-gating coupling reads
  at a glance.
- **Skill tree wired** — `SkillTreeScreen` now shows **per-faction node icons + skill names +
  rank pips** (was one shared icon set and "Rank" placeholders), laid on the shared spacing grid.
- **Spacing system** — shared `UiChrome.PAD/GAP/ROW/LINE` constants so screens align to one rhythm;
  applied to the skill tree.
- **Contrast** — brighter `INK`/`GOLD`, clearly-dimmer `INK_DIM`, and a stronger (αcc) text drop
  shadow for legibility on busy backdrops.

**Files:** new `instructions for claude design/SKILL_ICONS.md`; `assets/{UiChrome,PixelFont}.java`,
`CursedHoardGame.java` (skill tree + spacing).

---

## 2026-06-05 — UI polish round 2 (bars, tower tree, menu plate)

Follow-up polish on top of the pixel-font + 9-slice pass:

- **Sprite health bars** — enemy HP bars now draw in-batch with a 1×1 white fill texture instead of
  `ShapeRenderer` (which forced a `batch.end()/begin()` per enemy). `ShapeRenderer` removed entirely.
- **Tower upgrade tree** — the Almanac tower grid is now **centred** in its panel with a connector
  trunk + branch stubs (T1→T2→T3 split→T4…), so it reads as a real tech tree instead of a left-
  rooted list.
- **Main-menu plate** — the button stack sits on a 9-slice backing panel, so the busy `bg_menu`
  galaxy art no longer shows through the gaps between buttons (the "striped bar" was background art,
  not a chrome bug).

**Files:** `CursedHoardGame.java` (white-fill bars, centred tree + connectors, menu plate).

---

## 2026-06-05 — new sprite pack rewired + UI professionalism pass

- **New art pack** — `Game_assets_v2` replaced with the user's revised pack. The authoring contract
  is unchanged: regenerating `sprites.json` yields the **identical 577 keys** (0 added/removed), so
  no resolver rewiring was needed — every `SpriteKeys` lookup and all 24 tests pass against the new
  atlas; only the pixels improved. Stale screenshot staging stays disabled.
- **Pixel font (the big UI win)** — new `assets/PixelFont.java`: a self-contained 5×7 pixel font
  baked to a texture atlas at load (no external font file), replacing the blurry default Arial that
  clashed with the pixel art. All UI text routes through it with a 1px drop shadow and integer
  snapping. Titles render larger (scale 3) for hierarchy.
- **True 9-slice chrome** — `PixelArtAtlas.drawNine()` slices the `ui_*` sprites into fixed-size
  corners + stretched edges/centre, so every panel, button, banner, capsule and tooltip now has
  crisp, consistent borders at any size (previously the whole sprite was stretched, warping bevels).
  `UiChrome` routes all boxes through it.

**Files:** new `assets/PixelFont.java`; `assets/{UiChrome,PixelArtAtlas}.java`,
`CursedHoardGame.java` (font swap), `Game_assets_v2/` (new pack).

---

## 2026-06-05 — fullscreen, Almanac picture-trees, scroll, padding

- **Default fullscreen** — the launcher now boots borderless fullscreen at the desktop display mode
  (the 1280×720 `FitViewport` scales to any resolution). `-Dch.windowed=1` forces a window for QA.
- **Almanac reworked into scrollable picture browsers** (no more flat name lists, D-?):
  - **Towers** are an upgrade-tree-by-picture: a faction sub-tab (Orc/Crypt/Demon/Goblin) shows that
    faction's towers laid out in **tier rows** (T1→T6, branches across) as armed sprite thumbnails.
  - **Troops** mirror this with World 1–5 sub-tabs and a picture grid; **Effects** are a picture grid.
  - Mouse-wheel **scroll** (new input processor) with a `scroll` hint; cells clipped to the panel.
  - Detail panel shows the **armed tower only** (the bare `_base` structure card was dropped).
- **Padding** — every Almanac cell/detail uses generous insets; skill-tree columns and Settings copy
  were given more breathing room from their panel borders; first/last rows no longer overflow panels.

**Files:** `CursedHoardGame.java` (Almanac rewrite + scroll + padding), `lwjgl3/Lwjgl3Launcher.java`.

---

## 2026-06-05 — interactive overworld maps + test suite + coherence pass

- **Interactive overworld** — the two delivered overworld maps (`map1`/`map2`) + their 5 per-world
  fragment overlays moved from `additional sprites/` into `assets/maps/` (folder deleted). New
  `assets/WorldMap.java` loads them as textures + alpha masks; the World-Select screen now renders
  the active map full-frame, glows the hovered biome (additive fragment overlay), and **routes a
  click to that world** via fragment-alpha hit-testing. Level-select uses the world fragment as a
  dim backdrop.
- **Map-style toggle** — Settings has a `WORLD MAP: STYLE 1/2` button (live thumbnail), persisted
  in prefs (`mapStyle`), survives Reset Progress.
- **Hostile-building correctness** — extracted `game/HostileBuildings.java`: each world fields only
  its own biome's minor home + major keep (no cross-world leak), keeps appear on **every** level,
  and the minor:keep ratio shifts 5:1 (L1) → 1:5 (L5).
- **Dedicated test suite (24 tests, all green)** — `SpriteKeyResolutionTest` validates all 48
  towers / 53 troops / 25 maps / **bijective 48 projectiles** / gems / buildings / nodes against the
  real 577-key atlas (headless, via the new `SpriteSource` seam); `HostileBuildingsTest` guards
  biome coherence + ratio; `WorldMapPixelTest` covers the click hit-mask; `GameSystemsTest` covers
  waves/status/slow/combat. Added a `-Dch.shot=<screen>` headless screenshot path for QA.
- **Coherence pass** (verified from captured screenshots): playfield **centred** between the HUD
  rails (D-07); removed green jungle tiles clashing on desert (moved to grasslands); calmer decor
  density; replaced every non-ASCII glyph (—·▶★…) that rendered as tofu in the default font.

**Files:** new `assets/{WorldMap,SpriteSource}.java`, `game/HostileBuildings.java`, 4 test classes;
edited `CursedHoardGame.java`, `SpriteKeys.java`, `PixelArtAtlas.java`, `lwjgl3/build.gradle`.

---

## 2026-06-04 — engine: full sprite utilisation + coherent UI chrome

Second engine pass: drive the in-game render toward the spec's **100 % utilisation gate** and
re-skin the whole app on the authored `ui_*` chrome (D-16 carved stone).

- **Coherent UI** — new `assets/UiChrome.java` draws every button (idle/hover/press), panel,
  banner, resource capsule, health/mana bar (+drain), wave track (7/9/11/13/15), skill node and
  chip from the `ui_*` sprites. All menus + the in-game HUD (D-07 layout: top resources · right
  wave rail · bottom-left 2 enchant slots · bottom-right 4-faction build palette) route through it.
- **Fixed 1280×720 `FitViewport`** (README non-negotiable) with pointer unprojection — layout is
  now resolution-independent.
- **Per-tile playfield** — `assets/GameFx.java` + a tile compositor render the field from
  `tile_*` terrain with scattered decoration tiles and `obstacle_*` trees (per-world palettes in
  `SpriteKeys.DECOR_TILES`/`OBSTACLE_TREES`); the 25 baked `map_*` sprites become level-select
  previews.
- **FX layer** — cosmetic projectiles (bijective tower→`proj_*` assignment, all 48 used), impact +
  death `particle_*`, status overlays (`fx_burn/freeze/stun/…`), enchant cast FX, gem-pickup FX.
  The Almanac gains an **Effects** tab animating every `fx_*`/`enchant_*`, and its troop view cycles
  all authored states (idle/walk/fly/ability/carry/death) so all 197 troop frames are reachable.
- **Utilisation: 577/577 sprites consumed** (98.8 % by static literal scan; the remaining 7 are
  built by runtime string concat — 6 enchant icons + 2 chips — and render live). Verified by a
  `-Dch.smoke=1` pass that cycles every screen + a live match with zero exceptions.

**Files:** `core/.../CursedHoardGame.java` (rewritten render/HUD), new
`core/.../assets/{UiChrome,GameFx}.java`, extended `SpriteKeys.java` + `PixelArtAtlas.java`.

---

## 2026-06-04 — engine: sprite-key bridge + build fix (art wiring)

**Scope:** got the rebuilt OO engine compiling, launching, and rendering the **delivered art**
instead of placeholder shapes.

- **Build fix** — `CursedHoardGame` failed to compile (`Stream.all_match` typo; `WaveSpawner`
  had no `waveIndex()`). Added a wave counter to `WaveSpawner.start()` + `waveIndex()`; fixed the
  stream call. `./gradlew test` and `lwjgl3:run` are green again.
- **Sprite-key bridge** — the authored atlas (`assets/generated/sprites.json`, 577 sprites) uses a
  different naming scheme than the gameplay enums (`ORC_WATCHPOST` → `orc_t1_watchpost`,
  `BOSS_GENERAL` → `troop_general`, maps keyed by descriptive title). Added
  `assets/SpriteKeys.java`, a cached resolver that maps **all 48 towers, all 53 troops
  (incl. boss aliases the_king/shadow_king), 25 maps, 25 level nodes, buildings, gems** to their
  real keys, with a token-overlap fuzzy fallback (`PixelArtAtlas.bestMatch`/`firstWithPrefix`) for
  the 3 irregular Crypt tower stems. `CursedHoardGame` + the Almanac now route every lookup through
  it; the level-select screen draws the authored `node_*` sprites.

**Files:** `core/.../CursedHoardGame.java`, `core/.../game/WaveSpawner.java`,
`core/.../assets/PixelArtAtlas.java`, `core/.../assets/SpriteKeys.java` (new).

---

## 2026-06-01 — design-implementation sync

**D-24…D-27** synced from the **claude-design** build (already implemented there): D-24 (faction
colour re-theme), D-25 (troops drop attack frames), D-26 (Goblin drone/bomber = launch platforms),
D-27 (tier-distinctness + per-faction shape grammar). **D-28** added as a **corrective** rule after
the build was found reusing one humanoid base for the whole enemy roster. **D-29** records the
per-faction tower detailing (terraced Demon steps + ember staircase, tier-scaling Crypt battlements,
Orc green-primary, Goblin base hatch). Then the engine/app open issues were resolved interactively → **D-30** (engine
build calls) + **D-31** (screen-flow & scoring), and a turnkey **`SETUP.md`** was written
(architecture **APPROVED**). Plus confirmations of D-21/D-12.

### D-24 — Faction accent re-theme: Orc green, Goblin brass (amends D-16d)

- **What.** Tower factions re-themed by colour: **Orc = green** (war-green, MS3 `#5d8a3a`),
  **Goblin = brass** steampunk (BR4 `#d8a847`); **Crypt = blue** (IC3) and **Demon = red**
  (EM3) unchanged. **Reverses D-16d** (Orc→wood-brown, Goblin→moss-green) — the v1 two-greens
  collision is now resolved by moving **Goblin to brass** and giving **Orc the green**.
- **Note.** Accent = the faction's identity hue (war-paint, trim, banners, glow), not the whole
  build material — Orc structure stays timber & black iron, Goblin stays brass/copper machinery.
- **Files touched.** `DECISIONS.md` (new **D-24** + cross-note on **D-16**) · `STYLEGUIDE.md`
  (§3 table + §6 engine note) · `instructions for claude design/STYLEGUIDE.md` (§3 table) ·
  `claude_design_instructions.md` (§4 faction accents) · `instructions for claude design/TOWERS.md`
  (accent table + Orc/Goblin shape headers) · `TOWERS.md` (root accent rule).

### D-25 — Troops drop the attack animation (amends D-06)

- **What.** Enemy troops are now **idle + locomotion (walk/ride/fly) + (ability/cast) + death**
  — **no dedicated attack animation**. Contact damage reads through the pose + ability/impact FX
  (D-04d). Cuts one anim set from each of the 53 archetypes. **Towers keep their attack anim** —
  troops-only.
- **Files touched.** `DECISIONS.md` (new **D-25** + cross-note on **D-06**) ·
  `claude_design_instructions.md` (§1 Density row, §3 troops row, §5 troops rule) ·
  `INVENTORY.md` + `instructions for claude design/INVENTORY.md` (§3 per-archetype spec +
  sprite-total summaries).

### D-26 — Goblin drone & bomber towers are launch platforms, not turrets (amends D-23)

- **What.** D-23's rotating turret does **not** apply to Goblin's **drone wing** (Drone Bay,
  Drone Swarm, Drone Foundry, Sky Carrier) or its **bomber** middle (Bomber Drone, Carpet
  Bomber): those **6 towers are static launch platforms** (open hangars / airship masts) with
  **no rotating top** — the fighting is done by **separate flying drone actors**. The turret now
  covers **Orc's 12 + Goblin's 6 gun/ordnance towers ≈ 18 turret sets** (down from 24).
- **Also.** Drone actors are **distinct per tier**; **bomber drones differ from attack drones**.
- **Files touched.** `DECISIONS.md` (new **D-26** + cross-note on **D-23**) · `TOWERS.md`
  (root D-23 bullet) · `instructions for claude design/TOWERS.md` (art rules + Goblin shape
  header + drone note) · `claude_design_instructions.md` (§1 Density, §3 towers/turret/drone
  rows, §5 towers rule) · `INVENTORY.md` + `instructions for claude design/INVENTORY.md` (code
  seam, turret note, drone special, subtotals).

### D-27 — Tower tier-distinctness & per-faction shape grammar (extends D-20/D-12)

- **What — concrete rules:** (a) each tier varies by **≥5 levers** (size · intricacy/layers ·
  darker colour · stripes/trim · spikes · bigger weapon); (b) **each branch reads as a distinct
  building** (Fear ≠ Lightning ≠ Frost crypt); (c) the **building matches its name** and a
  **weapon line escalates as the same weapon** (Brimstone Battery = lighter/weaker (same-weapon) Magma
  Mortar); (d) **no decoration/structure shared across factions**.
- **Per-faction shape grammar.** Crypt = spires with **much smaller entrances + windows**;
  Demon = **Aztec-style stepped pyramids** (red theme), **beam wing tall / pyre wing
  shortest-broadest**; Orc = rounded **"den"** + **central symmetric rhombus** decorations;
  Goblin = busy riveted brass machinery.
- **Files touched.** `DECISIONS.md` (new **D-27** + cross-note on **D-20**) ·
  `instructions for claude design/TOWERS.md` (art rules + 4 faction shape headers) · `TOWERS.md`
  (root tier-distinctness rule).

### D-28 — No shared prototype: every enemy is its own creature (corrective; clarifies D-12)

- **Why.** The build was reusing **one humanoid base** (recoloured) for the whole 53-troop roster
  — a hard fail. D-12's "shared sub-style" was being read as "shared body."
- **Rule.** Each archetype is a distinct from-scratch design (silhouette · scale · species/anatomy ·
  equipment · pose) per its `concept.md` Trait; **species match the world** (human army → clergy →
  desert/camel → royal court/Falconer/Clockwork → demons/undead/shadow); mounts/machines/flyers/
  behemoths/swarms are **not** humanoids. D-12 = palette + detailing *language* only. Only sanctioned
  reuse: Shadow King = the King corrupted (D-10).
- **Enforced for future batches.** Brief **§7** adds a per-batch **distinctness self-check** (the
  manifest must state how each unit differs from its wave-mates) and **§8** a **definition-of-done
  gate** (32 px squint test, no recolour/reuse) — look-alike batches are rejected and redrawn.
- **Files touched.** `DECISIONS.md` (new **D-28** + cross-note on **D-12**) ·
  `claude_design_instructions.md` (§4 rule block, §3 troops row, §7 self-check, §8 DoD) ·
  `instructions for claude design/concept.md` (sub-style rule) ·
  `instructions for claude design/TROOPS.md` (count/role intro) · `INVENTORY.md` +
  `instructions for claude design/INVENTORY.md` (§3 troop spec).

### D-29 — Per-faction tower detailing (refines D-27)

- **Demon** — ziggurat **steps as terraced relief** (bright treads + shadow recesses, per
  reference); **central staircase = ember-lit obsidian** (red/EM, not grey), **shortened** to stop
  one terrace below the summit, **+ a small shrine door at the top**. Brimstone Battery = the
  **same weapon as the Magma Mortar, just weaker** (same line).
- **Crypt** — **side battlements, intricacy scaling with tier** (T1 minor ledges → T5–6 tall
  stacked turrets + **gold finials**); **small base door + lit lancet windows**; **Fear/Terror =
  purple (CR) accents** (courses/glows, gargoyle eyes, shroud-banners).
- **Goblin** — a **small riveted iron hatch door** at the base.
- **Orc** — **green primary; brown wood accent only** (braces/scaffold/palisade/door-frame/
  end-grain) + black iron; **removed** the rope lashings + the vertical "rod" arrow-slit row.
- **Process** — all validates clean against the master palette (D-08/D-16).
- **Files touched.** `DECISIONS.md` (new **D-29** + a D-27 wording fix: Brimstone = same weapon,
  not "multi-mouth") · `instructions for claude design/TOWERS.md` (new "Per-faction detailing"
  block, Orc material header → green-primary, Brimstone armament row, D-27 bullet wording).

### Confirmations (no new decision — implementation matched the locked spec)

- **Procedural generators rebuilt with genuine detail** at 2× (not upscaled) — exactly D-21's
  intent (more authored pixels, no supersample/blend).
- **All 53 troops rebuilt at 64×64**, each keeping its **host-world accent** — confirms D-21
  (64-based) + D-12 (per-world sub-style).

### Also this round — handoff docs (IMPLEMENTATION sync · STRUCTURE · MAPS)

- Brought `IMPLEMENTATION.md` up to **D-01…D-27**: new **§2.6** tower/turret/projectile/drone
  runtime, **§2.7** render + asset pipeline (autotile D-19, 2× D-21, no-AA D-08, placeholder
  loader), audit rows for the tower-side/tiles/source-art/troop-anim gaps, and faction-colour
  retype (D-24). Added **§8 — asset-independent build track + headless test suite** so the
  engine + tests can be built on **placeholder art now**, before Claude-design's assets land
  (real art = a zero-code data drop via the frozen pipeline). Files: `IMPLEMENTATION.md`.
- Wrote **`STRUCTURE.md`** — the screen flow & navigation the rebuild reproduces (screen
  inventory, nav graph, per-screen specs, in-game HUD layout per D-07), reconstructed from the
  docs + feature history since the old code was deleted (D-18). Closes the "capture-before-delete"
  gap in `IMPLEMENTATION.md` §7; the screen-flow infra is now unblocked. Files: `STRUCTURE.md`,
  `README.md` (index), `IMPLEMENTATION.md` (§7/§8 cross-notes).
- Wrote **`MAPS.md`** — the **25 per-level campaign briefs** (`[DRAFT]`: world/biome · path shape ·
  gem count · boss · gimmick + flight lanes per D-15), filling the "(planned)" gap that brief §6 /
  INVENTORY §16 pointed to. Wave composition stays in the Wave Builder. Files: `MAPS.md`,
  `README.md` (index), `claude_design_instructions.md` + `INVENTORY.md` (dropped "(planned)").

### D-30 / D-31 — open engineering & app issues resolved interactively + `SETUP.md`

Walked the IMPLEMENTATION §7 + STRUCTURE/MAPS open items with the user and pinned every one:
- **D-30 (engine):** FREEZE = distinct StatusType · behaviors = component list · enemy tiers retired
  (D-04) · execute in Combat Core · greenfield save (no migrator) · balance seeded now + tuned
  Phase 4 · **parallel agent teams** · **libGDX/lwjgl3/Gradle/Java 17**. Architecture → **APPROVED**.
- **D-31 (app):** single locked dark theme (no toggle — **closes Q-20**) · Infinite Peril omitted ·
  **every map = 5 gems** · stars 3★ none-touched / 2★ all-retained / 1★ ≥1-kept / lose-all = fail ·
  flight lanes on every flyer-world level.
- Wrote **`SETUP.md`** — the Phase-0 turnkey handoff: tech stack, repo/package layout, the interface
  contract as stub files, asset pipeline, placeholder layer, headless test harness, build/run/test
  commands, and the pinned decisions. Flipped IMPLEMENTATION status [PROPOSED]→**APPROVED**, §7→resolved.
- **Files touched.** `DECISIONS.md` (D-30, D-31) · new **`SETUP.md`** · `IMPLEMENTATION.md` (status +
  §7) · `STRUCTURE.md` (§6 + Settings/Infinite) · `MAPS.md` (all maps → 5 gems + star metric) ·
  `QUESTIONS.md` (Q-20) · `README.md` (index).

### Files-touched matrix — 2026-06-01 round

*(Covers the art-packet decisions D-24–D-29; D-30/D-31 are engine/app — files listed in their entry above.)*

| File | D-24 | D-25 | D-26 | D-27 | D-28 | D-29 |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| `DECISIONS.md` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `claude_design_instructions.md` | ✅ | ✅ | ✅ | | ✅ | |
| `STYLEGUIDE.md` (root) | ✅ | | | | | |
| `instructions for claude design/STYLEGUIDE.md` | ✅ | | | | | |
| `INVENTORY.md` (root) | | ✅ | ✅ | | ✅ | |
| `instructions for claude design/INVENTORY.md` | | ✅ | ✅ | | ✅ | |
| `instructions for claude design/concept.md` | | | | | ✅ | |
| `instructions for claude design/TROOPS.md` | | | | | ✅ | |
| `TOWERS.md` (root) | ✅ | | ✅ | ✅ | | |
| `instructions for claude design/TOWERS.md` | ✅ | | ✅ | ✅ | | ✅ |

---

## 2026-05-31

Four decisions locked this round — **D-20** (structural tiers), **D-21** (2× source
resolution), **D-22** (darker palette), **D-23** (Orc/Goblin rotating turrets).

### D-23 — Orc & Goblin towers: static base + rotating directional turret

*Amends D-06 for two of the four factions.*

- **What.** **Orc** and **Goblin** towers split into a **static base** (the structure, one
  sprite per tier) **+ a rotating turret** — the "business end" / visible weapon — that
  **aims at the current target**. **Crypt** and **Demon** are **unchanged**: a single static
  sprite (their fire is orbiting charges, beams, and novas with no tracking barrel, so a
  turret adds cost for no readability gain).
- **8-way directional, not free rotation.** The turret is authored as **5 hand-drawn 3/4
  facings** (E, NE, SE, N, S) and **mirrored** to the other three (W, NW, SW) = **8 facings**;
  the engine **snaps `aimAngle` to the nearest of 8**. Chosen over continuous 2D rotation
  because the no-AA ink-line gothic art (D-08) looks flat/muddy when rotated to arbitrary
  angles — discrete painted facings keep the gothic read.
- **Base stays locked in place** (D-06's "no locomotion" holds); only the turret turns, and
  the **attack animation plays on the turret in its current facing**. Projectiles still
  free-rotate to flight angle (§2.2) — small fast bolts tolerate it; a large static-viewed
  turret does not.
- **Engine.** `Tower` gains an optional `turret` sub-sprite + a `pivot` (turret seat on the
  base) + `aimAngle`; towers with no turret render exactly as before.
- **Cost / count.** **+24 turret sprite sets** (Orc 12 + Goblin 12), each ~5 facings × the
  attack frames; Crypt/Demon add nothing. **The 48-silhouette count is unchanged** — the
  turret is a sub-component of an Orc/Goblin tower, not a new tower. *(Later revised by **D-26**
  → ≈18 turret sets: Goblin's drone & bomber lines became launch platforms with no turret.)*
- **Files touched.** `DECISIONS.md` (new **D-23** + cross-note on **D-06**) ·
  `TOWERS.md` (root rules) · `instructions for claude design/TOWERS.md` (art rules) ·
  `claude_design_instructions.md` (§1 Density row, §2.2 new turret canvas row, §3 work-list
  new turret row, §5 animation rules) · `INVENTORY.md` (code seam, D-06 note, per-tower note)
  · `instructions for claude design/INVENTORY.md` (D-06 note, per-tower note).

### D-22 — Darker palette (global darkening of D-16)

- **What.** The whole game skews **darker** than the `STYLEGUIDE.md` §1 first-pass hexes.
  This refines D-16's cool gothic-night; the family/step **structure is unchanged**.
- **How — author by CODE, apply as a `palette.js` hex retune (no sprite re-authoring):**
  (a) **deepen the stage/backdrop** to IK1/IK0 (`#0a0612`/`#07040d`) as the dominant field,
  IK3 reserved for raised chrome faces; (b) **bias fills one step darker** — large areas take
  the darker ramp neighbour; reserve the top 1–2 light steps for highlight/rim only;
  (c) **saturated brights are accents, not fields** — EM/IC/VL/HX/GD read as glints/FX/faction
  accents that **pop** against the darkened mass; (d) **protect D-08** — keep a value gap
  between fill and the IK0/IK1 outline, and rim-light any dark silhouette on the dark backdrop
  so it never muddies.
- **Why it's cheap.** Colour-by-CODE means the hexes can be retuned in `palette.js` without
  touching a single sprite grid.
- **Files touched.** `DECISIONS.md` (new **D-22**) · `claude_design_instructions.md`
  (§0 brief, §4 "Darker overall" rules) · `STYLEGUIDE.md` (§0 foundations row, §1 darkening
  note, §2 backdrop row) · `instructions for claude design/STYLEGUIDE.md` (same §0/§1).

### D-21 — Source-art resolution: ×2-of-cell (64-based) density

- **What.** Author every world-grid sprite at **64 px source per 32 px logical cell** (2×
  density), downscaled for display. The **logical grid is unchanged** — still **32×30 cells
  @ 32 px**, world **1024×960 logical** (README non-negotiable); only the *source canvas*
  doubles.
- **No-AA intact (D-08).** 2× means **more authored pixels, not** a supersample-then-downscale
  (which would blend pixels off-palette). Source density ≈ display density.
- **Canvas table (authoritative: `claude_design_instructions.md` §2.2).** tiles 64×64 ·
  troops 64×64 · large troops 64×96 · air actors 64×64 · towers 64×128 · projectiles ≤64×64
  · gems 64×64 · particles ≤32×32 · ability/enchant FX ≤192×192 · buildings ≤192×192 · UI
  icons 48×48 · world cards 512×384 · map nodes 192×192 · backgrounds 2560×1440 · title
  splash 1536×384.
- **Scope = uniform.** Every drawn asset is 2× (sprites · tiles · chrome · icons · backgrounds
  · FX · particles) — never mix densities under FitViewport. **Text/font is the only
  exception** (governed by Q-21).
- **⚠ Payoff is conditional (open caveat).** 2× only stays crisp if the 1280×720 logical frame
  is displayed at **≥2× physical px** (≥1440p / hi-DPI / fullscreen). **If the game ships
  pinned to native 720p, the no-AA downscale discards the extra pixels → revert to 1×
  (32-based) before mass authoring.** Render resolution was **undecided as of 2026-05-31**, so
  2× is kept as the **safe default** (you can always downscale authored art; you can't recover
  detail you never drew).
- **Cost.** ≈ **1.8–4×** the prior 48-based atlas/authoring. This is a density/crispness lever,
  **not** a distinctness fix — distinctness still rests on silhouette + faction shape-grammar +
  the weapon armature (D-20).
- **Files touched.** `DECISIONS.md` (new **D-21** + supersede note on **D-08**) ·
  `QUESTIONS.md` (**Q-34** answered, **Q-01** annotated 48→64) · `claude_design_instructions.md`
  (§0 brief, §1 source-resolution row, §2.2 density note + full canvas table, §3 work-list
  sizes) · `STYLEGUIDE.md` + `instructions for claude design/STYLEGUIDE.md` (§0 foundations
  row) · `INVENTORY.md` + `instructions for claude design/INVENTORY.md` (§1/§10/§11/§12/§15
  sizes) · `instructions for claude design/TOWERS.md` (canvas line).

### D-20 — Tier visual progression: structural, not cosmetic

- **What.** Each of the **12 tiers per faction** is a **visibly different building**, not a
  recolour/glow of the same silhouette: tiers escalate by **rebuilding the structure** —
  bigger frame, more barrels/limbs, added machinery, a changed "business end" — within the
  faction's shape-grammar + material.
- **Why.** Towers are **static** (D-06), so the silhouette + visible weapon is the *only*
  readability channel; cosmetic-only tiers would be indistinguishable in play.
- **Operationalised by** the **per-tower weapon-armament spec** (design packet
  `instructions for claude design/TOWERS.md` → *"Weapon armament — the per-tower distinctness
  spec"*), which assigns each of the 48 towers a distinct armament so a faction's 12 read as
  12 distinct silhouettes at 32 px. *(D-23 then makes that armament a rotating turret for Orc &
  Goblin.)*
- **Files touched.** `DECISIONS.md` (new **D-20**) · `QUESTIONS.md` (**Q-05** answered) ·
  `instructions for claude design/TOWERS.md` (structural-tier rule + weapon-armament spec).

---

## Files-touched matrix — 2026-05-31 round

| File | D-20 | D-21 | D-22 | D-23 |
|---|:--:|:--:|:--:|:--:|
| `DECISIONS.md` | ✅ | ✅ | ✅ | ✅ |
| `QUESTIONS.md` | ✅ | ✅ | | |
| `claude_design_instructions.md` | | ✅ | ✅ | ✅ |
| `STYLEGUIDE.md` (root) | | ✅ | ✅ | |
| `instructions for claude design/STYLEGUIDE.md` | | ✅ | ✅ | |
| `INVENTORY.md` (root) | | ✅ | | ✅ |
| `instructions for claude design/INVENTORY.md` | | ✅ | | ✅ |
| `TOWERS.md` (root) | | | | ✅ |
| `instructions for claude design/TOWERS.md` | ✅ | ✅ | | ✅ |

*(Design-extract copies under `instructions for claude design/` mirror the trimmed art spec;
section numbers match the root, which stays the source of truth.)*
