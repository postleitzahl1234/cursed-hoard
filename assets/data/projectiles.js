// assets/data/projectiles.js — §2 per-tier projectile / beam, 2× density (≤64×64, anchor
// center, authored pointing EAST; engine rotates to flight angle). No shared pool (D-06):
// each of the 48 tower tiers owns a unique look. Clip = travel (F=2) → impact (F=3).
// Faction grammar is kept distinct: Orc steel/wood, Crypt ice/curse/volt, Demon fire,
// Goblin brass machinery — and no projectile silhouette is shared across factions.

export const META = { group: 'Projectiles / beams (48)', blurb: "One bespoke projectile per tower tier — 48 total, no shared pool (D-06). Orc steel bolts/bombs/harpoons, Crypt orbiting ice·spectral·volt charges, Demon ember bursts·beams·lava bombs, Goblin brass drone-bolts·spikes·drill-rounds. Each clip runs travel (2f) → impact burst (3f), authored facing east; the engine rotates to the flight angle." };

export const LEGEND = {
  '`': null, o: 'IK1', O: 'IK0',
  s: 'IR3', S: 'IR5', I: 'IR4', i: 'IR1', g: 'IR6',     // steel
  w: 'WD3', W: 'WD5', u: 'WD2',                         // wood shaft
  n: 'BR3', N: 'BR5', B: 'BR4', b: 'BR1',               // brass
  d: 'GD2', D: 'GD4', y: 'GD5',                         // gold
  c: 'IC1', C: 'IC3', e: 'IC5', z: 'IC0',               // ice
  v: 'CR2', V: 'CR4', x: 'HX3', X: 'HX5',               // curse / fear
  '1': 'VL1', '2': 'VL2', '3': 'VL3', '4': 'VL4',       // volt
  f: 'EM2', F: 'EM4', r: 'EM5', R: 'EM6', '#': 'EM7',   // fire / lava
  k: 'BN2', K: 'BN5',                                   // bone
  q: 'RK2', Q: 'RK4',                                   // stone / boulder
  p: 'BL2', P: 'BL3',                                   // blood
};

// ---------- tiny grid kit ----------
const W = 44, H = 28, CY = 14;
const G = () => Array.from({ length: H }, () => Array(W).fill('`'));
const S = (g, x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c; };
const disc = (g, cx, cy, r, c) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + (r > 1 ? 1 : 0)) S(g, cx + x, cy + y, c); };
const line = (g, x0, y0, x1, y1, c) => { const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy)) || 1; for (let i = 0; i <= n; i++) S(g, x0 + dx * i / n, y0 + dy * i / n, c); };
const ring = (g, cx, cy, r, c, sx = 1) => { for (let a = 0; a < 360; a += 14) S(g, cx + r * Math.cos(a * Math.PI / 180), cy + r * sx * Math.sin(a * Math.PI / 180), c); };
const rows = g => g.map(r => r.join(''));
// outline pass (8-neighbour) skipping soft glow chars so auras stay clean
function ink(g, soft = '') { const add = []; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (g[y][x] !== '`') continue; let t = false; for (let dy = -1; dy <= 1 && !t; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const c = (g[y + dy] || [])[x + dx]; if (c && c !== '`' && c !== 'o' && soft.indexOf(c) < 0) { t = true; break; } } if (t) add.push([x, y]); } for (const [x, y] of add) g[y][x] = 'o'; return g; }

