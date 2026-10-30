// assets/data/troops_w2.js — W2 Holy Mountains · High Priest's Procession (10 archetypes).
// Rebuilt at 64×64 on the parametric humanoid kit. idle · walk · (fly) · (ability) · death.
import { buildHumanoid, set, disc } from './humankit.js';

export const META = { group: 'Troops · W2 Holy Mountains', blurb: "The Priest's Procession at 2× density — cream-robed zealots with ice-touched steel. Flagellant whips into a blood-frenzy, Bard sings a note-ring, War Cleric pulses a heal-glow, Inquisitor flashes a cleanse, Monk ascends a light pillar (→ Templar), the Seraph beats feathered wings, and the High Priest casts. Each special has its own animation; attack frames omitted by design." };

export const LEGEND = {
  '`': null, o: 'IK1', O: 'IK0',
  s: 'SK1', S: 'SK3', p: 'SK4',                 // skin
  i: 'IR1', j: 'IR2', I: 'IR4', G: 'IR0',       // steel
  d: 'GD2', D: 'GD4', y: 'GD5',                 // gold
  c: 'IC1', C: 'IC3',                           // ice-blue accent cloth (capes/trim)
  n: 'BN3', N: 'BN5', q: 'BN2',                 // cream robe / leather / hair
  w: 'WD3', W: 'WD1',                           // wood
  k: 'RK2', K: 'RK4',                           // grey stone (unused hide fallback)
  r: 'BL2', R: 'BL3',                           // blood-frenzy
  b: 'AQ4', B: 'AQ6', f: 'IC3', F: 'IC5',       // staff / ice halo
  g: 'MS4', m: 'MS3', h: 'MS6',                 // heal-glow green
  e: 'EM4', E: 'EM6', t: 'EM2',                 // cast motes
  v: 'CR3', V: 'CR5', x: 'HX3', X: 'HX5',       // cleanse purple
};

// ---- ability FX painters ----
const ring = (g, cx, cy, rad, sx, ch) => { for (let a = 0; a < 360; a += 18) set(g, cx + Math.round(rad * Math.cos(a * Math.PI / 180)), cy + Math.round(rad * sx * Math.sin(a * Math.PI / 180)), ch); };
function bloodFrenzy(g, fr) { for (let i = 0; i < 6; i++) { const a = (fr / 4) * 6.28 + i, rad = 10 + (i % 3) * 3; set(g, 30 + Math.round(rad * Math.cos(a)), 36 + Math.round(rad * 0.6 * Math.sin(a)), i % 2 ? 'R' : 'r'); } ring(g, 30, 40, 6 + fr, 0.5, 'r'); }
function sing(g, fr) { const notes = [[42, 18], [46, 13], [40, 10], [45, 22]]; for (let i = 0; i <= fr; i++) { const [x, y] = notes[i % notes.length]; set(g, x, y, 'F'); set(g, x + 1, y, 'b'); set(g, x, y + 1, 'B'); } ring(g, 30, 58, 6 + fr * 3, 0.35, 'f'); }
function healGlow(g, fr) { ring(g, 30, 36, 8 + fr * 2, 0.6, fr % 2 ? 'h' : 'g'); for (const [x, y] of [[24, 22], [37, 26], [30, 18]]) { if ((x + fr) % 2) { set(g, x, y, 'h'); set(g, x, y - 1, 'g'); } } }
function cleanse(g, fr) { const rad = [2, 7, 13, 19][fr]; ring(g, 30, 32, rad, 0.7, fr < 2 ? 'V' : 'F'); ring(g, 30, 32, rad - 3 > 1 ? rad - 3 : 1, 0.7, 'v'); }
function ascension(g, fr) { const h = [6, 14, 24, 34][fr]; for (let y = 60 - h; y <= 60; y++) { const w = 3 - Math.floor((60 - y) / 14); for (let x = -w; x <= w; x++) set(g, 30 + x, y, x === 0 ? 'F' : 'f'); } for (let i = 0; i < fr + 1; i++) set(g, 26 + i * 3, 58 - h + i * 4, 'y'); }
function castRite(g, fr) { for (let i = 0; i < 8; i++) { const a = (fr / 4) * 6.28 + i * 0.8, rad = 6 + fr * 4 + (i % 3) * 2; set(g, 30 + Math.round(rad * Math.cos(a)), 36 - fr * 2 + Math.round(rad * 0.5 * Math.sin(a)), i % 2 ? 'F' : 'b'); } }
function shimmer(g, fr) { for (const [x, y] of [[20, 18], [40, 30], [24, 44], [38, 22], [30, 38]]) if ((x + fr) % 2 === 0) { set(g, x, y, 'F'); set(g, x + 1, y, 'f'); } }

