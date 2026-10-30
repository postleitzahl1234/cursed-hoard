# Screen Flow & Navigation — the app structure to rebuild

The **menu/screen flow + in-game HUD** the from-scratch rebuild (D-18) must reproduce. This is
the "capture-before-delete" doc flagged in `IMPLEMENTATION.md` §7: the old build defined the
screen graph in code, the code is **deleted with no VCS backup**, so this file reconstructs the
structure from the locked decisions (D-07 HUD layout · D-13 enchants · D-14 skills · D-16/D-22
chrome · D-32 no audio), the asset lists (`INVENTORY.md` §9–§15), and the prior build's feature
history. With this doc in place, the **screen-flow / navigation** infra is unblocked for the
asset-independent build track (`IMPLEMENTATION.md` §8).

**Status:** **[RECONSTRUCTED — confirm]**. Screen *set* and *flow* are high-confidence (anchored
to the asset lists + decisions); exact button copy, transitions, and the old Infinite mode are
marked **[ASSUMED]** where the deleted code was the only source. Correct any line and it locks.
Working title in `concept.md` is *Cursed Treasure 3*; README brands the redesign *Cursed Hoard*.

> **No audio (D-32):** there is no music/SFX surface anywhere in the flow — no audio settings, no
> volume sliders. Settings is video/theme/tools only.

---

## 1. Screen inventory

| Screen | Purpose | Background / art (INVENTORY) | Engine class (proposed) | Status |
|---|---|---|---|---|
| **Boot / Splash** | logo + asset load | title splash 1536×384 + loading-bar 9-slice (§15) | `BootScreen` / `LoadingScreen` | core |
| **Main Menu** | hub: route to everything | `bg_menu` (§11) | `MainMenuScreen` | core |
| **World Select** | pick one of 5 worlds | 5 world cards 512×384 (§12) | `WorldSelectScreen` | core |
| **Level Select** | pick a level node in a world | `bg_level_select ×5` + 25 nodes 192×192 + ring states (§11/§12) | `LevelSelectScreen` | core |
| **Game (in-play)** | the tower-defense match + HUD | playfield + chrome (§9) | `GameScreen` + `World` | core |
| **Pause** | overlay: resume/restart/quit | dim + raised blocks (§9) | overlay on `GameScreen` | core |
| **Results** | win/lose + stars earned | overlay + star icons (§10) | overlay on `GameScreen` | core |
| **Almanac** | bestiary + area-effect showcase | `bg_almanac` (§11) | `AlmanacScreen` | core |
| **Skill Tree** | 4 faction trees, spend ranks | `bg_skilltree` *(deferred art)* (§11) | `SkillTreeScreen` | core |
| **Settings** | video / theme / authoring tools | `bg_settings` (§11) | `SettingsScreen` | core |
| **Wave Builder** | author/edit wave files | reuses Settings/editor chrome | `WaveBuilderScreen` | tool |
| **Map Builder** | author/edit the 25 maps | reuses editor chrome | `MapBuilderScreen` | tool |
| **Infinite Peril** *(endless)* | endless mode + its setup | *(reused level-select/game art)* | `InfiniteSetupScreen` | **disabled** |

**Disabled:** *Infinite Peril* (the endless mode + `InfiniteSetup`) was **turned off** in the prior
build. The rebuild **omits or stubs** it unless you re-enable — flagged so the screen graph stays
honest. **[ASSUMED scope]**

---

## 2. Navigation graph

```
Boot/Splash ─▶ Main Menu
                  │
   ┌──────────────┼───────────────┬─────────────┬───────────────┐
   ▼              ▼               ▼             ▼               ▼
 Play          Almanac        Skill Tree     Settings        (Infinite ✗ disabled)
   │              │               │             │
   ▼            (back)          (back)     ┌─────┼───────────┐
 World Select                              ▼     ▼           ▼
   │  (pick world card)                Wave    Map        Theme/Video
   ▼                                   Builder Builder    toggle [Q-20]
 Level Select  (pick node)               │       │
   │                                   (back)  (back)
   ▼
 Game ──▶ Pause ──▶ {Resume · Restart · Quit→Main Menu}
   │
   └──▶ Results (win/lose, stars) ──▶ {Next level · Retry · Level Select · Main Menu}
```

