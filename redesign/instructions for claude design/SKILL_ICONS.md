# Skill-tree node icons — per-faction configuration

> **DESIGN DIRECTIVE (supersedes the D-14 reuse rule for skills): author a DEDICATED bespoke icon
> for every one of the 40 skills.** The reuse mapping further down is now only the engine's
> placeholder fallback until the bespoke set ships. See **§ "Art-generation brief"** below — that
> is the production task for **claude design**.

**Purpose.** The 4 faction skill trees (Orc · Crypt · Demon · Goblin), **10 skills each** = 40
nodes, each needs a node icon. This file is the authoritative source for both the bespoke art brief
(primary) and the placeholder reuse mapping (fallback) so the engine (`SkillTreeScreen`) and art
agree.

---

## Art-generation brief — dedicated per-skill icons (claude design)

**Deliverable.** A new module **`assets/data/skill_icons.js`** exporting **40 sprites**, one per
skill, keyed **`icon_skill_<faction>_<n>`** where `<faction>` ∈ `orc|crypt|demon|goblin` and
`<n>` = 1..10 in the table order below (e.g. `icon_skill_orc_1` = Coin Hoard). Add the module to
`Gallery.html`'s `MODULES` array and to `scripts/export-sprites.mjs`'s module list.

**Authoring contract (identical to `icons.js`, §10 / D-08 / D-21).**
- **48×48**, **single frame**, `anchor: center`, indexed-ASCII grids + `LEGEND` + the master
  `palette.js`. Build procedurally from the **`iconkit.js`** primitives (`icon, put, disc, ring,
  seg, rectf, poly, starShape, ngon, bolt, flame, snowflake, skull, coin, shield, sparkle, bevel`).
- **Bold 2px deep-ink silhouette border (D-08)** + bevel highlight + a small sparkle/sheen accent,
  exactly like the existing HUD icons, so each reads crisply at ~26px HUD scale on carved stone.
- **One clear focal motif per icon** — no busy scenes; the silhouette must be legible tiny.

**Per-faction palette accent** (use these master-palette families as the dominant hue so a glance
tells the faction apart; keep gold/ink for shared economy bits):
- **Orc** → green `MS*` + bone/rock `BN*/RK*` (war-machine timber & iron).
- **Crypt** → frost `IC*` + water/mana `AQ*` + curse `CR*` (cold dread).
- **Demon** → fire/ember `EM*` + ruby-red `GR*` (infernal).
- **Goblin** → steel `IR*` + brass-gold `GD*` (industry/salvage).

**Enchant-tied nodes** (flagged `[Enchant]`) **must keep a visual echo of that enchant's own icon**
(meteor / fear / freeze / gem-ward / cursed-tribute / dark-overcharge) so the "enchants only improve
if you invest their faction" coupling stays legible.

### Per-skill icon concepts

**Orc — War Machine** (green; timber, coin, siege)
| n | Skill | Bespoke icon concept |
|---|---|---|
| 1 | Coin Hoard | a heaped stack of gold coins |
| 2 | Timber Tithe | a cut log/stump with a coin embedded in the rings |
| 3 | Sharp Axes | crossed battle-axes with an edge glint |
| 4 | Champion Bane | a broken crown cleaved by an axe-blade |
| 5 | Cheap Carpenters | crossed hammer + saw over a small coin |
| 6 | Brutal Crits | a maul-strike impact starburst with stun sparks |
| 7 | Armor Breaker | a cracked steel shield split down the middle |
| 8 | Bigger Payloads | a lit bomb/boulder inside an expanding blast ring |
| 9 | Regrowth | a green sapling sprouting from a stump |
| 10 | Lasting Tribute *[Cursed Tribute]* | a cursed coin dripping a violet curse aura (echo `icon_cursed_tribute`) |

**Crypt — Frostbound Dread** (frost/blue + curse; control, mana)
| n | Skill | Bespoke icon concept |
|---|---|---|
| 1 | Mana Reserves | a brimming blue mana flask |
| 2 | Potion Cache | three small stoppered vials in a row |
| 3 | Deep Well | a stone well rim glowing with blue water |
| 4 | Withering Fear | a screaming skull shedding draining wisps |
| 5 | Terror Mastery *[Fear]* | a hooded wraith/dread face (echo `icon_fear`) |
| 6 | Death's Toll | a tolling bell with a skull clapper |
| 7 | Haunted Caves | a cave mouth crackling with spectral charge |
| 8 | Frozen Coffers | an ice-encrusted treasure chest |
| 9 | Killing Cold | a sharp icicle with a frost burst |
| 10 | Freeze Mastery *[Freeze]* | a frozen crystal/snowflake (echo `icon_freeze`) |