// shaft+head bolt pointing east. opts: len, head('point'|'barb'|'spear'|'leaf'|'trident'|'broad'),
// shaftCol(sc), shadeCol(sh), headCol(hc), fletch, motion, band(shaft stripe col), glint, trailCol
function bolt(o) {
  const trav = (mo) => { const g = G(), cx = 14 + mo; const L = o.len || 14, hx = cx + L;
    for (let i = 0; i < L; i++) { S(g, cx + i, CY, o.sc || 'w'); S(g, cx + i, CY - 1, o.sh || 'W'); }     // shaft
    if (o.band) for (let i = 2; i < L - 1; i += 4) { S(g, cx + i, CY, o.band); S(g, cx + i, CY - 1, o.band); }   // binding rings
    if (o.fletch) { for (let j = 1; j <= 3; j++) { S(g, cx + j - 1, CY - j, o.fl || 'p'); S(g, cx + j - 1, CY + j - 1, o.fl || 'p'); } }
    // head
    const hc = o.hc || 'S';
    if (o.head === 'spear') { for (let j = 0; j <= 5; j++) { const wd = Math.max(0, 2 - Math.abs(j - 1)); for (let w = -wd; w <= wd; w++) S(g, hx + j, CY + w - 0, hc); } S(g, hx + 5, CY, 'g'); }
    else if (o.head === 'barb') { line(g, hx, CY, hx + 4, CY, hc); S(g, hx + 4, CY, 'g'); S(g, hx + 1, CY - 2, hc); S(g, hx + 1, CY + 1, hc); S(g, hx + 2, CY - 1, hc); }
    else if (o.head === 'leaf') { for (let j = 0; j <= 6; j++) { const wd = Math.max(0, 2 - Math.abs(j - 3) * 0.8 | 0); for (let w = -wd; w <= wd; w++) S(g, hx + j, CY + w, hc); } S(g, hx + 6, CY, 'g'); S(g, hx + 2, CY, o.glint || 'g'); }   // leaf-blade
    else if (o.head === 'trident') { for (const dy of [-2, 0, 2]) { line(g, hx, CY + dy, hx + 4, CY + dy, hc); S(g, hx + 4, CY + dy, 'g'); } S(g, hx, CY - 1, hc); S(g, hx, CY + 1, hc); }   // three prongs
    else if (o.head === 'broad') { for (let j = 0; j <= 4; j++) { const wd = 3 - Math.abs(j - 1); for (let w = -wd; w <= wd; w++) S(g, hx + j, CY + w, w === -wd ? 'g' : hc); } S(g, hx + 4, CY, 'g'); }   // wide broadhead
    else { S(g, hx, CY, hc); S(g, hx + 1, CY, hc); S(g, hx + 2, CY, 'g'); S(g, hx, CY - 1, hc); S(g, hx, CY + 1, hc); }
    if (o.glint) S(g, cx + Math.floor(L / 2), CY - 1, o.glint);                                          // shaft sheen
    if (o.motion) for (let m = 1; m <= 3; m++) S(g, cx - m * 2, CY, o.trailCol || o.sc || 'w');
    if (o.chain) for (let m = 1; m <= 5; m++) { S(g, cx - m * 2, CY, 'i'); S(g, cx - m * 2 + 1, CY - (m % 2), 'I'); }
    return ink(g); };
  const imp = (k) => { const g = G(), ix = 30, rad = [3, 6, 8][k]; const c = o.impC || 'S';
    ring(g, ix, CY, rad, c); if (k >= 1) ring(g, ix, CY, rad - 3 > 0 ? rad - 3 : 1, o.impC2 || 'g');
    for (let a = 0; a < 360; a += 45) { const rr = rad + k; S(g, ix + rr * Math.cos(a * Math.PI / 180), CY + rr * 0.7 * Math.sin(a * Math.PI / 180), c); }
    return ink(g, o.soft || ''); };
  return { anchor: 'center', fps: 12, loop: false, frames: [trav(0), trav(3), imp(0), imp(1), imp(2)] };
}

