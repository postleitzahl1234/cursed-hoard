// assets/data/troops_w3.js — W3 Sea of Sand · Chief Rebel's Warband (12 archetypes).
// Rebuilt at 64×64 on the humanoid + beast kit. idle · walk · (fly) · (ability) · death.
import { buildHumanoid, buildBeast, G, set, disc, limb, outline } from './humankit.js';

export const META = { group: 'Troops · W3 Sea of Sand', blurb: "The Rebel Warband at 2× density — sun-bleached cloth over scavenged steel. Ash-Walker glows ember-proof, Mirage Dancer blinks out of sight, Sandstorm Shaman whips a dust cloud, Rebel Sapper detonates, Glass Sentinel drinks damage to heal, the Giant Vulture wheels overhead, and a Camel Caravan heals its own. Attack frames omitted by design." };

export const LEGEND = {
  '`': null, o: 'IK1', O: 'IK0',
  s: 'SK1', S: 'SK3', p: 'SK4',
  i: 'IR1', j: 'IR2', I: 'IR4', G: 'IR0',
  d: 'GD2', D: 'GD4', y: 'GD5',
  c: 'SD3', C: 'SD5',                           // sand-bleached cloth
  n: 'BN3', N: 'BN5', q: 'BN2',
  w: 'WD3', W: 'WD1',
  k: 'SD1', K: 'SD4',                           // camel / vulture hide (sand-brown)
  r: 'BL2', R: 'BL3',
  b: 'AQ4', B: 'AQ6', f: 'IC3', F: 'IC5',
  g: 'MS4', m: 'MS3', h: 'MS6',
  e: 'EM4', E: 'EM6', t: 'EM2',                 // ember / blast
  v: 'CR3', V: 'CR5', x: 'HX3', X: 'HX5',
};

const ring = (g, cx, cy, rad, sx, ch) => { for (let a = 0; a < 360; a += 18) set(g, cx + Math.round(rad * Math.cos(a * Math.PI / 180)), cy + Math.round(rad * sx * Math.sin(a * Math.PI / 180)), ch); };
function emberShimmer(g, fr) { for (const [x, y] of [[22, 20], [38, 28], [26, 42], [34, 18]]) if ((x + fr) % 2 === 0) { set(g, x, y, 'E'); set(g, x, y + 1, 'e'); } ring(g, 30, 40, 7 + fr, 0.5, 't'); }
function vanish(g, fr) { for (let y = 16; y < 58; y += 2) for (let x = 22; x < 40; x += 2) if ((x + y + fr * 4) % 6 === 0) set(g, x, y, fr < 2 ? 'f' : 'F'); }
function sandstorm(g, fr) { for (let i = 0; i < 14; i++) { const a = (fr / 4) * 6.28 + i * 0.5, rad = 8 + (i % 5) * 3; set(g, 30 + Math.round(rad * Math.cos(a)), 40 + Math.round(rad * 0.6 * Math.sin(a)), i % 2 ? 'C' : 'c'); } }
function deathBlast(g, fr) { const rad = [2, 9, 16, 22][fr]; ring(g, 30, 40, rad, 0.7, fr < 2 ? 'E' : 't'); if (fr >= 1) ring(g, 30, 40, rad - 5 > 1 ? rad - 5 : 1, 0.7, 'e'); }
function absorbHeal(g, fr) { ring(g, 30, 38, 10 - fr * 2, 0.6, fr % 2 ? 'b' : 'B'); for (const [x, y] of [[24, 24], [37, 28]]) set(g, x, y, 'F'); }

// nomad rider on a beast back
function nomadRider(g, cx, topY, k) {
  const hy = topY - 10, sy = topY - 4;
  for (let y = sy; y <= topY; y++) for (let x = cx - 2; x <= cx + 2; x++) set(g, x, y, x < cx - 1 ? 'C' : 'c');   // robed torso
  disc(g, cx, hy, 2, 'S'); for (let x = -2; x <= 2; x++) set(g, cx + x, hy - 2, 'c');                            // head + headwrap
  limb(g, cx + 1, sy + 1, cx + 6, sy - 2, 0.6, 'w', 'w', 'W');                                                   // staff/reins
}

