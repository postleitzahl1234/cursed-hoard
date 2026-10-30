# Implementation Plan — from-scratch rebuild + agent-team build

This doc binds the **locked design (D-01 … D-27, D-32)** to a **from-scratch rebuild** of the
game (the old `cursed_treasure_v2` build is deleted — **D-18**) and defines (a) what the rebuild
must reproduce vs. add, (b) the OO architecture, (c) the build order, (d) the agent-team
partition that lets the work run in parallel, and (e) the **asset-independent build track + test
suite** (§8) that lets the engine + tests be built **now**, before any final art lands. The audit
of the now-deleted engine is kept as the **reference spec** — it records what the old code did so
the rebuild loses nothing.

It exists because the audit (below) proved the README's *"engine stays the same; only
assets change"* is **no longer true**: the design docs (typed damage D-11, status-immunity
D-17, summon trees D-10, water-flight D-15, carrier-dismount D-09) outgrew the flat combat
engine. Rather than refit legacy code, the chosen path (**D-18**) is a **full from-scratch
rebuild**: delete the old v2 build, keep only the app icon + the `redesign/` docs, and write
the OO engine below clean. (No VCS backs the old code, so anything the rebuild needs that
lives only in code — e.g. the menu/screen flow — must be captured into `redesign/` *before*
deletion.)

**Status:** approach **LOCKED** (full from-scratch rebuild). Architecture below is **APPROVED (D-30)** and now spans **D-01 … D-31** (turrets D-23/D-26, autotiling D-19, 2× art
D-21, troop-anim trim D-25, faction recolour D-24 folded in); real decision points are collected
in §7. Numbers stay qualitative (house style); the band→% scale is a balance-pass artefact, not a
design-doc one.

**How to read:** §1 = what exists vs. what's net-new. §2 = the new class design (this doc
*is* allowed to be concrete about classes/interfaces — that's its job, unlike the
qualitative balance docs). §3 = dependency-ordered phases. §4 = who builds what in parallel.
§5 = the interface contract that makes parallelism safe. §6 = problems to expect. §7 = your
open calls. **§8 = the asset-independent build track + test suite — build the engine + tests
before any final art (answers "can this start now?": yes).**

---

## 1. The audit — code-as-is vs. docs-as-specified

Verified by reading the (now-superseded) engine — kept as the rebuild's **reference spec**
(what the old code did, so the from-scratch build reproduces it deliberately, not by
accident). The enemy entity is **`Hero`** (the attacking Kingdom
troops; the player is the dark side). `HeroType` = enemy stat enum; `TowerType` = tower
stat registry; `Faction` = tower family; `*V2Data` = auto-generated sprite frames.