// round lobbed mass (bomb/boulder/shell). opts: r, col, hi, fuse, arc
function lob(o) {
  const trav = (mo) => { const g = G(), cx = 16 + mo * 2, R = o.r || 4; disc(g, cx, CY, R, o.col || 'q'); disc(g, cx - 1, CY - 1, R - 2, o.hi || 'Q');
    // surface texture distinguishes each mass: cracks / rivets / runes / spin-sheen
    if (o.tex === 'crack') { line(g, cx - R + 1, CY - 1, cx + R - 1, CY + 1, 'o'); line(g, cx, CY - R + 1, cx + 1, CY + R - 2, 'o'); }
    else if (o.tex === 'rivet') { for (const a of [30, 150, 210, 330]) S(g, cx + Math.round((R - 1) * Math.cos(a * Math.PI / 180)), CY + Math.round((R - 1) * Math.sin(a * Math.PI / 180)), o.deb || 'N'); }
    else if (o.tex === 'rune') { S(g, cx, CY, o.glow || '#'); S(g, cx - 1, CY, o.glow || '#'); S(g, cx, CY - 1, o.glow || '#'); }
    else if (o.tex === 'pock') { for (const [dx, dy] of [[-2, 1], [1, -2], [2, 2]]) disc(g, cx + dx, CY + dy, 1, o.col || 'q'); }
    if (o.spin) S(g, cx + 1, CY - 1, o.spin);
    if (o.fuse) { S(g, cx + R, CY - R, 'w'); S(g, cx + R + 1, CY - R - 1, '#'); S(g, cx + R + 2, CY - R - 2, 'r'); }
    if (o.arc) for (let m = 1; m <= 3; m++) S(g, cx - m * 3, CY + m, o.trailCol || o.col || 'q');
    return ink(g, o.soft || ''); };
  const imp = (k) => { const g = G(), ix = 28, rad = [4, 8, 11][k], c = o.impC || 'r';
    ring(g, ix, CY, rad, c); ring(g, ix, CY, rad - 3 > 0 ? rad - 3 : 1, o.impC2 || '#');
    for (let a = 0; a < 360; a += 36) { const rr = rad + k * 2; S(g, ix + rr * Math.cos(a * Math.PI / 180), CY + rr * 0.7 * Math.sin(a * Math.PI / 180), o.deb || 'q'); }
    return ink(g, o.soft || ''); };
  return { anchor: 'center', fps: 12, loop: false, frames: [lobT(o, 0), lobT(o, 1), imp(0), imp(1), imp(2)] };
  function lobT(o, m) { return trav(m); }
}

// orbiting/charge orb (crypt). opts: col(o,mi,hi), trail, shape('orb'|'skull'|'volt')
function charge(o) {
  const M = o.col || ['c', 'C', 'e'];
  const trav = (mo) => { const g = G(), cx = 16 + mo * 3;
    if (o.shape === 'skull') { disc(g, cx, CY, 4, 'K'); S(g, cx - 2, CY - 1, 'O'); S(g, cx + 1, CY - 1, 'O'); S(g, cx - 1, CY + 2, 'O'); S(g, cx + 1, CY + 2, 'O'); }
    else if (o.shape === 'volt') { let x = cx; for (let y = CY - 5; y <= CY + 5; y += 2) { x += (y % 4 ? 3 : -3); S(g, x, y, '4'); S(g, x, y + 1, '3'); S(g, x - 1, y, '2'); } disc(g, cx, CY, 2, '4'); }
    else { disc(g, cx, CY, o.r || 4, M[1]); disc(g, cx - 1, CY - 1, (o.r || 4) - 2, M[2]); ring(g, cx, CY, (o.r || 4) + 1, M[0]);
      // core symbol gives each orb its own identity
      if (o.core === 'flake') { for (const a of [0, 60, 120]) { line(g, cx - 2 * Math.cos(a * Math.PI / 180), CY - 2 * Math.sin(a * Math.PI / 180), cx + 2 * Math.cos(a * Math.PI / 180), CY + 2 * Math.sin(a * Math.PI / 180), 'z'); } }
      else if (o.core === 'eye') { S(g, cx, CY, 'O'); S(g, cx + 1, CY, M[0]); }
      else if (o.core === 'star') { S(g, cx, CY, M[0]); S(g, cx - 1, CY, M[0]); S(g, cx + 1, CY, M[0]); S(g, cx, CY - 1, M[0]); S(g, cx, CY + 1, M[0]); }
    }
    if (o.trail) for (let m = 1; m <= 4; m++) { disc(g, cx - m * 3, CY, Math.max(1, (o.r || 3) - m), M[0]); }
    if (o.spark) for (const a of [20, 160, 250]) S(g, cx + Math.round((o.r + 2) * Math.cos(a * Math.PI / 180)), CY + Math.round((o.r + 2) * Math.sin(a * Math.PI / 180)), M[2]);
    if (o.multi) for (const dy of [-7, 7]) disc(g, cx - 4, CY + dy, 2, M[1]);
    return ink(g, M.join('') + '1234xXvV'); };
  const imp = (k) => { const g = G(), ix = 30, rad = [3, 6, 9][k];
    ring(g, ix, CY, rad, M[0]); ring(g, ix, CY, rad - 2 > 0 ? rad - 2 : 1, M[2]);
    if (o.shape === 'volt') for (let a = 0; a < 360; a += 45) line(g, ix, CY, ix + rad * Math.cos(a * Math.PI / 180), CY + rad * Math.sin(a * Math.PI / 180), '4');
    return ink(g, M.join('') + '1234xXvV'); };
  return { anchor: 'center', fps: 11, loop: false, frames: [trav(0), trav(2), imp(0), imp(1), imp(2)] };
}

