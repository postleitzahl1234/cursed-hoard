# Towers that face what they're shooting

How every tower in the game aims at its target — the design, the art rig, and the engine seam.
Evidence: `redesign/pilot-evidence/aiming_8_facings.png` (two towers, all 8 directions, at rest
and firing).

---

## 1. What was broken

`Turret` exposed a single `int facing`, and the renderer fed it straight into
`PixelArtAtlas.drawFrame` **as a frame index**:

```java
atlas.drawFrame(batch, keys.tower(type), tower.turret.facing, ...);   // old
```

The sprite's frame array *was* the facing table. Three consequences:

1. **Facing and attack animation were mutually exclusive** — a tower could turn or animate,
   never both. That silently broke D-06 ("every tower tier ships its own attack animation").
2. **No mirroring**, so D-23's "author 5 facings, mirror the other 3" could not pay off. All
   eight had to be drawn, and in practice none were.
3. **Crypt and Demon never aimed at all** — `turret` was null unless `type.hasTurret`.

---

## 2. The design

**Facing is a direction, not a frame.** Art is authored under `<tower>_aim_<facing>` for five
facings — E, NE, N, SE, S — each carrying its own animation frames. W, NW and SW are those
sprites drawn mirrored. Eight directions, five sprite sets, and the frames are free again.

**What turns is a faction decision, not an engine one.** The engine asks for `_aim_<facing>`
and draws whatever the art supplies. D-23 only ever ruled on *what* should turn — a rotating
barrel would be wrong on a gothic spire — it never said the other factions shouldn't face their
target. So all four factions aim; they just aim with different parts:

| Faction | Aim part | Rig |
|---|---|---|
| **Orc** (12) · **Goblin** gun/ordnance (6) | the whole turret swings | `barrelRig` |
| **Crypt** (12) | the spire stays put; a **rune-lantern** swings out on the aimed side and the banked charges **collapse downrange** before release | `lanternRig` |
| **Demon** (10) | the shrine **idol's head turns**, its eyes track, and the brazier **plume leans** downrange | `idolRig` |
| **Goblin** drone/bomber (6) | no turret (D-26) — the **bay doors** face the lane and the launch flare exits that side | `hatchRig` |
| Demon aura tiers (2) | no target, so no aim art — the renderer finds nothing and draws the tower plain | — |

---

## 3. The art rig — how 240 facings became 48 specs

Hand-drawing 5 facings × 2 frames × 48 towers is 480 sprites. That is why the old build never
did it. Instead each tower authors its weapon **once, as a spec**, and `lib/aim.js` projects it
into the five facings:

```js
const TURRET = {
  mantlet: { rx: 10, ry: 8, ramp: IRON, studs: 6 },
  barrel:  { len: 30, girth: 10, rings: [10, 18, 25] },
  muzzle:  { flare: 3, len: 3 },
  recoil: 5,
  flash:  { r: 6, chars: ['e', 'E', 'x'] },
  extra:  (g, px, py, dir, frame) => { /* per-tower flourish */ },
};
export const SPRITES = { ...aimSet(key, barrelRig, TURRET) };
```

**Why this is not the shared-rig failure again.** A barrel pointing NE genuinely *is* the same
barrel from another angle, so generating that projection is honest. What would not be honest is
generating the *building* — and nothing in `lib/aim.js` draws a structure. The spec is bespoke
per tower, so the 48 aim parts stay as distinct as the 48 towers: the T1 Watchpost's 16 px tube
in a wooden cradle and the T6 Doomsday Cannon's 30 px triple-ringed gun in a studded mantlet
share code, not appearance.

Three details that took iteration:

- **The light does not rotate with the art.** `tube()` shades from a fixed NW key light no
  matter which way the barrel points. Rotating the shading is what makes cheap 8-way art look
  like a spinning sprite.
- **N and S must clear the mantlet.** First pass foreshortened them so hard the barrel vanished
  inside its own mount and read as broken. Now N shows the barrel's top and far end; S shows a
  dark **bore** — the readable cue for "this one is pointing at you".
- **Draw order flips with facing.** Barrel behind the mantlet when it points away (N/NE), in
  front when it points toward the viewer (S/SE).

---

## 4. The engine seam

