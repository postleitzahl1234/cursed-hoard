# Engine Systems — to configure later

Running list of **new gameplay systems** the lore redesign needs that the current
engine doesn't have. We talk through these once the five world rosters are drafted.
Nothing here is wired yet; this is the spec + the recommended architecture.

---

## Recommended architecture — composition, not flags

The current `HeroType` is a single flat enum: fixed stat columns + a handful of
booleans (`fearless`, `flying`…) + one `EnemyAbility` + one `BossBehavior`. That
does not scale to taunts, aura buffs, mount/dismount state-swaps, HP-threshold
triggers, multi-stage summons, etc. — every new idea would add another column.

**Proposed model (OO, expandable):**

- `EnemyArchetype` — immutable **data** (name, base stats, sprite/anim set, the
  list of behaviours it ships with). Loaded from a data table, one row per troop.
- `Enemy` — a **live instance** holding current stats + a `List<EnemyBehavior>`.
- `EnemyBehavior` — small composable class with lifecycle hooks:
  `onSpawn(e)`, `update(e, dt)`, `onDamaged(e, dmg, src)`, `onDeath(e)`,
  `onGemGrab(e)`, `onGemDrop(e)`. Each new mechanic = one new behaviour class,
  zero edits to existing troops.
- Towers get a parallel **targeting-policy** seam so behaviours like Taunt can
  override "who do I shoot."

A troop is then just `archetype + behaviours`, e.g. Golden Prince =
`[MountState, GemCarrier]`, General = `[ContinuousSummon, ThresholdSummon]`.

---

## Combat model (cross-cutting)

**Typed damage + resistances (D-11, HOLY cut).** Types: `PHYSICAL · MAGIC · FIRE ·
FROST · LIGHTNING · CURSE`. Each `EnemyArchetype` holds:
- `Resistances` — `Map<DamageType, float>` (resist fraction; `1.0` = immune,
  negative = extra-vulnerable). The legacy `armor`/`magicResist` become the
  PHYSICAL/MAGIC entries, so there is one unified mitigation path.
- `StatusImmunities` — `Set<Status>` over `FEAR · SLOW · STUN · BURN · CURSE`.
  (Status immunity is separate from damage resistance: a unit can take frost damage
  yet be immune to the slow it normally applies.)

Towers declare the damage type(s) they deal (Orc=PHYSICAL, Crypt=FROST+CURSE & the
Lightning terminal=LIGHTNING, Demon=FIRE, Goblin=PHYSICAL). Counters fall out of the
table instead of bespoke code: Ash-Walker = `FIRE:1.0`, Temple Guard = high `MAGIC`,
Stone Ascetic = `FROST:1.0` + `SLOW` immune, etc.

**Gem-carry (D-09, hybrid).** Any enemy can grab a gem on reaching the cave; carrying
applies `slow + land (flyers)` while keeping armor. `GemCarrier` is a behaviour every
archetype gets implicitly; **specialists** override it (Golden Prince → dismount+lose
armor; Gem Shade → `BlinkToGem`). Dropped gems are re-grabbable; escape = gem lost.

**Summons (D-10, phased).** `Summon` behaviours take `(type, interval, maxAlive)`. Bosses
wrap them in **phases**: a `Phase` = `{maintainedType, interval, cap, onEnterBurst?}`, flipped
by HP thresholds. **Phase reconfigure rule:** crossing a threshold fires the one-time burst
*and* sets the maintained type, so the burst **seeds the new phase's cap** and the
**maintained type backfills** the cap as units die (one cap per boss, no double-stacking).

## Summon trees (per-boss, D-10 · Phase reconfigure)

All cadences are design intent (not final numbers). "Cap" = max alive from that source.

