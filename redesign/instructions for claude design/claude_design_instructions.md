# Claude Design — Sprite Production Instructions

The single brief for **Claude design** (the art role). Every sprite in the redesign is
produced from these rules. It synthesises the binding constraints scattered across
`STYLEGUIDE.md` (palette + art direction), `INVENTORY.md` (the exhaustive what-to-make
list), `concept.md`/`TOWERS.md`/`TROOPS.md` (subjects; deeper combat mechanics stay in the
root `../SYSTEMS.md`), and the delivery rules (which live here until `../DELIVERY.md` is written).

> **This folder is your self-contained packet.** Everything you need lives in
> `instructions for claude design/`: this brief + design extracts of `STYLEGUIDE.md`,
> `INVENTORY.md`, `concept.md`, `TOWERS.md`, `TROOPS.md` (trimmed to art-relevant content —
> the redesign-root originals stay the engineering source of truth). Those five extracts are
> siblings here and cover everything needed to author a batch. A few pointers use a `../`
> prefix (`../SYSTEMS.md` behaviour detail; `../MAPS.md` + the planned `../DELIVERY.md`) —
> that is root overflow, not required to start.

**Read order before producing a batch:** this file → `STYLEGUIDE.md` §1 (palette) + the
relevant §3/§4/§5 → the matching `INVENTORY.md` section → the subject doc (concept/
TOWERS/TROOPS) for that asset's lore/role.

> **From-scratch rule (D-18):** the redesign is **100% new art** — *nothing* is reused from
> the old `cursed_treasure_v2` build. The old `assets/data/*.js` sprite modules are
> reference for the *format only*, and are being deleted. Author everything fresh against
> the master palette below.

---

## 0. The one-paragraph brief

Painted 2D **pixel art, 64×64 source** (2× cell density, D-21), **ink-line gothic** with strong visible borders
(D-08), on a **darker cool gothic-night** stage (D-16/D-22). Every sprite samples **only** the shared
**~160-colour indexed master palette** (`STYLEGUIDE.md` §1) so the whole game reads as one
cursed world. **Troops are fully animated; towers are static** (attack-only). **Every
ability ships its own FX sprite** (D-04d). Target: **100 % utilisation** — every delivered
sprite maps to an `INVENTORY.md` consumer; orphans are deleted, not kept.

---

## 1. Hard technical rules (non-negotiable)

| Rule | Value | Source |
|---|---|---|
| Source resolution | **per category — see §2.2** (authoritative); art is authored at **2× cell density — 64 px source per 32 px logical cell** (D-21): the **64×64 actor cell** governs troops, tiles **64×64**, icons **48×48**, backgrounds **2560×1440** | D-08 / D-21 / §2.2 |
| Logical screen | **1280×720** (FitViewport) | README |
| Tile grid | **32×30 cells @ 32 px** (world 1024×960) | README |
| Palette | **indexed**, sample **only** the master palette (`STYLEGUIDE.md` §1); no off-palette colours | D-16 |
| Outline | every sprite has a dark **ink line** (IK0/IK1) and a clean silhouette read | D-08 |
| Background | **transparent** (palette index 0 / alpha) | engine |
| Density | troops anim — idle/move/(fly)/(ability)/death, **no attack (D-25)**; towers static + attack anim only — **Orc & Goblin add a rotating 8-way turret on a static base (D-23); Goblin drone/bomber towers are launch platforms (D-26)** | D-06 / D-23 / D-25 / D-26 |
| FX | one bespoke FX sprite **per ability/behaviour** (no generic reuse) | D-04d |
| Utilisation | every sprite has a code consumer (INVENTORY row) | README |

---

## 2. Authoring format (the pipeline contract)

Sprites are authored as **indexed ASCII pixel grids inside JS data modules** under
`assets/data/*.js` (one module per asset group — e.g. `heroes`, `towers`, `projectiles`,
`obstacles`, `chrome`, `gems`, `ui`, `terrain`). The rebuilt loader bakes these into the
generated `*V2Data.java` tables — **design never hand-edits Java, and never delivers PNGs**.
The **only** delivered artifact is the `.js` module(s) + the manifest (§7).

