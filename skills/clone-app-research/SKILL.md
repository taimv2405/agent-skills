---
name: clone-app-research
description: Tìm đề tài app mobile theo kiểu "clone một app đang có người dùng thật + thêm 3–4 điểm khác biệt mà người dùng cảm nhận được, chưa phổ biến và có độ khó thật", chọn từ toàn bộ bảng xếp hạng Google Play và review người dùng, không tự nghĩ chủ đề rồi đi search để xác nhận. Ứng viên phải có lõi đủ lớn cho nhóm và có lý do để ít nhất một nhóm người dùng cụ thể chọn bản clone. Dùng khi user nhờ tìm đề tài/ý tưởng app, đồ án mobile, chọn app để clone, hoặc hỏi nên thêm tính năng gì cho nổi bật. Also: pick an existing app to clone, find differentiating features from app reviews.
---

# Clone app research

Mục tiêu không phải startup hay tìm vấn đề lớn chưa ai giải. Mục tiêu là tìm một app đang có người dùng thật và chọn được phần clone thỏa bốn điều kiện:
- **Lõi đủ lớn cho nhóm.**
- **3–4 điểm khác biệt mà người dùng cảm nhận được**, xuất phát từ nhu cầu mà người dùng của chính app đó đang nêu, và **chưa phổ biến** trên thị trường.
- **Điểm khác biệt có độ khó thật.**
- **Ít nhất một nhóm người dùng cụ thể có lý do chọn bản của nhóm** thay vì app gốc. Kỳ vọng số người dùng phải lớn hơn 0.

Thứ tự ưu tiên khi các điều kiện kéo nhau: người dùng cảm nhận được > chưa phổ biến > độ khó. Một tính năng khó mà người dùng không thấy khác biệt thì không phải điểm nổi bật.

Mặc định giả định nhóm 5 người, có dùng agent AI để code, nên lõi nhắm tới cỡ L (xem Bước 1) và độ khó được phép cao. Nếu user nêu ràng buộc nhỏ hơn (ít người, ít thời gian) thì hạ cỡ lõi xuống M và hạ mức yêu cầu ở cửa Độ khó.

## Luật cứng
- **Ứng viên phải đến từ dữ liệu, không từ trí nhớ của model.** Nguồn hợp lệ:
  - dữ liệu quét toàn bộ ở Bước 1;
  - app tầm trung tìm thêm ở Bước 3 bằng `similar`/`search`/thread "alternative to", nhưng chỉ trong các loại app user đã chọn ở điểm dừng;
  - chủ đề do **chính user** nêu. Chủ đề này được đưa vào danh sách loại app như mọi loại khác và phải qua cùng các bước, không được ưu tiên hay miễn cửa nào.

  Model không tự nghĩ chủ đề hay từ khóa rồi lấy ứng viên từ kết quả search. Cách đó chỉ tìm được bằng chứng cho định kiến có sẵn. Mỗi ứng viên phải ghi nguồn: nằm ở BXH nào, hạng mấy, hoặc tìm thấy từ đâu.
- Chưa chạy Bước 1 thì không được nêu app hay đề tài nào lấy từ trí nhớ.
- Tiêu chí lọc phải được viết ra trước khi xem kết quả quét.
- **Không né ông lớn theo tên nhà phát triển.** App của Google, Meta, Microsoft… vẫn chọn được, miễn qua Bước 2. Thay vào đó, loại theo bản chất app:
  - Giá trị chỉ có khi đông người dùng: báo cáo cộng đồng, feed đại chúng, ghép người lạ.
  - Cần dữ liệu hoặc nội dung độc quyền.
  - Cần đối tác: người bán, tài xế, nhà hàng.
  - Cần phần cứng riêng.
  - Cần thanh toán thật, hoặc vướng pháp lý.
  - App ngân hàng, app nhà nước.