| System | Code today | Docs demand | Gap |
|---|---|---|---|
| **Damage** | `Hero.damage(int, boolean isMagic)`; flat `armor`/`magicResist` int-subtraction | D-11 typed `{PHYSICAL,FIRE,FROST,LIGHTNING,CURSE}` + resist **bands** + per-type immune/resist/vuln | **net-new** |
| **Magic-resist** | single `magicResist` int | D-17: resist vs **Crypt school** (FROST/LIGHTNING/CURSE); element entries stack | **net-new** |
| **Status** | `slow` + `fear` (one `fearless` bool) + `invulnTimer` | D-17 set `{FEAR,SLOW,FREEZE,STUN,BURN,CURSE}` + per-unit immunity subset + role conventions | **net-new** |
| **STUN** | only enemy→tower (`Tower.applyStun`) | also tower→enemy (status set) | **new direction** |
| **Execute** | none | D-14 Crypt-6 %-max-HP execute; boss/champ execute-**immune** (D-17) | **net-new (cross-dep)** |
| **Boss logic** | `BossBehavior` 5-case `switch` in `Hero.updateBossBehavior`, magic-number summons (`HeroType.KNIGHT`…) | D-10 data-driven **phased summon trees** (interval+cap, burst seeds new cap) + darkness-disable | **generalize** |
| **Abilities** | `EnemyAbility` enum `switch` (7 cases) | INVENTORY §4 behavior library (FearlessAura, CleanseAura, Taunt, ShieldMode, DamageToHeal, Resurrect, DeathLeech, Untargetable, GroupCohesion, …) | **Strategy pattern** |
| **Flight** | `type.flying` bool + `flyingOverride` | D-15 all flyers water-bound (MovementStrategy / AirRouteProvider / WaterPathfinder) | **net-new path** |
| **Carrier** | `Hero.carrying` pickup/drop | D-09 mounted-carrier `fort→–` dismount; GemShade BlinkToGem | **new behaviors** |
| **Factions** | 6 (incl. `WITCH`,`BEAST`) in `Faction`, `TowerType`, `Tower.effectiveDamage`, `SkillTreeBonus` | D-01 cut Witch & Beast → 4 (Orc/Crypt=UNDEAD/Demon/Goblin) | **delete + retype** |
| **Towers** | ~9/faction, old names (Bunker Den, Icy Crypt…) | TOWERS.md 48 (4×12, six-tier two-split) | **re-author** |
| **Troops** | old roster (Peasant/Rogue/.../Archmage) in `HeroType` | concept.md 53 themed troops, bound in TROOPS.md | **re-author** |
| **Troop sprites** | `HeroesV2Data` auto-gen, old keys | 53 new troops | **regen via JS pipeline** |
| **Towers (runtime)** | static sprite, instant-aim | D-23/D-26 static **base + 8-way rotating turret** (Orc 12 + Goblin gun 6); Goblin drone/bomber = **launch platforms** | **net-new (tower-side)** |
| **Drones** | drone was a projectile/effect | D-26 autonomous **flying drone actors**, distinct per tier, appear-on-lane lifecycle | **net-new actor** |
| **Tiles** | static / hand-placed variants | D-19 **autotile** bitmask resolver per biome | **net-new resolver** |
| **Source art** | ~24/48 px, scaled | D-21 **64 px 2× density**, no-AA (D-08); JS→`*V2Data` bake | **pipeline** |
| **Troop anim** | idle+walk+attack+death | D-25 **drop attack** → idle+loco(+fly)(+cast)+death | **trim** |

**Damage call-sites (the spine refit must find all):** `Projectile.applyHit` (line 68);
the **beam** flush (`Tower.beamDamageAccum`); the **chain** path (UNDEAD/`AttackPattern.CHAIN`);
the **aura** path (`AttackPattern.AURA`); plus behavior-sourced damage (DeathExplosion, etc.).
Missing one = an untyped-damage leak. (The beam/chain/aura flush live in `World`/`GameScreen`,
not yet read — the owning team locates them via the `Hero.damage(...)` callers.)

---

## 2. Architecture (OO, expandable)

Five subsystems. Each is a clean seam; together they realize D-09…D-17.

### 2.1 Typed damage & resistance (D-11 / D-17)

```
enum DamageType { PHYSICAL, FIRE, FROST, LIGHTNING, CURSE }   // 5 player sources; MAGIC is a
                                                              // resist-category, not a source
enum ResistBand { NONE, LIGHT, MED, HIGH, HEAVY, FORT }        // → bandToMultiplier() [balance pass]
enum ElementResponse { NORMAL, RESIST, IMMUNE, VULN }

final class ResistanceProfile {                 // value object on HeroType
    ResistBand physBand;                         // PHYS armor
    ResistBand cryptBand;                        // D-17 "magic-resist" = vs {FROST,LIGHTNING,CURSE}
    EnumMap<DamageType,ElementResponse> overrides; // FIRE-immune, FROST-vuln, … stack on top
    EnumSet<StatusType> statusImmunities;
    boolean executeImmune;
}

final class DamagePacket { float amount; DamageType type; List<StatusApplication> riders; boolean execute; }
```

`Hero.damage(DamagePacket)` resolution order:
1. invuln → 0.
2. band: `PHYSICAL`→physBand · `FROST/LIGHTNING/CURSE`→cryptBand · `FIRE`→no band.
3. element `overrides` (resist/immune/vuln) **stack** on the band.
4. execute rider: if `!executeImmune` and `hp ≤ threshold` → kill.
5. subtract; handle MULTIPLE_LIVES revive.
6. apply `riders` filtered by `statusImmunities`.

This matches D-17 verbatim ("MAGIC band = Crypt school; unit FROST/CURSE entries stack").
`bandToMultiplier()` is the *only* place the qualitative band→% scale lands — tuned later.

