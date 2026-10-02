// Quét toàn bộ category ứng dụng (top free + grossing, VN + US), lấy chi tiết từng app, ghi ra JSON.
// Usage: node scan_all.mjs <out.json> [numPerList=50]   (~4000 app, mất khoảng 5 phút)
import gplay from 'google-play-scraper';
import fs from 'fs';

const out = process.argv[2] || 'scan.json';
const num = Number(process.argv[3]) || 50;
const SKIP = /^(GAME|FAMILY|APPLICATION|ANDROID_WEAR|LIBRARIES_AND_DEMO|WATCH_FACE)/;
const cats = Object.keys(gplay.category).filter(c => !SKIP.test(c));
const markets = [{ country: 'vn', lang: 'vi' }, { country: 'us', lang: 'en' }];
const collections = ['TOP_FREE', 'GROSSING'];

const seen = new Map(); // appId -> { appId, sources: [] }
const jobs = [];
for (const c of cats) for (const m of markets) for (const col of collections) jobs.push({ c, m, col });

async function pool(items, k, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: k }, async () => {
    while (i < items.length) {
      const it = items[i++];
      try { await fn(it); } catch (e) { process.stderr.write(`ERR ${JSON.stringify(it).slice(0, 80)} ${e.message}\n`); }
    }
  }));
}

await pool(jobs, 6, async ({ c, m, col }) => {
  const list = await gplay.list({ category: c, collection: gplay.collection[col], country: m.country, lang: m.lang, num });
  list.forEach((a, rank) => {
    const e = seen.get(a.appId) || { appId: a.appId, sources: [] };
    e.sources.push(`${c}/${m.country}/${col === 'TOP_FREE' ? 'free' : 'gross'}#${rank + 1}`);
    seen.set(a.appId, e);
  });
});
process.stderr.write(`lists done: ${jobs.length} lists, ${seen.size} unique apps\n`);

const apps = [...seen.values()];
let done = 0;
await pool(apps, 10, async e => {
  const a = await gplay.app({ appId: e.appId, country: 'us', lang: 'en' })
    .catch(() => gplay.app({ appId: e.appId, country: 'vn', lang: 'vi' }));
  Object.assign(e, {
    title: a.title, developer: a.developer, genre: a.genreId, minInstalls: a.minInstalls, installs: a.installs,
    score: a.score, ratings: a.ratings, reviews: a.reviews, updated: a.updated, released: a.released,
    iap: a.offersIAP, adSupported: a.adSupported, summary: (a.summary || '').slice(0, 140),
  });
  if (++done % 200 === 0) process.stderr.write(`details ${done}/${apps.length}\n`);
});
fs.writeFileSync(out, JSON.stringify(apps, null, 1));
process.stderr.write(`wrote ${apps.length} apps to ${out}\n`);
