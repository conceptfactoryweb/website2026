#!/usr/bin/env node
// Bouwt de projecttegels en de case-data uit data/projects.json.
// Gebruik: node scripts/build.mjs   (daarna committen)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'data/projects.json'), 'utf8'));
const all = data.projects;
const live = all.filter(p => p.status === 'live');
const errors = [], warns = [];

// ---------- validatie ----------
const seenSlug = new Set();
const owner = new Map(); // foto -> slug
for (const p of all) {
  if (seenSlug.has(p.slug)) errors.push(`dubbele slug: ${p.slug}`);
  seenSlug.add(p.slug);
  const photos = [p.hero, p.reveal, ...(p.gallery || []), ...(p.steps || []).map(s => s[3])].filter(Boolean);
  for (const ph of photos) {
    if (!existsSync(join(root, 'assets/photos', ph))) errors.push(`${p.slug}: foto bestaat niet -> ${ph}`);
    if (ph.startsWith('atelier/')) errors.push(`${p.slug}: atelierbeeld mag niet in een projectcase -> ${ph}`);
    if (ph.startsWith('_unverified/')) errors.push(`${p.slug}: niet-geverifieerd beeld -> ${ph}`);
    const dir = ph.split('/')[0];
    if (dir !== p.slug) errors.push(`${p.slug}: beeld uit een andere projectmap -> ${ph}`);
    if (owner.has(ph) && owner.get(ph) !== p.slug) errors.push(`foto in twee projecten: ${ph} (${owner.get(ph)} en ${p.slug})`);
    owner.set(ph, p.slug);
  }
  if (p.status === 'live' && !p.hero) errors.push(`${p.slug}: live zonder hero`);
  const noPhoto = (p.steps || []).filter(s => !s[3]).length;
  if (noPhoto) warns.push(`${p.slug}: ${noPhoto} stap(pen) zonder beeld, wordt niet getoond`);
  for (const n of p.needs || []) warns.push(`${p.slug}: ${n}`);
}
if (errors.length) { console.error('\nBUILD GESTOPT:\n' + errors.map(e => '  x ' + e).join('\n') + '\n'); process.exit(1); }