// horizontal beam (demon beam wing). opts: col, thick, pierce
function beam(o) {
  const seg = (bright) => { const g = G(); const t = o.thick || 2;
    for (let x = 4; x < W - 4; x++) { for (let w = -t; w <= t; w++) S(g, x, CY + w, Math.abs(w) === t ? 'f' : Math.abs(w) === t - 1 ? 'r' : (bright ? '#' : 'R')); }
    for (let x = 6; x < W - 6; x += 5) S(g, x, CY, '#');
    if (o.pierce) { S(g, W - 6, CY - t - 2, '#'); S(g, W - 6, CY + t + 2, '#'); }
    return ink(g, 'fFrR#'); };
  const imp = (k) => { const g = G(), ix = 34, rad = [3, 6, 8][k]; ring(g, ix, CY, rad, 'r'); ring(g, ix, CY, rad - 2 > 0 ? rad - 2 : 1, '#'); for (let a = -60; a <= 60; a += 30) line(g, ix - 4, CY, ix + rad * Math.cos(a * Math.PI / 180), CY + rad * Math.sin(a * Math.PI / 180), 'F'); return ink(g, 'fFrR#'); };
  return { anchor: 'center', fps: 10, loop: true, frames: [seg(false), seg(true), imp(0), imp(1), imp(2)] };
}

// flame nova ring (demon pyre). opts: rad, col
function nova(o) {
  const fr = (k) => { const g = G(), cx = 22, rad = [4, 8, 12, 15, 17][k];
    for (let a = 0; a < 360; a += 18) { const h = 2 + (a % 36 < 18 ? 1 : 0); const x = cx + rad * Math.cos(a * Math.PI / 180), y = CY + rad * 0.7 * Math.sin(a * Math.PI / 180); S(g, x, y, k < 2 ? '#' : 'r'); S(g, x, y - 1, 'F'); }
    ring(g, cx, CY, rad - 4 > 0 ? rad - 4 : 1, k < 3 ? '#' : 'f', 0.7);
    return ink(g, 'fFrR#'); };
  return { anchor: 'center', fps: 11, loop: false, frames: [fr(0), fr(1), fr(2), fr(3), fr(4)] };
}

// terror/curse wave (crypt fear). expanding purple ring with skull motes
function wave(o) {
  const fr = (k) => { const g = G(), cx = 22, rad = [4, 8, 12, 15, 18][k];
    ring(g, cx, CY, rad, k < 2 ? 'X' : 'x', 0.7); ring(g, cx, CY, rad - 3 > 0 ? rad - 3 : 1, 'v', 0.7);
    for (let a = 0; a < 360; a += 60) { const x = cx + rad * Math.cos(a * Math.PI / 180), y = CY + rad * 0.7 * Math.sin(a * Math.PI / 180); S(g, x, y, 'X'); S(g, x, y - 1, 'V'); }
    return ink(g, 'xXvV'); };
  return { anchor: 'center', fps: 11, loop: false, frames: [fr(0), fr(1), fr(2), fr(3), fr(4)] };
}