- **Lõi app phải chạy đủ khi không có AI.** Mất mạng, hết quota hay nhà cung cấp AI ngừng dịch vụ thì người dùng vẫn dùng được toàn bộ phần clone và phần lớn điểm khác biệt. Chỉ bỏ luật này khi user nói rõ chấp nhận app phụ thuộc AI.
- Điểm khác biệt nào đề xuất ra cũng phải trích được review hoặc thread thật (kèm appId hoặc link, và số 👍). Không trích được thì không đề xuất.
- Số review và tổng 👍 dùng làm bằng chứng phải lấy từ `tally`, không ước lượng và không lấy từ `count`.
- Ràng buộc của user (yêu cầu môn học, thời gian, số người, stack) chỉ dùng để lọc ở điểm dừng và Bước 4. Nếu trong repo có file yêu cầu đồ án thì đọc nó.

## Công cụ
Thư mục skill là "Base directory for this skill", hiện ra khi skill được nạp. Nếu `scripts/node_modules` chưa có (lần đầu hoặc sau khi plugin cập nhật) thì chạy `npm ci --prefix <thư mục skill>/scripts` trước. Các script dùng thư viện google-play-scraper. Mặc định thị trường VN, tiếng Việt. Đặt `GP_COUNTRY=us GP_LANG=en` để xem thị trường US.

**Quét toàn bộ:**
- `node scripts/scan_all.mjs <out.json> [50] [--vn]`: quét mọi category ứng dụng (trừ game, watch face, thư viện) × VN/US × top free/top grossing, lấy chi tiết từng app (lượt tải, số đánh giá, thể loại). Kết quả khoảng 4000 app, mất khoảng 5 phút. Nên chạy nền và ghi file vào scratchpad. `--vn` chỉ quét thị trường VN; dùng với số 200 để lấy cả app tầm trung (khoảng 5000 app, 5–10 phút).
- `node scripts/filter_scan.mjs <scan.json> [--min-installs 100000] [--min-ratings 2000] [--chunks N --out <dir>]`: lọc cơ học theo tiêu chí cố định, gồm loại cứng ngân hàng/nhà nước/phần cứng/thanh toán, không có trần lượt tải. In danh sách theo category. Dùng `--chunks` để chia thành N file giao cho subagent.

**Từng app** (`node scripts/gplay.mjs <lệnh>`):
- `top <CATEGORY> [num]`, `search "<từ khóa>" [num]`, `similar <appId>`: không lọc ông lớn, trừ khi thêm `--no-giants`.
- `info <appId...>`: lượt tải, số đánh giá, ngày cập nhật, link.
- `dump <appId> <out.txt> [num=2000] [--sort newest|helpful]`: ghi review ra file, mỗi dòng `id|sao|👍|ngày|nội dung`. Tự bỏ review quá ngắn; review 4–5★ chỉ giữ khi đủ dài để có thể chứa góp ý. Dòng in ra cho biết khoảng thời gian mà các review trải ra.
- `tally <dump.txt> <themes.json>`: `themes.json` có dạng `{ "tên chủ đề": ["reviewId", ...] }`. In số review và tổng 👍 thật của từng chủ đề, kèm 5 review nhiều 👍 nhất. Đây là nguồn số liệu duy nhất cho bằng chứng.
- `count <appId> "<regex>" [num]`: dò nhanh theo từ khóa để xem sơ bộ. Regex bỏ sót cách diễn đạt khác nên không dùng làm bằng chứng.

