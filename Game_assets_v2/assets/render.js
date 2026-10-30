// assets/render.js — faithful renderer for the authoring contract.
// Consumes indexed ASCII grids + a legend (char -> palette CODE) + the master
// palette (CODE -> hex) and paints animated, nearest-neighbour pixel sprites.
import { PALETTE } from './data/palette.js';

// ---- shared animation clock (one rAF for the whole page) ----
// Only on-screen canvases tick: with hundreds of sprites, animating every
// canvas each frame is the dominant cost. An IntersectionObserver flips a
// `visible` flag per client so the loop touches just what the user can see.
const clients = [];
let started = false;
function tick(now) {
  for (const c of clients) if (c.visible) c.update(now);
  requestAnimationFrame(tick);
}
function ensureClock() { if (!started) { started = true; requestAnimationFrame(tick); } }

const io = (typeof IntersectionObserver !== 'undefined')
  ? new IntersectionObserver((entries) => {
      for (const e of entries) {
        const c = e.target.__client;
        if (c) c.visible = e.isIntersecting;
      }
    }, { rootMargin: '120px' })
  : null;

// Resolve a legend char on a frame to a hex (or null for transparent).
function hexFor(ch, legend) {
  const code = legend[ch];
  if (code == null) return null;            // transparent
  const hex = PALETTE[code];
  if (!hex) { console.warn('Unknown palette code', code, 'for char', JSON.stringify(ch)); return '#ff00ff'; }
  return hex;
}

function frameDims(frame) {
  return { rows: frame.length, cols: frame[0].length };
}

// Paint one frame onto a context at integer scale.
function paintFrame(ctx, frame, legend, scale) {
  for (let y = 0; y < frame.length; y++) {
    const row = frame[y];
    for (let x = 0; x < row.length; x++) {
      const hex = hexFor(row[x], legend);
      if (hex == null) continue;
      ctx.fillStyle = hex;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
}

// Build an animated <canvas> for a sprite entry.
// sprite = { anchor, fps, loop, frames:[grid,...] }
export function spriteCanvas(sprite, legend, { scale = 6 } = {}) {
  const frames = sprite.frames;
  // Size to the max extent across ALL frames so ragged rows never clip —
  // short rows simply leave transparent space on the right.
  let rows = 0, cols = 0;
  for (const f of frames) {
    rows = Math.max(rows, f.length);
    for (const r of f) cols = Math.max(cols, r.length);
  }
  const cv = document.createElement('canvas');
  cv.width = cols * scale;
  cv.height = rows * scale;
  cv.style.imageRendering = 'pixelated';
  cv.style.width = cols * scale + 'px';
  cv.style.height = rows * scale + 'px';
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const fps = sprite.fps || 6;
  const frameMs = 1000 / fps;
  const holdMs = sprite.loop === false ? 360 : 0; // brief hold before a one-shot restarts
  let idx = -1, base = 0;

  function draw(f) {
    idx = f;
    ctx.clearRect(0, 0, cv.width, cv.height);
    paintFrame(ctx, frames[f], legend, scale);
  }
  // Paint frame 0 immediately so a static first frame always shows,
  // even before rAF fires (or while the tab is backgrounded / throttled).
  draw(0);

  const client = {
    visible: io ? false : true,   // no observer → animate always
    update(now) {
      if (!base) base = now;
      const cycle = frames.length * frameMs + holdMs;
      const t = (now - base) % cycle;
      const f = Math.min(frames.length - 1, Math.floor(t / frameMs));
      if (f === idx) return;
      draw(f);
    }
  };
  clients.push(client);
  if (io) { cv.__client = client; io.observe(cv); }
  ensureClock();
  return cv;
}

// Convenience: pick a scale so a sprite lands near a target on-screen size.
export function fitScale(frame, target = 132) {
  const { rows, cols } = frameDims(frame);
  const big = Math.max(rows, cols);
  return Math.max(2, Math.round(target / big));
}
