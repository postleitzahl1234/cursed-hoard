# Asset Inventory — exhaustive & engine-grounded (redesign)

Every row maps to a concrete code call-site in `core/`. If a row has no consumer it is
removed, not kept. This file is **refit to the locked redesign** (4 buildable factions ·
6-tier two-split trees · ~53-archetype shared roster · 6 enchants). Old content (6 factions,
4 tiers, legacy roster, legacy biomes) is superseded.

Legend: **N** = number of distinct sprites; **F** = animation frames each.

**Locked rules that drive these counts:**
- **D-06 — towers are static, attack-only.** No idle/locomotion/death; optional shared
  stun/disabled overlay. **Every tier ships its own attack anim + its own projectile/beam**
  — no reuse across tiers. **(D-23 amends: Orc & Goblin add an 8-way rotating turret on the
  static base — base never moves; only the turret turns.)**
- **D-04(d) — every ability ships its own FX sprite** (one entry per behaviour, not just
  walk/ride/fly).
- **D-05 — no screen-clearing AoE** (every area FX bounded); **buildings have no HP / can't
  be targeted** (capture/objective only); **flyers land + walk while carrying a gem**;
  **desert maps are oases with waterway lanes**.
- **D-11 — typed damage** (PHYSICAL/MAGIC/FIRE/FROST/LIGHTNING/CURSE) + status set
  (FEAR/SLOW/STUN/BURN/CURSE) → drives the icon list.
- **D-13 — exactly 6 enchants**, player equips 2/map.

---

## 1. Towers — 4 factions × 12 silhouettes = **48**

Code seam: `TowerType` (one row per silhouette) · `Tower` (live instance; **+ optional
`turret` sub-sprite + `pivot` + `aimAngle` for Orc + Goblin gun lines, D-23/D-26**) · `TowerLore`
(almanac text) · `Projectile` (one config per tier). Tree shape per `TOWERS.md` (D-02):
2 base + 2×2 wing + 3×2 terminal. Faction damage type per D-11.

