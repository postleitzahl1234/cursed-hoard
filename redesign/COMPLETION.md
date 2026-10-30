# What is missing for a complete game

Audited against the repo, not from memory. Every count below came from a script or a grep, and
where I could not verify something I have said so rather than guessed.

---

## 0. It compiles, it runs, and it is broadly playable

**This section replaces the old headline, which said nothing had ever been compiled.** It has now.

### The compiler was here all along

`javac` is absent from this sandbox and the Maven mirror is proxy-blocked, which is why the whole
redesign ran without a build. But the JRE ships the **`jdk.compiler` module**, and it is directly
invokable:

```
java -m jdk.compiler/com.sun.tools.javac.Main ...
```

And the entire `game/` package depends on exactly **two** libGDX classes — `Vector2` and `Color`.
Both are stubbed in `tools/headless/stub/`. So the core simulation compiles and runs with no
gradle and no jars. `tools/headless/run.sh` does it.

**The core game logic compiles clean: 103 classes, zero errors.** It always would have.

### It runs, and the loop turns

`tools/headless/run.sh` builds a real level, places towers beside the lane, drives wave
sequencing the way `CursedHoardGame.update` does, and plays all 25 levels for four simulated
minutes each. Current state:

```
25 levels ran, 0 failed, 0 crashes
routes 55–112 waypoints · 12 towers placed per level
44–106 heroes killed per level (44–79% of everything that spawned)
gems lost: 0 on 10 levels · 1–4 on 13 · all 5 on 2
gold earned +676 to +2950
```

Waves spawn, heroes path in, towers acquire and fire, damage and resistances apply, carriers
steal gems, bounties pay out, and levels are winnable *and* losable. **That is a playable game
loop.** What it is not is a *tuned* one, and it has never been seen on a screen — the render layer
(`CursedHoardGame`, `PixelArtAtlas`, `UiChrome`) still cannot be compiled here because it needs
real libGDX. Run `./gradlew test` on a machine with a JDK before trusting the UI half.

### What three parallel agents found — and what they corrected me on

I dispatched three agents at what I believed were three defects. Two of them told me I was wrong,
which is the outcome worth recording:

1. **Routing (real, but not what I said).** `BlueprintLevel` ran a correct cell-by-cell BFS and
   then passed it through a `simplifyCollinear()` helper that deleted every interior point on a
   straight run — collapsing a 100-point route to its 8–19 corners. I hypothesised heroes were
   teleporting. They were not: `Hero.walkAlongPath` interpolates per frame and moves identically
   either way. The lossy data was real and is fixed; the mechanism I proposed was wrong.

2. **Combat (not a defect at all).** The agent instrumented every tower family, found all four
   acquiring targets, firing on cadence and landing 15–19 damage per shot with resistances behaving
   exactly as specified — then **reverted all of its own changes and reported no bug.** The
   "9 levels kill nothing" symptom was **my harness**: it placed towers by walking `groundPath` by
   index, so a route collapsed to 8 corners could only ever site 1–3 towers. That is the fourth
   time on this project a verification tool has been the thing that was wrong.

3. **Gems (real, and honestly scoped).** D-09 specifies that a gem dropped by a dying carrier
   returns to the cave. **Nothing in the codebase implemented the return trip** — `Gem.update()`
   only ticked a timer, so every gem ever picked up was eventually lost. Fixed, self-contained in
   `Gem.java` (a 48 px/s drift home with a 4 s re-grab grace window). The agent then A/B tested its
   own fix against the same tree and reported that it was *not* the dominant cause of the 23/25
   full losses — most of that was the routing/tower-siting artifact. Credit for volunteering that.

Net: **one real game defect (the gem return trip), one real data defect (route simplification),
and zero combat defects.** Two of the three problems I briefed did not exist as described.

---

## 0a. The whole project now type-checks — including the render half

`tools/headless/compile-all.sh` extends the same trick to the front end. The 21 libGDX types used
outside the `game` package are stubbed in `tools/headless/stub/` (27 files, signatures derived by
grepping real call sites rather than guessed), so **the entire project compiles**:

```
core (game + assets + front end): compiled clean (149 classes)
lwjgl3 launcher:                  compiled clean (150 classes total)
tools/headless/run.sh:            25/25 levels, 0 failed
```

That covers `CursedHoardGame` (~2 000 lines), `MapBuilderScreen`, the whole `assets/` package —
`PixelArtAtlas`, `UiChrome`, `SpriteKeys`, `PixelFont`, `GameFx`, `WorldMap` — and the launcher.
None of it had ever been compiled before.

