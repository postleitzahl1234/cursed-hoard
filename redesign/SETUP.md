# Phase-0 Setup & Contract — the turnkey build handoff

Everything a coding agent needs to **stand up the project and start building** without further
judgment. Pairs with `IMPLEMENTATION.md` (architecture + build order + test track) — this doc is
the **concrete scaffold**: tech stack, repo layout, the frozen interface contract as stub files,
the asset pipeline, the test harness, and the **build/run/test commands**. All open design calls
are pinned (D-30/D-31); nothing here is "your call."

**Status:** architecture **APPROVED** (D-30). Build with this + `IMPLEMENTATION.md` + the locked
`DECISIONS.md`. Art is not required to start — build on placeholders (§5 here / IMPLEMENTATION §8).

---

## 1. Tech stack (D-30h)

| Thing | Choice |
|---|---|
| Engine | **libGDX** (reuse existing) |
| Desktop backend | **lwjgl3** (`lwjgl3/` run module) |
| Build | **Gradle** (wrapper `./gradlew`) |
| Language | **Java 17** |
| Logical resolution | **1280×720**, `FitViewport` (README non-negotiable) |
| Tile grid | **32×30 @ 32 px** logical (world 1024×960) |
| Tests | **JUnit** + libGDX **`HeadlessApplication`** (headless, no GL) |
| Assets | indexed-ASCII JS modules in `assets/data/*.js` → baked to `*V2Data.java` (existing pipeline) |

Source art is authored at **2× density (64 px / 32 px cell, D-21)**; the engine is
**density-agnostic** (draws at the logical footprint), so 1× vs 2× is an asset swap, not code.

---

## 2. Repo & package layout

Base package: `io.github.some_example_name.game` (matches the existing `*V2Data.java`).

```
core/src/main/java/io/github/some_example_name/game/
  combat/      DamageType, ResistBand, ElementResponse, ResistanceProfile,
               ResistanceProfileFactory, DamagePacket, (execute lives here — D-30d)
  status/      StatusType, StatusApplication, StatusController
  behavior/    UnitBehavior + the component library (one class each)
  move/        MovementStrategy, GroundPath, WaterAirRoute, AirRouteProvider, WaterPathfinder
  summon/      SummonTree (Phase, SummonSpec)
  troop/       HeroType (data + semantic flags), Hero (live instance)
  tower/       TowerType, Tower, Turret, Targeting, AttackPattern, ProjectileType, Projectile
  actor/       DroneActor (D-26)
  world/       World (sim root), WaveSystem, Economy/Gems, Building
  content/     the registries: factions, the 48 TowerTypes, the 53 HeroTypes, 6 enchants, skills
  screen/      Boot, MainMenu, WorldSelect, LevelSelect, Game(+HUD), Pause, Results,
               Almanac, SkillTree, Settings, WaveBuilder, MapBuilder   (see STRUCTURE.md)
  ui/          UiPalette, UiChrome, NineSlice, AssetLoader (+ placeholder layer §5)
  data/        generated *V2Data.java (do not hand-edit)
assets/data/   *.js authoring modules (heroes, towers, projectiles, terrain, chrome, …)
lwjgl3/        desktop launcher (main)
```

Map the team partition (IMPLEMENTATION §4) onto these packages: T1→combat+status, T2→behavior+
move+summon+actor, T3→tower+content(towers), T4→troop+content(troops)+combat.ResistanceProfileFactory,
T5→assets/data+ui.AssetLoader, T6→ui+screen, T7→world.WaveSystem+MapBuilder.

---

## 3. Phase-0 interface contract (freeze these first — the linchpin)

Build these as compiling stubs returning safe defaults, merge, **then** parallel teams start
(IMPLEMENTATION §3/§5). Signatures reflect the locked decisions.