## Bước 1: Quét toàn bộ, chưa chọn gì
1. Chạy `scan_all.mjs`, rồi `filter_scan.mjs` với tiêu chí đã viết sẵn.
2. **Phân loại từng app** còn lại (thường khoảng 2500 app) vào nhóm GIỮ hoặc một mã loại:
   - **NOIDUNG:** giá trị nằm ở kho nội dung mà nhóm phải tự sản xuất hoặc mua bản quyền (phim, nhạc có bản quyền, truyện, tin, đề thi, khóa học). Nếu nội dung do người dùng tự mang vào, hoặc lấy được hợp pháp từ nguồn công khai (RSS, public domain, file của người dùng), và giá trị nằm ở tính năng xử lý nội dung đó, thì **GIỮ**: đây thường là loại đề tài "tính năng là trọng tâm" mà user muốn.
   - **DOITAC:** marketplace, giao đồ, đặt xe, khách sạn, thương hiệu bán lẻ.
   - **PHANCUNG:** app đi kèm thiết bị.
   - **RAC:** tiện ích rác hoặc clone hàng loạt (cleaner, remote, đèn pin, prank, wallpaper, launcher, downloader, app chỉ bọc AI).
   - **GHEPNGUOILA:** dating, livestream, chat với người lạ.
   - **QUATAM:** lõi là mô hình lớn tự train hoặc hạ tầng nặng (dịch máy, chatbot thuần, tìm kiếm web, bản đồ toàn cầu tự dựng).
   - **AI:** giá trị cốt lõi của app nằm ở AI; bỏ AI đi thì app không còn gì. Trượt luật "lõi chạy đủ khi không có AI".
   - **KHAC:** ghi rõ lý do.

   App chat, cộng đồng, cộng tác **demo được với một nhóm nhỏ** thì vẫn GIỮ.
3. Với app GIỮ, chấm **cỡ lõi** cho bản clone MVP 6–10 màn hình:
   - **S:** 1–2 người làm vài tuần, CRUD một vai trò.
   - **M:** nhiều module, có backend/đồng bộ, hoặc có xử lý media/bản đồ.
   - **L:** nhiều vai trò, hoặc realtime nhiều người, cộng backend thật và nhiều module.
4. Danh sách dài thì chia bằng `--chunks` cho nhiều subagent làm song song. Đưa cho subagent nguyên văn bảng mã và thang cỡ lõi ở trên, yêu cầu trả về danh sách đầy đủ app GIỮ (appId, lượt tải, số đánh giá, cỡ, loại app, một câu mô tả lõi clone) và 3 ví dụ cho mỗi mã loại. Việc phân loại chỉ dựa trên tiêu đề và mô tả ngắn nên sẽ có sai lệch; ca ở ranh giới thì GIỮ, để điểm dừng lọc tiếp.
5. Gom app GIỮ theo **loại app**, vì nhiều app trùng lõi. Xếp hạng các loại theo tổng số đánh giá của các app cùng loại trong BXH.
6. Ghi lại phễu: tổng số app quét → sau lọc cơ học → GIỮ → số app cỡ M/L → số loại app.

## Bước 2: Ai sẽ dùng bản của nhóm
Chỉ xét các loại app có cỡ lõi đúng mức nhắm tới. Bước này làm **sơ bộ cho từng loại app**, chưa đào review sâu. Mỗi loại phải trả lời được 3 câu, **trượt câu 1 thì loại**:
1. **Chỉ một người hoặc một nhóm nhỏ dùng thì có giá trị không?** App mà giá trị chỉ có khi đông người dùng thì gần như chắc chắn 0 người dùng. Ví dụ: báo cáo giao thông cộng đồng, mạng xã hội đại chúng, ghép người lạ.
2. **Người dùng có lý do gì để bỏ app gốc, mà app gốc khó làm theo?** Lý do mạnh nhất là khi nó xung đột với mô hình kinh doanh của app gốc: gói cloud thu phí, quảng cáo, giới hạn bản miễn phí. Ở bước này chỉ cần giả thuyết kèm một vài review; bằng chứng đầy đủ làm ở Bước 3.
3. **10–50 người dùng đầu tiên đến từ đâu?** Ví dụ: lớp hoặc trường của nhóm, gia đình các thành viên, cộng đồng theo sở thích. Nếu đồ án yêu cầu phát hành lên store có người dùng thật thì câu này có trọng số ngang câu 2: không chỉ ra được kênh cụ thể thì xếp loại app đó xuống cuối.

Với app lớn, một nỗi đau nhiều 👍 vẫn chưa đủ để người dùng rời app gốc. Phải chỉ ra được một chỗ đứng hẹp mà app gốc không phục vụ, hoặc không thể phục vụ.