### One real defect, and it was mine

`CursedHoardGame.java` called `TileResolver.Layer`, `TileResolver.pieces(...)` and
`TileResolver.edgeKey(...)` in the D-19 auto-edge render pass **without importing `TileResolver`**.
I wrote that pass and never imported the class. `package TileResolver does not exist` — a hard
compile failure that would have stopped the game building on the first honest attempt, and exactly
the class of error that only a compiler finds. One-line fix.

Everything else that failed along the way was a gap in the stubs, not in the project. So the
render layer was otherwise correct as written.

### What this still does not prove

Stubs type-check; they do not execute. Nothing here opens a window, uploads a texture or draws a
triangle, so **runtime GL behaviour, input handling and actual visual output remain unverified.**
`./gradlew test` against real libGDX on a machine with a JDK is still the right next step — but it
is now expected to *build*, rather than being a coin toss.

---

## 0b. Still unverified

The **render and input half has never been compiled** — `CursedHoardGame`, `PixelArtAtlas`,
`UiChrome`, `MapBuilderScreen`, the screen state machine and every draw-size change. That needs
real libGDX and a real JDK. The 15 JUnit test classes also still have not run, because there are
no JUnit jars here; `tools/headless/run.sh` is a substitute for the simulation half only.

Two levels still lose the whole hoard (`w3_l1`, `w4_l1`). Traced: early waves die correctly and
their gems return, then late waves stop dying and reliably escape. That is a **balance** problem
in `WavePlan`/`TowerType`/`HeroType`, not a state-machine one.

There is also mild run-to-run nondeterminism in kill counts (±3), which suggests iteration-order
dependence somewhere in the sim. Not chased down.

---

## 0c. The original headline, for the record

## 0. The honest headline

**Nothing in this repo has been compiled.** There is no JDK in the environment I am working in —
`javac` is absent and the package mirror refuses installs — so `./gradlew test` has never run once
across the entire redesign. That covers the aiming seam, all 31 unit behaviours, `Hero.animState`,
the new `TileResolver`, the 40×22 geometry and every draw-size change.

Everything was verified as far as static analysis allows (brace balance, symbol resolution,
constructor arity against real call sites) and the map generator additionally by a byte-exact
port. That is genuinely not the same as compiling. **This is the single largest risk in the
project and it should be the next thing anyone does.**

15 test classes exist and none has ever been executed:

```
AuthoredMapsTest      GameSystemsTest        MapImporterTest    TowerUpgradeTest
GameplaySimulationTest HostileBuildingsTest  ProjectileUniquenessTest  TurretAimingTest
MapBlueprintTest      RedesignInfrastructureTest  SpriteKeyResolutionTest  UnitBehaviorTest
TerrainGeneratorTest  WavePlanTest           WorldMapPixelTest
```

They read the grid through `MapBlueprint.COLS/ROWS` rather than literals, so they *should* survive
the 32×30 → 40×22 change. "Should" is doing work in that sentence.

---

## 1. Art — **701 of 701 sprites redesigned. Nothing is left on the old generation.**

Every one of the 24 sprite modules has been re-authored at 1× density against the size the engine
actually draws it at, under one global NW key light, one palette and one ink treatment.

| family | count | native size |
|---|---|---|
| towers · projectiles · drone actors | 48 · 48 · 12 | 64×96 / varies |
| troops | 53 | 32 / 44 / 56 |
| tiles + auto-edge kits | 168 | 32×32 |
| obstacles | 10 | 40×52 |
| buildings (85 frames) | 17 | 96 / 80 / 72 |
| icons | 32 | 24×24 |
| UI chrome | 24 | 24×24 nine-slice |
| gems | 15 | 32×32 |
| ability FX | 24 | 40×40 |
| status FX | 7 | 40×40 |
| enchants | 6 | 40×40 |
| particles | 8 | 32×32 |
| overworld nodes | 30 | 40×40 |
| level cards | 25 | 64×60 |
| backgrounds + splash | 12 | 128×72 |

**701 sprites · 1 800 frames · 6.74 M pixels · palette clean.**
Evidence: `pilot-evidence/final_set.png`, `hud_set.png`, `playfield_w*.png`.

### The three that are worth calling out