| File | Change |
|---|---|
| `game/Turret.java` | rewritten — `art()` returns the authored facing, `flip()` the mirror flag, `frame()` the animation index. Adds **hysteresis**. |
| `game/Tower.java` | every tower gets an aim part, not just `hasTurret` ones; `turret.onFire()` on each shot |
| `assets/PixelArtAtlas.java` | `drawFrame(..., boolean flipX, ...)` with a **cached** mirrored region set |
| `assets/SpriteKeys.java` | `towerAim(type, facing)` — returns `null` for un-rebuilt tiers so the legacy path still works |
| `CursedHoardGame.java` | `drawTowers` uses facing keys, falls back to the old frame-index path |
| `game/AssetCatalog.java`, `AssetSpec.java` | register 5 aim facings per tower; turret spec is 2 frames, not 4 |
| `core/src/test/.../TurretAimingTest.java` | **new** — 6 tests over the mapping, mirroring, hysteresis and independence |

**Hysteresis** deserves a note. Snapping at the exact 22.5° sector boundary makes a turret
flicker between two sprites every frame when an enemy walks along that line — far worse than a
facing that lags. It now commits at 30° and releases at 10°, a 20° dead zone.

⚠ **The Java changes are not compiled.** This sandbox has a JRE but no JDK and cannot install
one, so `gradlew test` has not been run. The facing↔mirror mapping was instead verified
independently against real geometry (all 8 directions correct), and `TurretAimingTest` will
exercise the rest on your machine. **Please run `./gradlew test` before trusting the Java side.**

---

## 5. Progress — all 48 towers authored

| | |
|---|---|
| Faction vocabularies | **4/4** — `_orc_`, `_crypt_`, `_demon_`, `_goblin_` |
| Manifest | **48/48** rows — massing + armament + aim rig + D-27 levers, machine-readable |
| **Authored towers** | **48/48** — every tier of every faction |
| Aim sets | **46** towers × 5 authored facings; **2** aura towers ship none by design |
| Sprites emitted | **286** across 51 modules · 530 frames · 3 142 035 pixels · palette **CLEAN** |

Evidence: `all_48_towers.png`, plus `<faction>_all_12_towers.png` for each tree.

Per faction, what carries the tier separation:

- **Orc** — mass shape: dome, deck, stilt-nest, lean column, squat drum, A-frame, pier-and-spool,
  open frame, battered emplacement, twin drums, tracked box, three-tier platform.
- **Crypt** — crown *and* shaft: headstone, mausoleum, obelisk, caged orb, leaning ruin,
  shroud-shrine, armillary, triple orrery, conductor rod, rod thicket, skull crown, cathedral.
- **Demon** — terrace count and proportion, per D-27's "beam wing tall, pyre wing broadest":
  1 step to 6, from a 32 px caldera to an 84 px volcano.
- **Goblin** — machinery type: shack, boiler stack, hangar tower, geared drum, twin hangars,
  spike block, pipe bank, mooring mast, chimney comb, airship gantry, tracked rig, deck on stilts.

---

## 6. What the gate says, honestly

`node scripts/silhouette-gate.mjs` auto-discovers every tower and tests **all 265 pairs**.

**206 of 265 pass — 78%.**

| group | pass | worst pair |
|---|---|---|
| orc towers | 56/66 | 26% · Watchpost vs Bolt Thrower |
| crypt towers | 53/66 | 22% · Crypt II vs Fear Crypt I |
| **demon towers** | **43/66** | **13% · Hellfire Pyre vs Pyroclasm Altar** |
| goblin towers | 53/66 | 21% · Auger Cannon vs Doom Driller |

### ⚠ Correction — my first explanation of these failures was wrong

I originally wrote that the failures were *"same family, different size"* pairs, readable in
play despite the score. I then measured it instead of asserting it, and the data says the
opposite. Of the 59 failing pairs, **57 are similar in shape AND similar in size** (area ratio
mostly 1.0–1.4). Only **2** are genuine size-difference cases.

I also checked whether the metric itself was at fault, by building an alternative that scores
the **outline profile** (a per-column skyline) rather than filled-mask overlap — closer to what
a human squint test actually reads. Validation rule: any replacement metric must still condemn
the old atlas's known clones. It does (old Bolt Thrower vs Ballista = 20%, Bombard vs Siege
Mortar = 22%, Peasant vs Acolyte = 16%), and it moves the new art only from 205/264 to
225/264. **So the metric is sound and the failures are real.**

