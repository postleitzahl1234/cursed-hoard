// assets/data/towerbases.js — faction-DISTINCT bases (64×128) with BRANCH identity + strong
// per-tier escalation. Each tower differs from its tier-neighbours by ≥5 levers (D-20):
//   1 SIZE  2 INTRICACY/LAYERS (single block → multi-tier setback tower)  3 COLOUR (darker,
//   richer body for stronger tiers + brighter accent)  4 STRIPES/banding + SILVER→GOLD trim
//   5 SPIKES (parapet/finial)  6 bigger WEAPON (driven in the roster).
// Branch gives identity: Crypt frost-crystal / fear-shroud / lightning-tesla / college-orrery /
// terror-belfry; Demon beam-horn-tower / pyre-caldera; Orc marksman-watchtower / artillery-bunker;
// Goblin drone-hangar / ordnance-bunker / bomber-mast.  Orc/Goblin return the turret SEAT y (D-23).
import { CX, set, band, vline, hline, rect, disc, tri, diamond, wpCharges, wpBrazier, wpBeam, wpPyre, wpMortar } from './towerkit.js';

const lerp = (a, b, t) => a + (b - a) * t;
const layersFor = t => (t <= 2 ? 1 : t <= 4 ? 2 : 3);

// stacked-setback body — `rowFn(g,y,half,layer)` paints one row in the faction's material.
function layeredBody(g, topY, bot, halfTop, halfBot, tier, rowFn, corniceCh) {
  const L = layersFor(tier), segH = (bot - topY) / L;
  for (let l = 0; l < L; l++) {
    const yT = Math.round(topY + l * segH), yB = Math.round(topY + (l + 1) * segH);
    const wB = Math.round(lerp(halfBot, halfTop, l / L)), wT = Math.round(lerp(halfBot, halfTop, (l + 1) / L));
    for (let y = yT; y < yB; y++) rowFn(g, y, Math.round(lerp(wB, wT, (y - yT) / (yB - yT))), l);
    if (l > 0) { band(g, yT, wB + 1, corniceCh); band(g, yT - 1, wB, corniceCh); }   // setback lip = visible tier
  }
}
// spiked parapet across a width
function spikes(g, cx, y, half, n, ch, glow) {
  for (let i = 0; i < n; i++) { const x = Math.round(cx - half + (2 * half) * (i / (n - 1 || 1))); tri(g, x, y - 3, 4, ch); if (glow) set(g, x, y - 3, glow); }
}
// silver→gold trim band + ornamental stripe + t6 crown. Returns nothing.
function tierTrim(g, topY, half, tier, faction) {
  const trim = tier >= 5 ? 'Y' : tier >= 3 ? 'g' : null;
  if (trim) { band(g, topY, half - 1, trim); band(g, topY + 1, half - 1, tier >= 5 ? 'G' : 's'); }
  if (tier >= 4) { const ys = topY + 6; for (let x = CX - half + 2; x <= CX - 2 + half; x += 3) set(g, x, ys, tier >= 5 ? 'G' : 'g'); } // ornamental frieze near the top (clear of any arch below)
  if (tier === 6) spikes(g, CX, topY - 1, half - 1, 6, 'Y', 'G');                  // gold crown of spikes
}

