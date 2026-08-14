import { getStore } from '@netlify/blobs';
function pad(n){ return (n<10?'0':'')+n; }
const DAYS = [['2026-09-22',10,18],['2026-09-23',10,18],['2026-09-24',10,16]];
const DAYLABEL = {'2026-09-22':'Tuesday 22 September','2026-09-23':'Wednesday 23 September','2026-09-24':'Thursday 24 September'};
const ALLOWED = new Set();
for (const [d,s,e] of DAYS) { for (let h=s; h<e; h++) { for (const m of [0,30]) ALLOWED.add(d+'_'+pad(h)+pad(m)); } }
function pretty(slot){ const p=String(slot).split('_'); const t=p[1]||''; let hh,mm,span; if(t.length>=4){hh=parseInt(t.slice(0,2),10);mm=parseInt(t.slice(2,4),10);span=30;} else {hh=parseInt(t,10);mm=0;span=60;} const em=mm+span, eh=hh+Math.floor(em/60), e2=em%60; return (DAYLABEL[p[0]]||p[0])+' · '+pad(hh)+':'+pad(mm)+'–'+pad(eh)+':'+pad(e2)+' (London)'; }
function json(o,s){ return new Response(JSON.stringify(o),{status:s||200,headers:{'content-type':'application/json'}}); }
export default async (req) => {
  if (req.method !== 'POST') return json({ok:false,error:'method'},405);
  let data; try { data = await req.json(); } catch(e){ return json({ok:false,error:'bad'},400); }
  const slot=(data.slot||'').trim(), name=(data.name||'').trim(), email=(data.email||'').trim();
  if (!slot || !name || !email) return json({ok:false,error:'missing'},400);
  if (!ALLOWED.has(slot)) return json({ok:false,error:'invalid'},400);
  const store = getStore('iaapa2026');
  if (await store.get(slot)) return json({ok:false,error:'taken'},409);
  const when = pretty(slot);
  await store.set(slot, JSON.stringify({slot,when,name,company:data.company||'',email,phone:data.phone||'',message:data.message||'',bookedAt:new Date().toISOString()}));
  try {
    const body = new URLSearchParams({'form-name':'iaapa',when,slot,name,company:data.company||'',email,phone:data.phone||'',message:data.message||''});
    await fetch('https://conceptfactory.be/',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:body.toString()});
  } catch(e){}
  return json({ok:true});
};
