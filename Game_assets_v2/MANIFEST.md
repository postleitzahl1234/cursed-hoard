# Cursed Hoard — Asset Foundry · Delivery Manifest

**Open `Gallery.html`** to review every sprite live-rendered and animated on the gothic-night
stage. **582 sprites across 20 modules · 163-colour master palette · validation clean.** Latest: galaxy-themed menu/settings/loading backgrounds; full mana & health drain-to-empty bars + 5 wave tracks (7/9/11/13/15 boxes); coherent button states; troop size range widened to ~3:1; an engine-ready `TOWER_PROJECTILE` map; ~80% biome-typical tree coverage on maps; hexwood/ashwood shadow trees. Reverified against the INVENTORY spec (48 towers · 48 projectiles · 53 troop archetypes · 25 maps).

## Pipeline (foundation)
- **`assets/data/palette.js`** — the **163-colour** indexed master palette (STYLEGUIDE §1), 29
  families, code→hex. **Darkened/grounded pass** applied — deep saturated shadows, muted lights
  (no chalky near-whites) so sprites read as gothic TD, not toys. Author by **CODE**: a mood
  re-tune re-tones every sprite at once (as the darken pass did).
- **`assets/render.js`** — renderer for the authoring contract: indexed ASCII grids + legend +
  palette → nearest-neighbour animated canvas. Paints frame 0 synchronously (survives tab throttle).
- **`assets/data/humankit.js`** — parametric 64×64 humanoid rig (jointed body posed per frame +
  horse-rider + quadruped-beast + feather/bat wings) generating **idle · walk · (fly) · (ability) ·
  death** — drives all 53 troop archetypes. (Legacy 16×16 `troopkit.js` removed.)
- **`assets/data/towerkit.js` + `towerbases.js`** — procedural tower kit: faction-distinct bases +
  the D-23 8-way directional turret system + Crypt/Demon static weapons.
- **`Gallery.html`** — review stage + live validator (0 issues). Add a module to its `MODULES`
  array and its sprites appear automatically.

## What's delivered

| Module | Sprites | Coverage |
|---|---|---|
| `backgrounds.js` | 12 | §11/§15 — layered 128×72 parallax scenes with lore: menu keep under a blood moon, settings parapet, arcane almanac tome, loading hoard-glow; 5 level-select vistas (WILD grasslands w/ river·oaks·hamlet·deer vs INDUSTRIAL gardens w/ brass conservatory·chimneys·clockwork·topiary·canal; icy peaks; ziggurat dunes; shadow rift) + loading-bar 9-slice + crowned title splash |
| `worldmap.js` | 35 | §12 — 5 world hero cards + 25 level nodes (biome + level pips + boss skull) + ring states (unlocked·locked·3-star·signpost·banner) |
| `maps.js` | 25 | §16 — the 25 campaign layouts (5 worlds × 5 levels), top-down role grids: spawn→Gem-Cave lane(s) per MAPS.md (S·merge·split·twin·boss-arena), obstacle clusters, buildings, gem hoard, water flight-lanes (W2–W5), portals (W5), boss arenas (every L5) |
| `towers_full.js` + `towerkit.js` + `towerbases.js` | 72 entries | **48 towers** at **2× density (64×128, foot anchor)**, four FACTION-DISTINCT silhouettes (no shared recipe): Orc green log-palisade fort · Goblin steampunk iron/brass rig · Crypt blue gothic mausoleum · Demon red basalt ziggurat — each with its own per-tier escalation. **D-23:** Orc & Goblin = static base + **rotating 8-way directional turret** (gallery card cycles all 8 facings, firing; `*_base` card = bare structure). Crypt & Demon = single static sprite, F=4 (orbiting charges / beams / flame novas — no tracking barrel). |
| `fx_abilities.js` | 26 | standalone §4 behaviour FX (banner/taunt/rally/reflect/frenzy/sing/cleanse/ascension/shimmer/vanish/phase/sandstorm/death-blast/absorb/mutual-heal/steam·ally shield/resurrect/leech/blink/gold-steal/darkness) + Crypt orbiting-charge + Demon ground-fire |
| `enchants.js` | 6 | the 6 equippable enchant cast/impact FX (meteor·fear·freeze·gem-ward·cursed-tribute·dark-overcharge) |
| `ui_chrome.js` | 17 | §9 HUD furniture — 9-patch panels, buttons (idle/hover/press), banner plate, tooltip, resource capsule, health/mana bars (+drain), wave track, skill nodes (locked/available/mastered), close/confirm chips |
| `troops_w1.js` | 45 | W1 Grasslands — 10 archetypes |
| `troops_w2.js` | 48 | W2 Holy Mountains — 10 archetypes |
| `troops_w3.js` | 57 | W3 Sea of Sand — 12 archetypes |
| `troops_w4.js` | 53 | W4 Royal Gardens — 11 archetypes |
| `troops_w5.js` | 50 | W5 Shadow Realm — 10 archetypes |
| `projectiles.js` | 4 | base-tower projectiles (travel + impact) |
| `fx.js` | 6 | support aura · shield · summon · heal · burn · freeze |
| `terrain.js` | 17 | 5 biomes base/path/obstacle + 2 hero water lanes |
| `buildings.js` | 5 | Gem Cave · Village · Castle · Cursed Portal (open/active) |
| `gems.js` | 10 | 5 tones × idle + pickup |
| `particles.js` | 8 | arrow·bone·spark·smoke·blood·explosion·magic·soul |
| `icons.js` | 32 | resources · controls · 6 enchants · 6 damage · 5 status |