// =================================================================== ORC: log fort
export function baseOrc(g, tier, branch = 'bolt') {
  const tall = branch === 'bolt', wide = branch === 'bomb';
  const topY = (tall ? 56 : 60) - tier * 2 + (wide ? 4 : 0), bodyBot = 122;
  const halfBot = (wide ? 19 : 14) + Math.round(tier * 1.3), halfTop = (wide ? 12 : 8) + Math.round(tier * 1.1);
  // green log ramp; stronger tiers go darker. Wood accents (brown 7/8/9) are added on top.
  const dk = tier >= 5 ? 'O' : 'a', mi = tier >= 5 ? 'a' : tier >= 3 ? 'u' : 'e', hi = tier >= 3 ? 'E' : 'q';
  // rounded "den" body — a domed log mound (bulging round green walls, like a burrow)
  const span = bodyBot - topY;
  for (let y = topY; y <= bodyBot; y++) {
    const h = Math.round(halfTop + (halfBot - halfTop) * Math.sin(((y - topY) / span) * Math.PI / 2));
    const r = (y - topY) % 6;
    band(g, y, h, r === 2 ? hi : mi);                          // sparse highlight course (logs read, not corduroy)
    band(g, y, h - 1, mi);
    set(g, CX - h, y, '8'); set(g, CX + h - 1, y, '8');        // brown end-grain at the round edge
  }
  for (let j = 1; j <= 3; j++) band(g, topY - j, Math.max(1, halfTop - j), mi);   // rounded crown
  // ── PEAKED LOG ROOF (the old bottom plinth repurposed as a roof) ──────────
  // overhanging eave brim + a filled gable peak above the den; the turret pokes out beneath it
  const reave = halfTop + 5, rTopY = topY - 2;
  for (let x = CX - reave; x <= CX - 1 + reave; x++) { set(g, x, rTopY, '7'); set(g, x, rTopY - 1, '8'); }     // eave overhang
  set(g, CX - reave - 1, rTopY, '9'); set(g, CX + reave, rTopY, '9');                                        // eave tips
  const rPeak = reave - 2;
  for (let j = 0; j <= rPeak; j++) { const w = Math.round((rPeak - j) * (halfTop / rPeak) * 0.9) + 1; for (let x = CX - w; x <= CX - 1 + w; x++) set(g, x, rTopY - 2 - j, x < CX ? (j % 3 ? '8' : 'E') : '7'); }  // log gable
  set(g, CX, rTopY - 2 - rPeak, '9'); set(g, CX, rTopY - 3 - rPeak, '9');                                     // ridge finial
  for (let j = 0; j <= rPeak; j += 3) { set(g, CX - 1, rTopY - 2 - j, '9'); }                                  // ridge log seam
  // ── extra WOODEN elements ───────────────────────────────────────────────
  // angled timber support braces leaning against the body (both sides), more with tier
  const braces = 1 + Math.floor(tier / 2);
  for (const s of [-1, 1]) for (let b = 0; b < braces; b++) {
    const footY = bodyBot - 2 - b * 4, topYY = footY - 16 - b * 2;
    const fx = CX + s * (halfBot + 1 + b), tx = CX + s * Math.round(halfTop * 0.7);
    for (let t = 0; t <= 1; t += 0.06) { const x = fx + (tx - fx) * t, y = footY + (topYY - footY) * t; set(g, x, y, '8'); set(g, x, y + 1, '7'); }
    set(g, fx, footY, '9'); set(g, tx, topYY, '9');                               // pegged ends
  }
  // wooden scaffold platform jutting under the turret seat (brown planks + posts)
  for (let x = CX - halfTop - 2; x <= CX - 1 + halfTop + 2; x++) { set(g, x, topY + 2, '9'); set(g, x, topY + 3, '7'); }
  for (let x = CX - halfTop - 2; x <= CX - 1 + halfTop + 2; x += 3) set(g, x, topY + 2, '8');  // plank seams
  for (const s of [-1, 1]) vline(g, CX + s * (halfTop + 2), topY + 3, 6, '8');    // scaffold legs
  // sharpened wooden palisade stakes ringing the den shoulder
  for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 3; k++) { const sx = CX + s * (halfBot - 1 + k * 3); tri(g, sx, bodyBot - 4, 4, '8'); set(g, sx, bodyBot - 4, '9'); }
  const dT = bodyBot - 17; for (let y = dT; y < bodyBot; y++) { const w = y < dT + 2 ? Math.max(1, 4 - (dT + 2 - y)) : 4; band(g, y, w, 'O'); }  // gate
  for (let y = dT - 1; y < bodyBot; y++) { set(g, CX - 5, y, '8'); set(g, CX + 4, y, '8'); } for (let x = CX - 5; x <= CX + 4; x++) set(g, x, dT - 1, '9');   // brown timber door frame + lintel
  // central symmetric RHOMBUS carvings down the body (totem ornament) — grow + gild with tier
  const dCount = Math.min(3, 1 + Math.floor(tier / 2)), dR = tier >= 5 ? 4 : 3;
  const dEdge = tier >= 5 ? 'Y' : tier >= 3 ? 'q' : 'E', dCtr = tier >= 5 ? 'G' : 'u';
  const dTopY = topY + 7, dGap = dR * 2 + 3;
  for (let i = 0; i < dCount; i++) { const cy = dTopY + i * dGap; if (cy + dR > dT - 2) break; diamond(g, CX, cy, dR, dEdge, dCtr); diamond(g, CX, cy, dR - 2 > 0 ? dR - 2 : 1, 'O'); }
  if (branch === 'bolt') for (let s of [-1, 1]) { const yy = topY + 9; vline(g, CX + s * Math.round(halfTop * 0.6), yy, 3, 'O'); }   // a single arrow slit per side (was a row of rods)
  if (branch === 'bomb') for (let s of [-1, 1]) disc(g, CX + s * (halfBot - 2), bodyBot - 2, 2, 'O');   // boulder pile
  if (branch === 'shared') for (let s of [-1, 1]) rect(g, CX + s * (halfTop + 1) - 1, topY + 4, 3, 5, 'u');  // powder kegs
  tierTrim(g, topY, halfTop, tier, 'orc');
  band(g, topY, halfTop, 'a'); band(g, topY + 1, halfTop, 'E');
  const seatY = topY + 3; band(g, seatY, halfTop - 1, 'u'); band(g, seatY + 1, halfTop - 1, 'a');
  if (tier >= 3) for (const s of [-1, 1]) { const px = CX + s * (halfTop + 3); vline(g, px, topY - 2, 12, 'a'); disc(g, px, topY - 5, 3, 'y'); set(g, px - 1, topY - 5, 'O'); set(g, px + 1, topY - 5, 'O'); set(g, px, topY - 3, 'O'); }  // skull totems
  if (tier >= 5) for (const s of [-1, 1]) { const px = CX + s * (halfTop - 1); for (let j = 0; j < 5; j++) set(g, px + s * Math.round(j * 0.6), seatY - 2 - j, 'y'); }   // tusks
  return seatY - 1;
}

