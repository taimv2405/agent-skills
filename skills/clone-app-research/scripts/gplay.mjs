// Google Play helper for clone-app-research.
// Usage: node gplay.mjs <top|search|similar|info|reviews|count> ... [--no-giants] [--sort newest|helpful]
// Country/lang default to vn/vi; override with GP_COUNTRY / GP_LANG env vars.
import gplay from 'google-play-scraper';

const country = process.env.GP_COUNTRY || 'vn';
const lang = process.env.GP_LANG || 'vi';
const GIANTS = /\b(Google|Meta|Facebook|Instagram|WhatsApp|Microsoft|Apple|Amazon|ByteDance|TikTok|Lemon Inc|OpenAI|Samsung|Tencent|Alibaba|Netflix|Spotify|Snap|X Corp|Adobe|Telegram|Zalo|VNG|Shopee|Grab|Lazada|MoMo|Viettel|VNPT|MobiFone|Garena)\b/i;
const PRICING = /quảng cáo|\bads?\b|premium|\bvip\b|trả phí|mất phí|tính phí|đắt|subscription|gói cước|nạp tiền|paywall|price|expensive|refund/i;
const REQUEST = /thêm|mong|giá mà|giá như|ước gì|nên có|cần có|không có|chưa có|thiếu|bổ sung|hy vọng|hi vọng|đề xuất|góp ý|please add|wish|would be nice|should have|feature request|missing|add an option/i;

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
} else if (cmd === 'reviews') {
  const data = await fetchReviews(arg, Number(n) || 2000);
  const dist = [1, 2, 3, 4, 5].map(s => `${s}★:${data.filter(r => r.score === s).length}`).join(' ');
  console.log(`${arg}: ${data.length} review (sort=${sortName}, ${span(data)}) | ${dist}`);
  const pricing = data.filter(r => r.score <= 3 && PRICING.test(r.text || '')).sort(byThumbs);
  const requests = data.filter(r => REQUEST.test(r.text || '') && !pricing.includes(r)).sort(byThumbs);
  console.log(`\n## Có ý xin/thiếu tính năng (${requests.length})`);
  requests.slice(0, 30).forEach(line);
  console.log(`\n## Than phiền giá/quảng cáo/paywall: không phải điểm khác biệt kỹ thuật, dùng làm "lý do chuyển app" (${pricing.length})`);
  pricing.slice(0, 15).forEach(line);
  const low = data.filter(r => r.score <= 2 && !requests.includes(r) && !pricing.includes(r)).sort(byThumbs);
  console.log(`\n## Review 1–2★ khác (${low.length})`);
  low.slice(0, 20).forEach(line);
} else if (cmd === 'count') {
  // count <appId> "<regex>" [num]: đếm review khớp một chủ đề và tổng 👍.
  const re = new RegExp(n, 'i');
  const data = await fetchReviews(arg, Number(pos[3]) || 2000);
  const hit = data.filter(r => re.test(r.text || '')).sort(byThumbs);
  const sum = hit.reduce((s, r) => s + r.thumbsUp, 0);
  console.log(`${arg} /${n}/i: ${hit.length}/${data.length} review khớp, tổng ${sum}👍 (sort=${sortName}, ${span(data)})`);
  hit.slice(0, 15).forEach(line);
} else {
  console.log('Lệnh: top <CATEGORY> [num] | search "<từ khóa>" [num] | similar <appId> | info <appId...> | reviews <appId> [num] | count <appId> "<regex>" [num]');
  console.log('Cờ: --no-giants (top/search/similar) | --sort newest|helpful (reviews/count)');
}