```java
// --- combat/ ---
enum DamageType { PHYSICAL, FIRE, FROST, LIGHTNING, CURSE }      // 5 player sources; MAGIC = resist-category only
enum ResistBand { NONE, LIGHT, MED, HIGH, HEAVY, FORT }          // bandToMultiplier() seeded now (D-30f)
enum ElementResponse { NORMAL, RESIST, IMMUNE, VULN }
final class ResistanceProfile {                                  // value object on HeroType
    ResistBand physBand, cryptBand;                             // cryptBand = vs {FROST,LIGHTNING,CURSE} (D-17)
    EnumMap<DamageType,ElementResponse> overrides;
    EnumSet<StatusType> statusImmunities;
    boolean executeImmune;
}
final class DamagePacket { float amount; DamageType type; List<StatusApplication> riders; boolean execute; }
final class ResistanceProfileFactory { static ResistanceProfile derive(HeroType t); }   // keyword/role → matrix
static float bandToMultiplier(ResistBand b);                    // first-guess table now, tuned Phase 4

// --- status/ ---  (D-30a: FREEZE is its own type)
enum StatusType { FEAR, SLOW, FREEZE, STUN, BURN, CURSE }
final class StatusApplication { StatusType type; float magnitude; float duration; }
class StatusController { void apply(StatusApplication a); void update(float dt); /* stacking, BURN DoT */ }

// --- troop/ ---
class Hero {
    boolean damage(DamagePacket p);          // resolution order in IMPLEMENTATION §2.1; execute resolves HERE (D-30d)
    void applyStatus(StatusApplication a);   // immunity-checked
    boolean isTargetable();                  // Untargetable / blink
    List<UnitBehavior> behaviors;            // D-30b component list
}
// HeroType semantic flags (factory input): fearless, fireImmune, mechanical, clergy, boss, champion, mountedCarrier
// NOTE (D-30c): NO per-unit tier field. Difficulty = roster + optional per-wave scalar.

// --- behavior/ ---  (D-30b)
interface UnitBehavior {
    default void onSpawn(Hero h, World w) {}
    default void onUpdate(Hero h, World w, float dt) {}
    default void onDamaged(Hero h, World w, DamagePacket p) {}
    default void onDeath(Hero h, World w) {}
    default boolean isTargetable(Hero h) { return true; }
}
// --- move/ + summon/ ---
interface MovementStrategy { void advance(Hero h, float dt); }   // GroundPath | WaterAirRoute (D-15)
final class SummonTree { /* List<Phase{hpFrac, List<SummonSpec{HeroType,interval,cap}>}> */ }  // D-10

// --- tower/ ---  (D-23/26)
enum AttackPattern { BOLT, LOB, BEAM, NOVA, CHAIN, DRONE, BOMBER }
class TowerType { Faction faction; int tier; DamageType damageType; AttackPattern pattern;
                  boolean hasTurret; ProjectileType projectile; /* range,fireRate,splash seeded */ }
class Tower { TowerType type; Targeting targeting; Turret turret /*null if !hasTurret*/; void update(World w,float dt); }
class Turret { Vector2 pivot; int facing; /* 0..7, snap aimAngle to nearest of 8 */ }
// --- actor/ ---
class DroneActor { /* MovementStrategy(air) + fly/attack anim; appear-on-lane → return-home (D-26) */ }
```

Stubs compile green and return safe defaults so every team builds against them, not each other.

---

## 4. Asset pipeline

- **Authoring contract is fixed** (D-08, brief §2): design delivers **indexed-ASCII JS modules**
  in `assets/data/*.js` + a palette legend. Engine **never hand-edits Java, never ships PNG**.
- **Bake step:** the existing extractor (`extract_*_v2.py` family) reads the JS modules → generates
  `data/*V2Data.java` tables. **Confirm the extractor runs** as the first asset task (IMPLEMENTATION
  risk #5); if it's missing, reimplement a JS→table loader — the *authoring format* stays fixed.
- **Keys/anchors/sizes** are frozen in `INVENTORY.md` + brief §2.2 — that triple (key + canvas +
  anchor) is the contract the engine codes against.

---

## 5. Placeholder layer (build before art — IMPLEMENTATION §8)

`ui.AssetLoader` resolves a **missing sprite key → a typed placeholder** at the correct canvas
size + anchor: a flat role/faction-coloured block (Orc green · Crypt blue · Demon red · Goblin
brass · enemies per world accent · tiles per biome) + 1 px ink border + optional frame-index
overlay. Real art later = a pure data drop, **no layout/code change**. The whole game renders +
runs on placeholders.

---

## 6. Test harness (gates every phase)

- **`HeadlessApplication` + JUnit**, a fixed-seed `World` fixture, deterministic `dt` stepping.
- Coverage by system (full list: IMPLEMENTATION §8.3): damage tables, status (incl. FREEZE),
  each `UnitBehavior`, SummonTree phase flips, MovementStrategy + carrier dismount, tower targeting
  + 8-way turret snap + `hasTurret==false` never rotates, ResistanceProfileFactory, economy/waves/
  save round-trip, and the **100 % utilisation gate** (every INVENTORY key has a consumer & vice
  versa). Golden/render tests deferred until real art.
- **Green tests are the phase gate, not finished art.**

---

## 7. Commands

```
./gradlew lwjgl3:run        # run the desktop game
./gradlew test              # run the headless JUnit suite (the phase gate)
./gradlew build             # compile + test + assemble
# asset bake (confirm/port): python tools/extract_*_v2.py   → core/.../data/*V2Data.java
```

---

## 8. Pinned decisions (no judgment needed — D-30 / D-31)

- **FREEZE** = distinct `StatusType`. · **Behaviors** = component list. · **Enemy tiers** = none
  (D-04). · **Execute** = in `Hero.damage` (Combat Core). · **Save** = greenfield, no migrator.
- **Balance** = seed a first-guess `bandToMultiplier()` + tower numbers now; real pass in Phase 4.
- **Build** = parallel agent teams on the frozen contract. · **Stack** = libGDX/lwjgl3/Gradle/Java 17.
- **Theme** = single locked dark palette, no toggle. · **Infinite Peril** = omitted.
- **Every map = 5 gems.** **Stars:** 3★ none touched · 2★ all 5 retained · 1★ ≥1 kept · lose all = fail.
- **Flight lanes** on every flyer-world (W2–W5) level.

---

## 9. Build order (recap — full detail in IMPLEMENTATION §3/§4)

`P0 contract (§3 here)` → `P1 combat core + P1′ behavior` → `P2 towers + troops` → `P3 maps + waves`
→ `save + screens (STRUCTURE.md)` → `P4 integration + balance + 100 % utilisation QA`. Art (T5)
integrates last; it blocks nothing on the logic critical path.
