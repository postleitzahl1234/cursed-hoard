// assets/data/terrain.js — §6 terrain at 2× density (64×64/cell). Painted by ROLE; the engine
// autotiles edges (D-19). This expanded set sharpens the WORLD IDENTITIES so adjoining regions
// read distinctly and never look alike:
//   • Grasslands = WILD nature — organic blobby growth, wildflowers, ferns, mossy boulders, a
//     winding brook (all irregular/curved).
//   • Royal Gardens = GEOMETRIC + INDUSTRIAL — ruler-straight mown stripes, diamond parterre
//     lattice, precise mortared pavers, clipped rectangular hedges, brass gear-works & pipes,
//     a masonry-lined canal.
//   • Holy Mountains = COLD — glacial ice sheets, snow with rock breaking through, frozen river,
//     snow-laden pines, deep drifts (icy blues + cream stone).
// Bases use low-frequency coherent noise + scattered motifs so tiles MERGE and don't repeat;
// transition tiles blend neighbouring roles.
export const META = { group: 'Terrain', blurb: '64×64 biome tiles — WILD grasslands (flowers/ferns/boulders/brook) vs GEOMETRIC+INDUSTRIAL royal gardens (parterre lattice, mortared pavers, clipped hedges, brass gear-works, canal); COLD holy mountains (glacial ice, snow-over-rock, frozen river, snow-pines, drifts); sea of sand; shadow realm. Coherent-noise bases + transition tiles so regions merge without repeating.' };

export const LEGEND = {
  '`': null, o:'IK1', O:'IK0',
  // grass (wild) ramp + dirt + flowers
  g:'MS2', G:'MS4', h:'MS5', q:'MS1', Q:'MS6',
  e:'WD3', E:'WD2', t:'WD4', r:'WD1',
  '1':'EM3', '2':'GD5', '3':'BN6',
  // holy mountains (cold)
  y:'HS1', Y:'HS3', c:'IC2', C:'IC5', i:'IC0', I:'IC4', b:'AQ3', B:'AQ5',
  p:'PN2', P:'PN4',
  // sand
  s:'SD3', S:'SD5', a:'SD2', d:'GD3', x:'GB2', X:'GB4',
  // orange dunes (warm)
  N:'GD1', D:'GD4', '0':'SD4',
  // jungle (deep green, Orc applies)
  '!':'GN1', '@':'GN4', '#':'MS0',
  // gardens (geometric / industrial)
  m:'GN2', M:'GN4', l:'IR3', L:'IR5', z:'BR2', Z:'BR4', f:'IR2', F:'IR4',
  // rock (shared)
  k:'RK3', K:'RK5', j:'RK2',
  // water (shared)
  w:'AQ4', W:'AQ2', '9':'AQ1', '8':'AQ6',
  // shadow realm
  '4':'IK2', '5':'IK4', '6':'CR1', '7':'CR3', v:'HX3', V:'HX5', n:'CR4',
};

const SZ = 64;
const NG = () => Array.from({ length: SZ }, () => Array(SZ).fill('`'));
const put = (g, x, y, c) => { x = ((Math.round(x) % SZ) + SZ) % SZ; y = ((Math.round(y) % SZ) + SZ) % SZ; g[y][x] = c; };   // wraps → tileable
const putc = (g, x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < SZ && y >= 0 && y < SZ) g[y][x] = c; };
const rnd = (seed) => { let s = (seed * 2654435761) % 2147483647; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
function noiseFill(g, seed, ramp, per = 9) {
  const r = rnd(seed); const grid = [];
  for (let gy = 0; gy <= SZ / per + 2; gy++) { grid[gy] = []; for (let gx = 0; gx <= SZ / per + 2; gx++) grid[gy][gx] = r(); }
  for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) {
    const gx = x / per, gy = y / per, ix = Math.floor(gx), iy = Math.floor(gy), fx = gx - ix, fy = gy - iy;
    const a = grid[iy][ix], b = grid[iy][ix + 1], c = grid[iy + 1][ix], d = grid[iy + 1][ix + 1];
    const v = (a + (b - a) * fx) + ((c + (d - c) * fx) - (a + (b - a) * fx)) * fy;
    const dither = ((x + y) & 1) ? 0.05 : -0.05;
    g[y][x] = ramp[Math.max(0, Math.min(ramp.length - 1, Math.floor((v + dither) * ramp.length)))];
  }
}
function scatter(g, seed, n, fn) { const r = rnd(seed); for (let i = 0; i < n; i++) fn(g, Math.floor(r() * SZ), Math.floor(r() * SZ), r); }
function disc(g, cx, cy, rad, c, wrap) { for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) if (x * x + y * y <= rad * rad + rad) (wrap ? put : putc)(g, cx + x, cy + y, c); }
function line(g, x0, y0, x1, y1, c) { const dx = x1 - x0, dy = y1 - y0, n = Math.max(Math.abs(dx), Math.abs(dy)) || 1; for (let i = 0; i <= n; i++) putc(g, x0 + dx * i / n, y0 + dy * i / n, c); }
const rows = g => g.map(r => r.join(''));
const tile = (g) => ({ anchor: 'cell', fps: 1, loop: true, frames: [rows(g)] });
const water = (a, b) => ({ anchor: 'cell', fps: 3, loop: true, frames: [rows(a), rows(b)] });