// ---- units ----
const acolyte = buildHumanoid({ body: 'cloth', head: 'hood', hair: 'q', build: 'lean', hgt: 0, scale: 0.78, weapon: 'mace', glow: 'F' });
const templeGuard = buildHumanoid({ body: 'mail', head: 'kettle', hair: 'N', build: 'wide', hgt: 1, weapon: 'spear', shield: 'round', trim: 'steel' });
const flagellant = buildHumanoid({ body: 'cloth', head: 'bare', hair: 'q', build: 'slim', hgt: 2, lean: -1, weapon: 'scythe', softFx: 'rR', ability: bloodFrenzy, abilityFps: 9 });
const bard = buildHumanoid({ body: 'cloth', head: 'cap', hair: 'd', build: 'lean', hgt: 0, weapon: 'staff', glow: 'b', softFx: 'fFbB', ability: sing, abilityFps: 7 });
const warCleric = buildHumanoid({ body: 'cloth', head: 'mitre', hair: 'N', build: 'default', hgt: 1, weapon: 'mace', glow: 'g', trim: 'gold', softFx: 'gmh', ability: healGlow, abilityFps: 8 });
const inquisitor = buildHumanoid({ body: 'leather', head: 'hood', hair: 'k', build: 'wide', hgt: 0, weapon: 'staff', glow: 'e', softFx: 'vVF', ability: cleanse, abilityFps: 9 });
const monk = buildHumanoid({ body: 'cloth', head: 'hood', hair: 'q', build: 'slim', hgt: 3, weapon: 'none', softFx: 'fFy', ability: ascension, abilityFps: 7, abilityLoop: false });
const templar = buildHumanoid({ body: 'plate', head: 'sallet', hair: 'd', build: 'giant', hgt: -1, shoW: 6, scale: 1.3, weapon: 'sword', shield: 'heater', tabard: true, trim: 'gold', crest: 'C', softFx: 'fF', ability: shimmer, abilityFps: 10 });
const seraph = buildHumanoid({ body: 'cloth', head: 'winged', hair: 'y', build: 'default', hgt: 2, weapon: 'greatsword', wings: 'feather', flyer: true, trim: 'gold', crest: 'y', crestTall: true });
const highPriest = buildHumanoid({ body: 'cloth', head: 'mitre', hair: 'y', build: 'default', hgt: 1, scale: 1.32, weapon: 'staff', glow: 'F', cape: true, trim: 'gold', backBanner: { cloth1: 'F', cloth2: 'C', emblem: [[0, 0], [0, 1], [-1, 2], [1, 2]], emblemCol: 'y' }, softFx: 'fFbe', ability: castRite, abilityFps: 9, abilityLoop: false });

export const SPRITES = {};
function add(name, set, keys) { for (const k of keys) if (set[k]) SPRITES[`troop_${name}_${k}`] = set[k]; }
const STD = ['idle', 'walk', 'death'];
add('acolyte', acolyte, STD);
add('temple_guard', templeGuard, STD);
add('flagellant', flagellant, [...STD, 'ability']);
add('bard', bard, [...STD, 'ability']);
add('war_cleric', warCleric, [...STD, 'ability']);
add('inquisitor', inquisitor, [...STD, 'ability']);
add('monk', monk, [...STD, 'ability']);
add('templar', templar, [...STD, 'ability']);
add('seraph', seraph, ['idle', 'fly', 'walk', 'death']);
add('high_priest', highPriest, [...STD, 'ability']);
