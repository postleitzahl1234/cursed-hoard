# Tower Trees (design extract) — the 48 silhouettes & their projectiles

> **Design extract** of `../TOWERS.md`. Trimmed to the art spec: every tower's **silhouette
> name per tier** and its **projectile/beam look** — that's what you draw. Balance knobs
> (fire-rate, pierce %, exact ranges) are kept only where they imply a *visual* (slow heavy
> shell vs. rapid pellet spray). Root is the source of truth.

**Shape (D-02):** 4 factions, identical tree — **6 tiers, two splits, no fusion**.
- **T1** base · **T2** base upgrade (no choice yet).
- **First split** → 2 wings; each wing has **T3 (I)** + **T4 (II)**.
- **Second split** → 3 terminals: one exclusive per wing + one **shared middle** (reachable
  from either wing). Each terminal has **T5 (I)** + **T6 (II)**.
- **12 silhouettes / faction** (2 base + 2×2 wing + 3×2 terminal) × 4 = **48 towers**.

**Art rules (D-05/06/16/23 + STYLEGUIDE §2.2/§3):**
- Towers are **static** — attack animation only (F=4), no idle/locomotion/death; optional
  shared **stun/disabled overlay**. Canvas **64×128** (1 wide × 2 tall, 2× density per D-21), **foot** anchor.
- **Orc & Goblin (D-23): static base + rotating turret.** Author the base once per tier
  (64×128) **plus** a separate **turret** sprite in **5 3/4 facings (E/NE/SE/N/S, mirrored to
  8)** that aims at the target — engine snaps the aim to the nearest of 8; the attack anim
  plays on the turret in its current facing. **Crypt & Demon stay single static sprites.**
  In the weapon-armament spec below, for Orc/Goblin the named weapon **is** the turret.
  **D-26: Goblin's drone & bomber lines are launch platforms (no rotating turret)** — their
  drones fight as separate flying actors; the turret covers **Orc's 12 + Goblin's 6
  gun/ordnance towers** (Workshop, Tinker, Gatling, Spike, Auger, Doom Driller).
- **Every tier ships its own attack anim + its own projectile/beam sprite — no reuse across
  tiers** (12 distinct projectile/beam looks per faction).
- **12 distinct silhouettes per faction** (D-02) — every tier node is its own sprite, not a
  recolour of the previous, while staying within the faction silhouette language. **Tiers are
  structural** (D-20): each is a visibly different building — a rebuild (bigger frame · more
  barrels/limbs · added machinery · changed "business end"), never a cosmetic glow of the same
  shape. See the weapon-armament spec below.
- **Tier-distinctness levers (D-27):** each tier differs from its predecessor by **≥5 levers** —
  size · intricacy/added layers · darker colour · stripes/trim · spikes · bigger weapon. **Each
  branch reads as a distinct building** (Fear ≠ Lightning ≠ Frost crypt). **The building matches
  its name**, and a **weapon line escalates as the same weapon** (Brimstone Battery = the lighter,
  weaker version of the same heavy Magma Mortar — same weapon). **No decoration or structure is shared
  across factions** — each owns its silhouette language.
- **Faction accents (D-24):** Orc = **green** (MS), Crypt = ice-blue (IC), Demon = lava-red (EM),
  Goblin = **brass** (BR). The accent is the identity hue over the faction's own material.
- **No screen-clearing AoE** — every blast/nova/field is a **bounded radius**.
- **Faction accent + damage type** (STYLEGUIDE §3 / §5 for the FX hue):

| Faction | Accent | Hex | Damage / FX hue |
|---|---|---|---|
| **Orc** | **green** (war-green) MS3·M1 | `#5d8a3a` | PHYSICAL — steel/dust, no element tint |
| **Crypt** | ice-blue IC3·B0 | `#a0e0ff` | FROST + CURSE/fear (+ LIGHTNING terminal) |
| **Demon** | lava-red EM3·R2 | `#ff4124` | FIRE + BURN |
| **Goblin** | **brass** (steampunk) BR4 | `#d8a847` | PHYSICAL (engineering — brass machinery, BR family) |

---

## Weapon armament — the per-tower distinctness spec