// ===================== WILD GRASSLANDS =====================
const tuft = (g, x, y) => { for (const dx of [-1, 0, 1]) { put(g, x + dx, y, 'q'); put(g, x + dx, y - 1, dx ? 'h' : 'Q'); } put(g, x, y - 2, 'h'); put(g, x - 1, y - 2, 'q'); };
const flower = (g, x, y, r) => { const col = ['1', '2', '3'][Math.floor(r() * 3)]; put(g, x, y, col); put(g, x, y - 1, col); put(g, x - 1, y, 'Q'); put(g, x + 1, y, 'Q'); put(g, x, y + 1, 'g'); };
const fern = (g, x, y) => { for (let j = 0; j < 6; j++) { put(g, x, y - j, 'g'); put(g, x - 1 - (j >> 1), y - j, 'h'); put(g, x + 1 + (j >> 1), y - j, 'h'); } put(g, x, y - 6, 'Q'); };
const boulder = (g, cx, cy, r) => { disc(g, cx, cy, 4, 'k', true); disc(g, cx - 1, cy - 1, 2, 'K', true); for (let i = 0; i < 5; i++) put(g, cx - 4 + i, cy + 3, 'g'); put(g, cx + 2, cy - 2, 'h'); };
const pebble = (g, x, y, c) => { putc(g, x, y, c); putc(g, x + 1, y, c); putc(g, x, y + 1, c); putc(g, x - 1, y, c); };   // mossy top

function grassBase(v) { const g = NG(); noiseFill(g, 11 + v, ['q', 'g', 'g', 'G', 'h', 'G', 'Q'], 11); scatter(g, 12 + v, 24, tuft); return g; }
function grassFlowers() { const g = NG(); noiseFill(g, 21, ['g', 'g', 'G', 'h', 'Q'], 11); scatter(g, 22, 16, tuft); scatter(g, 23, 18, flower); return g; }
function grassTall() { const g = NG(); noiseFill(g, 31, ['q', 'g', 'g', 'G'], 10); scatter(g, 32, 40, (gg, x, y) => { for (let j = 0; j < 5 + (x % 3); j++) { putc(gg, x + Math.round(Math.sin(j) * 1.2), y - j, j > 2 ? 'h' : 'g'); } putc(gg, x, y - 5, 'Q'); }); return g; }
function grassFern() { const g = NG(); noiseFill(g, 41, ['g', 'G', 'h', 'q', 'G'], 11); scatter(g, 42, 16, fern); return g; }
function dirtPath() { const g = NG(); noiseFill(g, 51, ['e', 'E', 'e', 'r', 'E'], 10); scatter(g, 52, 16, (gg, x, y) => putc(gg, x, y, 'r')); scatter(g, 53, 8, (gg, x, y) => { putc(gg, x, y, 't'); putc(gg, x + 1, y, 'e'); }); return g; }
function grassOak() { const g = NG(); noiseFill(g, 61, ['g', 'G', 'h'], 11); for (const [tx, ty] of [[22, 50], [42, 52]]) for (let yy = 0; yy < 10; yy++) { putc(g, tx, ty - yy, 'r'); putc(g, tx + 1, ty - yy, 't'); } for (const [cx, cy, rr] of [[24, 32, 14], [42, 36, 12], [33, 22, 13], [12, 40, 8], [54, 42, 8]]) { disc(g, cx, cy, rr, 'h', true); disc(g, cx - 2, cy - 2, rr - 4, 'Q', true); for (let i = 0; i < 10; i++) put(g, cx + Math.round((rr - 1) * Math.cos(i)), cy + Math.round((rr - 1) * Math.sin(i)), 'G'); } return g; }
function brook(a) { const g = NG(); noiseFill(g, 71 + a, ['g', 'G', 'h'], 11); // winding natural stream
  for (let y = 0; y < SZ; y++) { const cx = 32 + Math.round(12 * Math.sin(y / 9 + a) + 5 * Math.sin(y / 4)); for (let x = cx - 5; x <= cx + 5; x++) { const d = Math.abs(x - cx); putc(g, x, y, d > 4 ? 'h' : d > 3 ? 'g' : (x + y + a) % 5 ? (d < 2 ? 'W' : 'w') : '8'); } putc(g, cx - 6, y, 'k'); putc(g, cx + 6, y, 'k'); }
  return g; }