Per module:
- A **legend** maps each grid character → a master-palette code (e.g. `` ` ``→transparent,
  `o`→IK1 outline, `g`→GD3 gold…). Keep the legend at the top of the module, and
  **complete** — every character used in any grid appears; no unused entries.
- A sprite = a **2-D char grid** (rows of equal width). One grid per frame.
- An **animation** = an ordered `frames` list + `fps`/`loop` flag + an `anchor` (§2.2).
- A sprite **key** (snake_case, see §7) names each entry so the loader and code agree.

This format is engine-agnostic: the from-scratch rebuild reimplements the loader, but the
**authoring contract (indexed ASCII grids in `assets/data/*.js` sampling the master
palette) is fixed** — it is what lets new batches drop in with no per-asset code changes.

### 2.1 Worked example (the module template — copy this shape)

```js
// assets/data/particles.js  — one module per asset group
export const LEGEND = {
  '`': null,    // transparent  (the ONLY non-opaque value; index 0 / alpha)
  'o': 'IK1',   // ink outline
  'c': 'VL4',   // white core   ← codes, never raw hex (palette.js resolves code→hex)
  'y': 'VL3',   // volt yellow
  'b': 'VL1',   // volt blue
};

export const SPRITES = {
  particle_spark: {                 // snake_case key (§7)
    anchor: 'center',               // center = FX / projectile / gem; foot = ground actor
    fps: 12, loop: false,           // one-shot
    frames: [                       // each frame = rows of EQUAL width (here 8×8)
      [ '``oo`o``',
        '`obyybo`',
        '`bycyyb`',
        'obyccyyo',
        'obyyccyo',
        '`byyycb`',
        '`obyybo`',
        '``o``oo`' ],
      [ '`o``o```',
        '``obbo``',
        '``bycb``',
        '`obycyb`',
        '`byccyo`',
        '``byyb``',
        '``obo```',
        '```o````' ],
    ],
  },
};
```

### 2.2 Canvas size, anchor & facing (authoritative — §1/§3 defer here)

**Density (D-21):** all world-grid art is authored at **2× cell density — 64 px source per
32 px logical cell**. The logical grid is unchanged (32×30 cells @ 32 px, world 1024×960
logical); only the *source* canvas doubles, so a 1-cell actor is drawn on 64×64 and the
engine displays it at its logical footprint. The no-AA indexed rule (D-08) is intact — 2×
means **more authored pixels, not** a supersample/blend. All sizes below are **source px**.
*(Scope: every category here is 2× — don't mix densities. The 2× payoff assumes the frame
renders at ≥2× the 720p logical size; render resolution is undecided, so 2× is the safe
default — if the game ends up pinned to native 720p, this table reverts to 1× / 32-based
before mass authoring.)*

| Category | Canvas (source px) | Anchor | Facing / notes |
|---|---|---|---|
| Troops (standard) | **64×64** | **foot** (bottom-centre) | author **3/4 view facing screen-right (east)**; engine **mirrors** for leftward lanes — **no up/down sets** (the 3/4 view reads for every lane direction) |
| Troops (large — behemoth/ogre) | **64×96** | foot | same facing rule |
| Air actors (drones/bombers) | **64×64** | center | fly anim; foot only when they land |
| Towers | **64×128** (1 wide × 2 tall) | foot (on the build cell) | static base; the raised structure reads above its 32 px logical cell |
| Tower turret (Orc/Goblin, D-23) | **≤64×64** | **pivot** (turret seat on the base) | rotating: author **5 3/4 facings** (E/NE/SE/N/S), engine **mirrors to 8** + snaps aim to nearest; attack anim plays per-facing. **Crypt/Demon have no turret** |
| Buildings | **≤192×192** | foot | multi-cell capturable; 5-stage |
| Projectiles | **≤64×64** | center | author **pointing east (→)**; engine **rotates** to the flight angle |
| Ability / enchant FX | **≤192×192** (bounded, D-05) | center | one-shot or loop per behaviour |
| Particles | **≤32×32** | center | — |
| Terrain tiles | **64×64** | cell (top-left) | seamless within a biome |
| Gems | **64×64** | center | + carried overlay composites onto the carrier (D-09) |
| UI chrome | per block (**9-patch**) | — | stretchable middle, fixed corners |
| UI icons | **48×48** | — | 1 frame |
| World cards | **512×384** | — | hero illustration |
| Map nodes | **192×192** | — | ring states |
| Backgrounds | **2560×1440** | — | 1 frame |
| Title splash | **1536×384** | — | — |

**Multi-cell rule:** a sprite taller/wider than one 32 px cell (towers, large troops,
buildings) is authored on the canvas above and the engine pins its **anchor** to the cell —
the foot row sits on the ground cell, the rest rises above. Never bake an offset into the
art; the anchor does the placement.

### 2.3 Pixel rules (no ambiguity)

- **No anti-aliasing.** Every pixel is exactly one indexed colour; no semi-transparent or
  blended edge pixels. The **only** non-opaque value is the legend's transparent char.
- **Dithering** (checkerboarding two adjacent ramp steps) is allowed for gradients but used
  sparingly — silhouette read comes first (D-08).
- **Colour by CODE, never hex.** Grids reference family-step codes (`EM4`, `IC3`…) through
  the legend; `palette.js` resolves code→hex. This is precisely why the **[DRAFT]** hexes can
  be tuned later without touching a single sprite.
- **Frame counts:** where §3/§5 give a range (death `F=2–4`, FX `F=4–6`), **default to the
  lower bound**; add frames only where the motion needs them; **never exceed the upper
  bound** (atlas budget).

---

## 3. The work list — per category (exhaustive enumeration in `INVENTORY.md`)

| # | Category | Count | Source size | Frames | Palette / notes |
|---|---|---|---|---|---|
| §1 | **Towers** | 48 (4×12) | 64×128 | attack **F=4**; **static** base (no idle/move/death) | per-faction accent (§4); +1 shared stun overlay; **12 distinct silhouettes/faction — structural tiers + per-faction shape & detailing in `TOWERS.md` extract (D-20/D-27/D-29)**; Orc/Goblin turret → next row (Goblin drone/bomber = launch platforms, D-26) |
| §1 | **Tower turrets** (Orc + Goblin gun lines, D-23/D-26) | ~18 (Orc 12 + Goblin 6) | ≤64×64 | attack **F=4** × **5 facings** (E/NE/SE/N/S, mirrored to 8) | rotating turret on the static base; engine snaps aim to nearest of 8; **Crypt/Demon + Goblin drone/bomber towers have none** |
| §1 | **Projectiles/beams** | 48 (1/tier) | ≤64×64 | travel **F=2** + impact **F=3** | no shared pool — unique per tier (D-06) |
| §1 | **Drone/bomber actors** | ~6 | 64×64 | fly **F=4** + attack/drop **F=4** | Goblin drone-wing + bombers; **distinct design per tier; bombers ≠ attack drones (D-26)** |
| §3 | **Troops** | 53 | 64×64 | idle **F=2** + locomotion **F=4** + death **F=2–4** (+ability/cast where it has one); **no attack (D-25)** | per-world sub-style (D-12) but **distinct creature each — no shared prototype (D-28)**; +dual locomotion for carriers/flyers |
| §4 | **Ability FX** | ~29 + 2 | varies | **F=4–6** | per damage/status hue (§4 here / STYLEGUIDE §5); + orbiting-charge layer + ground-fire decal |
| §5 | **Enchant FX** | 6 | varies | cast/impact **F=4–6** | + lava-pool (skills-gated, deferred) |
| §6 | **Terrain tiles** | 5 biomes × **auto-edge set** (base+path bitmask + obstacle clusters) + per-world water special | **64×64** | static (some water shimmer) | full autotile ramp per biome (D-19); per-world palette (STYLEGUIDE §4) |
| §7 | **Buildings** | 8 capturable × **5-stage** + Power Station + Cursed Portal + Gem Cave | ≤192×192 | capture stages; portal open/active | no HP, capture/objective only (D-05) |
| §8 | **Gems** | 5 tones | 64×64 | idle pulse **F=4** + pickup **F=4** + **carried-gem overlay** (rides carrier, D-09) | ruby/emerald/sapphire/topaz/amethyst (GR/GE/GS/GT/GA) |
| §9 | **UI chrome** | block set | per block | static | carved-stone **9-patch** + bevel/shadow (D-07/D-16) |
| §10 | **UI icons** | ~32 | **48×48** | 1 frame | resources + enchants(6) + damage-type(6) + status(5) |
| §11 | **Backgrounds** | ~10 | **2560×1440** | 1 frame | menu/settings/almanac/loading + 5 level-select |
| §12 | **World cards / nodes** | 5 cards + 25 nodes + ring states | 512×384 / 192×192 | 1 frame | per-world hero illustration; per-map node |
| §14 | **Particles** | 8 | small | **F=4** | arrow/bone/spark/smoke/blood/explosion/magic_glow/soul |
| §15 | **Loading & boot** | bar 9-slice + title splash | 1536×384 splash | — | — |
| §13 | **Skill icons** | **0 bespoke** | — | — | reuse UI icons + 6 enchant icons (D-14) |

Counts are the **minimum density** tier; they shift as maps (§16) finalise. **Source sizes +
anchors + facing are authoritative in §2.2** (the *Source size* column above echoes it).

> **Coverage check:** every sprite category in `INVENTORY.md` **§1–§15** appears as a row
> above (sprite production). `INVENTORY.md` **§16** (the 25 maps) is a **composition** task,
> not a sprite — see **§6 Map design**. `INVENTORY.md` remains the authoritative line-item
> checklist; cross-check it for the 100 % utilisation gate (§7).

---

## 4. Palette & colour-language discipline (the anti-collision rules)

Sample only from `STYLEGUIDE.md` §1 families. Key contracts to honour so types read at a
glance and never collide:

**Darker overall (D-22):** default large-area fills to the **darker ramp steps**; reserve the
top 1–2 light steps for highlight/rim only. Saturated brights (fire/ice/volt/hex/gold) are
**accents + FX that pop against the dark**, never big fields. Borders stay visible (D-08) —
keep a value gap to the IK0/IK1 outline and rim-light dark shapes on the dark backdrop.

**Faction tower accents (STYLEGUIDE §3, re-themed D-24):** Orc = **green** (war-green, MS3
`#5d8a3a`), Crypt = **ice-blue** (IC3 `#a0e0ff`), Demon = **lava-red** (EM3 `#ff4124`),
Goblin = **brass** (steampunk, BR4 `#d8a847`). Purple (HX/CR) is **not** a faction → it is the
**CURSE / Shadow-Realm** signature.

**Damage-type FX hues (STYLEGUIDE §5):** PHYSICAL = steel/dust (no tint) · FIRE = ember→lava
(EM) · FROST = ice (IC) · LIGHTNING = volt yellow-core + blue crackle (VL) · CURSE = void
indigo (CR, distinct from MAGIC's orchid HX).

**Status FX hues:** FEAR = HX/CR purple miasma · SLOW = AQ deep + IC rim · STUN = gold-yellow
stars (GD/EM) · BURN = flame (EM) · CURSE = CR + IK void.

**Per-world sub-style (D-12 + STYLEGUIDE §4):** troops within a world share one **visual
language** (palette ramp + detailing motifs) — **not a shared body.** Cross-world returners keep
their own design but adopt the host world's accents (e.g. desert Outrider = camel-rider).

**⛔ No shared prototype — every enemy is its own creature (D-28).** Do **not** reuse one humanoid
base recoloured across the roster — that is a **hard fail**. Each of the 53 is a distinct design
driven by its `concept.md` Trait + role: its own **silhouette, scale, species/anatomy, equipment,
pose**. **Species match the world, not a default human** — W1 human army · W2 clergy/zealots +
winged Seraph · W3 desert raiders + **camel mounts** + sand-beasts · W4 royal court + **Falconer +
bird** + **Clockwork machines** · W5 **demons/undead/shadow**. Non-humanoids are mandatory where the
role says so: **mounted = the mount · mechanical = a machine · flyer = wings/rotor · behemoth = a
huge mass · mage = robed/levitating · swarm = small/many.** **≥3 distinctness levers** must differ
between any two units that can share a wave (silhouette · scale · anatomy · headgear/weapon · stance
· accent), and they must be **distinguishable as black shapes at 32 px** (squint test — the same bar
as towers, D-20/D-27). The **only** sanctioned reuse: Shadow King = the King corrupted (D-10).

---

## 5. Animation rules (D-06 / D-04d)

- **Troops:** idle + locomotion (walk **or** ride **or** fly) + death (+ ability/cast where
  the unit has one), **4–6 frames each** — **no attack animation (D-25)**. Carriers/flyers
  that dismount or land need a **second locomotion set** (walk) — see INVENTORY §3 "+walk"
  column.
- **Towers:** **static** — attack animation only (no idle bounce, no locomotion, no death).
  Optional shared **stun/disabled overlay**. **Every tier ships its own attack anim + its
  own projectile/beam** — nothing reused across tiers. **Orc & Goblin (D-23):** the base is
  static but mounts a **rotating turret** drawn in **5 3/4 facings (E/NE/SE/N/S, mirrored to
  8)**; the engine snaps the aim to the nearest of 8 and the attack anim plays on the turret
  in its current facing. **Crypt & Demon stay single-sprite** (no turret). **Goblin's drone &
  bomber lines are launch platforms — no turret; their drones fight as separate flying actors
  (D-26).**
- **Ability FX:** one bespoke sprite **per behaviour** (D-04d), `F=4–6`, loop or one-shot
  per its `../SYSTEMS.md` behaviour. Bounded radius — **no screen-clearing AoE** (D-05).
- **Buildings:** 5-stage capture progressions (static stages); portal open/active states.

---

## 6. Map design — the 25 campaign maps

This is the **map-design brief**: the rules for composing the **25 campaign maps** from the
terrain tiles (§3). Five worlds × five levels, escalating; **level 5 of each world is the
boss map** (D-10). Maps are built in the **Map Builder** → exported to
`assets/custom_maps/` → imported via `MapsV2Data`/`MapDef`/`WorldDef`. Per-level briefs live
in `../MAPS.md` (**drafted** — 25 per-level briefs); world lore + bosses in `concept.md`.

### 6.1 Canvas & grid
- Grid **32×30 cells @ 32 px logical** → world **1024×960** logical, framed by the HUD chrome
  inside the **1280×720** screen (D-07). *Source tiles are authored at 2× density — 64 px per
  cell (D-21, §2.2) — and shown at the 32 px logical cell.*
- Every cell carries one terrain **role**: **base · path · obstacle · special (water/void)**
  (INVENTORY §6 / per-world ramps in STYLEGUIDE §4).
- **Tiling = full auto-edge (D-19):** the engine auto-selects edge/corner variants from a
  per-biome **bitmask autotile set**, so maps are painted by *role* — never by hand-placed
  edges. Design authors the **full transition set per biome** once (base↔path and
  base↔special borders, a 47-blob / 16-bitmask ramp), reused across all 25 maps; **obstacles
  stay static connectable clusters** (§3). The Map Builder stamps roles; the engine resolves
  which edge art to draw.

### 6.2 Per-map brief (the 5 knobs for each of the 25)
| Knob | Meaning |
|---|---|
| **World / biome** | one of the 5 (Grasslands · Holy Mountains · Sea of Sand · Royal Gardens · Shadow Realm) — fixes the tile ramp + sub-style (D-12) |
| **Path shape** | the lane(s) spawn → gem cave; the spatial puzzle |
| **Gem count** | size of the hoard you defend (drives the cave + win/lose) |
| **Boss** | the level-5 world boss (D-10); absent on levels 1–4 |
| **Gimmick** | the level's twist (split lane · building objective · flight pressure · hazard) |

### 6.3 Composition rules (locked)
- **Readability first:** the spawn → cave lane must read instantly; build-cells visibly
  distinct from path and obstacle.
- **Gem Cave** (INVENTORY §7) terminates the lane and displays the hoard gems (§3); it is
  the objective the Kingdom raids (D-09).
- **Obstacles are connectable clusters** (INVENTORY §6) — paint cohesive woods / crags /
  hedges / crystal, never lone tiles.
- **Buildings** (INVENTORY §7) placed per `concept.md`: e.g. W4 **Kings Power Station**
  (buffs enemies in radius), W5 **Cursed Portal** (mid-lane hazard). No HP, capture /
  objective only (D-05).
- **Bounded combat** (D-05): lay lanes so towers get meaningful coverage zones; no geometry
  implying screen-wide effects.

### 6.4 Flight lanes (D-15) — required wherever a world fields a flyer
All flyers are **water-bound**: a flyer routes **over water tiles only**, spawn → cave. Any
map whose world has a flyer **must paint a continuous water route** connecting spawn → cave,
with the **cave mouth adjacent to a water endpoint** (author-time: validate the route is
unbroken; straight-line fallback if broken).

| World | Flyer(s) | Water medium (Special layer) |
|---|---|---|
| W1 Great Grasslands | — none | no water route required |
| W2 Holy Mountains | Seraph | frozen river / glacial melt (AQ/IC) |
| W3 Sea of Sand | Giant Vulture | oasis waterway (D-05d) |
| W4 Royal Gardens | Royal Falconer · Clockwork Sentinel | pond / canal |
| W5 Shadow Realm | Imp Swarm | **cursed waterway** — void-tainted pool/channel (AQ deep + CR curse tint + HX glow, IK void edge). It reads as a void rift but is **water-typed**, so it carries `airTraversable` exactly like every other world's water (D-15a) |

### 6.5 The 25-map arc
Grasslands (Orc/PHYSICAL) → Holy Mountains (Crypt/FROST+FEAR) → Sea of Sand (Demon/FIRE) →
Royal Gardens (Goblin/engineering) → **Shadow Realm** (all 4 families; final boss Demon
Shadow King). Difficulty + roster escalate per `concept.md`.

### 6.6 Delivery
Per map: name · world · 32×30 grid · path · gem placement · building placement · flight lane
(if any). Export to `assets/custom_maps/<name>`, import via `MapsV2Data`. **Utilisation
gate:** every terrain tile + building authored in §3 must appear in at least one of the 25
maps (orphan tiles fail QA).

---

## 7. Naming + delivery (interim contract — supersedes the missing `../DELIVERY.md`)

**Keys** — snake_case, grouped, predictable so the loader maps them with no per-asset code:
- Towers: `tower_<faction>_<name>` → `tower_orc_ballista`, `tower_crypt_lightning_crypt_ii`
- Projectiles: `proj_<faction>_<name>` → `proj_orc_boulder`
- Troops: `troop_<name>_<state>` → `troop_knight_walk`, `troop_knight_attack`,
  `troop_golden_prince_ride`, `troop_golden_prince_walk`
- FX: `fx_<name>` → `fx_burn`, `fx_fear_ring`, `fx_resurrect`
- Enchants: `enchant_<name>` (FX) + `icon_<name>` (icon)
- Terrain: `tile_<world>_<role>` → `tile_grass_base`, `tile_sand_path`, `tile_oasis_water`
- Buildings: `bld_<world>_<name>_<stage>` → `bld_grass_castle_3`
- Gems: `gem_<tone>_<state>` → `gem_ruby_idle`
- UI: `chrome_<part>`, `icon_<name>`, `bg_<screen>`, `card_<world>`, `node_<state>`

**Frames** live in the entry's frame array — they are **not** encoded in the key.

**Delivery** — per batch:
1. One JS data module per asset group, dropped into `assets/data/` (or appended), with its
   palette **legend** updated.
2. A short manifest: the keys added · the master-palette codes used · frame counts ·
   the `INVENTORY.md` rows each key satisfies.
3. Follow `STYLEGUIDE.md` exactly for hues; if a needed colour is missing, propose a new
   master-palette step (do **not** invent an off-palette hex).
4. **Distinctness self-check (troop/enemy batches, D-28):** for each unit in the batch, note in
   the manifest **how its silhouette differs** from its wave-mates and confirm it is **not** a
   recolour/reuse of another unit's body (species matches the world). A batch that ships
   look-alikes is **rejected and redrawn.**

**100 % utilisation gate:** a key with no `INVENTORY.md` consumer is an orphan → cut it (or
add the consumer). The QA pass fails on any orphan.

---

## 8. Definition of done (per sprite)

- ✅ On-palette (only master-palette codes; correct family per §4).
- ✅ Ink-outlined, clean silhouette, transparent background.
- ✅ Correct source size (§1) and frame count (§3/§5).
- ✅ Reads at game scale (32 px tile / tower silhouette / 24 px icon).
- ✅ Matches its world sub-style (D-12); FX hue matches its damage/status type (§4).
- ✅ **Distinct creature (D-28)** — not a recolour/reuse of another unit's body; passes the 32 px
  squint test vs its wave-mates; species matches the world (no default-human shortcut).
- ✅ Mapped to an `INVENTORY.md` row; key + legend delivered per §7.

---

## 9. Residual open items (do not block the first authoring batches)

Format, sizes, anchors, facing, colour-by-code, naming + delivery are **locked** above. The
following are soft — safe to author around:
- **Palette hexes are [DRAFT]** (STYLEGUIDE §1): you author by **code**, so a later hex tune
  never invalidates a sprite. The ~160 count + family structure is locked.
- **Gem → world / hoard-tier mapping** (STYLEGUIDE §7): the 5 tones aren't pinned to worlds
  yet; author gems generically by tone — non-blocking.
- **LIGHTNING (VL) hue** final reading (STYLEGUIDE §7).

**Tile philosophy (Q-04) is now LOCKED — full auto-edge (D-19, §6.1):** the only terrain
consequence is that base/path become a per-biome **autotile bitmask set**; no actor sprite
changes. Start any non-terrain batch immediately.
