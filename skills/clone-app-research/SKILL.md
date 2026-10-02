---
name: clone-app-research
description: Tìm đề tài app mobile theo kiểu "clone một app tầm trung đang có + thêm vài điểm khác biệt nhỏ", dựa trên dữ liệu thật (bảng xếp hạng Google Play, review người dùng, thread thảo luận) thay vì tự nghĩ ra ý tưởng rồi search để xác nhận. Dùng khi user nhờ tìm đề tài/ý tưởng app, đồ án mobile, chọn app để clone, hoặc hỏi nên thêm tính năng gì cho nổi bật. Also: pick an existing app to clone, find differentiating features from app reviews.
---

# Clone app research

Mục tiêu KHÔNG phải startup hay tìm vấn đề lớn chưa ai giải. Mục tiêu là tìm một app đang có người dùng thật, đủ nhỏ để clone trong đồ án, cộng thêm 3–4 điểm khác biệt có độ khó thật, xuất phát từ nhu cầu mà chính người dùng của app đó đang nêu.

Mặc định giả định nhóm 5 người, có dùng agent AI để code, nên khối lượng và độ khó được phép cao. Nếu user nêu ràng buộc nhỏ hơn (ít người, ít thời gian) thì hạ mức yêu cầu ở mục Tiêu chí chọn điểm khác biệt cho phù hợp.

## Luật cứng
- Chưa chạy Bước 1 thì không được nêu app hay đề tài nào lấy từ trí nhớ. Mọi ứng viên phải xuất hiện trong dữ liệu (bảng xếp hạng, kết quả search, similar) hoặc trong một thread đã mở.
- Né ông lớn: loại app của Google, Meta, Microsoft, Apple, Amazon, ByteDance, OpenAI, Anthropic… Script đã lọc sẵn theo tên nhà phát triển nhưng không lọc hết, phải tự loại tiếp. Cũng loại app nhà nước, ngân hàng, app cần dữ liệu độc quyền, phần cứng riêng hoặc thanh toán thật.
- Điểm khác biệt nào đề xuất ra cũng phải trích được review hoặc thread thật (kèm appId hoặc link, và số 👍). Không trích được thì không đề xuất.
- Ràng buộc của user (yêu cầu môn học, thời gian, số người, stack) chỉ dùng để lọc ở Bước 3. Nếu trong repo có file yêu cầu đồ án thì đọc nó.

## Công cụ
`node <thư mục skill>/scripts/gplay.mjs <lệnh>` (dùng thư viện google-play-scraper; thư mục skill là "Base directory for this skill" hiện khi skill được nạp). Nếu `scripts/node_modules` chưa có (lần đầu hoặc sau khi plugin cập nhật) thì chạy `npm ci --prefix <thư mục skill>/scripts` trước. Mặc định thị trường VN, tiếng Việt. Đặt `GP_COUNTRY=us GP_LANG=en` để xem thị trường US.
- `top <CATEGORY> [num]`: top free của category, đã lọc ông lớn, mất khoảng 2 giây. Category viết hoa, vd PRODUCTIVITY, EDUCATION, HEALTH_AND_FITNESS, FOOD_AND_DRINK, LIFESTYLE, FINANCE, TRAVEL_AND_LOCAL, SPORTS, MUSIC_AND_AUDIO, BOOKS_AND_REFERENCE, SHOPPING, PHOTOGRAPHY, TOOLS, PARENTING, HOUSE_AND_HOME, EVENTS.
- `search "<từ khóa>" [num]`, `similar <appId>`: tìm app cùng loại hoặc app đối thủ.
- `info <appId...>`: lượt tải, số đánh giá, ngày cập nhật, link. Chỉ dùng cho ứng viên đã chọn, vì mỗi app mất khoảng 1–2 giây.
- `reviews <appId> [num=2000]`: in các review xin thêm hoặc chê thiếu tính năng, cùng review 1–2★, sắp theo số 👍.

## Bước 1: Quét rộng, chưa chọn gì
- Chạy `top` cho ít nhất 8 category khác nhau, có cả những category mà bản thân thấy "không hay". Ghi lại các category đã quét.
- Bổ sung bằng WebSearch và mở thread thật: "alternative to <app>", "app nào để…", "looking for an app that", Reddit, Voz, Tinhte. Mục đích là xem người dùng đang so sánh hoặc chê app nào.
- Từ dữ liệu, chọn 8–12 ứng viên theo tiêu chí:
  - Có người dùng thật nhưng không phải ông lớn. Tham khảo khoảng 100K–10M lượt tải, kiểm tra bằng `info`.
  - Tính năng lõi làm được trong đồ án: CRUD, auth, backend hoặc Firebase, API công khai, camera, bản đồ, thông báo, realtime.
  - Đủ nhiều review để đào dữ liệu.
  - Đào review xong mà chỉ ra yêu cầu cấp 0–1 (xem mục Tiêu chí) thì ứng viên đó yếu, đổi app khác.

