// troops/w5_hellhound.js — W5 Shadow Realm · Hellhound.
//
// PILOT ASSET (redesign/REVIEW.md §8). Hand-authored, bespoke, 32×32 @ 1× density.
//
// This unit exists in the pilot to prove the point of D-28: it is a QUADRUPED. Not a humanoid
// with a dog's head, not the shared rig rescaled — a low, long, four-legged body with its own
// proportions, its own gait and its own centre of mass. In the old build the Hellhound was
// `buildBeast()`, a rig it shared with two other units. Here it shares nothing.
//
// READ: low-slung, front-heavy, head carried below the shoulder line like a hunting hound.
// Ember crest along the spine and a lit maw — the only light sources on a near-black body,
// which is also what keeps it visible on Shadow-Realm tiles (D-22d).

import { fromSpans, overlay, erase, clip } from '../lib/draw.js';
import { rimLight, contactShadow, ao } from '../lib/shade.js';
import { outline, innerLine } from '../lib/ink.js';

export const SPEC = {
  key: 'troop_hellhound',
  silhouette: 'long low quadruped, head below the shoulder, ember crest along the spine, whip tail',
  scale: 1.0,
  anatomy: 'canine',           // NOT humanoid — the whole reason this unit is in the pilot
  keyLight: 'NW',
  worldRamp: 'W5',
  canvas: [32, 32],
  ground: 28,
};

export const LEGEND = {
  '`': null,
  k: 'IK0', K: 'IK2',                                   // ink
  q: 'SH1', Q: 'SH2',                                   // contact shadow (alpha)
  h: 'DM0', H: 'DM1', g: 'DM2', G: 'DM3', y: 'DM4',     // demon hide — charcoal red
  e: 'EM2', E: 'EM3', f: 'EM4', F: 'EM5', x: 'EM6',     // ember — crest, eye, maw
  c: 'CR2', C: 'CR4',                                   // curse violet — tail wisp, W5 signature
  b: 'BN4', B: 'BN6',                                   // bone — teeth, claws
};

// ── base pose, hand-placed. Facing east, like every unit in the game. ─────────
const BASE = [
  // tail — curls up and back, thick at the root, thinning to a curse-violet wisp
  [ 9,  0, 'c'],
  [10,  0, 'Cc'],
  [11,  1, 'CH'],
  [12,  1, 'Hg'],
  [13,  2, 'Hgg'],
  [14,  3, 'Hgg'],
  [15,  4, 'HgG'],
  [16,  5, 'gG'],

  // ember crest — three tapering flames standing off the spine. The only bright mass on the
  // unit, and the reason a near-black body stays legible on near-black Shadow-Realm ground.
  [ 9, 12, 'x'],
  [10, 11, 'Fx'],
  [11, 11, 'fF'],
  [12, 10, 'EfF'],
  [10, 16, 'x'],
  [11, 15, 'Fx'],
  [12, 15, 'fF'],
  [13, 14, 'EfF'],
  [11, 19, 'x'],
  [12, 18, 'Fx'],
  [13, 18, 'fF'],
  [14,  9, 'eEfeeEfeeEe'],          // flame roots bedded into the hide

  // body — long, low, deepest at the shoulder. Kept DARK: only the top-back rows carry the
  // light step, everything below the spine sits in the bottom half of the hide ramp.
  [15,  9, 'GGyyGGyGGGGG'],
  [16,  7, 'HGGGyyGGGGGGgg'],
  [17,  6, 'ggGGGGGGGGGgggh'],
  [18,  5, 'hggGGGGGGGgggghh'],
  [19,  5, 'HhggggggggggghH'],
  [20,  6, 'HHhgggggggghhh'],
  [21,  7, 'HHHhhhhhhhhhh'],

  // head — carried low and forward; the eye and maw are the only warm pixels on it
  [14, 22, 'h``H'],                     // ears
  [15, 21, 'HGyyyGh'],
  [16, 21, 'GyyxyGgghh'],               // x = ember eye
  [17, 21, 'gGyyyGgghh'],
  [18, 22, 'ggGgggEfE'],                // maw, lit from inside
  [19, 23, 'HggghBb'],                  // lower jaw + a tooth
  [20, 22, 'HHhh'],

  // near legs (right side of the body, toward the viewer)
  [22, 20, 'Ggg'],  [23, 20, 'Ggh'],  [24, 20, 'gh'],  [25, 20, 'gh'],
  [26, 20, 'gh'],   [27, 20, 'gh'],   [28, 19, 'BhhB'],
  [22,  6, 'GggGg'], [23, 7, 'Ggh'], [24, 7, 'gh'], [25, 7, 'gh'],
  [26,  7, 'gh'],   [27, 7, 'gh'],   [28, 6, 'BhhB'],

  // far legs — one value darker so they sit behind
  [23, 17, 'Hh'], [24, 17, 'Hh'], [25, 17, 'Hh'], [26, 17, 'Hh'], [27, 17, 'Hh'], [28, 17, 'hh'],
  [23, 10, 'Hh'], [24, 10, 'Hh'], [25, 10, 'Hh'], [26, 10, 'Hh'], [27, 10, 'Hh'], [28, 10, 'hh'],
];