| Boss | Phase (HP) | Maintained | Interval | Cap | On-enter burst | Other |
|---|---|---|---|---|---|---|
| **The General** | P1 >50% | Knight | 6s | 4 | – | – |
| | P2 ≤50% | Knight-Lieutenant | 8s | 4 | **4× Knight-Lieutenant** | burst = maintained type (seeds cap); Lieutenants carry `ThresholdInvuln` |
| **The High Priest** | P1 >50% | Templar | 12s | 2 | – | Sanctuary (`CleanseAura`+shield) every 8s |
| | @<50% once | — | — | — | **2× Templar** | 3s `ThresholdInvuln` shimmer |
| | P2 ≤50% | Templar | 9s | 3 | – | Sanctuary every 6s |
| **Chief Rebel** | P1 >50% | Sand Raider | 4s | 6 | – | each spawn `SandstormCover` 2s; `GoldSteal` every 10s |
| | P2 ≤50% | Sand Raider | 5s | 6 | **2× Dune Behemoth** | burst≠maintained: Behemoths seed 2 slots, Raiders backfill; `GoldSteal` every 8s |
| **The King** *(1 life)* | P1 >40% | Kingsguard | 8s | 3 | – | Royal Decree (`OverchargePulse`) every 15s |
| | P2 ≤40% | Kingsguard | 6s | 4 | **2× Kingsguard** | on-enter 4s `ShieldMode`; Decree every 12s |
| **Demon Shadow King** | P1 >66% | *(portal)* Cursed Soldier | 7s | 3 /portal | – | 1 portal; Darkness every 14s |
| | P2 66–33% | *(portals)* Hellhound · Imp Swarm | 6s · 8s | 3 · 2 /portal | – | 2nd portal (also shortcut); Darkness every 11s |
| | P3 ≤33% | *(3 portals)* | — | per-portal | **1× Void Priest + 2× Doom Knight** | Darkness every 8s, wider |

**Per-portal caps (Shadow King).** His summons come from `PortalSpawn` objects, each a
self-contained summoner `(type, interval, cap)` — the per-boss cap rule does not apply to him.

**Void Priest** (`Resurrect`, troop not boss): revive nearest eligible corpse → 50% HP every
6s; cap **2** active revives per priest (backfills as revived re-die). Excludes
bosses / champions / heavies; one revive per corpse (no loops).

## Enchants (player-side, D-13)

The player's active "hand of the dark." Mirror of `EnemyBehavior`: each enchant is an
`EnchantType` data row + a small composable `EnchantEffect`. Reuses the typed-damage +
status model (D-11) and the tower targeting seam.

- `EnchantType` = `{id, name, icon, fxSprite, manaCost, castMode, payload}`. **No cooldown
  field** — casts are gated by **mana only** (regenerating resource, top bar per D-07).
- `castMode` ∈ `POINT_AOE · GLOBAL · ENEMY_TARGET · TOWER_TARGET`.
- **Loadout: the player equips exactly 2** enchants per map (bottom bar, D-07); picking
  which 2 is a pre-map decision.
- **Skills** (separate meta-progression, designed later) upgrade enchants — e.g. Meteor's
  lava pool is unlocked/scaled there, not on the base enchant.

| Enchant | Cast | Effect (type) | Counters / notes | FX |
|---|---|---|---|---|
| **Meteor** | POINT_AOE | FIRE impact + BURN; **skill upgrade adds a lingering lava pool** (ground FIRE DoT) | fire-immune (Ash-Walker, Hellhound) shrug it | meteor impact + lava pool |
| **Fear** | POINT_AOE | FEAR — enemies flee/reverse briefly | fearless/fear-immune ignore | dread ring |
| **Freeze** | POINT_AOE | FROST — heavy SLOW/freeze | SLOW-immune (Paladin) ignore | ice burst |
| **Gem Ward** | ENEMY_TARGET | carrier drops gem + gem snaps back toward the cave; briefly blocks re-pickup | counters Golden Prince, Royal Prince, Gem Shade | chain-yank recall |
| **Cursed Tribute** | GLOBAL (timed) | kills yield bonus gold for a few seconds | offsets `GoldSteal`; economy swing | gold aura |
| **Dark Overcharge** | TOWER_TARGET / AOE | towers +fire-rate/+range **and** cleansed of stun/disable | counters Darkness, Rebel Sapper, `TowerSuppressionField` | dark surge |

Mana costs are tunable; with no cooldowns, balance lives in **mana cost vs. regen** (big
plays like Meteor cost the most). **Cut from the draft:** Storm Call, Hex, Unveil,
Disenchant, Grave Seal.

