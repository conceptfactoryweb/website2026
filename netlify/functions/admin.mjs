import { getStore } from '@netlify/blobs';
const KEY = 'iaapa26-a7f3c9k2m8';
const DAYLABEL = {'2026-09-22':'Tuesday 22 September','2026-09-23':'Wednesday 23 September','2026-09-24':'Thursday 24 September'};
function pad(n){ return (n<10?'0':'')+n; }
function pretty(slot){ const p=String(slot).split('_'); const h=parseInt(p[1],10); return (DAYLABEL[p[0]]||p[0])+' · '+pad(h)+':00–'+pad(h+1)+':00'; }
function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
export default async (req) => {
  const url = new URL(req.url);
  if (url.searchParams.get('key') !== KEY) return new Response('Unauthorized',{status:401});
  const store = getStore('iaapa2026');
  const del = url.searchParams.get('del');
  if (del) { await store.delete(del); return new Response('',{status:302,headers:{location:url.pathname+'?key='+encodeURIComponent(KEY)}}); }
  const { blobs } = await store.list();
  const rows = [];
  for (const b of blobs) { let o; try { o = JSON.parse(await store.get(b.key)); } catch(e){ o={slot:b.key}; } rows.push(o); }
  rows.sort((a,b)=> a.slot>b.slot?1:(a.slot<b.slot?-1:0));
  let h = '<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>IAAPA bookings</title>';
  h += '<style>body{font-family:Arial,Helvetica,sans-serif;background:#0d0e12;color:#e8e8ea;max-width:960px;margin:0 auto;padding:28px}h1{font-family:Oswald,sans-serif;font-size:22px}table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:9px 10px;border-bottom:1px solid rgba(255,255,255,.14);vertical-align:top}th{color:#9a9a9e;font-weight:600}a.del{color:#e6007e;text-decoration:none}small{color:#9a9a9e}</style>';
  h += '<h1>IAAPA 2026 &mdash; bookings ('+rows.length+')</h1>';
  h += '<table><tr><th>When</th><th>Name</th><th>Company</th><th>Email</th><th>Phone</th><th>Message</th><th></th></tr>';
  for (const r of rows) {
    h += '<tr><td>'+esc(r.when||pretty(r.slot))+'</td><td>'+esc(r.name)+'</td><td>'+esc(r.company)+'</td><td>'+esc(r.email)+'</td><td>'+esc(r.phone)+'</td><td>'+esc(r.message)+'</td>'
      +  '<td><a class=del href="?key='+encodeURIComponent(KEY)+'&del='+encodeURIComponent(r.slot)+'" onclick="return confirm(\'Cancel this booking and free the slot?\')">cancel</a></td></tr>';
  }
  if (!rows.length) h += '<tr><td colspan=7><small>No bookings yet.</small></td></tr>';
  h += '</table><p><small>Cancelling frees the time slot on the booking page. Full CSV export: Netlify &rarr; Forms &rarr; iaapa.</small></p>';
  return new Response(h,{headers:{'content-type':'text/html; charset=utf-8'}});
};
