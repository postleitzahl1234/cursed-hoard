# Asset Inventory (design extract) — what to make

> **Design extract** of `../INVENTORY.md`, trimmed to the what-to-make lists (the root original
> also carries the per-row engine "code seam" call-sites you don't need). Root is the source of
> truth and the **utilisation checklist** the QA gate runs against. Section numbers match the root.

Legend: **N** = number of distinct sprites; **F** = animation frames each.

**Locked rules that drive these counts:**
- **D-06** — towers are **static, attack-only**; optional shared stun overlay; **every tier ships
  its own attack anim + its own projectile/beam** (no reuse). **(D-23: Orc & Goblin add an 8-way
  rotating turret on the static base.)**
- **D-04(d)** — **every ability ships its own FX sprite** (one per behaviour).
- **D-05** — **no screen-clearing AoE** (bounded); buildings have **no HP**; flyers **land + walk**
  carrying a gem; desert maps are oases with waterway lanes.
- **D-11** — typed damage (PHYSICAL/MAGIC/FIRE/FROST/LIGHTNING/CURSE) + status (FEAR/SLOW/STUN/
  BURN/CURSE) → drives the icon list.
- **D-13** — exactly **6 enchants**, player equips 2/map.

---

## 1. Towers — 4 factions × 12 silhouettes = **48**

Per tower (all 48): **attack anim (F=4)** + **projectile/beam (travel F=2 + impact F=3)**. **No**
idle/locomotion/death. One **stun/disabled overlay** reused across all towers. **Orc & Goblin
(D-23):** static base **+ a rotating turret** in **5 3/4 facings (E/NE/SE/N/S, mirrored to 8)** —
**≈18 turret sets** (Orc 12 + Goblin 6 gun lines; **Goblin drone/bomber = launch platforms, no
turret, D-26**), engine snaps aim to nearest; **Crypt & Demon stay single sprites**
(48-silhouette count unchanged). Tree shape + per-tower visual intent in `TOWERS.md`.

### Orc — PHYSICAL (W1)
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

### Crypt — FROST + CURSE/fear (+LIGHTNING terminal) (W2)
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

Motif: charges **orbit above the crypt and strike down** — the orbiting-charge render is its own
FX layer (see §4).

### Demon — FIRE + BURN (W3)
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

Beam wing = **continuous** (ramps on held target); Pyre wing = **short bursts** until T5/T6 go
**continuous**. Magma Mortar shots **leave bounded long-burning ground patches** (ground-fire
decal is its own FX, see §4).

### Goblin — PHYSICAL · engineering (W4)
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

**Drone/bomber actors** (extra animated sprites beyond the 48 towers; the drone & bomber **towers
are launch platforms — no turret, D-26**): ~4 drone variants (Bay → Swarm → Foundry → Sky Carrier,
**distinct design per tier**) + 2 **bomber** variants (Bomber → Carpet, **differ from attack
drones**), each **fly (F=4) + attack/drop (F=4)**. Drones appear only when enemies are on the lane,
fly home + vanish when clear.

**Tower subtotal:** 48 attack anims + 48 projectile/beam sets + 1 stun overlay + ~18 turret facing-sets (Orc + Goblin gun lines, D-23/D-26) + ~6 drone/bomber actors.

## 2. Projectiles / beams — folded into §1 (48, one per tier)
No shared pool (D-06): each tier owns a unique projectile (travel F=2 + impact F=3). Demon beams =
the per-tier equivalent (beam core + tip glow).

## 3. Enemies — **53 archetypes**

Per archetype (**D-06, amended D-25**): **idle (F=2)** + **locomotion (F=4)** + **death (F=2–4)**
(+ **ability/cast** where it has one — FX in §4); **no attack animation**.
Locomotion = **walk** unless noted **ride** (mounted) or **fly**. Dual-mode units (gem-carry
dismount, flyer-land) need a **2nd locomotion set** (the **+walk** column). Roster is
shared/cumulative — author once, reuse; returning units aren't re-counted. Visual traits +
sub-style in `concept.md`; role/identity in `TROOPS.md`.

**Distinct creature each (D-28):** every archetype is its own silhouette/species — **never one
humanoid base recoloured**; species match the world; wave-mates read apart as black shapes at 32 px.
("Author once, reuse" = the **same** unit recurs across worlds, **not** one body reused for
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

**Extra locomotion:** ride (Outrider, Golden Prince, Dune Behemoth, Royal Prince, Abyssal Behemoth)
+ fly (Seraph, Giant Vulture, Royal Falconer, Clockwork propeller, Imp Swarm). **+walk** dual sets:
Golden Prince, Seraph, Giant Vulture, Royal Falconer, Royal Prince, Imp Swarm, Clockwork (7).
Shadow King recolors King's base.

## 4. Enemy ability / behaviour FX — **one sprite per behaviour** (D-04d)

Shared FX listed once with sharers; **F=4–6** each.

| FX sprite | Used by |
|---|---|
| support-aura ground ring | Banner-Sergeant, Royal Standard-Bearer |
| banner pulse | Banner-Sergeant, Royal Standard-Bearer |
| taunt pulse | Pavise Guard |
| invuln shimmer | Knight-Lieutenant, Templar, High Priest |
| reflect flash | Templar, Doom Knight |
| blood-frenzy aura | Flagellant |
| sing note-ring | Bard |
| holy heal-glow aura | War Cleric |
| purifying cleanse flash | Inquisitor, High Priest |
| ascension light pillar | Monk→Templar |
| ember-immune shimmer | Ash-Walker |
| vanish / mirage blink | Mirage Dancer |
| phase-flicker | Shadow Wraith |
| sandstorm field | Sandstorm Shaman, Chief Rebel |
| death blast | Rebel Sapper |
| absorb-heal glow | Glass Sentinel |
| shield-mode bubble | Renegade Knight, Lord-Commander, Doom Knight, King |
| mutual-heal link | Camel Caravan |
| steam-shield cloud | Royal Engineer, Siege Wagon crew |
| ally-shield bubble | Court Conjurer |
| overcharge/decree pulse | The King |
| resurrect | Void Priest |
| death-leech | Soul-Eater |
| blink-to-gem | Gem Shade |
| rally | Lord-Commander |
| gold-steal | Chief Rebel |
| summon/cast burst | all 5 bosses (per-boss accent) |
| portal open/active | Shadow King, Cursed Portal |
| darkness tower-disable cloud | Shadow King |

≈ **29 distinct ability-FX sprites.** Plus the **orbiting tower-charge** layer (Crypt) and the
**ground-fire decal** (Demon Magma Mortar / Lake of Fire). Behaviour detail in `../SYSTEMS.md`.

## 5. Enchants — player-side, **6** (D-13)

Player equips **2/map**, mana-gated (no cooldown). Each = **1 icon (48×48, §10)** +
**cast/impact FX (F=4–6)**.

| Enchant | FX sprite |
|---|---|
| Meteor | meteor fall + impact · **+ lava pool (skills-gated, deferred)** |
| Fear | dread ring |
| Freeze | ice burst |
| Gem Ward | chain-yank recall |
| Cursed Tribute | gold aura |
| Dark Overcharge | dark surge (on towers) |

## 6. Terrain — 5 biomes (full auto-edge, D-19)

Obstacles are **static connectable clusters**; base/path are **autotile bitmask sets**;
water/void = flight-lane / hazard layers. Per-world palette ramps in `STYLEGUIDE.md §4`.

| World | Base | Path | Obstacle (connectable) | Special layer |
|---|---|---|---|---|
| Great Grasslands | grass | earthen | oak woods | – (optional stream) |
| Holy Mountains | holy-stone / snow-dusted peak | stone | pine/peak crag | **frozen river / glacial melt** (AQ/IC) — Seraph flight lane (D-15) |
| Sea of Sand | sand / dune | sandy | cacti / palm cluster | **oasis waterway** — Giant Vulture flight lane (D-05) |
| Royal Gardens | manicured lawn | garden | hedge / topiary | **pond / canal** — Falconer + Sentinel flight lane |
| Shadow Realm | void floor | shadow | corrupted hexwood / purple crystal | **cursed waterway** — void-tainted water (AQ + CR/HX tint, IK void edge) — Imp Swarm flight lane (D-15a) |

## 7. Buildings — 10 world + gem cave

No HP, capture/objective only (D-05). Capturable buildings get **5-stage capture art**.

| World | Buildings | Notes |
|---|---|---|
| Great Grasslands | Village · Castle | 5-stage capture each |
| Holy Mountains | Tavern · Holy Citadel | 5-stage capture each |
| Sea of Sand | Palm Spring · Desert Stronghold | 5-stage capture each |
| Royal Gardens | Kings Laboratory · **Kings Power Station** | Power Station buffs enemies in radius; 5-stage capture flips the buff |
| Shadow Realm | Shadow Pool · **Cursed Portal** | Portal = mid-level hazard, **open/active states**, not capture |
| (all) | **Gem Cave** | the hoard you defend; displays gems (§8) |

## 8. Gems — 5

`ruby · emerald · sapphire · yellow_topaz · amethyst`. **Idle pulse (F=4)** + **pickup sparkle
(F=4)** + **carried-gem overlay** that rides the carrier (D-09).

## 9. UI chrome — D-07 arcade-block layout

**Map floats above a dark background**; every UI element is an **independent raised 3D block**
(bevel/shadow, arcade-button look), floating separately. Layout: **resources top · wave queue
right · enchants + tower-build bottom**. Blocks to author:
- top resource bar block (gold · mana · gem-count/lives)
- right wave-queue rail (per-wave chips)
- bottom-left **enchant slots** (2 equipped)
- bottom-right **tower-build palette** (4 factions)
- tower **upgrade / sell** radial (on select; shows tier branches)
- generic raised-block **9-slice** + bevel/shadow frame (shared)

Style = carved-stone gothic-night (STYLEGUIDE §2).

## 10. UI icons — 48×48, single frame

`gold · mana · gem (lives) · wave · star · star_filled · star_locked · lock · upgrade_arrow ·
sell_coin · pause · play · range · speed · armor/shield`
**+ enchant (6):** `meteor · fear · freeze · gem_ward · cursed_tribute · dark_overcharge`
**+ damage-type (6):** `physical · magic · fire · frost · lightning · curse`
**+ status (5):** `feared · slowed · stunned · burning · cursed`
≈ **32 icons.**

## 11. Screen backgrounds — 2560×1440

`bg_menu · bg_settings · bg_almanac · bg_skilltree` *(skilltree deferred)* `· bg_loading`
**+ bg_level_select ×5** (Grasslands · Mountains · Sand · Gardens · Shadow). ≈ **10.**

## 12. World & level-select art
- **5 world cards** (512×384 hero illustration, one per world).
- **25 level nodes** (192×192, conveys biome + gimmick) — one per map.
- node-ring states: `node_unlocked · node_locked · node_star3 · signpost · banner`.

## 13. Skill icons — **0 bespoke** (D-14)
4 faction trees × 10 skills = 40 nodes, every node 5 ranks. All nodes **reuse `UI_ICONS`** + the
**6 enchant icons** (§10). The 4 ultimate capstones are cut → **no new skill art**.

## 14. Particles / shared FX — 8
`arrow · bone · spark · smoke · blood · explosion · magic_glow · soul`. F=4 (loop or one-shot).
Generic, reused across factions.

## 15. Loading & boot
Loading-bar **9-slice** + fill texture · one **title splash (1536×384)**.

## 16. Maps — 25 (composition task, see brief §6)
Five worlds × five levels, authored in the Map Builder from the §6 tiles. **W3 + W4 maps must
author waterway/pond flight lanes** (D-05); every flyer world needs a water route (D-15/D-15a).
Per-level briefs in `../MAPS.md` (**drafted**).

---

## Sprite totals (minimum density)
- **Towers:** 48 attack anims + 48 projectile/beam sets + 1 stun overlay + ~18 turret facing-sets (Orc + Goblin gun lines, D-23/D-26) + ~6 drone/bomber actors.
- **Enemies:** 53 archetypes (idle+death each, +ability/cast where applicable; **no attack, D-25**) + locomotion (walk/ride/fly) + ~7 dual sets.
- **Ability FX:** ~29 + orbiting-charge layer + ground-fire decal.
- **Enchants:** 6 icons + 6 cast/impact FX (+ lava pool, skills-gated).
- **Terrain:** 5 biomes × auto-edge set (base+path bitmask + obstacle clusters) + per-world water special.
- **Buildings:** 8 capturable × 5 stages + Power Station + Cursed Portal (states) + Gem Cave.
- **Gems:** 5 × (idle + pickup + carried overlay).
- **UI:** chrome block set + ~32 icons + ~10 backgrounds + 5 world cards + 25 nodes + ring states.
- **Shared:** 8 particles + loading/boot.
- **Skills:** no bespoke art.
