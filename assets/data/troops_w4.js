// assets/data/troops_w4.js — W4 Royal Gardens · King's Royal Guard (11 archetypes).
// Rebuilt at 64×64 on the humanoid + rider kit, plus inline clockwork & siege-wagon. No attack frames.
import { buildHumanoid, buildRider, G, set, disc, rectf, limb, outline } from './humankit.js';

export const META = { group: 'Troops · W4 Royal Gardens', blurb: "The King's Royal Guard at 2× density — gilt plate and clockwork in royal blue. Royal Engineer vents a steam-shield, Court Conjurer bubbles an ally-shield, the Standard-Bearer flies a banner aura, the Clockwork Sentinel hovers on a propeller, the Royal Falconer takes wing, the Royal Prince rides (and dismounts to carry), a Siege Wagon rolls, Lord-Commander rallies, and the King decrees. Attack frames omitted by design." };

export const LEGEND = {
  '`': null, o: 'IK1', O: 'IK0',
  s: 'SK1', S: 'SK3', p: 'SK4',
  i: 'IR1', j: 'IR2', I: 'IR4', G: 'IR0',
  d: 'GD2', D: 'GD4', y: 'GD5',                 // gold (heavy gilt)
  c: 'AQ2', C: 'AQ4',                           // royal-blue cloth (capes/tabards/banners)
  n: 'BN3', N: 'BN5', q: 'BN2',
  w: 'WD3', W: 'WD1',
  k: 'BR1', K: 'BR3',                           // brass (clockwork / wagon)
  r: 'BL2', R: 'BL3',
  b: 'AQ4', B: 'AQ6', f: 'IC3', F: 'IC5',       // steam / shield bubble
  g: 'MS4', m: 'MS3', h: 'MS6',
  e: 'EM4', E: 'EM6', t: 'EM2',
  v: 'CR3', V: 'CR5', x: 'HX3', X: 'HX5',
};

const ring = (g, cx, cy, rad, sx, ch) => { for (let a = 0; a < 360; a += 16) set(g, cx + Math.round(rad * Math.cos(a * Math.PI / 180)), cy + Math.round(rad * sx * Math.sin(a * Math.PI / 180)), ch); };
function steamShield(g, fr) { ring(g, 30, 36, 9 + fr, 0.7, fr % 2 ? 'F' : 'b'); for (let i = 0; i < 4; i++) { const x = 24 + i * 4, y = 24 - (fr + i) % 3; set(g, x, y, 'B'); set(g, x, y - 1, 'f'); } }
function allyShield(g, fr) { const rad = [4, 8, 12, 12][fr]; ring(g, 30, 34, rad, 0.85, 'b'); ring(g, 30, 34, rad - 1 > 1 ? rad - 1 : 1, 0.85, 'F'); }
function bannerAura(g, fr) { ring(g, 30, 40, 8 + fr * 2, 0.55, fr % 2 ? 'y' : 'D'); for (const [x, y] of [[24, 26], [37, 30]]) set(g, x, y, 'y'); }
function rally(g, fr) { ring(g, 30, 42, 6 + fr * 3, 0.5, fr % 2 ? 'D' : 'y'); for (let i = 0; i <= fr; i++) set(g, 26 + i * 3, 20 - i, 'y'); }
function decree(g, fr) { for (let i = 0; i < 8; i++) { const a = (fr / 4) * 6.28 + i * 0.8, rad = 6 + fr * 4 + (i % 3) * 2; set(g, 30 + Math.round(rad * Math.cos(a)), 36 - fr * 2 + Math.round(rad * 0.5 * Math.sin(a)), i % 2 ? 'y' : 'b'); } }

