# Open Design Questions

Questions are answered top-down. Once a row is answered, it moves into
`DECISIONS.md` and the corresponding numbers in `INVENTORY.md` are locked.

Format: **Q-NN. Topic** — context · option list.

---

## Foundational (block everything downstream)

- **Q-01. Art style.** Pixel art (current ~24×24 source, scaled), high-res
  pixel art (48×48 source), flat vector, painted 2D, ink-line gothic,
  isometric? Pick one — every sprite is authored in this style.
  A: pixel art, painted in 2d (48*48); ink line gothic. borders must be well visible
  (D-08; source density later upgraded 48→64 per **D-21** — same style, 2× cell density.)


- **Q-02. Palette.** Stay with the purple/brown dual theme? New unified
  palette? Per-biome palettes (warm forest, ice blues, lava oranges,
  swamp greens, desert yellows, shadow violets) with shared neutral UI?

- **Q-03. Animation density tier.** Minimum (idle 2f + attack 4f), Standard
  (idle + walk + attack + death = 4 anims, 4f each), Full (above + hit +
  ability + cast = 6 anims, 4–6f each). Multiplies sprite count by 1× / 3× / 5×.

- **Q-04. Map tile philosophy.** Auto-edge (engine picks edge variants from
  neighbours — fewer hand-placed tiles, more variants per biome), or
  static (every tile is placed by hand in the Map Builder, simpler tile
  set, more manual work in the authoring step).
  A (D-19): **full auto-edge** — engine resolves edge variants from a per-biome bitmask set; design authors one full transition set per biome, obstacles stay static clusters.

## Tower & combat feel

- **Q-05.** Tier visual progression: cosmetic (same silhouette + glow) or
  structural (T2/T3/T4 are visibly different buildings)?
  A (D-20): **structural** — every tier is a visibly different building (rebuild, not recolour),
  within the faction shape-grammar + material; drives the per-tower weapon-armament spec.

- **Q-06.** Attack animations: framed pose only (1 fire frame) or full
  swing/wind-up/release/recoil (4f)? Same answer for melee chain towers?

- **Q-07.** Beam towers: animated beam segments or a single stretched
  texture? Per-faction beam colour?

- **Q-08.** Aura/AoE towers (witch coven): static radius ring or pulsing
  animated ring?

- **Q-09.** Projectile rotation: art rotates to match flight angle, or art
  is symmetric and never rotates?
  Note (D-23): the **turret**-rotation cousin is resolved — Orc/Goblin tower turrets use
  **8-way directional facings** (discrete hand-drawn, not free 2D rotation). **Projectile**
  rotation (this question proper) is still open; §2.2 currently free-rotates projectiles to
  the flight angle (small/fast art tolerates it). Decide whether that holds or some
  projectiles go symmetric/8-way too.

## Enemies

- **Q-10.** Champion variant identity: full unique sprites or colour-shift
  of base enemies + props (visor, banner)?

- **Q-11.** Bosses: distinct silhouettes for all 5, or palette/scale shifts
  on existing champion art?

- **Q-12.** Death animation: smoke puff, ragdoll fall, dissolve, faction-keyed?

- **Q-13.** Carrier state (enemy carrying a gem): tinted overlay or a
  distinct "carrying" anim row?

- **Q-14.** Flying enemies: separate shadow under them on the ground?

## Spells & FX

- **Q-15.** Spell style: cartoony chunky (clear silhouettes), painterly
  glow (soft fades), or stylised symbolic (rune + impact glyph)?

- **Q-16.** Meteor: single rock impact + crater, or full streak from
  off-screen + landing + lingering fire?

- **Q-17.** Terror/Curse: skull motif (current), eye motif, or hex circle?

- **Q-18.** Frost/Lightning: shared ice/spark palette or fully distinct sets?

## UI / chrome

- **Q-19.** Button shape: rectangular plate, ornate banner with metal
  corners, parchment scroll, or rune-stone tablet?

- **Q-20.** Theme toggle stays (purple ↔ brown), or single locked theme?
  A (D-31): **single locked dark theme** — the D-16/D-22 cool-gothic-night palette; **no toggle**
  (the old purple↔brown toggle is dropped).

- **Q-21.** Font: bitmap pixel font (current), Cinzel-style serif, hand-
  drawn ink, or two-font system (display + body)?

- **Q-22.** HUD strip: always-visible bottom rail, retractable, or
  minimalist corner indicators?

- **Q-23.** Wave queue: horizontal scrolling rail (current) or vertical
  stack on the right edge?

- **Q-24.** Heading plates: stone slab, hung banner, engraved metal, or
  pure typography (no plate)?

## Backgrounds & atmosphere

- **Q-25.** Menu backgrounds: static painting, slow-loop ambient (clouds
  drifting / torches flickering), or parallax with foreground silhouette?

- **Q-26.** In-game sky/biome backdrop: solid colour, gradient, parallax
  silhouette, or full biome painting behind the playfield?

- **Q-27.** Night mode: lighting overlay only (current), or fully separate
  night-time tile variants per biome?

## Maps & levels

- **Q-28.** Path style per world: each world pinned to one path style
  (dirt / stone / etc.), or per-level free choice?

- **Q-29.** Map size: stay 32 × 30, or change (e.g. 24 × 24 square, 40 × 22
  letterbox)?

- **Q-30.** Per-world unique buildings? (E.g. Frozen-Hell-specific cave
  variant.) Currently the engine already keys spawn art per biome.

- **Q-31.** Bosses' arenas: same playfield + boss spawn, or a unique tile
  set for the final level of each world?

## Delivery format

- **Q-33.** Source format: PNG sprite sheets, individual PNGs per frame,
  or JS pixel-row files (matches current pipeline)?

- **Q-34.** Master resolution: do we author at 1× and let the engine
  scale, or author at the final on-screen size?
  A (D-21): **author at 2× cell density (64-based)** — 64 px source per 32 px logical cell,
  downscaled for display; the logical grid stays 32×30 @ 32 px. No supersample/blend (no-AA,
  D-08, intact). Authoritative canvas table: `claude_design_instructions.md` §2.2.

- **Q-35.** Naming convention: keep current keys (`forest_oak`,
  `mine_1`) so engine code stays untouched, or introduce a versioned
  prefix (`v2_forest_oak`) and migrate code?