## Skills (meta-progression, D-14 — revised 2026-05-30)

Permanent **between-map** progression — distinct from in-map enchants (D-13). Reuses the
existing engine seam, **refit not rebuilt**: `Skill` (data row) · `SkillTreeBonus.fromRanks(
Map<id,rank>)` (aggregates allocated ranks into a flat bonus struct read by `Tower` / `World`
/ the enchant resolver) · `SkillTreeScreen` (UI). **4 faction trees only** (Orc · Crypt ·
Demon · Goblin), **all open from start**. Each tree = **10 skills, and every skill has 5 tiers (ranks)** → **40 skills / 200 ranks**.
**No ultimate capstone** (the earlier 8-ranked-plus-1-ultimate / 36-node draft is aborted).
Points ≈ **+1/map +1/star** (~100 over 25 maps); a full tree is 50 ranks, so ~100 points
deepens **at most ~two trees** — focus is forced.

**Design rule (user constraint): skills are mechanically rich, not flat stat sticks — no
pure damage / fire-rate buffs.** Allowed levers are *conditional / hooked*: drops & economy
(coins · scrap · mana-potions · tree-cutting), procs (crit + crit-stun · jam · freeze-chance
· %-max-HP execute), deploys (proximity mines · attacking cave-charges), debuffs (armor-
pierce · fire-resist-down · burn contagion), gem auto-recall, and enchant upgrades. The few
damage lines are gated by a condition (vs-champion/boss · on-crit · anti-air · on-kill
fire-rate).

