# Redesign Review — graphics, mechanics, geometry, interaction

Audit of the current build against the locked docs (`DECISIONS.md` D-01…D-32) and against
plain game-feel. Written 2026-07-26. **Nothing in this file is applied yet** — §8 and §9 are
proposals awaiting your sign-off.

Evidence renders: `redesign/review-evidence/` (contact sheets rasterised straight from
`assets/generated/sprites.json`, so they show exactly what the game draws).

---

## 1. Method

| What | How |
|---|---|
| Sprites | Decoded `assets/generated/sprites.json` (577 sprites, 8.4 MB) and rasterised troops / towers / tiles / UI to PNG contact sheets. |
| Art source | Read `assets/data/*.js` (3 987 lines) — the procedural kits `humankit.js`, `towerkit.js`, `terrain.js`. |
| Engine | Read `CursedHoardGame.java` (2 005 lines), `GameMap`, `Tower`, `World`, `HeroType`, `TowerType`, `WavePlan`, `EnchantSystem`, `StatusController`, the 30 `behaviors/*`. |
| Spec | `redesign/*.md` + `instructions for claude design/*.md` (4 979 lines). |

---

## 2. Verdict — three structural failures

The spec is excellent. The **implementation of the spec is not**. Three things are wrong at
a level that no amount of polish fixes, and all three are already forbidden by your own
locked decisions:

| # | Failure | Violates | Severity |
|---|---|---|---|
| **F1** | **One humanoid rig wears 50 costumes.** 44 of 53 troop archetypes are direct `buildHumanoid()` calls; 3 more are `buildRider()` (= the same humanoid seated on one shared `drawHorse`). Same skeleton, same joint lengths, same pose, same 2-tone limb shading — only the palette and a hat change. | **D-28** ("no unit may be a recolour, rescale or part-swap of another unit's body" — flagged as *"a hard fail"*) · **D-12** · **D-04a** | Fatal |
| **F2** | **All 12 Orc towers are the same building.** Identical green cone-roofed silhouette, identical door, identical braces; the only difference is a ~6 px turret ornament on top. Crypt/Demon/Goblin are better but still tier-recolours in places. | **D-20** ("structural, not cosmetic") · **D-27** ("≥5 levers per tier", "each branch reads as a distinct building") | Fatal |
| **F3** | **The map is rendered at 0.60× — a non-integer downscale of no-AA pixel art.** A 32 px tile lands on **19.2 screen px**. Every sprite is resampled to a fractional grid: uneven pixel widths, shimmer on movement, ink outlines (D-08's "strongly visible borders") thinned to sub-pixel and dropped. Meanwhile ~333 px of dead margin sits on each side of a 1280-wide frame. | **D-08** · **D-21** · README §Non-negotiables | Fatal |

**F3 is the one to fix first**, because the correct cell size determines how the art in F1/F2
must be authored. Do not mass-author sprites until §5 is settled.

---

## 3. Graphics audit

### 3.1 Troops — the shared-rig problem

*(see `review-evidence/troops_idle_1.png`, `troops_idle_2.png`)*

Rendering all 53 idle frames side by side makes it unmissable: a grassland Peasant, a
Holy-Mountain Acolyte and a Shadow-Realm Wraith are the **same silhouette in three palettes**.

Concrete defects:

- **Identical anatomy.** `humankit.js` `rig()` hardcodes `hipY = 41`, `shoY = 27`, `neck = 24`,
  thigh 9 px, shin 8 px. `build`/`hgt`/`scale` nudge these by ±3 px — invisible at play size.
- **No faces, no heads of character.** The head is a `disc()` plus an optional helm shape. At
  the intended 32 px display cell, every unit reads as "grey blob on grey stick".
- **Two-tone limbs.** `limb()` writes exactly three values (`lo`/`mi`/`hi`) with a hard split.
  There is no ambient occlusion, no rim light, no form shading — which is what "painted 2D"
  (D-08) actually means. The result reads as flat vector, not painted pixel art.
- **Weapons are 2–4 px sticks.** A pitchfork, a spear and a greatsword are near-identical
  at play scale. D-28's squint test (*"distinguishable as black shapes at 32 px"*) fails for
  most wave-mates.
- **Species are ignored.** D-28 mandates *"W5 demons/undead/shadow"*, *"mechanical = a
  machine"*, *"behemoth = a huge mass"*. The Clockwork Sentinel, the Soul Eater and the
  Doom Knight are all built by `buildHumanoid`. Only 3 units (`dune_behemoth`, `hellhound`,
  `abyssal_behemoth`) use `buildBeast` — and those 3 share **one** beast rig with each other.
- **The ability FX are painted over the idle pose** rather than being a distinct animation,
  so a Banner-Sergeant "raising a speed ring" is a standing figure with a green ellipse.

### 3.2 Towers — the clone problem

*(see `review-evidence/towers_orc.png`)*

12 Orc towers rendered together: same cone roof, same green drum body, same brown braces,
same black doorway. Tier escalation is expressed as **one extra rhombus** on the body and a
slightly wider turret. D-27's five required levers (size · intricacy · darker colour ·
stripes/trim · spikes · bigger weapon) are delivering roughly **one and a half**.