The single biggest readability lever on a **static** tower is its **visible weapon** — the
shape the eye locks onto. Each row names the armament drawn on the tower so the 12 tiers of a
faction read as **12 distinct black shapes at 32 px** (squint / grayscale test), and so a wing
**escalates structurally** up its tiers (bigger frame · more barrels · added machinery) rather
than recolouring. Pair each with its projectile/beam from the trees below; keep every weapon
inside its faction's material + shape grammar.

### Per-faction detailing (D-29)

Visual locks layered on the D-27 shape grammar (all **validate clean against the master palette** —
no off-palette hexes):
- **Orc** — **green is primary**; **brown wood is accent only** (braces · scaffold · palisade
  stakes · door frame · end-grain) + black-iron fittings. **No** rope lashings; **no** vertical
  "rod" arrow-slit rows (both removed).
- **Crypt** — **side battlements whose intricacy scales with tier** (T1 minor ledges → T5–6 tall
  stacked turrets with **gold finials**); a **small base door + lit lancet windows**; the
  **Fear/Terror branch** carries **purple (CR) accents** — purple courses/glows, gargoyle eyes,
  hanging shroud-banners.
- **Demon** — the ziggurat **steps read as terraced relief** (bright tread shelves + shadow
  recesses, per the reference); the **central staircase is ember-lit obsidian** (red/EM, **not**
  grey stone), **shortened to stop one terrace below the summit**, with a **small shrine door at
  the top**.
- **Goblin** — a **small riveted iron hatch door at the base**.

### Orc — **green-primary (war-green); brown timber + black iron as accent only** (D-24/D-29); **rounded "den" shape + central symmetric rhombus decorations** (D-27) — (bolt-line = sleek/horizontal · bomb-line = bulky/lobbing)
| Tier | Tower | Weapon armament (drawn on the tower) |
|---|---|---|
| T1 | Orc Watchpost | hand-spanned crossbow lashed to a squat log post; one iron bolt in a notched rest — crudest, smallest |
| T2 | Bolt Thrower | torsion bolt-thrower: two skeined rope-springs + a thick stave on a planked frame, side crank-wheel |
| T3 | Crossbow Nest *(Marksman)* | rotating timber turret carrying a fan of 3–4 small crossbows + side quiver-racks; fires in sequence |
| T4 | Ballista *(Marksman)* | full war-ballista: long limbs, twisted-sinew bundles, a long spear-bolt in a deep iron-banded channel — tall, lean |
| T3 | Bombard *(Artillery)* | stubby cast-iron mortar tube on a timber cradle, muzzle skyward, a fused round bomb in the mouth — squat |
| T4 | Catapult *(Artillery)* | counterweight catapult: tall A-frame, swinging arm, sling + boulder in the cup — big triangular read |
| T5 | Harpoon Cannon *(bolt term.)* | deck-gun harpoon launcher: one huge barbed harpoon on a coiled-chain spool, iron swivel mount |
| T6 | Dread Harpoon *(bolt term.)* | twin-track harpoon engine: two barbed harpoons, paired chain-drums, a skull-iron prow — the bolt apex |
| T5 | Scattergun Rig *(shared)* | splayed fan of short scatter-barrels on a braced rig with an ammo belt — "fan of barrels" read |
| T6 | War Rig *(shared)* | triple-barrel rotating rig on an armored carriage, ammo hoppers + smoke-stack — gatling-bulky |
| T5 | Siege Mortar *(bomb term.)* | wide-bore mortar: a fat blast-scarred tube sunk in a dug-in stone base, oversized fused shell |
| T6 | Doomsday Cannon *(bomb term.)* | colossal iron-banded cannon on a riveted siege-platform, giant shell, barrel-rings + chains — largest Orc mass |