// ===================== HOLY MOUNTAINS (cold) =====================
function snowBase(v) { const g = NG(); noiseFill(g, 81 + v, ['I', 'C', 'C', 'i'], 12); // bright icy snow
  scatter(g, 82 + v, 9, (gg, x, y) => { disc(gg, x, y, 2, 'y', true); disc(gg, x, y - 1, 1, 'Y', true); });   // rock breaking through
  scatter(g, 83 + v, 30, (gg, x, y) => putc(gg, x, y, 'C')); scatter(g, 84, 14, (gg, x, y) => putc(gg, x, y, 'b')); return g; }
function glacier() { const g = NG(); noiseFill(g, 91, ['b', 'B', 'c', 'i', 'b'], 13); // cracked blue ice sheet
  scatter(g, 92, 10, (gg, x, y, r) => { let cx = x, cy = y; for (let s = 0; s < 8; s++) { putc(gg, cx, cy, 'i'); cx += Math.round((r() - 0.5) * 4); cy += 2 + Math.round(r() * 2); } });
  scatter(g, 93, 16, (gg, x, y) => putc(gg, x, y, 'C')); return g; }
function stonePathCold() { const g = NG(); noiseFill(g, 101, ['j', 'k', 'y'], 10);
  for (let y = 2; y < SZ; y += 15) for (let x = 1; x < SZ; x += 19) { for (let i = 0; i < 18; i++) for (let j = 0; j < 14; j++) putc(g, x + i, y + j, (i === 0 || j === 0) ? 'i' : ((i + j) & 3 ? 'k' : 'K')); }   // icy cobbles
  scatter(g, 102, 24, (gg, x, y) => putc(gg, x, y, 'C')); return g; }   // snow dusting
function snowCrag() { const g = NG(); noiseFill(g, 111, ['I', 'C', 'i'], 12);
  for (const [cx, cy, rr] of [[30, 42, 18], [16, 30, 11], [48, 34, 12]]) for (let y = -rr; y <= rr; y++) for (let x = -rr; x <= rr; x++) if (x * x + y * y <= rr * rr) putc(g, cx + x, cy + y, y < -rr / 3 ? 'C' : (x - y) < -rr / 2 ? 'Y' : (x - y) > rr / 2 ? 'j' : 'y'); // snow-capped rock
  for (const [px, py] of [[24, 26], [40, 24], [33, 17]]) { for (let jj = 0; jj < 16; jj++) { const ww = Math.round((16 - jj) * 0.5); for (let x = -ww; x <= ww; x++) putc(g, px + x, py + jj, x < 0 ? 'p' : 'P'); putc(g, px - ww, py + jj, 'C'); } }   // snow-laden pines
  return g; }
function snowDrift() { const g = NG(); noiseFill(g, 121, ['C', 'I', 'C', 'c'], 16); for (let x = 0; x < SZ; x++) { const yy = Math.round(20 + 8 * Math.sin(x / 9) + 4 * Math.sin(x / 4)); for (let y = yy; y < SZ; y++) putc(g, x, y, y === yy ? 'C' : (y < yy + 3 ? 'I' : 'c')); } scatter(g, 122, 12, (gg, x, y) => putc(gg, x, y, 'C')); return g; }
function frozenRiver(a) { const g = NG(); noiseFill(g, 131 + a, ['b', 'B', 'b', 'c'], 13);
  for (let y = 0; y < SZ; y++) { const cx = 32 + Math.round(8 * Math.sin(y / 10 + a)); for (let x = cx - 7; x <= cx + 7; x++) { const d = Math.abs(x - cx); putc(g, x, y, d > 6 ? 'C' : d > 5 ? 'i' : ((x + y + a) % 6 ? (d < 3 ? 'B' : 'b') : 'I')); } }
  scatter(g, 132 + a, 8, (gg, x, y) => { putc(gg, x, y, 'C'); putc(gg, x + 1, y, 'C'); }); return g; }

