import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dataDir = path.join(root, 'Game_assets_v2', 'assets', 'data');
const outDir = path.join(root, 'assets', 'generated');
const modules = [
  'backgrounds.js',
  'worldmap.js',
  'maps.js',
  'towers_full.js',
  'projectiles.js',
  // terrain.js is retired: its 44 tiles were 2x-density, had no consistent key light, and
  // shipped hand-authored *_to_* transition tiles that D-19 makes unnecessary. The five tiles/
  // modules replace it with 1x-density beds plus generated 12-piece auto-edge kits.
  'tiles/w1_grass.js',
  'tiles/w2_mountain.js',
  'tiles/w3_sand.js',
  'tiles/w4_garden.js',
  'tiles/w5_shadow.js',
  'buildings.js',
  'gems.js',
  'fx.js',
  'fx_abilities.js',
  'enchants.js',
  'icons.js',
  'obstacles.js',
  'particles.js',
  'ui_chrome.js',
  'troops_w1.js',
  'troops_w2.js',
  'troops_w3.js',
  'troops_w4.js',
  'troops_w5.js',
];

const STYLE_CATEGORIES = {
  general:    { code: 'shan', tint: '#a58b5b', tintMix: 0.04, inkMix: 0.16, dryMix: 0.12, texture: 0.045 },
  background: { code: 'mist', tint: '#6f6553', tintMix: 0.45, inkMix: 0.28, dryMix: 0.18, texture: 0.110 },
  worldmap:   { code: 'scroll', tint: '#8f9b73', tintMix: 0.10, inkMix: 0.14, dryMix: 0.13, texture: 0.060 },
  map:        { code: 'map', tint: '#9a906c', tintMix: 0.08, inkMix: 0.12, dryMix: 0.12, texture: 0 },
  orc:        { code: 'malachite', tint: '#55785b', tintMix: 0.14, inkMix: 0.18, dryMix: 0.10, texture: 0.045 },
  crypt:      { code: 'azurite', tint: '#55768a', tintMix: 0.15, inkMix: 0.17, dryMix: 0.11, texture: 0.045 },
  demon:      { code: 'cinnabar', tint: '#9b4638', tintMix: 0.15, inkMix: 0.18, dryMix: 0.09, texture: 0.050 },
  goblin:     { code: 'bronze', tint: '#927344', tintMix: 0.15, inkMix: 0.18, dryMix: 0.10, texture: 0.045 },
  grass:      { code: 'jade', tint: '#617c59', tintMix: 0.13, inkMix: 0.14, dryMix: 0.13, texture: 0.065 },
  mountain:   { code: 'snowink', tint: '#7b8990', tintMix: 0.12, inkMix: 0.16, dryMix: 0.16, texture: 0.070 },
  sand:       { code: 'ochre', tint: '#a9814c', tintMix: 0.15, inkMix: 0.13, dryMix: 0.12, texture: 0.065 },
  garden:     { code: 'celadon', tint: '#587c70', tintMix: 0.14, inkMix: 0.14, dryMix: 0.12, texture: 0.060 },
  shadow:     { code: 'nightink', tint: '#514f6d', tintMix: 0.13, inkMix: 0.20, dryMix: 0.08, texture: 0.055 },
  building:   { code: 'architecture', tint: '#8e7654', tintMix: 0.11, inkMix: 0.18, dryMix: 0.12, texture: 0.050 },
  gem:        { code: 'mineral', tint: '#8a6e68', tintMix: 0.05, inkMix: 0.10, dryMix: 0.10, texture: 0.055 },
  magic:      { code: 'spirit', tint: '#667f86', tintMix: 0.07, inkMix: 0.12, dryMix: 0.08, texture: 0.075 },
  ui:         { code: 'lacquer', tint: '#493c2f', tintMix: 0.58, inkMix: 0.28, dryMix: 0.18, texture: 0.060 },
  obstacle:   { code: 'brushwood', tint: '#6f6e50', tintMix: 0.11, inkMix: 0.20, dryMix: 0.13, texture: 0.080 },
};

const paletteModule = await import(pathToFileURL(path.join(dataDir, 'palette.js')));
const shanshui = createShanshuiRegistry(paletteModule.PALETTE);
const payload = {
  palette: shanshui.palette,
  sprites: {},
  modules: {},
  towerProjectile: {},
  provenance: {
    visualStyle: 'shanshuihua',
    tradition: 'Chinese ink wash with restrained mineral pigments on warm xuan paper',
    treatmentVersion: 1,
    deterministic: true,
    generator: 'scripts/export-sprites.mjs',
  },
};

