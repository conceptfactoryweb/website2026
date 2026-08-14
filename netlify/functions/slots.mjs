import { getStore } from '@netlify/blobs';
function pad(n){ return (n<10?'0':'')+n; }
const DAYS = [['2026-09-22',10,18],['2026-09-23',10,18],['2026-09-24',10,16]];
const ALLOWED = [];
for (const [d,s,e] of DAYS) { for (let h=s; h<e; h++) { for (const m of [0,30]) ALLOWED.push(d+'_'+pad(h)+pad(m)); } }
export default async () => {
  const headers = { 'content-type':'application/json', 'cache-control':'no-store' };
  try {
    const store = getStore('iaapa2026');
    const res = await Promise.all(ALLOWED.map(async k => ({ k, v: await store.get(k) })));
    return new Response(JSON.stringify({ taken: res.filter(r => r.v).map(r => r.k) }), { headers });
  } catch (e) { return new Response(JSON.stringify({ taken: [] }), { headers }); }
};
