// assets/data/troops_w1.js — W1 Great Grasslands · The General's Host (10 archetypes).
// Rebuilt at 64×64 (2× density, D-21) on the parametric humanoid kit (humankit.js).
// idle · walk · attack · (ability) · death. Abilities are bespoke FX per role (D-04d).
import { buildHumanoid, buildRider, set, disc } from './humankit.js';

export const META = { group: 'Troops · W1 Grasslands', blurb: "The General's Host at 2× density — peasants to plate, built on a jointed humanoid rig (idle·walk·attack·death, foot-anchored 3/4 view). Banner-Sergeant raises a speed-ring, Pavise Guard slams a taunt pulse, Knight-Lieutenant flares a gold invuln shimmer, the Outrider & Golden Prince ride, and The General casts a summoning rite. Every special has its own animation." };

// Full legend for the humanoid kit (every char it can emit resolves to a master-palette CODE).
export const LEGEND = {
  '`': null, o: 'IK1', O: 'IK0',
  s: 'SK1', S: 'SK3', p: 'SK4',                 // skin
  i: 'IR1', j: 'IR2', I: 'IR4', G: 'IR0',       // iron / plate / mail
  d: 'GD2', D: 'GD4', y: 'GD5',                 // gold trim / royal
  c: 'GB2', C: 'GB4',                           // grass-green cloth (W1 host accent — tabards/capes/banners)
  n: 'BN3', N: 'BN5', q: 'BN2',                 // leather / hair / belt
  w: 'WD3', W: 'WD1',                           // wood shaft
  k: 'WD2', K: 'WD4',                           // horse hide (brown)
  r: 'BL2', R: 'BL3',                           // blood / red proc
  b: 'AQ4', B: 'AQ6', f: 'IC3', F: 'IC5',       // staff/aura cool glow
  g: 'MS4', m: 'MS3', h: 'MS6',                 // speed-ring green glow
  e: 'EM4', E: 'EM6', t: 'EM2',                 // warm cast motes
  v: 'CR3', V: 'CR5', x: 'HX3', X: 'HX5',       // fear/curse hooks (unused here, kept for parity)
};

// ---- ability FX painters (drawn over the idle pose) ----
const ring = (g, cx, cy, rad, ch) => { for (let a = 0; a < 360; a += 18) set(g, cx + Math.round(rad * Math.cos(a * Math.PI / 180)), cy + Math.round(rad * 0.4 * Math.sin(a * Math.PI / 180)), ch); };
function speedRing(g, fr) { const cy = 58, rad = [4, 8, 13, 18][fr]; ring(g, 30, cy, rad, fr < 2 ? 'g' : 'h'); ring(g, 30, cy, rad - 3 > 1 ? rad - 3 : 1, 'm'); }
function tauntPulse(g, fr) { const rad = [3, 8, 14, 20][fr]; ring(g, 30, 40, rad, 'R'); if (fr >= 1) ring(g, 30, 40, rad - 4, 'r'); }
function shimmer(g, fr) { const spots = [[20, 18], [40, 30], [24, 44], [38, 22], [30, 38]]; for (let i = 0; i < spots.length; i++) { if ((i + fr) % 2 === 0) { const [x, y] = spots[i]; set(g, x, y, 'y'); set(g, x, y - 1, 'D'); set(g, x + 1, y, 'D'); } } }
function summonCast(g, fr) { for (let i = 0; i < 7; i++) { const a = (fr / 4) * Math.PI * 2 + i * 0.9, rad = 6 + fr * 4 + (i % 3) * 2; const x = 30 + Math.round(rad * Math.cos(a)), y = 40 - fr * 3 + Math.round(rad * 0.5 * Math.sin(a)); set(g, x, y, i % 2 ? 'y' : 'e'); set(g, x, y - 1, 't'); } }

// ---------------- standard infantry ----------------
const peasant = buildHumanoid({ body: 'cloth', head: 'bare', hair: 'k', build: 'lean', hgt: 1, lean: -1, scale: 0.82, weapon: 'pitchfork' });
const guard = buildHumanoid({ body: 'mail', head: 'kettle', hair: 'N', build: 'default', weapon: 'spear', shield: 'round' });
const knight = buildHumanoid({ body: 'plate', head: 'greathelm', hair: 'q', build: 'wide', hgt: 1, weapon: 'sword', shield: 'heater', tabard: true, trim: 'steel', crest: 'C' });
const paladin = buildHumanoid({ body: 'plate', build: 'giant', hgt: -1, shoW: 6, scale: 1.28, head: 'barbute', hair: 'r', weapon: 'hammer', shield: 'tower', cape: true, trim: 'gold' });

