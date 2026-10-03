---
name: doc2md
description: Chuyển tài liệu (PDF bài lab, PDF slide, PPTX/PPT, DOCX/DOC, XLSX, ảnh chụp/scan trang sách, thư mục ảnh trang sách) sang Markdown để đọc tốn ít token nhất. LUÔN dùng skill này — không tự mở PDF/ảnh/slide bằng Read, không tự chọn docling/marker/pymupdf4llm/markitdown — mỗi khi cần đọc, tóm tắt, học, làm bài, trả lời câu hỏi từ một tài liệu, hoặc khi user nói "chuyển sang markdown", "đọc file này", "convert to markdown", "read this PDF/slide/scan/docx".
---

# doc2md

Một lệnh duy nhất, tự chọn công cụ theo loại file (đã benchmark trên tài liệu của user):

| Loại | Công cụ | Ghi chú |
|---|---|---|
| PDF có lớp chữ (lab, slide) | docling, không OCR | bảng tốt; cấp tiêu đề theo số mục; sửa thứ tự trang 2 cột, danh sách lồng nhau, code dồn dòng |
| `.pptx` / `.ppt` / `.odp` | LibreOffice → PDF → như trên; slide bị docling xáo được Gemini chép lại cả slide | mô tả được sơ đồ vẽ bằng shape; `<!-- trang N -->` = số slide (trừ khi có slide ẩn) |
| `.docx` / `.doc` | bộ đọc DOCX của docling (bảng nguyên vẹn, giữ số đề mục 1.2.1) + mô tả ảnh | `--fast-office` = markitdown |
| `.xlsx` | openpyxl (ngày theo định dạng hiển thị của ô, mô tả ảnh nhúng) | |
| PDF scan, ảnh `.jpg/.png`, thư mục ảnh | Gemini free chép từng trang + chép đối chứng bằng model thứ 2 | sai ~0,4% ký tự |
| Ảnh, sơ đồ, công thức, bảng (kể cả dạng ảnh) trong PDF | Gemini free mô tả/chép; bảng docling được đối chiếu với bản Gemini | ảnh lặp/trang trí bị bỏ, có cache |

> Sửa skill/script? Đọc `BAO-CAO.md` cạnh file này trước — mục 8–11 giải thích lý do từng quyết định (đã đo), mục 7 liệt kê lỗi đã gặp. Sau mỗi lần sửa script: kiểm không có ký tự backspace (`chr(8)`).

## Quy trình

1. Nếu cạnh file gốc đã có `<tên>.md` mở đầu bằng `<!-- doc2md:` → đọc file đó luôn, không chuyển lại.
2. Chạy (Bash, `timeout: 600000`; tài liệu > 40 trang thì `run_in_background`):
   ```bash
   uv run --script ~/.claude/skills/doc2md/doc2md.py "<đường dẫn file hoặc thư mục ảnh>"
   ```
   **Không dùng `--no-vision` và `--no-verify` khi user không yêu cầu rõ** (hai cờ này tắt lớp kiểm tra, bảng/số liệu có thể sai).
   Output chỉ vài dòng tóm tắt: đường dẫn `.md`, số ký tự/token, số ảnh đã mô tả, các trang bị gắn ⚠.
3. Đọc file `.md`. File lớn: xem dàn ý trước bằng `grep -n "^#" file.md`, rồi chỉ đọc đoạn cần (offset/limit). Trích dẫn trang theo `<!-- trang N -->` / `<!-- slide N -->`.
4. Ảnh: khối `> **[Sơ đồ]** \`x_assets/p012_ab12.png\`` là mô tả do model free viết — đủ để hiểu ý chung. Chỉ mở file ảnh bằng Read khi task phụ thuộc chi tiết chính xác trong ảnh (số liệu, nhãn, chiều mũi tên phải chép lại) hoặc khối có dấu ⚠.
   **Ngoại lệ BẮT BUỘC — ảnh giao diện:** khối `[Ảnh giao diện — BẮT BUỘC XEM ẢNH …]` CỐ Ý chỉ có **1 câu tóm tắt** (màn hình nào, vài thành phần chính) — đủ để biết ảnh nào là màn hình nào, KHÔNG đủ để làm gì khác. Đây là kết quả mẫu của bài lab, user cần clone **y hệt** (bố cục, màu, icon, khoảng cách, chữ).
   - Task code / clone / sửa giao diện: liệt kê bằng `grep -n "BẮT BUỘC XEM ẢNH" file.md`, rồi **Read từng ảnh của màn hình đang làm TRƯỚC khi code**.
   - Cần BẤT KỲ chi tiết nào trên giao diện (chữ trên nút, số liệu, thứ tự thành phần, trạng thái…) dù chỉ để trả lời câu hỏi: mở ảnh. Câu tóm tắt chỉ dùng để chọn đúng ảnh cần mở.
