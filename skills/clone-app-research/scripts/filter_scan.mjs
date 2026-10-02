// Lọc cơ học kết quả scan_all.mjs theo tiêu chí cố định, in danh sách theo category và (tùy chọn) chia file cho subagent.
// Usage: node filter_scan.mjs <scan.json> [--min-installs 100000] [--min-ratings 2000] [--chunks N --out <dir>]
// Không lọc ông lớn, không có trần lượt tải. Chỉ loại cứng những loại app clone về bản chất không làm được.
import fs from 'fs';
import path from 'path';

const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : def; };
const minInstalls = Number(opt('--min-installs', 100_000));
const minRatings = Number(opt('--min-ratings', 2000));
const chunks = Number(opt('--chunks', 0));
const outDir = opt('--out', '.');

const apps = JSON.parse(fs.readFileSync(argv[0], 'utf8')).filter(a => a.title);
// Loại cứng: ngân hàng/vay/đầu tư, nhà nước, nhà mạng, thanh toán, app đi kèm phần cứng, VPN.
const HARD = /\b(bank|banking|ngân hàng|vay|loan|lend|credit card|tín dụng|crypto|bitcoin|trading|forex|chứng khoán|securities|insurance|bảo hiểm|government|chính phủ|bộ công an|police|công an|eSIM|carrier|wallet pay|payment|thanh toán|smart ?home|camera ip|cctv|wearable|smartwatch|earbuds|router|printer|remote control|điều khiển từ xa|vpn)\b/i;

const reason = a => {
  if (HARD.test(`${a.title} ${a.developer} ${a.summary}`)) return 'ngân hàng/nhà nước/phần cứng/thanh toán';
  if (a.minInstalls < minInstalls) return `<${minInstalls} tải`;
  if ((a.ratings || 0) < minRatings) return `<${minRatings} đánh giá`;
  return null;
};
const stat = {};
const kept = [];
for (const a of apps) { const r = reason(a); stat[r || 'GIỮ'] = (stat[r || 'GIỮ'] || 0) + 1; if (!r) kept.push(a); }
console.log(`Tổng ${apps.length} app unique. Phân loại:`, stat);

const byGenre = {};
for (const a of kept) (byGenre[a.genre] ||= []).push(a);
const blocks = Object.keys(byGenre).sort().map(g => [
  `=== ${g} (${byGenre[g].length})`,
  ...byGenre[g].sort((x, y) => y.ratings - x.ratings).map(a =>
    `${a.appId} | ${a.title} | ${a.developer} | ${a.installs} | ${a.score?.toFixed(2)}★ ${a.ratings} | ${a.sources.length} list: ${a.sources.slice(0, 2).join(',')}`),
]);

if (chunks > 0) {
  // Chia theo category, cân số dòng giữa các file để giao cho subagent song song.
  const files = Array.from({ length: chunks }, () => []);
  for (const b of blocks.sort((x, y) => y.length - x.length)) files.sort((x, y) => x.length - y.length)[0].push(...b);
  fs.mkdirSync(outDir, { recursive: true });
  files.forEach((f, i) => fs.writeFileSync(path.join(outDir, `chunk${i + 1}.txt`), f.join('\n')));
  console.log(`Đã chia ${kept.length} app vào ${chunks} file chunk*.txt trong ${outDir}`);
} else {
  for (const b of blocks) console.log(`\n${b.join('\n')}`);
}
