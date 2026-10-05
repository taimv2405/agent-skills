// Google Play helper for clone-app-research.
// Usage: node gplay.mjs <top|search|similar|info|dump|tally|count> ... [--no-giants] [--sort newest|helpful]
// Country/lang default to vn/vi; override with GP_COUNTRY / GP_LANG env vars.
import gplay from 'google-play-scraper';
import fs from 'fs';

const country = process.env.GP_COUNTRY || 'vn';
const lang = process.env.GP_LANG || 'vi';
const GIANTS = /\b(Google|Meta|Facebook|Instagram|WhatsApp|Microsoft|Apple|Amazon|ByteDance|TikTok|Lemon Inc|OpenAI|Samsung|Tencent|Alibaba|Netflix|Spotify|Snap|X Corp|Adobe|Telegram|Zalo|VNG|Shopee|Grab|Lazada|MoMo|Viettel|VNPT|MobiFone|Garena)\b/i;

const argv = process.argv.slice(2);
const flags = new Set(argv.filter(a => a.startsWith('--') && !a.includes('=')));
const flagVal = (name, def) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : def;
};
const sortName = flagVal('--sort', 'newest');
const pos = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--sort');
const [cmd, arg, n] = pos;
const cut = (s, k) => (s || '').replace(/\s+/g, ' ').slice(0, k);

function printApps(apps) {
  const kept = flags.has('--no-giants') ? apps.filter(a => !GIANTS.test(a.developer || '')) : apps;
  if (kept.length !== apps.length) console.log(`(lọc ${apps.length - kept.length} app ông lớn theo --no-giants)`);
  for (const a of kept) console.log(`${a.appId} | ${a.title} | ${a.developer} | ${a.score ? a.score.toFixed(2) : '-'}`);
}

async function fetchReviews(appId, num) {
  const sort = sortName === 'helpful' ? gplay.sort.HELPFULNESS : gplay.sort.NEWEST;
  const { data } = await gplay.reviews({ appId, country, lang, sort, num });
  return data;
}
const line = r => console.log(`- ${r.score}★ ${r.thumbsUp}👍 ${new Date(r.date).toISOString().slice(0, 10)} | ${cut(r.text, 250)}`);
const byThumbs = (a, b) => b.thumbsUp - a.thumbsUp;
const span = data => {
  if (!data.length) return '';
  const ds = data.map(r => +new Date(r.date)).sort((a, b) => a - b);
  return `${new Date(ds[0]).toISOString().slice(0, 10)} → ${new Date(ds.at(-1)).toISOString().slice(0, 10)}`;
};

if (cmd === 'top') {
  printApps(await gplay.list({ category: arg, collection: gplay.collection.TOP_FREE, country, lang, num: Number(n) || 100 }));
} else if (cmd === 'search') {
  printApps(await gplay.search({ term: arg, country, lang, num: Number(n) || 30 }));
} else if (cmd === 'similar') {
  printApps(await gplay.similar({ appId: arg, country, lang }));
} else if (cmd === 'info') {
  for (const id of pos.slice(1)) {
    const a = await gplay.app({ appId: id, country, lang });
    console.log(`${a.appId} | ${a.title} | ${a.developer} | ${a.installs} lượt tải | ${a.score?.toFixed(2)}★ (${a.ratings} đánh giá) | ${a.genre} | cập nhật ${new Date(a.updated).toISOString().slice(0, 10)} | ${a.url}`);
    console.log(`  ${cut(a.summary, 200)}`);
  }
} else if (cmd === 'dump') {
  // dump <appId> <out.txt> [num]: ghi review ra file, mỗi dòng "id|sao|👍|ngày|nội dung", để LLM đọc và gom chủ đề.
  // Bỏ review quá ngắn không mang thông tin; review 4–5★ chỉ giữ khi đủ dài để có thể chứa góp ý.
  const out = n;
  const data = await fetchReviews(arg, Number(pos[3]) || 2000);
  const keep = data.filter(r => {
    const len = (r.text || '').trim().length;
    return r.score <= 3 ? len >= 25 : len >= 80;
  });
  const rows = keep.map(r => `${r.id}|${r.score}|${r.thumbsUp}|${new Date(r.date).toISOString().slice(0, 10)}|${cut(r.text, 400)}`);
  fs.writeFileSync(out, rows.join('\n'));
  const dist = [1, 2, 3, 4, 5].map(s => `${s}★:${data.filter(r => r.score === s).length}`).join(' ');
  console.log(`${arg}: lấy ${data.length} review (sort=${sortName}, ${span(data)}) | ${dist}`);
  console.log(`Ghi ${keep.length} review đủ thông tin vào ${out}`);
} else if (cmd === 'tally') {
  // tally <dump.txt> <themes.json>: themes.json = { "tên chủ đề": ["reviewId", ...] }. In số review và tổng 👍 thật của từng chủ đề.
  const rows = new Map(fs.readFileSync(arg, 'utf8').split('\n').filter(Boolean).map(l => {
    const [id, score, thumbs, date, ...text] = l.split('|');
    return [id, { score: +score, thumbsUp: +thumbs, date, text: text.join('|') }];
  }));
  const themes = JSON.parse(fs.readFileSync(n, 'utf8'));
  const res = Object.entries(themes).map(([name, ids]) => {
    const hit = [...new Set(ids)].map(id => rows.get(id)).filter(Boolean).sort(byThumbs);
    const missing = ids.filter(id => !rows.has(id)).length;
    return { name, hit, missing, sum: hit.reduce((s, r) => s + r.thumbsUp, 0) };
  }).sort((a, b) => b.sum - a.sum || b.hit.length - a.hit.length);
  for (const t of res) {
    console.log(`\n## ${t.name}: ${t.hit.length} review, tổng ${t.sum}👍${t.missing ? ` (bỏ ${t.missing} id không có trong file)` : ''}`);
    t.hit.slice(0, 5).forEach(r => console.log(`- ${r.score}★ ${r.thumbsUp}👍 ${r.date} | ${cut(r.text, 250)}`));
  }
} else if (cmd === 'count') {
  // count <appId> "<regex>" [num]: dò nhanh theo từ khóa. Chỉ để xem sơ bộ, không dùng làm số liệu bằng chứng.
  const re = new RegExp(n, 'i');
  const data = await fetchReviews(arg, Number(pos[3]) || 2000);
  const hit = data.filter(r => re.test(r.text || '')).sort(byThumbs);
  const sum = hit.reduce((s, r) => s + r.thumbsUp, 0);
  console.log(`${arg} /${n}/i: ${hit.length}/${data.length} review khớp, tổng ${sum}👍 (sort=${sortName}, ${span(data)})`);
  hit.slice(0, 15).forEach(line);
} else {
  console.log('Lệnh: top <CATEGORY> [num] | search "<từ khóa>" [num] | similar <appId> | info <appId...> | dump <appId> <out.txt> [num] | tally <dump.txt> <themes.json> | count <appId> "<regex>" [num]');
  console.log('Cờ: --no-giants (top/search/similar) | --sort newest|helpful (dump/count)');
}