### 2.2 Status system (D-17)

```
enum StatusType { FEAR, SLOW, FREEZE, STUN, BURN, CURSE }      // FREEZE = hard-slow
class StatusController { /* per-Hero: active statuses, timers, stacking, DoT for BURN */ }
class StatusApplication { StatusType type; float magnitude; float duration; }
```

`Hero.applyStatus(app)` → immunity check (`statusImmunities.contains`) generalizes today's
`if (type.fearless) return`. **Role modifiers** (derived, not hand-authored): boss =
`SLOW`-resist (generalizes the current `applySlow` boss-damping) + FEAR/STUN/execute-immune;
champion = `STUN`-resist + execute-immune. Replaces the ad-hoc `slowTimer`/`fearTimer` fields.

### 2.3 Unit behaviors — Strategy/Component (replaces both `switch`es)

```
interface UnitBehavior {
    default void onSpawn(Hero h, World w) {}
    default void onUpdate(Hero h, World w, float dt) {}
    default void onDamaged(Hero h, World w, DamagePacket p) {}
    default void onDeath(Hero h, World w) {}
    default boolean isTargetable(Hero h) { return true; }   // Untargetable / Mirage / blink
}
```

`Hero` holds `List<UnitBehavior> behaviors` (built from `HeroType`). `update`/`onKilled`
delegate. Library (1 class each, cross-ref INVENTORY §4): HealAura, FearlessAura (self-immune
per D-17-D), CleanseAura, Taunt, ShieldMode, DamageToHeal, Resurrect (cap 2), DeathLeech,
DeathExplosion, Untargetable, GroupCohesion, SandstormCover, Frenzy, StationaryPerformer,
MountedCarrier (D-09 `fort→–`), BlinkToGem.

- **SummonTree (D-10):** one behavior, data-driven — `List<Phase{ hpFrac, List<SummonSpec{ HeroType, interval, cap }> }>`; burst seeds the next phase's cap. Generalizes `SUMMON_KNIGHTS`/`MULTIPLE_LIVES` escorts.
- **MovementStrategy (D-15):** `interface MovementStrategy { void advance(Hero,float dt); }` → `GroundPath` vs `WaterAirRoute` (AirRouteProvider + WaterPathfinder). `HeroType.flying` selects the water route; replaces the `type.flying` branch in `walkAlongPath`.

### 2.4 Resistance derivation — the factory (the "don't author 53×11 cells" win)

`ResistanceProfileFactory.derive(HeroType)` applies TROOPS.md §1 **keyword + role rules**
from declarative semantic flags on `HeroType` (`fearless`, `fireImmune`, `mechanical`,
`clergy`, `boss`, `champion`, `mountedCarrier`), then merges per-unit deviations. Authors
write *exceptions only*; the matrix derives. Direct port of the TROOPS §1 design intent.

### 2.5 Content layers (where the rosters live)

| Layer | Today | Becomes |
|---|---|---|
| `Faction` | 6 incl. WITCH/BEAST | 4 (ORC, UNDEAD=Crypt, DEMON, GOBLIN); add `DamageType` identity + accent (D-24: Orc green · Crypt blue · Demon red · Goblin brass) |
| `TowerType` | ~9/faction, `magicDamage` bool | 48 (4×12) per TOWERS.md; `DamageType` field; `+hasTurret`/`pattern` (D-23/26, see §2.6); drop bool + WITCH/BEAST |
| `HeroType` | old roster, flat ints | 53 troops; semantic flags + `ResistanceProfile` (via factory) + `behaviors` |
| `BossBehavior`/`EnemyAbility` | two enums + switches | retired into the behavior library + SummonTree |
| `*V2Data` sprites | auto-gen, old keys | regen via JS/palette pipeline for new keys (not hand-edited) |
| `Tower.effectiveDamage`, `SkillTreeBonus` | WITCH/BEAST branches, `magicDamage` | retype to DamageType / Crypt; drop cut factions |

---

### 2.6 Tower runtime, turret, projectiles & drones (D-02/06/20/23/26)

The §2 architecture above is enemy-side; this is the **tower side** the rebuild also needs.