// =================================================================== GOBLIN: steampunk rig
export function baseGoblin(g, tier, branch = 'base') {
  const topY = 58 - tier * 2, bodyBot = 122, halfBot = 12 + Math.round(tier * 1.3), halfTop = 9 + Math.round(tier * 1.1);
  const dk = tier >= 5 ? 'O' : 'i', mi = tier >= 5 ? 'i' : 's', hi = 'I';
  layeredBody(g, topY, bodyBot, halfTop, halfBot, tier, (gg, y, h, l) => {
    for (let x = CX - h; x <= CX - 1 + h; x++) { const ld = x - (CX - h), rd = (CX - 1 + h) - x; set(gg, x, y, ld < 2 ? hi : rd < 2 ? dk : mi); }
    if ((y - topY) % 5 === 3) for (let x = CX - h + 2; x <= CX - 2 + h; x += 5) set(gg, x, y, 'b');     // rivet stripes
  }, 'N');
  disc(g, CX, topY + 9, 3, 'C'); set(g, CX, topY + 9, 'w'); for (let a = 0; a < 360; a += 45) set(g, CX + Math.round(4 * Math.cos(a * Math.PI / 180)), topY + 9 + Math.round(4 * Math.sin(a * Math.PI / 180)), 'b');  // porthole
  // small riveted iron hatch door at the base
  const gdW = tier >= 4 ? 3 : 2, gdBot = bodyBot - 1, gdTop = gdBot - 6;
  for (let y = gdTop; y <= gdBot; y++) for (let x = CX - gdW; x <= CX - 1 + gdW; x++) set(g, x, y, 'O'); for (let j = 0; j < gdW; j++) band(g, gdTop - 1 - j, gdW - 1 - j, 'O');   // arched hatch
  for (let y = gdTop + 1; y <= gdBot - 1; y += 2) { set(g, CX - gdW, y, 'b'); set(g, CX - 1 + gdW, y, 'b'); }   // hinge rivets
  set(g, CX - 1, gdBot - 2, 'r');                                                                            // ember vent glow
  const stx = CX - (halfBot + 2); vline(g, stx, topY - 8, 12, 'n'); vline(g, stx + 1, topY - 8, 12, 'N'); for (let p = 0; p < 3; p++) disc(g, stx, topY - 10 - p * 2, 1 + (p % 2), 'k');   // smokestack
  if (branch === 'drone') { const dx = CX + (halfBot + 1); for (let a = 0; a < 200; a += 30) set(g, dx + Math.round(5 * Math.cos(a * Math.PI / 180)), topY - 2 + Math.round(4 * Math.sin(a * Math.PI / 180)), 'S'); vline(g, dx, topY - 8, 6, 'i'); }  // radar dish + antenna
  if (branch === 'ordnance') for (let s of [-1, 1]) rect(g, CX + s * (halfBot - 2) - 1, topY + 6, 3, 4, 'B');   // ammo crates
  if (branch === 'bomber') { vline(g, CX + (halfBot + 1), topY - 14, 16, 'n'); set(g, CX + (halfBot + 1), topY - 14, 'b'); }   // mooring mast
  if (tier >= 3) { const tkx = CX + (halfBot + 2); for (let y = topY - 1; y <= topY + 7; y++) for (let x = tkx - 1; x <= tkx + 2; x++) set(g, x, y, x < tkx ? 'B' : 'N'); set(g, tkx, topY - 1, 'b'); }   // pressure tank
  tierTrim(g, topY, halfTop, tier, 'goblin');
  const seatY = topY - 1;
  if (branch === 'drone' || branch === 'bomber') {            // static drone-launch deck (no turret)
    for (let x = -9; x <= 9; x++) { set(g, CX + x, seatY, 'N'); set(g, CX + x, seatY + 1, 'n'); }
    for (let x = -9; x <= 9; x += 4) { set(g, CX + x, seatY - 1, 'i'); set(g, CX + x, seatY - 2, 'r'); }   // rail posts + landing lights
  } else {
    for (let x = -7; x <= 7; x++) set(g, CX + x, seatY, tier >= 5 ? 'B' : 'N'); for (let x = -7; x <= 7; x += 2) set(g, CX + x, seatY - 1, tier >= 5 ? 'Y' : 'b');
  }
  return seatY - 1;
}