// ===================== SEA OF SAND =====================
function sandBase(v) { const g = NG(); noiseFill(g, 141 + v, ['s', 'S', 's', 'a'], 13); for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) if ((x + y * 2 + Math.round(7 * Math.sin(x / 8))) % 19 === 0) putc(g, x, y, 'a'); scatter(g, 142 + v, 6, (gg, x, y) => disc(gg, x, y, 1, 'a', true)); return g; }
function sandPath() { const g = NG(); noiseFill(g, 151, ['a', 's', 'a', 'S'], 11); scatter(g, 152, 12, (gg, x, y) => putc(gg, x, y, 'S')); scatter(g, 153, 6, (gg, x, y) => disc(gg, x, y, 1, 'k', true)); return g; }
function sandCactus() { const g = NG(); noiseFill(g, 161, ['s', 'S', 'a'], 13);
  for (const [cx, base, hh] of [[30, 50, 26], [18, 48, 14], [44, 48, 17]]) { for (let jj = 0; jj < hh; jj++) for (let ww = -2; ww <= 2; ww++) putc(g, cx + ww, base - jj, Math.abs(ww) === 2 ? 'x' : 'X'); for (const sgn of [-1, 1]) { const ax = cx + sgn * 6, ay = base - Math.round(hh * 0.5); for (let jj = 0; jj < 8; jj++) putc(g, ax, ay + jj, 'X'); for (let jj = 0; jj < 6; jj++) putc(g, cx + sgn * (3 + jj * 0.5), ay + jj, 'x'); } putc(g, cx, base - hh, '2'); } return g; }
function sandRocks() { const g = NG(); noiseFill(g, 171, ['s', 'a', 'S'], 12); for (const [cx, cy, rr] of [[28, 38, 13], [46, 30, 9], [14, 28, 8]]) { for (let y = -rr; y <= rr; y++) for (let x = -rr; x <= rr; x++) if (x * x + y * y <= rr * rr) putc(g, cx + x, cy + y, (x - y) < -rr / 2 ? 'S' : (x - y) > rr / 2 ? 'r' : 'k'); for (let i = -rr; i <= rr; i += 4) putc(g, cx + i, cy, 'j'); } return g; }
function oasisWater(a) { const g = NG(); noiseFill(g, 181 + a, ['w', 'W', 'w', '9'], 13); for (let i = 0; i < 7; i++) { const y = 8 + i * 8 + (a ? 2 : 0); for (let x = (i * 9 + a * 4) % 12; x < SZ; x += 12) { putc(g, x, y, '8'); putc(g, x + 1, y, '8'); } } return g; }

// ===================== ROYAL GARDENS (geometric / industrial) =====================
function lawnGeo(v) { const g = NG(); for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) g[y][x] = (Math.floor(y / 5) % 2 ? ((x + 1) % 7 === 0 ? 'M' : 'm') : ((x) % 7 === 0 ? 'm' : 'M'));   // ruler-straight mown stripes
  for (let y = 0; y < SZ; y += 5) for (let x = 0; x < SZ; x++) putc(g, x, y, 'm'); return g; }
function parterre() { const g = NG(); for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) g[y][x] = 'm';   // diamond flowerbed lattice
  for (let y = 0; y < SZ; y += 16) for (let x = 0; x < SZ; x += 16) { // hedge lattice borders (straight)
    for (let i = 0; i < 16; i++) { putc(g, x + i, y, 'p'); putc(g, x, y + i, 'p'); }
    // diamond bloom bed inside each cell
    for (let dy = -5; dy <= 5; dy++) for (let dx = -5; dx <= 5; dx++) if (Math.abs(dx) + Math.abs(dy) <= 5) putc(g, x + 8 + dx, y + 8 + dy, (Math.abs(dx) + Math.abs(dy)) % 2 ? '1' : '2');
  }
  return g; }
function pavers() { const g = NG(); for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) g[y][x] = 'l';   // mortar
  for (let by = 1; by < SZ; by += 11) for (let bx = 1; bx < SZ; bx += 11) { for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) putc(g, bx + i, by + j, (i === 0 || j === 0) ? 'L' : (i === 8 || j === 8) ? 'k' : 'l'); for (let i = 0; i < 9; i++) putc(g, bx + i, by, 'L'); }   // precise mortared slabs, bevelled
  for (let by = 6; by < SZ; by += 11) for (let bx = 6; bx < SZ; bx += 11) putc(g, bx, by, 'd');   // brass stud at joints
  return g; }
