# V3 visual direction — Cursed Reliquary

The v2 copy is readable but visually flat: backgrounds, panels, and controls occupy similar
values; most screens center everything; gold is used so often that it no longer signals priority.
V3 treats contrast and composition as systems rather than adding detail everywhere.

## Research translated into rules

- **60 / 30 / 10 is a heuristic, not pixel accounting.** Adobe describes 60% dominant, 30%
  secondary, and 10% accent as a practical balance that moves the eye between focal points.
  V3 uses near-black plum for dominant space, stone/bronze for supporting surfaces, and reserves
  luminous gold plus one world color for high-value interaction.
- **Contrast is measurable.** W3C WCAG 2.2 calls for at least 4.5:1 for ordinary text, 3:1 for
  large text, and its visual-design curriculum recommends 3:1 for essential UI graphics and
  component boundaries. `UiThemeTest` pins the core palette accordingly.
- **Color must have one job.** Apple recommends semantic, consistent color and warns against
  colorful controls over colorful content. Gold means primary/value; the current world's accent
  means place/selection; red means danger; muted lavender means secondary information.
- **Hierarchy follows reading order and alignment.** Apple recommends placing important items
  early in reading order and aligning components to make groups scannable. V3 uses deliberate
  left-scene/right-action asymmetry in the menu, connected progression in level select, and three
  discrete HUD clusters instead of a continuous strip.
- **Color is never the only cue.** Selected states combine hue with rims, depth, and geometry.

Sources:

- [W3C — WCAG contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
- [W3C — visual-design curriculum](https://www.w3.org/WAI/curricula/designer-modules/visual-design/)
- [Apple HIG — layout](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Apple HIG — color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Adobe — 60/30/10 color balance](https://blog.adobe.com/en/publish/2017/09/18/impact-colour-conversion-rates)

## Five committed experiments

1. **Semantic 60/30/10 palette** — centralized tokens and contrast regression tests.
2. **Reliquary chrome** — every panel/control gains shadow depth, an inset rim, and stronger
   hover/selected differentiation.
3. **Asymmetrical main menu** — original AI-assisted reliquary background, scene on the left,
   calm action column on the right, and one dominant PLAY action.
4. **World identity** — one restrained accent per world drives screen chrome and connects level
   nodes without recoloring functional text.
5. **Clustered battlefield HUD** — resources, transport, spells, and build actions occupy separate
   anchored islands so the playfield center remains quiet.

The AI background is intentionally limited to a large atmospheric bitmap. Small sprites,
nine-slice chrome, terrain, icons, and animation remain deterministic pixel-grid assets.