```
final class TowerType {                  // registry row (one of the 48)
    Faction faction; int tier;
    DamageType damageType;               // replaces boolean magicDamage
    AttackPattern pattern;               // BOLT | LOB | BEAM | NOVA | CHAIN | DRONE | BOMBER
    boolean hasTurret;                   // D-23/26: Orc(12)+Goblin gun(6) = true; Crypt/Demon
                                         //          + Goblin drone/bomber = false
    ProjectileType projectile;           // per-tier, no reuse (D-06)
    // range, fireRate, splashRadius … qualitative now, balance pass later
}
class Tower {                            // live instance on a build cell
    TowerType type; Targeting targeting; // acquire current target (nearest/first/strongest)
    Turret turret;                       // null unless type.hasTurret
    float cooldown;
    void update(World w, float dt);      // target → aim turret → fire on cooldown
}
class Turret {                           // D-23: 8-way directional
    Vector2 pivot; int facing;           // 0..7; engine snaps aimAngle → nearest of 8
}                                        // 5 authored 3/4 facings (E/NE/SE/N/S) mirrored to 8
```

- **Firing routes through `DamagePacket` (§2.1):** each shot/beam/nova builds a packet
  (`type = damageType`, riders = SLOW/BURN/…) → `Hero.damage`. Beam = continuous flush;
  Nova/Aura = bounded sweep; Chain = hop list. **No screen-clearing AoE** (D-05).
- **Turret (D-23/26):** only `hasTurret` towers rotate; the base stays static (D-06). Crypt,
  Demon, and Goblin's **drone & bomber** towers have `turret == null`.
- **Drone & bomber actors (D-26):** Goblin drone/bomber towers don't fire — they spawn
  **`DroneActor`** entities (a 3rd actor type beside `Hero`/`Tower`) on an air `MovementStrategy`,
  with their own fly + attack/drop anim and an appear-on-lane → return-home lifecycle; distinct
  design per tier, bombers ≠ attack drones. The towers are static **launch platforms**.
- **Structural tiers (D-20/D-27)** are an art + `TowerType`-key concern (12 distinct silhouettes
  / faction) — **no runtime branch**.

### 2.7 Rendering & asset pipeline (D-08/19/21)

- **Indexed, no-AA (D-08):** the loader bakes indexed-ASCII JS grids (`assets/data/*.js`) →
  `*V2Data` via `palette.js` (code→hex). **Design never hand-edits Java or ships PNG** — the
  authoring contract (`claude_design_instructions.md` §2) is fixed, so real art drops in with
  **zero code change**. This is what makes §8 (art-later) work.
- **2× source density (D-21):** world-grid sprites authored at 64 px / 32 px logical cell
  (tiles 64², troops 64², towers 64×128 …); logical grid unchanged (32×30 @ 32 px). Renderer
  draws at the logical footprint, **no supersample/blend**. The engine is **density-agnostic**, so
  the open 1×-vs-2× call is an asset swap, not a code change.
- **Autotiling (D-19):** a neighbour-aware **bitmask `TileResolver`** chooses edge/corner variants
  per biome from a full transition set; the Map Builder paints by **role** (base/path/obstacle/
  special). New seam for the rebuild.
- **Placeholder-first (→ §8):** the loader resolves a **missing key → a typed placeholder** at the
  correct canvas size + anchor, so the whole engine renders + runs before any final art exists.

---

## 3. Build order (what gates what)

```
Phase 0  CONTRACTS (serial, blocking)  — all §2 enums + value objects + interfaces as a
         shared API with stub impls. Merging this unblocks every team. The linchpin.
Phase 1  COMBAT CORE (T1)             — Hero.damage(packet) + StatusController + refit ALL
         damage call-sites (Projectile, beam, chain, aura).
Phase 1′ BEHAVIOR FRAMEWORK (T2)      — UnitBehavior wiring in Hero + library + SummonTree +
         MovementStrategy.            [parallel with P1 once P0 lands]
Phase 2  CONTENT — towers (T3) + troops (T4 + factory)   [parallel; against P0/P1 APIs]
Phase 2′ ART (T5) + UI/CHROME (T6)    [parallel from the start; gated only by DELIVERY
         naming + roster keys from T3/T4]
Phase 3  MAPS + WAVES (T7)            [after tiles from T5 + content keys from T3/T4]
Phase 4  INTEGRATION + BALANCE (band→% tuning) + 100% utilisation QA
```

