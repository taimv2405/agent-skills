---
name: clone-app-research
description: Tìm đề tài app mobile theo kiểu "clone một app tầm trung đang có + thêm vài điểm khác biệt nhỏ", dựa trên dữ liệu thật (bảng xếp hạng Google Play, review người dùng, thread thảo luận) thay vì tự nghĩ ra ý tưởng rồi search để xác nhận. Dùng khi user nhờ tìm đề tài/ý tưởng app, đồ án mobile, chọn app để clone, hoặc hỏi nên thêm tính năng gì cho nổi bật. Also: pick an existing app to clone, find differentiating features from app reviews.
---

# Clone app research

Mục tiêu KHÔNG phải startup hay tìm vấn đề lớn chưa ai giải. Mục tiêu là tìm một app đang có người dùng thật, đủ nhỏ để clone trong đồ án, cộng thêm 2–3 điểm khác biệt nhỏ mà chính người dùng của app đó đang xin.

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
  - Tính năng lõi làm được trong đồ án: CRUD, lưu cục bộ hoặc Firebase, API công khai, camera, bản đồ, thông báo.
  - Đủ nhiều review để đào dữ liệu.

## Bước 2: Đào review từng ứng viên
- Chạy `reviews <appId>` rồi đọc review. Phân loại theo Maalej & Nabil (2015): bug report, feature request, user experience, rating.
  - Chỉ feature request và than phiền về trải nghiệm mới thành được điểm khác biệt.
  - Bug của app gốc chỉ có nghĩa là "mình làm đúng hơn", là điểm yếu hơn.
- Gom thành chủ đề, đếm số review và tổng 👍 của mỗi chủ đề. Chủ đề chỉ có 1 review với 0👍 là tín hiệu yếu, phải ghi rõ như vậy.
- Chạy `similar` để kiểm tra đối thủ: nếu app khác đã có tính năng đó thì vẫn đề xuất được, nhưng ghi rõ "đã có ở X".

## Bước 3: Lọc và đề xuất
Áp ràng buộc của user, sau đó xuất ra:
1. Các category và từ khóa đã quét.
2. 3–5 ứng viên. Mỗi ứng viên gồm:
   - **App gốc:** tên, appId, link, lượt tải, số sao.
   - **Phần clone (MVP):** 4–6 màn hình hoặc tính năng lõi.
   - **2–3 điểm khác biệt:** mô tả → bằng chứng (trích review, số 👍, số review cùng chủ đề) → độ khó.
   - **Rủi ro:** cần backend gì, dữ liệu lấy từ đâu.
3. Bảng so sánh các ứng viên.
4. Những app đã loại và lý do loại.

Bằng chứng mỏng thì nói thẳng là mỏng.