// brass drone-bolt / gatling / spike / drill (goblin). opts: kind
function mech(o) {
  const trav = (mo) => { const g = G(), cx = 16 + mo * 3;
    if (o.kind === 'spike') { for (let j = 0; j <= 8; j++) { const wd = Math.max(0, 2 - Math.floor(Math.abs(j - 1) / 2)); for (let w = -wd; w <= wd; w++) S(g, cx + j, CY + w, j > 5 ? 'g' : 'I'); } for (let m = 1; m <= 2; m++) S(g, cx - m * 2, CY, 's'); }
    else if (o.kind === 'drill') { for (let j = 0; j <= 10; j++) { const wd = Math.max(0, 2 - Math.floor(j / 5)); for (let w = -wd; w <= wd; w++) S(g, cx + j, CY + w, (j + mo) % 3 ? 'B' : 'b'); } S(g, cx + 11, CY, 'g'); for (let m = 1; m <= 2; m++) S(g, cx - m * 2, CY, 'n'); }
    else if (o.kind === 'gat') { for (let j = 0; j <= 6; j++) S(g, cx + j, CY, j > 4 ? 'g' : 'B'); S(g, cx + 7, CY, '#'); for (let m = 1; m <= 3; m++) S(g, cx - m * 3, CY, 'b'); }
    else if (o.kind === 'spanner') { line(g, cx, CY, cx + 8, CY, 'B'); S(g, cx + 8, CY - 1, 'N'); S(g, cx + 9, CY, 'N'); S(g, cx + 8, CY + 1, 'N'); S(g, cx + 7, CY, 'b'); }
    else { for (let j = 0; j <= 6; j++) S(g, cx + j, CY, j > 4 ? 'g' : 'B'); S(g, cx + 6, CY, 'b'); S(g, cx, CY - 1, 'N'); }   // drone-bolt
    if (o.swarm) for (const dy of [-6, 6]) { for (let j = 0; j <= 4; j++) S(g, cx - 4 + j, CY + dy, 'B'); S(g, cx, CY + dy, 'b'); }
    return ink(g); };
  const imp = (k) => { const g = G(), ix = 30, rad = [2, 5, 7][k]; ring(g, ix, CY, rad, 'B'); ring(g, ix, CY, rad - 2 > 0 ? rad - 2 : 1, '#'); for (let a = 0; a < 360; a += 45) S(g, ix + (rad + k) * Math.cos(a * Math.PI / 180), CY + (rad + k) * 0.7 * Math.sin(a * Math.PI / 180), 'b'); return ink(g); };
  return { anchor: 'center', fps: 13, loop: false, frames: [trav(0), trav(2), imp(0), imp(1), imp(2)] };
}