For scale under the same native alignment, the **old** atlas scores 17–24% on its known clone
pairs — and my worst new pairs sit in that same band. That is the uncomfortable, honest read.

### Why they fail, and the fix

The towers that pass comfortably all have an **outline event** — something that breaks the
profile so the black shape is unmistakable: the Crossbow Nest's stilts, the Scattergun Rig's
see-through frame, the Bomber Drone's mooring mast, the Carpet Bomber's gantry, the Infernal
Caldera's cone, the Sky Carrier's deck-on-legs.

The towers that fail are the ones where I differentiated with **interior detail and material**
instead — riveting, terraces, glyphs, banding. Those read at 3× zoom in a contact sheet and
vanish at 32 px on a dark map. Demon is worst hit (23 of 59) because a stepped pyramid is a
trapezoid whatever you carve on it.

**This is fixable, and the recipe is concrete:** every tower needs at least one silhouette
event from {overhang · gap/see-through · mast or spike above the mass · asymmetric protrusion ·
legs/stilts · a second detached mass}. Roughly 30 towers need one added. That is an editing
pass over existing files, not a redraw.

### The one thing art cannot fix

**The Demon brief fights itself, and I could not fix that from the art side.** D-27 pins
the pyre wing as *"shortest/broadest"* — that is four towers whose defining instruction is the
same silhouette. Every time I separated one pair, the collision moved to the next: Pyre vs Lake
of Fire went 13% → passing, and Pyre vs Pyroclasm Altar promptly became the new 13%. This is a
**specification** problem, not an execution one. The pyre wing needs a second escalation lever
that is not width — my suggestion is *height inversion* (as the T6 Infernal Caldera already
does, going tallest) or *ground-footprint shape* (round bowl → cracked star → sunken ring →
risen cone). That is a design decision for you, so I stopped rather than quietly widening the
threshold to hide it.

---

---

## 7. Attack animations vs projectiles — what is and is not done

These are two different assets and only one of them is finished.

| | status |
|---|---|
| **Tower attack animations** | ✅ **DONE.** Every one of the 46 aiming towers has a 2-frame fire animation on each of its 5 authored facings — recoil, muzzle flash, lens flare, bomb release, spinning auger, collapsing charges. That is **460 authored attack frames**, and it satisfies D-06's "every tower tier ships its own attack animation" for the first time (the old build could not, because facing occupied the frame array). |
| **Projectiles** | ✅ **DONE.** All 48 authored in `projectiles/{orc,crypt,demon,goblin}.js` — an **exact 1:1 match** against what `TowerType` asks for, verified by script. D-06's "no projectile reused across tiers" holds by construction. |

Two of the Demon entries are not really projectiles and are authored accordingly: the **BEAM**
tiers are drawn live by the engine as a stretched quad, so their sprite is the **impact burst**
at the far end; the **NOVA/aura** tiers use theirs as the **ground ring** the engine scales to
the tower's radius. Drawing them as flying objects would have been wrong.

Projectiles free-rotate to their flight angle (unlike towers, per §3), so all 48 are authored
pointing east and stay legible when spun.

### Drone actors — I missed these, and they mattered

Six Goblin towers (the drone and bomber lines) have **no turret at all** under D-26: they are
launch platforms, and the fighting is done by **separate flying actors** the engine spawns.
I built the platforms and their bay-door aim parts and stopped there — so for a sixth of the
Goblin tree, the thing that actually attacks was still old art.

Now authored in `actors/goblin_drones.js` — **12 sprites**, `_unit` (cruising) and
`_unit_attack` (firing / bombs away) for each of the six. D-26's two specific requirements:

- *"Drone actors are distinct per tier … escalate by design, not recolour"* — the seekers go
  2 rotors → 4 rotors + pilot → armoured with side pods → 6 rotors with a slung turret and
  aerials. Hull, rotor count and armament all change; the palette does not carry the tier.
- *"bomber drones differ from attack drones"* — the two bombers are **gasbag airships** with
  gondolas, engine nacelles and bomb racks. A different species, not a bigger seeker.

Each also carries its own contact shadow, which answers Q-14 for flyers.

