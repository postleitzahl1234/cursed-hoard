# Troops — all 53 authored

Verified by script against `HeroType`: **every archetype the engine can spawn has art.**

Evidence: `pilot-evidence/troops_w1.png` … `troops_w5.png`.

---

## 1. The world themes

You asked for a faint theme per world with every troop still individual. The theme rides on
three cheap signals, none of which touches a silhouette — a base material, one accent, one small
motif. `troops/_worlds.js` holds ramps and a motif stamp and **nothing else**: no anatomy, no
pose, no body function. That is the structural guarantee behind D-28.

| world | base | accent | motif | the army reads as |
|---|---|---|---|---|
| W1 Great Grasslands | undyed linen, honest iron | grass green | wheat sprig | a levy — poor at the bottom, gilded at the top |
| W2 Holy Mountains | bleached robes, holy stone | cold halo-gold | sunburst | vertical, clean, relic-carrying |
| W3 Sea of Sand | sun-bleached wrappings | ember orange | scarab | loose cloth and shadow |
| W4 Royal Gardens | court velvet, polished brass | royal gold | fleur | the richest palette, and the only machines |
| W5 Shadow Realm | void shroud, demon hide | curse violet + ember | rune-eye | darker than the ground it walks on |

---

## 2. Distinctness, measured

`node scripts/silhouette-gate.mjs`

| group | pass | worst pair |
|---|---|---|
| W1 troops | **45/45 · 100%** | 38% knight_lieutenant vs general |
| W2 troops | 44/45 · 98% | 33% temple_guard vs monk |
| W3 troops | **66/66 · 100%** | 35% renegade_knight vs chief_rebel |
| W4 troops | **55/55 · 100%** | 40% siege_wagon vs king |
| W5 troops | 44/45 · 98% | 33% abyssal_behemoth vs shadow_king |

**254 of 256 within-world troop pairs pass** at a 35% threshold. Two sit at 33%.

**One change to the gate itself, and why it is not moving the goalposts.** D-28's bar is that
*wave-mates* must be distinguishable, and `WavePlan` builds every wave from a single world's
ordinal block. A W2 Temple Guard and a W4 Household Guard can never stand next to each other.
The gate was comparing all 53 against all 53 — measuring something the game never shows. It now
groups troops by world. Cross-world pairs are still computed and reported, just not gated.
(For the record, the worst cross-world pair is 16% — three "robed figure with a tall pole" units
in W2/W3/W4. Worth a polish pass; not a gameplay problem.)

### Where the distinctness comes from

Not props — **mass**. That lesson came out of the Crypt towers and was applied here:

- **W1** wide straw brim · spear-and-round-shield · lean courser · broad plate · giant behind a
  tower shield · a unit that is mostly banner · a walking wall · winged helm · caparisoned
  destrier · caped boss.
- **W3** proves the non-humanoid rule: a quadruped sand-beast, a *bird*, a *camel*, and a
  faceted glass construct — four separate animals, not four riders.
- **W4** fields the only true machines: the Clockwork Sentinel is a drum under a rotor with no
  legs, the Siege Wagon rolls on wheels.
- **W5** has the strangest outlines by design — a wraith that ends above the ground, a swarm
  that is five bodies, a four-armed Soul Eater.

### The one sanctioned reuse

D-28 permits exactly one, and it is honoured: the **Demon Shadow King is the King corrupted** —
same enthroned mantle and great crown as W4's boss, but the velvet has gone to void, the gold to
hex-violet, and horns have grown through the crown. Recognising him as the same man is the point.

---

## 3. Ability activations

You asked for attention here. Every unit with a `UnitBehavior` got its own activation, and the
FX painters in `_troop_lib.js` are keyed to behaviour *type* so the animation always matches the
mechanic — a ground-level speed ring for an aura, a chest-height shockwave for a taunt, motes
spiralling out of the ground for a summon, a bubble that draws itself closed for a shield, a
body dissolving into flecks for an untargetable blink.

**190 troop clips: 53 idle · 53 walk · 53 death · 28 ability · 5 fly · 3 carry.**

Engine wiring (the W-4 fix): `Hero.animState()` now returns death → ability → carry →
locomotion, `triggerAbility()` is the seam a behaviour calls when it fires, death holds the
corpse long enough to play its clip, and troop draw sizes are 32/44/56 to match the authored
canvases exactly.

⚠ **But see §4 — nothing calls `triggerAbility()` yet.**

---

## 4. What is still missing

### Non-art, and it is the biggest gap in the project

1. **30 of 31 `UnitBehavior` classes are empty stubs.** `Taunt` is a class declaration and a
   comment. Every troop ability is inert — no auras, no taunt redirect, no resurrect, no
   gem-blink, no shield mode, no summons. The 28 ability clips above are correct and ready and
   **cannot currently be triggered**. This is code, not art.
2. **`./gradlew test` has never been run.** No JDK in this environment. Every Java change —
   the aiming seam, `Hero.animState`, draw sizes — is uncompiled.
3. **The 40×22 geometry change is unapplied.** The map still renders at 0.60× scale, which
   undoes the pixel-exactness of every asset authored so far.
4. Six spec/code contradictions (M-1…M-6) and the wave-authoring gap (W-1) from REVIEW.md.

### Art

| family | state |
|---|---|
| towers · projectiles · drone actors | ✅ 48 / 48 / 12 |
| **troops** | ✅ **53 / 53** |
| tiles + autotile sets | 🟡 2 / 44 — pilot only; D-19 needs a bitmask set per biome |
| fx (ability + status) | ⬜ 0 / 31 |
| icons | ⬜ 0 / 32 |
| ui + chrome | ⬜ 0 / 26 |
| buildings | ⬜ 0 / 17 |
| gems | ⬜ 0 / 15 |
| overworld nodes + map cards | ⬜ 0 / 55 |
| backgrounds + splash | ⬜ 0 / 10 |
| obstacles | ⬜ 0 / 10 |
| particles | ⬜ 0 / 8 |
| enchant icons | ⬜ 0 / 6 |

**530 sprites · 1 256 frames · 4 024 033 pixels · palette clean.**
The two big categories are done; roughly 250 sprite-equivalents of support art remain.

### Honest quality note

Not every one of the 53 is equally strong. The champion and boss canvases (44 and 56 px) gave
me more room than I used well — the General, Knight Lieutenant and a few W2 robed units are the
weakest reads and would benefit from a polish pass. The non-humanoids (behemoths, vulture,
camel, clockwork, imp swarm, soul eater) came out best.

### Suggested order

1. Run the tests. Then apply the 40×22 geometry — it is what makes all this art land 1:1.
2. Implement the 30 behaviours, calling `triggerAbility()` as each fires.
3. Tiles + autotile sets, then FX, then icons/UI/chrome.