// ---- units ----
const raider = buildHumanoid({ body: 'leather', head: 'cap', hair: 'q', build: 'tiny', hgt: 1, scale: 0.72, weapon: 'sword', shield: 'targe' });
const nomad = buildHumanoid({ body: 'cloth', head: 'hood', hair: 'N', build: 'slim', hgt: 2, weapon: 'spear', shield: 'round' });
const ashWalker = buildHumanoid({ body: 'leather', head: 'cap', hair: 'k', build: 'wide', hgt: 0, weapon: 'mace', glow: 'e', softFx: 'eEt', ability: emberShimmer, abilityFps: 9 });
const mirage = buildHumanoid({ body: 'cloth', head: 'bare', hair: 'q', build: 'slim', hgt: 1, lean: -1, weapon: 'claws', softFx: 'fF', ability: vanish, abilityFps: 8 });
const shaman = buildHumanoid({ body: 'cloth', head: 'hood', hair: 'N', build: 'lean', hgt: 1, weapon: 'staff', glow: 'C', softFx: 'cC', ability: sandstorm, abilityFps: 8 });
const behemoth = buildBeast({ hide: { lo: 'k', mi: 'K', hi: 'q' }, big: true, horns: true, rider: nomadRider, softFx: '' });
const sapper = buildHumanoid({ body: 'leather', head: 'cap', hair: 'q', build: 'default', hgt: -1, weapon: 'hammer', softFx: 'eEt', ability: deathBlast, abilityFps: 9, abilityLoop: false });
const glassSentinel = buildHumanoid({ body: 'plate', head: 'winged', hair: 'd', build: 'wide', hgt: 0, weapon: 'sword', shield: 'tower', trim: 'steel', softFx: 'bBF', ability: absorbHeal, abilityFps: 8 });

// Giant Vulture — bespoke flyer bird (idle · fly · walk · death)
function vulture(flap) {
  const g = G(), cx = 30, by = 36;
  for (let y = by - 3; y <= by + 4; y++) for (let x = cx - 5; x <= cx + 7; x++) { const t = Math.abs(y - by) / 4, u = (x - cx) / 6; if (u * u + t * t <= 1.1) set(g, x, y, y < by ? 'K' : 'k'); }   // body
  for (let j = 0; j < 6; j++) set(g, cx + 7 + j * 0.5, by - 4 - j, 'O');                       // bald neck
  disc(g, cx + 10, by - 9, 2, 'q'); set(g, cx + 12, by - 8, 'y'); set(g, cx + 11, by - 9, 'O');// head + beak + eye
  const sp = [0, -5, 5][flap] || 0;                                                            // wing spread by flap
  for (const s of [-1, 1]) for (let f = 0; f < 7; f++) { const [tx, ty] = [cx + s * (6 + f * 2), by - 1 - sp + Math.abs(f - 3)]; limb(g, cx + s * 3, by - 1, tx, ty, 0.8, 'O', 'k', 'K'); }
  for (let j = 0; j < 5; j++) set(g, cx - 5 - j, by + 3 + Math.round(j * 0.4), 'k');           // tail
  outline(g, 'o'); return g.map(r => r.join(''));
}
const giantVulture = {
  idle: { anchor: 'foot', fps: 3, loop: true, frames: [vulture(0), vulture(2)] },
  fly: { anchor: 'foot', fps: 9, loop: true, frames: [vulture(0), vulture(1), vulture(0), vulture(2)] },
  walk: { anchor: 'foot', fps: 6, loop: true, frames: [vulture(0), vulture(2)] },
  death: { anchor: 'foot', fps: 7, loop: false, frames: [vulture(0), (() => { const g = G(); for (let i = 0; i < 16; i++) set(g, 22 + i, 59, 'k'); for (let i = 0; i < 14; i++) set(g, 23 + i, 58, 'K'); outline(g); return g.map(r => r.join('')); })()] },
};