**Asset-independent (see §8):** the P0–P4 *logic* (combat, behaviours, towers + turrets, troops,
maps, waves, economy, save, screen-flow) builds and **tests against placeholder assets** — real
art (T5) integrates last via the fixed pipeline (§2.7) with no code change. **Each phase ships
with its tests; green tests are the phase gate, not finished art.**

---

## 4. Agent-team partition

Parallelism is safe **because Phase 0 freezes the interfaces** — teams code against stubs,
never against each other's internals.

| Team | Owns | Depends on | Can start |
|---|---|---|---|
| **T1 Combat Core** | DamageType/ResistBand/ElementResponse/ResistanceProfile/DamagePacket/StatusType/StatusController; `Hero.damage` refit; all damage call-sites | P0 | after P0 |
| **T2 Behavior** | `UnitBehavior` + library; SummonTree (D-10); MovementStrategy (D-15); carrier (D-09) | P0; T1 packet/status for damaging behaviors | after P0 |
| **T3 Towers** | 48-tower `TowerType` tree; Faction cleanup; SkillTree/`effectiveDamage` retype | P0 DamageType | after P0 |
| **T4 Troops** | 53 `HeroType` roster; ResistanceProfileFactory; behavior + summon-tree assignments | P0; T1 profile; T2 behaviors | after T1/T2 ifaces |
| **T5 Art/Assets** | sprite authoring (JS/palette), palette.js→~160, FX (INVENTORY §4), regen `*V2Data` | DELIVERY naming; roster keys (T3/T4) | **immediately** |
| **T6 UI/Chrome** | D-16 cool-gothic recolor, `UiPalette` refit, stone 9-patch, screens | palette (T5); UiPalette | after palette |
| **T7 Maps/Waves** | 25 maps (Map Builder) + wave authoring | tiles (T5); content keys (T3/T4) | after tiles+content |
| **Integration/QA** | continuous merge, balance pass, 100% utilisation gate | all | continuous |

Critical path: **P0 → T1 → T4 → T7 → QA**. T3, T5, T6 run alongside; T5 (art) is the long
pole and starts day one.

**Art-later (§8):** because the asset contract is frozen (§2.7) and the loader placeholders any
missing key, **T1–T4 + T7 build to completion without T5**. T5 (art) stays the long pole but
**no longer blocks** the engine/logic/test critical path — it lights the game up visually when
batches arrive. For a single-builder (Gemini) handoff, read the team columns as a **sequence**:
P0 contract → combat/behaviour → towers/troops → maps/waves → integration, art folded in last.

---

## 5. Interface contract (the Phase-0 deliverable)

The single artefact every team agrees on before parallel work. Freeze these signatures:

- `DamageType`, `ResistBand` (+`float bandToMultiplier(ResistBand)` stub), `ElementResponse`, `StatusType` enums.
- `ResistanceProfile`, `DamagePacket`, `StatusApplication` value objects (fields per §2.1–2.2).
- `boolean Hero.damage(DamagePacket)` · `void Hero.applyStatus(StatusApplication)` · `boolean Hero.isTargetable()`.
- `UnitBehavior` interface (hooks per §2.3) · `MovementStrategy` interface.
- `SummonTree.Phase` / `SummonTree.SummonSpec` config records.
- `ResistanceProfile ResistanceProfileFactory.derive(HeroType)` signature.
- `HeroType` semantic-flag set: `fearless, fireImmune, mechanical, clergy, boss, champion, mountedCarrier`.
- `DamageType TowerType.damageType` (replaces `boolean magicDamage`).

Stubs return safe defaults so the project compiles green throughout Phase 0.

---

## 6. Risks / problems to expect (reflect-first)

