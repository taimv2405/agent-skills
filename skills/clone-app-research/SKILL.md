---
name: clone-app-research
description: Tìm đề tài app mobile theo kiểu "clone một app đang có người dùng thật + thêm 3–4 điểm khác biệt có độ khó thật", chọn từ toàn bộ bảng xếp hạng Google Play và review người dùng, không tự nghĩ chủ đề rồi đi search để xác nhận. Ứng viên phải có lõi đủ lớn cho nhóm và có lý do để ít nhất một nhóm người dùng cụ thể chọn bản clone. Dùng khi user nhờ tìm đề tài/ý tưởng app, đồ án mobile, chọn app để clone, hoặc hỏi nên thêm tính năng gì cho nổi bật. Also: pick an existing app to clone, find differentiating features from app reviews.
---

# Clone app research

Mục tiêu không phải startup hay tìm vấn đề lớn chưa ai giải. Mục tiêu là tìm một app đang có người dùng thật và chọn được phần clone thỏa ba điều kiện:
- **Lõi đủ lớn cho nhóm.**
- **3–4 điểm khác biệt có độ khó thật**, xuất phát từ nhu cầu mà người dùng của chính app đó đang nêu.
- **Ít nhất một nhóm người dùng cụ thể có lý do chọn bản của nhóm** thay vì app gốc. Kỳ vọng số người dùng phải lớn hơn 0.

Mặc định giả định nhóm 5 người, có dùng agent AI để code, nên lõi nhắm tới cỡ L (xem Bước 1) và độ khó được phép cao. Nếu user nêu ràng buộc nhỏ hơn (ít người, ít thời gian) thì hạ cỡ lõi xuống M và hạ mức yêu cầu ở mục Tiêu chí chọn điểm khác biệt.

## Luật cứng
- **Ứng viên phải đến từ dữ liệu quét toàn bộ ở Bước 1.** Không tự nghĩ chủ đề hay từ khóa rồi lấy ứng viên từ kết quả search. Cách đó chỉ tìm được bằng chứng cho định kiến có sẵn. `search` và `similar` chỉ dùng sau khi đã có ứng viên, để tìm đối thủ hoặc app cùng loại. Mỗi ứng viên phải ghi nguồn: nằm ở BXH nào, hạng mấy.
- Chưa chạy Bước 1 thì không được nêu app hay đề tài nào lấy từ trí nhớ.
- Tiêu chí lọc phải được viết ra trước khi xem kết quả quét.
- **Không né ông lớn theo tên nhà phát triển.** App của Google, Meta, Microsoft… vẫn chọn được, miễn qua Bước 2. Thay vào đó, loại theo bản chất app:
  - Giá trị chỉ có khi đông người dùng: báo cáo cộng đồng, feed đại chúng, ghép người lạ.
  - Cần dữ liệu hoặc nội dung độc quyền.
  - Cần đối tác: người bán, tài xế, nhà hàng.
  - Cần phần cứng riêng.
  - Cần thanh toán thật, hoặc vướng pháp lý.
  - App ngân hàng, app nhà nước.
- Điểm khác biệt nào đề xuất ra cũng phải trích được review hoặc thread thật (kèm appId hoặc link, và số 👍). Không trích được thì không đề xuất.
- Ràng buộc của user (yêu cầu môn học, thời gian, số người, stack) chỉ dùng để lọc ở Bước 4. Nếu trong repo có file yêu cầu đồ án thì đọc nó.

## Công cụ
Thư mục skill là "Base directory for this skill", hiện ra khi skill được nạp. Nếu `scripts/node_modules` chưa có (lần đầu hoặc sau khi plugin cập nhật) thì chạy `npm ci --prefix <thư mục skill>/scripts` trước. Các script dùng thư viện google-play-scraper. Mặc định thị trường VN, tiếng Việt. Đặt `GP_COUNTRY=us GP_LANG=en` để xem thị trường US.

**Quét toàn bộ:**
- `node scripts/scan_all.mjs <out.json> [50]`: quét mọi category ứng dụng (trừ game, watch face, thư viện) × VN/US × top free/top grossing, lấy chi tiết từng app (lượt tải, số đánh giá, thể loại). Kết quả khoảng 4000 app, mất khoảng 5 phút. Nên chạy nền và ghi file vào scratchpad.
- `node scripts/filter_scan.mjs <scan.json> [--min-installs 100000] [--min-ratings 2000] [--chunks N --out <dir>]`: lọc cơ học theo tiêu chí cố định, gồm loại cứng ngân hàng/nhà nước/phần cứng/thanh toán, không có trần lượt tải. In danh sách theo category. Dùng `--chunks` để chia thành N file giao cho subagent.