## Điểm dừng: user chọn loại app
**Không làm Bước 3 trước khi user chọn.** Đào review sâu tốn công, và nếu hướng đã lệch ý user thì cả báo cáo vô ích.

**Người dùng không chọn được từ tên loại app.** Chỉ nhìn "quản lý chi tiêu" hay "tổ chức giải đấu" thì không hình dung được làm nó có gì hay, nên loại nào cũng trông "quá quen" hoặc "quá lạ". Vì vậy trước khi trình, đọc nhanh review của app tiêu biểu mỗi loại (`dump --sort helpful`, xem 15 review 1–3★ nhiều 👍 nhất) và trình mỗi loại dưới dạng **một câu chuyện cụ thể**:
- ai đang khổ, khổ vì gì, kèm 1–2 câu trích review thật và số 👍;
- bản clone làm gì, điểm khác biệt có thể là gì (ghi rõ là giả thuyết);
- app tiêu biểu (kèm nguồn BXH, hạng), cỡ lõi, kênh tìm 10–50 người dùng đầu.

Trình 4–6 câu chuyện thay vì 8–12 dòng tên loại. Chọn câu chuyện thuộc các mảng khác nhau.

**Khi user gạt hết, hỏi hình dạng app thay vì đưa thêm danh sách.** Dùng AskUserQuestion với 3–4 hình dạng cụ thể (vd: "nền tảng khóa học kiểu Udemy", "luyện đề", "luyện code kiểu LeetCode") để user chỉ ra thứ họ đang hình dung. Ghi lại từng tín hiệu user cho (thích gì, chê gì và vì sao) rồi ghép lại trước khi đề xuất vòng mới. Đưa danh sách mới liên tục mà không hỏi lý do sẽ trượt mãi.

Kèm phễu ở Bước 1 và đường dẫn file dữ liệu. Hỏi user chọn 1–2 hướng để đào sâu, đồng thời hỏi ràng buộc còn thiếu (số người, thời gian, stack, yêu cầu của môn học, có bắt buộc phát hành lên store không). User được phép gạt hết và nêu chủ đề riêng; chủ đề đó đi tiếp Bước 3 như các loại khác.

Nếu user muốn app tầm trung hoặc ngách, quét sâu thị trường VN: `scan_all.mjs <out.json> 200 --vn`, rồi lọc thêm app có nhiều đánh giá nhưng điểm sao thấp (dưới 4.0): đó là nơi người dùng đang khổ.

## Bước 3: Đào review các loại app user đã chọn
**Mở rộng tập ứng viên trong từng loại.** App top chart thường đã phục vụ tốt nhu cầu phổ biến; nhu cầu chưa được đáp ứng hay nằm ở app tầm trung và ở người đang tìm app thay thế.
- Chạy `similar` trên 2–3 app đầu của loại, và `search` với tên loại app. Dùng `info` để lấy số liệu; app tầm trung từ 10.000 lượt tải trở lên là hợp lệ, không cần mức 2000 đánh giá.
- WebSearch các thread "alternative to <app>", Reddit, Voz, Tinhte để tìm lý do người ta bỏ app gốc. Thread là nguồn bằng chứng hợp lệ, kèm link.

**Đào review.** Với mỗi app chính của loại (app top và 1–2 app tầm trung có nhiều review chê):
1. `dump` review ra file. App rất lớn thì 2000 review mới nhất chỉ trải trong 1–3 tuần, toàn bug của bản cập nhật gần nhất, nên phải `dump` thêm một file với `--sort helpful`.
2. **LLM đọc file và phân loại**, không dùng regex. Theo Maalej & Nabil (2015): bug report, feature request, user experience, rating.
   - Feature request và than phiền về trải nghiệm thì thành được điểm khác biệt.
   - Than phiền về giá/quảng cáo/paywall không thành điểm khác biệt kỹ thuật, nhưng ghi vào mục **lý do chuyển app** để trả lời câu 2 ở Bước 2.
   - Bug của app gốc là tín hiệu yếu ("mình làm đúng hơn"). Ngoại lệ ở cửa Đúng loại.

   File dài (vài trăm dòng trở lên) thì giao cho subagent, mỗi subagent một file. Yêu cầu trả về các chủ đề, mỗi chủ đề kèm **danh sách id review** thuộc về nó, mô tả nỗi đau bằng lời của người dùng chứ không phải bằng giải pháp, và 1–2 câu trích nguyên văn.