// ---- humanoid units ----
const household = buildHumanoid({ body: 'plate', head: 'kettle', hair: 'N', build: 'default', hgt: 0, weapon: 'spear', shield: 'round', trim: 'gold' });
const kingsguard = buildHumanoid({ body: 'plate', head: 'sallet', hair: 'q', build: 'wide', hgt: 1, weapon: 'sword', shield: 'heater', tabard: true, trim: 'gold', crest: 'C' });
const engineer = buildHumanoid({ body: 'leather', head: 'cap', hair: 'q', build: 'lean', hgt: -1, weapon: 'hammer', softFx: 'bBF', ability: steamShield, abilityFps: 8 });
const conjurer = buildHumanoid({ body: 'cloth', head: 'hood', hair: 'N', build: 'slim', hgt: 2, weapon: 'staff', glow: 'b', softFx: 'bBF', ability: allyShield, abilityFps: 8 });
const standard = buildHumanoid({ body: 'plate', head: 'winged', hair: 'd', build: 'slim', hgt: 3, lean: 1, weapon: 'banner', trim: 'gold', backBanner: { cloth1: 'd', cloth2: 'y', emblem: [[0, 0], [0, 1], [-1, 2], [1, 2]], emblemCol: 'C' }, softFx: 'yD', ability: bannerAura, abilityFps: 8 });
const falconer = buildHumanoid({ body: 'leather', head: 'winged', hair: 'y', build: 'tiny', hgt: 1, scale: 0.74, weapon: 'spear', wings: 'feather', flyer: true, trim: 'gold' });
const lord = buildHumanoid({ body: 'plate', build: 'giant', hgt: 0, shoW: 6, head: 'barbute', hair: 'd', weapon: 'mace', shield: 'spiked', cape: true, trim: 'gold', crest: 'y', crestTall: true, softFx: 'yD', ability: rally, abilityFps: 9 });
const king = buildHumanoid({ body: 'plate', build: 'giant', hgt: 1, shoW: 7, scale: 1.45, head: 'crown', hair: 'y', weapon: 'greatsword', cape: true, tabard: true, trim: 'gold', crest: 'y', crestTall: true, backBanner: { cloth1: 'y', cloth2: 'd', emblem: [[0, 0], [-1, 1], [1, 1], [0, 2], [0, 3]], emblemCol: 'C' }, softFx: 'ybD', ability: decree, abilityFps: 9, abilityLoop: false });

// ---- mounted carrier: Royal Prince ----
const princeRide = buildRider({ body: 'plate', head: 'crown', hair: 'd', weapon: 'sword', cape: true, trim: 'gold', hide: { lo: 'k', mi: 'K', hi: 'q' }, saddle: true });
const princeFoot = buildHumanoid({ body: 'plate', head: 'crown', hair: 'd', build: 'default', hgt: 1, weapon: 'sword', cape: true, trim: 'gold' });
const royalPrince = { idle: princeRide.idle, walk: princeRide.walk, death: princeRide.death,
  carry: { anchor: 'foot', fps: 6, loop: true, frames: princeFoot.walk.frames.map(f => { const g = f.map(r => r.split('')); for (let x = 27; x <= 33; x++) g[8][x] = x % 2 ? 'b' : 'B'; g[7][30] = 'B'; return g.map(r => r.join('')); }) } };

// ---- Clockwork Sentinel — bespoke brass mech, propeller hover ----
function clockwork(prop, bob) {
  const g = G(), cx = 30, by = 34 + bob;
  rectf(g, cx - 6, by - 5, 12, 12, 'K'); for (let y = by - 5; y < by + 7; y++) { set(g, cx - 6, y, 'I'); set(g, cx + 5, y, 'k'); }   // brass body
  for (let yy = by - 3; yy <= by + 5; yy += 3) for (let x = cx - 4; x <= cx + 4; x += 4) set(g, x, yy, 'r');                            // rivets
  disc(g, cx, by, 3, 'b'); set(g, cx, by, 'F'); set(g, cx - 1, by - 1, 'F');                                                           // glass eye
  // propeller mast + spinning blades
  set(g, cx, by - 6, 'i'); set(g, cx, by - 7, 'i');
  const sp = prop === 0 ? 8 : prop === 1 ? 4 : 6;
  for (let x = -sp; x <= sp; x++) set(g, cx + x, by - 8, Math.abs(x) > sp - 2 ? 'i' : 'I');
  if (prop === 1) for (let y = -sp; y <= sp; y++) set(g, cx, by - 8 + 0, 'I');
  // dangling legs
  for (const s of [-1, 1]) { limb(g, cx + s * 3, by + 6, cx + s * 4, by + 12, 1, 'k', 'K', 'I'); set(g, cx + s * 4, by + 13, 'O'); }
  outline(g, 'o'); return g.map(r => r.join(''));
}
const clockworkSentinel = {
  idle: { anchor: 'foot', fps: 4, loop: true, frames: [clockwork(0, 0), clockwork(2, 1)] },
  walk: { anchor: 'foot', fps: 6, loop: true, frames: [clockwork(0, 0), clockwork(2, 1), clockwork(0, 0), clockwork(2, 1)] },
  fly: { anchor: 'foot', fps: 12, loop: true, frames: [clockwork(0, 0), clockwork(1, -1), clockwork(2, 0), clockwork(1, 1)] },
  death: { anchor: 'foot', fps: 7, loop: false, frames: [clockwork(0, 0), (() => { const g = G(); rectf(g, 22, 56, 16, 4, 'K'); for (let i = 0; i < 6; i++) set(g, 20 + i * 4, 55, 'i'); outline(g); return g.map(r => r.join('')); })()] },
};