// ---------------- mounted ----------------
const outrider = buildRider({ body: 'mail', head: 'helm', hair: 'q', build: 'slim', weapon: 'spear', hide: { lo: 'k', mi: 'K', hi: 'q' }, saddle: true });

// ---------------- aura-emitter: Banner-Sergeant (speed + fearless ring) ----------------
const bannerSergeant = buildHumanoid({ body: 'mail', head: 'sallet', hair: 'd', build: 'slim', hgt: 3, lean: 1, weapon: 'banner', trim: 'steel',
  backBanner: { cloth1: 'c', cloth2: 'C', emblem: [[0, 0], [1, 1], [-1, 1], [0, 2]], emblemCol: 'y' },
  softFx: 'gmhGMH', ability: speedRing, abilityFps: 8 });

// ---------------- Pavise Guard — big shield + taunt pulse ----------------
const pavise = buildHumanoid({ body: 'plate', head: 'kettle', hair: 'O', build: 'wide', hgt: -2, weapon: 'mace', shield: 'pavise', trim: 'steel',
  softFx: 'rR', ability: tauntPulse, abilityFps: 9 });

// ---------------- champion: Knight-Lieutenant — gold plate + invuln shimmer ----------------
const knightLieut = buildHumanoid({ body: 'plate', head: 'winged', hair: 'd', build: 'default', hgt: 2, weapon: 'greatsword', shield: 'spiked', tabard: true, trim: 'gold', crest: 'C', crestTall: true, helmGold: true,
  backBanner: { cloth1: 'd', cloth2: 'y', emblem: [[0, 0], [0, 1], [-1, 2], [1, 2]], emblemCol: 'C' },
  softFx: 'yD', ability: shimmer, abilityFps: 10 });

// ---------------- mounted carrier: Golden Prince (ride + dismounted carry walk + gem hook) ----------------
const goldenPrinceRide = buildRider({ body: 'plate', head: 'crown', hair: 'd', weapon: 'sword', cape: true, trim: 'gold', hide: { lo: 'd', mi: 'D', hi: 'y' }, saddle: true });
const goldenPrinceFoot = buildHumanoid({ body: 'plate', head: 'crown', hair: 'd', build: 'default', hgt: 1, weapon: 'sword', cape: true, trim: 'gold' });
const goldenPrince = {
  idle: goldenPrinceRide.idle, walk: goldenPrinceRide.walk, attack: goldenPrinceRide.attack, death: goldenPrinceRide.death,
  // carry walk — dismounted, slowed; a gem rides on the head anchor (gem overlay composites here)
  carry: { anchor: 'foot', fps: 6, loop: true, frames: goldenPrinceFoot.walk.frames.map(f => { const g = f.map(r => r.split('')); for (let x = 27; x <= 33; x++) { g[8][x] = x % 2 ? 'b' : 'B'; } g[7][30] = 'B'; return g.map(r => r.join('')); }) },
};

// ---------------- boss: The General — summon/cast ----------------
const general = buildHumanoid({ body: 'plate', build: 'giant', hgt: 1, shoW: 6, scale: 1.42, head: 'crown', hair: 'y', weapon: 'greatsword', cape: true, tabard: true, trim: 'gold', crest: 'y', crestTall: true,
  backBanner: { cloth1: 'y', cloth2: 'd', emblem: [[0, 0], [-1, 1], [1, 1], [0, 2], [0, 3]], emblemCol: 'C' },
  softFx: 'eEty', ability: summonCast, abilityFps: 9, abilityLoop: false });

export const SPRITES = {};
function add(name, set, keys) { for (const k of keys) if (set[k]) SPRITES[`troop_${name}_${k}`] = set[k]; }
const STD = ['idle', 'walk', 'death'];   // attack frames dropped (not needed)
add('peasant', peasant, STD);
add('guard', guard, STD);
add('knight', knight, STD);
add('paladin', paladin, STD);
add('outrider', outrider, STD);
add('banner_sergeant', bannerSergeant, [...STD, 'ability']);
add('pavise_guard', pavise, [...STD, 'ability']);
add('knight_lieutenant', knightLieut, [...STD, 'ability']);
add('golden_prince', goldenPrince, ['idle', 'walk', 'attack', 'carry', 'death']);
add('general', general, [...STD, 'ability']);
