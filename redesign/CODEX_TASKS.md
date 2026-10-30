# Remaining work — verified 2026-08-15

Written after the first real build+test run of this project on a machine with a JDK
(OpenJDK 25.0.4, Gradle 9.5, libGDX 1.14.0). Everything below was confirmed by compiling,
running the test suite, and launching the game — not read off the older docs.

## Status

| | result |
|---|---|
| `./gradlew build` (main) | **compiles clean**, core + lwjgl3, real libGDX |
| `./gradlew core:test` | **65 tests ran — 7 failed** (first execution ever) |
| `./gradlew lwjgl3:run` | **launches and plays**; window, terrain, towers, live sim |
| geometry | 40×22 @ 32 px = 1280×704 at `SCALE = 1.0` — correct, whole field on screen |

`redesign/COMPLETION.md` §0b is now out of date: the render half *has* been compiled and run.

One fix was already applied to get the suite to compile:
`RedesignInfrastructureTest.java:72` called a `TileResolver` API that no longer exists
(`new TileResolver().resolveBitmask(...)`) — replaced with the real static
`TileResolver.mask(map, x, y, TileResolver.Layer.PATH)`.

---

# Codex prompts

Each block is self-contained. Paste one at a time.

---

## 1. Aura buffs are wiped by hero update order  ← highest value

```
In this libGDX tower-defence project, aura behaviours are silently broken by update ordering.

`core/src/main/java/io/github/some_example_name/game/Hero.java:248` starts every frame with:

    public void update(float dt, World world) {
        this.world = world;
        speedMultiplier = 1f;
        damageTakenMultiplier = 1f;
        taunting = false;
        cloaked = false;

`core/src/main/java/io/github/some_example_name/game/World.java:96` then runs one single loop:

    for (Hero hero : new ArrayList<>(heroes)) {
        hero.update(dt, this);
        ...
    }

Aura behaviours such as SupportAura, HealAura, FearlessAura, AllyShield and Taunt write into
*other* heroes' fields from inside their own `onUpdate`. Because each hero resets those fields at
the top of its own update, any hero positioned LATER in the `heroes` list than the aura source has
its buff overwritten to the default in the same frame. Heroes earlier in the list keep the buff,
but only from the previous frame. The result is that auras apply to an arbitrary subset of units
depending on spawn order.

This is the cause of the failing test
`core/src/test/java/io/github/some_example_name/game/UnitBehaviorTest.java:64`
("aura should buff a neighbour") and very likely of the run-to-run kill-count variance of about
±3 noted in redesign/COMPLETION.md §0b.

Fix it by splitting the hero tick into two passes inside `World.update`:
  pass 1 — reset every hero's per-frame aura accumulators (speedMultiplier, damageTakenMultiplier,
           taunting, cloaked) for all heroes;
  pass 2 — run each hero's update/behaviours, which then only ever accumulate.
Move the reset out of `Hero.update` into a dedicated method (e.g. `Hero.beginFrame()`) so the
invariant is explicit, and update the Javadoc on both Hero.update and SupportAura, which currently
document the old single-pass contract.

Keep the behaviour of the reset identical for a hero with no aura on it. Do not change any
behaviour class's logic. Then run:

    ./gradlew core:test --tests "*UnitBehaviorTest*"

and confirm supportAuraSpeedsAlliesAndExpiresWithItsSource passes, including its second assertion
that the buff vanishes on the frame after the sergeant dies.
```

---

## 2. Death and damage hooks are skipped for any hero not yet ticked

```
In this libGDX tower-defence project, `Hero` dispatches its behaviour hooks using a `world` field:

    core/src/main/java/io/github/some_example_name/game/Hero.java:232
        for (UnitBehavior behavior : behaviors) {
            behavior.onDeath(this, world);
        }

That `world` field (declared at Hero.java:87) is assigned only inside `Hero.update(dt, world)`.
`World.spawnHero(...)` (core/src/main/java/io/github/some_example_name/game/World.java) never sets
it. So a hero that dies before its first update tick carries `world == null`, and every behaviour
that guards with `if (w == null) return;` — DeathExplosion, DeathLeech, SummonSupport,
ThresholdSummon, Resurrect and others — silently does nothing.

This is exactly the bug the test at
`core/src/test/java/io/github/some_example_name/game/UnitBehaviorTest.java:51`
was written to catch, and it currently fails: a REBEL_SAPPER killed immediately after spawn does
not disable a tower 0 px away, despite DeathExplosion having a 96 px radius.

Fix: assign the owning world to the hero at construction/spawn time so the hooks can never receive
null. Set it in `World.spawnHero` (and anywhere else a Hero is added to `World.heroes`). Consider
making the field final or otherwise non-reassignable if that does not fight the existing code.

Verify with:

    ./gradlew core:test --tests "*UnitBehaviorTest*"

damageHooksReceiveTheWorldNotNull must pass. Do not weaken the test.
```