Back-navigation is a consistent stack: every non-menu screen returns to its parent; in-game,
Pause/Results route back to Level Select or Main Menu. **[ASSUMED transitions]**

---

## 3. Per-screen specs

### Boot / Splash → Loading
Title splash (1536×384, §15) while assets load; a loading-bar 9-slice + fill (§15). Auto-advances
to Main Menu when load completes. *(In the placeholder build, §8, this just shows the splash block
and a fake progress bar.)*

### Main Menu
Hub on `bg_menu`. Buttons (raised carved-stone blocks, D-16): **Play · Almanac · Skill Tree ·
Settings · Quit** (+ *Infinite Peril* when re-enabled). Shows the game title/logo.

### World Select
The 5 **world cards** (512×384 hero illustration each): **Great Grasslands · Holy Mountains · Sea
of Sand · Royal Gardens · Shadow Realm** (concept.md). Cards show locked/unlocked state. Selecting a
card → that world's Level Select.

### Level Select
Per-world `bg_level_select` with the world's **5 level nodes** (192×192) on a path/map; node-ring
states `node_unlocked · node_locked · node_star3 · signpost · banner` (§12). Node 5 of each world is
the **boss map** (D-10). Selecting an unlocked node → Game. Shows stars earned per node (3-star
system; `star · star_filled · star_locked`, §10).

### Game (in-play) — see §4 for the HUD
The match: the playfield (32×30 grid, world 1024×960 logical) floats centred on the dark backdrop
(D-07/D-16). The HUD is the §4 layout. Round ends → Results overlay.

### Pause (overlay)
`pause`/`play` icons (§10). Dims the field; raised-block menu: **Resume · Restart · Quit to Menu**.
**[ASSUMED options]**

### Results (overlay)
Win = stars (by lives/gems saved, **[ASSUMED metric]**); Lose = retry prompt. Routes: **Next ·
Retry · Level Select · Main Menu**.

### Almanac
Bestiary + **area-effect showcase with animation** (the prior build moved skills *out* of the
Almanac and put **animated area-effects** in). Browses the 53 troops (concept.md/TROOPS.md) and the
enchant/ability FX (§4), each rendered with its animation. **No skill content here** (skills live in
their own screen). On `bg_almanac`.

### Skill Tree
`SkillTreeScreen` (D-14): **4 faction columns** (Orc · Crypt · Demon · Goblin), **10 skills each**,
every skill **5 rank-pips** = 40 nodes / 200 ranks. Node icons **reuse `UI_ICONS` + the 6 enchant
icons** — **no bespoke art** (D-14; §13). Enchant-upgrade nodes are **gated behind their themed
faction** (SYSTEMS.md). No ultimate capstones (cut). `bg_skilltree` art deferred.

### Settings
Video options + the **authoring-tool entry points**. **Theme: single locked dark palette
(D-31, no toggle)** — the old purple↔brown toggle is dropped (Q-20 closed). **No audio (D-32).** Buttons into **Wave
Builder** and **Map Builder**. On `bg_settings`.

### Wave Builder (tool, from Settings)
Authors/edits wave files (enemy composition, counts, timing, caps per D-10) → exported wave data the
Game consumes. Reuses editor chrome.

### Map Builder (tool, from Settings)
Authors/edits the 25 maps: paint terrain **by role** (base/path/obstacle/special, D-19 autotile),
place buildings + gem cave + spawn/exit, draw water flight-lanes (D-05/D-15 for W2–W5). Exports to
`assets/custom_maps/` → imported via `MapsV2Data`/`MapDef`/`WorldDef` (README pipeline step 5).

### Infinite Peril *(omitted — D-31)*
Endless mode + `InfiniteSetup`. **Omitted from the rebuild** (D-31; was already disabled). Not built.

