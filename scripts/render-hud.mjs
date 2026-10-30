#!/usr/bin/env node
/**
 * Renders the HUD art at the sizes the HUD actually uses — icons at 24, and every chrome frame
 * NINE-SLICED to a real panel rect. A contact sheet of 24x24 squares proves nothing about a
 * 580x64 tower panel; this does, because it runs the same slicing the engine runs.
 */
import fs from 'node:fs'; import zlib from 'node:zlib'; import path from 'node:path';
import { pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(decodeURIComponent(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/,'$1'))), '..');
const DATA = path.join(ROOT, 'Game_assets_v2/assets/data');
const { PALETTE } = await import(pathToFileURL(path.join(DATA, 'palette.js')));
const SP={}, LG={};
for (const m of ['icons','ui_chrome']) { const mod = await import(pathToFileURL(path.join(DATA, m+'.js')));
  for (const [k,s] of Object.entries(mod.SPRITES)) { SP[k]=s; LG[k]=mod.LEGEND; } }
const rgba=h=>{h=h.replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),h.length>=8?parseInt(h.slice(6,8),16):255];};
const crcT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
const crc=b=>{let c=0xffffffff;for(const x of b)c=crcT[(c^x)&255]^(c>>>8);return (c^0xffffffff)>>>0;};
function png(w,h,buf){const raw=Buffer.alloc((w*4+1)*h);
 for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;buf.copy(raw,y*(w*4+1)+1,y*w*4,(y+1)*w*4);}
 const ch=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=6;
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ihdr),ch('IDAT',zlib.deflateSync(raw)),ch('IEND',Buffer.alloc(0))]);}
const W=980,H=620,buf=Buffer.alloc(W*H*4);
for(let i=0;i<W*H;i++){buf[i*4]=26;buf[i*4+1]=20;buf[i*4+2]=34;buf[i*4+3]=255;}
const px=(x,y,[r,g,b,a])=>{if(x<0||y<0||x>=W||y>=H||!a)return;const o=(y*W+x)*4,f=a/255;
 buf[o]=Math.round(buf[o]*(1-f)+r*f);buf[o+1]=Math.round(buf[o+1]*(1-f)+g*f);buf[o+2]=Math.round(buf[o+2]*(1-f)+b*f);};
const cell=(k,sx,sy)=>{const s=SP[k],L=LG[k];if(!s)return;const f=s.frames[0];
 for(let y=0;y<f.length;y++)for(let x=0;x<f[0].length;x++){const c=L[f[y][x]];if(c)px(sx+x,sy+y,rgba(PALETTE[c]));}};
/** the same 9-slice rule as PixelArtAtlas.drawNine: border = min(min(w,h)/3, 12) */
const nine=(k,dx,dy,dw,dh)=>{const s=SP[k],L=LG[k];if(!s)return;const f=s.frames[0];
 const rw=f[0].length,rh=f.length,bs=Math.max(1,Math.min(Math.min(rw,rh)/3|0,12));
 for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){
   let sxp = x<bs?x : x>=dw-bs? rw-(dw-x) : bs+((x-bs)%(rw-2*bs));
   let syp = y<bs?y : y>=dh-bs? rh-(dh-y) : bs+((y-bs)%(rh-2*bs));
   const c=L[f[syp][sxp]]; if(c) px(dx+x,dy+y,rgba(PALETTE[c]));}};
// icons, at their true 24 px
const icons=Object.keys(SP).filter(k=>k.startsWith('icon_'));
icons.forEach((k,i)=>cell(k, 24+(i%11)*38, 24+Math.floor(i/11)*38));
// chrome, nine-sliced to real HUD rectangles
const rects=[['ui_panel',24,160,580,64],['ui_panel_gold',624,160,150,38],['ui_resource_capsule',790,160,170,38],
 ['ui_button_idle',24,244,110,48],['ui_button_hover',150,244,110,48],['ui_button_press',276,244,110,48],
 ['ui_tooltip',406,244,240,72],['ui_banner_plate',24,336,620,58],['ui_panel',676,244,40,44],['ui_panel_gold',728,244,40,44]];
for(const [k,x,y,w,h] of rects) nine(k,x,y,w,h);
// bars stretched, wave tracks, nodes and chips
const bars=['ui_bar_health','ui_bar_health_drain','ui_bar_health_empty','ui_bar_mana','ui_bar_mana_drain','ui_bar_mana_empty'];
// A bar TILES horizontally (it is uniform), it does not squash. The first version mapped x
// across 0..220 into the 8px source, so 212 of 220 columns sampled column 0 and the sheet showed
// a flat line — the art was fine and the evidence was wrong. Again.
bars.forEach((k,i)=>{const s=SP[k],L=LG[k],f=s.frames[0];
 for(let y=0;y<10;y++)for(let x=0;x<220;x++){const c=L[f[Math.min(7,Math.floor(y*8/10))][x%8]];
  if(c)px(24+(i%2)*250+x,412+Math.floor(i/2)*16,rgba(PALETTE[c]));}});
[7,11,15].forEach((n,i)=>cell('ui_wave_track_'+n, 540, 408+i*22));
['locked','available','mastered'].forEach((n,i)=>cell('ui_node_'+n, 24+i*34, 476));
['close','confirm'].forEach((n,i)=>cell('ui_chip_'+n, 140+i*34, 476));
fs.mkdirSync(path.join(ROOT,'redesign','pilot-evidence'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'redesign','pilot-evidence','hud_set.png'), png(W,H,buf));
console.log(`hud_set.png — ${icons.length} icons at 24px, ${rects.length} nine-sliced frames at real HUD rects`);