3. Ghi các chủ đề vào `themes.json` rồi chạy `tally` để lấy số review và tổng 👍 thật. Chủ đề chỉ có 1 review với 0👍 là tín hiệu yếu, phải ghi rõ như vậy.
4. Đưa từng chủ đề qua mục Tiêu chí chọn điểm khác biệt.

Đào xong mà chỉ ra yêu cầu cấp 0–1 thì loại app đó yếu; báo user và đề nghị loại app tiếp theo trong danh sách ở điểm dừng.

## Tiêu chí chọn điểm khác biệt
Nhiều người xin chưa đủ để thành điểm khác biệt. Mỗi chủ đề phải qua lần lượt 7 cửa. Trượt cửa nào thì loại, và ghi vào mục "đã loại" kèm lý do.

**Ý tưởng giải pháp phải đi từ nỗi đau trong review ra, không đi từ danh sách kỹ thuật vào.** Danh sách kỹ thuật ở cửa Độ khó chỉ dùng để chấm sau khi đã có ý. Nếu nhiều ứng viên khác nhau ra cùng một bộ giải pháp thì đó là dấu hiệu đang ráp kỹ thuật vào chứ không đọc nỗi đau, phải làm lại.

1. **Đúng loại.**
   - **Loại khỏi điểm khác biệt:**
     - xin thêm nội dung hoặc dữ liệu (thêm bài hát, công thức, đề thi…);
     - tích hợp một bên thứ ba cụ thể cần hợp tác (ngân hàng X, ví Y).
   - **Không loại hẳn, chuyển sang mục lý do chuyển app:** xin bỏ quảng cáo, giảm giá, mở khóa premium.
   - **Bug:** chỉ được đề xuất khi cách giải là một kiến trúc cấp 2 (offline-first, upload resumable, kết nối lại tự động…). Khi đó gắn nhãn "làm đúng hơn" và nói rõ nguồn gốc là bug.
2. **Không quá đặc thù.** Phải là nhu cầu của nhóm người dùng chính, không phải của một nghề, một vùng hay một dòng máy. Cần ít nhất 2 review độc lập cùng chủ đề, hoặc 1 review ≥10👍.
3. **Người dùng cảm nhận được.**
   - Viết **một câu giới thiệu** điểm khác biệt cho người dùng phổ thông, không dùng thuật ngữ kỹ thuật. Câu đó phải nói người dùng được gì, không phải app dùng công nghệ gì.
   - Người dùng phải thấy khác biệt trong lần dùng đầu hoặc tuần dùng đầu. Cải tiến chỉ nằm ở hạ tầng (nhanh hơn vài trăm ms, kiến trúc gọn hơn) mà người dùng không nhận ra thì không qua, trừ khi review cho thấy người dùng đang khổ vì chính chỗ đó.
   - Kiểm tra ngược: đọc câu giới thiệu cạnh các review gốc. Người viết review có nhận ra đây là thứ họ đang xin không?
4. **Chưa phổ biến.**
   - Tìm xem tính năng đã có ở đâu: `search` trên Play với từ khóa mô tả tính năng, `similar` của app gốc, và WebSearch "<tính năng> app".
   - Phần lớn app đầu bảng cùng loại đã có tính năng này thì **loại**: người dùng không thấy đó là điểm nổi bật.
   - Chỉ vài app nhỏ có, hoặc có nhưng làm kém (có review chê) thì vẫn qua, ghi rõ "đã có ở X, khác ở chỗ…".
   - Ghi bằng chứng tìm kiếm đã làm, kể cả khi không tìm thấy gì.