### Crypt — bone, ice & ornate spires (**much smaller entrances + windows**, D-27; the structure is a spire; the tell is the **orbiting charge** + crown + frost/curse/lightning treatment)
| Tier | Tower | Weapon armament (drawn on the tower) |
|---|---|---|
| T1 | Crypt | small headstone-spire; one pale frost-charge orbits the peak and drops as the shot |
| T2 | Crypt II | taller mausoleum spire, ringed finial; a brighter ice-charge circles; carved frost-runes |
| T3 | Frost Crypt I *(Frost)* | ice-clad obelisk crowned with a crystalline ring; **two** frost-charges orbit; icicle fringe |
| T4 | Frost Crypt II *(Frost)* | glacier-spire with a caged frozen orb on top; heavier charges, drifting freeze-mist |
| T3 | Fear Crypt I *(Fear)* | blackened gravestone-spire trailing a curse-purple wisp; a single spectral skull-charge orbits |
| T4 | Fear Crypt II *(Fear)* | wraith-shrine: skull finial, tattered shroud, **two** wailing curse-charges circling — ragged read |
| T5 | College of Frost Engineering I *(frost term.)* | frost-orrery spire: a mechanical armillary ring with several charges orbiting in formation |
| T6 | College of Frost Engineering II *(frost term.)* | the orrery doubled — stacked armillary rings, a dense crown of charges, frozen buttresses |
| T5 | Lightning Crypt I *(shared)* | conductor-spire topped by an iron lightning-rod / Tesla finial; a single volt-charge crackles |
| T6 | Lightning Crypt II *(shared)* | storm-spire bristling with rods + coil-rings; a forking chain-bolt leaps between them |
| T5 | Terror Crypt I *(fear term.)* | bone-cathedral spire with a giant screaming-skull crown; a terror-wave pulses from the maw |
| T6 | Terror Crypt II *(fear term.)* | the cathedral risen — stacked skulls, a shroud-draped belfry, rolling curse-fog, wider pulse |

### Demon — obsidian, horns & lava, **pronounced Aztec-style stepped pyramids** (steps in the red/EM theme; **beam wing tall, pyre wing shortest/broadest**, D-27) — (beam-line = aimed lens/maw emitter · pyre-line = open font/caldera; organic molten masses, not machines)
| Tier | Tower | Weapon armament (drawn on the tower) |
|---|---|---|
| T1 | Imp Brazier | small horned obsidian brazier with a flickering coal-mouth; spits a short ember burst |
| T2 | Hellforge | chained iron forge-altar, a wider fire-grate venting flame; anvil-like bulk |
| T3 | Hellbeam *(Beam)* | a tall obsidian horn aimed forward, glowing focusing-lens "eye" at the tip channels a steady ray |
| T4 | Searing Lance *(Beam)* | twin-horn lance-emitter on a swivel, brighter lens + focusing collar — sleeker, sharper |
| T3 | Hellfire Pyre *(Pyre)* | open lava-font bowl on a stepped altar; erupts a ring of flame around itself — round, low |
| T4 | Pyroclasm Altar *(Pyre)* | cracked magma altar with overflowing lava channels; a wider, fiercer flame-nova |
| T5 | Abyssal Ray *(beam term.)* | a great daemon-skull emitter, eyes ablaze, a deep throat-lens projecting a heavy ray; horns frame it |
| T6 | Doomray *(beam term.)* | the skull crowned with a halo of focusing-runes + side-horns; extreme piercing ray, heat-haze |
| T5 | Brimstone Battery *(shared)* | the **same magma-mortar as T6, scaled down / weaker** — a lava-cradle mortar lobbing firebombs (same weapon line, D-29) |
| T6 | Magma Mortar *(shared)* | a heavy single magma-mortar on a basalt carriage, glowing bore; big lava-shells + ground-fire trail |
| T5 | Lake of Fire *(pyre term.)* | a wide sunken caldera ringed with horns; a continuous burning pool churns around the tower |
| T6 | Infernal Caldera *(pyre term.)* | a volcano-mouth risen on a basalt mound, lava fountains, vast sustained burn-field — tallest Demon mass |