**Demon — Infernal Ascendance** (fire/red; Meteor)
| n | Skill | Bespoke icon concept |
|---|---|---|
| 1 | Brimstone Tax | a gold coin half-melting in flame |
| 2 | Gem Drift | a gem with a motion-trail arrow curving toward a cave |
| 3 | Lava Pool *[Meteor]* | a bubbling lava pool struck by a meteor (echo `icon_meteor`) |
| 4 | Meteor Mastery *[Meteor]* | a falling meteor wreathed in a blue mana glow |
| 5 | Kill Frenzy | a flaming skull trailing speed lines |
| 6 | Hellish Discounts | an upgrade chevron wreathed in fire |
| 7 | Wildfire | a spreading fireball / forked flames |
| 8 | Burst of Cinders | a radial ember-burst explosion |
| 9 | Tar Pit | a black tar bubble with a sinking swirl |
| 10 | Searing Weakness | a shield cracking and melting under flame |

**Goblin — Industry** (steel/brass; salvage, drones)
| n | Skill | Bespoke icon concept |
|---|---|---|
| 1 | Payroll | a tied coin-pouch spilling gold |
| 2 | Lean Workshops | a gear with a downward cost-arrow |
| 3 | Lasting Shred | a torn armor plate beside a small clock |
| 4 | Drone Swarm | three small rotor-drones in V-formation |
| 5 | Scrap Drops | a pile of bolts/scrap metal |
| 6 | Shrapnel Casing | a bomb casing bursting into shards |
| 7 | Jury-Rig | a wrench throwing a spark (jam) |
| 8 | Minefield | a spiked proximity mine |
| 9 | Ward Mastery *[Gem Ward]* | a gem clasped in a warding bracket/chain (echo `icon_gem_ward`) |
| 10 | Overcharge Mastery *[Dark Overcharge]* | a coil/battery crackling with dark energy (echo `icon_dark_overcharge`) |

**Delivery & engine hook.** Once `skill_icons.js` ships, the engine swaps its placeholder
`SKILL_ICONS` arrays (below) for `icon_skill_<faction>_<n>`. Validate in the Gallery (0 issues) and
confirm all 40 keys land in `sprites.json`.

---

## Placeholder reuse mapping (engine fallback until the bespoke set ships)

Per **D-14** the original plan used **no bespoke art** — every node **reuses an existing
`UI_ICONS` entry or one of the 6 enchant icons**. This is what the engine renders today and remains
the fallback if a bespoke icon is missing.

- Skills/effects are the ones locked in `SYSTEMS.md` §"Skills (meta-progression, D-14)".
- **Enchant-upgrade nodes** (gated behind their themed faction, SYSTEMS §148) **must** show that
  enchant's own icon, so the coupling is legible: `[Enchant]` is flagged in the table.
- Icons are referenced by their atlas key (the `icon_*` / enchant `icon_*` sprites in
  `assets/data/iconkit.js` + `icons.js`). All keys below exist in the delivered atlas.

## Icon vocabulary available (reuse only)

`icon_physical · icon_fire · icon_frost · icon_lightning · icon_curse · icon_magic`
`icon_burning · icon_feared · icon_slowed · icon_stunned · icon_cursed · icon_freeze · icon_fear`
`icon_armor · icon_range · icon_speed · icon_upgrade_arrow · icon_wave · icon_star`
`icon_gold · icon_sell_coin · icon_gem · icon_mana`
enchant icons: `icon_meteor · icon_fear · icon_freeze · icon_gem_ward · icon_cursed_tribute · icon_dark_overcharge`

---

## Orc — "War Machine" (PHYSICAL · coin economy + siege) · enchant: Cursed Tribute

