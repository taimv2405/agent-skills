// Google Play helper for clone-app-research. Usage: node gplay.mjs <top|search|similar|info|reviews> ...
// Country/lang default to vn/vi; override with GP_COUNTRY / GP_LANG env vars.
import gplay from 'google-play-scraper';

const country = process.env.GP_COUNTRY || 'vn';
const lang = process.env.GP_LANG || 'vi';
const GIANTS = /\b(Google|Meta|Facebook|Instagram|WhatsApp|Microsoft|Apple|Amazon|ByteDance|TikTok|Lemon Inc|OpenAI|Samsung|Tencent|Alibaba|Netflix|Spotify|Snap|X Corp|Adobe|Telegram|Zalo|VNG|Shopee|Grab|Lazada|MoMo|Viettel|VNPT|MobiFone|Garena)\b/i;
const PRICING = /quảng cáo|\bads?\b|premium|\bvip\b|trả phí|mất phí|tính phí|đắt|subscription|gói cước|nạp tiền/i;
const REQUEST = /thêm|mong|giá mà|giá như|ước gì|nên có|cần có|không có|chưa có|thiếu|bổ sung|hy vọng|hi vọng|đề xuất|góp ý|please add|wish|would be nice|should have|feature request|missing|add an option/i;

const [cmd, arg, n] = process.argv.slice(2);
const cut = (s, k) => (s || '').replace(/\s+/g, ' ').slice(0, k);

function printApps(apps) {
  const kept = apps.filter(a => !GIANTS.test(a.developer || ''));
  console.log(`(lọc ${apps.length - kept.length} app ông lớn)`);
  for (const a of kept) console.log(`${a.appId} | ${a.title} | ${a.developer} | ${a.score ? a.score.toFixed(2) : '-'}`);
}

if (cmd === 'top') {
  printApps(await gplay.list({ category: arg, collection: gplay.collection.TOP_FREE, country, lang, num: Number(n) || 100 }));
} else if (cmd === 'search') {
  printApps(await gplay.search({ term: arg, country, lang, num: Number(n) || 30 }));
} else if (cmd === 'similar') {
  printApps(await gplay.similar({ appId: arg, country, lang }));
} else if (cmd === 'info') {
  for (const id of process.argv.slice(3)) {
    const a = await gplay.app({ appId: id, country, lang });
    console.log(`${a.appId} | ${a.title} | ${a.developer} | ${a.installs} lượt tải | ${a.score?.toFixed(2)}★ (${a.ratings} đánh giá) | ${a.genre} | cập nhật ${new Date(a.updated).toISOString().slice(0, 10)} | ${a.url}`);
    console.log(`  ${cut(a.summary, 200)}`);
  }
} else if (cmd === 'reviews') {
  const { data } = await gplay.reviews({ appId: arg, country, lang, sort: gplay.sort.NEWEST, num: Number(n) || 2000 });
  const dist = [1, 2, 3, 4, 5].map(s => `${s}★:${data.filter(r => r.score === s).length}`).join(' ');
  console.log(`${arg}: ${data.length} review mới nhất | ${dist}`);
  const line = r => console.log(`- ${r.score}★ ${r.thumbsUp}👍 ${new Date(r.date).toISOString().slice(0, 10)} | ${cut(r.text, 250)}`);
  const byThumbs = (a, b) => b.thumbsUp - a.thumbsUp;
  const pricing = data.filter(r => r.score <= 3 && PRICING.test(r.text || '')).sort(byThumbs);
  const requests = data.filter(r => REQUEST.test(r.text || '') && !pricing.includes(r)).sort(byThumbs);
  console.log(`\n## Có ý xin/thiếu tính năng (${requests.length})`);
  requests.slice(0, 30).forEach(line);
  console.log(`\n## Than phiền quảng cáo/giá, không dùng làm điểm khác biệt (${pricing.length})`);
  pricing.slice(0, 5).forEach(line);
  const low = data.filter(r => r.score <= 2 && !requests.includes(r) && !pricing.includes(r)).sort(byThumbs);
  console.log(`\n## Review 1–2★ khác (${low.length})`);
  low.slice(0, 20).forEach(line);
} else {
  console.log('Lệnh: top <CATEGORY> [num] | search "<từ khóa>" [num] | similar <appId> | info <appId...> | reviews <appId> [num]');
}
