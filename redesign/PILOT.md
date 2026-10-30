# Pilot art batch — 6 assets, new direction

Six assets rebuilt from zero to lock the art direction before anything is mass-authored
(REVIEW.md §8.4 step 3). **Judge these, then I scale.** Nothing else has been touched — the
old 577-sprite atlas is untouched and the game still builds against it.

Renders: `redesign/pilot-evidence/`. Start with **`scene_game_scale_2x.png`** — everything
together at true game scale on real terrain, which is the only view that decides anything.

---

## 1. What was made

| Asset | File | Proves |
|---|---|---|
| Peasant (W1) | `Game_assets_v2/assets/data/troops/w1_peasant.js` | a humanoid can be individual |
| Hellhound (W5) | `.../troops/w5_hellhound.js` | anatomy is free — this is a quadruped, not a re-posed human |
| Orc T1 Watchpost | `.../towers/orc_t1_watchpost.js` | the floor of a tier chain |
| Orc T6 Doomsday Cannon | `.../towers/orc_t6_doomsday_cannon.js` | the ceiling — a **different building**, not a recolour |
| Grass bed | `.../tiles/w1_grass.js` → `tile_grass_base` | the ground can be quiet |
| Grass→path edge | `.../tiles/w1_grass.js` → `tile_grass_path_n` | the D-19 autotile transition, built properly |

Supporting infrastructure:

| File | Purpose |
|---|---|
| `.../lib/pixel.js` | geometry primitives — knows about pixels, nothing else |
| `.../lib/shade.js` | one global key light (NW), form shading, **rim light**, ambient occlusion, **contact shadow** |
| `.../lib/ink.js` | weighted exterior contour + interior ink lines (the actual meaning of "ink-line gothic") |
| `.../lib/draw.js` | sparse hand-authoring helper + a palette validator that fails the build |
| `.../towers/_orc_shared.js` | the Orc faction's **vocabulary** — stake, iron band, rhombus boss, den drum. Verbs only. |
| `scripts/silhouette-gate.mjs` | D-28's squint test as a **build failure** |
| `scripts/pilot-render.mjs` | the renderer that produced every image in `pilot-evidence/` |

---

## 2. Decisions applied

- **1× density (A-1).** 32 px source per 32 px cell; towers 64×96, troops 32×32. One source
  pixel per screen pixel at the new 40×22 geometry — nothing is ever resampled, and it
  upscales cleanly by integer factors on bigger displays.
- **Hand-authored, not procedurally posed.** At 32×32 a sprite is ~1000 pixels and every one
  is a decision. The first attempt at a fully procedural Peasant came out a blob — the same
  failure mode as `humankit.js`. The working pattern is: *hand-place the pose as sparse spans →
  finish procedurally (ink, rim, shadow) → derive frames by overlaying limb spans.*
- **`lib/` cannot express a body.** This is the structural fix for D-28. If a shared helper
  ever returns a creature or a building, all 53 troops become recolours again. `lib/` knows
  about pixels and light; `_orc_shared.js` knows about stakes and rivets; only the unit file
  knows what a Hellhound looks like.

---

## 3. Five things the old art did not do

1. **One global key light (NW).** Every form shaded to the same direction, in every sprite.
   The old kits had no light model at all — `limb()` wrote three flat values with a hard split,
   which is why everything read as flat vector.
2. **Rim light.** D-22(d) required it and nothing implemented it. The Hellhound is a near-black
   body on near-black Shadow-Realm ground; without a rim it disappears.
3. **Ambient occlusion** at every seam — limb into torso, cap into flank, building into ground.
4. **Contact shadows.** Three new alpha palette codes (`SH0/SH1/SH2`) so every unit and tower
   sits *on* the map instead of floating in front of it. This also answers Q-14 (flyer shadows)
   for free. *This is the only change made to `palette.js` — additive, per D-16(c).*
5. **Interior ink lines**, not just an exterior ring. A silhouette with no interior lines is a
   blob; that is what "ink-line gothic" was missing.

---

## 4. The silhouette gate

`node scripts/silhouette-gate.mjs` renders each sprite as a black mask and reports the
symmetric difference between pairs. Below threshold = **build failure**, not a review comment.

Two alignment modes, because the two rules differ:

- **`fit`** (troops) — both scaled to a common 32 px box. The engine draws every troop at a
  similar screen size, so "make it bigger" is not a distinctness lever. Shape alone must differ.
- **`native`** (towers) — no scaling, aligned on the ground line. D-27 lists **size** as lever
  #1 and the engine really does draw a T6 taller than a T1.

**New art:**

