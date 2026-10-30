# Shanshuihua asset provenance

This edition replaces the runtime art with an original Chinese shanshuihua-inspired system:
lampblack and warm xuan paper, layered mist, dry-brush texture, and restrained cinnabar, jade,
azurite, ochre, and mineral-violet accents. Gameplay keys, animation timing, anchors, map hit areas,
and UI layout contracts remain unchanged.

All raster masters in this document were created with Codex's built-in image-generation workflow.
Runtime transformations and format conversions are deterministic project-local scripts/code.

## Main-menu handscroll

Final runtime file: `generated/bg_menu_reliquary_v3.png`

```text
Use case: stylized-concept
Asset type: 16:9 main-menu background art for the tower-defense game "Cursed Hoard"
Primary request: an original Chinese shanshuihua (山水画) handscroll scene about guarding a cursed treasure hoard
Scene/backdrop: monumental mist-veiled mountain peaks, a secluded cliffside treasure pavilion and ancient stone coffer, waterfalls dissolving into cloud, winding path and a few wind-bent pines
Subject: ancient sealed treasure coffer beneath a small mountain pavilion, subtle supernatural jade glow suggesting a curse; no people
Style/medium: authentic-feeling Chinese ink-wash landscape painting on warm xuan paper, expressive calligraphic brushwork, layered ink values, dry-brush rock texture, sparse traditional mineral pigments; elegant game key art while preserving hand-painted restraint
Composition/framing: wide 16:9 landscape; visual focus and denser mountains on the left two-thirds; right 38 percent intentionally quiet with pale mist and soft paper tone for menu UI; strong depth through empty space; safe crop
Lighting/mood: poetic dawn mist, contemplative and mysterious rather than horror; subtle jade, mineral-blue and cinnabar accents amid black ink and warm paper
Constraints: no text, no calligraphy, no seals or stamps, no lettering, no logos, no UI elements, no border, no watermark; original composition only; no Western gothic architecture; keep the right side calm and low contrast
```

## Game and launcher icon

Final runtime/package files: `game icon.png`, `../lwjgl3/icons/logo.png`,
`../lwjgl3/icons/logo.ico`, and `../lwjgl3/icons/logo.icns`.

```text
Use case: stylized-concept
Asset type: 1024×1024 square desktop game icon
Primary request: Create an original Cursed Hoard game icon in traditional Chinese shanshuihua (山水画) style.
Scene/backdrop: Warm, softly fibrous xuan-paper texture with a misty mountain peak rising behind the subject; atmospheric ink-wash emptiness, no border or mockup.
Subject: One single ancient treasure coffer nestled beneath the mountain peak. The coffer is closed, unmistakable, and forms the dominant bold silhouette.
Style/medium: Expressive traditional black ink wash with dry-brush edges and controlled pooling; sparse cinnabar-red seal-like accent; restrained muted jade and mineral-gold accents on the coffer; painterly, elegant, authentic shanshuihua sensibility.
Composition/framing: Square 1:1 icon composition, centered, generous outer margin, chest large in the lower-center, one simple mountain peak behind it, strong massing and minimal fine detail so the chest silhouette and jade accent remain readable at 32px.
Lighting/mood: Quiet, ancient, mysterious, mist-laden; high tonal contrast around the chest while preserving warm paper.
Color palette: Ink black and smoky gray, warm xuan-paper beige, very sparse cinnabar red, muted jade green, subdued mineral gold.
Constraints: exactly one treasure coffer; bold simple silhouette; no people, animals, coins, weapons, extra chests, decorative frame, UI chrome, or busy scenery; no text, no lettering, no calligraphy, no logo, no watermark. The cinnabar accent must be an abstract square seal impression with no legible characters.
```

## Runtime sprite atlas

`scripts/export-sprites.mjs` preserves all sprite contracts while applying the edition's ink and
mineral-pigment treatment to every exported key. Run `node scripts/export-sprites.mjs` to rebuild
`generated/sprites.json` deterministically.

## Overworld maps

Final runtime files: `maps/map1.png`, `maps/map2.png`, and the ten aligned clickable overlays in
`maps/worlds/`.

```text
Use case: stylized-concept
Asset type: 3:2 campaign world-map base for a fantasy tower-defense game
Primary request: one continuous fantastical realm rendered as an elegant shanshuihua landscape map, containing five clearly separated and visually distinct regions: verdant grasslands, soaring holy mountains, a vast sea of sand, ornate royal gardens, and an ominous shadow realm.
Style/medium: refined Chinese ink-wash landscape painting on pale xuan paper, elegant monochrome sumi ink with restrained subtle jade green, cinnabar red, and mineral blue accents; original artwork.
Composition/framing: wide 3:2 atlas-map composition, top-down/oblique bird's-eye view, continuous landmass with five large readable regions separated by natural boundaries such as rivers, mountain ridges, ravines, walls, and mist; strong clear silhouettes at thumbnail scale; important content safely inside the frame.
Lighting/mood: poetic mist, layered depth, calm but adventurous.
Constraints: exactly one coherent map scene; all five regions visibly present and distinguishable; no text, no labels, no letters, no map legend, no border typography, no logos, no watermark.
Avoid: photorealism, satellite imagery, modern objects, UI panels, tiny disconnected islands, excessive clutter.
```

```text
Use case: stylized-concept
Asset type: alternate 3:2 campaign world-map base for a fantasy tower-defense game
Primary request: one continuous fantastical realm rendered as an aged shanshui handscroll map, containing five clearly separated and visually distinct regions: verdant grasslands, soaring holy mountains, a vast sea of sand, ornate royal gardens, and an ominous shadow realm.
Style/medium: antique Chinese handscroll painting, dry-brush ink contours, weathered rice-paper fibers, restrained muted mineral pigments, hand-painted cartographic landscape, original artwork.
Composition/framing: wide 3:2 atlas-map composition, top-down/oblique bird's-eye view, continuous connected realm with five large readable regions separated by rivers, mountain chains, ravines, garden walls, and atmospheric ink mist; balanced winding visual journey across the whole frame; strong silhouettes at thumbnail scale; important content safely inside the frame.
Lighting/mood: ancient, tactile, mysterious, adventurous.
Constraints: exactly one coherent map scene; all five regions visibly present and distinguishable; no text, no labels, no letters, no map legend, no border typography, no logos, no watermark.
Avoid: photorealism, satellite imagery, modern objects, UI panels, tiny disconnected islands, excessive clutter.
```

The ten overlays are deterministic full-frame RGBA composites derived from their matching master.
They retain the painted pixels only inside mutually exclusive realm regions, so hover highlighting and
`WorldMap.worldAt` hit routing remain perfectly aligned with the new maps.