Root cause is architectural, not artistic: `towerkit.js` exports a single body grammar plus a
library of `turretX()` functions. Every Orc tower calls the same body and swaps the turret.
That is *exactly* the cosmetic-tier model D-20 rejected.

The **Goblin drone/bomber wing is the one part that works** — `droneActor()` vs
`bomberActor()` are genuinely different airframes (D-26 satisfied). Use it as the template
for what "distinct" should mean everywhere else.

### 3.3 Terrain

*(see `review-evidence/tiles.png`)*

Better than the sprites, but with two systemic issues:

1. **Noise-field tiling.** Each tile is a full-canvas high-frequency dither. Laid out 40 wide
   this becomes visual soup that **actively camouflages the units standing on it** — the exact
   opposite of what a TD playfield needs. Ground should be quiet; units and towers should be loud.
2. **Autotiling does not exist — the game is shipping D-19's rejected option.** D-19 locked
   *"full auto-edge — design authors one full transition set per biome"*. In reality:
   - `TileResolver.java` is **dead code**. Its only reference in the whole project is one
     assertion in `RedesignInfrastructureTest`. `drawTiledPlayfield()` never calls it.
   - Its key format is `terrain_<type>_<mask>` — **zero** sprites in the atlas start with
     `terrain_`; every tile is `tile_*`. Even if it were wired, it would resolve nothing.
   - It computes a **4-bit** N/E/S/W mask (16 variants), not the corner-aware 8-bit mask a
     real autotile set needs (47 variants).
   - The art side has one `tile_<biome>_to_path` per biome — no edge/corner variants at all.
   - `drawTiledPlayfield()` draws **whatever tile the `.map` file names, per cell** — i.e.
     hand-placed static tiling, the option D-19 explicitly rejected as *"too manual across
     25 maps"*.

   This is both a missing art deliverable **and** a missing engine feature. It also means the
   25 authored maps encode their edges by hand, which compounds the §4.3 migration cost.

Also: no per-tile light direction. D-08 "ink-line gothic" implies a consistent key light;
tiles currently have none, so nothing sits *on* the ground, it sits *in front of* it.

### 3.4 Palette and render

- The palette itself is good — ~160 codes with real ramps, and D-22's darkening reads well.
- But **units are dark-on-dark**. The Shadow Realm roster on shadow tiles has almost no value
  separation. D-22(d) explicitly requires rim-lighting dark silhouettes on dark backdrops;
  the kits never emit a rim light.
- `outline()` writes a **1 px** ink border at 64 px source. Downscaled to 19.2 px on screen
  that is 0.3 px — it disappears. D-08's headline rule is being silently discarded by the
  render scale.

---

## 4. Map geometry — the core fix *(your decision: letterbox 1:1)*

### 4.1 What is wrong now

```
logical frame     1280 × 720   (FitViewport)
world             1024 × 960   (32 × 30 cells @ 32 px)
SCALE             0.60         ← CursedHoardGame.java:62
on-screen map      614 × 576   → 19.2 px per cell
dead margin        333 px left + 333 px right
```