5. **Độ khó đủ cao.** Chấm theo cấp:
   - **Cấp 0 (vặt):** thêm tùy chọn, nút hay cài đặt; dark mode, cỡ chữ, sắp xếp, lọc, xuất CSV, thêm trường vào form.
   - **Cấp 1 (thường):** màn hình CRUD mới, thống kê hoặc biểu đồ từ dữ liệu sẵn có, nhắc nhở theo giờ cố định, bọc một chatbot LLM đơn thuần.
   - **Cấp 2 (đáng làm):** gọi tên được một phần kỹ thuật thật mà phần lớn dev phải học thêm mới làm được. Các nhóm thường gặp: đồng bộ dữ liệu và xử lý xung đột; realtime nhiều người; chạy nền hoặc theo vị trí; nhận dạng hoặc xử lý ảnh, âm thanh; thuật toán gợi ý, lập lịch hay tối ưu; tương tác sâu với hệ điều hành; ghép nhiều nguồn dữ liệu công khai; LLM có xử lý thêm (truy xuất trên dữ liệu của người dùng, thao tác được trên dữ liệu app, trích xuất có cấu trúc).
   - **Cấp 3 (quá sức):**
     - cần dữ liệu độc quyền, tự train mô hình lớn, phần cứng riêng, thanh toán thật hoặc vấn đề pháp lý;
     - vi phạm điều khoản hoặc chính sách nền tảng (xem mục Rào cản nền tảng ở Bước 3b);
     - kiểm duyệt quy mô lớn;
     - **cần mật độ người dùng mới có giá trị** (báo cáo cộng đồng, feed, matching).

     Riêng việc "nhiều code" thì không còn tính là quá sức.
   - **Cách thử nhanh:** không viết được phần kỹ thuật trong một dòng thì yêu cầu đó là cấp 0–1.
   - **Mức yêu cầu:**
     - Cấp 0–1 không được tính là điểm khác biệt, chỉ ghi vào mục "làm kèm".
     - Cần 3–4 điểm khác biệt, trong đó ít nhất 3 điểm ở cấp 2.
     - Nên có 1 điểm "chủ lực": ghép từ 2 kỹ thuật cấp 2 trở lên, hoặc là bản thu nhỏ của một ý cấp 3 mà vẫn giữ được ý (ghi rõ đã thu nhỏ thế nào).
     - Ý cấp 3 không thu nhỏ được thì loại.
6. **Không phụ thuộc AI.**
   - Trong 3–4 điểm khác biệt, tối đa 1 điểm được cần AI để hoạt động.
   - Điểm đó phải có đường lùi khi AI không dùng được: vẫn làm thủ công được, hoặc có cách không dùng AI cho kết quả kém hơn nhưng vẫn dùng được. Ghi rõ đường lùi.
   - Điểm chủ lực không được là điểm cần AI, trừ khi user đã chấp nhận app phụ thuộc AI.
   - Phân biệt hai loại: mô hình chạy ngay trên máy (MediaPipe, Whisper on-device, ML Kit) không có dịch vụ ngoài để sập, không quota, không tốn tiền server; còn gọi API hay server GPU thì có. Nỗi lo "AI đứt là app đứt" chủ yếu nhắm vào loại thứ hai. Ghi rõ điểm khác biệt thuộc loại nào.
7. **Giải thích được vì sao app gốc chưa làm.**
   - Khó hoặc tốn công → tốt.
   - Xung đột mô hình kinh doanh (vd: lưu cục bộ thì mất doanh thu từ gói cloud) → **điểm cộng cho khả năng có người dùng**, nhưng ghi rõ đây không phải điểm kỹ thuật.
   - Chỉ do chưa ưu tiên, làm một buổi là xong → coi như cấp 0.