**Từng app** (`node scripts/gplay.mjs <lệnh>`):
- `top <CATEGORY> [num]`, `search "<từ khóa>" [num]`, `similar <appId>`: không lọc ông lớn, trừ khi thêm `--no-giants`.
- `info <appId...>`: lượt tải, số đánh giá, ngày cập nhật, link.
- `reviews <appId> [num=2000] [--sort newest|helpful]`: in ba nhóm review, sắp theo số 👍:
  - review xin thêm hoặc chê thiếu tính năng;
  - than phiền giá/quảng cáo/paywall;
  - review 1–2★ khác.
  Dòng đầu cho biết khoảng thời gian mà các review trải ra.
- `count <appId> "<regex>" [num] [--sort ...]`: đếm số review khớp một chủ đề và tổng 👍. Dùng lệnh này khi gom chủ đề, không đếm tay.

## Bước 1: Quét toàn bộ, chưa chọn gì
1. Chạy `scan_all.mjs`, rồi `filter_scan.mjs` với tiêu chí đã viết sẵn.
2. **Phân loại thủ công từng app** còn lại (thường khoảng 2500 app) vào nhóm GIỮ hoặc một mã loại:
   - **NOIDUNG:** giá trị nằm ở kho nội dung (phim, nhạc có bản quyền, truyện, tin, đề thi, khóa học).
   - **DOITAC:** marketplace, giao đồ, đặt xe, khách sạn, thương hiệu bán lẻ.
   - **PHANCUNG:** app đi kèm thiết bị.
   - **RAC:** tiện ích rác hoặc clone hàng loạt (cleaner, remote, đèn pin, prank, wallpaper, launcher, downloader, app chỉ bọc AI).
   - **GHEPNGUOILA:** dating, livestream, chat với người lạ.
   - **QUATAM:** lõi là mô hình lớn tự train hoặc hạ tầng nặng (dịch máy, chatbot thuần, tìm kiếm web, bản đồ toàn cầu tự dựng).
   - **KHAC:** ghi rõ lý do.

   App chat, cộng đồng, cộng tác **demo được với một nhóm nhỏ** thì vẫn GIỮ.
3. Với app GIỮ, chấm **cỡ lõi** cho bản clone MVP 6–10 màn hình:
   - **S:** 1–2 người làm vài tuần, CRUD một vai trò.
   - **M:** nhiều module, có backend/đồng bộ, hoặc có xử lý media/bản đồ.
   - **L:** nhiều vai trò, hoặc realtime nhiều người, cộng backend thật và nhiều module.
4. Danh sách dài thì chia bằng `--chunks` cho nhiều subagent làm song song. Đưa cho subagent nguyên văn bảng mã và thang cỡ lõi ở trên, yêu cầu trả về danh sách đầy đủ app GIỮ (appId, lượt tải, số đánh giá, cỡ, loại app, một câu mô tả lõi clone) và 3 ví dụ cho mỗi mã loại.
5. Gom app GIỮ theo **loại app**, vì nhiều app trùng lõi. Xếp hạng các loại theo tổng số đánh giá của các app cùng loại trong BXH.
6. Ghi lại phễu: tổng số app quét → sau lọc cơ học → GIỮ → số app cỡ M/L → ứng viên.
7. WebSearch và thread (Reddit, Voz, Tinhte, "alternative to <app>") chỉ dùng để bổ sung bằng chứng cho các loại app đã có trong danh sách.

## Bước 2: Ai sẽ dùng bản của nhóm
Chỉ xét các loại app có cỡ lõi đúng mức nhắm tới. Mỗi loại phải trả lời được 3 câu, **trượt câu 1 thì loại**:
1. **Chỉ một người hoặc một nhóm nhỏ dùng thì có giá trị không?** App mà giá trị chỉ có khi đông người dùng thì gần như chắc chắn 0 người dùng. Ví dụ: báo cáo giao thông cộng đồng, mạng xã hội đại chúng, ghép người lạ.
2. **Người dùng có lý do gì để bỏ app gốc, mà app gốc khó làm theo?** Lý do mạnh nhất là khi nó xung đột với mô hình kinh doanh của app gốc: gói cloud thu phí, quảng cáo, giới hạn bản miễn phí, ép dùng AI trên cloud. Bằng chứng lấy từ nhóm review giá/quảng cáo/paywall mà `reviews` in ra.
3. **10–50 người dùng đầu tiên đến từ đâu?** Ví dụ: lớp hoặc trường của nhóm, gia đình các thành viên, cộng đồng self-host, nhóm theo sở thích.

