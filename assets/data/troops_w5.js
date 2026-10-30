// assets/data/troops_w5.js — W5 Shadow Realm · The Shadow Legion (10 archetypes).
// Rebuilt at 64×64 on the humanoid + beast kit, plus an inline imp swarm. No attack frames.
import { buildHumanoid, buildBeast, G, set, disc, limb, outline } from './humankit.js';

export const META = { group: 'Troops · W5 Shadow Realm', blurb: "The Shadow Legion at 2× density — void-purple flesh and cursed steel. Shadow Wraith flickers untargetable, Void Priest resurrects the fallen, Soul-Eater leeches on death, the Gem Shade blinks toward the hoard, a Hellhound lopes, and the Demon Shadow King wears The King's corrupted silhouette and tears open portals. Attack frames omitted by design." };

export const LEGEND = {
  '`': null, o: 'IK1', O: 'IK0',
  s: 'SK1', S: 'SK3', p: 'SK4',
  i: 'IR1', j: 'IR2', I: 'IR4', G: 'IR0',
  d: 'GD2', D: 'GD4', y: 'GD5',
  c: 'CR2', C: 'CR4',                           // void-purple cloth
  n: 'BN3', N: 'BN5', q: 'BN2',
  w: 'WD3', W: 'WD1',
  k: 'CR1', K: 'CR3',                           // shadow hide (cursed purple-black)
  r: 'BL2', R: 'BL3',                           // leech blood
  b: 'AQ4', B: 'AQ6', f: 'IC3', F: 'IC5',
  g: 'MS4', m: 'MS3', h: 'MS6',                 // resurrect green
  e: 'EM4', E: 'EM6', t: 'EM2',
  v: 'CR3', V: 'CR5', x: 'HX3', X: 'HX5',       // phase / portal / curse
};

const ring = (g, cx, cy, rad, sx, ch) => { for (let a = 0; a < 360; a += 16) set(g, cx + Math.round(rad * Math.cos(a * Math.PI / 180)), cy + Math.round(rad * sx * Math.sin(a * Math.PI / 180)), ch); };
function phase(g, fr) { for (let y = 16; y < 58; y += 2) for (let x = 22; x < 40; x += 2) if ((x + y + fr * 4) % 6 === 0) set(g, x, y, fr % 2 ? 'v' : 'V'); }
function resurrect(g, fr) { ring(g, 30, 50, 6 + fr * 3, 0.4, fr % 2 ? 'm' : 'g'); for (let i = 0; i <= fr; i++) set(g, 24 + i * 4, 56 - i * 6, 'h'); }
function leech(g, fr) { for (let i = 0; i < 6; i++) { const a = (fr / 4) * 6.28 + i, rad = 12 - fr * 2; set(g, 30 + Math.round(rad * Math.cos(a)), 36 + Math.round(rad * 0.6 * Math.sin(a)), i % 2 ? 'R' : 'v'); } }
function blink(g, fr) { for (let i = 0; i < 5; i++) set(g, 38 + i * 2, 30 + i * 3, fr % 2 ? 'X' : 'x'); ring(g, 30, 38, 4 + fr * 3, 0.6, 'v'); set(g, 44, 22, 'b'); set(g, 45, 22, 'B'); }
function reflect(g, fr) { ring(g, 30, 36, 9, 0.7, fr % 2 ? 'V' : 'x'); for (const [x, y] of [[22, 24], [38, 28], [26, 44]]) if ((x + fr) % 2) set(g, x, y, 'X'); }
function portal(g, fr) { for (let i = 0; i < 12; i++) { const a = (fr / 4) * 6.28 + i * 0.5, rad = 6 + fr * 4; set(g, 30 + Math.round(rad * Math.cos(a)), 34 + Math.round(rad * 0.8 * Math.sin(a)), i % 3 ? 'x' : 'X'); } ring(g, 30, 34, 4, 0.8, 'v'); }