---

## 3. Three stale tests written against removed APIs / old geometry

```
This libGDX project changed its grid from 32x30 to 40x22 cells and replaced a char-grid map
importer with authored `.map` blueprint files. Three tests were never updated and now fail. All
three are test-side problems — fix the tests, not the engine.

(a) core/src/test/java/io/github/some_example_name/game/MapBlueprintTest.java:20
    Throws ArrayIndexOutOfBoundsException: Index 28 out of bounds for length 22.
    The test writes `a.overlay[30][28] = MapBlueprint.Overlay.CAVE;` with hardcoded coordinates
    from the old 32x30 grid. Rewrite every hardcoded cell coordinate in this file in terms of
    `MapBlueprint.COLS` and `MapBlueprint.ROWS` (which resolve to GameMap.WIDTH=40, HEIGHT=22) so
    the test survives any future geometry change. Keep it a genuine round-trip test that still
    covers all three layers (terrain, terrainRot, overlay, decor) including a non-zero rotation and
    a cell whose terrain is unchanged from base.

(b+c) core/src/test/java/io/github/some_example_name/game/MapImporterTest.java (both tests)
    This file reads sprites named `map_w*` out of assets/generated/sprites.json and feeds them to
    `MapImporter.from(char[][], int)`. Two things are now true:
      - `MapImporter` is dead code: grep shows it is referenced nowhere in
        core/src/main/java except by itself. The game loads levels through
        `LevelMaps.fileName(world, level)` and the 25 authored `assets/maps/w<W>_l<L>.map`
        blueprints (see CursedHoardGame.java:935 and :1187).
      - the `map_w*` sprites are no longer role grids. They are the redesigned 64x60 *level card*
        miniatures, so importing them as terrain cannot work by construction.

    Decide and implement ONE of these, and say which you chose and why:
      option A — delete MapImporterTest.java and MapImporter.java as dead code;
      option B — retarget the test at the live pipeline: parse all 25 assets/maps/*.map files via
                 MapBlueprint.parse / LevelMaps and assert what the old test asserted — a connected
                 spawn->cave path, a gem cave present, path length >= 4, and that exactly 25 maps
                 are covered.
    Option B is preferred if the `.map` files can be read headlessly without GL, because it keeps
    the guarantee the test existed for (a map silently falling back to a procedural placeholder).

Verify: ./gradlew core:test  — MapBlueprintTest and MapImporterTest green.
```

---

## 4. w2_l1 fails the authored-map water gate

```
In this libGDX tower-defence project, `./gradlew core:test` fails
`core/src/test/java/io/github/some_example_name/game/AuthoredMapsTest.java:117`:

    w2_l1 too little water: 3 ==> expected: <true> but was: <false>

The gate requires every authored campaign map to carry at least 5 water tiles
(`assertTrue(water >= 5, id + " too little water: " + water)`). The Holy Mountains level 1 map has
only 3. World 2's water is meant to read as a frozen river (see the class docs on
`core/src/main/java/io/github/some_example_name/game/LevelMaps.java`).

The maps are generated by `scripts/gen-maps.mjs` and shipped as `assets/maps/w<W>_l<L>.map`.
Find where w2_l1's water is placed, extend it into a real frozen-river feature of at least 5 tiles
(ideally more — 3 tiles is not a readable feature at 32 px either way), and regenerate the map
file. Water blocks building, so keep it clear of the lane and of the tower ground at the inner
elbows of turns; do not reduce the level's buildable area enough to change its difficulty
materially.

Verify: ./gradlew core:test --tests "*AuthoredMapsTest*" passes, and the other 24 maps still pass
every other assertion in that file (obstacle counts, no obstacle on lane, no building stamped on
the lane, decor/terrain sprite keys all present in the atlas).
```

---

## 5. Untargetable test aliases with the phase cycle

```
`core/src/test/java/io/github/some_example_name/game/UnitBehaviorTest.java:92`
(untargetablePhasesOutAndBackIn) fails, and the engine is correct — the test is.

SHADOW_WRAITH is `new Untargetable(3f, 4f)` (HeroType.java:87): hidden for 3 s out of every 4 s.
The test does one `update(0.05f)` then exactly 40 x `update(0.1f)` = 4.00 s more. The phase
accumulator therefore returns to 0.05 s — precisely back inside the hidden window — so
`isTargetable()` is legitimately false.

Rewrite the test so it does not depend on landing on an exact cycle boundary. Assert the real
contract instead: over one full cycle the unit is untargetable for `hiddenDuration` and targetable
for `cycle - hiddenDuration`. E.g. step in small increments across a couple of cycles, record the
targetable/untargetable durations, and assert both are within a tolerance of 3 s and 1 s. Read
`hiddenDuration` and `cycle` from the behaviour instance rather than hardcoding them.

Also check MIRAGE_DANCER (HeroType.java:151, `new Untargetable(2f, 3f)`) with the same test body so
the assertion is not tuned to one unit.

Verify: ./gradlew core:test --tests "*UnitBehaviorTest*"
```