// =================================================================== CRYPT: gothic + branch
const ICE = { o: 'T', mi: 'U', hi: 'C' };
function superHeadstone(g, sx, base, tier) {
  const top = base - 9 - tier;
  for (let y = top; y <= base; y++) { const h = Math.round(3 + (y - top) / 4); band(g, y, h, 'U'); band(g, y, h - 1, y % 2 ? 'Q' : 'U'); set(g, sx - h, y, 'T'); }
  disc(g, sx, top, 3, 'U'); set(g, sx, top, 'Q'); for (let a = 0; a < 360; a += 45) set(g, sx + Math.round(2 * Math.cos(a * Math.PI / 180)), top - 3 + Math.round(2 * Math.sin(a * Math.PI / 180)), 'y');
  return top - 8;
}
function superFrost(g, sx, base, tier) {                          // faceted ice obelisk + icicles
  const h0 = 14 + tier * 2, top = base - h0;
  for (let y = top; y <= base; y++) { const hw = Math.round(1 + ((y - top) / h0) * 4); for (let x = -hw; x <= hw; x++) set(g, sx + x, y, x < 0 ? 'C' : x > 0 ? 'T' : 'w'); if (y % 3 === 0) set(g, sx, y, 'w'); }
  set(g, sx, top - 1, 'w'); set(g, sx, top - 2, 'w');
  for (let x = -6; x <= 6; x += 2) { const il = 2 + (Math.abs(x) % 3); for (let j = 0; j < il; j++) set(g, sx + x, base - 4 + j, 'C'); set(g, sx + x, base - 4 + il, 'w'); }   // icicle fringe
  return top - 6;
}
function superOrrery(g, sx, base, tier, fr) {                     // college: armillary rings + frozen orb (gold)
  const cy = base - 20;
  disc(g, sx, cy, 4, 'C'); set(g, sx, cy, 'w'); set(g, sx - 2, cy - 1, 'w');
  for (let a = 0; a < 360; a += 12) set(g, sx + Math.round(11 * Math.cos((a + fr * 8) * Math.PI / 180)), cy + Math.round(4 * Math.sin((a + fr * 8) * Math.PI / 180)), 'S');
  for (let a = 0; a < 360; a += 12) set(g, sx + Math.round(4 * Math.cos(a * Math.PI / 180)), cy + Math.round(9 * Math.sin(a * Math.PI / 180)), 'G');
  for (let y = cy + 4; y <= base; y++) band(g, y, 2, 'U');
  return cy - 11;
}
function superShroud(g, sx, base, tier) {                         // fear: ragged spire + shroud + skull
  const h0 = 12 + tier * 2, top = base - h0;
  for (let y = top; y <= base; y++) { const h = Math.round(2 + (y - top) / 4); band(g, y, h, 'k'); band(g, y, h - 1, y % 2 ? 'T' : 'k'); }
  disc(g, sx, top - 2, 3, 'y'); set(g, sx - 1, top - 2, 'O'); set(g, sx + 1, top - 2, 'O'); set(g, sx, top, 'O');   // skull finial
  for (let x = -5; x <= 5; x++) { const dl = 6 + (x % 2 ? 2 : 0) - Math.abs(x); for (let j = 0; j < dl; j++) set(g, sx + x, top + 5 + j, x < 0 ? 'v' : 'V'); }   // tattered shroud
  set(g, sx - 4, top - 4, 'x'); set(g, sx + 3, top - 5, 'v');
  return top - 8;
}
function superBelfry(g, sx, base, tier) {                         // terror: bone belfry + bell + skulls
  const top = base - 22;
  for (let y = top; y <= base - 8; y++) { band(g, y, 6, 'k'); band(g, y, 5, 'O'); }
  band(g, top, 6, 'k');
  for (const dx of [-3, 3, 0]) disc(g, sx + dx, top - 1, 2, 'y');                          // stacked skulls
  for (let y = top + 4; y <= top + 9; y++) band(g, y, Math.round((y - top - 4) / 1.5) + 1, 'h'); band(g, top + 10, 1, 'G');   // bell
  for (const s of [-1, 1]) for (let j = 0; j < 8; j++) set(g, sx + s * 6, base - 12 + j, 'v');   // shroud drapes
  return top - 6;
}
function superTesla(g, sx, base, tier) {                          // lightning: iron rod + coils + globe
  const h0 = 13 + tier, top = base - h0;
  for (let y = top; y <= base; y++) { set(g, sx - 1, y, 'S'); set(g, sx, y, 'g'); set(g, sx + 1, y, 's'); }
  for (let k = 0; k < 3 + (tier >= 6 ? 1 : 0); k++) { const y = base - 4 - k * 4; for (let x = -3; x <= 3; x++) set(g, sx + x, y, k % 2 ? 'i' : 'S'); set(g, sx - 4, y, 'i'); set(g, sx + 4, y, 'i'); }   // coil rings
  disc(g, sx, top - 2, 3, '2'); set(g, sx, top - 2, '4'); for (let a = 0; a < 360; a += 60) set(g, sx + Math.round(3 * Math.cos(a * Math.PI / 180)), top - 2 + Math.round(3 * Math.sin(a * Math.PI / 180)), '3');
  return top - 6;
}
export function baseCrypt(g, tier, fr, w) {
  const branch = w.branch || 'base';
  const fearful = branch === 'fear' || branch === 'terror';                       // purple-themed branches
  const glo = fearful ? 'X' : 'C', glo2 = fearful ? 'V' : 'w';                     // lit-accent colour (purple vs ice)
  const topY = 60 - tier * 2, bodyBot = 110, halfBot = 11 + Math.round(tier * 1.4), halfTop = 8 + Math.round(tier);
  const dark = tier >= 5;                                                         // stronger = darker ashlar
  const lo = dark ? 'k' : 'T', mi = dark ? 'T' : 'U', hi = dark ? 'U' : (tier >= 3 ? 'C' : 'Q');
  for (let y = bodyBot; y <= 124; y++) { band(g, y, halfBot, mi); band(g, y, halfBot - 1, lo); set(g, CX - halfBot, y, lo); set(g, CX - 1 + halfBot, y, lo); }   // straight grounded footing (no flared plinth)
  layeredBody(g, topY, bodyBot, halfTop, halfBot, tier, (gg, y, h, l) => {
    for (let x = CX - h; x <= CX - 1 + h; x++) { const ld = x - (CX - h), rd = (CX - 1 + h) - x; set(gg, x, y, ld < 2 ? hi : rd < 2 ? lo : mi); }
    if ((y - topY) % 6 === 4) band(gg, y, h - 2, fearful ? 'v' : lo);              // ashlar courses (purple-veined for fear)
  }, 'T');
  // side BATTLEMENTS escalate with tier (intricacy ramp):
  //  T1   — just a couple of minor stone LEDGES on the main tower (no turrets)
  //  T2   — ledges + a thin crenellated parapet capping the body
  //  T3-4 — one short flanking turret per side (crenellated, arrow-slit)
  //  T5-6 — TALL flanking turrets + a second stacked mini-turret + gold finials
  const ledgeY = topY + Math.round((bodyBot - topY) * 0.30);
  if (tier <= 2) {
    for (const s of [-1, 1]) { const lx = CX + s * (halfTop + 1); for (let dx = 0; dx < 3; dx++) { set(g, lx + s * dx, ledgeY, hi); set(g, lx + s * dx, ledgeY + 1, lo); } }   // minor corbel ledges
    if (tier === 2) for (let x = CX - halfTop; x <= CX - 1 + halfTop; x += 2) { set(g, x, topY - 1, mi); set(g, x, topY - 2, hi); }   // thin roof parapet
  } else {
    const turrets = tier >= 5 ? 2 : 1;                                            // stacked count per side
    const btnW = tier >= 5 ? 3 : 2, btTop = topY + Math.round((bodyBot - topY) * (tier >= 5 ? 0.12 : 0.30));
    for (const s of [-1, 1]) {
      const bx = CX + s * (halfBot - 1);
      for (let y = btTop; y <= bodyBot - 2; y++) for (let x = bx - btnW; x <= bx + btnW; x++) { const ld = x - (bx - btnW), rd = (bx + btnW) - x; set(g, x, y, ld < 1 ? hi : rd < 1 ? lo : mi); }
      for (let x = bx - btnW; x <= bx + btnW; x += 2) { set(g, x, btTop - 1, mi); set(g, x, btTop - 2, hi); }   // merlon crenellations
      for (let t = 0; t < turrets; t++) { set(g, bx, btTop + 3 + t * 5, 'O'); set(g, bx, btTop + 4 + t * 5, glo); }   // arrow-slits (one per stacked level)
      if (fearful) { for (let j = 0; j < 5; j++) for (let x = bx - btnW + 1; x <= bx + btnW - 1; x++) set(g, x, btTop + (tier >= 5 ? 1 : 0) + j, (j === 4) ? 'v' : (x === bx ? 'X' : 'V')); }   // hanging purple shroud banner on each turret
      if (tier >= 5) { set(g, bx - btnW - 1, btTop - 2, 'd'); set(g, bx + btnW + 1, btTop - 2, 'd');               // gold finials
        for (let x = bx - 1; x <= bx + 1; x += 2) { set(g, x, btTop - 8, mi); set(g, x, btTop - 9, hi); } for (let y = btTop - 7; y < btTop - 1; y++) for (let x = bx - 1; x <= bx + 1; x++) set(g, x, y, mi); }   // 2nd stacked mini-turret
    }
  }
  // small arched door at the base + lit lancet windows up the body
  const dW = tier >= 4 ? 4 : 3, dBot = bodyBot - 1, dTop = dBot - 9;
  for (let y = dTop; y <= dBot; y++) band(g, y, dW, 'O'); for (let j = 0; j < dW; j++) band(g, dTop - 1 - j, dW - 1 - j, 'O');
  band(g, dBot, dW - 1, glo); band(g, dBot - 1, dW - 2, glo2);                    // lit threshold (purple for fear)
  const floors = 1 + Math.floor(tier / 1.5);
  for (let f = 0; f < floors; f++) { const wy = bodyBot - 16 - f * 9; if (wy < topY + 9) break; for (const s of [-1, 1]) { const wx = CX + s * Math.round(halfTop * 0.55); set(g, wx, wy - 1, 'O'); set(g, wx, wy, glo); set(g, wx, wy + 1, glo2); set(g, wx, wy + 2, 'O'); } if (tier >= 5) { set(g, CX, wy - 1, 'O'); set(g, CX, wy, glo); set(g, CX, wy + 1, glo2); set(g, CX, wy + 2, 'O'); } }
  const rY = topY + 5; for (let x = CX - halfTop + 1; x <= CX - 2 + halfTop; x += 3) { vline(g, x, rY - 3, 3, 'i'); set(g, x, rY - 4, 's'); }   // iron spear railing
  if (tier >= 4) for (const s of [-1, 1]) { const px = CX + s * (halfTop + Math.round((halfBot - halfTop) * 0.4)); disc(g, px, topY + 14, 2, 'U'); set(g, px + s, topY + 14, fearful ? 'X' : 'O'); }  // gargoyles (purple-eyed for fear)
  tierTrim(g, topY, halfTop, tier, 'crypt');
  const sup = { base: superHeadstone, frost: superFrost, college: superOrrery, fear: superShroud, terror: superBelfry, lightning: superTesla }[branch] || superHeadstone;
  const chargeCY = sup(g, CX, topY + 2, tier, fr);
  wpCharges(g, CX - 0.5, chargeCY, tier, fr, w);
}