Với app lớn, một nỗi đau nhiều 👍 vẫn chưa đủ để người dùng rời app gốc. Phải chỉ ra được một chỗ đứng hẹp mà app gốc không phục vụ, hoặc không thể phục vụ.

## Bước 3: Đào review từng ứng viên
- Chạy `reviews <appId>`, đọc review, rồi phân loại theo Maalej & Nabil (2015): bug report, feature request, user experience, rating.
  - Feature request và than phiền về trải nghiệm thì thành được điểm khác biệt.
  - Than phiền về giá/quảng cáo không thành điểm khác biệt kỹ thuật, nhưng ghi vào mục **lý do chuyển app** để dùng cho câu 2 ở Bước 2.
  - Bug của app gốc là tín hiệu yếu ("mình làm đúng hơn"). Ngoại lệ ở cửa 1, mục Tiêu chí.
- **App rất lớn:** 2000 review mới nhất chỉ trải trong 1–3 tuần, toàn bug của bản cập nhật gần nhất. Phải chạy thêm `--sort helpful`.
- Gom thành chủ đề, dùng `count` để đếm số review và tổng 👍 của mỗi chủ đề. Chủ đề chỉ có 1 review với 0👍 là tín hiệu yếu, phải ghi rõ như vậy.
- Nhiều 👍 chưa đủ để thành điểm khác biệt. Gom xong thì đưa từng chủ đề qua mục Tiêu chí chọn điểm khác biệt.
- Kiểm tra đối thủ bằng `similar`, `search`, hoặc các app cùng loại trong danh sách GIỮ. Nếu app khác đã có tính năng đó thì vẫn đề xuất được, nhưng ghi rõ "đã có ở X".
- Đào review xong mà chỉ ra yêu cầu cấp 0–1 thì ứng viên yếu, đổi loại app khác trong danh sách.

## Tiêu chí chọn điểm khác biệt
Nhiều người xin chưa đủ để thành điểm khác biệt. Mỗi chủ đề phải qua lần lượt 4 cửa. Trượt cửa nào thì loại, và ghi vào mục "đã loại" kèm lý do.

1. **Đúng loại.**
   - **Loại khỏi điểm khác biệt:**
     - xin thêm nội dung hoặc dữ liệu (thêm bài hát, công thức, đề thi…);
     - tích hợp một bên thứ ba cụ thể cần hợp tác (ngân hàng X, ví Y).
   - **Không loại hẳn, chuyển sang mục lý do chuyển app:** xin bỏ quảng cáo, giảm giá, mở khóa premium.
   - **Bug:** chỉ được đề xuất khi cách giải là một kiến trúc cấp 2 (offline-first, upload resumable, kết nối lại tự động…). Khi đó gắn nhãn "làm đúng hơn" và nói rõ nguồn gốc là bug.
2. **Không quá đặc thù.** Phải là nhu cầu của nhóm người dùng chính, không phải của một nghề, một vùng hay một dòng máy. Cần ít nhất 2 review độc lập cùng chủ đề, hoặc 1 review ≥10👍.
3. **Độ khó đủ cao.** Chấm theo cấp:
   - **Cấp 0 (vặt):** thêm tùy chọn, nút hay cài đặt; dark mode, cỡ chữ, sắp xếp, lọc, xuất CSV, thêm trường vào form.
   - **Cấp 1 (thường):** màn hình CRUD mới, thống kê hoặc biểu đồ từ dữ liệu sẵn có, nhắc nhở theo giờ cố định, bọc một chatbot LLM đơn thuần.
   - **Cấp 2 (đáng làm):** gọi tên được một phần kỹ thuật thật, ví dụ:
     - offline-first có đồng bộ và xử lý xung đột; realtime nhiều người;
     - chạy nền hoặc geofence;
     - OCR hoặc nhận dạng on-device bằng thư viện có sẵn;
     - tự nhập dữ liệu từ thông báo, SMS hoặc share intent;
     - thuật toán gợi ý, lập lịch hay tối ưu;
     - xử lý ảnh hoặc âm thanh;
     - widget hay tương tác sâu với hệ thống;
     - ghép nhiều API công khai;
     - LLM có xử lý thêm: RAG trên dữ liệu của người dùng, tool calling thao tác được trên dữ liệu app, trích xuất có cấu trúc.
   - **Cấp 3 (quá sức):**
     - cần dữ liệu độc quyền, tự train mô hình lớn, phần cứng riêng, thanh toán thật hoặc vấn đề pháp lý;
     - kiểm duyệt quy mô lớn;
     - **cần mật độ người dùng mới có giá trị** (báo cáo cộng đồng, feed, matching).

     Riêng việc "nhiều code" thì không còn tính là quá sức.
   - **Cách thử nhanh:** không viết được phần kỹ thuật trong một dòng thì yêu cầu đó là cấp 0–1.
   - **Mức yêu cầu:**
     - Cấp 0–1 không được tính là điểm khác biệt, chỉ ghi vào mục "làm kèm".
     - Cần 3–4 điểm khác biệt, trong đó ít nhất 3 điểm ở cấp 2.
     - Nên có 1 điểm "chủ lực": ghép từ 2 kỹ thuật cấp 2 trở lên, hoặc là bản thu nhỏ của một ý cấp 3 mà vẫn giữ được ý (ghi rõ đã thu nhỏ thế nào).
     - Ý cấp 3 không thu nhỏ được thì loại.