function hedge() { const g = NG(); for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) g[y][x] = 'm';   // clipped rectangular hedge blocks
  for (const [bx, by, bw, bh] of [[6, 6, 24, 24], [36, 8, 22, 18], [10, 36, 20, 22], [38, 34, 20, 24]]) { for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) putc(g, bx + x, by + y, (x < 2 || y < 2) ? 'P' : (x > bw - 3 || y > bh - 3) ? 'p' : ((x + y) & 3 ? 'p' : 'P')); for (let x = 0; x < bw; x++) putc(g, bx + x, by, 'P'); }
  // a clipped topiary ball on one block
  disc(g, 18, 18, 7, 'P', false); disc(g, 16, 16, 4, 'M', false); putc(g, 18, 10, '2'); return g; }
function gearworks() { const g = NG(); for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) g[y][x] = ((x + y) & 1) ? 'l' : 'L';   // steel deck plate
  for (let y = 4; y < SZ; y += 10) for (let x = 0; x < SZ; x++) putc(g, x, y, 'f');   // straight pipe runs
  for (let x = 9; x < SZ; x += 16) for (let y = 0; y < SZ; y++) putc(g, x, y, 'F');
  for (const [cx, cy, rr] of [[18, 20, 9], [44, 40, 11], [40, 14, 6]]) { disc(g, cx, cy, rr, 'z', false); disc(g, cx, cy, rr - 3, 'Z', false); disc(g, cx, cy, 2, 'l', false); for (let aa = 0; aa < 360; aa += 30) { putc(g, cx + (rr + 1) * Math.cos(aa * Math.PI / 180), cy + (rr + 1) * Math.sin(aa * Math.PI / 180), 'Z'); } }   // brass gears w/ teeth
  for (let x = 2; x < SZ; x += 6) { putc(g, x, 2, 'f'); putc(g, x, SZ - 2, 'f'); }   // rivet rows
  return g; }
function canal(a) { const g = NG(); for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) g[y][x] = 'l';   // straight masonry-lined canal
  for (let y = 0; y < SZ; y++) { for (let x = 20; x <= 44; x++) { const d = Math.min(x - 20, 44 - x); putc(g, x, y, d < 2 ? 'k' : ((x + y + a) % 7 ? (d < 6 ? 'w' : 'W') : '8')); } putc(g, 19, y, 'L'); putc(g, 45, y, 'L'); }
  for (let y = 0; y < SZ; y += 8) { putc(g, 19, y, 'd'); putc(g, 45, y, 'd'); }   // gold bollards
  return g; }

// ===================== SHADOW REALM =====================
function voidBase(v) { const g = NG(); noiseFill(g, 191 + v, ['4', '5', '4', '6'], 12); scatter(g, 192 + v, 14, (gg, x, y) => putc(gg, x, y, 'v')); scatter(g, 193, 7, (gg, x, y) => disc(gg, x, y, 1, '5', true)); return g; }
function shadowPath() { const g = NG(); noiseFill(g, 201, ['6', '7', '6', '4'], 11); for (let i = 0; i < 18; i++) { const x = (i * 11) % SZ, y = (i * 23) % SZ; putc(g, x, y, 'v'); putc(g, x + 1, y, 'V'); } return g; }
function shadowCrystal() { const g = NG(); noiseFill(g, 211, ['4', '5', '6'], 12); for (const [cx, base, hh, ww] of [[30, 50, 30, 5], [18, 48, 18, 3], [44, 48, 22, 4], [38, 46, 14, 3]]) { for (let jj = 0; jj < hh; jj++) { const w = Math.max(1, Math.round(ww * (1 - jj / hh))); for (let x = -w; x <= w; x++) putc(g, cx + x, base - jj, x < 0 ? 'V' : (x === w ? '6' : 'v')); } putc(g, cx, base - hh, 'V'); } return g; }
function hexwood() { const g = NG(); noiseFill(g, 221, ['4', '6', '5'], 11); for (const [tx, ty] of [[20, 50], [42, 48]]) { for (let yy = 0; yy < 14; yy++) { putc(g, tx, ty - yy, '6'); putc(g, tx + 1, ty - yy, 'n'); } } for (const [cx, cy, rr] of [[22, 32, 12], [42, 34, 11], [32, 24, 10]]) { disc(g, cx, cy, rr, 'n', true); disc(g, cx - 1, cy - 1, rr - 4, 'v', true); for (let i = 0; i < 8; i++) put(g, cx + Math.round((rr - 1) * Math.cos(i)), cy + Math.round((rr - 1) * Math.sin(i)), 'V'); } return g; }
function cursedWater(a) { const g = NG(); noiseFill(g, 231 + a, ['9', '7', '6', '7'], 13); for (let i = 0; i < 8; i++) { const y = 6 + i * 7 + (a ? 2 : 0); for (let x = (i * 7 + a * 3) % 10; x < SZ; x += 10) { putc(g, x, y, 'V'); putc(g, x, y + 1, 'v'); } } return g; }