// =================================================================== DEMON: basalt ziggurat + branch
// beam line = TALL & narrow horned tower · pyre line = SHORTEST & broadest caldera ·
// shared (brimstone/magma) = short & sturdy. Steps gain stairs, windows & a gateway per tier.
export function baseDemon(g, tier, fr, w) {
  const branch = w.branch || 'base';
  const beam = branch === 'beam', pyre = branch === 'pyre', shared = branch === 'shared';
  const topY = (beam ? 50 : pyre ? 66 : shared ? 62 : 58) - tier * 2, bot = 122;
  const baseHalf = (pyre ? 27 : beam ? 18 : shared ? 25 : 22) + (tier >= 5 ? 2 : 0);
  const peakHalf = (pyre ? 13 : beam ? 6 : shared ? 11 : 8) + Math.round(tier * (pyre ? 0.9 : beam ? 0.5 : 0.7));
  const steps = 2 + Math.ceil(tier / 2);                                          // more steps (intricacy) higher tier
  const stepH = (bot - topY) / steps;
  const hAt = s => Math.round(lerp(peakHalf, baseHalf, s / steps));
  for (let s = 0; s < steps; s++) {
    const yT = Math.round(topY + s * stepH), yB = Math.round(topY + (s + 1) * stepH), h = hAt(s + 1), hu = s === 0 ? 0 : hAt(s);
    // riser (vertical face) of this terrace — lit left, shadow right, dark body
    for (let y = yT + 2; y < yB; y++) for (let x = CX - h; x <= CX - 1 + h; x++) { const ld = x - (CX - h), rd = (CX - 1 + h) - x; set(g, x, y, ld < 2 ? 'D' : rd < 2 ? 'O' : 'd'); }
    // STRONG step relief: bright sunlit TREAD on the shelf that juts out past the terrace above
    for (let ty = yT; ty <= yT + 1; ty++) {
      for (let x = CX - h; x < CX - hu; x++) set(g, x, ty, ty === yT ? 'A' : 'D');                 // left shelf
      for (let x = CX + hu; x <= CX - 1 + h; x++) set(g, x, ty, ty === yT ? 'A' : 'D');             // right shelf
    }
    // dark shadow recess where the upper riser meets this tread (the terrace's cast shadow)
    if (s > 0) { for (let x = CX - hu; x <= CX - 1 + hu; x++) { set(g, x, yT, 'O'); set(g, x, yT + 1, 'k'); } }
    const veins = tier <= 2 ? 1 : tier <= 4 ? 2 : 3;
    for (let v = 0; v < veins; v++) { const vx = Math.round(lerp(-h * 0.55, h * 0.55, veins === 1 ? 0.5 : v / (veins - 1))); if (Math.abs(vx) <= 5) continue; for (let y = yT + 3; y < yB - 1; y++) { const j = (Math.floor((y + v * 5) / 4) % 2) ? 1 : 0; set(g, CX + vx + j, y, (y % 6 === 0) ? (tier >= 5 ? '#' : 'F') : 'r'); } }
    const cols = Math.min(tier, s + 1);                                           // ember windows on the riser face
    for (let c = 0; c < cols; c++) { const fx = 6 + Math.round((h - 9) * (cols <= 1 ? 0.3 : c / (cols - 1))); if (fx > h - 3) continue; const wy = Math.round((yT + yB) / 2) + 1; for (const sgn of [-1, 1]) { set(g, CX + sgn * fx, wy - 1, 'O'); set(g, CX + sgn * fx, wy, 'r'); set(g, CX + sgn * fx, wy + 1, 'O'); } }
  }
  // bold central STAIRCASE in red obsidian (ember-lit treads — matches the demon theme).
  // Stops one terrace below the summit, where a small shrine DOOR sits at the head of the stairs.
  const sw = tier >= 5 ? 4 : 3, sTop = 1;                       // skip the topmost terrace → shortened stair
  for (let s = sTop; s < steps; s++) { const yT = Math.round(topY + s * stepH), yB = Math.round(topY + (s + 1) * stepH); for (let y = yT; y < yB; y++) for (let x = CX - sw; x <= CX - 1 + sw; x++) set(g, x, y, x < CX - sw + 1 ? 'O' : x > CX - 2 + sw ? 'O' : (y % 3 === 0 ? 'D' : 'd')); for (let x = CX - sw; x <= CX - 1 + sw; x++) { set(g, x, yT, tier >= 5 ? 'r' : 'A'); set(g, x, yT + 1, 'O'); } }   // ember tread + shadow per stair
  // small arched shrine door at the head of the staircase (top terrace face)
  const dW = tier >= 5 ? 3 : 2, dBot = Math.round(topY + sTop * stepH) - 1, dTop = dBot - (dW + 3);
  for (let y = dTop; y <= dBot; y++) band(g, y, dW, 'O'); for (let j = 0; j < dW; j++) band(g, dTop - 1 - j, dW - 1 - j, 'O');
  band(g, dBot, dW - 1, 'r'); set(g, CX - 1, dBot - 1, 'f');    // ember glow within the doorway
  if (tier >= 3) { const gW = tier >= 5 ? 4 : 3, gBot = bot - 2, gTop = gBot - 8; for (let y = gTop; y <= gBot; y++) band(g, y, gW, 'O'); for (let j = 0; j < gW; j++) band(g, gTop - 1 - j, gW - 1 - j, 'O'); band(g, gBot, gW - 1, 'r'); }   // base gateway
  const altY = topY - 2;
  for (let y = altY; y <= topY + 3; y++) band(g, y, peakHalf - 2, 'd'); band(g, altY, peakHalf - 3, 'O');
  if (beam || tier >= 2) for (const s of [-1, 1]) for (let j = 0; j < (beam ? tier + 4 : tier + 1); j++) set(g, CX + s * (peakHalf - 1 + Math.round(j / 3)), altY - j, j > tier ? 'd' : 'D');   // obsidian horns (taller for beam)
  if (pyre) { band(g, altY, peakHalf, 'O'); band(g, altY + 1, peakHalf - 1, 'f'); }
  if (tier === 6) spikes(g, CX, altY - 2, peakHalf, 5, 'd', 'r');
  w.fn(g, CX, altY, tier, fr, w);
}