## ★ Every troop & boss has CUSTOM ability-activation frames
All **53 archetypes** (INVENTORY §3) are authored with idle/walk/attack/death. Every unit with a
special behaviour (TROOPS.md role table → INVENTORY §4) ships a **bespoke `*_ability` animation** —
no shared placeholder. Bosses cast; champions proc; emitters pulse; carriers blink/carry; flyers fly.

| World | Bespoke ability animations authored |
|---|---|
| **W1** | Banner-Sergeant speed-ring · Pavise Guard taunt-slam · Knight-Lieutenant invuln shimmer · Golden Prince ride+carry · ★General summon rite |
| **W2** | Flagellant blood-frenzy · Bard note-ring sing · War Cleric heal-glow · Inquisitor cleanse flash · Monk ascension pillar · Templar shimmer+reflect · Seraph wing-flap fly · ★High Priest sanctuary cast |
| **W3** | Ash-Walker ember-shimmer · Mirage Dancer vanish · Sandstorm Shaman storm-veil · Rebel Sapper death-blast · Glass Sentinel absorb-heal · Vulture fly · Camel Caravan mutual-heal link · Renegade Knight shield · ★Chief Rebel sandstorm+gold-steal |
| **W4** | Royal Engineer steam-shield · Court Conjurer ally-shield bubble · Clockwork propeller-fly · Standard-Bearer banner aura · Falconer fly · Royal Prince ride+carry · Siege Wagon crew steam · Lord-Commander rally+shield · ★The King golden decree+summon |
| **W5** | Shadow Wraith phase-flicker · Imp Swarm fly · Void Priest resurrect · Soul-Eater death-leech · Gem Shade blink-to-gem · Doom Knight shield+reflect · ★Demon Shadow King portal/darkness/summon (corrupted King silhouette) |

Locomotion variants included: **ride** (Outrider, Golden/Royal Prince, Dune/Abyssal Behemoth),
**fly** (Seraph, Vulture, Falconer, Clockwork, Imp Swarm), **+carry** dual-walk for dismount carriers.

## Recent art-direction passes
- **Troops 2× rebuild — COMPLETE (all 5 worlds).** New `humankit.js` parametric rig (jointed
  humanoid posed per frame + horse-rider + quadruped-beast + feather/bat wings & fly clip) drives
  all 53 archetypes at **64×64**. Each world carries its host accent (W1 grass · W2 ice-cream ·
  W3 sand · W4 royal-blue+gilt · W5 void-purple). Mounts (Outrider, Princes, Behemoths), flyers
  (Seraph, Vulture, Clockwork, Imp swarm, Falconer), group (Camel Caravan), vehicle (Siege Wagon),
  and the Shadow King's corrupted-King silhouette all render. **Attack frames dropped by request**
  — clips are idle · walk · (fly) · (ability) · (carry) · death. Legacy 16×16 `troopkit.js` removed.
