# STYLEGUIDE (design extract) — Cursed Hoard art direction

> **Design extract** of `../STYLEGUIDE.md`, trimmed to art-relevant content (the root original
> also carries engine-refit notes you don't need). **Section numbers match the root** so the
> brief's pointers — §1 palette, §3 accents, §4 worlds, §5 FX — still resolve. Root is the
> source of truth if anything here looks stale.

**Status key:** **[LOCKED]** = fixed decision (cite `D-NN`). **[DRAFT]** = first-pass hexes;
the *structure* is locked, exact hexes refine during production. **You author by family-step
CODE, never by raw hex** — `palette.js` resolves code→hex, so a tuned hex never breaks a sprite.

---

## 0. Foundations (locked)

| Rule | Source |
|---|---|
| Painted 2D pixel art, **64×64 source** (actor cell, 2× density per D-21), ink-line gothic, strong visible borders. | D-08 / D-21 |
| Logical screen **1280×720** (FitViewport); tile grid **32×30 @ 32 px** (world 1024×960). | README |
| UI = **darker cool gothic-night** palette (D-22) + **carved-stone** arcade blocks (D-07 layout). | D-16 / D-22 |
| Troops animated (idle+move+(fly)+(cast)+death, 4–6 frames; **no attack — D-25**); **towers static** (attack anim + optional stun overlay only); every tower tier ships its own attack + projectile. | D-06 / D-25 |
| Damage types PHYSICAL · MAGIC · FIRE · FROST · LIGHTNING · CURSE; status FEAR · SLOW · STUN · BURN · CURSE. | D-11 |
| One **shared indexed palette** (~160 colours). | D-16 |

---

## 1. Master palette — ~160 colours, indexed **[LOCKED count / DRAFT hexes]**

Model: a single shared, indexed palette (~24 material families × 6–8 shading steps). Every
sprite samples **only** from this set, so the whole game reads as one world. Ramps run
**dark → light**; shadows shift cool toward void-purple, highlights warm. Reference colours by
the **`·CODE`** tags below.

**Darker overall (D-22):** default large-area fills to the **darker ramp steps**; reserve the
top 1–2 light steps for highlight/rim; saturated brights (EM/IC/VL/HX/GD) are **accents/FX that
pop against the dark**, not fields. Keep a value gap to the IK0/IK1 outline so **borders stay
visible (D-08)**. It's a `palette.js` retune — the family/step structure is unchanged.

### Ink / neutrals
- **IK · ink/void** (UI base, outlines, deepest shadow) — `#07040d` `#0a0612`·K0 `#130c20` `#1a1226`·K1 `#2a1f3d`·K2 `#4a3a5c`·K3 `#6e5f84`
- **BN · bone/parchment/snow** (UI text, cloth, bone) — `#4a4234` `#6b5f4c` `#8a7960`·W2 `#b8a584` `#d9c9a8`·W1 `#f4ead5`·W0 `#fdf8ec`
- **RK · grey rock/stone** — `#232128` `#3d3a34`·G2 `#545049` `#6e6960`·G1 `#8a857a` `#a8a095`·G0 `#c8c2b6`
- **HS · holy stone** (warm cream rock, W2) — `#6b5d4a` `#95856b` `#c0b291` `#e2d6b6` `#f6efd8`

### Skins
- **SK · human skin** — `#5e3b2c` `#8a6248`·S2 `#b07a58` `#c89978`·S1 `#f0c9a0`·S0 `#ffe6c8`
- **GB · goblin green skin** — `#2f4220` `#486030`·S5 `#5f7d3a` `#7db04a`·S4 `#a6d56a` `#c2f0a0`·S3
- **UD · undead flesh** (sickly grey-purple) — `#2e2440` `#43305c` `#5a3a78`·S7 `#7556a0` `#8a6ec4`·S6 `#b39ad8`
- **DM · demon hide** (charcoal-red) — `#2a1216` `#4a1d22` `#6e2a2c` `#9a3a34` `#c4533f` `#e87a55`

### Build materials
- **WD · wood** (orc lumber, structures) — `#2a1810` `#4a2f1a`·N2 `#6b4423` `#8a5a2a`·N1 `#a8703a` `#c98a4b`·N0 `#e0aa6c`
- **SD · sand/dune** — `#5a3f24` `#7d5a30` `#a07a40` `#c49a55` `#dcbb78` `#ecd49a` `#f8ecc6`
- **IR · iron/steel** (cool metal) — `#1e2028` `#3a3a48`·M6 `#54545f` `#707080`·M5 `#9a9aa4` `#d8d4c8`·M4 `#f0eef0`
- **BR · brass/copper** (goblin machinery — distinct warm metal) — `#3d2410` `#5f3d18` `#8a5e22` `#b5832f` `#d8a847` `#f0cf78`
- **GD · gold** (royal/treasure) — `#6a4810` `#a07820`·M8 `#c89a30` `#e8c050`·M7 `#f6da78` `#fff0b0`

### Fire & heat
- **EM · ember→lava** (fire, BURN) — `#5a1010` `#8a1a16` `#c4281f` `#ff4124`·R2 `#ff7f3f`·R1 `#ffa840` `#ffd23f`·R0 `#fff0a0`
- **BL · blood/crimson** (gore, banners) — `#3a0a14` `#6a1020`·R4 `#9a1c2e` `#b3283b`·R3 `#d84a58`

### Cold, water & charge
- **IC · ice/frost** (Crypt, SLOW) — `#2a5878` `#3f7aa8` `#6aaad0` `#a0e0ff`·B0 `#cbefff` `#e8f5ff`·B3
- **AQ · water** (deep → shallow; flight lanes) — `#0e2a4a` `#1a4878`·B2 `#2f679e` `#4a90d8`·B1 `#6fb0e8` `#9bcdf2` `#c8e8fb`
- **VL · volt/lightning** (Crypt terminal) — `#4a3aa0` `#5a8aff` `#9ad8ff` `#faf6a0` `#fbffe6`

### Nature
- **MS · moss/grass** (Grasslands, Goblin) — `#1f3010`·M3 `#345020`·M2 `#496e2c` `#5d8a3a`·M1 `#7aa84a` `#a8d868`·M0 `#cdec98`
- **GN · garden green** (manicured lawn — cooler than wild moss) — `#24401f` `#3a5e30` `#538044` `#6fa257` `#97c47a`
- **PN · pine/dark foliage** (hedge, topiary, evergreen) — `#14260f` `#233f1a` `#345826` `#467034` `#5d8a47`
- **TX · toxin/poison teal** (goblin ooze, swamp) — `#0e3530` `#155a4e` `#1f8a72` `#36c498` `#76e8bc`

### Arcane
- **HX · hex/arcane magic** (bright orchid — MAGIC type) — `#3d1670`·P3 `#56229a` `#6a2bb0`·P2 `#a050c8`·P1 `#d48ae8`·P0 `#ecc0f8`
- **CR · curse/void purple** (dark indigo — CURSE type, Shadow Realm; cooler/bluer than HX) — `#120a26` `#241548` `#38216e` `#4e3590` `#6a55b4` `#8f86d6`

### Gems (the hoard — 5 jewel tones × 3 sparkle steps)
- **GR · ruby** `#8a1030` `#e02448` `#ff8aa0` · **GS · sapphire** `#143a8a` `#2a6ae0` `#90c0ff` · **GE · emerald** `#0e6a3a` `#1cc070` `#90f0c0` · **GA · amethyst** `#5a1a8a` `#a040e0` `#e0a0ff` · **GT · topaz** `#b06a10` `#f0b020` `#ffe890`

---

## 2. UI chrome — cool gothic-night + carved stone **[LOCKED D-07/D-16; DRAFT hexes]**

Layout (D-07): **map centred**, **resources top**, **wave queue right**, **enchants +
tower-placing bottom** — every element an **independent raised carved-stone block** with bevel
+ drop-shadow, floating separately (arcade-button look) on a dark backdrop.

| Role | Family/step | Hex |
|---|---|---|
| Screen backdrop | IK3 shadow (flat), IK1 vignette edges | `#1a1226` / `#0a0612` |
| Stone plate face | IK5 cursed-granite | `#4a3a5c` |
| Plate bevel highlight | RK3 stone-mid | `#6e6960` |
| Etched ink-line / recess | IK1 void | `#0a0612` |
| Drop shadow (under each block) | IK0 @ ~50% | `#07040d` |
| Heading / active rim | GD3 gold | `#e8c050` |
| Body text | BN5 bone | `#f4ead5` |
| Dim / muted text | BN4 / BN2 | `#d9c9a8` / `#8a7960` |
| Per-block accent (tower buttons, wave bars) | faction / world accent | §3 / §4 |
| Danger | EM3 lava | `#ff4124` |
| Success | MS3 moss | `#5d8a3a` |
| Mana | AQ3 water | `#4a90d8` |
| Gold / coins | GD3 | `#e8c050` |

Treatment: **ink-line-etched gothic masonry** faces (carved bevel + drop-shadow). Implementation
= a **stone 9-patch** per block size + a thin accent top-border; no per-button bespoke art.

---

## 3. Faction accents **[LOCKED D-16; re-themed D-24]**

Accent = the faction's identity hue (war-paint, trim, banners, glow), not the whole build
material. **D-24:** Orc took the green slot, Goblin moved to brass (kills the v1 two-greens
collision).

| Faction | Accent | Family | Hex | Tower damage (D-11) |
|---|---|---|---|---|
| **Orc** | **green** (war-green) | MS3·M1 | `#5d8a3a` | PHYSICAL |
| **Crypt** | ice-blue | IC3·B0 | `#a0e0ff` | FROST + CURSE/fear (+LIGHTNING terminal) |
| **Demon** | lava-red | EM3·R2 | `#ff4124` | FIRE |
| **Goblin** | **brass** (steampunk) | BR4 | `#d8a847` | PHYSICAL (engineering) |

**Purple is no longer a faction** → the hex/curse families (HX/CR) are the **CURSE +
Shadow-Realm signature** (curse-type tower FX, fear/curse status, W5 chrome).

---

## 4. Worlds — accents + terrain palettes **[accents LOCKED D-16; terrain DRAFT]**

Per-world accents (level-select chrome tint):

| World | Accent | Hex |
|---|---|---|
| Great Grasslands | moss-light MS5 | `#a8d868` |
| Holy Mountains | ice-blue IC3 | `#a0e0ff` |
| Sea of Sand | ember-orange EM4 | `#ff7f3f` |
| Royal Gardens | gold GD3 | `#e8c050` |
| Shadow Realm | hex-purple HX3 | `#a050c8` |

Terrain ramps on the tile roles (Base / Path / Obstacle / Special). Every colour is from §1.
**Tiling is full auto-edge (D-19):** author each biome's base/path as a **bitmask autotile
set** (the engine resolves edges); obstacles are **static connectable clusters**.

- **W1 · Great Grasslands** — *Base:* grass MS3 (+MS5 hi, MS1 shadow). *Path:* earthen WD2/WD1. *Obstacle:* oak woods — WD1 trunk + MS1/PN3 canopy. *Special:* stream AQ3. → accent MS5.
- **W2 · Holy Mountains** — *Base:* holy-stone HS3/HS4 + BN5 snow + IC5 sheen. *Path:* stone RK2/RK3. *Obstacle:* pine/crag — PN1 + RK1 crag + BN6 snow-cap. *Special:* **frozen river / glacial melt** AQ2/IC2 — the Seraph's flight lane (D-15). → accent IC3.
- **W3 · Sea of Sand** — *Base:* sand SD4 (+SD6 hi, SD1 shadow), warm EM5 sun sparingly. *Path:* packed sand SD2. *Obstacle:* cacti/palm — GB3/MS3 fronds + WD1 trunk. *Special:* **oasis waterway** AQ3/AQ1 (Giant Vulture flight lane, D-05d). → accent EM4.
- **W4 · Royal Gardens** — *Base:* manicured lawn GN2/GN3. *Path:* marble BN5/RK5 with GD3 edging. *Obstacle:* hedge/topiary PN2/PN3. *Special:* **pond / canal** AQ3 + BN5 marble rim (Royal Falconer + Clockwork Sentinel flight lane). Gilding GD3/GD4; banners BL3 or HX3. → accent GD3.
- **W5 · Shadow Realm** — *Base:* void floor IK2/IK3. *Path:* shadow IK4/IK5. *Obstacle:* corrupted hexwood WD0 + CR4 glow / purple crystal CR3/HX2. *Special:* **cursed waterway** — void-tainted water **AQ1/AQ2** under a **CR2 curse tint + HX3 glow** with **IK0** void edges (the Imp Swarm's flight lane, D-15a); BL1 blood pools. → accent HX3.

---

## 5. Damage-type & status FX colour language **[DRAFT, from D-11]**

Every ability ships its own FX sprite (D-04d); these are the hue contracts so types read at a
glance and never collide.

| Damage type | Core → glow | Notes |
|---|---|---|
| PHYSICAL | IR3/IR5 steel, BN2 dust | no element tint (Orc/Goblin) |
| MAGIC | HX4 → HX3 (bright orchid) | generic arcane |
| FIRE | EM6 core → EM4 → EM3, EM1 edge | Demon; drives BURN |
| FROST | IC3 → IC5, IC0 deep | Crypt; drives SLOW tint |
| LIGHTNING | VL3 yellow core + VL1/VL2 blue crackle + VL4 white | Crypt terminal (distinct from frost) |
| CURSE | CR2/CR3 → CR0 void | dark indigo, distinct from MAGIC's orchid |

| Status | Colour |
|---|---|
| FEAR | HX3 / CR4 purple miasma |
| SLOW | AQ1 deep tint + IC3 frost rim |
| STUN | GD3 / EM6 gold-yellow stars |
| BURN (DoT) | EM4 / EM3 flame |
| CURSE | CR2/CR3 + IK1 void |

---

## 6. Still soft (author by code, refine later)

- **§1 hex values** are a first-pass **[DRAFT]** — the ~160 count + family structure is locked;
  you author by code, so tuning never invalidates a sprite.
- **LIGHTNING (VL) hue** — confirm yellow-core + blue-crackle vs a purer white-blue.
- **Gem → world / hoard-tier mapping** — the 5 tones (GR/GS/GE/GA/GT) aren't yet pinned to
  worlds/tiers; author gems generically by tone for now.