---

## 4. In-game HUD layout (D-07 / D-16 / INVENTORY §9)

"Look upon the map like a god" — the playfield **floats above a dark backdrop**; every HUD element
is an **independent raised carved-stone block** (bevel + drop-shadow, arcade-button look, D-16),
floating separately rather than flush into one panel.

```
┌───────────────────────────────────────────────────────────┐
│ [gold]  [mana]  [gems/lives]            (top resource bar)  │  ← resources TOP
│                                                  ┌────────┐ │
│                                                  │ wave   │ │  ← wave queue RIGHT
│                 ░░░  PLAYFIELD  ░░░              │ chip   │ │     (per-wave chips)
│              (32×30, centred, floating)          │ chip   │ │
│                                                  │ chip   │ │
│                                                  └────────┘ │
│ ┌───────────┐                          ┌──────────────────┐ │
│ │ enchant×2 │                          │ tower-build (4)  │ │  ← enchants BOTTOM-LEFT
│ └───────────┘                          └──────────────────┘ │     build palette BOTTOM-RIGHT
└───────────────────────────────────────────────────────────┘
        + pause/speed controls · + tower upgrade/sell radial on select
```

- **Top resource bar** — gold · mana (regen-gated, D-13) · gem-count / lives.
- **Wave queue (right rail)** — upcoming-wave chips; a "send next" affordance.
- **Enchant slots (bottom-left)** — exactly **2 equipped** (D-13), mana-cost, no cooldown; icons §10.
- **Tower-build palette (bottom-right)** — the **4 factions** (Orc/Crypt/Demon/Goblin); each opens
  the tier tree on the build cell.
- **Tower upgrade / sell radial** — on selecting a placed tower: shows tier branches (D-02
  six-tier two-split), upgrade cost, sell. Towers have no HP (D-05) — only a stun/disabled overlay.
- **Pause / speed controls** — `pause`/`play`, speed toggle. **[ASSUMED speed control]**
- Chrome = shared **9-slice raised block** + bevel/shadow (§9); style ink-line/carved-stone per
  D-16/D-22.

---

## 5. Engine seams (for the rebuild)

- **Screen framework** — libGDX `Game` + `Screen` per the table in §1; a `ScreenManager`/stack for
  push/pop navigation (§2). Each screen built on the placeholder asset layer (`IMPLEMENTATION.md`
  §8) so the whole flow is clickable before final art.
- **Shared chrome infra** — `UiChrome` / `NineSlice` (raised-block 9-patch + bevel/shadow) and
  `UiPalette` (recoloured to D-16/D-22; faction accents per D-24). Every screen draws through these.
- **Persisted state** — greenfield save schema (no migrator, `IMPLEMENTATION.md` risk #2): unlocked
  worlds/levels, per-level stars, skill-tree ranks (D-14), settings/theme choice.
- **Tools** — `WaveBuilderScreen` / `MapBuilderScreen` write the data the Game/`MapsV2Data` reads;
  keep them reachable from Settings.

---

## 6. Open questions / to confirm

1. **Theme toggle (Q-20)** — ✅ **RESOLVED (D-31): single locked dark theme, no toggle.**
2. **Infinite Peril** — ✅ **RESOLVED (D-31): omitted** (endless mode + `InfiniteSetup` stay cut).
3. **Results metric** — ✅ **RESOLVED (D-31): every map = 5 gems**; 3★ none touched · 2★ all 5
   retained · 1★ ≥1 kept · lose all = fail.
4. **Pause/Results option set** — confirm the exact buttons (above are assumed).
5. **World→Level structure** — confirmed 5 worlds × 5 nodes (=25, INVENTORY §12/§16); is World
   Select a separate screen or folded into a single scrolling map? (assumed separate.)
6. **Main-menu entries** — confirm the exact set (Play/Almanac/Skill Tree/Settings/Quit assumed).
7. **Boot flow** — splash → menu directly, or a "press to start" gate?