export const SPRITES = {
  // ----- ORC: steel bolts / bombs / harpoons / scatter -----
  proj_orc_short_bolt:      bolt({ len: 10, head: 'point', sc: 'w', sh: 'W', hc: 'S', fletch: true, impC: 'S' }),
  proj_orc_iron_bolt:       bolt({ len: 14, head: 'leaf', sc: 'w', sh: 'W', hc: 'I', fletch: true, band: 'u', glint: 'g', impC: 'I' }),
  proj_orc_rapid_bolt:      bolt({ len: 12, head: 'point', sc: 'w', sh: 'W', hc: 'S', fletch: true, motion: true, trailCol: 'u', impC: 'S' }),
  proj_orc_ballista_spear:  bolt({ len: 18, head: 'broad', sc: 'W', sh: 'u', hc: 'I', fletch: true, band: 'i', glint: 'g', impC: 'I', impC2: 'g' }),
  proj_orc_arcing_bomb:     lob({ r: 4, col: 'q', hi: 'Q', tex: 'crack', fuse: true, arc: true, impC: 'r', impC2: '#', deb: 'q' }),
  proj_orc_boulder:         lob({ r: 6, col: 'q', hi: 'Q', tex: 'pock', spin: 'Q', arc: true, impC: 'Q', impC2: 'q', deb: 'q' }),
  proj_orc_barbed_harpoon:  bolt({ len: 16, head: 'barb', sc: 'i', sh: 'I', hc: 'S', band: 'q', impC: 'S' }),
  proj_orc_dread_harpoon:   bolt({ len: 18, head: 'trident', sc: 'i', sh: 'I', hc: 'g', chain: true, glint: 'g', impC: 'g' }),
  proj_orc_pellet_spray:    (() => { const t = (mo) => { const g = G(); for (const [dx, dy] of [[0, 0], [4, -3], [6, 2], [3, 4], [8, -1], [2, -4]]) disc(g, 18 + dx + mo * 3, CY + dy, 1, 'S'); return ink(g); }; const imp = (k) => { const g = G(); for (const [dx, dy] of [[0, 0], [5, -4], [8, 3], [4, 5], [10, -2]]) disc(g, 26 + dx, CY + dy, 1 + (k > 1 ? 1 : 0), 'I'); return ink(g); }; return { anchor: 'center', fps: 13, loop: false, frames: [t(0), t(2), imp(0), imp(1), imp(2)] }; })(),
  proj_orc_triple_spray:    (() => { const t = (mo) => { const g = G(); for (const [dx, dy] of [[0, -3], [0, 0], [0, 3], [5, -4], [5, 4], [4, 0], [9, -2], [9, 2]]) disc(g, 16 + dx + mo * 4, CY + dy, 1, 'S'); return ink(g); }; const imp = (k) => { const g = G(); for (const [dx, dy] of [[0, -4], [4, 0], [2, 5], [8, -2], [9, 3], [5, -5]]) disc(g, 26 + dx, CY + dy, 1 + (k > 1 ? 1 : 0), 'I'); return ink(g); }; return { anchor: 'center', fps: 13, loop: false, frames: [t(0), t(2), imp(0), imp(1), imp(2)] }; })(),
  proj_orc_mortar_shell:    lob({ r: 5, col: 'i', hi: 'I', tex: 'rivet', fuse: true, arc: true, impC: 'r', impC2: '#', deb: 'q' }),
  proj_orc_doomsday_shell:  lob({ r: 7, col: 'i', hi: 'I', tex: 'rivet', spin: 'S', fuse: true, arc: true, impC: '#', impC2: 'r', deb: 'Q' }),

  // ----- CRYPT: ice / spectral / frost-volley / volt / terror -----
  proj_crypt_ice_charge:        charge({ col: ['c', 'C', 'e'], r: 4, trail: true, core: 'flake' }),
  proj_crypt_ice_charge_ii:     charge({ col: ['c', 'C', 'e'], r: 5, trail: true, core: 'flake', spark: true }),
  proj_crypt_frost_charge:      charge({ col: ['z', 'c', 'C'], r: 5, trail: true, core: 'flake' }),
  proj_crypt_heavy_frost:       charge({ col: ['z', 'c', 'C'], r: 6, trail: true, multi: true, core: 'flake', spark: true }),
  proj_crypt_spectral_charge:   charge({ shape: 'skull', col: ['v', 'V', 'X'], trail: true }),
  proj_crypt_wraith_charge:     charge({ shape: 'skull', col: ['v', 'V', 'X'], trail: true, multi: true }),
  proj_crypt_frost_volley:      charge({ col: ['c', 'C', 'e'], r: 4, multi: true, trail: true, core: 'star' }),
  proj_crypt_frost_volley_ii:   charge({ col: ['z', 'c', 'e'], r: 4, multi: true, trail: true, core: 'star', spark: true }),
  proj_crypt_forking_bolt:      charge({ shape: 'volt', col: ['2', '3', '4'] }),
  proj_crypt_forking_bolt_ii:   charge({ shape: 'volt', col: ['1', '3', '4'] }),
  proj_crypt_terror_wave:       wave({}),
  proj_crypt_terror_wave_ii:    wave({ big: true }),

  // ----- DEMON: ember / flame / beam / nova / lava bomb -----
  proj_demon_ember_puff:    nova({ rad: 10 }),
  proj_demon_flame_burst:   nova({ rad: 13 }),
  proj_demon_focused_beam:  beam({ thick: 1 }),
  proj_demon_lance_beam:    beam({ thick: 2, pierce: true }),
  proj_demon_flame_nova:    nova({ rad: 14 }),
  proj_demon_wide_nova:     nova({ rad: 17 }),
  proj_demon_piercing_ray:  beam({ thick: 2, pierce: true }),
  proj_demon_doomray:       beam({ thick: 3, pierce: true }),
  proj_demon_firebomb:      lob({ r: 4, col: 'f', hi: 'r', tex: 'rune', glow: '#', fuse: true, arc: true, impC: 'r', impC2: '#', deb: 'f', soft: 'fFrR#' }),
  proj_demon_lava_splash:   lob({ r: 5, col: 'r', hi: '#', tex: 'pock', spin: '#', arc: true, impC: '#', impC2: 'r', deb: 'f', soft: 'fFrR#' }),
  proj_demon_burn_field:    (() => { const fr = (k) => { const g = G(); for (let x = 8; x < 36; x += 3) { const h = 3 + ((x + k) % 3); for (let j = 0; j < h; j++) S(g, x, CY + 4 - j, j === h - 1 ? 'F' : (j > h - 3 ? 'r' : 'f')); S(g, x, CY + 5, 'f'); } return ink(g, 'fFrR#'); }; return { anchor: 'center', fps: 8, loop: true, frames: [fr(0), fr(1), fr(0), fr(1), fr(2)] }; })(),
  proj_demon_burn_field_ii: (() => { const fr = (k) => { const g = G(); for (let x = 6; x < 38; x += 2) { const h = 4 + ((x + k) % 4); for (let j = 0; j < h; j++) S(g, x, CY + 5 - j, j === h - 1 ? '#' : (j > h - 3 ? 'r' : 'f')); } return ink(g, 'fFrR#'); }; return { anchor: 'center', fps: 9, loop: true, frames: [fr(0), fr(1), fr(2), fr(1), fr(0)] }; })(),

  // ----- GOBLIN: brass machinery -----
  proj_goblin_spanner_bolt: mech({ kind: 'spanner' }),
  proj_goblin_bolt:         mech({ kind: 'bolt' }),
  proj_goblin_drone_bolt:   mech({ kind: 'bolt' }),
  proj_goblin_drone_bolt_ii: mech({ kind: 'bolt', swarm: true }),
  proj_goblin_gatling_round: mech({ kind: 'gat' }),
  proj_goblin_spike_shell:  mech({ kind: 'spike' }),
  proj_goblin_swarm_bolt:   mech({ kind: 'bolt', swarm: true }),
  proj_goblin_swarm_bolt_ii: mech({ kind: 'gat', swarm: true }),
  proj_goblin_dropped_bomb: lob({ r: 4, col: 'n', hi: 'B', tex: 'rivet', fuse: true, impC: 'r', impC2: '#', deb: 'n' }),
  proj_goblin_bomb_string:  (() => { const t = (mo) => { const g = G(); for (const dx of [0, 9, 18]) { disc(g, 12 + dx, CY - 4 + (dx / 3) + mo, 3, 'n'); disc(g, 11 + dx, CY - 5 + (dx / 3) + mo, 1, 'B'); S(g, 14 + dx, CY - 7 + (dx / 3), 'w'); } return ink(g); }; const imp = (k) => { const g = G(); for (const dx of [0, 12, 24]) { ring(g, 10 + dx, CY, 3 + k, 'r'); ring(g, 10 + dx, CY, 1, '#'); } return ink(g, 'fFrR#'); }; return { anchor: 'center', fps: 11, loop: false, frames: [t(0), t(1), imp(0), imp(1), imp(2)] }; })(),
  proj_goblin_drill_round:  mech({ kind: 'drill' }),
  proj_goblin_drill_round_ii: mech({ kind: 'drill', swarm: false }),
};