---

## 6. M-1 … M-6: six places where the code contradicts locked design decisions

All six were re-verified against current code today; every one is still open.

```
This libGDX tower-defence project has six known contradictions between its locked design decisions
and its implementation, tracked as M-1..M-6 in redesign/REVIEW.md section 7.1. I have re-verified
all six against the current tree. Fix them, each as a separate commit.

M-1 — star rating uses the wrong metric.
  core/src/main/java/io/github/some_example_name/CursedHoardGame.java:1689
      int stars = won ? Math.max(1, Math.round(3f * kept / total)) : 0;
  Decision D-31(d) specifies: 3 stars = no enemy ever touched a gem; 2 stars = all 5 gems retained;
  1 star = at least one retained. The "never touched" condition is not tracked anywhere. Add the
  flag (a boolean on the level/World that latches the first time any gem is picked up) and
  implement the three-way rule.

M-2 — skill point award is a flat +3.
  CursedHoardGame.java:447  `skillPoints += 3;`  and the UI string at :1696 "+3 skill points".
  Decision D-14 specifies roughly +1 per map plus +1 per star. Implement that and make the overlay
  string report the actual amount awarded rather than a literal.

M-3 — HUD shows six enchant slots.
  CursedHoardGame.java:654  `for (int i = 0; i < EnchantType.values().length; i++)`
  Decision D-13 specifies the player equips exactly 2 enchants. Introduce an explicit loadout of 2
  equipped enchants and draw only those slots; the remaining EnchantTypes stay available to be
  equipped, not cast directly from the HUD.

M-4 — gem count is coupled to an enum's length.
  core/src/main/java/io/github/some_example_name/game/World.java:31
      for (GemType type : GemType.values()) gems.add(new Gem(type, ...));
  Decision D-31(c) specifies every map has exactly 5 gems. Replace with an explicit
  `public static final int GEM_COUNT = 5;` and seed from that, so adding a GemType cannot silently
  change the win condition. Add a test asserting a fresh World has exactly 5 gems.

M-5 — `WavePlan.waveCount` ignores its worldIndex parameter.
  core/src/main/java/io/github/some_example_name/game/WavePlan.java:20
      return 5 + clamp(levelIndex, 0, 4);
  World 5 level 1 gets the same wave count as World 1 level 1. Either make wave count scale with
  world as well, or remove the dead parameter — pick one and be consistent with M-6.

M-6 — no explicit per-wave difficulty scalar.
  Decision D-30(c) calls for "roster mix + an optional per-wave scalar". `WavePlan.wave()` already
  ramps count and spawn interval implicitly with world/level/wave (WavePlan.java:38-58), but there
  is no single scalar a designer can turn. Extract that into an explicit, documented
  `difficultyScalar(world, level, wave)` used by the count and interval maths, so balance can be
  tuned in one place. Do not change the resulting numbers in this commit — this is a pure
  refactor; assert that with a test that pins the current output of `wave()` for a sample of
  (world, level, wave) triples BEFORE the refactor and still passes after.

Run ./gradlew core:test after each commit.
```

---

## 7. W-1: all 25 levels play the same

This is the biggest *gameplay* gap and the one worth doing before any art or audio.