// ===================== TRANSITION TILES (merging) =====================
function grassToPath() { const g = dirtPath(); for (let y = 0; y < SZ; y++) { const edge = Math.round(22 + 6 * Math.sin(y / 7)); for (let x = 0; x < edge; x++) g[y][x] = ((x + y) & 1) && x > edge - 5 ? 'g' : (x < edge - 4 ? (((x + y) % 3) ? 'g' : 'G') : g[y][x]); } scatter(g, 301, 8, (gg, x, y) => { if (x < 26) tuft(gg, x, y); }); return g; }
function snowToIce() { const g = glacier(); for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) { const t = (x + y) / (2 * SZ); if (Math.random === undefined) { } if ((x + y) < 56 + 10 * Math.sin(x / 8)) g[y][x] = (((x + y) & 1) && (x + y) > 46 ? g[y][x] : 'C'); } scatter(g, 311, 10, (gg, x, y) => { if (x + y < 60) putc(gg, x, y, 'I'); }); return g; }
function lawnToPaver() { const g = pavers(); for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) { if (y < 28 + Math.round(4 * Math.sin(x / 6))) g[y][x] = (Math.floor(y / 5) % 2 ? 'M' : 'm'); } for (let y = 0; y < SZ; y += 5) for (let x = 0; x < SZ; x++) if (y < 28) putc(g, x, y, 'm'); return g; }

// ===================== JUNGLE (deep green · Orc applies) =====================
function jungleBase() { const g = NG(); noiseFill(g, 241, ['#', 'q', '!', 'g'], 11); scatter(g, 242, 30, (gg, x, y) => { putc(gg, x, y, '@'); putc(gg, x, y - 1, 'Q'); }); scatter(g, 243, 10, (gg, x, y) => pebble(gg, x, y, 'q')); return g; }
function junglePath() { const g = NG(); noiseFill(g, 251, ['r', 'e', 'r', 't'], 10); scatter(g, 252, 16, (gg, x, y) => pebble(gg, x, y, 't')); scatter(g, 253, 8, (gg, x, y) => { putc(gg, x, y, '!'); putc(gg, x, y - 1, '@'); }); return g; }   // muddy trail w/ creeping growth
function jungleCanopy() { const g = NG(); noiseFill(g, 261, ['#', 'q', '!']);
  for (const [tx, ty] of [[18, 52], [40, 54], [30, 48]]) for (let yy = 0; yy < 14; yy++) { putc(g, tx, ty - yy, 'r'); putc(g, tx + 1, ty - yy, 't'); }   // big trunks
  for (const [cx, cy, rad] of [[22, 28, 16], [44, 32, 14], [32, 18, 15], [12, 40, 10], [54, 42, 11]]) { disc(g, cx, cy, rad, '@', true); disc(g, cx - 2, cy - 2, rad - 5, 'Q', true); for (let i = 0; i < 12; i++) put(g, cx + Math.round((rad - 1) * Math.cos(i)), cy + Math.round((rad - 1) * Math.sin(i)), '#'); }
  for (let i = 0; i < 8; i++) { const x = 6 + i * 7; for (let y = 12; y < 30; y += 3) putc(g, x, y, '!'); }   // hanging vines
  return g; }
function jungleRiver(a) { const g = NG(); noiseFill(g, 271 + a, ['#', 'q', '!'], 11);
  for (let y = 0; y < SZ; y++) { const cx = 32 + Math.round(11 * Math.sin(y / 8 + a) + 4 * Math.sin(y / 4)); for (let x = cx - 4; x <= cx + 4; x++) { const dd = Math.abs(x - cx); putc(g, x, y, dd > 3 ? '@' : dd > 2 ? 'g' : ((x + y + a) % 5 ? (dd < 2 ? 'W' : 'w') : '8')); } putc(g, cx - 5, y, 'r'); putc(g, cx + 5, y, 'r'); }
  return g; }