### Goblin — brass, copper, pipes & gears (**brass = faction accent**, D-24; drone-line = open hangar bays + parked drones, **launch platforms — no turret, D-26** · ordnance-line = gun/drill machinery **(gets the D-23 turret)** · bomber = airship rig **(launch platform)**; busy, riveted, smoky)
| Tier | Tower | Weapon armament (drawn on the tower) |
|---|---|---|
| T1 | Goblin Workshop | lopsided brass shack with a single spring-loaded bolt-arm out a window; tools + smokestack |
| T2 | Tinker Tower | taller riveted contraption, a faster piston bolt-arm, gauges + a spinning gear |
| T3 | Drone Bay *(Drone)* | brass tower with an open hangar hatch; 1–2 little rotor-drones parked/launching on a rail |
| T4 | Drone Swarm *(Drone)* | double hangar-rig with multiple launch rails + parked drones, antennae and signal-flags |
| T3 | Gatling Turret *(Ordnance)* | a cranked multi-barrel brass gatling on a geared mount, ammo belt feeding in |
| T4 | Spike Cannon *(Ordnance)* | heavy single-barrel spike-thrower with a recoil spring + a hopper of iron spikes |
| T5 | Drone Foundry *(drone term.)* | a chimneyed foundry-keep mass-producing drones from several bays, a swarm hovering above |
| T6 | Sky Carrier *(drone term.)* | a grounded mini-carrier deck on stilts with launch catapults + a dense drone swarm overhead |
| T5 | Bomber Drone *(shared)* | a tethered hangar-mast launching one big bomber-blimp; bomb-racks visible — tall mast read |
| T6 | Carpet Bomber *(shared)* | a larger airship-dock with a heavy multi-engine bomber + strings of bombs — slow, huge payload |
| T5 | Auger Cannon *(ordnance term.)* | a brass cannon firing spinning drill-rounds, a giant auger-bit mounted as the barrel |
| T6 | Doom Driller *(ordnance term.)* | a colossal twin-auger drilling rig on treads/braces, exhaust pipes + grinding gears — heaviest brass mass |

---

## Orc — PHYSICAL · "bombs and bolts" (W1 signature)

Marksmen + artillery. Visual knobs: bolt vs. lobbed bomb; rapid light shot vs. slow heavy shell.

**Base**
- **T1 Orc Watchpost** — single physical bolt; cheap, long reach. *Proj: short bolt.*
- **T2 Bolt Thrower** — heavier bolt, bigger frame. *Proj: iron bolt.*

**First split**
- **Wing A · Marksman (bolt)** — sleek, long-range, no splash.
  - **T3 Crossbow Nest** — fast repeating bolts. *Proj: rapid bolt.*
  - **T4 Ballista** — heavy bolt, armor-pierce. *Proj: ballista spear.*
- **Wing B · Artillery (bomb)** — bulky, lobs over obstacles.
  - **T3 Bombard** — lobbed bomb, small splash. *Proj: arcing bomb.*
  - **T4 Catapult** — bigger bounded splash, slow. *Proj: boulder.*

**Terminals** (Marksman → Harpoon + Scatter · Artillery → Siege + Scatter)
- **Bolt-only → T5 Harpoon Cannon → T6 Dread Harpoon** — extreme-range anti-tank executioner.
  *Proj: barbed harpoon → chained dread-harpoon.*
- **Shared middle → T5 Scattergun Rig → T6 War Rig** — rapid scattershot, small-radius splash;
  the all-rounder. *Proj: pellet spray → triple-barrel spray.*
- **Bomb-only → T5 Siege Mortar → T6 Doomsday Cannon** — swarm-breaker; heavy **bounded** blast,
  slow fire (a big blast, *not* a screen wipe). *Proj: mortar shell → doomsday shell.*

---

## Crypt — FROST + CURSE/fear (+ LIGHTNING terminal) · "orbiting charges" (W2 signature)

Undead frost-mystics. Signature motif = **charges that orbit above the crypt and strike down**
(see INVENTORY §4 "orbiting-charge layer"). Frost wing = ice-blue (IC); Fear wing = curse-purple
(CR); shared Lightning terminal = volt yellow-core + blue crackle (VL).

**Base**
- **T1 Crypt** — single frost charge, mild slow. *Proj: descending ice charge.*
- **T2 Crypt II** — stronger charge. *Proj: ice charge.*

**First split**
- **Wing A · Frost** (IC) — chilling control.
  - **T3 Frost Crypt I** — deeper charge. *Proj: frost charge.*
  - **T4 Frost Crypt II** — brief freeze chance. *Proj: heavy frost charge.*
- **Wing B · Fear** (CR) — terror control.
  - **T3 Fear Crypt I** — curse charges. *Proj: spectral charge.*
  - **T4 Fear Crypt II** — fear pulses + curse DoT. *Proj: wraith charge.*

**Terminals** (Frost → College of Frost + Lightning · Fear → Terror + Lightning)
- **Frost-only → T5/T6 College of Frost Engineering** — orbiting frost volley, multi-hit; heavy
  slow + freeze on impact (bounded). *Proj: orbiting frost volley.*
- **Shared middle → T5/T6 Lightning Crypt** — **chain-lightning** charges arcing between enemies
  (counters clumps + the lightning-vulnerable Clockwork Sentinel). *Proj: forking bolt (VL).*
