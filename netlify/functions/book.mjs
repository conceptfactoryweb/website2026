import { getStore } from '@netlify/blobs';
const DAYS = [['2026-09-22',10,18],['2026-09-23',10,18],['2026-09-24',10,16]];
const ALLOWED = new Set();
for (const [d,s,e] of DAYS) { for (let h=s; h<e; h++) ALLOWED.add(d+'_'+h); }
function json(o,s){ return new Response(JSON.stringify(o),{status:s||200,headers:{'content-type':'application/json'}}); }
export default async (req) => {
  if (req.method !== 'POST') return json({ok:false,error:'method'},405);
  let data; try { data = await req.json(); } catch(e){ return json({ok:false,error:'bad'},400); }
  const slot=(data.slot||'').trim(), name=(data.name||'').trim(), email=(data.email||'').trim();
  if (!slot || !name || !email) return json({ok:false,error:'missing'},400);
  if (!ALLOWED.has(slot)) return json({ok:false,error:'invalid'},400);
  const store = getStore('iaapa2026');
  const existing = await store.get(slot);
  if (existing) return json({ok:false,error:'taken'},409);
  await store.set(slot, JSON.stringify({slot,name,company:data.company||'',email,phone:data.phone||'',message:data.message||'',bookedAt:new Date().toISOString()}));
  // mirror to Netlify Forms for email + CSV export
  try {
    const body = new URLSearchParams({'form-name':'iaapa',slot,name,company:data.company||'',email,phone:data.phone||'',message:data.message||''});
    await fetch('https://conceptfactory.be/',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:body.toString()});
  } catch(e){}
  return json({ok:true});
};