// ===================== ORANGE DUNES (warm desert) =====================
function orangeBase(v) { const g = NG(); noiseFill(g, 281 + v, ['N', 'D', 'd', '0'], 14);
  for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) if ((x + y * 2 + Math.round(8 * Math.sin(x / 7))) % 17 === 0) putc(g, x, y, 'D');   // wind ripples (amber)
  scatter(g, 282 + v, 6, (gg, x, y) => disc(gg, x, y, 1, 'd', true)); return g; }
function orangePath() { const g = NG(); noiseFill(g, 291, ['0', 'd', '0', 'N'], 11); scatter(g, 292, 12, (gg, x, y) => pebble(gg, x, y, 'D')); return g; }
function orangeRidge() { const g = NG(); noiseFill(g, 301, ['N', 'D', 'd'], 12);
  for (let x = 0; x < SZ; x++) { const yy = Math.round(28 + 10 * Math.sin(x / 9) + 5 * Math.sin(x / 4)); for (let y = yy; y < SZ; y++) putc(g, x, y, y === yy ? 'D' : (y < yy + 3 ? 'N' : 'd')); }   // crested dune ridge
  scatter(g, 302, 8, (gg, x, y) => disc(gg, x, y, 1, 'd', true)); return g; }

// ===================== EXTRA VARIANTS =====================
function grassClover() { const g = NG(); noiseFill(g, 311, ['q', 'g', 'g', 'G', 'h'], 11); scatter(g, 312, 22, (gg, x, y) => { putc(gg, x, y, 'h'); putc(gg, x + 1, y, 'G'); }); scatter(g, 313, 12, (gg, x, y) => putc(gg, x, y, '2')); return g; }
function mountainIce() { const g = NG(); noiseFill(g, 321, ['c', 'C', 'i', 'I', 'b'], 13); scatter(g, 322, 9, (gg, x, y, r) => { let cx = x, cy = y; for (let s = 0; s < 7; s++) { putc(gg, cx, cy, 'I'); cx += Math.round((r() - 0.5) * 4); cy += 1 + Math.round(r() * 2); } }); scatter(g, 323, 10, (gg, x, y) => putc(gg, x, y, 'C')); return g; }
function gardenFlowerbed() { const g = NG(); for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) g[y][x] = (Math.floor(y / 6) % 2 ? 'm' : 'M'); for (let by = 3; by < SZ; by += 12) { for (let x = 2; x < SZ - 2; x++) putc(g, x, by, 'p'); for (let x = 4; x < SZ - 2; x += 4) { putc(g, x, by - 1, (x % 8) ? '1' : '2'); putc(g, x, by + 1, 'P'); } } return g; }
function shadowAsh() { const g = NG(); noiseFill(g, 331, ['4', '5', '6', '5'], 12); scatter(g, 332, 16, (gg, x, y) => putc(gg, x, y, 'O')); scatter(g, 333, 10, (gg, x, y) => { putc(gg, x, y, 'v'); putc(gg, x, y - 1, 'V'); }); return g; }
function jungleMud() { const g = NG(); noiseFill(g, 341, ['r', 'e', '#', 'e'], 11); scatter(g, 342, 6, (gg, x, y) => disc(gg, x, y, 2, '9', true)); scatter(g, 343, 14, (gg, x, y) => putc(gg, x, y, '@')); return g; }
function orangeRock() { const g = NG(); noiseFill(g, 351, ['N', 'D', 'd'], 13); for (const [cx, cy, rr] of [[26, 40, 11], [46, 26, 8]]) for (let y = -rr; y <= rr; y++) for (let x = -rr; x <= rr; x++) if (x * x + y * y <= rr * rr) putc(g, cx + x, cy + y, (x - y) < -rr / 2 ? 'K' : (x - y) > rr / 2 ? 'r' : 'k'); return g; }