// ---- humanoid units ----
const wraith = buildHumanoid({ body: 'shadow', head: 'hood', hair: 'O', build: 'slim', hgt: 2, lean: -1, weapon: 'scythe', softFx: 'vVxX', ability: phase, abilityFps: 8 });
const cursedSoldier = buildHumanoid({ body: 'plate', head: 'barbute', hair: 'O', build: 'wide', hgt: 0, weapon: 'sword', shield: 'spiked', trim: 'steel', crest: 'C' });
const voidPriest = buildHumanoid({ body: 'shadow', head: 'hood', hair: 'k', build: 'lean', hgt: 1, weapon: 'staff', glow: 'x', softFx: 'gmhx', ability: resurrect, abilityFps: 8 });
const soulEater = buildHumanoid({ body: 'shadow', head: 'horns', hair: 'k', build: 'default', hgt: -1, weapon: 'claws', softFx: 'rRv', ability: leech, abilityFps: 9 });
const gemShade = buildHumanoid({ body: 'shadow', head: 'hood', hair: 'N', build: 'slim', hgt: 3, scale: 0.8, weapon: 'none', softFx: 'vxXbB', ability: blink, abilityFps: 9 });
const doomKnight = buildHumanoid({ body: 'plate', build: 'giant', hgt: 0, shoW: 6, head: 'horns', hair: 'O', weapon: 'greatsword', shield: 'tower', cape: true, trim: 'gold', crest: 'V', crestTall: true, softFx: 'vVxX', ability: reflect, abilityFps: 9 });
const shadowKing = buildHumanoid({ body: 'shadow', build: 'giant', hgt: 1, shoW: 7, scale: 1.5, head: 'crown', hair: 'y', weapon: 'greatsword', cape: true, tabard: true, trim: 'gold', glow: 'x', backBanner: { cloth1: 'v', cloth2: 'V', emblem: [[0, 0], [-1, 1], [1, 1], [0, 2], [0, 3]], emblemCol: 'x' }, softFx: 'vVxX', ability: portal, abilityFps: 9, abilityLoop: false });

// ---- beasts ----
const hellhound = buildBeast({ hide: { lo: 'O', mi: 'k', hi: 'K' }, mane: true, horns: true, softFx: 'eE' });
function cursedRider(g, cx, topY, k) { const hy = topY - 10, sy = topY - 4; for (let y = sy; y <= topY; y++) for (let x = cx - 2; x <= cx + 2; x++) set(g, x, y, x < cx - 1 ? 'I' : 'j'); disc(g, cx, hy, 2, 'S'); for (let x = -3; x <= 1; x++) set(g, cx + x, hy - 2, 'K'); limb(g, cx + 1, sy + 1, cx + 7, sy - 4, 1, STEELWp(), STEELWp(), 'I'); }
function STEELWp() { return 'j'; }
const abyssal = buildBeast({ hide: { lo: 'O', mi: 'k', hi: 'K' }, big: true, horns: true, mane: true, rider: cursedRider, softFx: 'eE' });

// ---- Imp Swarm — bespoke flock of 3 bat-winged imps ----
function imp(g, cx, cy, flap) {
  disc(g, cx, cy, 2, 'k'); set(g, cx - 1, cy - 1, 'K'); set(g, cx + 1, cy, 'r'); set(g, cx, cy - 2, 'O');           // body + eye + horn
  const sp = [3, 1, 4][flap] || 2;
  for (const s of [-1, 1]) { limb(g, cx + s * 2, cy, cx + s * (2 + sp), cy - 3, 0.6, 'O', 'k', 'K'); set(g, cx + s * (2 + sp), cy - 3, 'K'); }
  set(g, cx, cy + 3, 'v');                                                                                          // tail
}
function impSwarm(k) { const g = G(); const spots = [[20, 30], [36, 24], [30, 42]]; spots.forEach(([x, y], i) => imp(g, x, y + ((k + i) % 2 ? -2 : 2), (k + i) % 3)); outline(g, 'o', 'v'); return g.map(r => r.join('')); }
const imps = {
  idle: { anchor: 'foot', fps: 4, loop: true, frames: [impSwarm(0), impSwarm(1)] },
  fly: { anchor: 'foot', fps: 11, loop: true, frames: [impSwarm(0), impSwarm(1), impSwarm(2), impSwarm(1)] },
  walk: { anchor: 'foot', fps: 8, loop: true, frames: [impSwarm(0), impSwarm(1), impSwarm(2), impSwarm(1)] },
  death: { anchor: 'foot', fps: 7, loop: false, frames: [impSwarm(0), (() => { const g = G(); for (let i = 0; i < 12; i++) set(g, 24 + i, 59, 'k'); outline(g); return g.map(r => r.join('')); })()] },
};

export const SPRITES = {};
function add(name, set, keys) { for (const k of keys) if (set[k]) SPRITES[`troop_${name}_${k}`] = set[k]; }
const STD = ['idle', 'walk', 'death'];
add('shadow_wraith', wraith, [...STD, 'ability']);
add('cursed_soldier', cursedSoldier, STD);
add('imp_swarm', imps, ['idle', 'fly', 'walk', 'death']);
add('hellhound', hellhound, STD);
add('void_priest', voidPriest, [...STD, 'ability']);
add('abyssal_behemoth', abyssal, STD);
add('soul_eater', soulEater, [...STD, 'ability']);
add('gem_shade', gemShade, [...STD, 'ability']);
add('doom_knight', doomKnight, [...STD, 'ability']);
add('shadow_king', shadowKing, [...STD, 'ability']);
