#!/usr/bin/env node
// Bouwt de projecttegels en de case-data uit data/projects.json.
// Gebruik: node scripts/build.mjs   (daarna committen)
import { readFileSync, writeFileSync, existsSync, readdirSync, unlinkSync, mkdirSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(readFileSync(join(root, 'data/projects.json'), 'utf8'));
const all = data.projects;
const live = all.filter(p => p.status === 'live');
const errors = [], warns = [];

// ---------- validatie ----------
const seenSlug = new Set();
const seenUrl = new Set();
const RESERVED = new Set(['index','work','about','contact','industries','careers','legal','case','cases',
  'iaapa2026','actuals','actuals-rapport','assets','data','scripts','netlify','mail','tokens',
  'sitemap','robots','styles','site','favicon','admin','book','slots','api']);
const owner = new Map(); // foto -> slug
for (const p of all) {
  if (seenSlug.has(p.slug)) errors.push(`dubbele slug: ${p.slug}`);
  seenSlug.add(p.slug);
  if (!p.url) errors.push(`${p.slug}: geen url`);
  else {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.url)) errors.push(`${p.slug}: url mag alleen kleine letters, cijfers en koppeltekens bevatten -> ${p.url}`);
    if (RESERVED.has(p.url)) errors.push(`${p.slug}: url botst met een bestaande pagina -> /${p.url}`);
    if (seenUrl.has(p.url)) errors.push(`dubbele url: /${p.url}`);
    seenUrl.add(p.url);
    for (const al of p.aliases || []) {
      if (seenUrl.has(al)) errors.push(`${p.slug}: alias botst met een andere url -> /${al}`);
      seenUrl.add(al);
    }
  }
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
  // PLACEHOLDER: INPUT NODIG hoort in needs, nooit in een veld dat op de site komt
  for (const k of ['title','script','l2','disc','client','year','loc','intro']) {
    if (/INPUT NODIG|NOG TE BEPALEN/i.test(p[k] || '')) errors.push(`${p.slug}: placeholder in zichtbaar veld "${k}" -> zet hem in needs`);
  }
  for (const st of p.steps || []) {
    if (/INPUT NODIG|NOG TE BEPALEN/i.test([st[0], st[1], st[2]].join(' '))) errors.push(`${p.slug}: placeholder in een case-stap -> zet hem in needs`);
  }
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
  return `      <a class="${cls}" data-cat="${esc(p.cat)}" href="/${p.url}">`
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

// ---------- case: data in cases.js ----------
const caseData = {};
for (const p of live) {
  caseData[p.slug] = {
    url: p.url,
    title: p.title, script: p.script, l2: p.l2, disc: p.disc, client: p.client, year: p.year, loc: p.loc,
    hero: p.hero, intro: p.intro,
    steps: (p.steps || []).filter(s => s[3]),
    reveal: p.reveal || p.hero,
    gallery: p.gallery || [],
    stats: p.stats || []
  };
}
writeFileSync(join(root, 'cases.js'),
  '/* Gegenereerd door scripts/build.mjs. Niet met de hand aanpassen. */\n' +
  'var PROJECTS = ' + JSON.stringify(caseData, null, 2) + ';\n' +
  'var ORDER = ' + JSON.stringify(live.map(p => p.slug)) + ';\n');

// ---------- een echte pagina per project ----------
const GEN = '<!-- gegenereerd door scripts/build.mjs -->';
const tpl = readFileSync(join(root, 'case.html'), 'utf8');
const SITE = 'https://conceptfactory.be';

function metaFor(p) {
  const bits = [p.client, p.year].filter(Boolean).join(', ');
  const d = (p.intro || '').replace(/\s+/g, ' ').trim();
  const desc = (d.length > 155 ? d.slice(0, 152).replace(/[\s,.;:–-]+$/, '') + '...' : d)
    || `${p.title} — ${p.disc} door Concept Factory${bits ? ' (' + bits + ')' : ''}.`;
  return { title: `${p.title} — ${p.disc} | Concept Factory`, desc, url: `${SITE}/${p.url}`, img: `${SITE}/assets/photos/${p.hero}` };
}