A 960-tall world cannot fit a 720-tall frame, so the previous author scaled it down. Every
downstream art decision (D-21's 2× density, D-08's visible borders, D-27's tier detail) is
being thrown away by that one constant.

### 4.2 Proposed geometry — **40 × 22 cells @ 32 px**

```
world             1280 × 704   ← fits the frame at SCALE = 1.0 exactly
cells             880          (vs 960 today — 92 %)
on-screen area    901 k px²    (vs 353 k today — 2.55×)
aspect            20:11        ≈ 16:9, reads as a proper widescreen battlefield
```

**Every pixel is 1:1.** No shimmer, ink outlines survive, D-08 is honoured.

**HUD:** D-07 already specifies *"independent, raised 3D blocks floating separately rather
than flush-aligned into one panel"* — so the HUD becomes **floating overlay blocks** on a
full-bleed map. To guarantee they never hide gameplay, add an authoring rule:

> **Safe rect** — the authored path, the cave, all buildable cells and all spawn points live
> in rows **2 … 19** (cols 0…39). Rows 0–1 and 20–21 are decorative border terrain only.
> Playable area 40 × 18 = 720 cells; the HUD blocks overlay the two 64 px decorative bands.

*Alternative if you would rather have zero overlay:* **40 × 20** (1280 × 640) centred, with
solid 40 px HUD bands top and bottom. Cheaper to reason about, but 40 px is tight for the
current 54 px build-palette buttons, and you lose the full-bleed look.

### 4.3 Cost

| Item | Work |
|---|---|
| `GameMap.WIDTH/HEIGHT` → 40/22 | trivial |
| `SCALE` → 1.0, `MAP_X/MAP_Y` → 0 | trivial, but ~20 call-sites multiply by `SCALE` — all simplify |
| HUD re-layout to overlay blocks | moderate |
| **25 `.map` files re-authored** | **the real cost** — each is ~960 per-cell lines for a 32×30 grid |
| `MapBuilderScreen` grid + preview rects | moderate |
| `MAPS.md` per-level briefs re-checked against the new aspect | light |

**Mitigation for the 25 maps:** write a one-off migration script that re-grids existing
`.map` files (pad cols 32→39, crop/rebalance rows 30→22 around the path) so authored paths
survive as a starting point rather than being redrawn from zero. Recommended.

---

## 5. The D-21 problem — 2× source density is now a liability

D-21 locked *"author at 64 px source per 32 px logical cell"*, and flagged its own caveat:
*"if the game ships pinned to native 720p, revert to 1×."*

With §4.2 the cell is **32 logical px**. Under `FitViewport`:

| Display | Logical→physical | 64 px source becomes | Result |
|---|---|---|---|
| 1280×720 | 1.0× | 32 physical px | **every 2nd authored pixel discarded** |
| 1920×1080 | 1.5× | 48 physical px | **non-integer resample — worst case** |
| 2560×1440 | 2.0× | 64 physical px | 1:1, perfect |

So 2× art is only correct on a 1440p+ display, and is *actively destructive* at 1080p, which
is the most common resolution. Pixel art **upscales** perfectly by integer factors and
**downscales** terribly.

→ **Proposed amendment A-1: revert D-21 to 1× (32-based) authoring.** See §9.

This is not a downgrade in quality. A well-drawn 32×32 sprite with a real light direction,
a rim light and a readable silhouette beats a 64×64 sprite drawn on a shared stick rig — and
it renders crisply at 720p, 1080p, 1440p and 4K alike. It also cuts authoring cost ~4×,
which is what makes bespoke-per-unit (§7) affordable.

---

## 6. User-interaction audit

Ordered by how much they hurt.

| # | Issue | Detail |
|---|---|---|
| I-1 | **Tower placement is offset from the cursor.** | `buildable2(gx,gy)` anchors the 2×2 footprint at the clicked cell's **bottom-left**, so the tower appears up-and-right of where you clicked. Should be cursor-centred with a live ghost + range ring **before** the click. |
| I-2 | **Enchant loadout of 2 is not implemented.** | D-13 locks *"the player equips exactly 2 per map"*. The HUD draws all 6 (`CursedHoardGame:664`). There is no loadout screen. Either build it, or amend D-13. |
| I-3 | **`TargetingPolicy` exists but is unreachable.** | `Tower.targetingPolicy` supports FIRST/LAST/STRONGEST/NEAREST; `World.findTarget` honours it; **no UI ever sets it.** Every tower is permanently FIRST. This is a free, high-value depth lever — put a 4-way toggle in the tower panel. |
| I-4 | **ESC is overloaded.** | ESC leaves the level. With an armed enchant, the natural expectation is "cancel the cast". Right-click does nothing at all. |
| I-5 | **Only 2 of 6 enchants have hotkeys** (F, M). No hotkeys for tier selection, no `Q`/`E` cycling, no rebinding. |
| I-6 | **No pre-build information.** | The build palette shows cost only. No damage, range, rate, or damage-type — the player cannot compare 4 factions without leaving to the Almanac. |
| I-7 | **Sell is instant and unconfirmed** — one misclick on a T6 tower is unrecoverable. No undo. |
| I-8 | **Upgrade replaces the `Tower` object.** | `handleTowerPanelClick` constructs a `new Tower(up,…)` and swaps it into the list, discarding turret facing, banked crypt charges and cooldown, then does an `indexOf` + full `towerAt` scan. Should mutate in place, or copy live state across. |
| I-9 | **No camera control.** No pan, no zoom, no follow. Acceptable at 1:1 full-bleed; would be required if you ever go bigger than one screen. |
| I-10 | **Hint line is a single static string.** *"Fell trees for ground - towers take 2x2"* shows permanently. No contextual tutorial, no tooltips on hover. |
| I-11 | **Wave "SEND" reward is invisible.** | Early-calling shows `+<n>` but never explains it is bonus gold. |
| I-12 | **No speed-3× and no fast-forward through intermission** beyond the send button — standard modern-TD comfort. |

---

## 7. Mechanics audit

### 7.1 Contradictions with locked decisions *(bugs — these need fixing either way)*

| # | Code | Locked decision | Conflict |
|---|---|---|---|
| M-1 | `drawResultOverlay`: `stars = max(1, round(3 * kept / total))` | **D-31(d)**: 3★ = *no enemy ever touched a gem*; 2★ = all 5 retained; 1★ = ≥1 kept | Completely different metric. The "never touched" flag is not even tracked. |
| M-2 | `"+3 skill points"` (flat) | **D-14**: ≈ +1 per map +1 per star | Wrong economy; makes the 200-rank tree trivial to fill. |
| M-3 | HUD draws 6 enchants | **D-13**: equip exactly 2 | See I-2. |
| M-4 | `World()` seeds `GemType.values().length` gems | **D-31(c)**: *every map has exactly 5 gems* | Works only if `GemType` happens to have 5 values — brittle coupling. Should be an explicit constant. |
| M-5 | `WavePlan.waveCount(worldIndex, levelIndex)` ignores `worldIndex` | — | Dead parameter; World 5 level 1 has the same wave count as World 1 level 1. |
| M-6 | No per-wave difficulty scalar | **D-30(c)**: *"difficulty = roster mix + an optional per-wave scalar"* | Not implemented. |

### 7.2 Design weaknesses

**W-1 — All 25 levels play the same.** `WavePlan.wave()` derives every wave from an
HP-sorted roster via formulas (`count = 5 + l*2 + i*2 + …`). The result: every level is the
same shape with bigger numbers. Meanwhile `MAPS.md` promises a per-level *gimmick*. Nothing
in the code can express a gimmick.
→ **Suggestion:** authored wave tables, one data file per level, sitting next to the `.map`.
Keep `WavePlan` as the generator that *seeds* a new table, not as the runtime source. This
is the single highest-value mechanical change available.

**W-2 — Demon aura towers are unbounded free DPS.** `Tower.isAura()` (all Demon NOVA tiers)
deals `damage * 0.55 * dt` to **everything in range, every frame, forever** — no reload, no
cost, no target cap. Towers cannot be destroyed (D-05a) and there is no ammo. Two
`INFERNAL_CALDERA` covering a chokepoint is likely a hard-dominant strategy.
→ **Suggestion:** give auras a duty cycle (pulse on/off), a target cap, or a mana upkeep.

**W-3 — Beam DPS is not commensurable.** Beams apply `damage * 1.1 * dt` and **never read
`fireInterval`**, while bolt towers deal `damage` per `fireInterval`. So a beam tower's true
DPS is `1.1 × damage`, a bolt tower's is `damage / fireInterval`. These are different units.
Nothing guarantees a T6 beam is stronger than a T6 bolt.
→ **Suggestion:** define one canonical `effectiveDps()` per `AttackPattern` and balance
against it; add a unit test asserting DPS is monotonic across each tier chain.

**W-4 — ~40 % of the authored troop animation is dead.** In-game, `drawHeroes` only ever
requests `"fly"` or `"walk"`. `"idle"` appears only in the Almanac. **`"ability"`, `"carry"`
and `"death"` never play anywhere.** That is a direct breach of the README non-negotiable
(*"every listed asset must be used"*) and it wastes D-04d's per-ability FX.
→ **Suggestion:** play `death` on kill, `ability` while a `UnitBehavior` fires, `carry` on
gem pickup (the code currently draws a gem icon over the walk cycle instead).

**W-5 — Towers have no failure state at all.** D-05a (no HP) is a good decision, but the only
enemy counterplay is `disabledTimer`, used by one behaviour (`TowerSuppressionField`). With
no HP, no ammo, no overheat and no upkeep, a placed tower is a permanent, cost-free asset.
That flattens the mid-game: the only decision is *where*, never *whether* or *when*.
→ **Suggestion:** keep "no HP", but add one soft pressure valve — e.g. Goblin machinery
overheats and must vent, or Demon towers consume mana while firing. This is the difference
between a TD you play once and one you replay.

**W-6 — Contact damage has no animation (D-25) *and* no target.** Enemies cannot damage
towers (D-05a) or buildings (D-05b). So what is enemy "attack" for? Nothing. This is
internally consistent but means enemy variety is expressed **entirely through defence and
movement**. That is thin. The `behaviors/` library (30 strategies) is the saving grace —
lean into it harder.

**W-7 — `spawnHero` allocates a full copy of the path per unit** (`lane` list, 40–80
`Vector2`s per spawn) plus a `new Random` every spawn. At W5 wave counts (~25 units/wave)
that is meaningful churn. Use a shared path + per-unit offset.

### 7.3 What is genuinely good

Worth saying plainly, because it should be preserved through any rebuild:

- The **typed damage model** (`DamagePacket`/`ResistanceProfile`/`ResistanceProfileFactory`
  deriving resistances from keyword+role flags) is a clean, extensible design. Keep it.
- The **`UnitBehavior` component list** (D-30b) is the right *architecture*.
  ⚠ **CORRECTION (2026-07-27):** I originally wrote "and is properly implemented". That was
  wrong, and I only found out when I went to wire the ability animations. **30 of the 31
  behaviour classes are empty data stubs** — `Taunt` is a class declaration and a comment;
  `ThresholdInvuln` stores three fields and implements no hook that could ever read them. Only
  `MultiPhase` implements anything. `Hero.update` loops over them and every call lands on the
  interface's empty default, so **every troop ability in the game is currently inert**. I had
  judged this from the file listing rather than the file contents. See `TROOPS_STATUS.md` §2.
- **`MovementStrategy` + `WaterPathfinder`/`AuthoredPolyline`** (D-15) is elegant: air lanes
  fall out of the water layer for free.
- The **JS → `sprites.json` → `PixelArtAtlas` pipeline** is a genuinely good idea. The
  problem is *what the JS draws*, never the pipeline. Keep it (see §8).
- **13 test classes** including `GameplaySimulationTest` and `AuthoredMapsTest`. Rare and valuable.

---

## 8. Proposed sprite rebuild *(your decision: bespoke builder per unit)*

Keep the pipeline. Replace the kits.

### 8.1 New structure

```
assets/data/
  palette.js            unchanged (the palette is good)
  lib/
    pixel.js            primitives only: set · rect · disc · line · flood · mirror
    shade.js            ramp helpers, key-light direction, rim light, ambient occlusion
    ink.js              outline() with variable weight + interior ink lines
    anim.js             frame/tween helpers
  troops/
    w1_peasant.js       ← one file per archetype. Own anatomy. Own pose. Own everything.
    w1_guard.js
    …  (53 files)
  towers/
    orc_t1_watchpost.js ← one file per tower. Own footprint, roof, mass, weapon.
    …  (48 files)
```

`humankit.js` and `towerkit.js` are **deleted**. Shared code drops to geometry + shading
primitives that carry no body plan. It becomes structurally impossible to ship a recolour.

### 8.2 Per-unit authoring contract

Every troop file must declare and satisfy:

```js
export const SPEC = {
  silhouette: 'hunched quadruped, low mass, forward head',  // prose, one line
  scale: 0.7,          // relative mass, drives the squint test
  anatomy: 'canine',   // humanoid | canine | avian | serpentine | mechanical | amorphous | …
  keyLight: 'NE',      // consistent across the whole game
  worldRamp: 'W5',     // D-12: palette language only
};
```

**Gate (automated, per batch):** render every pair of units that can share a wave as pure
black silhouettes at 32 px and assert the shapes differ by > N% of pixels. This turns D-28's
squint test from a review opinion into a build failure. Same gate for the 12 towers of a
faction (D-27).

### 8.3 Quality levers the current kits lack

1. **A key light.** One global direction (NE). Every form shaded to it. This alone is 60 % of
   "painted, not flat".
2. **Rim light on dark units** (D-22d, currently unimplemented).
3. **Ambient occlusion** where limb meets torso, roof meets wall, unit meets ground.
4. **A contact shadow** under every unit — the single cheapest way to make sprites sit *on*
   the map instead of floating over it. Also solves D-14's flyer readability (Q-14).
5. **Interior ink lines**, not just an exterior outline — that is what "ink-line gothic" means.
6. **Silhouette-first authoring**: block the black shape, pass the squint test, *then* paint.

### 8.4 Sequencing

Do **not** start 101 files at once. Proposed order:

1. Settle §4 (cell size) and §5 (1× vs 2×). Art depends on both.
2. Build `lib/` + the silhouette-diff gate.
3. **Pilot batch of 6**: 2 troops from different worlds, 2 towers from different factions,
   2 tiles. You review the render. Iterate the style until you are happy.
4. Only then mass-author, world by world / faction by faction, gate-checked per batch.

---

## 9. Proposed amendments to locked decisions

Each needs your yes/no. None is applied.

| ID | Amends | Proposal | Why | Cost |
|---|---|---|---|---|
| **A-1** | **D-21** | **Revert to 1× (32-based) source density.** | §5: 2× is destructive at 720p/1080p and only pays off at 1440p+. Pixel art upscales, never downscales. | Saves ~4× authoring. Requires re-deriving the §2.2 canvas table. |
| **A-2** | **D-19** | Keep full auto-edge, but **build it for real**: widen `TileResolver` to an 8-bit corner-aware mask, wire it into `drawTiledPlayfield()`, and author the transition sets before any more maps. | §3.3: `TileResolver` is dead code resolving keys that do not exist; the game currently ships hand-placed static tiling — the option D-19 rejected. | 1 transition set × 5 biomes + ~1 day engine. |
| **A-3** | **D-05a** | Keep "towers have no HP", but **add one soft upkeep/overheat pressure**. | §7.2 W-5: a permanent free asset flattens the mid-game. | Small engine change, large feel change. |
| **A-4** | **D-06/D-25** | **Restore a minimal troop attack/impact beat** (2 frames or a contact-FX flash). | §7.2 W-6: with no attack and no tower HP, enemies never *act*. Combat currently has no visible verb. | 53 × 2 frames, or 0 if done as pure FX. |
| **A-5** | **new** | **Authored wave tables per level**, one file beside each `.map`. | §7.2 W-1: the single biggest gameplay win available. Currently all 25 levels are one formula. | 25 small data files + a loader. |
| **A-6** | **D-32** | **Reconsider "no audio" — at minimum, hit/fire/death SFX.** | A silent TD feels broken regardless of how good it looks. This is the cheapest game-feel upgrade on the list (~30 short samples). Music can stay cut. | libGDX audio is ~40 lines. |
| **A-7** | **D-07** | HUD becomes **floating overlay blocks over a full-bleed map**, with the §4.2 safe-rect authoring rule. | Falls out of the 1:1 geometry; D-07's "independent floating blocks" already describes it. | Moderate. |

---

## 10. Proposed answers to the open questions

Marked ⭑ where I have a strong recommendation, ? where it is genuinely your call.

| Q | Proposal |
|---|---|
| **Q-02** Palette | ⭑ Keep the unified ~160-code master palette **plus per-biome ramp selection** — already how `palette.js` + D-16(e) work. No change. |
| **Q-03** Anim density | ⭑ Superseded by D-06/D-25; but **restore `death` and `ability` playback** (§7.2 W-4) before authoring anything new. |
| **Q-06** Tower attack anim | ⭑ **Full 4f** (wind-up · release · recoil · return) for turret towers; 2f flash for beams/auras. Towers are static, so the attack is their only motion. |
| **Q-07** Beams | ⭑ **Animated segments** — currently a stretched 1×1 white quad (`whiteRegion`), which is the cheapest-looking thing on screen. Per-faction colour already exists. |
| **Q-08** Aura ring | ⭑ **Pulsing** — and tie the pulse to the duty cycle from A-3/W-2 so the visual reads the mechanic. |
| **Q-09** Projectile rotation | ⭑ Free-rotate small/fast bolts (current); **8-way for anything ≥ 24 px** (harpoons, boulders, shells), matching D-23's reasoning. |
| **Q-10** Champions | ⭑ **Full unique sprites** — D-28 already forbids the colour-shift option. Q-10 should be closed as answered-by-D-28. |
| **Q-11** Bosses | ⭑ **Distinct silhouettes, all 5.** Same reasoning. |
| **Q-12** Death anim | ⭑ **Faction-keyed**: W1/W3/W4 ragdoll fall, W2 ascension motes, W5 dissolve to shadow. Reuses FX already authored (`fx_vanish`, `fx_ascension_pillar`). |
| **Q-13** Carrier state | ⭑ **Distinct `carry` row** — already authored, currently never played (W-4). Just wire it. |
| **Q-14** Flyer shadow | ⭑ **Yes** — and give *every* unit a contact shadow (§8.3). |
| **Q-15** Spell style | ? Leaning **chunky/symbolic** over painterly glow — soft fades fight the no-AA indexed rule (D-08). |
| **Q-16** Meteor | ⭑ **Full streak + landing + lingering fire** — the lava pool is already a skill unlock (D-13). |
| **Q-17** Terror/Curse | ⭑ **Hex circle** — skulls collide with the Crypt faction; eyes collide with the Shadow Realm. |
| **Q-18** Frost/Lightning | ⭑ **Distinct sets.** They are separate `DamageType`s with separate resistances; sharing art hides a mechanic. |
| **Q-19** Buttons | ? **Rune-stone tablet** best fits D-16's carved-stone chrome. Ornate banner is the fallback. |
| **Q-21** Font | ⭑ **Two-font system**: bitmap pixel for numbers/HUD (crisp at 1:1), a serif display face for headings. |
| **Q-23** Wave queue | ⭑ **Vertical stack, right edge** — fits the new 20:11 aspect; a horizontal rail eats the widened playfield. |
| **Q-24** Heading plates | ⭑ **Stone slab**, matching D-16(b). |
| **Q-25** Menu backgrounds | ? **Parallax with foreground silhouette** if budget allows; slow-loop ambient otherwise. |
| **Q-26** In-game backdrop | ⭑ Moot under A-7 — the map is full-bleed. Use a **1-cell vignette** at the frame edge instead. |
| **Q-27** Night mode | ⭑ **Lighting overlay only.** Separate night tilesets double the tile budget for little gain. |
| **Q-28** Path style | ⭑ **Pinned per world** — reinforces world identity and halves the autotile sets needed for A-2. |
| **Q-29** Map size | ✅ **Answered: 40 × 22 @ 32 px, 1:1** (§4.2). |
| **Q-30** Per-world buildings | ⭑ **Yes** — already keyed per biome in the engine; it is cheap identity. |
| **Q-31** Boss arenas | ? **Same tileset + a bespoke arena layout** per world L5. Unique tilesets for 5 levels is poor value. |
| **Q-33** Source format | ⭑ **Keep JS pixel-row files** (§8) — the pipeline is a strength. |
| **Q-35** Naming | ⭑ **Keep current keys.** A versioned prefix buys nothing and touches every call-site. |

---

## 11. Proposed build order

1. **Geometry** — `GameMap` 40×22, `SCALE` 1.0, HUD → overlay blocks, `.map` migration script. *(unblocks everything)*
2. **Decide A-1** (1× vs 2×). *(blocks all art)*
3. **Interaction pass** — I-1 · I-3 · I-4 · I-6 · I-7 · I-8. Cheap, high-felt.
4. **Mechanics fixes** — M-1…M-6 (spec conflicts), then W-2 · W-3 · W-4.
5. **Art `lib/` + silhouette-diff gate.**
6. **Pilot art batch (6 assets)** → your review → lock the style.
7. **Mass authoring**: tiles + autotile sets (A-2) → towers (48) → troops (53).
8. **A-5 authored wave tables** + a balance pass against `effectiveDps()`.
9. QA: 100 % utilisation gate, silhouette gate, DPS-monotonicity test, all 25 maps playable.

---

## 12. Still open — I need your call

1. **The 25 `.map` files.** Migrate automatically (paths preserved, may need touch-up) or re-author by hand?
2. **A-1 (1× vs 2×)** — this blocks all art. My recommendation is 1×; it depends on whether you intend to ship windowed at 1080p or fullscreen at 1440p+.
3. **A-3 / A-5 / A-6** — the three amendments that change what the game *is* rather than how it looks. A-6 (sound) in particular reverses D-32.
4. **Scope of this pass.** Is the 53-troop + 48-tower re-author in scope now, or do you want geometry + interaction + mechanics shipped first and the art as a second campaign?
5. ~~**Which data folder is the source of truth?**~~ **Answered 2026-07-26: `Game_assets_v2/assets/data`.** See §13.1 — `assets/data/` is a stale byte-identical duplicate and should be deleted.

---

## 13. Redesign envelope — what is actually free to change

*(added 2026-07-26, answering "can every asset be completely redesigned?")*

**Yes. Every drawn asset in the game can be redesigned from zero.** The engine imposes almost
no constraints on the art — it is a generic indexed-sprite loader. Verified below.

### 13.1 Source of truth

`Game_assets_v2/assets/data/*.js` is authoritative. Confirmed pipeline:

```
Game_assets_v2/assets/data/*.js        ← author here
  → scripts/export-sprites.mjs         (reads Game_assets_v2, only this)
    → assets/generated/sprites.json    (8.4 MB, the single runtime artefact)
      → PixelArtAtlas("generated/sprites.json")   ← the only asset call in Java
```

⚠ **`assets/data/` is a byte-identical stale duplicate** (verified with `diff -rq`: no
differences). Nothing in Java reads it; only `assets/render.js` and
`scripts/gen_dashboard.mjs` point at it. It is a trap — editing it changes nothing and the
divergence will not be noticed.
→ **Action: delete `assets/data/`, and repoint `gen_dashboard.mjs` and `assets/render.js` at
`Game_assets_v2/assets/data/`.**

### 13.2 Total redesign surface

| | Count |
|---|---|
| Sprites | **577** |
| Animation frames | **1 730** |
| Authored pixels | **6 862 656** |
| Palette codes | **163** |
| Loose PNGs | **13** (app icon · 2 overworld maps · 10 world fragments) |

By family: troops 197 · projectiles 48 · tiles 44 · icons 32 · fx 31 · goblin 30 · node 30 ·
orc 24 · ui 24 · bld 17 · gem 15 · crypt 12 · demon 12 · obstacle 10 · bg 9 · particle 8 ·
enchant 6 · map 25 · chrome 2 · splash 1.

### 13.3 What the engine does **not** constrain

Verified in `PixelArtAtlas.java` — it parses whatever it is handed:

- **Canvas size** — free, per sprite. Sizes come from the JSON grid; every draw call passes
  explicit width/height in logical units (`atlas.drawCentered(batch, key, x, y, w, h, t)`).
  A tower can be 32×48 or 96×192; nothing breaks.
- **Frame count** — free. `Sprite.frame()` modulos over whatever length exists.
- **fps / loop / anchor** — free, per sprite, declared in the data file.
- **Animation states** — free to add. `SpriteKeys.troop()` falls back across
  `preferred → walk → idle → fly → ability → death`, so a missing state degrades instead of crashing.
- **Colours** — every one of the 163 hexes can be retuned without touching a sprite (this is
  exactly how D-22's darkening was applied). New codes can be added freely.
- **Silhouette, anatomy, style** — entirely free. This is where §8's rebuild lives.
- `mapGrid()` and `TileResolver` — both **dead code**, zero callers. Not constraints.

### 13.4 The only four real constraints

| # | Constraint | Detail | Workaround |
|---|---|---|---|
| **C-1** | **Key prefixes** | `SpriteKeys` resolves by prefix + fuzzy token match: `troop_<stem>_<state>` · `<faction>_t<tier>_<stem>` (+ `_base`, `_unit`, `_unit_attack`) · `tile_` · `icon_` · `fx_` · `proj_` · `bld_` · `gem_` · `enchant_` · `ui_` · `node_` · `map_w<N>_l<N>_` · `bg_` · `particle_` · `obstacle_`. | The matcher is **tolerant** — stems can change, states can be missing. Only the family prefix and the enum-derived tier/stem tokens are load-bearing. Q-35's "keep current keys" answer costs nothing. |
| **C-2** | **Palette membership** | Every legend char must map to a code present in `PALETTE`, else the renderer emits magenta. | Not a limit on colour — add codes. Just never hardcode an off-palette hex. |
| **C-3** | **Overworld fragment PNGs** | `maps/worlds/map<N>-<world>.png` (10 files, 1536×1024) double as **alpha hit-masks for click routing** — `WorldMap` samples their alpha to decide which world you clicked. | Redesign freely, but each world's opaque region must stay in roughly the same screen position, or level selection breaks. |
| **C-4** | **`assets/maps/*.map`** | These are **level data, not art** — per-cell terrain + role + rotation for all 25 campaign maps. Redesigning tiles does not touch them; changing the **grid size** (§4.2) does. | Handled by the §4.3 migration script. |

### 13.5 The real limit is authoring cost, not the engine

6.86 M authored pixels across 1 730 frames is the current volume. Two levers:

- **A-1 (revert to 1× density)** cuts the pixel budget roughly **4×** — this is what makes
  bespoke-per-unit (§8) affordable rather than theoretical.
- **§8.4 sequencing** — pilot batch of 6, lock the style, then mass-author per world/faction
  behind the silhouette-diff gate. Do not start 101 files before the style is signed off.