5. Định dạng gắn lại từ bản gốc — đọc đúng nghĩa: `~~…~~` = bản gốc **gạch ngang** (nhận định sai/bị loại bỏ — KHÔNG coi là đúng); `<u>…</u>` = gạch chân (thường là khóa chính); `**…**` = in đậm hoặc chữ màu nhấn mạnh trong câu.
6. Rà soát: script đã tự kiểm (đối chiếu chữ và bảng với PDF gốc, Gemini soát chéo từng trang/slide, trang scan chép 2 lần bằng 2 model rồi so). Trang bị nghi có khối `> ⚠ Trang này …` kèm đường dẫn ảnh trang và danh sách lỗi / các chỗ 2 model chép khác nhau (`«bản chính» ≠ «bản đối chứng»`).
   - Chỉ khi task **dùng tới** trang đó: Read ảnh trang gốc, sửa đúng phần bị báo bằng Edit, rồi xóa khối ⚠ (để lần sau khỏi xem lại). Trang không dùng tới thì bỏ qua. Khoảng một nửa cảnh báo soát chéo là báo nhầm — coi ⚠ là "nên xem", không phải "chắc chắn sai".
   - KHÔNG chép lại/viết lại cả file, KHÔNG đọc lại toàn bộ PDF/ảnh gốc. Gặp chỗ sai khác khi đang làm thì sửa đúng chỗ đó bằng Edit.
   - **Văn bản chính thức scan (quyết định, danh sách, bảng điểm):** khi task cần tên/mã/số cụ thể, mở ảnh trang và kiểm các ô bị gắn «A» ≠ «B» — đo thực tế: mọi chỗ sai đều nằm ở các ô bị gắn cờ (sai ~1–2% ô với model free). Đừng tin bản chép ở các ô đó.
7. Tóm tắt có `⚠ Lớp chữ có vẻ hỏng` (PDF lỗi font: đầy `�`, `(cid:N)`, dòng lặp) → chạy lại với `--force-scan`.
8. Tóm tắt có `⚠ LỖI` (API lỗi/hết quota) → báo user và chạy lại sau; các trang/ảnh đã xong được cache, không tốn quota lại.

## Tùy chọn

- `--out file.md` — đổi nơi lưu (mặc định cạnh file gốc, ảnh vào `<tên>_assets/`).
- `--fast-office` — pptx/docx dùng markitdown (nhanh hơn nhiều) thay vì đi qua PDF; mất sơ đồ vẽ bằng shape (pptx) và số đề mục tự động (docx).
- `--via-pdf` — ép office (xlsx…) đi qua PDF → docling.
- `--force-scan` — PDF có lớp chữ hỏng/lỗi font → chép lại từ ảnh trang bằng Gemini.
- `--no-verify` — bỏ soát chéo Gemini và chép đối chứng (nhanh hơn, đỡ request); vẫn giữ các bước kiểm 0-request (định dạng, đối chiếu chữ, đối chiếu bảng).
- `--no-vision` — không gọi API (ảnh bị bỏ qua, scan không chép được).

## Khi nào phải mở ảnh gốc thay vì tin file .md

- Ảnh giao diện: luôn mở khi code/clone (xem bước 4).
- Văn bản chính thức scan (tên, mã, số): kiểm các ô bị gắn «A» ≠ «B».
- Bảng phức tạp (tiêu đề nhiều tầng, biểu mẫu, rubric, bảng xoay ngang, bảng tiếng Nhật): ô có thể lệch cột — cần giá trị chính xác thì mở ảnh trang.
- Sơ đồ: mô tả đúng ý chung, chiều mũi tên/phân cấp có thể sai — cần đúng cấu trúc thì mở ảnh.
- Slide bố cục thẻ/SmartArt, trang web in ra dạng thẻ: nhãn có thể tách khỏi nội dung.

## Giới hạn đã biết

- Tiêu đề không đánh số đều là `##`; một số PDF bị dính chữ tiếng Việt ("chếquản").
- Mô tả ảnh có thể sai chi tiết nhỏ (chiều mũi tên, nhãn); model KHÔNG tự báo khi không chắc — soát chéo bắt được một phần.
- Bố cục "nhãn | nội dung" trên slide được gộp thành `**BT1**: …` khi đủ điều kiện; ca lệch độ cao vẫn có thể tách.
- Nếu cạnh file gốc đã có `.md` không do doc2md tạo, kết quả được ghi vào `<tên>.doc2md.md` (không ghi đè).
- Quota: Gemini free 500 request/ngày cho mỗi model (`gemini-3.5-flash-lite`, `gemini-3.1-flash-lite`) mỗi project; key lấy từ `d:\luu\ccfree-backup\.env` (`GEMINI_API_KEY*`, `DASHSCOPE_API_KEY`; bỏ các dòng sau `// chết`), đổi đường dẫn bằng biến môi trường `DOC2MD_ENV`. Tự xoay vòng key/model, cuối cùng là `qwen3-vl-plus`.
- Lần chạy đầu sau khi xóa cache uv sẽ tải lại thư viện (~2–3 phút).