**Nâng cấp từ than phiền.** Một yêu cầu vặt có thể là triệu chứng của một nỗi đau lớn hơn. Khi nhiều review cùng than một yêu cầu vặt, hỏi "vì sao họ cần cái này" để tìm nỗi đau gốc, rồi mới nghĩ giải pháp cho nỗi đau đó. Được phép đề xuất giải pháp cấp 2 cho nỗi đau gốc, nhưng vẫn phải trích được các review gốc, và giải pháp vẫn phải qua cửa 3 và 4.

**Xếp hạng** các điểm còn lại theo thứ tự:
1. Người dùng cảm nhận được rõ, và đánh trúng lý do chuyển app.
2. Mức độ chưa phổ biến.
3. Độ khó, điểm chủ lực trước.
4. Độ mạnh của bằng chứng.
5. Có demo được trong 2 phút không.

## Bước 3b: Tìm điểm nổi bật "wow" từ nghiên cứu
Điểm khác biệt đi từ review thường là cải tiến từng bước: đúng nhưng ai nghe cũng thấy "đã có người làm". Khi user muốn một điểm nổi bật khiến người xem phải "wow", làm thêm bước này sau Bước 3, trong đúng loại app đã chọn.

**Sự thật cần nói với user trước:** một ý vừa dùng công nghệ chưa ai dùng, vừa làm được bằng thư viện có sẵn trong vài tháng, gần như không tồn tại. Thứ làm được là ý **hiếm**, **chưa có ở thị trường hoặc nền tảng của user** (vd: chỉ có bản web hoặc iOS ở nước ngoài, chưa có trên Android cho người Việt), và có **khoảnh khắc demo** rõ. Không hứa ý "chưa ai làm ở đâu cả".

**Nguồn ý (tìm có hệ thống, không brainstorm từ trí nhớ):**
1. **Nghiên cứu gần đây:** WebSearch bài báo 1–3 năm gần nhất (CHI, UIST, Interspeech, arXiv, MDPI…) về đúng nỗi đau đã có bằng chứng ở Bước 3. Tìm hệ thống mẫu đã chạy được nhưng chưa thành sản phẩm.
2. **Năng lực mới của nền tảng và thư viện:** MediaPipe Tasks, ML Kit, model mã nguồn mở chạy trên máy hoặc server rẻ, API Android mới. Ghép với nỗi đau đã có bằng chứng, không ghép với nỗi đau tự nghĩ.
3. **Tính năng đã có ở nơi khác:** web, iOS, desktop, thị trường khác, nhưng chưa có trên nền tảng hoặc thị trường của user.

Chạy song song 5–8 WebSearch cho các hướng khác nhau trong cùng một lượt.

**5 cửa lọc**, ghi kết quả từng ý vào một bảng (giữ / giữ có điều kiện / loại):
1. **Wow:** người xem hiểu và phản ứng trong 10 giây demo. Viết câu giới thiệu không thuật ngữ.
2. **Khả thi:** có thư viện hoặc model sẵn, chạy được trên máy tầm trung hoặc server rẻ. Kiểm tra giấy phép model (MIT/Apache dùng được; CC-BY-NC chỉ phi thương mại). Ý chỉ có ở mức nghiên cứu, phải tự dựng mô hình hoặc phần cứng thì loại. Ý mà bài báo làm trên thiết bị khác (webcam laptop, cảm biến chuyên dụng) thì nói rõ khoảng cách khi đưa lên điện thoại và cách thu nhỏ.
3. **Rào cản nền tảng** (bắt buộc kiểm tra, đây là chỗ ý "nghe hay" hay chết):
   - điều khoản của nguồn nội dung: YouTube cấm tải video/audio và API chỉ cho lấy phụ đề video của chính mình; nội dung có DRM chặn thu âm thanh;
   - chính sách Play: AccessibilityService chỉ cho mục đích trợ năng; quyền vị trí nền, quyền đọc SMS hoặc thông báo cần giải trình; nội dung AI tạo ra phải có cơ chế báo cáo; dữ liệu sinh trắc (giọng, khuôn mặt) phải khai báo;
   - phần cứng: tính năng chỉ chạy trên máy cao cấp (vd: Gemini Nano) không làm lõi được;
   - chi phí server khi có người dùng thật.