const generated = new Set();
for (const p of live) {
  const m = metaFor(p);
  let html = tpl
    .replace(/<meta name="robots"[^>]*\/><!-- TEMPLATE-ONLY -->\n?/, '')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(m.title)}</title>`)
    .replace(/<meta name="description" content="[\s\S]*?" \/>/, `<meta name="description" content="${esc(m.desc)}" />`)
    .replace(/<link rel="canonical" href="[\s\S]*?" \/>/, `<link rel="canonical" href="${m.url}" />`)
    .replace(/<meta property="og:title" content="[\s\S]*?" \/>/, `<meta property="og:title" content="${esc(m.title)}" />`)
    .replace(/<meta property="og:description" content="[\s\S]*?" \/>/, `<meta property="og:description" content="${esc(m.desc)}" />`)
    .replace(/<meta property="og:url" content="[\s\S]*?" \/>/, `<meta property="og:url" content="${m.url}" />`)
    .replace(/<meta property="og:image" content="[\s\S]*?" \/>/, `<meta property="og:image" content="${esc(m.img)}" />`)
    .replace(/<meta name="twitter:title" content="[\s\S]*?" \/>/, `<meta name="twitter:title" content="${esc(m.title)}" />`)
    .replace(/<meta name="twitter:description" content="[\s\S]*?" \/>/, `<meta name="twitter:description" content="${esc(m.desc)}" />`)
    .replace(/<meta name="twitter:image" content="[\s\S]*?" \/>/, `<meta name="twitter:image" content="${esc(m.img)}" />`)
    .replace('<!-- CASEDATA -->', `${GEN}\n<script>window.FORCED_SLUG=${JSON.stringify(p.slug)};</script>`);
  writeFileSync(join(root, p.url + '.html'), html);
  generated.add(p.url + '.html');
}

// oude projectpagina's opruimen die niet meer bestaan
for (const f of readdirSync(root)) {
  if (!f.endsWith('.html') || generated.has(f)) continue;
  const src = readFileSync(join(root, f), 'utf8');
  if (!src.includes(GEN)) continue;
  // op de aangekoppelde map kan node niet verwijderen (FUSE): dan opzij zetten
  try { unlinkSync(join(root, f)); console.log('verwijderd: ' + f); }
  catch (e) {
    mkdirSync(join(root, '_oldpages'), { recursive: true });
    renameSync(join(root, f), join(root, '_oldpages', f));
    console.log('opzij gezet: ' + f + ' -> _oldpages/');
  }
}

// ---------- oude /case?p= links blijven werken ----------
const redirectLines = [];
for (const p of live) redirectLines.push(`/case  p=${p.slug}  /${p.url}  301!`);
redirectLines.push('/case  /work  301!');
for (const p of live) for (const al of p.aliases || []) redirectLines.push(`/${al}  /${p.url}  301!`);
writeFileSync(join(root, '_redirects'), '# Gegenereerd door scripts/build.mjs\n' + redirectLines.join('\n') + '\n');

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
    `        <a class="tile" href="/${p.url}"><img src="assets/photos/${esc(p.hero)}" alt="${esc(p.title)}" loading="lazy" /><div class="tile__scrim"></div>`
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
for (const u of new Set([...all.map(p => p.url).filter(Boolean), 'case'])) {
  sm = sm.replace(new RegExp('<url><loc>https://conceptfactory\\.be/(case[^<]*|' + u + ')</loc>[\\s\\S]*?</url>\\n?', 'g'), '');
}
const today = new Date().toISOString().slice(0, 10);
const caseUrls = live.map(p => `<url><loc>https://conceptfactory.be/${p.url}</loc><lastmod>${today}</lastmod><priority>0.7</priority></url>`).join('\n');
sm = sm.replace('</urlset>', caseUrls + '\n</urlset>');
writeFileSync(smPath, sm);

console.log(`gebouwd: ${live.length} live projecten, ${all.length - live.length} in draft`);
if (warns.length) console.log('\nNog nodig:\n' + warns.map(w => '  - ' + w).join('\n'));