export const SPRITES = {
  // === extra variants (more unique ground per biome) ===
  tile_grass_clover: tile(grassClover()),
  tile_mountain_ice: tile(mountainIce()),
  tile_garden_flowerbed: tile(gardenFlowerbed()),
  tile_shadow_ash: tile(shadowAsh()),
  tile_jungle_mud: tile(jungleMud()),
  tile_orange_dune_rock: tile(orangeRock()),
  // ---- Grasslands (wild) ---- (trees/boulders now live in obstacles.js)
  tile_grass_base: tile(grassBase(0)),
  tile_grass_base_alt: tile(grassBase(1)),
  tile_grass_flowers: tile(grassFlowers()),
  tile_grass_tall: tile(grassTall()),
  tile_grass_fern: tile(grassFern()),
  tile_grass_path: tile(dirtPath()),
  tile_grass_brook: water(brook(0), brook(1)),
  tile_grass_to_path: tile(grassToPath()),

  // ---- Holy Mountains (cold) ----
  tile_mountain_base: tile(snowBase(0)),
  tile_mountain_base_alt: tile(snowBase(1)),
  tile_mountain_glacier: tile(glacier()),
  tile_mountain_path: tile(stonePathCold()),
  tile_mountain_drift: tile(snowDrift()),
  tile_mountain_frozen_river: water(frozenRiver(0), frozenRiver(1)),
  tile_mountain_snow_to_ice: tile(snowToIce()),

  // ---- Sea of Sand ----
  tile_sand_base: tile(sandBase(0)),
  tile_sand_base_alt: tile(sandBase(1)),
  tile_sand_path: tile(sandPath()),
  tile_sand_oasis_water: water(oasisWater(0), oasisWater(1)),

  // ---- Royal Gardens (geometric / industrial) ----
  tile_garden_lawn: tile(lawnGeo(0)),
  tile_garden_parterre: tile(parterre()),
  tile_garden_path: tile(pavers()),
  tile_garden_hedge: tile(hedge()),
  tile_garden_gearworks: tile(gearworks()),
  tile_garden_canal: water(canal(0), canal(1)),
  tile_garden_lawn_to_paver: tile(lawnToPaver()),

  // ---- Shadow Realm ----
  tile_shadow_base: tile(voidBase(0)),
  tile_shadow_base_alt: tile(voidBase(1)),
  tile_shadow_path: tile(shadowPath()),
  tile_shadow_hexwood: tile(hexwood()),
  tile_shadow_cursed_water: water(cursedWater(0), cursedWater(1)),

  // ---- Jungle (Orc applies) ----
  tile_jungle_base: tile(jungleBase()),
  tile_jungle_path: tile(junglePath()),
  tile_jungle_river: water(jungleRiver(0), jungleRiver(1)),

  // ---- Orange Dunes ----
  tile_orange_dune_base: tile(orangeBase(0)),
  tile_orange_dune_base_alt: tile(orangeBase(1)),
  tile_orange_dune_path: tile(orangePath()),
  tile_orange_dune_ridge: tile(orangeRidge()),
};

// ROLE → TILE map (engine-ready): every terrain ROLE a map cell can carry resolves to a terrain
// tile key here, so maps.js role-grids can be swapped 1:1 for these tiles at load. base/hi pick a
// variant per biome for visual variety; path & water are explicit.
export const TILE_MAP = {
  grasslands: { base: ['tile_grass_base', 'tile_grass_base_alt', 'tile_grass_flowers', 'tile_grass_tall', 'tile_grass_fern', 'tile_grass_clover'], path: 'tile_grass_path', water: 'tile_grass_brook' },
  mountains:  { base: ['tile_mountain_base', 'tile_mountain_base_alt', 'tile_mountain_glacier', 'tile_mountain_drift', 'tile_mountain_ice'], path: 'tile_mountain_path', water: 'tile_mountain_frozen_river' },
  sand:       { base: ['tile_sand_base', 'tile_sand_base_alt'], path: 'tile_sand_path', water: 'tile_sand_oasis_water' },
  gardens:    { base: ['tile_garden_lawn', 'tile_garden_parterre', 'tile_garden_hedge', 'tile_garden_gearworks', 'tile_garden_flowerbed'], path: 'tile_garden_path', water: 'tile_garden_canal' },
  shadow:     { base: ['tile_shadow_base', 'tile_shadow_base_alt', 'tile_shadow_hexwood', 'tile_shadow_ash'], path: 'tile_shadow_path', water: 'tile_shadow_cursed_water' },
  jungle:     { base: ['tile_jungle_base', 'tile_jungle_mud'], path: 'tile_jungle_path', water: 'tile_jungle_river' },
  orange:     { base: ['tile_orange_dune_base', 'tile_orange_dune_base_alt', 'tile_orange_dune_ridge', 'tile_orange_dune_rock'], path: 'tile_orange_dune_path', water: null },
};