## Bước 2: Đào review từng ứng viên
- Chạy `reviews <appId>` rồi đọc review. Phân loại theo Maalej & Nabil (2015): bug report, feature request, user experience, rating.
  - Chỉ feature request và than phiền về trải nghiệm mới thành được điểm khác biệt.
  - Bug của app gốc chỉ có nghĩa là "mình làm đúng hơn", là điểm yếu hơn.
- Gom thành chủ đề, đếm số review và tổng 👍 của mỗi chủ đề. Chủ đề chỉ có 1 review với 0👍 là tín hiệu yếu, phải ghi rõ như vậy.
- Nhiều 👍 không có nghĩa là thành điểm khác biệt. Gom xong thì đưa từng chủ đề qua mục Tiêu chí chọn điểm khác biệt.
- Chạy `similar` để kiểm tra đối thủ: nếu app khác đã có tính năng đó thì vẫn đề xuất được, nhưng ghi rõ "đã có ở X".

## Tiêu chí chọn điểm khác biệt
Nhiều người xin chưa đủ để thành điểm khác biệt. Mỗi chủ đề phải qua lần lượt 4 cửa. Trượt cửa nào thì loại, và ghi vào mục "đã loại" kèm lý do.

1. **Đúng loại.** Loại ngay các nhóm sau:
   - xin bỏ quảng cáo, giảm giá, mở khóa premium;
   - xin thêm nội dung hoặc dữ liệu (thêm bài hát, công thức, đề thi…);
   - tích hợp một bên thứ ba cụ thể cần hợp tác (ngân hàng X, ví Y);
   - bug.
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
   - **Cấp 3 (quá sức):** cần dữ liệu độc quyền, tự train mô hình lớn, phần cứng riêng, thanh toán thật hoặc vấn đề pháp lý, kiểm duyệt quy mô lớn, hoặc phải đông người dùng mới có giá trị. Riêng việc "nhiều code" thì không còn tính là quá sức.
   - **Cách thử nhanh:** không viết được phần kỹ thuật trong một dòng thì yêu cầu đó là cấp 0–1.
   - **Mức yêu cầu:**
     - Cấp 0–1 không được tính là điểm khác biệt, chỉ ghi vào mục "làm kèm".
     - Cần 3–4 điểm khác biệt, trong đó ít nhất 3 điểm ở cấp 2.
     - Nên có 1 điểm "chủ lực": ghép từ 2 kỹ thuật cấp 2 trở lên, hoặc là bản thu nhỏ của một ý cấp 3 mà vẫn giữ được ý (ghi rõ đã thu nhỏ thế nào).
     - Ý cấp 3 không thu nhỏ được thì loại.
4. **Giải thích được vì sao app gốc chưa làm.**
   - Khó hoặc tốn công → tốt.
   - Xung đột mô hình kinh doanh (vd: cho xuất dữ liệu thì mất lock-in) → vẫn được, nhưng ghi rõ đây không phải điểm kỹ thuật.
   - Chỉ do chưa ưu tiên, làm một buổi là xong → coi như cấp 0.

**Nâng cấp từ than phiền.** Một yêu cầu vặt có thể là triệu chứng của một nỗi đau lớn hơn. Ví dụ, nhiều review nói "hay quên nhập" thì giải pháp có thể là tự nhập từ thông báo. Được phép đề xuất giải pháp cấp 2 cho nỗi đau đó, nhưng vẫn phải trích được các review gốc.

**Xếp hạng** các điểm còn lại theo thứ tự: độ khó (điểm chủ lực trước) → độ mạnh của bằng chứng → có demo được trong 2 phút không.

## Bước 3: Lọc và đề xuất
Áp ràng buộc của user, sau đó xuất ra:
1. Các category và từ khóa đã quét.
2. 3–5 ứng viên. Mỗi ứng viên gồm:
   - **App gốc:** tên, appId, link, lượt tải, số sao.
   - **Phần clone (MVP):** 6–10 màn hình hoặc tính năng lõi.
   - **3–4 điểm khác biệt:** mô tả → bằng chứng (trích review, số 👍, số review cùng chủ đề) → cấp độ khó + phần kỹ thuật → vì sao app gốc chưa làm. Đánh dấu điểm chủ lực.
   - **Làm kèm:** các yêu cầu cấp 0–1 rẻ, làm thêm cho app trông chỉn chu.
   - **Rủi ro:** cần backend gì, dữ liệu lấy từ đâu.
3. Bảng so sánh các ứng viên.
4. Những app đã loại và lý do loại.
5. Những yêu cầu nhiều 👍 nhưng bị loại, kèm lý do: sai loại, đặc thù, quá vặt, hoặc quá sức.

Bằng chứng mỏng thì nói thẳng là mỏng.