| # | Skill | Icon | Why |
|---|---|---|---|
| 1 | Coin Hoard | `icon_gold` | coin drops |
| 2 | Timber Tithe | `icon_sell_coin` | fell tree → coin |
| 3 | Sharp Axes | `icon_physical` | cheaper axe/cut |
| 4 | Champion Bane | `icon_star` | +dmg vs champions/bosses |
| 5 | Cheap Carpenters | `icon_upgrade_arrow` | −tower upgrade cost |
| 6 | Brutal Crits | `icon_stunned` | crit + crit-stun |
| 7 | Armor Breaker | `icon_armor` | ignore enemy armor |
| 8 | Bigger Payloads | `icon_range` | +blast radius |
| 9 | Regrowth | `icon_speed` | trees regrow faster |
| 10 | **Lasting Tribute** *[Cursed Tribute]* | `icon_cursed_tribute` | enchant node |

## Crypt — "Frostbound Dread" (FROST + CURSE/fear · control + mana) · enchants: Freeze, Fear

| # | Skill | Icon | Why |
|---|---|---|---|
| 1 | Mana Reserves | `icon_mana` | +mana at start |
| 2 | Potion Cache | `icon_magic` | mana-potion drops |
| 3 | Deep Well | `icon_gem` | +mana cap (crystal) |
| 4 | Withering Fear | `icon_feared` | feared lose HP |
| 5 | **Terror Mastery** *[Fear]* | `icon_fear` | enchant node |
| 6 | Death's Toll | `icon_curse` | %-max-HP execute |
| 7 | Haunted Caves | `icon_lightning` | caves attack |
| 8 | Frozen Coffers | `icon_upgrade_arrow` | −tower upgrade cost |
| 9 | Killing Cold | `icon_frost` | chance to freeze |
| 10 | **Freeze Mastery** *[Freeze]* | `icon_freeze` | enchant node |

## Demon — "Infernal Ascendance" (FIRE + burn) · enchant: Meteor

| # | Skill | Icon | Why |
|---|---|---|---|
| 1 | Brimstone Tax | `icon_gold` | +gold at start |
| 2 | Gem Drift | `icon_gem` | dropped gems drift home |
| 3 | **Lava Pool** *[Meteor]* | `icon_meteor` | enchant node |
| 4 | Meteor Mastery *[Meteor]* | `icon_mana` | −Meteor mana cost |
| 5 | Kill Frenzy | `icon_speed` | on-kill fire-rate burst |
| 6 | Hellish Discounts | `icon_upgrade_arrow` | −tower upgrade cost |
| 7 | Wildfire | `icon_fire` | bonus fire damage |
| 8 | Burst of Cinders | `icon_burning` | burning-death burst |
| 9 | Tar Pit | `icon_slowed` | lava pool slows |
| 10 | Searing Weakness | `icon_cursed` | lowers fire-resist (debuff) |

## Goblin — "Industry" (PHYSICAL engineering · salvage economy) · enchants: Gem Ward, Dark Overcharge

| # | Skill | Icon | Why |
|---|---|---|---|
| 1 | Payroll | `icon_gold` | +gold at start |
| 2 | Lean Workshops | `icon_upgrade_arrow` | −tower upgrade cost |
| 3 | Lasting Shred | `icon_armor` | armor-shred lasts longer |
| 4 | Drone Swarm | `icon_wave` | +drones / vs flying |
| 5 | Scrap Drops | `icon_sell_coin` | scrap = gold |
| 6 | Shrapnel Casing | `icon_range` | +blast radius |
| 7 | Jury-Rig | `icon_stunned` | jam (stun) chance |
| 8 | Minefield | `icon_physical` | proximity mines |
| 9 | **Ward Mastery** *[Gem Ward]* | `icon_gem_ward` | enchant node |
| 10 | **Overcharge Mastery** *[Dark Overcharge]* | `icon_dark_overcharge` | enchant node |

---

## Engine config (authoritative arrays)

`SkillTreeScreen` reads these in faction order **Orc · Crypt · Demon · Goblin**, skills 1→10:

```text
ORC    : gold, sell_coin, physical, star, upgrade_arrow, stunned, armor, range, speed, cursed_tribute
CRYPT  : mana, magic, gem, feared, fear, curse, lightning, upgrade_arrow, frost, freeze
DEMON  : gold, gem, meteor, mana, speed, upgrade_arrow, fire, burning, slowed, cursed
GOBLIN : gold, upgrade_arrow, armor, wave, sell_coin, range, stunned, physical, gem_ward, dark_overcharge
```

(prefix each with `icon_`). Every faction's enchant nodes carry that enchant's own icon, making the
"enchants improve only if you invest their faction" coupling visible at a glance.
