// assets/data/palette.js — Cursed Hoard master palette (~163 indexed colours)
// STYLEGUIDE §1. Author by CODE, never hex — this map is the single resolver, so a
// mood re-tune (like this darken pass) never invalidates a sprite.
// Ramps run dark -> light (0 = darkest). Tuned DARKER + more grounded: deep saturated
// shadows, muted lights (no chalky near-whites), so sprites read as gothic TD, not toys.

export const PALETTE = {
  // — Ink / void (UI base, outlines, deepest shadow) —
  IK0:'#050309', IK1:'#08040e', IK2:'#0f0a18', IK3:'#15101f', IK4:'#221934', IK5:'#3a2e4c', IK6:'#574a6b',
  // — Bone / parchment / snow (muted, no white) —
  BN0:'#322c22', BN1:'#4c4233', BN2:'#675945', BN3:'#88775a', BN4:'#a89571', BN5:'#c4b48e', BN6:'#dccdaa',
  // — Grey rock / stone —
  RK0:'#1a181e', RK1:'#302d28', RK2:'#44403a', RK3:'#5c574e', RK4:'#746e62', RK5:'#8e887a', RK6:'#a8a194',
  // — Holy stone (warm cream rock, W2) —
  HS0:'#4a4034', HS1:'#685a48', HS2:'#8e7e62', HS3:'#b0a07e', HS4:'#cebf9a',
  // — Human skin (ruddier, less peach) —
  SK0:'#3e2418', SK1:'#5e3e2a', SK2:'#7e5238', SK3:'#9e6c48', SK4:'#bc8a60', SK5:'#d6aa80',
  // — Goblin green skin —
  GB0:'#1e2c14', GB1:'#2f441f', GB2:'#445e2a', GB3:'#5c8038', GB4:'#78a44c', GB5:'#96c468',
  // — Undead flesh (sickly grey-purple) —
  UD0:'#201a30', UD1:'#34244a', UD2:'#482e62', UD3:'#5e4282', UD4:'#7656a2', UD5:'#9678ba',
  // — Demon hide (charcoal-red) —
  DM0:'#1c0a10', DM1:'#36141a', DM2:'#521e22', DM3:'#762a28', DM4:'#9e4030', DM5:'#c06044',
  // — Wood (orc lumber, structures) —
  WD0:'#1a0e08', WD1:'#352010', WD2:'#4e3019', WD3:'#684322', WD4:'#86562c', WD5:'#a4703a', WD6:'#c08e52',
  // — Sand / dune (grounded, no near-white) —
  SD0:'#3e2a12', SD1:'#5c401e', SD2:'#7c582c', SD3:'#9c763e', SD4:'#b89458', SD5:'#cead76', SD6:'#dec694',
  // — Iron / steel (cool metal, muted top) —
  IR0:'#13151c', IR1:'#2a2a36', IR2:'#40404b', IR3:'#585862', IR4:'#7c7c86', IR5:'#a2a0a4', IR6:'#c2c0bc',
  // — Brass / copper (goblin machinery) —
  BR0:'#2a1608', BR1:'#442a10', BR2:'#66441a', BR3:'#8c6226', BR4:'#b08636', BR5:'#cea854',
  // — Gold (royal / treasure, deepened) —
  GD0:'#4e3208', GD1:'#7c5614', GD2:'#a07824', GD3:'#c49a38', GD4:'#dcba54', GD5:'#eed284',
  // — Ember -> lava (fire, BURN — vivid but no white top) —
  EM0:'#440a0a', EM1:'#741410', EM2:'#ac2018', EM3:'#e23820', EM4:'#f46c2e', EM5:'#f89832', EM6:'#f4be38', EM7:'#fae07a',
  // — Blood / crimson (gore, banners) —
  BL0:'#28060e', BL1:'#500a18', BL2:'#7c1624', BL3:'#962030', BL4:'#b83c48',
  // — Ice / frost (Crypt, SLOW — muted, no white) —
  IC0:'#1c4258', IC1:'#306084', IC2:'#5088ac', IC3:'#7cbae0', IC4:'#a4d4f0', IC5:'#c2e4f6',
  // — Water (deep -> shallow; flight lanes) —
  AQ0:'#081c32', AQ1:'#12365c', AQ2:'#24507e', AQ3:'#3a74b0', AQ4:'#5892c8', AQ5:'#80b4dc', AQ6:'#a6d0ea',
  // — Volt / lightning (Crypt terminal) —
  VL0:'#382a80', VL1:'#486edc', VL2:'#78bce8', VL3:'#e8e284', VL4:'#ecf2c2',
  // — Moss / grass (Grasslands, Goblin — deepened) —
  MS0:'#162610', MS1:'#263c18', MS2:'#385422', MS3:'#4c702e', MS4:'#688c3e', MS5:'#88bc58', MS6:'#a6d27c',
  // — Garden green (manicured lawn — cooler than wild moss) —
  GN0:'#1a3216', GN1:'#2c4c26', GN2:'#406836', GN3:'#568446', GN4:'#78a65e',
  // — Pine / dark foliage (hedge, topiary, evergreen) —
  PN0:'#0e1c0a', PN1:'#1a3214', PN2:'#28481e', PN3:'#385e2a', PN4:'#4c783a',
  // — Toxin / poison teal (goblin ooze, swamp) —
  TX0:'#082824', TX1:'#10483e', TX2:'#187260', TX3:'#2aa480', TX4:'#58ca9a',
  // — Hex / arcane magic (bright orchid — MAGIC type, deepened) —
  HX0:'#2c0e54', HX1:'#441880', HX2:'#582496', HX3:'#8240ae', HX4:'#ae6ece', HX5:'#d09ae6',
  // — Curse / void purple (dark indigo — CURSE type, Shadow Realm) —
  CR0:'#0c081e', CR1:'#1a1036', CR2:'#2a1a56', CR3:'#3c2a76', CR4:'#544096', CR5:'#7266ba',
  // — Gems (jewel tones × 3 sparkle steps — deep, lifelike cut-stone, dark cores) —
  GR0:'#3e0414', GR1:'#8e1230', GR2:'#d2425e',   // ruby
  GS0:'#08183e', GS1:'#1a3a86', GS2:'#4e84d6',   // sapphire
  GE0:'#022414', GE1:'#0a6034', GE2:'#3aae72',   // emerald
  GA0:'#240642', GA1:'#5e1c92', GA2:'#a258d2',   // amethyst
  GT0:'#4e2c02', GT1:'#a66e0c', GT2:'#e0aa3a',   // topaz
  // — Contact shadow (ALPHA — the only codes in the palette that are not fully opaque) —
  // Every troop/tower/building drops one of these so it sits ON the map instead of floating
  // in front of it. 8-digit hex: Color.valueOf() and CSS both read #rrggbbaa.
  SH0:'#05030940', SH1:'#05030970', SH2:'#050309a0',
};

// Family metadata for the palette board in the gallery.
export const FAMILIES = [
  ['IK','Ink / void'],['BN','Bone / snow'],['RK','Grey rock'],['HS','Holy stone'],
  ['SK','Human skin'],['GB','Goblin skin'],['UD','Undead flesh'],['DM','Demon hide'],
  ['WD','Wood'],['SD','Sand / dune'],['IR','Iron / steel'],['BR','Brass / copper'],['GD','Gold'],
  ['EM','Ember / lava'],['BL','Blood'],['IC','Ice / frost'],['AQ','Water'],['VL','Volt'],
  ['MS','Moss / grass'],['GN','Garden green'],['PN','Pine'],['TX','Toxin teal'],
  ['HX','Hex magic'],['CR','Curse / void'],
  ['GR','Ruby'],['GS','Sapphire'],['GE','Emerald'],['GA','Amethyst'],['GT','Topaz'],
];

export const COUNT = Object.keys(PALETTE).filter(k => /^[A-Z]{2}\d$/.test(k)).length;