```
In this libGDX tower-defence project, all 25 campaign levels have hand-authored *layouts* but
procedurally derived *encounters*. `core/src/main/java/io/github/some_example_name/game/WavePlan.java`
builds every wave of every level from one formula over the world's troop roster (see `wave()` at
line 25). The 25 levels therefore differ only in map shape and roster slice, not in encounter
design. This is item W-1 in redesign/REVIEW.md section 7.2, and amendment A-5 in section 9 proposes
the fix: authored wave tables, one data file per level, beside each map.

Implement that:
  - design a small readable text format for a level's wave table (wave index, then a list of
    {HeroType, count, spawn interval}, plus any per-wave scalar), mirroring the style already used
    by the `.map` blueprint format in `assets/maps/*.map` so the project has one authoring idiom;
  - ship it as `assets/waves/w<W>_l<L>.waves` for all 25 levels;
  - write the loader beside `LevelMaps`, keeping it pure Java (no GL) so it is unit-testable, and
    have `WavePlan` read the table when one exists;
  - keep the existing procedural generator as the fallback for any level with no table, so nothing
    breaks mid-migration;
  - seed the 25 files by dumping what the current formula produces, so the campaign is unchanged on
    the first commit and every subsequent edit is a deliberate design change;
  - add a test that all 25 tables parse, reference only HeroTypes that belong to that world's
    roster slice, and have a non-zero wave count matching `WavePlan.waveCount`.

Verify: ./gradlew core:test, then ./gradlew lwjgl3:run and play World 1 Level 1 to confirm the
waves are identical to before the change.
```

---

## 8. Balance: two levels lose the whole hoard

```
In this libGDX tower-defence project, a headless playtest harness at `tools/headless/run.sh` plays
all 25 levels. Two of them — w3_l1 and w4_l1 — reliably lose all 5 gems: early waves die correctly
and their gems return to the cave, then late waves stop dying and escape with the hoard. This is
documented in redesign/COMPLETION.md section 0b and is believed to be a balance problem in
WavePlan / TowerType / HeroType rather than a state-machine bug.

Note the harness predates a JDK being available; there is now a real one, so prefer driving this
through the real build:

    ./gradlew core:test --tests "*GameplaySimulationTest*"

Investigate why the late waves of w3_l1 and w4_l1 survive: compare the HP/resistance ramp of the
world 3 and world 4 rosters against the DPS a reasonable tower build can produce with the starting
gold from `WavePlan.startingGold(world, level)` (WavePlan.java:81, `620 - world*30 - level*20`) plus
bounties. Report the numbers before changing anything.

Then fix it in whichever of these is actually wrong — starting gold, the wave count/interval ramp,
troop HP, or tower damage — and state which lever you moved and why. Levels 1 of a world should be
comfortably winnable; they are the introduction to a new roster.
```

---

## 9. Audio — the largest missing system

```
This libGDX tower-defence project has zero audio: no Sound or Music usage anywhere in
core/src/main/java, no audio assets, and the settings screen literally renders the string
"Theme: dark (locked) - no audio" (CursedHoardGame.java:2023). Decision D-32 deferred audio
deliberately, but it is now the single biggest gap between this and a finished game.

Build a minimal audio layer:
  - an `AudioManager` in `core/src/main/java/io/github/some_example_name/assets/` alongside the
    other asset services, owning loading, volume and disposal, with a hard mute switch;
  - wire it to the events that already exist in the code: tower fire, projectile impact, hero
    death, gem picked up, gem returned, tower built, tower upgraded, wave start, level won, level
    lost, and UI click;
  - one ambient music track per world, cross-faded on world change;
  - master / music / SFX volume persisted through the existing `Preferences`-backed `SaveState`
    (the project already versions its save data — extend it, do not add a second store);
  - respect the existing settings screen: replace the "no audio" label with real volume controls.

Do not add any audio files in this task — reference the keys, ship the plumbing, and list exactly
which sound files are needed and at what format/sample rate so they can be sourced separately.
Guard every playback call so a missing file degrades to silence rather than an exception.

Verify: ./gradlew build passes and ./gradlew lwjgl3:run still launches with no audio assets present.
```

---

## 10. Smaller / lower priority

```
Three smaller gaps in this libGDX tower-defence project, in priority order. Do them as separate
commits.

(a) Tutorial / onboarding — zero files exist. Nothing in the game teaches gem carrying, felling
    trees to open tower ground, the 2x2 tower footprint, typed resistance, or enchant casting.
    None of these are inferable from watching the screen. Add a first-run guided sequence over
    World 1 Level 1: a small number of gated prompts, each triggered by game state rather than by a
    timer, dismissible, and persisted as "seen" in SaveState so it never repeats.

(b) Achievements — the dev-mode settings screen references "max achievements" but no system exists.
    Either implement a small achievement store (definition list, unlock predicates evaluated on the
    same game events the audio layer hooks, persistence in SaveState, a view in the almanac) or
    remove the dangling dev-mode reference. Say which you chose.

(c) Localisation — every user-facing string is inline English. Extract them to a single string
    table with keys and route all UI text through a lookup. Ship English only. This is cheap now
    and expensive later; it does not need a second language to be worth doing.
```

---

## Not a task: what is already good

Confirmed by inspection, so nobody re-opens these:

- **Geometry is correct.** `SCALE = 1.0`, `MAP_X = 0`, `MAP_Y = 8`, world 1280×704 in a 1280×720
  window. The full field is on screen at 1:1; no camera scroll needed.
- **All 701 sprites are current** — `lwjgl3:exportSpriteJson` regenerates
  `assets/generated/sprites.json` cleanly as part of the build.
- **Save/progress persistence, skill tree, enchant system and almanac** are implemented and wired.
- **58 of 65 tests pass**, including the harder structural ones: per-hero behaviour state,
  taunt outranking the targeting policy, slow-immunity covering freeze, projectile uniqueness,
  turret aiming, sprite-key resolution and the tile auto-edge resolver.
