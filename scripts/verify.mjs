import fs from 'fs';
const d = JSON.parse(fs.readFileSync('data/projects.json','utf8'));
const ps = Array.isArray(d) ? d : d.projects;
let bad = 0;
const all = new Map();
for (const p of ps) {
  const imgs = [p.hero, p.reveal, ...(p.gallery||[]), ...((p.steps||[]).map(s=>s[3]||s.photo))].filter(Boolean);
  for (const i of imgs) {
    if (!fs.existsSync('assets/photos/'+i)) { console.log('MISSING', p.slug, i); bad++; }
    if (!i.startsWith(p.slug+'/')) { console.log('FOREIGN', p.slug, i); bad++; }
    if (all.has(i) && all.get(i) !== p.slug) { console.log('DUPLICATE-CROSS', p.slug, i, '(ook in '+all.get(i)+')'); bad++; }
    all.set(i, p.slug);
  }
  if (p.status === 'live' && !p.hero) { console.log('LIVE-NO-HERO', p.slug); bad++; }
}
// unused photos
const dirs = fs.readdirSync('assets/photos',{withFileTypes:true}).filter(e=>e.isDirectory()&&!e.name.startsWith('_'));
let unused = [];
for (const dd of dirs) for (const f of fs.readdirSync('assets/photos/'+dd.name)) {
  if (!all.has(dd.name+'/'+f) && f !== '.gitkeep') unused.push(dd.name+'/'+f);
}
// html links
const html = fs.readFileSync('case.html','utf8');
const m = html.match(/var ORDER\s*=\s*(\[[^\]]*\])/);
console.log('ORDER in case.html:', m ? JSON.parse(m[1].replace(/'/g,'"')).length : 'NOT FOUND');
console.log('live:', ps.filter(p=>p.status==='live').length, 'draft:', ps.filter(p=>p.status!=='live').length);
console.log('fouten:', bad);
console.log('ongebruikte fotos ('+unused.length+'):', unused.join(', '));