for (const file of modules) {
  const mod = await import(pathToFileURL(path.join(dataDir, file)));
  const sprites = mod.SPRITES || {};
  payload.modules[file] = Object.keys(sprites);
  for (const [key, sprite] of Object.entries(sprites)) {
    payload.sprites[key] = normalizeSprite(sprite, mod.LEGEND || {}, key, file, shanshui);
  }
  if (mod.TOWER_PROJECTILE) {
    payload.towerProjectile = mod.TOWER_PROJECTILE;
  }
}

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'sprites.json'), JSON.stringify(payload));
console.log(
  `Exported ${Object.keys(payload.sprites).length} shanshuihua sprites ` +
  `(${shanshui.texturedSprites} brush-textured, ${Object.keys(payload.palette).length} palette entries) ` +
  `to assets/generated/sprites.json`,
);

function normalizeSprite(sprite, legend, key, moduleName, registry) {
  const frames = Array.isArray(sprite.frames) ? sprite.frames : [];
  const category = styleCategory(moduleName, key);
  const styledLegend = {};
  const brushAliases = new Map();
  let aliasCodePoint = 0xe000; // BMP private-use characters remain one Java UTF-16 char wide.

  for (const [glyph, paletteCode] of Object.entries(legend)) {
    if (paletteCode == null || !registry.sourcePalette[paletteCode]) {
      styledLegend[glyph] = paletteCode;
      continue;
    }
    styledLegend[glyph] = registry.variant(paletteCode, category, 'body');
    const alias = String.fromCharCode(aliasCodePoint++);
    const brushTone = (stableHash(`${key}:${glyph}`) & 1) === 0 ? 'ink' : 'dry';
    styledLegend[alias] = registry.variant(paletteCode, category, brushTone);
    brushAliases.set(glyph, alias);
  }

  const normalizedFrames = frames.map((frame) => Array.isArray(frame)
    ? frame.map(row => Array.isArray(row) ? row.join('') : String(row))
    : []);
  // map_* grids double as semantic terrain-role data in PixelArtAtlas.gridOf(). Their characters
  // must stay byte-for-byte stable; the transformed legend still gives them the new painted look.
  const paintedFrames = moduleName === 'maps.js'
    ? normalizedFrames
    : addBrushTexture(normalizedFrames, brushAliases, key, category);
  if (moduleName !== 'maps.js' && brushAliases.size > 0) registry.texturedSprites++;

  return {
    anchor: sprite.anchor || 'center',
    fps: Number(sprite.fps || 1),
    loop: sprite.loop !== false,
    legend: styledLegend,
    frames: paintedFrames,
    style: category.code,
  };
}

// Shanshuihua treatment -------------------------------------------------------
// The source art is indexed pixel art, so the safest maintainable restyle is to retain every
// opaque mask and animation grid while changing the indexed pigments. Each category receives a
// small mineral-pigment bias; sparse deterministic aliases add ink pooling / dry-brush variation
// without adding or removing a single opaque pixel.

function styleCategory(moduleName, key) {
  if (moduleName === 'backgrounds.js') return STYLE_CATEGORIES.background;
  if (moduleName === 'worldmap.js') return STYLE_CATEGORIES.worldmap;
  if (moduleName === 'maps.js') return STYLE_CATEGORIES.map;
  if (moduleName.includes('w1_grass')) return STYLE_CATEGORIES.grass;
  if (moduleName.includes('w2_mountain')) return STYLE_CATEGORIES.mountain;
  if (moduleName.includes('w3_sand')) return STYLE_CATEGORIES.sand;
  if (moduleName.includes('w4_garden')) return STYLE_CATEGORIES.garden;
  if (moduleName.includes('w5_shadow')) return STYLE_CATEGORIES.shadow;
  if (moduleName === 'troops_w1.js') return STYLE_CATEGORIES.grass;
  if (moduleName === 'troops_w2.js') return STYLE_CATEGORIES.mountain;
  if (moduleName === 'troops_w3.js') return STYLE_CATEGORIES.sand;
  if (moduleName === 'troops_w4.js') return STYLE_CATEGORIES.garden;
  if (moduleName === 'troops_w5.js') return STYLE_CATEGORIES.shadow;
  if (key.startsWith('orc_') || key.startsWith('proj_orc_')) return STYLE_CATEGORIES.orc;
  if (key.startsWith('crypt_') || key.startsWith('proj_crypt_')) return STYLE_CATEGORIES.crypt;
  if (key.startsWith('demon_') || key.startsWith('proj_demon_')) return STYLE_CATEGORIES.demon;
  if (key.startsWith('goblin_') || key.startsWith('proj_goblin_')) return STYLE_CATEGORIES.goblin;
  if (moduleName === 'buildings.js') return STYLE_CATEGORIES.building;
  if (moduleName === 'gems.js') return STYLE_CATEGORIES.gem;
  if (moduleName === 'icons.js' || moduleName === 'ui_chrome.js') return STYLE_CATEGORIES.ui;
  if (moduleName === 'obstacles.js') return STYLE_CATEGORIES.obstacle;
  if (['fx.js', 'fx_abilities.js', 'enchants.js', 'particles.js', 'projectiles.js'].includes(moduleName)) {
    return STYLE_CATEGORIES.magic;
  }
  return STYLE_CATEGORIES.general;
}