**The level cards are generated from the levels.** `maps.js` imports the real `WAYPOINTS` table
from `scripts/gen-maps.mjs` — the same single source the 25 `.map` files come from — and draws
each card as a true miniature of that level's lane, with its spawn, its cave and its difficulty
pips. The card is a *map*, not a picture of a place, and if anyone re-cuts a lane the card re-cuts
with it. There is nothing to keep in sync, so it cannot go stale.

**The 45 effect clips are grouped by what they do to space**, not by colour: outward, inward,
around, upward, obscuring, or left on the ground. Direction survives being 40 px on a busy field;
hue does not. `lib/fxlib.js` also documents the two project rules that FX deliberately suspend —
no ink contour and no NW key — because light is not an object and does not cast a shadow.

**Backgrounds are the one family authored below their draw size**, at 128×72 for a 1280×720
screen, and `backgrounds.js` says why: a backdrop must not be looked at, so it is composed as a
value field and a horizon rather than as a picture. The rule that replaces 1:1 there is *nothing
brighter than the UI chrome, and no hard edge above the horizon.*

### ⚠ Two bugs the evidence renders caught, again

The first chrome pass filled panels at IK2 — **inside the range W5's void ground occupies**. It
looked correct on grass and would have vanished entirely in the Shadow Realm.

Every level card's spawn marker was drawn at x = −1 and clipped off, on all 25. Lanes all start at
column 1 and run off the left border, so the marker sat outside the card. Invisible in code,
obvious the instant the 25 were rendered as a set.

That is now five separate defects found only by rendering the art rather than reasoning about it.

---

## 2. Systems that do not exist at all

Verified by grep across `core/src/main/java`:

| | state | note |
|---|---|---|
| **Audio** | **0 files** | The settings screen literally reads "no audio". D-32 decided this deliberately, but no shipped tower defence has ever gone without it — tower fire, hits, unit death and a per-world track are the difference between a prototype and a game. This is the biggest *product* gap. |
| **Tutorial / onboarding** | **0 files** | Nothing teaches gem carrying, tree felling, the 2×2 footprint, typed resistance or enchant casting. The rules here are not obvious enough to infer. |
| **Achievements** | **0 files** | Referenced in the dev-mode settings ("max achievements") but no system behind it. |
| **Localisation** | **0 files** | Every string is inline English. Fine to defer, but it gets much more expensive later. |

Present and working: **save/progress persistence** (`Preferences`, versioned — progression, skill
points, skill spend, map style, dev mode, speed toggle), a skill tree, an enchant system and an
almanac.

---

## 3. Design contradictions still open

Carried from `REVIEW.md` and never resolved. These are decisions only you can make:

- **M-1 … M-6** — six places where the spec and the code disagree about a mechanic.
- **W-1** — the wave-authoring gap: `WavePlan` generates waves procedurally, so the 25 levels have
  hand-authored *layouts* but not hand-authored *encounters*. For a campaign that is a real hole;
  difficulty currently comes from a formula rather than from design.
- **D-27, the Demon pyre wing** — the spec briefs all four towers as "shortest and broadest",
  which no art can resolve. It needs a sanctioned non-width lever.

---

## 4. Balance — entirely unvalidated

Nothing has been playtested, because nothing has been run. 48 towers × 5 upgrade tiers × 53 troop
types × typed resistance is a large interaction surface, and none of its numbers have been
observed in motion. `GameplaySimulationTest` exists to drive this headlessly and would be a cheap
first look once the build works.

---

## 5. Suggested order

1. **Run `./gradlew test`.** Everything below is speculation until this passes.
2. Fix whatever it finds, then play a level end to end and check the 40×22 geometry by eye rather
   than by render script.
3. ~~Icons + UI chrome~~ — **done**; see §1.
4. **Audio**, even a minimal set. It changes the perceived completeness more than any art left.
5. ~~All remaining art~~ — **done**. Every sprite family is current.
6. Resolve M-1…M-6 and W-1; author real wave encounters.
7. ~~Backgrounds, overworld nodes, level cards~~ — **done**.
8. Tutorial, then balance passes.

---

## 6. Where the project actually stands

The engine-facing work is in good shape: the geometry is correct and 1:1, the 25 levels regenerate
from a validated source, auto-tiling is real, unit behaviours are implemented rather than stubbed,
and the two largest art families are finished to a standard the rest can be held to.

The art is finished: all 701 sprites, every family, one density and one light.

What is left is **four absent systems** — audio (the big one, and a decision worth revisiting),
tutorial, achievements, localisation — **six spec contradictions and the wave-authoring gap**,
an unvalidated balance surface, and **a compile that has never happened.** That last one is still
the top of the list.