// ── gait: a bounding quadruped, not a walk. Diagonal pairs, big vertical travel. ──
const GAIT = [
  // 0 — gather: all four under the body
  [[22, 20, 'Ggg'], [23, 20, 'Ggh'], [24, 20, 'gh'], [25, 20, 'gh'], [26, 20, 'gh'], [27, 20, 'gh'], [28, 19, 'BhhB'],
   [22,  7, 'GggG'], [23, 8, 'Ggh'], [24, 8, 'gh'], [25, 8, 'gh'], [26, 8, 'gh'], [27, 8, 'gh'], [28, 7, 'BhhB'],
   [23, 17, 'Hh'], [24, 17, 'Hh'], [25, 17, 'Hh'], [26, 17, 'Hh'], [27, 17, 'Hh'], [28, 17, 'hh'],
   [23, 11, 'Hh'], [24, 11, 'Hh'], [25, 11, 'Hh'], [26, 11, 'Hh'], [27, 11, 'Hh'], [28, 11, 'hh']],
  // 1 — extend: front reaching, rear driving
  [[22, 21, 'Ggg'], [23, 22, 'Ggh'], [24, 23, 'gh'], [25, 23, 'gh'], [26, 24, 'gh'], [27, 24, 'gh'], [28, 23, 'BhhB'],
   [22,  5, 'GggG'], [23, 5, 'Ggh'], [24, 4, 'gh'], [25, 4, 'gh'], [26, 3, 'gh'], [27, 3, 'gh'], [28, 2, 'BhhB'],
   [23, 18, 'Hh'], [24, 19, 'Hh'], [25, 19, 'Hh'], [26, 20, 'Hh'], [27, 20, 'Hh'], [28, 20, 'hh'],
   [23,  9, 'Hh'], [24, 8, 'Hh'], [25, 8, 'Hh'], [26, 7, 'Hh'], [27, 7, 'Hh'], [28, 7, 'hh']],
  // 2 — suspension: legs tucked, body at its highest (the bound's airborne beat)
  [[22, 20, 'Ggg'], [23, 21, 'Ggh'], [24, 22, 'gh'], [25, 22, 'gh'], [26, 22, 'gh'], [27, 21, 'BhhB'],
   [22,  7, 'GggG'], [23, 7, 'Ggh'], [24, 6, 'gh'], [25, 6, 'gh'], [26, 6, 'gh'], [27, 5, 'BhhB'],
   [23, 18, 'Hh'], [24, 18, 'Hh'], [25, 19, 'Hh'], [26, 19, 'hh'],
   [23, 10, 'Hh'], [24, 10, 'Hh'], [25,  9, 'Hh'], [26,  9, 'hh']],
  // 3 — landing: front planted, rear still trailing
  [[22, 21, 'Ggg'], [23, 21, 'Ggh'], [24, 21, 'gh'], [25, 21, 'gh'], [26, 21, 'gh'], [27, 21, 'gh'], [28, 20, 'BhhB'],
   [22,  6, 'GggG'], [23, 6, 'Ggh'], [24, 5, 'gh'], [25, 5, 'gh'], [26, 5, 'gh'], [27, 5, 'gh'], [28, 4, 'BhhB'],
   [23, 18, 'Hh'], [24, 18, 'Hh'], [25, 18, 'Hh'], [26, 18, 'Hh'], [27, 18, 'Hh'], [28, 18, 'hh'],
   [23, 10, 'Hh'], [24, 10, 'Hh'], [25, 10, 'Hh'], [26, 10, 'Hh'], [27, 10, 'Hh'], [28, 10, 'hh']],
];

// crest flicker — the flames are alive even when the body is not. Each entry is a full
// three-flame set so the licks lean and change height rather than just blinking.
const CREST = [
  [[ 9, 12, 'x'], [10, 11, 'Fx'], [11, 11, 'fF'], [12, 10, 'EfF'],
   [10, 16, 'x'], [11, 15, 'Fx'], [12, 15, 'fF'], [13, 14, 'EfF'],
   [11, 19, 'x'], [12, 18, 'Fx'], [13, 18, 'fF']],
  [[10, 11, 'x'], [11, 11, 'Fx'], [12, 10, 'fFf'],
   [ 9, 16, 'x'], [10, 16, 'F'], [11, 15, 'fFx'], [12, 15, 'Ef'], [13, 14, 'EfF'],
   [10, 19, 'x'], [11, 19, 'F'], [12, 18, 'fx'], [13, 18, 'fF']],
  [[ 8, 12, 'x'], [ 9, 12, 'F'], [10, 11, 'ff'], [11, 11, 'Ef'], [12, 10, 'EfF'],
   [11, 16, 'x'], [12, 15, 'Ff'], [13, 14, 'EfF'],
   [11, 18, 'x'], [12, 18, 'Fx'], [13, 18, 'ff']],
  [[10, 12, 'x'], [11, 11, 'fF'], [12, 10, 'EfF'],
   [ 9, 15, 'x'], [10, 15, 'F'], [11, 15, 'fx'], [12, 15, 'ff'], [13, 14, 'EfF'],
   [12, 19, 'x'], [13, 18, 'fF']],
];