- **Per-faction structural detailing.** Crypt: small arched door + lit lancet windows.
  + lit lancet windows up the body. Demon: ziggurat steps now have strong terraced relief (bright
  sunlit tread shelves + dark shadow recesses) + bold pale-stone central staircase + base doorway +
  per-tier ember windows; beam line tall/narrow, pyre line shortest/broadest, brimstone+magma short/sturdy.
  Goblin: drone/bomber towers are now STATIC launch platforms (no turret) — the flying unit is a
  separate animated actor (`*_unit` fly + `*_unit_attack`), gun-quadcopter vs airship-bomber, distinct
  per tier. Orc: rounded "den" body + central symmetric rhombus carvings (grow & gild with tier).
- **Branch identity + strong per-tier escalation.** Each tower BRANCH is its own building
  building (Crypt: frost ice-obelisk · fear shroud+skull spire · lightning iron-tesla rod · college
  gold orrery · terror bone-belfry; Demon: tall horned beam-tower vs wide pyre-caldera; Orc marksman
  watchtower vs artillery bunker; Goblin drone/ordnance/bomber rigs). Every tier differs by ≥5 levers
  — size · intricacy/layers (single block → multi-tier setback) · darker richer colour · stripes +
  silver→gold trim · spikes · bigger weapon.
- **D-23 + faction-distinct bases.** Orc/Goblin towers split into a **static base +
  rotating 8-way directional turret** (`towerkit.js` turret system; `towerbases.js` bases). Each
  faction now has its **own** silhouette + per-tier escalation — no shared plinth/banner/corner-tower
  recipe across factions (Orc log-fort · Goblin steampunk rig · Crypt gothic spire · Demon lava ziggurat).
- **Tower faction re-theme (user override of STYLEGUIDE §3 accents).** Orc → **green** mossy
  timber · Crypt → **blue** ashlar · Goblin → **brass steampunk** (copper pipes, pressure gauge,
  rivet-studded iron base) · Demon → **red** (unchanged). Four factions now read as green / blue /
  red / brass. *Note: this intentionally diverges from the locked Orc=wood-brown / Goblin=moss-green
  accents — if kept, the same accents should propagate to projectiles, UI tower-buttons and world tints.*
- **2× density rebuild (D-21) — IN PROGRESS.** Towers re-authored at the new **64×128** source
  (was ~16px) via a procedural kit (`towerkit.js`) with genuinely more detail (courses, buttresses,
  corner-towers, lit doorways, banner cloth, multi-charge/multi-barrel weapon heads). **Remaining
  modules (troops, terrain, gems, icons, projectiles, etc.) still await the 2× pass.**
- **Darker, grounded palette** — deep saturated shadows, muted lights (no chalky near-whites).
- **Gems re-tuned darker** — deep cut-stone cores (ruby `#3e0414`→`#d2425e`, emerald `#022414`→`#3aae72`, etc.) so they read as lifelike faceted stones.
- **Gem Cave emptied** — no gems inside; interior is now a flat deepest-void `#050309` cavern mouth.
- **Towers reworked for readability** — perfectly symmetric (palindromic) base; centre-aligned weapon; three escalating plinths + three housing sizes (gold-trim terminals) + banners on even tiers; weapon-head silhouette changes by attack type and grows/gains ornament per tier.

## Remaining (next batches — pipeline ready, drop-in)
- Tower **projectile/beam set** for the 44 non-base tiers + drone/bomber air actors + stun overlay.
- **Backgrounds** (§11) · world-select cards + the 25 skill-tree node arts (§12) · loading/victory/defeat screens.

## From-scratch rule (D-18)
100% new art, authored against the master palette by code. No reuse from any prior build.