Per tower (all 48): **attack anim (F=4)** + **projectile/beam (travel F=2 + impact F=3)**.
**No** idle/locomotion/death. One **stun/disabled overlay** reused across all towers.
**Orc & Goblin (D-23):** static base **+ a rotating turret** drawn in **5 3/4 facings
(E/NE/SE/N/S, mirrored to 8)** that aims at the target — **≈18 turret sprite sets** (Orc 12 +
Goblin's 6 gun/ordnance towers), engine snaps the aim to the nearest of 8. **Goblin's drone &
bomber lines are launch platforms — no turret (D-26)**; **Crypt & Demon stay single static
sprites.** The 48-silhouette count is unchanged (the turret is a sub-component, not a new tower).

### Orc — PHYSICAL (W1 signature)
| Tier | Silhouette | Projectile/beam |
|---|---|---|
| T1 | Orc Watchpost | short bolt |
| T2 | Bolt Thrower | iron bolt |
| T3 A | Crossbow Nest | rapid bolt |
| T4 A | Ballista | ballista spear |
| T3 B | Bombard | arcing bomb |
| T4 B | Catapult | boulder |
| T5 bolt | Harpoon Cannon | barbed harpoon |
| T6 bolt | Dread Harpoon | chained dread-harpoon |
| T5 mid | Scattergun Rig | pellet spray |
| T6 mid | War Rig | triple-barrel spray |
| T5 bomb | Siege Mortar | mortar shell |
| T6 bomb | Doomsday Cannon | doomsday shell (bounded) |

### Crypt — FROST + CURSE/fear (+LIGHTNING terminal) (W2 signature)
| Tier | Silhouette | Projectile/beam |
|---|---|---|
| T1 | Crypt | descending ice charge |
| T2 | Crypt II | ice charge |
| T3 A | Frost Crypt I | frost charge |
| T4 A | Frost Crypt II | heavy frost charge |
| T3 B | Fear Crypt I | spectral charge |
| T4 B | Fear Crypt II | wraith charge |
| T5 frost | College of Frost I | orbiting frost volley |
| T6 frost | College of Frost II | orbiting frost volley+ |
| T5 mid | Lightning Crypt I | forking bolt |
| T6 mid | Lightning Crypt II | forking bolt+ |
| T5 fear | Terror Crypt I | terror wave |
| T6 fear | Terror Crypt II | terror wave+ |

Motif: charges **orbit above the crypt and strike down** (non-standard fire pattern —
the orbiting-charge render is its own FX layer, see §4 *orbiting tower charges*).

### Demon — FIRE + BURN (W3 signature)
| Tier | Silhouette | Projectile/beam |
|---|---|---|
| T1 | Imp Brazier | ember-puff burst |
| T2 | Hellforge | flame burst |
| T3 A | Hellbeam | focused flame beam |
| T4 A | Searing Lance | lance beam (pierces 2nd) |
| T3 B | Hellfire Pyre | flame nova (burst) |
| T4 B | Pyroclasm Altar | wide flame nova (burst) |
| T5 beam | Abyssal Ray | piercing ray |
| T6 beam | Doomray | piercing ray+ (fire-vuln debuff FX) |
| T5 mid | Brimstone Battery | firebomb + ground patch |
| T6 mid | Magma Mortar | lava splash + ground patch (fast-fire) |
| T5 pyre | Lake of Fire | continuous bounded burn field |
| T6 pyre | Infernal Caldera | continuous burn field+ |

Beam wing = **continuous** (ramps on held target); Pyre wing = **short bursts** until
T5/T6 go **continuous**. Magma Mortar shots **leave bounded long-burning ground patches**
(ground-fire decal is its own FX, see §4).

### Goblin — PHYSICAL · engineering (W4 signature)
| Tier | Silhouette | Projectile/beam |
|---|---|---|
| T1 | Goblin Workshop | spanner-bolt |
| T2 | Tinker Tower | bolt |
| T3 A | Drone Bay | drone bolt (1–2 drones) |
| T4 A | Drone Swarm | drone bolt+ |
| T3 B | Gatling Turret | gatling round |
| T4 B | Spike Cannon | spike shell |
| T5 drone | Drone Foundry | swarm drone bolts |
| T6 drone | Sky Carrier | swarm drone bolts+ |
| T5 mid | Bomber Drone | dropped bombs + strike anim |
| T6 mid | Carpet Bomber | bomb-string + large strike anim |
| T5 ord | Auger Cannon | drill-round (armor-shred) |
| T6 ord | Doom Driller | drill-round+ (stacking shred) |

**Drone special (D-26):** the drone-wing + Bomber towers are **static launch platforms — no
rotating turret**; they spawn **autonomous drone actors** that appear only when enemies are on
the lane, fly home + vanish when clear, and **upgrade per tier (distinct design each tier)**.
Drone = its own animated actor (fly + attack), separate from the tower sprite. **Bomber drones
differ from attack drones** — Bomber/Carpet = a **slow, heavily-animated bombing-run** airship
actor dropping bounded bombs.

> **Drone/bomber actors** are extra animated sprites beyond the 48 tower silhouettes:
> ~4 drone variants (Bay → Swarm → Foundry → Sky Carrier escalation) + 2 bomber-drone
> variants (Bomber → Carpet), each fly (F=4) + attack/drop (F=4).

**Tower subtotal:** 48 attack anims + 48 projectile/beam sets + 1 stun overlay
+ ~18 turret facing-sets (Orc + Goblin gun lines, D-23/D-26) + ~6 drone/bomber actors.

## 2. Projectiles / beams — folded into §1 (48, one per tier)

There is **no shared projectile pool** (D-06). Each of the 48 tiers owns a unique
`Projectile` config (travel F=2 + impact burst F=3). Demon beams are the per-tier
equivalent (beam core + tip glow). Listed inline in §1.

## 3. Enemies — **53 archetypes** (regulars + champions + bosses)

Code seam (proposed): `EnemyArchetype` (immutable data + behaviour list) · `Enemy` (live
instance) · `List<EnemyBehavior>`. Roster is **shared/cumulative** (D-04b) — a troop is
authored **once** and reused across worlds; returning units are not re-counted.

Per archetype (**D-06, amended D-25**): **idle (F=2)** + **locomotion (F=4)** +
**death (F=2–4)** (+ **ability/cast** where the unit has one — FX in §4); **no attack animation**.
**Locomotion = walk** unless noted **ride** (mounted) or **fly**.
Dual-mode units (gem-carry dismount, flyer-land) need a **2nd locomotion set**. Ability
FX are listed in §4 (one sprite per behaviour, D-04d).

**Distinct creature each (D-28):** every archetype is its own silhouette/species — **never one
humanoid base recoloured**; species match the world; wave-mates must read apart as black shapes at
32 px. ("Shared/cumulative" = the **same** unit recurs across worlds, not one body reused for
different units.)

### W1 · Great Grasslands — The General's Host (10 new)
| Archetype | Locomotion | Extra set | Ability FX (→§4) |
|---|---|---|---|
| Peasant | walk | – | – |
| Guard | walk | – | – |
| Outrider | ride | – | – |
| Knight | walk | – | – |
| Paladin | walk | – | – |
| Banner-Sergeant | walk | – | support-aura ring + banner pulse |
| Pavise Guard | walk | – | taunt pulse |
| Knight-Lieutenant *(champ)* | walk | – | invuln shimmer |
| Golden Prince *(carrier)* | ride | **+walk** (dismount) | – |
| ★ The General *(boss)* | walk | – | summon/cast |

### W2 · Holy Mountains — High Priest's Procession (10 new)
*Returning (already counted): Outrider · Paladin · Knight-Lieutenant · Pavise Guard.*
| Archetype | Locomotion | Extra set | Ability FX (→§4) |
|---|---|---|---|
| Acolyte | walk | – | – |
| Flagellant | walk | – | blood-frenzy aura |
| Bard | walk | – | **sing** anim + musical-note buff ring |
| Temple Guard | walk | – | – |
| War Cleric | walk | – | holy heal-glow aura |
| Inquisitor | walk | – | purifying cleanse flash |
| Monk | walk | – | ascension/transform light pillar |
| Templar *(champ; Monk ascended)* | walk | – | invuln shimmer + reflect flash |
| Seraph *(flyer)* | fly | **+walk** (gem-carry) | – |
| ★ The High Priest *(boss)* | walk | – | cast/summon + cleanse + invuln shimmer |

### W3 · Sea of Sand — Chief Rebel's Warband (12 new)
| Archetype | Locomotion | Extra set | Ability FX (→§4) |
|---|---|---|---|
| Sand Raider | walk | – | – |
| Dune Nomad | walk | – | – |
| Ash-Walker | walk | – | ember-immune shimmer |
| Mirage Dancer | walk | – | vanish / mirage blink |
| Sandstorm Shaman | walk | – | sandstorm field |
| Dune Behemoth *(+rider)* | ride (lumber) | – | rider visual |
| Rebel Sapper | walk | – | death blast |
| Glass Sentinel | walk | – | absorb-heal glow |
| Giant Vulture *(+rider, flyer)* | fly | **+walk** (carry) | rider visual |
| Camel Caravan *(group 3–4)* | walk | group render | mutual-heal link |
| Renegade Knight *(champ)* | walk | – | shield mode |
| ★ The King's Chief Rebel *(boss)* | walk | – | sandstorm/summon cast + gold-steal |

### W4 · Royal Gardens — King's Royal Guard (11 new)
| Archetype | Locomotion | Extra set | Ability FX (→§4) |
|---|---|---|---|
| Household Guard | walk | – | – |
| Kingsguard | walk | – | – |
| Royal Engineer | walk | – | steam-shield cloud |
| Court Conjurer | walk | – | ally-shield bubble |
| Clockwork Sentinel *(can fly)* | walk (mech) | **+propeller fly** | LIGHTNING-vuln (no FX) |
| Royal Standard-Bearer | walk | – | fearless-banner aura |
| Royal Falconer *(+hawk, flyer)* | fly | **+walk** (carry) | hawk/rider visual |
| Royal Prince *(+horse, carrier)* | ride | **+walk** (dismount) | – |
| Siege Wagon *(+crew)* | walk (roll) | crew render | steam-shield (crew) |
| Lord-Commander *(champ)* | walk | – | rally + shield mode |
| ★ The King *(boss, 1 life)* | walk | – | decree/overcharge + summon + shield |

### W5 · Shadow Realm — The Shadow Legion (10 new)
| Archetype | Locomotion | Extra set | Ability FX (→§4) |
|---|---|---|---|
| Shadow Wraith | walk | – | phase-flicker (untargetable) |
| Cursed Soldier | walk | – | – |
| Imp Swarm *(flyer)* | fly | **+walk** (carry) | – |
| Hellhound | walk (lope) | – | fire-immune (no FX) |
| Void Priest | walk | – | resurrect |
| Abyssal Behemoth *(+rider)* | ride | – | rider visual |
| Soul-Eater | walk | – | death-leech |
| Gem Shade *(carrier)* | walk | – | blink-to-gem |
| Doom Knight *(champ)* | walk | – | shield + reflect |
| ★ The Demon Shadow King *(final boss)* | walk | **reuses King base, corrupted** | portal + darkness + summon casts |

**Enemy subtotal:** 53 archetypes × (idle+death, +cast where applicable; **no attack — D-25**) + locomotion sets. Extra
locomotion sets: ride (Outrider, Golden Prince, Dune Behemoth, Royal Prince, Abyssal
Behemoth) + fly (Seraph, Giant Vulture, Royal Falconer, Clockwork propeller, Imp Swarm).
**+walk** dual sets: Golden Prince, Seraph, Giant Vulture, Royal Falconer, Royal Prince,
Imp Swarm, Clockwork (7). Shadow King recolors King's base (saves a full set).

## 4. Enemy ability / behaviour FX — **one sprite per behaviour** (D-04d)

Each maps to an `EnemyBehavior` (see `SYSTEMS.md`). Shared FX listed once with sharers;
F=4–6 each.

| FX sprite | Behaviour | Used by |
|---|---|---|
| support-aura ground ring | `SupportAura`/`FearlessAura` | Banner-Sergeant, Royal Standard-Bearer |
| banner pulse | (aura emitter) | Banner-Sergeant, Royal Standard-Bearer |
| taunt pulse | `Taunt` | Pavise Guard |
| invuln shimmer | `ThresholdInvuln` | Knight-Lieutenant, Templar, High Priest |
| reflect flash | (reflect) | Templar, Doom Knight |
| blood-frenzy aura | `Frenzy` | Flagellant |
| sing note-ring | `StationaryPerformer` | Bard |
| holy heal-glow aura | `HealAura` | War Cleric |
| purifying cleanse flash | `CleanseAura` | Inquisitor, High Priest |
| ascension light pillar | `PathProgressTransform` | Monk→Templar |
| ember-immune shimmer | `FireImmunity` | Ash-Walker |
| vanish / mirage blink | `Untargetable` | Mirage Dancer |
| phase-flicker | `Untargetable` (shadow) | Shadow Wraith |
| sandstorm field | `SandstormCover`/`TowerSuppressionField` | Sandstorm Shaman, Chief Rebel |
| death blast | `DeathExplosion` | Rebel Sapper |
| absorb-heal glow | `DamageToHeal` | Glass Sentinel |
| shield-mode bubble | `ShieldMode` | Renegade Knight, Lord-Commander, Doom Knight, King |
| mutual-heal link | `GroupCohesion` | Camel Caravan |
| steam-shield cloud | `SteamShield` | Royal Engineer, Siege Wagon crew |
| ally-shield bubble | `AllyShield` | Court Conjurer |
| overcharge/decree pulse | `OverchargePulse` | The King |
| resurrect | `Resurrect` | Void Priest |
| death-leech | `DeathLeech` | Soul-Eater |
| blink-to-gem | `BlinkToGem` | Gem Shade |
| rally | (rally) | Lord-Commander |
| gold-steal | `GoldSteal` | Chief Rebel |
| summon/cast burst | `ContinuousSummon`/`ThresholdSummon` | all 5 bosses (per-boss accent) |
| portal open/active | `PortalSpawn`/`PortalShortcut` | Shadow King, Cursed Portal |
| darkness tower-disable cloud | `MultiPhase` darkness | Shadow King |

≈ **29 distinct ability-FX sprites.** Plus the **orbiting tower-charge** render layer
(Crypt fire pattern) and the **ground-fire decal** (Demon Magma Mortar / Lake of Fire).

## 5. Enchants — player-side, **6** (D-13)

Code seam (proposed): `EnchantType` data row + composable `EnchantEffect` (refactor of
legacy `Spell`). Player equips **2/map**. No cooldown — mana-gated. Each = **1 icon
(48×48, see §10)** + **cast/impact FX (F=4–6)**.

| Enchant | Cast | FX sprite |
|---|---|---|
| Meteor | POINT_AOE | meteor fall + impact · **+ lava pool (skills-gated, deferred)** |
| Fear | POINT_AOE | dread ring |
| Freeze | POINT_AOE | ice burst |
| Gem Ward | ENEMY_TARGET | chain-yank recall |
| Cursed Tribute | GLOBAL (timed) | gold aura |
| Dark Overcharge | TOWER_TARGET/AOE | dark surge (on towers) |

## 6. Terrain — 5 biomes

Code seam: `TerrainV2Data` lookup (base + path + obstacle variants). Obstacles are
**connectable** cluster tiles. Water/void tiles are **flight-lane / hazard** layers.

| World | Base | Path | Obstacle (connectable) | Special layer |
|---|---|---|---|---|
| Great Grasslands | grass | earthen | oak woods | – |
| Holy Mountains | holy-stone / snow-dusted peak | stone | pine/peak crag *(concept Design blank — confirm)* | **frozen river / glacial melt** (AQ/IC) — flight lane for the Seraph (D-15) |
| Sea of Sand | sand / dune | sandy | cacti / palm cluster | **oasis waterway** (flight lanes, D-05) |
| Royal Gardens | manicured lawn | garden | hedge / topiary | **pond / canal** (flight lanes) |
| Shadow Realm | void floor | shadow | corrupted hexwood / purple crystal | **cursed waterway** — void-tainted water (AQ + CR/HX tint, IK void edge) — flight lane for the Imp Swarm (D-15a) |

## 7. Buildings — 10 world + gem cave

Code seam: `Building` (no HP, capture/objective only, D-05). Capturable buildings get
**5-stage capture art**. Per world (per `concept.md`):

| World | Buildings | Notes |
|---|---|---|
| Great Grasslands | Village · Castle | 5-stage capture each |
| Holy Mountains | Tavern · Holy Citadel | 5-stage capture each |
| Sea of Sand | Palm Spring · Desert Stronghold | 5-stage capture each |
| Royal Gardens | Kings Laboratory · **Kings Power Station** | Power Station = `EnemyBuffStructure` (buffs enemies in radius); 5-stage capture flips the buff off / to player |
| Shadow Realm | Shadow Pool · **Cursed Portal** | Portal = `PortalSpawn`+`PortalShortcut`, mid-level hazard; **open/active states**, not capture |
| (all) | **Gem Cave** | the hoard you defend; displays gems (§8) |

## 8. Gems — 5

`ruby · emerald · sapphire · yellow_topaz · amethyst`. Idle pulse (F=4) + pickup sparkle
(F=4). Carried-gem overlay rides the carrier (gem-carry, D-09).

## 9. UI chrome — D-07 arcade-block layout

"Look upon the map like a god" — **map floats above a dark background**. Every UI element
is an **independent raised 3D block** (bevel/shadow, arcade-button look), floating
separately. Layout: **resources top · wave queue right · enchants + tower-build bottom**.
Chrome blocks to author:
- top resource bar block (gold · mana · gem-count/lives)
- right wave-queue rail (per-wave chips)
- bottom-left **enchant slots** (2 equipped)
- bottom-right **tower-build palette** (4 factions)
- tower **upgrade / sell** radial (on select; shows tier branches)
- generic raised-block 9-slice + bevel/shadow frame (shared)

*(Chrome visual style — ink-line plate vs carved stone vs metal — deferred per
`SYSTEMS.md`; layout is locked.)*

## 10. UI icons — 48×48, single frame

`gold · mana · gem (lives) · wave · star · star_filled · star_locked · lock ·
upgrade_arrow · sell_coin · pause · play · range · speed · armor/shield`
**+ enchant icons (6):** `meteor · fear · freeze · gem_ward · cursed_tribute · dark_overcharge`
**+ damage-type (6, D-11):** `physical · magic · fire · frost · lightning · curse`
**+ status (5, D-11):** `feared · slowed · stunned · burning · cursed`
≈ **32 icons.**

## 11. Screen backgrounds — 2560×1440

`bg_menu · bg_settings · bg_almanac · bg_skilltree` *(skilltree deferred)* `· bg_loading`
**+ bg_level_select ×5** (Grasslands · Mountains · Sand · Gardens · Shadow). ≈ **10.**

## 12. World & level-select art

- **5 world cards** (512×384 hero illustration, one per world).
- **25 level nodes** (192×192, conveys biome + gimmick) — one per map.
- node-ring states: `node_unlocked · node_locked · node_star3 · signpost · banner`.

## 13. Skill icons — locked (D-14): reuse only, no bespoke

**4 faction trees × 10 skills = 40 nodes**, every node **5 ranks** (`Skill` data;
`SkillTreeScreen` UI). All nodes **reuse `UI_ICONS`** keys (sword · range · speed · gold ·
mana · bomb · crit · skulltree · freeze_icon · curse_icon · meteor_icon …) **+ the 6
enchant icons** (§10) for the enchant-upgrade nodes — **no new art at all**. The earlier 4
ultimate capstones are **cut**, so **no bespoke skill icons are needed**. Witch/Beast skill
nodes deleted (D-01).

## 14. Particles / shared FX — 8

`arrow · bone · spark · smoke · blood · explosion · magic_glow · soul`. F=4 (loop or
one-shot). Generic, reused across factions.

## 15. Loading & boot

Loading-bar 9-slice + fill texture · one title splash (1536×384).

## 16. Maps — 25 (Claude authors)

Five worlds × five levels, authored in the Map Builder from the new tiles (§6), dropped
into `assets/custom_maps/`, imported via `MapsV2Data`/`MapDef`/`WorldDef`. **W3 (Sea of
Sand) + W4 (Royal Gardens) maps must author waterway/pond flight lanes** (D-05). See
`MAPS.md` (**drafted** — 25 per-level briefs) for the per-map design.

---

## Sprite totals at the **minimum** density tier

- **Towers (§1–2):** 48 attack anims + 48 projectile/beam sets + 1 stun overlay
  + ~18 turret facing-sets (Orc + Goblin gun lines, D-23/D-26) + ~6 drone/bomber actors.
- **Enemies (§3):** 53 archetypes — idle + death each (+ ability/cast where applicable;
  **no attack, D-25**), + locomotion (walk/ride/fly) + ~7 dual locomotion sets; Shadow King recolors King.
- **Ability FX (§4):** ~29 + orbiting-charge layer + ground-fire decal.
- **Enchants (§5):** 6 icons + 6 cast/impact FX (+ lava pool, skills-gated).
- **Terrain (§6):** 5 biomes × (base + path + obstacle) + 3 special layers (oasis,
  pond, void).
- **Buildings (§7):** 8 capturable × 5 stages + Power Station (5) + Cursed Portal
  (states) + Gem Cave.
- **Gems (§8):** 5 × (idle + pickup).
- **UI (§9–12):** chrome block set + ~32 icons + ~10 backgrounds + 5 world cards
  + 25 nodes + ring states.
- **Shared (§14–15):** 8 particles + loading/boot.
- **Skills (§13):** deferred.

Final counts shift as maps (§16) and the skills tree (§13) are designed.