// Camel Caravan — 3 linked camels (group), mutual-heal fx
function caravan(k, healFr) {
  const g = G();
  for (let n = 0; n < 3; n++) { const cx = 14 + n * 18, by = 42;
    for (let y = by - 4; y <= by + 3; y++) for (let x = cx - 6; x <= cx + 6; x++) { const t = Math.abs(y - by) / 4, u = (x - cx) / 6; if (u * u + t * t <= 1.05) set(g, x, y, y < by ? 'K' : 'k'); }
    set(g, cx - 1, by - 3, 'K'); set(g, cx + 1, by - 5, 'K');                                   // humps
    for (let j = 0; j < 5; j++) set(g, cx + 6 + j * 0.4, by - 2 - j, 'k'); disc(g, cx + 9, by - 7, 2, 'q'); set(g, cx + 10, by - 7, 'O');
    const ph = [[8, -8], [-8, 8], [6, -6]][(k + n) % 3];
    for (let i = 0; i < 2; i++) { const hx = cx - 3 + i * 6, a = ph[i] || 0; const ex = hx + Math.round(8 * Math.sin(a * Math.PI / 180)); limb(g, hx, by + 3, ex, by + 14, 1.2, 'k', 'K', 'K'); }
    if (healFr != null) { set(g, cx, by - 8 - (healFr % 2), 'h'); set(g, cx + 1, by - 9 - (healFr % 2), 'g'); }
  }
  outline(g, 'o', 'gh'); return g.map(r => r.join(''));
}
const camelCaravan = {
  idle: { anchor: 'foot', fps: 2, loop: true, frames: [caravan(0), caravan(0)] },
  walk: { anchor: 'foot', fps: 6, loop: true, frames: [caravan(0), caravan(1), caravan(2), caravan(1)] },
  ability: { anchor: 'foot', fps: 6, loop: true, frames: [0, 1, 2, 3].map(k => caravan(k % 3, k)) },
  death: { anchor: 'foot', fps: 7, loop: false, frames: [caravan(0), (() => { const g = G(); for (let i = 0; i < 40; i++) set(g, 12 + i, 59, 'k'); outline(g); return g.map(r => r.join('')); })()] },
};

const renegade = buildHumanoid({ body: 'plate', head: 'barbute', hair: 'd', build: 'giant', hgt: -1, shoW: 6, weapon: 'sword', shield: 'spiked', trim: 'steel', crest: 'C', softFx: 'bB', ability: absorbHeal, abilityFps: 9 });
const chiefRebel = buildHumanoid({ body: 'leather', build: 'giant', hgt: 1, shoW: 6, scale: 1.38, head: 'horns', hair: 'y', weapon: 'greatsword', cape: true, trim: 'gold', backBanner: { cloth1: 'c', cloth2: 'C', emblem: [[0, 0], [-1, 1], [1, 1], [0, 2]], emblemCol: 'd' }, softFx: 'cCt', ability: sandstorm, abilityFps: 9, abilityLoop: false });

export const SPRITES = {};
function add(name, set, keys) { for (const k of keys) if (set[k]) SPRITES[`troop_${name}_${k}`] = set[k]; }
const STD = ['idle', 'walk', 'death'];
add('sand_raider', raider, STD);
add('dune_nomad', nomad, STD);
add('ash_walker', ashWalker, [...STD, 'ability']);
add('mirage_dancer', mirage, [...STD, 'ability']);
add('sandstorm_shaman', shaman, [...STD, 'ability']);
add('dune_behemoth', behemoth, STD);
add('rebel_sapper', sapper, [...STD, 'ability']);
add('glass_sentinel', glassSentinel, [...STD, 'ability']);
add('giant_vulture', giantVulture, ['idle', 'fly', 'walk', 'death']);
add('camel_caravan', camelCaravan, ['idle', 'walk', 'ability', 'death']);
add('renegade_knight', renegade, [...STD, 'ability']);
add('chief_rebel', chiefRebel, [...STD, 'ability']);
