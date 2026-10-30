# Campaign Maps — the 25 per-level briefs

The concrete **25 maps** (5 worlds × 5 levels) that fill in the **5 knobs** from the map-design
brief (`instructions for claude design/claude_design_instructions.md` §6): **world/biome · path
shape · gem count · boss · gimmick**. Biome tiles + buildings + flight media come from
`INVENTORY.md` §6/§7 and `concept.md`; bosses + rosters from `concept.md`.

**Status:** **[DRAFT]** — the *arc, gimmicks, path shapes and gem counts are a first pass to tune.*
The **structure** (5 worlds, level-5 = boss, flyer worlds need water lanes) is locked by D-10/D-15.

**Scope:** this is the **spatial / map** spec (layout + objective + flight lane). **Per-wave enemy
composition is authored separately in the Wave Builder** from the `concept.md` rosters — MAPS.md
only notes which *pressure* each level introduces (the roster ramps per `concept.md`).

**Pipeline:** built in the **Map Builder** (paint terrain by role — base/path/obstacle/special, D-19
autotile) → export to `assets/custom_maps/<name>` → import via `MapsV2Data`/`MapDef`/`WorldDef`.

---

## Global conventions

- **Grid:** 32×30 cells @ 32 px logical (world 1024×960), framed by the HUD (D-07).
- **Lane:** every map runs **spawn → Gem Cave**; the cave terminates the lane and displays the
  hoard (D-09). The spawn→cave lane must read instantly (brief §6.3).
- **Gems (D-31):** every map holds **exactly 5 gems**. Stars: **3★** no enemy ever touches a gem ·
  **2★** all 5 retained at the end · **1★** ≥1 kept · **lose all 5 = level failed.**
- **Build cells** visibly distinct from path + obstacle; **obstacles = connectable clusters**.
- **All towers buildable on every map** (D-01) — the "world signature" family is theme/enemy
  flavour, not a build restriction.
- **Flight lanes (D-15):** any map whose world fields a flyer **must** paint a continuous **water
  route** spawn→cave (cave mouth adjacent to a water endpoint). Per-world water medium below.
- **Difficulty + roster escalate** L1→L5 and W1→W5 (`concept.md`). L5 of each world = **boss map**
  (D-10); no boss on L1–L4.
- **Utilisation:** every terrain tile + building authored in INVENTORY §6/§7 must appear in ≥1 map.

---

## W1 · Great Grasslands — The General's Host
Biome: grass / earthen path / oak-wood obstacles · **no flyer** (no water route needed) · Buildings:
**Village · Castle** · Boss: **The General**. Roster: human army (Peasant→Knight/Paladin→Pavise/
Banner-Sergeant→Golden Prince).

| Lvl | Name | Path shape | Gems | Flight | Gimmick / objective |
|---|---|---|---|:--:|---|
| 1 | First Muster | single gentle S-lane | 5 | – | tutorial-open; learn build/upgrade vs fodder |
| 2 | The Oak Line | single lane threading oak clusters | 5 | – | obstacle-dense placement puzzle (tight build cells) |
| 3 | Village Hold | two lanes merging at the cave | 5 | – | capturable **Village** (economy bonus) |
| 4 | Castle Approach | split (2 independent spawns) | 5 | – | capturable **Castle**; heavy-armor push (Knight/Paladin/Pavise taunt) |
| 5 | The General's Stand ★ | wide arena lane | 5 | – | **Boss: The General** (phased summoner — Knights → Lieutenant burst) |

## W2 · Holy Mountains — The High Priest's Procession
Biome: holy-stone / snow / stone path / pine-crag · Flyer: **Seraph** · Water: **frozen river /
glacial melt** (AQ/IC) · Buildings: **Tavern · Holy Citadel** · Boss: **The High Priest**. Roster:
clergy/zealots (fear-immune, cleansers, healers).

| Lvl | Name | Path shape | Gems | Flight | Gimmick / objective |
|---|---|---|---|:--:|---|
| 1 | Pilgrim's Path | single winding stone lane | 5 | – | clergy fodder; fear-immune intro (Crypt fear less reliable) |
| 2 | Glacial Melt | lane beside a frozen river | 5 | ✅ | **Seraph flyer** introduced → water lane required |
| 3 | Tavern Rest | split lane | 5 | ✅ | capturable **Tavern**; cleansers undo frost/curse |
| 4 | Citadel Climb | long S-lane + peak crags | 5 | ✅ | capturable **Holy Citadel**; combined air + heavy-armor |
| 5 | The High Priest ★ | twin lanes + central glacial pool | 5 | ✅ | **Boss: The High Priest** (cleanse/heal/invuln adds) |