function finish(g, shadowCx = 14, shadowRx = 11) {
  ao(g, 'h', { from: 'gG', radius: 1 });
  innerLine(g, 20, 16, 20, 21, 'K');                    // shoulder seam — head reads as a separate mass
  innerLine(g,  8, 20, 12, 20, 'K');                    // haunch seam
  // Rim in HIDE, not ember — a whole-body ember rim reads as an orange outline and turns the
  // beast into terracotta. The crest is the only thing allowed to be bright (D-22c).
  rimLight(g, 'y', { dir: { x: 1, y: 1 }, skip: 'kKqQeEfFxcCbB', density: 0.22 });
  // a few deliberate ember licks where the crest actually spills onto the back
  overlay(g, [[15, 11, 'e'], [15, 16, 'e'], [16, 19, 'e']]);
  outline(g, 'k', { soft: 'qQxF' });
  contactShadow(g, shadowCx, 30, shadowRx, 1.8, 'q');
  contactShadow(g, shadowCx, 30, shadowRx - 4, 1.1, 'Q');
  return g;
}

function frame(gaitIdx, crestIdx, lift) {
  const g = fromSpans(32, 32, BASE);
  erase(g, 0, 22, 32, 7);                                // clear authored legs
  erase(g, 8, 10, 14, 4);                                // clear authored crest
  overlay(g, CREST[crestIdx]);
  overlay(g, GAIT[gaitIdx]);
  if (lift) {                                            // raise the body mass, leave the paws
    const src = g.px.map(r => r.slice());
    for (let y = 10; y <= 21; y++) for (let x = 0; x < 32; x++) g.px[y][x] = '`';
    for (let y = 10; y <= 21; y++) for (let x = 0; x < 32; x++) {
      if (src[y][x] !== '`') g.px[Math.max(0, y + lift)][x] = src[y][x];
    }
  }
  return finish(g);
}

// death — the fire goes out first, then the legs. The corpse keeps the long low outline.
function death(step) {
  if (step === 0) {
    const g = fromSpans(32, 32, BASE);
    erase(g, 8, 10, 14, 4);
    overlay(g, [[12, 11, 'F'], [12, 15, 'F'], [13, 10, 'ef'], [13, 14, 'ef'], [13, 17, 'e']]);
    return finish(g);
  }
  if (step === 1) {
    const g = fromSpans(32, 32, [
      [13, 2, 'cC'], [14, 3, 'Hg'], [15, 4, 'gG'],
      [17, 9, 'GGGGGyyGGGG'],
      [18, 7, 'HGyyyyyyyGGgg'],
      [19, 6, 'ggGGyyyyyGGggh'],
      [20, 5, 'hggGGGGGGGggghh'],
      [21, 5, 'HhgggggggggghH'],
      [22, 6, 'HHgggggggghhh'],
      [18, 22, 'h``H'], [19, 21, 'HGyyyGh'], [20, 21, 'GyyeyGgghh'],
      [21, 21, 'gGyyyGgghh'], [22, 22, 'ggGgggeee'], [23, 23, 'HggghBb'],
      [24, 20, 'gh'], [25, 20, 'gh'], [26, 19, 'BhhB'],
      [24,  7, 'gh'], [25,  7, 'gh'], [26,  6, 'BhhB'],
    ]);
    return finish(g, 14, 11);
  }
  const g = fromSpans(32, 32, [
    [22,  2, 'cCHg'],
    [23,  6, 'gGGGGyyGGGGGgg'],
    [24,  5, 'hggGGGGGGGGgggghh'],
    [25,  5, 'HhggggggggggggghH'],
    [26,  6, 'HHhhhhhhhhhhhhh'],
    [24, 22, 'HGyyGh'], [25, 22, 'GyyGgh'], [26, 22, 'gGGgghh'],
    [27,  8, 'BhhB'], [27, 19, 'BhhB'],
  ]);
  ao(g, 'h', { from: 'gG', radius: 1 });
  outline(g, 'k', { soft: 'qQ' });
  contactShadow(g, 15, 29, 13, 1.5, 'q');
  return g;
}

export const SPRITES = {
  troop_hellhound_idle: clip([frame(0, 0, 0), frame(0, 1, 0), frame(0, 2, 0), frame(0, 3, 0)], 5),
  troop_hellhound_walk: clip([frame(0, 0, 0), frame(1, 1, -1), frame(2, 2, -2), frame(3, 3, -1)], 9),
  troop_hellhound_death: clip([death(0), death(1), death(2)], 6, false),
};
