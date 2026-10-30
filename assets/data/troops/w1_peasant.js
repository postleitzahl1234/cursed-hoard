// troops/w1_peasant.js — SUPERSEDED. Kept only so no build script breaks on a missing path.
//
// The Peasant was the pilot asset that proved the bespoke-per-unit approach. Now that the whole
// of W1 is authored, he lives with the rest of his army in `w1_grasslands.js` — one file per
// world, which is the layout that makes the D-28 distinctness check possible while authoring
// (ten bodies visible in one buffer). His art moved unchanged; only the file did.
//
// This file intentionally exports an empty SPRITES set so it contributes nothing to the atlas.

export const LEGEND = { '`': null };
export const SPRITES = {};
export const SUPERSEDED_BY = 'troops/w1_grasslands.js';
