#!/usr/bin/env node
// scripts/gen_dashboard.mjs — scannt den Projektordner und generiert redesign/dashboard.html
// Aufruf:  node scripts/gen_dashboard.mjs        (keine Dependencies, Node >= 16)
// Optional: redesign/dashboard_digest.md — wird, falls vorhanden, als Digest-Text eingebettet.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'redesign', 'dashboard.html');
const read = (p) => existsSync(p) ? readFileSync(p, 'utf8') : '';
const lines = (s) => s ? (s.match(/\n/g) || []).length + (s.endsWith('\n') ? 0 : 1) : 0;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- 1. Doku-Status (redesign/*.md) ----------
const ROLES = {
  'CHANGES.md': 'Changelog', 'DECISIONS.md': 'Gelockte Decisions', 'QUESTIONS.md': 'Offene Design-Fragen',
  'IMPLEMENTATION.md': 'Implementierungsplan', 'INVENTORY.md': 'Asset-Inventar', 'MAPS.md': 'Level-Briefs',
  'README.md': 'Pipeline-Überblick', 'SETUP.md': 'Projekt-Setup', 'STRUCTURE.md': 'Screen-/App-Struktur',
  'STYLEGUIDE.md': 'Artstyle', 'SYSTEMS.md': 'Gameplay-Systeme', 'TOWERS.md': 'Turm-Spezifikation',
  'TROOPS.md': 'Truppen-Spezifikation', 'concept.md': 'Ursprüngliches Konzept',
};
const redesignDir = join(ROOT, 'redesign');
const docs = existsSync(redesignDir) ? readdirSync(redesignDir)
  .filter(f => f.endsWith('.md'))
  .map(f => { const p = join(redesignDir, f); const st = statSync(p);
    return { name: f, mtime: st.mtime, lines: lines(read(p)), role: ROLES[f] || '—' }; })
  .sort((a, b) => b.mtime - a.mtime) : [];

// ---------- 2. Content-Inventar (assets/data) ----------
const data = (f) => read(join(ROOT, 'assets', 'data', f));

const towersSrc = data('towers_full.js');
const towerBlock = (name) => {
  const m = towersSrc.match(new RegExp(`^const ${name} = \\{([\\s\\S]*?)^\\};`, 'm'));
  return m ? (m[1].match(/^\s+[a-z_0-9']+\s*:/gm) || []).length : 0;
};
const towers = { orc: towerBlock('ORC'), goblin: towerBlock('GOBLIN'), goblinAir: towerBlock('GOBLIN_AIR'),
                 crypt: towerBlock('CRYPT'), demon: towerBlock('DEMON') };
towers.total = towers.orc + towers.goblin + towers.goblinAir + towers.crypt + towers.demon;

const troops = [1, 2, 3, 4, 5].map(w => (data(`troops_w${w}.js`).match(/^add\(/gm) || []).length);
const troopTotal = troops.reduce((a, b) => a + b, 0);
const maps = (data('maps.js').match(/^\s*map_w\d+_l\d+/gm) || []).length;
const gemsM = data('gems.js').match(/const TONES = \{([^}]*)\}/);
const gems = gemsM ? (gemsM[1].match(/[a-z_]+\s*:/g) || []).length : 0;
const enchants = new Set(data('enchants.js').match(/enchant_[a-z_]+(?=\s*:)/g) || []).size;

// ---------- 3. Code-Überblick (core/src) ----------
function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const javaFiles = walk(join(ROOT, 'core', 'src')).filter(f => f.endsWith('.java'));
const pkgOf = (f) => {
  const rel = f.split(sep).join('/');
  if (rel.includes('/test/')) return 'Tests';
  if (rel.includes('/behaviors/')) return 'game/behaviors';
  if (rel.includes('/game/')) return 'game';
  if (rel.includes('/assets/')) return 'assets';
  return 'Screens / Root';
};
const pkgs = {};
let loc = 0, testCount = 0;
for (const f of javaFiles) {
  const src = readFileSync(f, 'utf8');
  loc += lines(src);
  pkgs[pkgOf(f)] = (pkgs[pkgOf(f)] || 0) + 1;
  testCount += (src.match(/@Test\b/g) || []).length;
}
const behaviorsDir = join(ROOT, 'core/src/main/java/io/github/some_example_name/game/behaviors');
const behaviors = existsSync(behaviorsDir)
  ? readdirSync(behaviorsDir).filter(f => f.endsWith('.java')).map(f => f.replace('.java', '')) : [];

// ---------- 4. Decisions / Questions / Changelog ----------
const decisions = new Set(read(join(redesignDir, 'DECISIONS.md')).match(/\bD-\d+/g) || []).size;
const questions = new Set(read(join(redesignDir, 'QUESTIONS.md')).match(/\bQ-\d+/g) || []).size;
const changelog = (read(join(redesignDir, 'CHANGES.md')).match(/^## .+$/gm) || [])
  .slice(0, 6).map(h => h.replace(/^## /, ''));

// Optionaler, von Hand/KI gepflegter Digest-Text:
const digestMd = read(join(redesignDir, 'dashboard_digest.md')).trim();

// ---------- 5. HTML rendern ----------
const stamp = new Date().toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' });
const fmtD = (d) => d.toLocaleDateString('de-DE');
const ageDays = (d) => (Date.now() - d.getTime()) / 864e5;
const dotCls = (d) => ageDays(d) < 7 ? 'fresh' : ageDays(d) < 14 ? 'mid' : 'old';
const kLoc = (loc / 1000).toFixed(1).replace('.', ',') + 'k';

const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cursed Treasure v2 — Projekt-Dashboard</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.js"></script>
<style>
  :root { color-scheme: light;
    --ink:#2a2438; --muted:#6e6781; --bg:#faf8f5; --card:#ffffff;
    --line:#e6e1d8; --accent:#7c4dca; --accent2:#b8860b; --good:#2e7d32; --warn:#b26a00; }
  * { box-sizing:border-box; margin:0; }
  body { font-family:'Segoe UI',system-ui,sans-serif; background:var(--bg); color:var(--ink); padding:20px; font-size:14px; line-height:1.5; }
  h1 { font-size:20px; } h2 { font-size:14px; text-transform:uppercase; letter-spacing:1px; color:var(--accent); margin-bottom:10px; }
  .sub { color:var(--muted); font-size:12px; margin-top:2px; }
  header { display:flex; justify-content:space-between; align-items:baseline; flex-wrap:wrap; gap:6px; margin-bottom:16px; border-bottom:2px solid var(--line); padding-bottom:12px; }
  .stamp { font-size:12px; color:var(--muted); } .stamp b { color:var(--accent2); }
  section { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:16px; margin-bottom:14px; }
  .kpis { display:grid; grid-template-columns:repeat(auto-fit,minmax(110px,1fr)); gap:10px; }
  .kpi { background:var(--bg); border:1px solid var(--line); border-radius:8px; padding:10px 12px; text-align:center; }
  .kpi .n { font-size:22px; font-weight:700; color:var(--accent); }
  .kpi .l { font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.5px; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media (max-width:700px){ .grid2 { grid-template-columns:1fr; } }
  .chartbox { position:relative; height:220px; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; color:var(--muted); font-weight:600; font-size:11px; text-transform:uppercase; letter-spacing:.5px; border-bottom:1px solid var(--line); padding:6px 8px; }
  td { padding:6px 8px; border-bottom:1px solid var(--line); } tr:last-child td { border-bottom:none; }
  .dot { display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:6px; }
  .fresh { background:var(--good); } .mid { background:var(--warn); } .old { background:#9e9e9e; }
  .chips { display:flex; flex-wrap:wrap; gap:5px; margin-top:8px; }
  .chip { background:var(--bg); border:1px solid var(--line); border-radius:20px; padding:2px 9px; font-size:11px; }
  .mono { font-family:Consolas,monospace; font-size:12px; }
  .note { font-size:11.5px; color:var(--muted); margin-top:10px; font-style:italic; }
  ul.tight { padding-left:18px; } ul.tight li { margin-bottom:4px; }
  .digestbox { border-left:3px solid var(--accent); padding:6px 10px; background:#f5f1fb; border-radius:0 6px 6px 0; margin-bottom:10px; white-space:pre-wrap; }
</style>
</head>
<body>
<header>
  <div>
    <h1>🏰 Cursed Treasure v2 — Projekt-Dashboard</h1>
    <div class="sub">libGDX Tower-Defense · generiert von <span class="mono">scripts/gen_dashboard.mjs</span></div>
  </div>
  <div class="stamp">Generiert: <b>${stamp}</b></div>
</header>

<section>
  <h2>Kennzahlen</h2>
  <div class="kpis">
    <div class="kpi"><div class="n">${towers.total}</div><div class="l">Türme</div></div>
    <div class="kpi"><div class="n">${troopTotal}</div><div class="l">Truppen</div></div>
    <div class="kpi"><div class="n">${maps}</div><div class="l">Maps</div></div>
    <div class="kpi"><div class="n">${gems}</div><div class="l">Gems</div></div>
    <div class="kpi"><div class="n">${enchants}</div><div class="l">Enchants</div></div>
    <div class="kpi"><div class="n">${decisions}</div><div class="l">Decisions</div></div>
    <div class="kpi"><div class="n">${testCount}</div><div class="l">@Test</div></div>
    <div class="kpi"><div class="n">${kLoc}</div><div class="l">Java-LOC</div></div>
  </div>
</section>

<section>
  <h2>Projekt-Digest</h2>
  ${digestMd ? `<div class="digestbox">${esc(digestMd)}</div>` : ''}
  <p><b>Letzte Changelog-Einträge</b> (aus <span class="mono">redesign/CHANGES.md</span>, ${questions} Design-Fragen dokumentiert):</p>
  <ul class="tight">${changelog.map(h => `<li>${esc(h)}</li>`).join('\n')}</ul>
</section>

<div class="grid2">
  <section>
    <h2>Truppen pro Welt</h2>
    <div class="chartbox"><canvas id="troopChart"></canvas></div>
  </section>
  <section>
    <h2>Türme pro Fraktion</h2>
    <div class="chartbox"><canvas id="towerChart"></canvas></div>
    <div class="note">Orc ${towers.orc} · Goblin ${towers.goblin}+${towers.goblinAir} Air · Crypt ${towers.crypt} · Demon ${towers.demon}</div>
  </section>
</div>

<section>
  <h2>Code-Überblick</h2>
  <table>
    <tr><th>Bereich</th><th>Dateien</th></tr>
    ${Object.entries(pkgs).sort((a, b) => b[1] - a[1]).map(([k, v]) =>
      `<tr><td class="mono">${k}</td><td>${v}</td></tr>`).join('\n    ')}
  </table>
  <div class="chips">${behaviors.map(b => `<span class="chip">${b}</span>`).join('')}</div>
</section>

<section>
  <h2>Doku-Status <span style="font-weight:400;color:var(--muted);font-size:11px">(redesign/)</span></h2>
  <table>
    <tr><th></th><th>Dokument</th><th>Zuletzt geändert</th><th>Zeilen</th><th>Rolle</th></tr>
    ${docs.map(d => `<tr><td><span class="dot ${dotCls(d.mtime)}"></span></td><td class="mono">${d.name}</td><td>${fmtD(d.mtime)}</td><td>${d.lines}</td><td>${d.role}</td></tr>`).join('\n    ')}
  </table>
  <div class="note"><span class="dot fresh"></span>&lt; 7 Tage &nbsp; <span class="dot mid"></span>7–14 Tage &nbsp; <span class="dot old"></span>älter</div>
</section>

<script>
if (typeof Chart !== 'undefined') {
  const ink = '#2a2438', grid = '#e6e1d8';
  new Chart(document.getElementById('troopChart'), {
    type: 'bar',
    data: { labels: ['W1', 'W2', 'W3', 'W4', 'W5'],
      datasets: [{ data: ${JSON.stringify(troops)},
        backgroundColor: ['#7c9c4d', '#5d8aa8', '#c9a227', '#a85d5d', '#7c4dca'], borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 2, color: ink }, grid: { color: grid } },
                x: { ticks: { color: ink }, grid: { display: false } } } }
  });
  new Chart(document.getElementById('towerChart'), {
    type: 'doughnut',
    data: { labels: ['Orc (${towers.orc})', 'Goblin (${towers.goblin}+${towers.goblinAir} Air)', 'Crypt (${towers.crypt})', 'Demon (${towers.demon})'],
      datasets: [{ data: [${towers.orc}, ${towers.goblin + towers.goblinAir}, ${towers.crypt}, ${towers.demon}],
        backgroundColor: ['#6b8e23', '#b8860b', '#5d8aa8', '#8b3a3a'], borderColor: '#fff', borderWidth: 2 }] },
    options: { responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: ink, boxWidth: 12, font: { size: 11 } } } } }
  });
} else {
  document.querySelectorAll('.chartbox').forEach(b => b.innerHTML = '<p style="color:#6e6781;font-size:12px">Chart.js (CDN) nicht erreichbar — Zahlen siehe Text.</p>');
}
</script>
</body>
</html>`;

writeFileSync(OUT, html);
console.log(`OK: ${OUT}`);
console.log(`   Türme ${towers.total} · Truppen ${troopTotal} (${troops.join('/')}) · Maps ${maps} · Gems ${gems} · Enchants ${enchants}`);
console.log(`   Java ${javaFiles.length} Dateien, ${loc} LOC · ${testCount} @Test · Decisions ${decisions} · Fragen ${questions}`);