1. **Damage call-site sprawl** — `Hero.damage` has ≥4 callers (projectile/beam/chain/aura) + behavior sources. A grep-driven checklist gates "typed-damage done."
2. **Save/progress format (greenfield)** — a from-scratch rebuild has **no legacy saves to migrate** (the old `PlayerProgress` is deleted). Design the new save schema clean from the start (factions Orc/Crypt/Demon/Goblin · the 48 towers · the 53 troops · skill-tree ranks D-14); no migrator needed.
3. **Execute cross-dependency** — execute-immune (D-17) presupposes the %-max-HP **execute** mechanic (D-14 Crypt-6), which doesn't exist yet. T1 must add execute, or T3's Crypt tree stubs it.
4. **Balance retune** — `bandToMultiplier()` + every tower number is qualitative today; typed resist forces a full balance pass (Phase 4) before shipping.
5. **Asset toolchain** — `*V2Data` is generated by `extract_heroes_v2.py` from JS source. Regen for 53 troops needs the toolchain runnable, not hand-edited Java. Confirm it exists/runs.
6. **Map scale** — 25 maps (MAPS.md) via Map Builder; the builder must accept the new terrain tiles (INVENTORY §6 / TerrainV2Data) before T7 can start.
7. **STUN direction flip** — STUN currently only flows enemy→tower; adding tower→enemy STUN must not collide with the existing `Tower.applyStun`.
8. **`tier` system overlap** — `Hero.tier` (recruit/veteran/champion) adds flat armor/resist bonuses; D-04 says no enemy levels. Decide whether `tier` survives as a wave-scaling knob or is retired into the resistance model.
9. **Turret aim vs. 8-way art (D-23/26)** — the engine snaps `aimAngle` to the nearest of 8; the projectile spawn point must track the turret muzzle **per facing**, and `hasTurret==false` towers (Crypt/Demon + Goblin drone/bomber) must skip rotation cleanly.
10. **Autotile correctness (D-19)** — the bitmask `TileResolver` + the per-biome transition set must agree on edge indices; author + test **one** biome's blob set, then replicate to the other four.
11. **Art is the long pole / not ready (current reality)** — mitigated by §8 (placeholder loader + headless tests). Residual risk = a *late* change to a sprite's **contract** (canvas size / anchor / key), which ripples into placeholders + layout — so **freeze `INVENTORY.md` + `claude_design_instructions.md` §2.2 as the asset contract** before mass authoring.

---

## 7. Open items — ✅ RESOLVED 2026-06-01 (D-30 / D-31; pinned in `SETUP.md` §8)

*All calls below are now decided (FREEZE=distinct type · behaviors=component list · enemy tiers
retired · execute in Combat Core · greenfield save · seed-then-tune balance · parallel teams ·
libGDX/lwjgl3/Gradle/Java 17 · single dark theme · Infinite Peril omitted · 5 gems/map + star
metric · flight lanes every flyer-world level). Retained below for history/context.*

