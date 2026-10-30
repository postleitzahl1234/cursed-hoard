// assets/data/additional/obelisk.js — bonus prop: a floating SANDSTONE OBELISK that hovers above
// the ground and pulses a warm aura onto the tiles around it. 2× density, authored on a 3×3 tile
// footprint (96×96, anchor center) so the aura visibly reaches the neighbouring cells. The obelisk
// bobs gently while a hover-shadow breathes below it; the aura ring expands/fades on a 6-frame loop.
export const META = { group: 'Additional · Obelisk', blurb: 'A floating sandstone obelisk — a carved, gold-glyphed monolith that hovers above its hex-shadow and pulses a warm radiant aura out across the adjacent tiles (6-frame loop). 96×96 (3×3 tiles), center-anchored.' };

export const LEGEND = {
  '`': null, o: 'IK1', O: 'IK0',
  d: 'SD1', s: 'SD2', S: 'SD3', n: 'SD4', N: 'SD5', w: 'SD6',   // sandstone dark→light
  g: 'GD2', G: 'GD4', y: 'GD5',                                 // gold glyphs / core
  a: 'GD1', A: 'GD3', e: 'EM6', E: 'EM7',                       // aura warm glow
  k: 'IK2',                                                     // hover shadow
};

const SZ = 96, C = 48, GROUND = 82;
const NG = () => Array.from({ length: SZ }, () => Array(SZ).fill('`'));
const put = (g, x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < SZ && y >= 0 && y < SZ) g[y][x] = c; };
const rows = g => g.map(r => r.join(''));
// elliptical ring (perspective-squashed), for the aura + shadow
function ring(g, cx, cy, rx, ry, c, step = 8) { for (let a = 0; a < 360; a += step) put(g, cx + rx * Math.cos(a * Math.PI / 180), cy + ry * Math.sin(a * Math.PI / 180), c); }
function ink(g, soft = '') { const add = []; for (let y = 0; y < SZ; y++) for (let x = 0; x < SZ; x++) { if (g[y][x] !== '`') continue; let t = false; for (let dy = -1; dy <= 1 && !t; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const cc = (g[y + dy] || [])[x + dx]; if (cc && cc !== '`' && cc !== 'o' && cc !== 'O' && soft.indexOf(cc) < 0) { t = true; break; } } if (t) add.push([x, y]); } for (const [x, y] of add) g[y][x] = 'o'; return g; }

