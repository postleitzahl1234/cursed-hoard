// tiles/_biome.js — assembly only.
//
// Same contract as troops/_worlds.js and the tower faction vocabularies: **this file holds no
// biome.** It knows how to bolt a bed, a set of variants and two edge kits together into a
// SPRITES map. It does not know what grass looks like. Every visual decision — the ramp, the
// motifs, how ragged a bank is, whether a lawn is noise or ruled stripes — lives in the world
// module that calls this.
//
// That is deliberate and it is the lesson from the tower work: when shared code encodes a body
// plan, everything downstream inherits the same face, and the distinctness you were paying for
// evaporates. Five biomes that are one bed with five palettes would be exactly that failure.

import { bed, edgeKit, kitSprites, still, SHADOW_LEGEND } from '../lib/tileset.js';

/**
 * @param spec.legend    char → palette code (SHADOW_LEGEND is merged in for you)
 * @param spec.base      { key, ramp, opts } the world's ground bed
 * @param spec.variants  { key: paint(g) } — each gets a fresh bed, then its own motif
 * @param spec.beds      optional { key: () => grid } for variants that are not a bed at all
 *                       (the Royal Gardens lawn is ruled stripes, not noise)
 * @param spec.layers    [{ key, ramp, fill, ...edgeKitSpec }] the materials that stack on top
 *                       and therefore need a 12-piece auto-edge kit: the path and the water.
 */
export function biome(spec) {
  const LEGEND = { '`': null, ...SHADOW_LEGEND, ...spec.legend };
  const SPRITES = {};

  const mkBed = () => bed(spec.base.ramp, spec.base.opts);
  SPRITES[spec.base.key] = still(spec.base.paint ? spec.base.paint(mkBed()) : mkBed());

  for (const [key, paint] of Object.entries(spec.variants || {})) {
    SPRITES[key] = still(paint(mkBed()));
  }
  for (const [key, make] of Object.entries(spec.beds || {})) {
    SPRITES[key] = still(make());
  }
  for (const layer of spec.layers || []) {
    // the layer's own full tile (what a cell entirely of this material looks like)
    SPRITES[layer.key] = still(layer.fill());
    // and the 12 overlays that let it bleed into whatever it borders
    Object.assign(SPRITES, kitSprites(layer.key, edgeKit(layer)));
  }
  return { LEGEND, SPRITES };
}