**One engine change went with them:** `drawDrones` was drawing at 34 px and 50 px, which would
have resampled the authored 32 px and 48 px canvases at a fractional scale — the exact defect
§4 of REVIEW.md exists to eliminate. Now 32 and 48, so drones are pixel-exact too.

---

---

## 8. The silhouette pass — done

Applied the §6 recipe to the worst band: every tower that scored under 25% against a sibling
got **one outline event**. Not decoration — a shape that breaks the profile:

| tower | event added |
|---|---|
| Demon Hellforge | chain-hoist gantry cantilevered clear of the mass |
| Demon Magma Mortar | shell derrick — the only vertical on a low carriage |
| Demon Brimstone Battery | a short forward hoist arm (the T6's derrick is tall and rear) |
| Demon Searing Lance | flying buttresses springing off the shaft |
| Demon Abyssal Ray | twin pylons flanking the skull |
| Demon Imp Brazier | long swept horns past the single terrace |
| **Demon pyre wing** | separated by **vertical profile**: Pyre = an even comb of six horns · Pyroclasm = two far-flung masts over a low centre · Lake of Fire = one tall central arch |
| Goblin Doom Driller | counterweight jib, and the hull lowered onto its tracks |
| Goblin Auger Cannon | pipe bank raised into a stack cluster clearing the roof |
| Goblin Spike Cannon | angled feed chute climbing off the hopper |
| Goblin Drone Foundry | landing gantry projecting clear of the keep |
| Crypt Fear Crypt I | half-collapsed buttress propping the lean |
| Crypt Frost Crypt I | great icicle spurs breaking out of the obelisk |

**Result: 215 → 222 of 265, and pairs under 25% went 19 → 1.** The single survivor is Hellfire
Pyre vs Pyroclasm Altar at 23% — both are pyre-wing towers, which is the brief conflict below.

The pyre wing is where art hit its limit. D-27 pins all four as *"shortest/broadest"* — four
towers whose defining instruction is the same silhouette. I separated them on the vertical axis
because it was the only axis left, but that quietly bends the brief. **The wing needs a second
sanctioned escalation lever that is not width** — my suggestion is height inversion (the T6
Infernal Caldera already does this, going tallest) written into D-27 as an explicit exception.
That is your decision, not mine.

---

---

## 8a. Coverage audit — what is authored and what is not

Missing the drone actors was a reminder that "the towers are done" is not the same as "the
tower stack is done". So here is the whole atlas, audited by script rather than by memory.
Counts are *new art authored* against *what the old atlas holds*.

| family | authored / old | status |
|---|---|---|
| orc · crypt · demon · goblin (towers + aim sets) | 290 / 78 | ✅ done |
| proj (projectiles) | 48 / 48 | ✅ done |
| drone actors (inside the goblin count) | 12 / 12 | ✅ done |
| tile | 2 / 44 | 🟡 partial — pilot only; needs the D-19 autotile sets (A-2) |
| troop | 6 / 197 | 🟡 partial — pilot only; **53 archetypes to go** |
| fx | 0 / 31 | ⬜ not started — ability/status FX (D-04d) |
| icon | 0 / 32 | ⬜ not started — HUD, damage types, status |
| ui + chrome | 0 / 26 | ⬜ not started — carved-stone chrome (D-16b) |
| bld | 0 / 17 | ⬜ not started — buildings, spawn caves |
| gem | 0 / 15 | ⬜ not started — 5 gem types × states |
| node + map | 0 / 55 | ⬜ not started — overworld nodes, 25 map cards |
| bg + splash | 0 / 10 | ⬜ not started — menu backgrounds, title |
| obstacle | 0 / 10 | ⬜ not started — trees, rocks |
| particle | 0 / 8 | ⬜ not started |
| enchant | 0 / 6 | ⬜ not started — the 6 player abilities |

**346 of ~577 equivalent.** The tower stack is complete; roughly 40% of the atlas remains,
and the largest single block is the 53 troops.

---

## 9. Next

1. Your call on the Demon pyre wing (§8) — amend D-27, or accept the one 23% pair.
2. Optional: the 25–34% band, ~40 pairs. Lower value than the pass just done.
3. **Run `./gradlew test`** — the Java aiming changes have never been compiled (see §4).
4. **Troops (53)** — next batch.
5. Then tiles + autotile sets (A-2), enchant FX, icons, UI chrome.