4. **Chưa có trên Play:** `search` trên Play với vài cách diễn đạt, kèm WebSearch. Có ở web/iOS nước ngoài thì vẫn giữ nhưng ghi rõ "đã có ở X, chưa có trên Android/VN". Đã có app Android làm tốt thì loại.
5. **App vẫn chạy khi tính năng này lỗi:** ghi đường lùi.

**Ý giữ có điều kiện** phải kèm một thử nghiệm đo được trong 1–2 tuần đầu (đo gì, trên máy nào, ngưỡng nào thì giữ). Ngưỡng chốt trước khi thử.

**Xuất ra:** bảng lọc (kể cả ý đã loại và lý do, có link nguồn), 1 điểm chủ lực, 1 điểm thử thách nếu có, điểm phụ rẻ, và kế hoạch thử nghiệm. Gợi ý user phân mỗi điểm cho một thành viên sở hữu, và ghi lại số liệu đo cùng các phương án đã bỏ để dùng cho báo cáo và phỏng vấn.

## Bước 4: Lọc và đề xuất
Áp ràng buộc của user, sau đó xuất ra:
1. **Phễu:** số app quét, sau lọc cơ học, GIỮ, cỡ M/L, số loại app, các loại user chọn, số app đã đào review. Kèm tiêu chí lọc và đường dẫn file dữ liệu (scan, dump, themes) để user kiểm tra lại. Nếu đã làm Bước 3b, kèm bảng lọc 5 cửa và kế hoạch thử nghiệm.
2. **2–3 ứng viên** từ các loại app user đã chọn. Mỗi ứng viên gồm:
   - **App gốc:** tên, appId, link, lượt tải, số sao, cỡ lõi.
   - **Nguồn:** BXH nào, hạng mấy, hoặc tìm thấy từ đâu ở Bước 3.
   - **Ai dùng & vì sao:** 3 câu trả lời ở Bước 2, kèm review "lý do chuyển app" và số 👍 từ `tally`.
   - **Phần clone (MVP):** 6–10 màn hình hoặc tính năng lõi; ghi rõ phần này chạy đủ khi không có AI.
   - **3–4 điểm khác biệt.** Mỗi điểm theo thứ tự:
     - câu giới thiệu cho người dùng (cửa 3);
     - bằng chứng: trích review, số 👍 và số review cùng chủ đề từ `tally`;
     - độ phổ biến: đã tìm ở đâu, đã có ở app nào chưa (cửa 4);
     - cấp độ khó và phần kỹ thuật;
     - có cần AI không, đường lùi là gì;
     - vì sao app gốc chưa làm.

     Đánh dấu điểm chủ lực, và gắn nhãn "làm đúng hơn" nếu nguồn gốc là bug.
   - **Làm kèm:** các yêu cầu cấp 0–1 rẻ, làm thêm cho app trông chỉn chu.
   - **Rủi ro:** cần backend gì, dữ liệu lấy từ đâu, demo cần điều kiện gì.
3. **Bảng so sánh:** cỡ lõi · có giá trị khi chỉ nhóm nhỏ dùng · lý do chuyển app · kênh tìm người dùng đầu tiên · người dùng cảm nhận được · mức chưa phổ biến · số điểm cấp 2 · số điểm cần AI · độ mạnh bằng chứng · demo 2 phút.
4. **Những yêu cầu nhiều 👍 nhưng bị loại**, kèm cửa đã trượt: sai loại, đặc thù, người dùng không cảm nhận được, đã phổ biến, quá vặt, quá sức, hoặc phụ thuộc AI.

Bằng chứng mỏng thì nói thẳng là mỏng. Phần phân loại app, chấm cỡ lõi và gom chủ đề review là đánh giá của LLM, nên nói rõ điều đó và đề nghị user soát lại các ca ở ranh giới.