4. **Giải thích được vì sao app gốc chưa làm.**
   - Khó hoặc tốn công → tốt.
   - Xung đột mô hình kinh doanh (vd: ghi hình cục bộ thì mất doanh thu từ gói cloud) → **điểm cộng cho khả năng có người dùng**, nhưng ghi rõ đây không phải điểm kỹ thuật.
   - Chỉ do chưa ưu tiên, làm một buổi là xong → coi như cấp 0.

**Nâng cấp từ than phiền.** Một yêu cầu vặt có thể là triệu chứng của một nỗi đau lớn hơn. Ví dụ, nhiều review nói "hay quên nhập" thì giải pháp có thể là tự nhập từ thông báo. Được phép đề xuất giải pháp cấp 2 cho nỗi đau đó, nhưng vẫn phải trích được các review gốc.

**Xếp hạng** các điểm còn lại theo thứ tự:
1. Điểm vừa là kỹ thuật cấp 2 vừa đánh trúng lý do chuyển app.
2. Độ khó, điểm chủ lực trước.
3. Độ mạnh của bằng chứng.
4. Có demo được trong 2 phút không.

## Bước 4: Lọc và đề xuất
Áp ràng buộc của user, sau đó xuất ra:
1. **Phễu:** số app quét, sau lọc cơ học, GIỮ, cỡ M/L, ứng viên. Kèm tiêu chí lọc và đường dẫn file dữ liệu để user kiểm tra lại.
2. **3–5 ứng viên.** Mỗi ứng viên gồm:
   - **App gốc:** tên, appId, link, lượt tải, số sao, cỡ lõi.
   - **Nguồn:** BXH nào, hạng mấy; loại app đứng hạng mấy theo tổng đánh giá.
   - **Ai dùng & vì sao:** 3 câu trả lời ở Bước 2, kèm review "lý do chuyển app" và số 👍.
   - **Phần clone (MVP):** 6–10 màn hình hoặc tính năng lõi.
   - **3–4 điểm khác biệt:** mô tả → bằng chứng (trích review, số 👍, số review cùng chủ đề) → cấp độ khó + phần kỹ thuật → vì sao app gốc chưa làm. Đánh dấu điểm chủ lực, và gắn nhãn "làm đúng hơn" nếu nguồn gốc là bug.
   - **Làm kèm:** các yêu cầu cấp 0–1 rẻ, làm thêm cho app trông chỉn chu.
   - **Rủi ro:** cần backend gì, dữ liệu lấy từ đâu, demo cần điều kiện gì.
3. **Bảng so sánh:** cỡ lõi · có giá trị khi chỉ nhóm nhỏ dùng · lý do chuyển app · app gốc khó làm theo không · kênh tìm người dùng đầu tiên · độ mạnh bằng chứng · số điểm cấp 2 · demo 2 phút.
4. **Những loại app đã loại và lý do**, gồm cả lý do trượt Bước 2.
5. **Những yêu cầu nhiều 👍 nhưng bị loại**, kèm lý do: sai loại, đặc thù, quá vặt, hoặc quá sức.

Bằng chứng mỏng thì nói thẳng là mỏng. Phần phân loại và chấm cỡ lõi là đánh giá thủ công, nên nói rõ điều đó và đề nghị user soát lại các ca ở ranh giới.