```
  troops  [fit alignment]
    PASS   57%   troop_peasant_idle  vs  troop_hellhound_idle
  orc towers  [native alignment]
    PASS   55%   orc_t1_watchpost_base  vs  orc_t6_doomsday_cannon_base
  2/2 pairs pass.
```

**The same measurement on the old atlas** — this is the review's F1/F2 as a number:

| pair | diff | verdict |
|---|---:|---|
| `troop_peasant` vs `troop_acolyte` | **15%** | same rig, two palettes |
| `troop_knight` vs `troop_templar` | **33%** | wave-mates, indistinguishable |
| `troop_cursed_soldier` vs `troop_doom_knight` | **31%** | wave-mates, indistinguishable |
| `orc_t2_bolt_thrower` vs `orc_t4_ballista` | **7%** | the same building twice |
| `orc_t1_watchpost` vs `orc_t6_doomsday_cannon` | 32% | T1 and T6 of the same chain |
| `troop_peasant` vs `troop_hellhound` | 68% | the one that worked — a `buildBeast` unit |

7% between a T2 and a T4 is the whole problem in one figure.

---

## 5. T1 vs T6 — D-27's levers, tracked in the file

Both tower files carry a `SPEC.levers` block so escalation is auditable rather than asserted:

| lever | T1 Watchpost | T6 Doomsday Cannon |
|---|---|---|
| height | 38 px (40% of canvas) | 78 px (100%) |
| drums | 1 | 3, stacked and stepped |
| iron bands | 0 | 3, gold-studded |
| rim spikes | 0 | 10 |
| rhombus boss | 1 small (r=3) | 6 clustered, gold-edged |
| weapon | light bolt, 16 px, wooden cradle | siege cannon, 30 px, triple-ringed, armoured mantlet |
| trophies | none | bone standards on the shoulders |

Seven levers, D-27 asks for five. Same faction vocabulary throughout — rounded den, green
primary with wood as accent only, black iron (D-24/D-27/D-29). Same language, different
sentence.

Both towers are authored as **static base + 8-way turret** per D-23 (`_base` + turret sprite;
`e` and `ne` facings included to show the split works).

---

## 6. The ground rule

`tile_grass_base` keeps ~90% of its surface inside **two adjacent palette steps** (MS0/MS1),
with MS2 as accent and MS3 only on a lit clump edge. The old tileset swung the full ramp every
few pixels, which is why units vanished into it.

The coarse noise octave is deliberately weak: the eye spots tile repetition through
*recognisable features*, not through frequency. Strong blotches at 32 px become a visible
lattice once you lay 880 of them down. See `tile_grass_base.png` — 24 copies, no lattice.

`tile_grass_path_n` is the first member of the D-19 autotile set. The boundary is
noise-driven (a sine boundary is instantly recognisable when tiled), and the grass lip casts a
real shadow onto the earth, so the two layers read as different **heights** rather than two
colours.

---

## 7. What I would change next, if you approve the direction

Honest notes on the pilot itself:

1. **T6's iron bands** still read slightly like scaffolding rather than armour. Worth one more
   pass — darker, and let the drum's curve show through them.
2. **The Hellhound's tail** is a little rigid. It wants a real curve, not a taper.
3. **The Peasant's death frame 3** (prone) is the weakest frame in the batch.
4. The path body in `scene_game_scale.png` is a **placeholder stripe**, not an asset — the
   real `tile_grass_path` interior is not authored yet.

None of these are direction questions. They are polish, and I would rather hear whether the
direction is right before spending time on them.

---

## 8. Cost, extrapolated

The two troops took roughly the same effort each once `lib/` existed; the towers took more
because the faction vocabulary had to be invented alongside the first one. Extrapolating:

| batch | assets | notes |
|---|---|---|
| `lib/` + gate | done | one-time |
| faction vocabularies | 3 more (`_crypt_`, `_demon_`, `_goblin_`) | one-time per faction, front-loaded |
| towers | 48 | ~4 tiers per session once the faction vocabulary exists |
| troops | 53 | the long tail; W1–W5 world by world |
| tiles + autotile sets | 5 biomes | A-2 — needs the engine-side resolver too |
| projectiles / FX / icons / UI | ~200 | smaller canvases, much faster |

Reverting D-21 to 1× (A-1) is what makes this tractable — it cut the pixel budget ~4×.

---

## 9. What I need from you

1. **Is the direction right?** Look at `scene_game_scale_2x.png` first.
2. Anything in the pilot you actively dislike — silhouette, palette, light, animation weight.
3. Whether to keep polishing the pilot (§7) or start scaling.
4. Whether A-1 (1× density) is now confirmed as a decision, so I can write it into
   `DECISIONS.md` as an amendment to D-21.