**Engine refit (don't rebuild):**
- **Delete** the Witch/Beast `Skill` constants + their `SkillTreeBonus` fields (D-01 cut).
- Every `Skill.maxRank` becomes **5**; **drop** the `isUltimate` flag — no capstones.
- New **drop / economy subsystem** the bonus struct feeds: per-enemy **coin** drop chance +
  value (coin = 50 gold), **tree-cutting** (coin on fell · cut-cost · regrow timer), **scrap**
  drop chance (50 gold), **mana-potion** drop chance/value (30 mana), level-start gold/mana,
  mana-cap.
- New **proc / deploy / debuff knobs**: crit chance + crit-stun, armor-pierce %, %-max-HP
  execute, freeze-chance, jam-chance, blast-radius %, anti-air %, fire-resist-down %, burn-
  death contagion radius, on-kill fire-rate, lava-pool duration/slow, gem auto-recall,
  **cave-charges** (Crypt caves accumulate charges and attack), **proximity mines** (Goblin
  workshops deploy on the lane).
- `SkillTreeBonus` also carries a **per-enchant payload** so enchant upgrades flow through the
  same aggregation the enchant resolver already reads.
- `SkillTreeScreen` renders **4 columns** (not 6); each row shows **5 rank-pips**. No
  capstone-node style needed.
- **Enchant upgrades are gated behind the themed faction** (deliberate coupling): an enchant
  only improves if you invest its faction. Thematic split — **Orc & Goblin = gold/economy**,
  **Crypt & Demon = mana/spell**.

Numbers are design intent (tunable), in the existing engine's style.

### Orc — "War Machine" (PHYSICAL · coin economy + siege) · enchant: Cursed Tribute
*Every skill = 5 tiers. "/tier" is the per-rank step.*
| # | Skill | Effect (per tier, ×5) |
|---|---|---|
| 1 | Coin Hoard | +20%/tier chance a killed enemy drops **2** coins instead of 1 (0→100%; coin = 50 gold) |
| 2 | Timber Tithe | felling a tree drops a coin worth **0–50 gold** |
| 3 | Sharp Axes | **−8%/tier** tree-cutting cost |
| 4 | Champion Bane | **+4%/tier** damage vs **champions** (ability-troops) **and bosses** |
| 5 | Cheap Carpenters | **−5%/tier** Orc tower upgrade cost |
| 6 | Brutal Crits | **+3%/tier** crit (double-damage) chance for Orc towers; crits also **stun 0.2s/tier** |
| 7 | Armor Breaker | Orc towers **ignore +5%/tier** enemy armor (25% at t5) |
| 8 | Bigger Payloads | Orc bombs/boulders **+6%/tier** bounded blast radius |
| 9 | Regrowth | cut trees **regrow** after a delay that shortens per tier → re-cut for more coins |
| 10 | **Lasting Tribute** *[Cursed Tribute]* | spell lasts **+1s/tier**; kills yield bonus gold longer |

### Crypt — "Frostbound Dread" (FROST + CURSE/fear · control + mana) · enchants: Freeze, Fear
*Every skill = 5 tiers.*
| # | Skill | Effect (per tier, ×5) |
|---|---|---|
| 1 | Mana Reserves | **+40 mana/tier** at level start |
| 2 | Potion Cache | **+20%/tier** chance an enemy drops **2** mana potions instead of 1 (each = 30 mana) |
| 3 | Deep Well | mana **cap +60/tier** (base cap 500) |
| 4 | Withering Fear | a feared enemy loses **0.5%/tier** of max-HP per second while feared |
| 5 | Terror Mastery *[Fear]* | terror (fear) spell cost **−5%/tier** |
| 6 | Death's Toll | Crypt towers **5%/tier** chance to deal **10% of target max-HP** (not bosses) |
| 7 | Haunted Caves | caves accumulate **+1 crypt charge/tier** (from 0) and **can attack** |
| 8 | Frozen Coffers | **−5%/tier** Crypt tower upgrade cost |
| 9 | Killing Cold | **+3%/tier** chance for Crypt towers to **freeze** an enemy |
| 10 | **Freeze Mastery** *[Freeze]* | freeze spell cost **−5%/tier** |

### Demon — "Infernal Ascendance" (FIRE + burn · Meteor)
*Every skill = 5 tiers.*
| # | Skill | Effect (per tier, ×5) |
|---|---|---|
| 1 | Brimstone Tax | **+20 gold/tier** at level start |
| 2 | Gem Drift | dropped gems drift back toward the cave at **0.03 tiles/s per tier** |
| 3 | **Lava Pool** *[Meteor]* | Meteor leaves a damaging **lava pool**, lasting **6 → 12s** (starts at 0) |
| 4 | Meteor Mastery *[Meteor]* | Meteor mana cost **−10%/tier** |
| 5 | Kill Frenzy | on a tower kill that tower gets a **10s fire-rate boost, +5%/tier** |
| 6 | Hellish Discounts | **−5%/tier** Demon tower upgrade cost |
| 7 | Wildfire | Demon towers **+3%/tier** chance to add bonus **fire** damage |
| 8 | Burst of Cinders | a **burning enemy that dies** bursts, applying burn in a small radius that **grows per tier** (bounded) |
| 9 | Tar Pit | enemies in Meteor's lava pool are **slowed 6%/tier** (30% at t5) |
| 10 | Searing Weakness | Demon hits lower target **fire-resist 4%/tier** (20% at t5; can't make fire-immune vulnerable) |

### Goblin — "Industry" (PHYSICAL engineering · salvage economy) · enchants: Gem Ward, Dark Overcharge
*Every skill = 5 tiers.*
| # | Skill | Effect (per tier, ×5) |
|---|---|---|
| 1 | Payroll | **+30 gold/tier** at level start |
| 2 | Lean Workshops | **−5%/tier** Goblin tower upgrade cost |
| 3 | Lasting Shred | armor-shred (Auger / Doom Driller) lasts **+1s/tier**; shred benefits **every** tower hitting that enemy |
| 4 | Drone Swarm | each drone-tower fields **+1 drone/tier** (drones individually weak); drones & Goblin towers **+5%/tier** vs **flying** (25% at t5) |
| 5 | Scrap Drops | enemies killed by a Goblin tower **+8%/tier** chance to drop **scrap** (50 gold) |
| 6 | Shrapnel Casing | Goblin ordnance (bombs/spikes) **+6%/tier** bounded blast radius |
| 7 | Jury-Rig | Goblin towers **3%/tier** chance to **jam** an enemy (stun 1s) |
| 8 | Minefield | workshops deploy a **proximity mine** on the lane periodically; cadence **speeds up per tier** (bounded splash) |
| 9 | **Ward Mastery** *[Gem Ward]* | blocks gem re-pickup **+1s/tier**; snaps the gem further toward the cave |
| 10 | **Overcharge Mastery** *[Dark Overcharge]* | spell lasts **+1s/tier**; towers stay overcharged & disable-cleansed longer |

## Behaviours introduced so far (World 1 — Great Grasslands)

| Behaviour | Used by | Spec |
|---|---|---|
| `SlowImmunity` | Paladin | Ignores every slow/freeze source (flag check before applying any speed debuff). |
| `MountState` | Outrider, Golden Prince | Two stat profiles (mounted vs footed). Outrider stays mounted. Golden Prince starts mounted (fast+armored), **dismounts on gem grab** → footed profile (slow, no armor). Swaps **animation set** ride↔walk at transition. |
| `GemCarrier` | Golden Prince | Existing gem-carry logic, but its pickup event also fires `MountState` dismount. |
| `SupportAura` | Banner-Sergeant | Radius buff to allies: +speed & fearless. **Must render a visible aura** (ground ring + banner pulse). Buff is a timed status reapplied while in range. |
| `Taunt` | Pavise Guard | All towers whose range covers the taunter **must target him** until he dies. Needs the tower targeting-policy seam. |
| `ThresholdInvuln` | Knight-Lieutenant | First time HP crosses below a % (50), grant N seconds (2) of invulnerability, once. Render a shimmer. |
| `ContinuousSummon` | The General | Spawn `type` every `interval`. |
| `ThresholdSummon` | The General | At a % HP (50), one-time burst of `count` (4) `type` (Knight-Lieutenant). |

Existing `BossBehavior.INVULN_WINDOW` / summon logic should be **refactored into
these behaviours** rather than kept as a parallel boss-only system.

## Behaviours introduced — World 2 (Holy Mountains)

| Behaviour | Used by | Spec |
|---|---|---|
| `Frenzy` | Flagellant | Move speed scales **up** as current HP drops (inverse of HP%). |
| `StationaryPerformer` | Bard | On a cycle: **halt → sing** (allies in radius gain +speed for a duration) **→ resume**. Cannot move or be moved while singing; fully exposed. |
| `CleanseAura` | Inquisitor, High Priest | Periodic **dispel** of slow/freeze/curse/DoT on allies in radius. |
| `PathProgressTransform` | Monk → Templar | When path progress ≥ threshold (0.8) and still alive, **swap archetype** to the target (Templar) with a transformation animation. Not a "level" — a one-way archetype swap. |
| `WaterborneFlight` | Seraph | Flyer follows a **water-only air lane** (water-constrained pathfinding, D-15) — a separate route from the ground path; lands + walks the ground path on gem-grab. |

`HealAura` (War Cleric) and `Fearless` (Pilgrim/Flagellant) reuse existing flags.

## Behaviours introduced — World 3 (Sea of Sand)

| Behaviour | Used by | Spec |
|---|---|---|
| `FireImmunity` | Ash-Walker | Takes no fire/burn DoT (typed-damage immunity; generalises to a damage-type immunity table). |
| `Untargetable` | Mirage Dancer | Timed, recurring phase where towers can't target it. |
| `SandstormCover` | Sandstorm Shaman | **One-shot**: emits a field that makes some nearby allies `Untargetable` for 2 s. |
| `DeathExplosion` | Rebel Sapper | On death, AoE that **disables/stuns** the nearest tower (never damages — towers have no HP). |
| `DamageToHeal` | Glass Sentinel | Periodic short window converting incoming damage into self-healing. |
| `ShieldMode` | Renegade Knight | Timed heavy damage reduction. |
| `GoldSteal` | Chief Rebel (boss) | Periodically drains player gold. |
| `TowerSuppressionField` | Chief Rebel sandstorm | Lowers tower range/fire-rate in an area (stun/debuff only). Supersedes the W2 "Censer trail" idea. |
| `GroupCohesion` (Caravan) | Camel Caravan | A bound group (3–4) whose members cross-heal; total heal output **scales down as members die**. |
| `Mounted` (rider) | Dune Behemoth, Giant Vulture | Visual rider + the unit's mounted profile. (Reuses `MountState`; no dismount unless a gem-carry rule applies.) |

## Behaviours introduced — World 4 (Royal Gardens)

| Behaviour | Used by | Spec |
|---|---|---|
| `SteamShield` | Royal Engineer (incl. Siege Wagon crew) | Vents a **steam cloud** giving nearby allies a brief shield / area damage-reduction. |
| `AllyShield` | Court Conjurer | Casts an absorb-bubble on **other** allies (vs. `ShieldMode` which is self-only). |
| `PropellerFlight` | Clockwork Sentinel | Mechanical flyer (propeller mode) — **water-bound like every flyer** (D-15), not free-air; LIGHTNING-vulnerable; lands while carrying a gem. |
| `OverchargePulse` | The King (boss) | "Royal Decree": temporarily mass-buffs all troops / overcharges nearby power stations. |
| `FearlessAura` | Royal Standard-Bearer | `SupportAura` variant: payload = fearless + small armor (vs. Banner-Sergeant's +speed). |

The King is a **single-life boss** (no `MULTIPLE_LIVES`) — kit = `ContinuousSummon` +
`OverchargePulse` + a timed `ShieldMode`.

### Building behaviour — `EnemyBuffStructure` (capturable)

Power stations buff enemy troops in radius. They have **no HP**; the player neutralises
them through the existing **5-stage capture**, which flips the buff **off** (or over to
the player's towers). This makes capture an active mid-map objective, not just flavour.

## Behaviours introduced — World 5 (Shadow Realm)

| Behaviour | Used by | Spec |
|---|---|---|
| `Resurrect` | Void Priest | Periodically revives a nearby dead enemy at partial HP. |
| `DeathLeech` | Soul-Eater | Heals whenever an ally dies within radius (scales with wave attrition). |
| `BlinkToGem` | Gem Shade | On gem grab, periodically short-teleports toward the gem cave. |
| `MultiPhase` | Demon Shadow King | Boss support for staged phases (kit changes per HP band). |

### Path system — `PortalShortcut` + `PortalSpawn` (Cursed Portal)

Map portals that do two things: (1) **spawn enemies** mid-track, and (2) act as a
**shortcut** — enemies route into one and emerge from another further along, skipping
part of the path. The Demon Shadow King opens these dynamically along the track.
Requires the pathing layer to support **portal links**, mid-track spawn points, and
per-enemy reroute decisions. Portals have no HP; they are navigation/spawn hazards.

### Path system — Flight lanes (water-constrained, D-15)

**All flyers are water-bound** — a flyer flies **only over water tiles**, never over land,
until the gem cave; on gem-grab it lands and walks the ground path out (D-05c / D-09).

- **Source of truth = water tiles.** Each tile carries an `airTraversable` flag from the
  terrain water layer (oasis / pond / waterway — D-05d, INVENTORY §6); no hand-drawn lane
  needed by default.
- **`AirRouteProvider`** turns water into a route:
  - **`WaterPathfinder`** (default) — grid **A\*/BFS over water tiles**, air-spawn → cave,
    run **once at spawn and cached** (TD grids are tiny — gdx-ai `IndexedAStarPathFinder` or a
    hand-rolled BFS); emits a waypoint list **smoothed** (string-pull / Catmull-Rom) into a
    polyline.
  - **`AuthoredPolyline`** (override) — a hand-drawn route for scenic/special cases.
  - Both output a **polyline consumed by the same `AirFollower`** — one follow path, no
    duplication.
- **`AirFollower` is a swappable `MovementStrategy`** on `Enemy` (sibling of `GroundFollower`).
  Gem-grab → **swap to `GroundFollower`**, snap to the cave's ground-path node, walk out slow
  + targetable.
- **Every tower hits air** (no `TargetMask`); Goblin anti-air (#4) is a damage **bonus vs
  flying**, never a gate.
- **Threat = speed:** flyer archetypes carry a high move speed (per-troop tuned, D-04); lanes
  need not be shorter than the ground path — low time-on-target is the pressure.
- **Authoring guarantees:** (1) a flyer map's water must connect spawn→cave — an **author-time
  validator** flags breaks, with a **straight-line fallback** so nothing hard-breaks; (2) the
  **cave mouth sits adjacent to a water endpoint** so flyers ride water to the very end.
- **Expandable:** new locomotion (amphibious, burrowing) = a new `MovementStrategy`; new
  routing = a new `AirRouteProvider`; the `Enemy` seam is untouched.

Affected troops: **Seraph (W2) · Giant Vulture (W3) · Clockwork Sentinel (W4)** — all
water-bound (the Sentinel's earlier free-air framing is dropped).

## Global rules (cross-cutting)

- **No enemy levels.** Each troop is one fixed, intricately-tuned `EnemyArchetype`.
  Only towers tier up (6 tiers). Transformations (Monk→Templar) are archetype swaps.
- **Rosters are shared/cumulative across worlds.** A troop introduced in one world
  (e.g. Outrider, Paladin, Pavise Guard, Knight-Lieutenant) may return in later
  worlds with the **same** design. The campaign mixes them per-map, not per-world-exclusive.
- **Every ability ships its own FX sprite** — cast, aura, sing, cleanse, taunt,
  ascension, summon, heal, frenzy, shield, etc. The animation inventory carries an
  **"Ability FX"** entry per behaviour, not just walk/ride/fly.
- **Towers have no HP.** Enemies can never damage or destroy a tower — only
  **stun / disable / debuff** it. All "anti-tower" behaviours resolve to a timed
  status on the tower, never a health change.
- **Towers are stationary.** Locked in place — **attack animation only** (no
  idle/locomotion/death; optional stun/disabled overlay). Each tier ships its **own
  attack animation + a custom projectile/beam sprite**; **no projectile is reused across
  tiers** (12 per faction). Maps onto the existing `Projectile` class, one config per tier.
- **No screen-clearing AoE.** Every area effect — towers *and* enchants — has a
  **bounded radius**; nothing clears the whole screen at once.
- **Buildings have no HP and cannot be targeted.** They are capture/objective
  structures only.
- **Flyers walk while carrying a gem.** A flying troop that grabs a gem **lands
  and follows the ground path** until it drops the gem (then may resume flight).
- **Desert maps are oases** — every Sea-of-Sand map authors **waterway lanes** so
  flying troops have routes.

## Pending design talks (user wants to discuss later)

- **Visual design + UI** — full art direction and the in-game/menu UI ("look upon
  the map like a god, the map floats above"). To be talked through.
- ~~**Waterway / flight pathing**~~ — **locked (D-15):** all flyers water-bound; water tiles
  are the source of truth, `WaterPathfinder` derives the air-lane polyline (optional hand-drawn
  override), `AirFollower` swaps to `GroundFollower` on gem-grab. See *Path system — Flight
  lanes* above.
- **Palette direction** — per-biome vs unified vs faction-accent vs purple/brown toggle. Deferred.
- **UI chrome style** — ink-line plates / carved stone / metal banners / parchment for
  the arcade-block elements (layout itself is locked, D-07). Deferred.
- **Troops deep-dive** — revisit & expand the world rosters (add/cut/re-tune, gem-carry
  variants). User flagged a cut-point to discuss troops further.
- ~~**Skills (meta-progression)**~~ — **locked (D-14, revised 2026-05-30):** 4 faction
  trees, **10 skills each × 5 tiers** (no ultimate capstone); the 6 enchants fold into their
  themed faction. Full node tables in the *Skills (meta-progression, D-14)* section above.

---

## Rendering / animation needs (World 1)

- **Ride vs walk** are distinct animation sets. Some troops need **both** and
  switch at runtime (Golden Prince). Mounted-only troops (Outrider) need ride only.
- **Aura rendering** — a visible ground ring + emitter under aura units.
- **Taunt pulse**, **invuln shimmer** — per-state overlay FX.

---

## New systems still pending from `concept.md` (later worlds)

- **Power stations** (Royal Gardens) — buildings that **buff enemy troops** in an area.
- **Holy spring** (Sea of Sand) — extends "holy water" to **boost enemies**.
- **Cursed portal** (Shadow Realm) — appears mid-level and **provides path shortcuts**.
- **Orbiting tower charges** (Holy Mountains / Crypt) — charges that orbit a temple
  and strike down — a non-standard tower fire pattern.