## W3 · Sea of Sand — The Chief Rebel's Raiders
Biome: sand / dune / sandy path / cacti-palm · Flyer: **Giant Vulture** · Water: **oasis waterway**
(D-05d) · Buildings: **Palm Spring · Desert Stronghold** · Boss: **King's Chief Rebel**. Roster:
camel-riders, sandstorm shamans, Dune Behemoth.

| Lvl | Name | Path shape | Gems | Flight | Gimmick / objective |
|---|---|---|---|:--:|---|
| 1 | Dune Crossing | single sandy lane | 5 | – | camel-rider raiders; mobility intro |
| 2 | The Oasis | lane wrapping an oasis waterway | 5 | ✅ | **Giant Vulture flyer** → water lane required |
| 3 | Palm Spring | two lanes | 5 | ✅ | capturable **Palm Spring**; **Sandstorm Shaman** (tower-suppression field) |
| 4 | Raider's Gauntlet | split + long lanes | 5 | ✅ | capturable **Desert Stronghold**; **Dune Behemoth** tank wall |
| 5 | The Chief Rebel ★ | open oasis arena | 5 | ✅ | **Boss: Chief Rebel** (summons Behemoths + Sand Raiders; **gold-steal** economy pressure) |

## W4 · Royal Gardens — His Majesty's Court
Biome: manicured lawn / garden path / hedge-topiary · Flyers: **Royal Falconer + Clockwork
Sentinel** · Water: **pond / canal** · Buildings: **Kings Laboratory · Kings Power Station**
(buffs enemies in radius) · Boss: **His Majesty the King**. Roster: court, engineers, clockwork
(lightning-vulnerable), shielders.

| Lvl | Name | Path shape | Gems | Flight | Gimmick / objective |
|---|---|---|---|:--:|---|
| 1 | Garden Gate | single manicured lane | 5 | – | court fodder; shielders intro |
| 2 | The Canal | lane along a pond/canal | 5 | ✅ | **Falconer + Clockwork Sentinel** flyers → water lane required |
| 3 | Power Station | split lane | 5 | ✅ | **Kings Power Station** buffs enemies in radius — **capture to flip it off** (signature hazard-objective) |
| 4 | Laboratory Siege | dual lanes + hedges | 5 | ✅ | capturable **Kings Laboratory**; Clockwork (lightning-vuln) + Royal Engineer steam-shields |
| 5 | His Majesty the King ★ | grand twin-lane arena | 5 | ✅ | **Boss: The King** (shield-mode, overcharge/decree pulse, ally-shield, summons) |

## W5 · Shadow Realm — The Shadow Legion
Biome: void floor / shadow path / corrupted hexwood + purple crystal · Flyer: **Imp Swarm** ·
Water: **cursed waterway** (void-tainted, water-typed, D-15a) · Buildings: **Shadow Pool · Cursed
Portal** (hazard) · Boss: **Demon Shadow King** (the King corrupted, D-10). Roster: all 4 families —
demons/undead/shadow (Imp, Hellhound, Ash-Walker, Shadow Wraith, Soul-Eater, Void Priest).

| Lvl | Name | Path shape | Gems | Flight | Gimmick / objective |
|---|---|---|---|:--:|---|
| 1 | Into Shadow | single void lane | 5 | – | demon/undead fodder; fire-resist Imps |
| 2 | Cursed Waterway | lane over void-tainted water | 5 | ✅ | **Imp Swarm flyer** → cursed-water lane (water-typed, D-15a) |
| 3 | The Portal | split lane | 5 | ✅ | **Cursed Portal** mid-lane (open/active; spawns adds / shortcut) hazard |
| 4 | Shadow Pool | dual lanes + crystal clusters | 5 | ✅ | capturable **Shadow Pool**; **Void Priest** (resurrect) + **Shadow Wraith** (untargetable) + Soul-Eater leech |
| 5 | The Demon Shadow King ★ | grand void arena + portals | 5 | ✅ | **Final boss** (the King corrupted): **Cursed Portals = per-portal summoners** (D-10) + **darkness tower-disable cloud** |

---

## Open items (tune / confirm)
1. **Gem counts** — **resolved (D-31): every map = exactly 5 gems** (all rows above set to 5);
   stars = 3★ none touched / 2★ all retained / 1★ ≥1 kept / lose all = fail.
2. **Path shapes** — described qualitatively; the actual lane geometry is drawn in the Map Builder.
3. **Flight-lane reach** — water lanes are marked on every flyer-world level here; confirm whether
   levels that *don't* spawn the flyer may omit the route (brief §6.4 requires it world-wide as a
   safety default).
4. **Building placement** — which exact cells; whether L1–L2 of W4 should also preview the Power
   Station before its L3 hazard level.
5. **Per-wave roster ramp** — authored in the Wave Builder; this doc only sets the spatial puzzle +
   the pressure each level introduces.
