# Cursed Hoard — Full Redesign

This folder is the authoring brief for a top-to-bottom redesign: every button,
background, map, UI element, tower, enemy, projectile, spell FX, and tile
gets new art — and the **engine itself is rebuilt from scratch** to realise the design
(D-18). The old build has been deleted; only the app icon and these `redesign/` docs remain.

## Roles

- **Claude design** — produces the art assets per the spec in this folder.
- **Claude (engine)** — **builds the new OO engine from scratch** (per
  `IMPLEMENTATION.md`), authors the 25 campaign maps from the new tiles, and
  imports them.

## Folder contents

| File | Purpose |
|---|---|
| `README.md` | This file. |
| `INVENTORY.md` | Exhaustive list of every asset the engine consumes. Nothing here is "nice to have" — every entry maps to a code call-site. Target: 100% utilisation. |
| `QUESTIONS.md` | Open design questions, growing as the spec evolves. Top-of-file = unanswered. |
| `DECISIONS.md` | Locked-in design answers (filled in as questions are answered). |
| `concept.md` | The design bible — full lore, the King-and-Queen story, and the per-world enemy rosters (53 troops) with trait prose. |
| `TOWERS.md` | The 4 tower trees (Orc/Crypt/Demon/Goblin), 48 towers across the 6-tier two-split; qualitative stat intent. |
| `TROOPS.md` | Per-troop binding of the 53 archetypes to the typed-resistance + status-immunity system (D-11/D-17). |
| `SYSTEMS.md` | Cross-cutting mechanics — summon trees, skill-tree node tables, flight/air-lane model, enchant behaviours. |
| `STYLEGUIDE.md` | Art-direction rules (**started — D-16**): the ~160-colour master palette, UI chrome treatment, faction/world accents, per-world terrain ramps, damage/status FX colour language. |
| `instructions for claude design/` | **Self-contained packet for Claude design** — the sprite-production brief (`claude_design_instructions.md`) + shortened, art-relevant **extracts** of STYLEGUIDE / INVENTORY / concept / TOWERS / TROOPS. Hand this whole folder over; the root files stay the engineering source of truth. |
| `MAPS.md` | **[DRAFT] written** — the 25 campaign maps: per-level briefs (world/biome · path shape · gem count · boss · gimmick + flight lanes). Authored in the Map Builder once tiles land (pipeline step 5). |
| `IMPLEMENTATION.md` | **From-scratch rebuild** plan (**D-18**): code-as-reference gap audit, the new OO combat architecture, build order, the agent-team partition, and the **asset-independent build track + test suite** (§8). |
| `STRUCTURE.md` | **Screen flow & navigation** the rebuild reproduces: screen inventory, nav graph, per-screen specs, and the in-game HUD layout (D-07). Reconstructed from docs (old code deleted, D-18). |
| `SETUP.md` | **Phase-0 turnkey handoff**: tech stack, repo/package layout, the interface contract as stub files, asset pipeline, placeholder layer, test harness, build/run/test commands, and the pinned decisions (D-30/D-31). Pairs with `IMPLEMENTATION.md`. |
| `DELIVERY.md` | *(planned — interim rules currently live in the design packet's `claude_design_instructions.md` §7)* How to hand off finished art (file format, naming, dimensions, where to drop). |

## Pipeline

1. **Lock the foundations** (this conversation): art style, palette, animation
   density, tile philosophy, audio scope.
2. **Fill `STYLEGUIDE.md`** from the locked decisions — concrete rules.
3. **Asset production** (Claude design) — work through `INVENTORY.md`
   section-by-section. Each delivered batch is named per `DELIVERY.md`.
4. **Engine wiring** (Claude) — drop each batch into `assets/` and update
   the JS sprite files / sprite key tables.
5. **Map authoring** (Claude in Map Builder) — once tiles land, build the 25
   campaign maps and import them via the existing import pipeline
   (`assets/custom_maps/` → Map Builder → Import).
6. **QA pass** — every asset must be reachable in the running game; the
   spec considers itself done only at **100% utilisation** (no orphan files).

## Non-negotiables

- Engine resolution: **1280 × 720 logical** (FitViewport).
- Tile grid: **32 × 30 cells**, **32 px per cell** (world is 1024 × 960).
- Every listed asset must be **used** in the shipping game. Anything that
  becomes orphan is deleted from `INVENTORY.md`, not silently kept.
- Sprites must follow the naming + dimension rules in `DELIVERY.md` so the
  existing JS loader picks them up without per-asset code changes.