- **D-18** — recorded in DECISIONS.md: the approach (full **from-scratch rebuild**) is **locked**; the §2 architecture is **APPROVED (D-30)** (the items below are now resolved).
- **Capture-before-delete (gating the clean)** — the old v2 build is deleted with **no VCS backup**. Anything the rebuild must reproduce that lives only in code — chiefly the **menu/screen flow** (`WorldSelect` · `MapSelect`/`LevelSelect` · `Settings` · `Almanac` · `SkillTree` · `InfiniteSetup` · in-game HUD, plus `UiPalette`/`UiChrome`/`NineSlice` infra) — must be written into a `redesign/STRUCTURE.md` **first**, *or* a decision taken to design the menus fresh. **Now captured in `STRUCTURE.md`** (reconstructed from docs + feature history; confirm its `[ASSUMED]` items).
- **FREEZE modeling** — distinct `StatusType` (as drafted) vs. a SLOW magnitude variant?
- **Behavior granularity** — component-list (drafted) vs. a single `behaviorPreset` enum per troop? List is more expandable; preset is fewer files.
- **Team count** — 7 teams + QA, or collapse (e.g. fold T6 UI into T5 art, T7 maps into QA)?
- **`tier` system** — keep as wave-scaling, or retire (risk #8)?
- **Execute ownership** — T1 builds execute, or T3 Crypt stubs it (risk #3)?
- **Save migration** — version-bump + reset, or write a migrator (risk #2)?
- **Band→% scale** — owned by Phase-4 balance, or pre-seeded now as a first-guess table?
- **Tower-side model (§2.6)** — confirm the `Tower` + `Turret` + `DroneActor` split (D-23/D-26) and the `AttackPattern` set, or simplify.
- **Asset-later track (§8)** — greenlight building the engine + full test suite on **placeholder art now** (recommended) so the art delay doesn't gate the logic. The screen-flow doc that gated this is **now written (`STRUCTURE.md`)** — confirm its `[ASSUMED]` items (theme toggle, Infinite mode, results metric) and the build is fully unblocked.

---

## 8. Asset-independent build track & test suite (build now, art later)

**Yes — the engine + its full test suite can be built before any final art exists**, and given art
is the long pole this is the recommended path. Gameplay logic depends only on the asset
**contract** (sprite **key + canvas size + anchor**, frozen in `INVENTORY.md` +
`claude_design_instructions.md` §2.2), never on the pixels; final art lands later through the
fixed JS→`*V2Data` pipeline (§2.7) with **zero code change** — the whole point of D-08's authoring
contract.

### 8.1 Buildable with no art (≈ the entire engine)
- **All of §2** — typed damage/resist, status, behaviours, summon trees, movement + water-flight,
  resistance factory, **tower runtime + turret + targeting + projectiles, drone actors**.
- **Content data** — 4 factions, 48 `TowerType`s, 53 `HeroType`s + derived resistance profiles,
  skill-tree ranks (D-14), 6 enchants (D-13).
- **Systems** — wave spawning, economy + gems + carrier (D-09), build/sell, save schema, HUD
  wiring, and **screen-flow / navigation** *(now captured in `STRUCTURE.md`)*.
- **Maps** — Map Builder + `TileResolver` (D-19) run on placeholder tiles; the 25 maps author as data.

### 8.2 Placeholder asset layer
- The loader maps any **missing sprite key → a typed placeholder** at the correct canvas size +
  anchor (§2.7): a flat **role/faction-coloured block** (Orc green · Crypt blue · Demon red ·
  Goblin brass · enemies per world accent · tiles per biome) with a 1 px ink border (so
  silhouette/anchor bugs still surface) + an optional frame-index overlay for anim debugging.
- Because placeholders honour the **same key/size/anchor contract** as final art, swapping in real
  sprites is a **pure data drop** — no layout or code churn.

### 8.3 Test suite (headless; gates each phase)
- **Harness:** libGDX **`HeadlessApplication`** + JUnit (no GL context needed for logic) · a
  fixed-seed `World` fixture · deterministic `dt` stepping.
- **Coverage by system:**
  - *Damage/resist (§2.1):* table-driven over every `DamageType` × `ResistBand` × `ElementResponse`;
    immune = 0, vuln > 1, execute kills ≤ threshold, execute-immune survives, multi-life revive.
  - *Status (§2.2):* apply / expire / stack, immunity skips, FREEZE = hard-slow, BURN DoT ticks,
    boss SLOW-resist / champ STUN-resist.
  - *Behaviours (§2.3):* each `UnitBehavior` in isolation (aura radius, taunt retarget, shield,
    damage-to-heal, resurrect cap = 2, untargetable gating); SummonTree phase flips seed the next
    cap (D-10); MovementStrategy ground vs water route + carrier dismount (D-09).
  - *Towers (§2.6):* targeting picks the right enemy; turret snaps to nearest of 8;
    `hasTurret==false` never rotates; fire cadence; packet type = faction; beam/nova/chain bounded
    (no screen-wipe, D-05); drone spawn/return lifecycle.
  - *Resistance factory (§2.4):* keyword/role flags derive the matrix; per-unit overrides win;
    matches the TROOPS §1 cases.
  - *Economy / waves / save:* gem pickup/drop/carry, wave caps + summon caps, save round-trips
    (greenfield schema, no migrator).
  - *Utilisation gate (README):* assert every `INVENTORY` key has a consumer **and** every consumed
    key exists (100 % utilisation) — runs against placeholders too.
- **Deferred to real-art time:** golden/render tests (atlas, draw order, autotile blob, 9-patch) —
  a thin layer over an already-tested logic core.

### 8.4 Sequencing implication
Run §3 as **P0 → P1/P1′ → P2 (towers/troops) → P3 (maps/waves) → save/screens**, each phase
**green-tested on placeholders**. **Art (T5) + render/golden tests integrate last** and block
nothing on the logic critical path. Net: Gemini can deliver a **fully playable, fully tested engine
on placeholder art now**, and the game "lights up" when Claude-design's batches arrive.
