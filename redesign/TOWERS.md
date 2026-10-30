# Tower Trees

The four buildable families (D-01: Orc · Crypt · Demon · Goblin — all buildable on every
map; each is one world's signature). Shared shape for all four (D-02): **6 tiers, two
splits, no fusion.**

- **T1** base · **T2** base upgrade (no choice yet).
- **First split** → 2 wings; pick one. Each wing has **T3 (I)** + **T4 (II)**.
- **Second split** → 3 terminals: one exclusive to each wing + one **shared middle**
  (reachable from either). Your wing gates you to **2 of the 3**. Each terminal has
  **T5 (I)** + **T6 (II)**.
- **12 silhouettes / faction** (2 base + 2×2 wing + 3×2 terminal) × 4 = **48 towers**.

**Rules (D-05/06/11/23/24/26/27):**
- Towers are **stationary** — attack animation only, no idle/locomotion/death; optional
  stun/disabled overlay.
- **Orc & Goblin towers (D-23): static base + rotating directional turret.** The structure
  stays locked in place; a **turret** (the visible weapon) aims at the target via **8-way
  directional facings** — 5 hand-drawn 3/4 facings (E/NE/SE/N/S) mirrored to 8, engine snaps
  the aim to the nearest. **Crypt & Demon are single static sprites** (orbiting charges /
  beams / novas need no tracking barrel). **D-26:** Goblin's **drone & bomber lines are
  launch platforms (no turret)** — their drones fight as separate flying actors; the turret
  covers Orc's 12 + Goblin's 6 gun/ordnance towers (≈18 turret sets, not 24).
- **Every tier ships its own attack animation + a custom projectile/beam sprite** — no
  reuse across tiers. Maps onto the existing `Projectile` / `Tower` / `TowerType` classes.
- **No screen-clearing AoE** — bounded radius only.
- Faction damage types: **Orc = PHYSICAL · Crypt = FROST + CURSE/fear (+ LIGHTNING
  terminal) · Demon = FIRE · Goblin = PHYSICAL (engineering).**
- **Tier distinctness (D-20/D-27):** each tier is a visibly different building (**≥5 levers**:
  size, layers, darker colour, trim, spikes, bigger weapon); each branch reads distinct; the
  building matches its name; **no decoration shared across factions**. Per-faction shape grammar
  in the design extract (`instructions for claude design/TOWERS.md`).
- **Faction accent colours (D-24):** **Orc = green · Crypt = blue · Demon = red · Goblin =
  brass.** (Accent = identity hue over each faction's own material; full hexes in `STYLEGUIDE.md` §3.)

**Status:** ✅ Orc · ✅ Crypt · ✅ Demon · ✅ Goblin — all 4 trees locked (48 towers).

> **Per-tower weapon armament** — the visible weapon drawn on each of the 48 towers (the prime
> sprite-distinctness lever on a static tower) is specified in the design packet:
> `instructions for claude design/TOWERS.md` → *"Weapon armament — the per-tower distinctness
> spec"*. It lives in the art extract (art-direction), not duplicated here.

---

## Orc — PHYSICAL · "bombs and bolts" (W1 signature) ✅

Marksmen + artillery. All damage PHYSICAL; counter-knobs are armor-pierce, fire-rate, and
(bounded) splash radius.

**Base**
- **T1 Orc Watchpost** — single physical bolt; cheap; long reach. *Proj: short bolt.*
- **T2 Bolt Thrower** — heavier bolt, +range, +damage. *Proj: iron bolt.*

**First split**
- **Wing A · Marksman (bolt)** — high single-target DPM, longest range, no splash.
  - **T3 Crossbow Nest** — fast repeating bolts. *Proj: rapid bolt.*
  - **T4 Ballista** — heavy bolt, **partial armor-pierce**. *Proj: ballista spear.*
- **Wing B · Artillery (bomb)** — bounded splash, slower fire, lobs over obstacles.
  - **T3 Bombard** — lobbed bomb, small splash. *Proj: arcing bomb.*
  - **T4 Catapult** — bigger bounded splash, slow. *Proj: boulder.*

**Second split — terminals** (Marksman → Harpoon + Scatter · Artillery → Siege + Scatter)
- **Bolt-only → T5 Harpoon Cannon → T6 Dread Harpoon** — extreme range, **full
  armor-pierce**, single-target executioner (anti-tank). *Proj: barbed harpoon → chained
  dread-harpoon.*
- **Shared middle → T5 Scattergun Rig → T6 War Rig** — rapid scattershot; moderate single
  **+** small-radius splash; the flexible all-rounder. *Proj: pellet spray → triple-barrel
  spray.*
- **Bomb-only → T5 Siege Mortar → T6 Doomsday Cannon** — swarm-breaker; heavy
  **bounded** blast, slow fire (a big blast, *not* a screen wipe). *Proj: mortar shell →
  doomsday shell.*

---

## Crypt — FROST + CURSE/fear (+ LIGHTNING terminal) · "orbiting charges" (W2 signature) ✅

Undead frost-mystics; signature motif = charges that **orbit above the crypt and strike
down**. Frost wing = control by chilling; Fear wing = control by terror; the shared
Lightning terminal is the answer when fear/frost get resisted or cleansed.

**Base**
- **T1 Crypt** — single frost charge, mild SLOW. *Proj: descending ice charge.*
- **T2 Crypt II** — stronger charge, reliable SLOW. *Proj: ice charge.*

**First split**
- **Wing A · Frost** — FROST + SLOW, chilling control.
  - **T3 Frost Crypt I** — deeper slow, more damage. *Proj: frost charge.*
  - **T4 Frost Crypt II** — frost + brief **freeze** chance. *Proj: heavy frost charge.*
- **Wing B · Fear** — CURSE + FEAR, terror control.
  - **T3 Fear Crypt I** — curse charges, chance to **FEAR**. *Proj: spectral charge.*
  - **T4 Fear Crypt II** — reliable fear pulses + curse DoT. *Proj: wraith charge.*

**Second split — terminals** (Frost → College of Frost + Lightning · Fear → Terror + Lightning)
- **Frost-only → T5/T6 College of Frost Engineering** — orbiting frost charges hitting
  several targets; heavy slow + **freeze on impact** (bounded). FROST. *Proj: orbiting
  frost volley.*
- **Shared middle → T5/T6 Lightning Crypt** — **chain-lightning** charges that arc between
  enemies; counters clumps + the lightning-vulnerable (Clockwork Sentinel). LIGHTNING.
  *Proj: forking bolt.*
- **Fear-only → T5/T6 Terror Crypt** — mass **FEAR + CURSE**; routs the non-fearless,
  curse DoT + debuff. CURSE/FEAR. *Proj: terror wave.*

## Demon — FIRE · "beam from afar OR bursts around the temple" (W3 signature) ✅

All damage FIRE + BURN. Beam wing = sustained single-target that **ramps** on a held
target; Pyre wing = **short AoE bursts** that only go **continuous** at the Lake-of-Fire
terminal. Hard-countered by fire-immune (Ash-Walker, Hellhound) and the Glass Sentinel
(damage→heal) — intentional; mix families or use enchants for those.

**Base**
- **T1 Imp Brazier** — short flame **bursts**, single target, short range. *FX: ember puff.*
- **T2 Hellforge** — stronger bursts, +range, +burn. *FX: flame burst.*

**First split**
- **Wing A · Beam (far)** — long-range **continuous** beam; sustained single-target that
  **ramps** the longer it holds one target.
  - **T3 Hellbeam** — long ramping beam. *Beam: focused flame.*
  - **T4 Searing Lance** — longer, faster ramp, **pierces to a 2nd enemy** in line. *Beam: lance.*
- **Wing B · Pyre (near)** — **short AoE bursts** around the tower (pulsed flame-nova,
  bounded). *Not continuous until T5/T6.*
  - **T3 Hellfire Pyre** — periodic flame burst around the tower. *FX: flame nova.*
  - **T4 Pyroclasm Altar** — bigger/faster bursts, heavier BURN. *FX: wide flame nova.*

**Second split — terminals** (Beam → Doomray + Brimstone · Pyre → Lake of Fire + Brimstone)
- **Beam-only → T5/T6 Abyssal Ray → Doomray** — extreme range, heavy ramping
  single-target; applies **fire-vulnerability** (lowers FIRE resist) to non-immune.
  *Beam: piercing ray.*
- **Shared middle → T5/T6 Brimstone Battery → Magma Mortar** — **fast-firing** firebomb
  lobber; each shot **leaves a bounded, long-burning ground patch**, then retargets —
  trails fire down the lane. FIRE + lingering ground BURN. *Proj: firebomb → lava splash.*
- **Pyre-only → T5/T6 Lake of Fire → Infernal Caldera** — **continuous** large bounded
  burn field around the tower; sustained anti-swarm AoE.

## Goblin — PHYSICAL · "engineering: drones & ordnance" (W4 signature) ✅

Shares PHYSICAL with Orc but plays as *engineering*: anti-air drones, an armor-shred
debuff, and a heavy bomber — not Orc's ballistic pierce/splash. W4 tension: drones answer
Royal Gardens flyers (Falconer, Clockwork propeller); armor-shred cracks Kingsguard / Siege
Wagon.

**Base**
- **T1 Goblin Workshop** — short-range mechanical bolt. *Proj: spanner-bolt.*
- **T2 Tinker Tower** — faster, +range. *Proj: bolt.*

**First split**
- **Wing A · Drone (air/mobile)** — launches autonomous seeker drones (incl. vs flyers).
  **Drones spawn only when enemies are on the lane and fly home + vanish when it's clear;
  they get stronger as the wing tiers up.**
  - **T3 Drone Bay** — 1–2 basic drones. *Proj: drone bolt.*
  - **T4 Drone Swarm** — more + upgraded drones, faster/tougher. *Proj: drone bolt+.*
- **Wing B · Ordnance (heavy emplaced)** — rapid/explosive mechanical fire.
  - **T3 Gatling Turret** — very fast rounds. *Proj: gatling round.*
  - **T4 Spike Cannon** — heavier rounds, small bounded splash. *Proj: spike shell.*

**Second split — terminals** (Drone → Sky Carrier + Bomber · Ordnance → Doom Driller + Bomber)
- **Drone-only → T5/T6 Drone Foundry → Sky Carrier** — biggest **swarm** of upgraded
  drones; dominant **anti-air** + mobile coverage (same appear-on-demand lifecycle).
  *Proj: swarm drone bolts.*
- **Shared middle → T5/T6 Bomber Drone → Carpet Bomber** — calls a **big bomber drone** for
  a **slow, heavily-animated bombing run** along the track, dropping a string of **bounded**
  bombs (PHYSICAL splash). Huge payload, very slow cadence. *Proj: dropped bombs; large
  strike animation.*
- **Ordnance-only → T5/T6 Auger Cannon → Doom Driller** — drill-rounds applying **stacking
  armor-shred** that benefits **every tower** hitting that enemy; anti-tank support-DPS.
  *Proj: drill-round.*