// ---- Siege Wagon — bespoke armored cart + engineer crew ----
function siegeWagon(roll) {
  const g = G(), cx = 30, by = 36;
  rectf(g, cx - 14, by - 8, 28, 12, 'k'); for (let x = cx - 14; x < cx + 14; x++) { set(g, x, by - 8, 'K'); set(g, x, by + 3, 'i'); }   // hull
  for (let y = by - 8; y <= by + 3; y += 2) for (let x = cx - 13; x <= cx + 12; x += 5) set(g, x, y, 'r');                               // bolts
  for (let y = by - 12; y <= by - 6; y++) for (let x = cx + 10; x <= cx + 16; x++) set(g, x, y, x < cx + 12 ? 'I' : 'i');                // armored ram front
  // two big wheels
  for (const wx of [cx - 9, cx + 8]) { disc(g, wx, by + 8, 6, 'i'); disc(g, wx, by + 8, 3, 'k'); for (let a = 0; a < 360; a += 45) set(g, wx + Math.round(5 * Math.cos((a + roll * 22) * Math.PI / 180)), by + 8 + Math.round(5 * Math.sin((a + roll * 22) * Math.PI / 180)), 'K'); set(g, wx, by + 8, 'y'); }
  // engineer crew up top
  const cy = by - 9; disc(g, cx - 2, cy - 3, 2, 'S'); for (let x = -2; x <= 2; x++) set(g, cx - 2 + x, cy - 5, 'q'); rectf(g, cx - 4, cy - 1, 5, 5, 'C'); limb(g, cx, cy, cx + 5, cy - 3, 0.7, 'w', 'w', 'W');
  outline(g, 'o'); return g.map(r => r.join(''));
}
const siegeWagonUnit = {
  idle: { anchor: 'foot', fps: 2, loop: true, frames: [siegeWagon(0), siegeWagon(0)] },
  walk: { anchor: 'foot', fps: 8, loop: true, frames: [0, 1, 2, 3].map(siegeWagon) },
  ability: { anchor: 'foot', fps: 8, loop: true, frames: [0, 1, 2, 3].map(k => { const f = siegeWagon(k).map(r => r.split('')); steamShield2(f, k); return f.map(r => r.join('')); }) },
  death: { anchor: 'foot', fps: 7, loop: false, frames: [siegeWagon(0), (() => { const g = G(); rectf(g, 16, 54, 28, 6, 'k'); for (let i = 0; i < 8; i++) set(g, 14 + i * 4, 53, 'i'); outline(g); return g.map(r => r.join('')); })()] },
};
function steamShield2(f, fr) { for (let a = 0; a < 360; a += 20) { const x = 30 + Math.round((10 + fr) * Math.cos(a * Math.PI / 180)), y = 34 + Math.round((10 + fr) * 0.7 * Math.sin(a * Math.PI / 180)); if (y >= 0 && y < 64 && x >= 0 && x < 64) f[y][x] = fr % 2 ? 'F' : 'b'; } }

export const SPRITES = {};
function add(name, set, keys) { for (const k of keys) if (set[k]) SPRITES[`troop_${name}_${k}`] = set[k]; }
const STD = ['idle', 'walk', 'death'];
add('household_guard', household, STD);
add('kingsguard', kingsguard, STD);
add('royal_engineer', engineer, [...STD, 'ability']);
add('court_conjurer', conjurer, [...STD, 'ability']);
add('clockwork_sentinel', clockworkSentinel, ['idle', 'walk', 'fly', 'death']);
add('royal_standard_bearer', standard, [...STD, 'ability']);
add('royal_falconer', falconer, ['idle', 'fly', 'walk', 'death']);
add('royal_prince', royalPrince, ['idle', 'walk', 'carry', 'death']);
add('siege_wagon', siegeWagonUnit, ['idle', 'walk', 'ability', 'death']);
add('lord_commander', lord, [...STD, 'ability']);
add('king', king, [...STD, 'ability']);