function createShanshuiRegistry(sourcePalette) {
  const palette = {};
  for (const [code, hex] of Object.entries(sourcePalette)) palette[code] = mineralize(hex);
  const registry = {
    palette,
    sourcePalette,
    texturedSprites: 0,
    variant(baseCode, category, tone) {
      const variantCode = `SS_${category.code}_${tone}_${baseCode}`;
      if (palette[variantCode]) return variantCode;
      let color = mixHex(palette[baseCode], category.tint, category.tintMix);
      if (tone === 'ink') color = mixHex(color, '#171814', category.inkMix);
      if (tone === 'dry') color = mixHex(color, '#eadfc7', category.dryMix);
      palette[variantCode] = color;
      return variantCode;
    },
  };
  return registry;
}

function addBrushTexture(frames, aliases, key, category) {
  if (aliases.size === 0 || category.texture <= 0) return frames;
  let marks = 0;
  const seed = stableHash(key);
  const result = frames.map((rows, frameIndex) => rows.map((row, y) => {
    const cells = row.split('');
    for (let x = 0; x < cells.length; x++) {
      const alias = aliases.get(cells[x]);
      if (!alias) continue;
      const h = stableHash(`${seed}:${frameIndex}:${x}:${y}`);
      // Broken diagonal runs read as a dry loaded brush rather than uniform digital noise.
      const sweep = ((x + y * 3 + frameIndex * 5 + seed) & 15) === 0;
      if ((h % 1000) < category.texture * 1000 || sweep && (h & 3) === 0) {
        cells[x] = alias;
        marks++;
      }
    }
    return cells.join('');
  }));

  // Guarantee a visible-but-subtle mark even on tiny one-frame sprites.
  if (marks === 0) {
    outer: for (const rows of result) {
      for (let y = 0; y < rows.length; y++) {
        const cells = rows[y].split('');
        for (let x = 0; x < cells.length; x++) {
          const alias = aliases.get(cells[x]);
          if (!alias) continue;
          cells[x] = alias;
          rows[y] = cells.join('');
          break outer;
        }
      }
    }
  }
  return result;
}

function mineralize(hex) {
  const rgb = parseHex(hex);
  const hsl = rgbToHsl(rgb);
  const neutral = hsl.s < 0.12;
  if (neutral) {
    const paperRamp = mixRgb(parseHex('#171814'), parseHex('#eadfc7'), Math.pow(hsl.l, 0.88));
    paperRamp.a = rgb.a;
    return toHex(paperRamp);
  }
  // Compress synthetic saturation into historical mineral-pigment territory while retaining the
  // original hue families that communicate damage types, biomes, and faction identity.
  hsl.s = clamp(0.22 + hsl.s * 0.30, 0.22, 0.50);
  hsl.l = clamp(0.055 + Math.pow(hsl.l, 0.92) * 0.84, 0.055, 0.90);
  let painted = { ...hslToRgb(hsl), a: rgb.a };
  painted = mixRgb(painted, hsl.l > 0.62 ? parseHex('#eadfc7') : parseHex('#1b1b17'), 0.06);
  return toHex(painted);
}

function parseHex(hex) {
  const clean = String(hex).replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
    a: clean.length >= 8 ? parseInt(clean.slice(6, 8), 16) : 255,
  };
}

function toHex({ r, g, b, a = 255 }) {
  const channel = n => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');
  const alpha = channel(a);
  return `#${channel(r)}${channel(g)}${channel(b)}${alpha === 'ff' ? '' : alpha}`;
}

function mixHex(a, b, t) {
  return toHex(mixRgb(parseHex(a), parseHex(b), t));
}

function mixRgb(a, b, t) {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
    // Alpha is part of the sprite contract (soft shadows/glows), not a pigment to interpolate.
    a: a.a,
  };
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h / 6, s, l };
}

function hslToRgb({ h, s, l }) {
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255 };
  const hue = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return { r: hue(p, q, h + 1 / 3) * 255, g: hue(p, q, h) * 255, b: hue(p, q, h - 1 / 3) * 255 };
}

function stableHash(value) {
  let hash = 0x811c9dc5;
  for (const ch of String(value)) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
