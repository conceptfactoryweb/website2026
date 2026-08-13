import { getStore } from '@netlify/blobs';
export default async () => {
  try {
    const store = getStore('iaapa2026');
    const { blobs } = await store.list();
    return new Response(JSON.stringify({ taken: blobs.map(b => b.key) }), { headers: { 'content-type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ taken: [] }), { headers: { 'content-type': 'application/json' } });
  }
};