// the obelisk monolith — a tapered four-sided pillar with a pyramidion cap, drawn at vertical
// offset `lift` (it floats), lit from the upper-left (light face N/w, shadow face s/d).
function drawObelisk(g, lift) {
  const topY = 14 - lift, botY = 64 - lift, capH = 12;
  // pyramidion (capstone) — proper pyramid: narrow point at TOP, widening to the shaft below
  for (let j = 0; j <= capH; j++) { const hw = Math.round(j * 0.6); for (let x = -hw; x <= hw; x++) { const c = x < -hw / 2 ? 'N' : x > hw / 2 ? 's' : 'n'; put(g, C + x, topY + j, c); } }
  put(g, C, topY, 'y'); put(g, C, topY + 1, 'G'); put(g, C, topY + 2, 'G');                       // gilded apex glint
  // a glyph carved on the capstone face
  put(g, C, topY + capH - 3, 'g'); put(g, C - 1, topY + capH - 2, 'G'); put(g, C + 1, topY + capH - 2, 'G');
  // shaft — slight taper, wider at base
  for (let y = topY + capH; y <= botY; y++) { const t = (y - (topY + capH)) / (botY - topY - capH); const hw = Math.round(6 + t * 3);
    for (let x = -hw; x <= hw; x++) { const ld = x + hw, rd = hw - x; put(g, C + x, y, ld < 2 ? 'N' : rd < 2 ? 'd' : x < -1 ? 'n' : x > 2 ? 's' : 'S'); } }
  // carved gold glyph band + columns of runes down the lit faces
  for (let x = -5; x <= 5; x++) { put(g, C + x, topY + capH + 6, 'g'); put(g, C + x, topY + capH + 7, 'a'); }
  // rich rune column: alternating glyph motifs (eye, bar, chevron, ring) down the shaft
  const glyphRows = [topY + capH + 12, topY + capH + 17, topY + capH + 22, topY + capH + 27, topY + capH + 32, topY + capH + 37];
  glyphRows.forEach((gy, i) => {
    const m = i % 4;
    if (m === 0) { put(g, C, gy, 'y'); put(g, C - 1, gy, 'g'); put(g, C + 1, gy, 'g'); put(g, C, gy - 1, 'g'); put(g, C, gy + 1, 'g'); }            // eye / sun-disc
    else if (m === 1) { for (let x = -3; x <= 3; x++) put(g, C + x, gy, 'G'); put(g, C, gy + 1, 'a'); }                                            // bar
    else if (m === 2) { put(g, C - 2, gy, 'G'); put(g, C - 1, gy + 1, 'g'); put(g, C, gy + 2, 'G'); put(g, C + 1, gy + 1, 'g'); put(g, C + 2, gy, 'G'); }  // chevron
    else { put(g, C - 1, gy, 'g'); put(g, C + 1, gy, 'g'); put(g, C, gy - 1, 'G'); put(g, C, gy + 1, 'G'); put(g, C, gy, 'a'); }                     // ring
  });
  // side accents along the dark/light edges for extra carved detail
  for (const gy of [topY + capH + 14, topY + capH + 24, topY + capH + 34]) { put(g, C - 5, gy, 'A'); put(g, C + 5, gy, 'A'); }
  // base course
  for (let x = -10; x <= 10; x++) { put(g, C + x, botY + 1, 's'); put(g, C + x, botY + 2, 'd'); }
  put(g, C - 9, botY + 1, 'n'); put(g, C + 9, botY + 1, 'd');
}

// aura: concentric warm ellipses radiating OUT to the neighbouring tiles, expanding+fading per frame
function drawAura(g, k, lift) {
  const cy = 50 - lift;
  const radii = [10, 18, 26, 34, 40, 46];
  for (let i = 0; i < radii.length; i++) {
    const rr = radii[(i + k) % radii.length];
    const fade = 1 - rr / 52;                                  // outer rings dimmer
    const col = rr < 20 ? 'E' : rr < 34 ? 'e' : rr < 42 ? 'A' : 'a';
    ring(g, C, cy, rr, rr * 0.5, col, rr > 34 ? 14 : 9);
  }
  // soft core bloom under the floating shaft
  for (let dy = -3; dy <= 3; dy++) for (let dx = -6; dx <= 6; dx++) if (dx * dx / 4 + dy * dy < 9 && ((dx + dy + k) & 1)) put(g, C + dx, cy + dy, 'E');
  // four directional spokes marking the adjacent tiles it empowers
  for (const [ax, ay] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const px = C + ax * (30 + (k % 2) * 4), py = cy + ay * (15 + (k % 2) * 2); put(g, px, py, 'A'); put(g, px - ax, py - ay, 'a'); }
}

function frame(k) {
  const g = NG();
  const lift = [0, 1, 2, 1, 0, -1][k];                          // gentle bob
  // hovering shadow on the ground (breathes inversely to lift)
  const sw = 13 - lift;
  for (let dy = -3; dy <= 3; dy++) for (let dx = -sw; dx <= sw; dx++) if (dx * dx / (sw * sw) + dy * dy / 9 <= 1) put(g, C + dx, GROUND + dy, ((dx + dy) & 1) ? 'k' : 'O');
  ring(g, C, GROUND, sw, 3, 'k', 10);
  drawAura(g, k, lift);                                         // aura behind the stone (soft, un-inked)
  drawObelisk(g, lift);
  return rows(ink(g, 'aAeE'));                                  // outline the stone, leave the aura soft
}

export const SPRITES = {
  obelisk_sandstone: { anchor: 'center', fps: 6, loop: true, frames: [0, 1, 2, 3, 4, 5].map(frame) },
};