// TOWER → PROJECTILE map (engine-ready, D-06): every one of the 48 tower-tier keys resolves to the
// projectile it fires. Air-tower drones fire their own bolt; flyers without a projectile drop bombs.
export const TOWER_PROJECTILE = {
  // ORC — bolt/bomb/harpoon/scatter/mortar lines
  orc_t1_watchpost: 'proj_orc_short_bolt', orc_t2_bolt_thrower: 'proj_orc_iron_bolt', orc_t3_crossbow_nest: 'proj_orc_rapid_bolt', orc_t4_ballista: 'proj_orc_ballista_spear',
  orc_t3_bombard: 'proj_orc_arcing_bomb', orc_t4_catapult: 'proj_orc_boulder',
  orc_t5_harpoon_cannon: 'proj_orc_barbed_harpoon', orc_t6_dread_harpoon: 'proj_orc_dread_harpoon',
  orc_t5_scattergun_rig: 'proj_orc_pellet_spray', orc_t6_war_rig: 'proj_orc_triple_spray',
  orc_t5_siege_mortar: 'proj_orc_mortar_shell', orc_t6_doomsday_cannon: 'proj_orc_doomsday_shell',
  // GOBLIN — bolt-arm/gatling/spike/drill ground + drone/bomber air
  goblin_t1_workshop: 'proj_goblin_spanner_bolt', goblin_t2_tinker_tower: 'proj_goblin_bolt',
  goblin_t3_gatling_turret: 'proj_goblin_gatling_round', goblin_t4_spike_cannon: 'proj_goblin_spike_shell',
  goblin_t5_auger_cannon: 'proj_goblin_drill_round', goblin_t6_doom_driller: 'proj_goblin_drill_round_ii',
  goblin_t3_drone_bay: 'proj_goblin_drone_bolt', goblin_t4_drone_swarm: 'proj_goblin_drone_bolt_ii',
  goblin_t5_drone_foundry: 'proj_goblin_swarm_bolt', goblin_t6_sky_carrier: 'proj_goblin_swarm_bolt_ii',
  goblin_t5_bomber_drone: 'proj_goblin_dropped_bomb', goblin_t6_carpet_bomber: 'proj_goblin_bomb_string',
  // CRYPT — ice / spectral / college-frost / lightning / terror charges
  crypt_t1_crypt: 'proj_crypt_ice_charge', crypt_t2_crypt_ii: 'proj_crypt_ice_charge_ii',
  crypt_t3_frost_crypt_i: 'proj_crypt_frost_charge', crypt_t4_frost_crypt_ii: 'proj_crypt_heavy_frost',
  crypt_t3_fear_crypt_i: 'proj_crypt_spectral_charge', crypt_t4_fear_crypt_ii: 'proj_crypt_wraith_charge',
  crypt_t5_college_frost_i: 'proj_crypt_frost_volley', crypt_t6_college_frost_ii: 'proj_crypt_frost_volley_ii',
  crypt_t5_lightning_crypt_i: 'proj_crypt_forking_bolt', crypt_t6_lightning_crypt_ii: 'proj_crypt_forking_bolt_ii',
  crypt_t5_terror_crypt_i: 'proj_crypt_terror_wave', crypt_t6_terror_crypt_ii: 'proj_crypt_terror_wave_ii',
  // DEMON — ember / beam / pyre-nova / ray / lava lines
  demon_t1_imp_brazier: 'proj_demon_ember_puff', demon_t2_hellforge: 'proj_demon_flame_burst',
  demon_t3_hellbeam: 'proj_demon_focused_beam', demon_t4_searing_lance: 'proj_demon_lance_beam',
  demon_t3_hellfire_pyre: 'proj_demon_flame_nova', demon_t4_pyroclasm_altar: 'proj_demon_wide_nova',
  demon_t5_abyssal_ray: 'proj_demon_piercing_ray', demon_t6_doomray: 'proj_demon_doomray',
  demon_t5_brimstone_battery: 'proj_demon_firebomb', demon_t6_magma_mortar: 'proj_demon_lava_splash',
  demon_t5_lake_of_fire: 'proj_demon_burn_field', demon_t6_infernal_caldera: 'proj_demon_burn_field_ii',
};