// ---------- helpers ----------
const esc = s => String(s == null ? '' : s).replace(/&(?![a-z]+;|#)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const arrow = 'View case <svg class="icon"><use href="#i-arrow-up-right"/></svg>';

function tile(p, idx, cls, extraRow) {
  const bits = [p.client, p.year].filter(Boolean).map(esc).join(' · ');
  const row = extraRow && bits ? `<div class="tile__row">${bits}</div>` : '';
  return `      <a class="${cls}" data-cat="${esc(p.cat)}" href="/case?p=${p.slug}">`
    + `<img src="assets/photos/${esc(p.hero)}" alt="${esc(p.title)} — ${esc(p.disc)} by Concept Factory" loading="lazy" />`
    + `<div class="tile__scrim"></div><span class="tile__idx">${String(idx).padStart(3, '0')}</span>`
    + `<div class="tile__meta"><div class="tile__disc">${esc(p.disc)}</div><div class="tile__title">${esc(p.title)}</div>${row}`
    + `<span class="tile__arrow">${arrow}</span></div></a>`;
}

// rijen van 12 kolommen vullen: 8+4 en 4+4+4 afwisselend
function spans(n) {
  const out = []; let i = 0;
  while (i < n) {
    const left = n - i;
    if (left === 1) { out.push('col12'); i += 1; }
    else if (left === 2) { out.push('col8', 'col4'); i += 2; }
    else if (out.length % 5 === 0) { out.push('col8', 'col4'); i += 2; }
    else { out.push('col4', 'col4', 'col4'); i += 3; }
  }
  return out.slice(0, n);
}

function replaceBlock(file, name, body) {
  const path = join(root, file);
  let src = readFileSync(path, 'utf8');
  const open = new RegExp(`([ \\t]*<!-- BUILD:${name} -->)[\\s\\S]*?([ \\t]*<!-- /BUILD:${name} -->)`);
  const openJs = new RegExp(`([ \\t]*/\\* BUILD:${name} \\*/)[\\s\\S]*?([ \\t]*/\\* /BUILD:${name} \\*/)`);
  const re = open.test(src) ? open : openJs;
  if (!re.test(src)) { console.error(`x marker BUILD:${name} niet gevonden in ${file}`); process.exit(1); }
  src = src.replace(re, (_m, a, b) => `${a}\n${body}\n${b}`);
  writeFileSync(path, src);
}

// ---------- home: featured ----------
const featured = live.filter(p => p.featured).sort((a, b) => a.featured - b.featured).slice(0, 3);
replaceBlock('index.html', 'home-grid', featured.map((p, i) =>
  tile(p, i + 1, i === 0 ? 'tile tall reveal-up' : 'tile reveal-up', i === 0)).join('\n'));

// ---------- work: volledige grid ----------
const sp = spans(live.length);
replaceBlock('work.html', 'work-grid', live.map((p, i) =>
  tile(p, i + 1, `tile ${sp[i]}${sp[i] === 'col8' ? '' : ''} reveal-up`, true)).join('\n'));

// ---------- case: data ----------
const caseData = {};
for (const p of live) {
  caseData[p.slug] = {
    title: p.title, script: p.script, l2: p.l2, disc: p.disc, client: p.client, year: p.year, loc: p.loc,
    hero: p.hero, intro: p.intro,
    steps: (p.steps || []).filter(s => s[3]),
    reveal: p.reveal || p.hero,
    gallery: p.gallery || [],
    stats: p.stats || []
  };
}
replaceBlock('case.html', 'projects',
  '  var PROJECTS = ' + JSON.stringify(caseData, null, 2).split('\n').join('\n  ') + ';\n' +
  '  var ORDER = ' + JSON.stringify(live.map(p => p.slug)) + ';');

// ---------- industries ----------
const INDUSTRY = { 'theme-parks': 'theme-parks', 'theatre': 'theatre', 'tv-film': 'television', 'brands': 'brands', 'events': 'events', 'museums': 'museums' };
const ATELIER = [
  ['atelier/atelier-wide.jpg', 'Atelier', 'Herentals, 1.950 m2'],
  ['atelier/atelier-cnc.jpg', 'Atelier', 'CNC & machining'],
  ['atelier/atelier-build.jpg', 'Atelier', 'In-house build']
];
for (const [id, cat] of Object.entries(INDUSTRY)) {
  const picks = live.filter(p => p.cat === cat).slice(0, 3);
  const cells = picks.map(p =>
    `        <a class="tile" href="/case?p=${p.slug}"><img src="assets/photos/${esc(p.hero)}" alt="${esc(p.title)}" loading="lazy" /><div class="tile__scrim"></div>`
    + `<div class="tile__meta"><div class="tile__disc">${esc(p.disc)}</div><div class="tile__title">${esc(p.title)}</div></div></a>`);
  // geen verzonnen projecten: aanvullen met atelierbeeld, zonder link en zonder projectnaam
  for (let i = cells.length; i < 3; i++) {
    const a = ATELIER[i % ATELIER.length];
    cells.push(`        <div class="tile"><img src="assets/photos/${a[0]}" alt="Concept Factory atelier" loading="lazy" /><div class="tile__scrim"></div>`
      + `<div class="tile__meta"><div class="tile__disc">${a[1]}</div><div class="tile__title">${a[2]}</div></div></div>`);
  }
  if (!picks.length) warns.push(`industries/${id}: geen enkel echt project in deze sector, rij staat volledig op atelierbeeld`);
  replaceBlock('industries.html', 'ind-' + id, cells.join('\n'));
}

// ---------- sitemap ----------
const smPath = join(root, 'sitemap.xml');
let sm = readFileSync(smPath, 'utf8');
sm = sm.replace(/<url><loc>https:\/\/conceptfactory\.be\/case[\s\S]*?<\/url>\n?/g, '');
const today = new Date().toISOString().slice(0, 10);
const caseUrls = live.map(p => `<url><loc>https://conceptfactory.be/case?p=${p.slug}</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>`).join('\n');
sm = sm.replace('</urlset>', caseUrls + '\n</urlset>');
writeFileSync(smPath, sm);

console.log(`gebouwd: ${live.length} live projecten, ${all.length - live.length} in draft`);
if (warns.length) console.log('\nNog nodig:\n' + warns.map(w => '  - ' + w).join('\n'));