- **Fear-only → T5/T6 Terror Crypt** — mass **FEAR + CURSE**; curse DoT + debuff. *Proj: terror wave (CR).*

---

## Demon — FIRE · "beam from afar OR bursts around the temple" (W3 signature)

All damage FIRE + BURN (EM family). Beam wing = a sustained **continuous beam** that ramps on a
held target; Pyre wing = **short bounded AoE bursts** (flame-nova), going continuous only at the
Lake-of-Fire terminal. *(Demon's per-tier beam is its equivalent of a projectile — D-06.)*

**Base**
- **T1 Imp Brazier** — short flame **bursts**, single target. *FX: ember puff.*
- **T2 Hellforge** — stronger bursts, +burn. *FX: flame burst.*

**First split**
- **Wing A · Beam (far)** — long-range **continuous** beam, ramps the longer it holds.
  - **T3 Hellbeam** — long ramping beam. *Beam: focused flame.*
  - **T4 Searing Lance** — faster ramp, **pierces to a 2nd enemy** in line. *Beam: lance.*
- **Wing B · Pyre (near)** — **short AoE flame-nova bursts** around the tower (bounded).
  - **T3 Hellfire Pyre** — periodic flame burst. *FX: flame nova.*
  - **T4 Pyroclasm Altar** — bigger/faster bursts. *FX: wide flame nova.*

**Terminals** (Beam → Doomray + Brimstone · Pyre → Lake of Fire + Brimstone)
- **Beam-only → T5/T6 Abyssal Ray → Doomray** — extreme-range heavy ramping beam; applies
  fire-vulnerability. *Beam: piercing ray.*
- **Shared middle → T5/T6 Brimstone Battery → Magma Mortar** — fast firebomb lobber; **each shot
  leaves a bounded long-burning ground patch** (trails fire down the lane). *Proj: firebomb →
  lava splash* + ground-fire decal (INVENTORY §4).
- **Pyre-only → T5/T6 Lake of Fire → Infernal Caldera** — **continuous** large bounded burn field
  around the tower. *FX: sustained burn field.*

---

## Goblin — PHYSICAL · "engineering: drones & ordnance" (W4 signature)

Shares PHYSICAL with Orc but reads as **engineering** — brass/copper machinery (BR family), not
Orc lumber. Three flavours: autonomous **drones** (animated air actors — INVENTORY §1), heavy
emplaced **ordnance**, and a slow heavy **bomber**.

**Base**
- **T1 Goblin Workshop** — short mechanical bolt. *Proj: spanner-bolt.*
- **T2 Tinker Tower** — faster, +range. *Proj: bolt.*

**First split**
- **Wing A · Drone (air/mobile)** — launches autonomous seeker drones (incl. vs flyers).
  **Drones spawn only when enemies are on the lane and fly home + vanish when it clears; they
  upgrade as the wing tiers.** *(Drones are separate flying actors — **distinct design per tier**;
  **bomber drones differ from attack drones**; the drone/bomber towers are **launch platforms,
  no rotating turret** (D-26). Fly F=4 + attack F=4.)*
  - **T3 Drone Bay** — 1–2 basic drones. *Proj: drone bolt.*
  - **T4 Drone Swarm** — more + upgraded drones. *Proj: drone bolt+.*
- **Wing B · Ordnance (heavy emplaced)** — rapid/explosive mechanical fire.
  - **T3 Gatling Turret** — very fast rounds. *Proj: gatling round.*
  - **T4 Spike Cannon** — heavier rounds, small bounded splash. *Proj: spike shell.*

**Terminals** (Drone → Sky Carrier + Bomber · Ordnance → Doom Driller + Bomber)
- **Drone-only → T5/T6 Drone Foundry → Sky Carrier** — biggest **swarm** of upgraded drones;
  dominant anti-air. *Proj: swarm drone bolts.*
- **Shared middle → T5/T6 Bomber Drone → Carpet Bomber** — calls a **big bomber drone** (animated
  actor) for a **slow, heavily-animated bombing run** dropping a string of **bounded** bombs.
  *Proj: dropped bombs + large strike animation.*
- **Ordnance-only → T5/T6 Auger Cannon → Doom Driller** — drill-rounds applying **stacking
  armor-shred**. *Proj: drill-round.*
