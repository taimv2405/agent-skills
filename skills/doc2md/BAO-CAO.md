# Báo cáo: so sánh công cụ chuyển tài liệu sang Markdown

*Thực hiện 02–03/10/2026 trên máy của bạn. Mọi con số dưới đây là đo thật, không lấy từ tài liệu của các tool.*

## 1. Mục tiêu

Tìm cách chuyển tài liệu học tập (PDF lab, PDF slide, PPT/PPTX, ảnh chụp trang sách) sang Markdown **đủ tốt để Claude hiểu tài liệu**, với **ít quota Claude nhất**, và **lần nào cũng làm cùng một cách**.

Ràng buộc:

- Gói Claude Pro.
- Máy không có GPU: i5-7200U, 2 nhân/4 luồng, 12 GB RAM.
- Không chấp nhận chạy qua đêm. Khoảng 10 phút cho 128 trang là chấp nhận được.
- Được phép gửi tài liệu lên API miễn phí.

## 2. Bộ test và cách chấm

**Tài liệu test:**

| Nhóm | Tài liệu |
|---|---|
| PDF lab | LAB01 (14 trang), LAB05 (10 trang đầu) |
| PDF slide | Navigation (20 trang đầu, và đủ 128 trang để đo tốc độ), SE104 Chương 4 (15 trang), IS402 Buổi 1 (15 trang) |
| File mẫu kiểm thử của bạn | `d:\luu\file.pdf` (6 trang): tiêu đề nhiều cấp, 2 cột, bảng tiêu đề gộp, bảng không viền, công thức, sơ đồ |
| PowerPoint | IE402 Buổi 4 (`.pptx`, 30 slide), SE104 Chương 2 (`.ppt`, 38 slide) |
| Ảnh scan | 4 trang sách GIS (022 bảng, 045, 100 sơ đồ ER, 154 bản đồ) và 1 trang sách phạt nguội (062) |

**Cách chấm:**

- **Ảnh scan:** CER (tỉ lệ ký tự sai) so với bản đã chép tay có sẵn trong thư mục sách.
- **PDF có chữ:**
  - Tỉ lệ chữ giữ được, so với text do pdfminer trích. Ban đầu tôi dùng PyMuPDF làm chuẩn, nhưng PyMuPDF bị dính chữ tiếng Việt trên một số PDF nên thiên vị pymupdf4llm. Tôi đã đổi chuẩn và chấm lại.
  - Đếm số tiêu đề, danh sách, bảng.
  - **Đọc tận mắt** các chỗ khó: bảng tiêu đề gộp, sơ đồ CSDL, bảng trên slide.
- **Thời gian:** đo trên máy bạn. Mỗi lúc chỉ chạy một tool để không tranh CPU.

## 3. Kết quả từng công cụ (PDF có chữ)

### 3.1. pymupdf4llm 1.28.2

| Option | Thời gian (lab01) | Nhận xét |
|---|---|---|
| mặc định (layout) | 15,6 giây | Tự OCR ảnh chụp màn hình bằng tiếng Anh, ra chữ rác (`a F CL > aa`). Chữ thừa +46% |
| `--no-layout` | 3,4 giây | Đủ chữ nhưng mất cấu trúc. Bảng tiêu đề gộp thành `Col2`; không nhận bảng không viền |
| `--opt force_text=false` | 15,1 giây | Hết chữ rác, nhưng **bỏ mất chữ trong sơ đồ vector** (bảng SINHVIEN/PHIEUDANGKY) |
| **`--ocr-mode never`** | **7,6 giây** | Bản tốt nhất: giữ chữ trong sơ đồ, không rác, cấp tiêu đề và danh sách lồng nhau đẹp nhất |
| `--office` (pptx) | — | Cần PyMuPDF Pro, phải trả phí |

**Điểm yếu còn lại:**

- Bảng tiêu đề gộp bị cắt đôi chữ (`Nhóm thôn | g số`).
- Không nhận bảng trên slide.
- Dính chữ tiếng Việt trên slide Navigation ("cơ chếquản lý"). Chỉ giữ được 78,6% chữ so với chuẩn pdfminer.

### 3.2. docling 2.130.0

| Option | Thời gian | Nhận xét |
|---|---|---|
| mặc định (có OCR) | lab01 **357 giây**, se104c4 202 giây | Chậm gấp 4–5 lần mà không tốt hơn |
| `--no-ocr` (CLI) | lab01 79 giây, 15–20 trang 50–77 giây | Bảng tốt. Tiêu đề đều là `##`, danh sách bị dàn phẳng, `&` thành `&amp;` |
| `--no-ocr --table-mode fast` | lab01 71 giây; **đủ 128 trang: 318 giây, RAM ~3,2 GB** | Bảng như bản accurate trên các file test |
| `--no-tables` | lab01 58 giây | Mất bảng, không đáng |
| `--pipeline native` | 21–32 giây | Ra text trơn, không cấu trúc. Loại |
| Python SDK (nạp mô hình 1 lần) | lab01 31 giây, file mẫu 27 giây | Nhanh gấp đôi CLI |
| `heading_hierarchy` (đủ tín hiệu) | — | Đoán theo cỡ chữ ra cả `#######`, ngược cấp |
| **`heading_hierarchy` chỉ theo số mục** | — | `1.`→`##`, `2.1.`→`###`, `2.1.1.`→`####` đúng. Tiêu đề không số giữ `##` |
| + mô tả ảnh qua API (SDK) | +~10 giây | Mô tả slide sơ đồ CSDL **hoàn hảo** (đúng khóa ghép, chiều tham chiếu) |
| PPTX | 20 giây | Không có dấu phân cách slide, lỗi `&amp;` |

**Điểm mạnh:** bảng tốt nhất. Bảng tiêu đề gộp được làm phẳng thành `Nhóm thông số - Đại lượng`, bảng không viền đúng. Đúng như bạn nhận xét lúc test.

**Điểm yếu:**

- Bỏ chữ trong sơ đồ vector. Mô tả ảnh bằng API bù được.
- Trang 2 cột có chỗ sai thứ tự đoạn.
- Công thức hiển thị thành `formula-not-decoded`. doc2md bù bằng API.

### 3.3. marker 2.0.0

| Option | Thời gian | Nhận xét |
|---|---|---|
| mặc định (có OCR) | lab01 **1.003 giây**, file mẫu 522 giây | Quá chậm |
| `--disable_ocr` | lab01 **30,6 giây**, file mẫu 35,5 giây, 15–20 trang slide 32–38 giây | Nhanh ngang docling. Cấp tiêu đề lộn xộn. Bảng tiêu đề gộp **lệch cột**. Bảng trên slide Navigation **tốt nhất** nhưng cắt mất dòng thứ 2 trong ô ("…Notifications /" thiếu "Profile") |
| `--disable_ocr --use_llm` (Gemini) | 46–62 giây | LLM **sửa đúng** bảng tiêu đề gộp. Mô tả ảnh viết tiếng Anh; **bỏ mất hẳn slide sơ đồ CSDL** |

*Lần đầu tôi loại marker vì "chậm", nhưng đó là do tôi chạy nhầm cấu hình có OCR, và bạn đã phát hiện ra. Kết luận đó đã được sửa.*

### 3.4. markitdown 0.1.8

| Đầu vào | Thời gian | Nhận xét |
|---|---|---|
| PDF | 4–6 giây | Không có tiêu đề; câu văn bị cắt vụn thành bảng giả. Loại cho PDF |
| **PPTX** | **2–5 giây** | Đủ chữ, đúng thứ tự, có `<!-- Slide number -->`, hỗ trợ mô tả ảnh qua API (Python) |
| DOCX | 2 giây | Tốt, nhưng **không** mô tả ảnh trong docx |

### 3.5. Chưa test

- **mineru:** bản cài là v4, cần bật server cục bộ (mô hình nặng, không GPU) hoặc dịch vụ mineru.net cần token.
- **docling VLM pipeline cục bộ:** quá nặng cho CPU này.

## 4. API đọc ảnh miễn phí (ảnh scan sách + mô tả ảnh)

**Chép 5 trang scan.** CER chỉ tính phần chữ, không tính phần mô tả hình:

| Model | CER trung bình | Thời gian/trang | Ghi chú |
|---|---|---|---|
| **gemini-3.5-flash-lite** | **0,4%** | ~5 giây | Bảng 1.9 chỉ sai 1 chữ. Mô tả ảnh tốt nhất (9/9 ảnh phân loại đúng) |
| gemini-3.1-flash-lite | 1,1% | ~7 giây | Chủ yếu khác khoảng trắng; 1 lỗi thật ("nền tạo"→"nạo") |
| qwen3-vl-plus (DashScope) | 0,5% | ~9 giây | Bảng chính xác nhất. Mô tả ảnh có 2 lỗi (chiều quan hệ ER, vị trí bản đồ) |
| Qwen3-VL-235B (HuggingFace) | 0,5% | ~13 giây | Free chỉ ~$0,1/tháng |
| gemini-2.5-flash | 9,9% | ~16 giây | **Bỏ dở nửa trang mà không báo lỗi.** Nguy hiểm |
| Cloudflare llama-4-scout / mistral-small | 8–10% | ~15 giây | **Bịa nội dung trông rất hợp lý** |
| Groq / OpenRouter / Mistral / OpenCode / LLM7 / NVIDIA | — | — | Hết quota, bị chặn, hoặc quá chậm |

**Phát hiện quan trọng:**

- Không model nào tự gắn cờ "cần người xem ảnh", kể cả khi mô tả sai. Ý tưởng để AI tự báo chỗ nó không chắc là không dùng được.
- OCR chạy trên máy (Tesseract/RapidOCR trong pymupdf4llm/docling, Surya trong marker) chậm và kém hơn hẳn API.
- **Quota Gemini free** (theo AI Studio của bạn) tính **riêng từng model, riêng từng project**. `3.5-flash-lite` và `3.1-flash-lite` mỗi model 500 request/ngày; các model Flash khác 20 request/ngày. Với 2 project là khoảng **2.000 trang/ngày**.
- **DashScope:** 1 triệu token miễn phí mỗi model trong 90 ngày, chỉ endpoint Singapore.

## 5. Kết luận

**Không có công cụ nào thắng ở mọi loại tài liệu**, nên mỗi loại dùng công cụ mạnh nhất cho loại đó:

| Loại tài liệu | Chọn | Lý do |
|---|---|---|
| PDF có lớp chữ | **docling** (SDK, không OCR, table fast, heading theo số mục) + Gemini mô tả ảnh và chép công thức | Bảng tốt nhất. Điểm yếu (sơ đồ, công thức) được API bù |
| PDF scan, ảnh chụp trang | **Gemini flash-lite** chép thẳng | CER 0,4%, ~5 giây/trang, không tốn CPU |
| PPTX | **markitdown** + Gemini mô tả ảnh | Nhanh, phân tách slide |
| DOCX | markitdown; nếu có ảnh thì qua PDF rồi docling | markitdown không mô tả ảnh trong docx |
| PPT/DOC/XLS | LibreOffice đổi định dạng trước | Cả 3 tool không đọc trực tiếp |

**Vì sao không chọn tool khác làm chính:**

- **pymupdf4llm:** nhanh nhất, tiêu đề đẹp nhất, nhưng thua ở bảng và dính chữ tiếng Việt.
- **marker:** giỏi bảng trên slide, nhưng làm mất sơ đồ và bảng tiêu đề gộp lệch cột khi không có LLM.

## 6. Công cụ đã làm: skill `doc2md`

**Cách dùng:**

- **Trong Claude:** nói "đọc / chuyển file X". Skill tự kích hoạt.
- **Ngoài Claude (0 quota):** `doc2md "đường-dẫn"` trong PowerShell/cmd. Đầu vào là file hoặc thư mục ảnh trang sách.

**Output:**

- `<tên>.md` cạnh file gốc, có `<!-- trang N -->` / `<!-- slide N -->`.
- `<tên>_assets/` chứa ảnh có nội dung.
- In ra một tóm tắt vài dòng.
- Không ghi đè file `.md` do người khác làm; khi đó kết quả ghi sang `<tên>.doc2md.md`.

**Một PDF có chữ đi qua các bước sau:**

1. Đếm chữ từng trang. Trang có dưới 50 ký tự là trang scan. Nếu ≥ 50% số trang là scan thì cả file đi đường scan.
2. docling phân tích bố cục: đoạn văn, tiêu đề, bảng, ảnh, công thức. Bảng có lớp chữ được TableFormer chuyển thẳng thành bảng Markdown, **không tốn API**.
3. Mỗi **ảnh** (raster, hoặc vùng sơ đồ vector được docling nhận là ảnh):
   - Bỏ nếu là icon/quá nhỏ.
   - Bỏ nếu trùng ảnh đã xử lý.
   - Còn lại gửi Gemini để phân loại và xử lý:
     - `diagram` → khối + mũi tên.
     - `chart` → trục, chú giải, xu hướng, số liệu.
     - `text` → chép nguyên văn (ảnh chụp code/bảng → khối code/bảng Markdown).
     - `ui` → màn hình + chữ trên giao diện.
     - `photo` → mô tả ngắn.
     - `decorative` → bỏ.
   - Kết quả là khối `> **[Sơ đồ]** `assets/...png`` đặt đúng chỗ ảnh.
4. **Bảng là ảnh chụp** (docling ra bảng 0 ô) → cắt vùng đó, Gemini chép thành bảng, rồi điền lại vào đúng vị trí.
5. **Công thức** docling không đọc được → cắt vùng, Gemini chép LaTeX.
6. **Trang scan lẫn trong PDF có chữ** → bỏ kết quả docling của trang đó, Gemini chép cả trang.

**Thời gian đo bằng bản cuối:**

| File | Thời gian | Kết quả |
|---|---|---|
| Slide Navigation 128 trang | 10,6 phút | 264 ảnh → 150 request (110 ảnh trùng), ~40k token |
| LAB01 14 trang | 67 giây | 26 ảnh → 12 mô tả |
| File mẫu của bạn 6 trang | ~41 giây | 4 bảng, công thức khôi phục, trang 6 scan chép đủ |
| `.ppt` 38 slide | 31 giây | |
| `.pptx` 30 slide | 2 giây | |
| 1 trang scan | 4 giây | |
| PDF scan 3 trang | ~15–50 giây | Tùy API có phải thử lại không |

Chạy lại một file đã chạy: không tốn request nhờ cache. Lần chạy đầu sau khi cài mất thêm 2–3 phút để tải thư viện.

**File:**

- `~/.claude/skills/doc2md/SKILL.md`, `doc2md.py`, `BAO-CAO.md` (file này).
- `~/.local/bin/doc2md.cmd`.
- Skill `docling` cũ đã chuyển sang `~/.claude/skills-backup/docling/`.

## 7. Giới hạn và việc chưa làm

**Giới hạn đã biết:**

- docling:
  - Trang 2 cột đôi khi sai thứ tự đoạn.
  - Tiêu đề không đánh số đều là `##`.
  - Header lặp mỗi trang đôi khi bị nhận nhầm là tiêu đề.
  - Một số PDF bị dính chữ tiếng Việt.
- Sơ đồ vẽ bằng vector mà docling **không** nhận là ảnh: nhãn chữ ra thành đoạn rời, không được mô tả.
- markitdown (pptx): dòng xuống mềm bị dính chữ ("NHẬP MÔNCÔNG NGHỆ"). Sơ đồ vẽ bằng shape chỉ ra chữ rời; dùng `--via-pdf` để được mô tả.
- Ảnh/dải chữ quá mỏng (cạnh < 24 px) bị bỏ hẳn. Ví dụ dòng chú thích nằm trong ảnh bảng.
- Mô tả ảnh và chép scan có thể sai chi tiết nhỏ (~0,4–1% ký tự). Model **không** tự báo khi không chắc.

**Chưa test:**

- `.xlsx`.
- Trọn một cuốn sách ~190 trang. Theo tính toán, chạy hết khoảng 13–15 phút và nằm trong quota.
- Slide 128 trang sau các bản sửa cuối (bảng dạng ảnh, trang scan lẫn, rà soát mục 9) mới chỉ chạy trên 20 trang đầu.

**Lỗi đã gặp và sửa trong lúc làm** (để không lặp lại):

| Lỗi | Hậu quả | Sửa |
|---|---|---|
| Test marker với OCR bật | Kết luận sai "marker chậm" | Test lại với `--disable_ocr` |
| Bản chuẩn chấm điểm lấy bằng PyMuPDF | Thiên vị pymupdf4llm | Đổi sang pdfminer |
| Ảnh chụp bảng thành bảng 0 ô trong docling | Mất bảng, không báo gì | Bước 4 ở mục 6 |
| Trang scan trong PDF có chữ | Mất hết chữ, chỉ còn bảng/công thức | Bước 6 ở mục 6 |
| Hạ ngưỡng ảnh nhỏ xuống quá thấp | Gemini bịa chữ cho dải 280×17 px | Lùi ngưỡng cạnh ngắn về 24 px |
| Không rà soát output | Mất gạch ngang/gạch chân → AI tin nhận định sai | Mục 9, lớp 1 |
| Lớp 1 gắn `**` vào trong code | Hỏng code (`**id: '1'**`) | Bỏ qua vùng code |
| docling dồn khối code thành 1 dòng | Code khó đọc | Lấy lại từ lớp chữ PDF |
| docling xáo cột bảng trên slide | Bảng sai nghĩa (nav tr.13, 18) | Đối chiếu mọi bảng theo vị trí ô |
| Soát chéo báo nhầm 34/76 trang | Cảnh báo mất giá trị | Prompt + `severity` + 3 bộ lọc → ~7/76 |
| Lớp 1 gắn định dạng giữa từ ("A<u>i dùng…</u>") | Hỏng chữ | Chỉ gắn trọn từ; tiêu đề chỉ gạch ngang |
| Lớp 1 in đậm cả dòng chữ màu trên slide | 97 chỗ nhiễu | Chỉ khi là một phần dòng → 6 chỗ |
| Soát chéo trang scan | Không bắt câu bị xóa, rất ồn | Thay bằng chép 2 model rồi so (mục 10) |
| PPTX qua markitdown mất sơ đồ vẽ bằng shape | Mất nội dung | Mặc định đi qua PDF |
| Sắp 2 cột nhầm trên slide chữ + ảnh điện thoại | Mô tả ảnh nhảy lên trước chữ | Mỗi cột phải có ≥ 2 khối chữ |
| In đậm lấp lửng trong link | Link khó đọc | Không gắn định dạng trong vùng link |
| docling mất "Ví dụ: <link>" trên slide | Mất link code mẫu | Khôi phục từ lớp chữ + URI của PDF |
| docling chỉ nhận 1/4 ảnh điện thoại trên slide | Mất 3 ảnh giao diện | Đối chiếu ảnh nhúng của PDF, mô tả bổ sung |
| docling xuất ảnh lệch thứ tự trái→phải | Mô tả ảnh sai vị trí | Xếp lại khối ảnh theo toạ độ |
| Bộ lọc header nuốt lỗi có chữ "đầu trang" | Mất cảnh báo thật (ca D) | Chỉ lọc header/footer/logo/số trang |
| `` thành backspace khi vá bằng heredoc | Regex hỏng lặng lẽ | Kiểm chr(8) sau mỗi lần vá |
| Server surya của marker chạy ngầm từ lượt test cũ | docling chậm gấp đôi | Tắt; ghi cách kiểm ở mục 12.4 |
| docling gộp 2 ảnh điện thoại thành 1 hình | Mô tả trước không khớp, gọi API thừa | Ghép mô tả ảnh con |
| Xếp lại ảnh dồn MỌI khối ảnh về chỗ ảnh đầu tiên | LAB04: ảnh dồn lên đầu trang, tách khỏi câu mô tả (bạn phát hiện) | `place_pictures()`: đặt từng ảnh theo toạ độ thật, trước khối chữ đầu tiên nằm thấp hơn |
| docling xuất cả danh sách rồi mới tới ảnh | Ảnh nằm sau câu không liên quan | Như trên: không dựa vào thứ tự docling |
| Chèn ảnh từ dưới lên trước cùng một mốc | 4 ảnh cùng hàng bị đảo phải->trái | Chèn xuôi |
| `inside()` không chặn giao âm (âm×âm=dương) | Logo bị ghép mô tả ảnh điện thoại, thừa 1 khối | `max(0, …)` |

## 8. Giải thích thiết kế: vì sao script/skill làm như vậy

> Dành cho session sau sửa skill. Mỗi mục: **cái gì**, rồi **vì sao**. Đừng "dọn dẹp" những chỗ này nếu chưa đo lại.

### 8.1. Đóng gói và chạy

- **Script uv độc lập (khối `# /// script` ở đầu), pin `docling==2.130.0`, `markitdown==0.1.8`.**
  - Vì sao một môi trường riêng: script cần docling + markitdown + pypdfium2 trong cùng một tiến trình. Các bản cài qua `uv tool` nằm ở những môi trường tách biệt.
  - Vì sao pin version: API Python của docling (`HeadingHierarchyOptions`, `PictureMeta`, `DescriptionMetaField`, `export_to_markdown(page_no=…)`) thay đổi giữa các bản. Muốn nâng version thì test lại `userfile.pdf`, `lab01`, bảng dạng ảnh và trang scan.
- **Dùng docling qua Python SDK, không gọi CLI.**
  - Nhanh gấp đôi vì mô hình chỉ nạp 1 lần (lab01: 31 giây so với 71 giây).
  - CLI không có `heading_hierarchy` và không cho gắn mô tả ảnh tự làm.
- **`logging.disable`, `TQDM_DISABLE`, chỉ in vài dòng tóm tắt.** Mọi thứ in ra stdout đều vào context của Claude và tốn quota.
- **`sys.stdout.reconfigure(encoding="utf-8")`.** Console Windows mặc định không in được tiếng Việt, sẽ crash ở `print`.
- **`doc2md.cmd` trong `~/.local/bin`.** Để bạn chạy ngoài Claude (0 quota). Git Bash không tự chạy file `.cmd`, nên `SKILL.md` gọi thẳng `uv run --script …`.

### 8.2. Các option của docling

- **`do_ocr=False`.** OCR chậm gấp 4,5 lần (lab01: 357 giây so với 79 giây) và đọc tiếng Việt kém. Trang scan đã có Gemini lo.
- **`TableFormerMode.FAST`.** Trên các file test cho kết quả giống hệt `accurate`, nhanh hơn khoảng 10%.
- **`HeadingHierarchyOptions(enabled=True, use_style=False, use_font_style=False)`.**
  - Mặc định docling cho mọi tiêu đề cùng là `##`.
  - Bật đủ tín hiệu (cỡ chữ) thì sinh `#######`, ngược cấp, biến header trang thành tiêu đề.
  - Chỉ dùng bookmark + số mục (`2.1.1.`) thì đúng và không bao giờ tệ hơn mặc định.
  - **Không** bật `generate_parsed_pages`: chỉ cần cho tín hiệu cỡ chữ, mà tín hiệu đó đã tắt. Bỏ đi thì output giống hệt và đỡ RAM.
- **`generate_picture_images=True, images_scale=2.0`.** Cần ảnh cắt sẵn từng hình để gửi Gemini. Scale 2 để chữ trong hình đủ nét.
- **Không dùng `PictureDescriptionApiOptions` có sẵn của docling** mà tự gọi API, vì cần:
  - Xoay vòng nhiều key/model khi bị giới hạn.
  - Cache.
  - Bỏ ảnh trùng và ảnh trang trí.
  - Prompt tiếng Việt có phân loại `TYPE`.
- **Gắn mô tả bằng chuỗi `@@FIG@@<json>@@END@@` vào `pic.meta.description`, xuất xong mới thay bằng khối `>`.** Bộ xuất markdown của docling tự escape (`&amp;`, `\_`) và tự định dạng mô tả. Chèn đánh dấu rồi thay sau thì kiểm soát được hoàn toàn định dạng và gắn được đường dẫn ảnh. Cũng vì thế mà có bước `html.unescape` + bỏ `\_` trong `tidy()`.
- **Xuất từng trang (`export_to_markdown(page_no=…)`).** Để chèn `<!-- trang N -->` cho việc trích dẫn số trang.
- **`image_placeholder=""`.** Bỏ dòng rác `<!-- image -->`.

### 8.3. Các lỗ hổng của docling khi tắt OCR và cách vá

- **Bảng 0 ô → cắt vùng gửi Gemini → `set_table()` điền lại `TableData`.**
  - docling nhận ảnh chụp bảng là "bảng" (không phải ảnh). Không OCR thì bảng không có chữ, và khi xuất **biến mất không báo gì**.
  - Phát hiện qua file test `mixtest.pdf` dựng từ ảnh bảng của file mẫu.
  - Điền vào `TableData` thay vì chèn text để bảng nằm đúng vị trí.
- **Công thức `formula-not-decoded` → cắt vùng gửi Gemini (prompt LaTeX).** Model công thức của docling (`--enrich-formula`) chạy CPU rất chậm.
- **Trang scan trong PDF có chữ (< 50 ký tự lớp chữ) → Gemini chép cả trang, thay output docling của trang đó.** docling không OCR chỉ ra các khung rỗng. Trang 6 của file mẫu mất hết chữ trước khi sửa. Ảnh/bảng/công thức trên các trang này bị loại khỏi các bước khác (`on_scan`) để không tốn request hai lần.
- **Render vùng cắt bằng pypdfium2 (scale 3), tuần tự, rồi mới gọi API song song.**
  - Không bật `generate_page_images` của docling: giữ ảnh mọi trang trong RAM, khoảng 800 MB cho 128 trang.
  - pdfium **không an toàn đa luồng**, nên render trước rồi mới chia luồng.
- **Ngưỡng 50 ký tự/trang và ≥ 50% trang scan thì cả file đi đường scan.** Ngưỡng tự đặt, chưa tinh chỉnh. Trang slide thật ít chữ nhất trong bộ test vẫn có > 50 ký tự.

### 8.4. Xử lý ảnh

- **Bỏ ảnh có diện tích < 4.000 px hoặc cạnh ngắn < 24 px.**
  - Đây là icon, dải trang trí.
  - Thử hạ ngưỡng thì Gemini **bịa** chữ cho dải chú thích 280×17 px ("có Dân không kể tuổi miền"). Đừng hạ thêm.
- **Bỏ ảnh trùng theo hash pixel.** Logo/nền slide lặp lại mỗi trang: slide Navigation có 110/264 ảnh trùng.
- **Prompt ảnh bắt dòng đầu `TYPE: …`, không có cờ "cần người xem".**
  - `TYPE` để định dạng khối và bỏ ảnh `decorative`.
  - Cờ `NEEDS_HUMAN_VIEW` đã thử: không model nào bật nó, kể cả khi mô tả sai. Vô dụng nên bỏ.
- **Khối ảnh luôn kèm đường dẫn file trong `_assets/`.** Để Claude mở ảnh khi thật sự cần chi tiết, theo quy tắc trong `SKILL.md`.
- **Ảnh `TYPE: ui` được gắn nhãn "BẮT BUỘC XEM ẢNH khi code/clone giao diện", tóm tắt in số ảnh, SKILL.md có quy tắc cứng phải Read trước khi code UI.**
  - Ảnh giao diện trong bài lab là **kết quả mẫu bạn phải clone y hệt**.
  - Kiểm tra LAB05 (30 ảnh giao diện): mô tả nêu đúng các trường/nút/luồng, nhưng **không có** màu (nút viền xanh có icon và nút "Add Place" nền xanh đặc), khung placeholder xám, khung đỏ đánh dấu bước, tỉ lệ và khoảng cách. Code theo mô tả sẽ không giống.
  - Vẫn giữ mô tả, vì task hỏi đáp/tóm tắt thì mô tả là đủ và không phải tốn token ảnh.
  - Ảnh lưu ở `images_scale=2` (ví dụ 803×590 px cho 3 màn hình) là đủ nét để code theo.

### 8.5. Gọi API (`class Vision`)

- **Thứ tự backend:**
  1. `gemini-3.5-flash-lite` × mọi `GEMINI_API_KEY*`.
  2. `gemini-3.1-flash-lite` × mọi key.
  3. `qwen3-vl-plus` (DashScope intl).
- **Vì sao chỉ các model này:**
  - flash-lite: 500 request/ngày mỗi model mỗi project (AI Studio của bạn); các Flash khác chỉ 20.
  - `gemini-2.5-flash` **bỏ dở nửa trang mà vẫn báo `STOP`**.
  - `gemini-3.8-flash` lỗi 503 liên tục.
  - Cloudflare bịa nội dung.
  - Groq/OpenRouter/Mistral/OpenCode/LLM7 hết quota hoặc bị chặn.
  - Chi tiết ở mục 4.
- **Key đọc từ `d:\luu\ccfree-backup\.env`, dừng ở dòng `// chết`.** Các key phía sau đã hỏng (theo bạn). Đổi file bằng biến môi trường `DOC2MD_ENV`.
- **`rpm=14`.** Giới hạn thật là 15; chừa 1 cho an toàn.
- **Chọn backend rảnh sớm nhất, ưu tiên Gemini.** Để chia tải đều 4 tổ hợp key×model, tăng tốc gấp khoảng 4 lần.
- **Phân loại lỗi:**

| Lỗi | Xử lý |
|---|---|
| 429 có chữ "per day/quota" | Bỏ backend đó trong lần chạy |
| 429 theo phút | Nghỉ 60 giây |
| 5xx / timeout | Nghỉ 20 giây |
| 4xx khác (key/model sai) | Bỏ backend |

  Mỗi yêu cầu chờ tối đa 10 phút rồi trả "⚠ chưa mô tả được".
- **Kiểm tra `finishReason`.** Bắt các trường hợp bị chặn/rỗng (SAFETY, RECITATION…). Lưu ý: nó **không** bắt được kiểu cắt ngang của 2.5-flash, vì thế mà loại model đó.
- **Cache `~/.cache/doc2md/vision_cache.jsonl`, khóa = sha1(prompt + ảnh JPEG).**
  - Chạy lại không tốn quota. Trang lỗi chạy lại sẽ chỉ gọi phần còn thiếu.
  - Đổi prompt thì cache tự vô hiệu.
  - Muốn ép làm lại: xóa file cache.
- **`temperature: 0`.** Chép nguyên văn, giảm bịa.
- **Ảnh gửi đi là JPEG chất lượng 85, cạnh dài tối đa 1.600 px (ảnh) / 2.000 px (trang).** Đủ nét để đọc chữ mà không phí token.

### 8.6. Office

- **pptx → markitdown, không qua docling.** Nhanh (2–5 giây so với 20 giây) và có `<!-- slide N -->`. docling pptx không phân tách slide và lỗi `&amp;`.
- **docx có ảnh → LibreOffice ra PDF → docling.** markitdown **không** gọi LLM cho ảnh trong docx (chỉ pptx/ảnh rời), nên ảnh docx sẽ mất.
- **`.ppt/.doc/.xls/.od*` → LibreOffice đổi sang bản mới trước.** Cả 3 tool đều không đọc định dạng cũ.
- **`_Completions`, một client giả lập `openai`, đưa vào markitdown.**
  - markitdown chỉ nhận client kiểu openai. Giả lập để khỏi cài thư viện `openai` và để ảnh pptx cũng đi qua `Vision` (xoay vòng + cache + phân loại).
  - Kết quả được nhét vào alt-text `![…]` dưới dạng **base64** (`@@FIG@@<b64>@@END@@`), vì markitdown đặt output LLM vào alt-text và làm hỏng xuống dòng/ký tự đặc biệt. Base64 đi qua nguyên vẹn, regex sau đó mới thay thành khối `>`.

### 8.7. Đầu ra

- **Dòng đầu `<!-- doc2md: … -->`.** `SKILL.md` dựa vào nó để biết file `.md` đã do doc2md tạo (khỏi chuyển lại), và script dựa vào nó để biết được phép ghi đè.
- **Không ghi đè `.md` lạ → `<tên>.doc2md.md`.** Thư mục môn học có sẵn `.md` làm tay cạnh file gốc (ví dụ `IE402_ThucHanh1_Chuong1-3.md`).
- **Cảnh báo "lớp chữ hỏng" (`�`, `(cid:N)`, một dòng lặp > 20% số dòng).** Học từ skill docling cũ. Ngưỡng tự đặt; thử trên 4 file mẫu không báo nhầm (tiêu đề slide lặp 22/426 dòng vẫn dưới ngưỡng).
- **"~N token" = số ký tự / 3.** Ước lượng thô cho tiếng Việt, chỉ để biết file to hay nhỏ.

### 8.8. Skill (`SKILL.md`)

- **Description viết rất cứng ("LUÔN… không tự mở PDF/ảnh… không tự chọn docling/marker…").** Đây chính là vấn đề ban đầu: Claude mỗi lần chọn một tool hoặc tự đọc file, rất tốn quota. Description phải đủ mạnh để thắng thói quen dùng Read với PDF.
- **"Chỉ mở ảnh khi cần chi tiết chính xác".** Mô tả đủ để hiểu ý, và model không tự báo khi sai. Mở mọi ảnh thì mất hết lợi ích tiết kiệm.
- **"Sửa đúng chỗ bằng Edit, không viết lại cả file".** Token đầu ra đắt hơn nhiều so với token đầu vào. Viết lại file thì tốn ngang chép từ đầu.
- **Gỡ skill `docling` cũ.** Description của nó cũng bắt "convert to markdown", tranh với doc2md. Đó là một nguồn của chuyện "mỗi lần một kiểu".

## 9. Rà soát tự động (không tốn quota Claude)

Bản đầu của doc2md không rà soát gì. Bạn chỉ ra rủi ro: bản gốc **gạch ngang** một nhận định để nói nó sai, chuyển sang md mất gạch ngang, AI sẽ tin là đúng. Đã kiểm chứng: docling làm mất **cả** gạch ngang, gạch chân, in đậm, chữ màu. Với môn CSDL thì không hiếm: khóa chính thường được gạch chân hoặc tô đỏ. Vì vậy thêm các lớp tự kiểm sau. Tất cả chạy trong script, chỉ áp dụng cho PDF có lớp chữ (đường docling).

| Lớp | Làm gì | Chi phí | Kết quả đo |
|---|---|---|---|
| **1. Gắn lại định dạng** (`pdf_page_info`, `apply_styles`) | PyMuPDF đọc cờ `STRIKEOUT`/`UNDERLINE`, màu, đậm từng span của PDF gốc rồi gắn `~~ ~~`, `<u> </u>`, `** **` vào đúng chỗ trong md | 0 request | File test: gạch ngang, gạch chân MaSV, chữ đỏ đều được gắn lại |
| **2. Đối chiếu chữ** (`coverage`) | Tỉ lệ từ (≥ 3 ký tự) của lớp chữ PDF có mặt trong md của trang, không xét thứ tự, bỏ header/footer lặp. Dưới `COVERAGE_MIN = 0.90` thì gắn ⚠ | 0 request | 80 trang của 6 file: không báo nhầm trang nào; ca mất chữ thật (sơ đồ khi `--no-vision`) bị bắt (6% và 24%) |
| **Đối chiếu mọi bảng** (`cmp_table`) | Mỗi bảng docling được Gemini chép lại từ ảnh, rồi so **theo vị trí ô**. Khớp ≥ `TABLE_MATCH_MIN = 0.80` thì giữ docling, lệch thì dùng bản Gemini | 1 request/bảng | Slide nav: 4/4 bảng docling bị xáo được thay, bản Gemini khớp ảnh gốc. Bảng docling đúng (file mẫu) được giữ |
| **Sửa code dồn dòng** | Khối code docling ra 1 dòng thì lấy lại vùng đó từ lớp chữ PDF (PyMuPDF `clip`) | 0 request | lab01: 2 khối code lấy lại đủ xuống dòng, thụt lề |
| **3. Gemini soát chéo** (`VERIFY_PROMPT`) | Gửi ảnh trang + md của trang, hỏi lỗi làm sai/thiếu nội dung. Lỗi về bảng thì tự chép lại bảng, lỗi khác thì gắn ⚠ kèm ảnh trang | 1 request/trang | 7 ca đã biết: bắt 4/4, không báo nhầm. Tài liệu thật: 76 trang còn ~7 trang bị gắn ⚠, khoảng một nửa là lỗi thật |
| **4. Claude** (SKILL.md bước 6) | Chỉ khi task dùng tới trang có ⚠: Read ảnh trang, sửa bằng Edit, xóa khối ⚠ | Vài nghìn token, chỉ khi cần | — |

### 9.1. Vì sao từng chi tiết như vậy

- **Đối chiếu chữ dùng "từ có mặt", không dùng cụm 3 từ liên tiếp.** Bản cụm 3 từ báo nhầm hàng loạt: sơ đồ ER chỉ khớp 43%, vì lớp chữ PDF đọc nhãn sơ đồ theo cột lộn xộn còn mô tả ảnh viết theo thứ tự khác. Lớp 2 chỉ để bắt **mất chữ**; sai thứ tự để cho lớp 3.
- **So sánh bỏ hết khoảng trắng/dấu câu.** PyMuPDF làm dính chữ tiếng Việt ở một số PDF ("chếquản"), còn docling thì không.
- **Bảng so theo vị trí ô, không theo tập hợp ô.** Ở nav trang 13, docling đặt đúng chữ nhưng sai cột, nên so tập hợp vẫn khớp 90% và bị bỏ sót. So theo vị trí thì chỉ khớp 5%.
- **Bảng không chờ soát chéo mà đối chiếu tất định.** Soát chéo dao động giữa các lần chạy: nav trang 18 lúc bị báo, lúc không, dù bảng hỏng thật.
- **Lớp 1 không đụng vào khối code.** Font code trong PDF thường đậm. Bản đầu đã gắn `**id: '1'**` vào giữa code, làm hỏng code.
- **Lớp 1 chỉ gắn `emph` cho chữ màu không phải màu template** (màu chiếm > 15% số ký tự là màu template), và cho chữ đậm **một phần dòng**. Dòng đậm trọn vẹn thường là tiêu đề/nhãn, đã nổi bật sẵn.
- **Không gạch chân link.** Link trong PDF luôn có gạch chân, không mang nghĩa "khóa chính".
- **Gạch ngang không gắn được đúng chỗ thì vẫn ghi ở cuối trang** ("⚠ Bản gốc có đoạn bị GẠCH NGANG…"), vì đây là loại sai nghĩa nguy hiểm nhất.
- **Prompt soát chéo nói rõ những gì là cố ý:** ảnh được thay bằng mô tả, bỏ header/footer/logo, trang nối câu sang trang sau, lỗi chính tả có sẵn trong bản gốc. Thiếu mấy dòng này thì Gemini báo nhầm ở 34/76 trang.
- **Mỗi lỗi phải có `severity`, chỉ giữ `high`.** Gemini hay chê trình bày (khung bảng, box công thức).
- **Ba bộ lọc cứng sau khi Gemini trả lời**, vì prompt thôi chưa đủ:
  1. `drop_boiler_issues`: bỏ lỗi nhắc tới header/footer/logo/số trang hoặc trích đúng dòng header thật của trang.
  2. `drop_false_missing`: Gemini nói "thiếu 'X'" mà X có trong md thì bỏ. Đã gặp Gemini **bịa** ("expo-dev-client" trong khi bản gốc ghi "dev-client").
  3. Bỏ lỗi kiểu "chê kiến thức của bản gốc" (từ khóa: kiến thức, chuyên ngành…) hoặc hai trích dẫn giống hệt nhau.
- **Mô tả ảnh bị báo sai thì không tự sửa, chỉ gắn ⚠.** Soát chéo vẫn có lúc nhầm; tự sửa có thể làm hỏng một mô tả đúng. Ví dụ báo đúng: se104c4 trang 13, mô tả ghi ngược chiều mũi tên DAILY → LOAIDAILY.
- **Trang scan (chép bằng Gemini) và PPTX không soát chéo.** Trang scan: cùng họ model tự soát chính mình, chưa đo hiệu quả. PPTX: markitdown không có ảnh trang.

### 9.2. Chi phí và thời gian thêm

- **Quota Claude:** 0 lúc chuyển đổi. Khối ⚠ thêm vài chục token mỗi trang bị gắn.
- **Gemini:** thêm ~1 request/trang + 1 request/bảng. Slide 128 trang: ~150 (ảnh) + 128 (soát) + ~10 (bảng) ≈ 290 request, trong quota ~2.000/ngày.
- **Thời gian:** thêm ~3–5 giây/trang chia 4 luồng; lab 14–22 trang thêm ~10–30 giây.
- **Tắt soát chéo:** `--no-verify`. Lớp 1, 2, sửa code và đối chiếu bảng vẫn chạy.

### 9.3. Giới hạn còn lại

- Soát chéo **không bắt hết** (dao động giữa các lần chạy) và **khoảng một nửa cảnh báo là nhầm**. Coi ⚠ là "nên xem", không phải "chắc chắn sai".
- Sai thứ tự 2 cột và danh sách lồng bị dàn phẳng: đã sửa ở mục 10.
- Bảng bị thay bằng bản Gemini có thể sai ~0,4% ký tự, thay vì chính xác tuyệt đối như docling. Đổi lại, cấu trúc đúng.

## 10. Lấp các chỗ còn hở của mục 9 (6 bước)

Sau mục 9 còn bốn chỗ hở: sai thứ tự 2 cột, danh sách lồng bị dàn phẳng, PPTX chưa soát, trang scan chưa soát. Khi rà lại còn thấy thêm hai chỗ: PPTX mất gạch ngang/gạch chân, và prompt chép scan không giữ định dạng. Đã làm cả sáu, theo thứ tự dưới đây.

| # | Việc | Cách làm | Kết quả đo |
|---|---|---|---|
| 1 | Prompt chép scan giữ `~~`/`<u>`/`**` | Thêm 1 dòng vào `PAGE_PROMPT` | Ảnh test: giữ gạch ngang, gạch chân MaSV, chữ đỏ. Phạm vi gạch ngang hơi hẹp hơn bản gốc |
| 2 | Định dạng cho PPTX | `pptx_styles()` đọc thuộc tính `strike`/`u`/`b`/màu của từng run (python-pptx), dùng lại `apply_styles` theo từng `<!-- slide N -->` | PPTX test: đủ 4 định dạng. DOCX **không cần**: markitdown (mammoth) đã giữ gạch ngang/gạch chân/đậm, chỉ mất màu |
| 3 | Danh sách lồng nhau | `nest_lists()`: lấy x trái của từng mục danh sách (docling bbox), gom thành cấp, thụt lề lại dòng `- ` | lab01 trang 1 và lab05 trang 22 (4 cấp `-`/`▪`/`•`/`o`) khớp bản gốc |
| 4 | Rà soát trang scan | **Chép 2 lần bằng 2 model khác nhau rồi so từng từ** (`transcribe`, `transcript_diff`), không dùng soát chéo | 5 trang có đáp án: bắt 6/6 lỗi cài (câu bị xóa, số bị sửa) và lỗi thật "trừ tượng"; bản sạch chỉ gắn ~1 chỗ/trang |
| 5 | Rà soát PPTX | `verify_pptx()`: LibreOffice → PDF lấy ảnh slide, soát chéo như PDF. Đổi **mặc định PPTX đi qua PDF** | Qua PDF: sơ đồ vẽ bằng shape được mô tả (ie402: 15 sơ đồ); cảnh báo giảm 12→10 và 6→3 |
| 6 | Thứ tự trang 2 cột | `reorder_columns()`: sắp lại `doc.body.children` của trang: khối rộng cả trang → cột trái → cột phải | File mẫu trang 2 đúng thứ tự; 109 trang lab/slide khác không bị sắp nhầm trang nào |

### 10.1. Vì sao từng chi tiết như vậy

- **Trang scan dùng "2 model chép rồi so", không dùng soát chéo.** Đã đo soát chéo trên trang scan: bắt được số sửa nhưng **hầu như không bắt câu bị xóa**, và báo trên 3–5/5 bản sạch. Trong khi đó, chép đối chứng bằng `3.1-flash-lite` (bản chính `3.5-flash-lite`) bắt 70% số từ chép sai thật, chỉ gắn cờ 3,7% số từ, và chỉ đúng vị trí. Câu bị bỏ sót lộ ra ngay vì bản kia có câu đó.
  - **Lượt đối chứng bắt buộc khác model lượt đầu.** `ask_m(…, exclude=model)`; cache lưu kèm tên model. Không có ràng buộc này thì bộ chọn backend có thể dùng cùng một model cho cả 2 lượt.
  - **Khi so: bỏ khối mô tả hình** (2 model tả khác nhau là chuyện bình thường), **bỏ thẻ HTML** (`<br>` trong ô bảng: một model dùng, một model không) và **bỏ dòng rào code** (` ```sql `). Cả ba đều từng gây cờ giả khi test.
  - Gộp các chỗ khác nhau cách nhau ≤ 3 từ; tối đa 8 chỗ mỗi trang.
- **PPTX mặc định đi qua PDF.** markitdown chỉ lấy chữ của shape, nên sơ đồ vẽ bằng shape mất hẳn (soát chéo báo "thiếu sơ đồ node/arc/polygon"). Đổi lại chậm hơn khoảng 4 lần (ie402 30 slide: 48 → 165 giây). `--fast-office` để quay về markitdown.
  - **Slide ẩn:** LibreOffice bỏ slide ẩn khi xuất PDF. `verify_pptx` ghép ảnh–nội dung theo số slide, bỏ qua slide ẩn; số không khớp thì bỏ soát chéo, không ghép lệch. Ở đường qua PDF, `<!-- trang N -->` lệch số slide nếu có slide ẩn.
- **Lớp 1 chỉ gắn trọn từ.** PDF do LibreOffice xuất tách "A" + "i dùng…" thành 2 span, từng sinh ra `A<u>**i dùng…**</u>`.
- **Trong dòng tiêu đề chỉ gắn gạch ngang**, không gắn gạch chân/đậm (thường chỉ là trang trí).
- **Chữ màu/đậm chỉ gắn `**` khi là MỘT PHẦN dòng/đoạn.** Bản đầu in đậm cả dòng mọi ô chữ màu trên slide (ie402: 97 chỗ, gần hết là tiêu đề/nhãn). Sau khi sửa còn 6 chỗ, đúng kiểu "Ghi chú **quan trọng**".
- **Danh sách lồng nhau:**
  - Sai số gom cấp là 6pt.
  - Mỗi dãy danh sách giữ **độ lệch** của mục đầu: dãy bắt đầu ở cấp 3 thì mục đầu là cấp 0, các mục cùng x luôn cùng cấp. Bản đầu kẹp từng mục riêng lẻ nên "o Toàn bộ…" bị đẩy sâu sai.
  - Không cho sâu hơn mục trước quá 1 cấp.
  - docling hay nhận nhầm mục `▪ PDF:` / `- Lưu ý:` là **tiêu đề**, nên tiêu đề bắt đầu bằng ký hiệu đầu dòng được đưa về làm mục danh sách.
  - Bỏ ký hiệu thừa ("- o Cấu trúc" → "- Cấu trúc"). Chữ "o" chỉ được coi là ký hiệu khi theo sau là chữ hoa, tránh nuốt từ.
- **Sắp lại 2 cột:**
  - Header/footer trang nằm lẫn trong `body`, nên phải coi là khối rộng cả trang.
  - Khối nằm hẳn trên/dưới vùng 2 cột đứng cạnh nhau (chú thích dưới 2 cột) cũng coi là rộng cả trang.
  - **Phân biệt với "nhãn | nội dung"** (C1 | …, BT1 | … trên slide): coi là bố cục hàng khi khối phải có khối trái bắt đầu cùng độ cao **và** khối trái hẹp hơn một nửa. 2 cột thật thẳng hàng hoàn hảo (file mẫu trang 2) nên không thể chỉ xét độ cao.
  - Chỉ đụng trang mà các khối nằm liền nhau trong `body`.

### 10.2. Còn lại

- Bố cục "nhãn | nội dung" trên slide (C1/BT1) vẫn có chỗ bị tách nhãn khỏi nội dung. Nay chỉ được soát chéo **báo**, không sửa.
- Slide có khối code trùng 2 lần ngay trong bản gốc (se104c2 trang 31) thì code fix không áp dụng (ca biên).
- DOCX: chữ màu vẫn mất (markitdown); DOCX chưa có soát chéo trừ khi đi qua PDF (`--via-pdf`).

### 10.3. Chạy thật trên slide Navigation đủ 128 trang (sau mọi bước)

- **Kết quả:** 439–478 giây (đa số ảnh lấy từ cache; chạy mới hoàn toàn ước ~12–15 phút), ~46k token. Tự sửa 1 khối code và 8 bảng. 31/128 trang bị gắn ⚠.
- **Lỗi lộ ra ở quy mô lớn và đã sửa:**
  - **Sắp 2 cột kích hoạt nhầm** ở 15 slide "chữ trái + 4 ảnh điện thoại phải": các ảnh bị coi là cột phải, khối mô tả ảnh bị đẩy lên trước "Ví dụ:". Sửa: mỗi bên phải có ≥ 2 khối **chữ** (không tính ảnh/bảng). Sau sửa: 0 slide bị sắp, file mẫu trang 2 vẫn được sắp đúng.
  - **Lớp 1 in đậm lấp lửng trong link** (`[**➢https://snac** k.expo…`): link trên slide có màu riêng nên bị coi là "chữ màu nhấn mạnh". Sửa: chữ trong vùng link (hoặc trông như URL) không gắn đậm/gạch chân.
  - **docling làm mất "Ví dụ: <link code mẫu>"** (trang 28, 47): gộp chữ bên trái vào vùng ảnh. Lớp 2 bắt được (khớp 40%, 62%). Thêm `recover_missing()`: trang khớp < 90% thì chèn lại các dòng của lớp chữ PDF mà md không có, và **URI thật lấy từ chú thích link của PDF**. Mảnh chữ của link bị xuống dòng thì bỏ, vì đã có URI.
  - **Chữ link bị xuống dòng thành "https://snac k.expo.dev/ @duypham nhat/…"**: `tidy()` thay `[chữ gãy](url)` bằng chính `url` khi chữ chỉ là URL bị cắt.
- **Cảnh báo còn lại** (31 trang) chủ yếu là:
  - Mô tả ảnh điện thoại chưa đủ (ảnh có 4 màn hình nhưng mô tả gộp/thiếu). Ảnh giao diện đã có quy tắc **bắt buộc xem ảnh** khi clone.
  - Nhãn/link bị tách khỏi nội dung.
  - Báo nhầm.
- **Một lưu ý về ký tự:** sửa script bằng heredoc từng chèn một ký tự backspace vô hình (`` trong chuỗi không phải raw) làm regex sai lặng lẽ. Sau mỗi lần sửa nên kiểm `chr(8)` trong file.

## 11. Ba chỗ còn hở sau mục 10 (đều "chưa làm", không phải bế tắc)

### 11.1. Mô tả ảnh nhiều màn hình bị thiếu

**Nguyên nhân thật** (slide 22): mô tả **không** thiếu. docling chỉ nhận ra **1 trong 4** ảnh điện thoại là hình, 3 ảnh kia mất hẳn. Lớp 2 không thấy vì ảnh không có chữ.

**Cách sửa:**

1. So danh sách **ảnh nhúng của PDF** (PyMuPDF `get_image_info`, có toạ độ) với các ảnh docling đã cắt. Ảnh có diện tích 1,5–85% trang mà bị các ảnh docling phủ chưa tới một nửa thì cắt ra và mô tả bổ sung (`extra`).
2. Prompt ảnh thêm: ảnh gồm nhiều màn hình thì đếm rồi mô tả **từng** màn hình, trái → phải.
3. Trang có từ 2 ảnh trở lên: **xếp lại mọi khối ảnh theo vị trí thật** (trên → dưới, cùng hàng lệch < 40pt thì trái → phải). Lý do: ảnh bổ sung từng bị chèn cuối trang, và chính docling cũng hay xuất ảnh lệch thứ tự (slide 57). Chỉ xếp lại khối tìm thấy nguyên văn trong md, tránh nhân đôi.

**Kết quả trên 128 slide:** 27 ảnh bị docling bỏ sót được thêm lại (mô tả 136 → 165). Năm slide từng bị báo "thiếu màn hình / sai thứ tự" sau sửa không còn cảnh báo nào.

### 11.2. "Nhãn | nội dung" trên slide (BT1 | …, C1 | …)

`merge_label_pairs()` gộp thành `**BT1**: nội dung` khi thỏa đủ các điều kiện:

- nhãn ≤ 3 từ và ≤ 20 ký tự;
- nội dung ≥ 6 từ;
- hai khối bắt đầu cùng độ cao (lệch < 6pt);
- nội dung nằm bên phải, cách nhãn không quá 30% bề ngang trang;
- nhãn hẹp hơn một nửa nội dung.

Điều kiện chặt để không gộp nhầm 2 tiêu đề song song của trang 2 cột ("2.1 Nguồn phát | 2.2 Lưu trữ" đều ngắn, nên không gộp). Kết quả: ie402 slide 28 ra "**BT1**: Vẽ bản đồ…"; file mẫu của bạn không bị gộp nhầm.

### 11.3. Giảm báo nhầm của soát chéo

- **Model thứ 2 xác nhận** (`confirm_issues`, `CONFIRM_PROMPT`): mỗi lỗi do model A nêu được model B (**khác A**) kiểm lại trên ảnh + md; chỉ giữ lỗi B xác nhận là thật. B lỗi hoặc trả sai định dạng thì giữ nguyên, để không đánh mất cảnh báo. Trên 7 ca đã biết: giữ 4/4 lỗi thật, 0 báo nhầm.
- **Sửa bộ lọc header/footer quá tay:** bản cũ bỏ mọi lỗi có chữ "đầu trang", nên đã nuốt oan ca D ("thiếu tiêu đề đầu trang 'PHỤ LỤC B' và các mục B.1–B.3"). Giờ chỉ lọc chữ header/footer/logo/số trang (theo ranh giới từ) và các dòng header thật của trang.
- **URL gãy mà docling không đánh dấu là link:** dò chữ gãy theo URI thật lấy từ chú thích link của PDF (cho phép khoảng trắng giữa các ký tự) rồi thay bằng URI.
- **Trang đã khôi phục đủ chữ (khớp ≥ 90% sau khi chèn) không gắn ⚠ nữa.** Ghi chú khôi phục vẫn nằm trong trang.

**Kết quả 128 slide:** ⚠ giảm 31 → 18 (sau 11.1–11.3), rồi giảm tiếp sau khi sửa thứ tự ảnh (số cuối ở 11.4). Cảnh báo còn lại chủ yếu là **mô tả ảnh giao diện sai chi tiết**: vị trí icon, nhãn "featured/search" bị tráo. Đây là cảnh báo đúng, và ảnh giao diện vốn đã bắt buộc xem khi clone.

**Ghi chú kỹ thuật:** sửa script bằng heredoc Python **không phải raw string** đã 2 lần biến `\b` thành ký tự backspace (chr(8)), làm regex hỏng lặng lẽ (bộ lọc header/footer từng tắt hẳn). Sau mỗi lần vá phải kiểm `s.count(chr(8)) == 0`.

### 11.4. Số cuối trên 128 slide Navigation

- **Cảnh báo ⚠ giảm 31 → 8 trang** (6% số trang).
- **Đọc từng cảnh báo còn lại:**
  - **~4–5 là lỗi thật của mô tả ảnh** (p7 nhãn Drawer/Deep linking, p30 vị trí icon, p47 nút Tools, p118 cây thư mục thiếu 2 file; có thể cả p5 thiếu tiêu đề "NỘI DUNG").
  - **~3 là báo nhầm**: chê "tách ảnh thành nhiều khối mô tả" (p53, p59) và ký hiệu đầu dòng (p63).
- **Tổng hợp cả 128 slide:**
  - 27 ảnh bị docling bỏ sót được thêm lại; 8 bảng được thay bằng bản Gemini;
  - 2 trang được khôi phục chữ, 1 khối code được sửa xuống dòng;
  - ~48,6k token.
- **Thời gian:** 496 giây khi ảnh đã có trong cache. Chạy mới hoàn toàn ~15–20 phút do thêm mô tả ảnh bổ sung, soát chéo và xác nhận.

## 12. Tốc độ

### 12.1. Thời gian đi đâu (đo bằng `DOC2MD_DEBUG=1`, slide Navigation 128 trang, trước tối ưu)

| Giai đoạn | Có cache | Chạy mới (ước) |
|---|---|---|
| docling (mô hình bố cục + bảng, CPU) | **337 giây** | 337 giây |
| Mô tả ảnh (~190 request) | 3 giây | ~3–4 phút |
| Soát chéo + xác nhận (~150 request) | 121 giây | ~3 phút |
| Xuất từng trang + lớp 1/2 | 27 giây | 27 giây |
| Còn lại | ~6 giây | ~20 giây |

**Sàn cứng do giới hạn API:** mỗi tổ hợp key×model tối đa 14 request/phút. Với 2 key thì 4 tổ hợp, ~56 request/phút; với 3 key thì 6 tổ hợp, ~84 request/phút. Giảm sàn này chỉ có cách thêm key/project.

### 12.2. Đã làm

| Thay đổi | Cách | Đo |
|---|---|---|
| **A. Mô tả ảnh song song với docling** | `prefetch_images()` chạy luồng riêng ngay khi docling bắt đầu: lấy ảnh nhúng bằng **PyMuPDF** (KHÔNG dùng pdfium vì docling đang dùng, pdfium không an toàn đa luồng), mô tả trước. Ảnh docling trùng vị trí (IoU ≥ 0,7) dùng lại kết quả. Hình docling **gộp** từ 2+ ảnh nhúng (2 điện thoại cạnh nhau ở bài lab) thì ghép mô tả từng ảnh con trái → phải, không gọi API thêm | lab05 cache trống: **133 → 112 giây (−16%)**; chờ mô tả sau docling 43 → 7 giây. Có cache: chậm hơn 9–45 giây do luồng phụ tranh CPU với docling (không có chờ API để bù) |
| **B. Xuất markdown 1 lần** | `export_pages()`: `export_to_markdown(page_break_placeholder=…)` rồi tách. Số trang của từng dấu ngắt lấy từ chính hàm duyệt mà bộ xuất docling dùng (`_iterate_items(add_page_breaks=True)`, API riêng của docling_core 2.130 — pin version). Lệch số đoạn thì quay về xuất từng trang | Giống hệt xuất từng trang trên mọi trang của 3 file (kiểm bằng debug). Bước xuất 27 → <1 giây / 128 trang |
| **Luồng API theo số key** | `workers` = số tổ hợp Gemini (tối đa 8), trước cố định 4 | Có `GEMINI_API_KEY3` thì 6 luồng |

### 12.3. Không làm (giữ vì độ chính xác)

- **Đổi/giảm mô hình bố cục docling:** chưa biết ảnh hưởng tới bảng/2 cột/ảnh; phải làm lại vòng test.
- **Bỏ soát chéo cho trang chỉ có chữ:** mất lớp bắt lỗi thứ tự và mất chữ trên các trang đó.
- **Bỏ soát chéo mặc định:** vẫn có `--no-verify` khi cần nhanh.

### 12.4. Lưu ý khi đo

- **Máy đang bận các ứng dụng khác** (VS Code, Chrome, ChatGPT; CPU ~45% lúc rảnh), nên cùng một việc docling dao động 77–146 giây. So sánh phải chạy xen kẽ, không so hai lần đo cách xa nhau.
- **Từng có 4 server surya của marker chạy ngầm từ lượt test cũ** (tắt marker nhưng tiến trình con không tắt theo) làm docling chậm gấp đôi. Nếu thấy chậm bất thường, kiểm `Get-CimInstance Win32_Process | ? CommandLine -match 'surya|marker'`.
- `DOC2MD_NO_PREFETCH=1` chỉ để đo so sánh A, không dùng bình thường.

### 12.5. Sửa sau khi bạn phát hiện lỗi vị trí ảnh (LAB04)

Bản tối ưu ở 11.1 ("sắp lại mọi khối ảnh của trang") đã gây lỗi: mọi ảnh bị dồn về vị trí ảnh đầu tiên, cộng thêm việc docling vốn xuất cả danh sách rồi mới tới ảnh.

**Nay `place_pictures()`:**

- Rút mọi khối ảnh của trang ra.
- Chèn lại từng khối ngay trước khối chữ đầu tiên nằm thấp hơn nó **theo toạ độ trên trang gốc**. Cùng "hàng" (lệch < 40pt) thì xét trái → phải.
- Tìm khối chữ trong md theo 30/15/8 ký tự đầu, vì chữ có thể đã bị gắn `**` hoặc thụt lề.
- Chèn theo thứ tự xuôi, để các ảnh cùng chèn trước một mốc giữ đúng trái → phải.

**Kiểm lại:**

- LAB04 trang 8–15: câu → ảnh → câu → ảnh, đúng như bản gốc.
- Slide 22 và 57: 4 ảnh đúng trái → phải.
- lab01 và file mẫu không đổi.
- File LAB04 trong thư mục môn học đã được tạo lại.

**Lưu ý thống kê:** dòng "mô tả N" trong tóm tắt đếm cả các ảnh nhúng được mô tả trước (A). N có thể lớn hơn số hình docling ("ảnh: M"), vì một hình docling gộp 2 ảnh điện thoại thì có 2 mô tả con.

## 13. Ảnh giao diện: chỉ giữ 1 câu tóm tắt

**Đề xuất của bạn:** bỏ mô tả chi tiết của ảnh "bắt buộc xem", vì (1) tốn token vô ích, (2) mô tả chi tiết khiến Claude tưởng đủ rồi code theo chữ mà lười mở ảnh.

**Quyết định:** không bỏ hẳn mà **giữ 1 câu tóm tắt ≤ 20 từ**. Câu này để Claude chọn đúng ảnh cần mở (bài lab có 30–40 ảnh) và trả lời câu hỏi kiểu "có mấy màn hình". Nó cố ý không đủ để code theo.

**Cách làm:**

- `IMG_PROMPT` thêm dòng `TÓM TẮT:` (≤ 20 từ). Với `ui` thì không ghi gì thêm.
- `describe()`:
  - Với `ui`: chỉ giữ câu tóm tắt, cắt cứng 180 ký tự.
  - Với loại khác (code, sơ đồ, biểu đồ…): tóm tắt đặt đầu, **giữ nguyên chi tiết**, vì đó là nội dung phải đọc.
- Hình docling gộp nhiều điện thoại: mỗi ảnh con 1 dòng `**Ảnh n**: …`.
- `VERIFY_PROMPT`: khối ảnh giao diện cố ý ngắn; chỉ báo khi câu tóm tắt nói sai.
- SKILL.md: mọi chi tiết giao diện (kể cả chỉ để trả lời câu hỏi) phải mở ảnh.

**Đo (LAB05, 22 trang, 30+ ảnh giao diện):**

- 14,1k → **8,9k token (−37%)**. Khối ảnh giao diện còn 45% file (tiêu đề khối + đường dẫn ảnh + 1 dòng mỗi ảnh con).
- Không có cảnh báo nào chê "mô tả quá ngắn". Cảnh báo còn lại là tóm tắt nói sai chi tiết, hoặc báo nhầm như trước.

**Lưu ý:** đổi prompt làm cache cũ không dùng được; lần đầu chạy lại mỗi file sẽ mô tả lại ảnh (tốn request một lần).

## 14. Vòng test trên bộ tài liệu mới (25 file chưa từng thử)

**Bộ test:** lab IE307 (LAB02, LAB03), slide SE104 (UML, Chương 3, Chương 1 `.ppt`), slide IS402 tiếng Anh, slide GIS `.ppt`, slide đồ án IE207 `.pptx`, IE402 Buổi 1 `.pptx`, báo cáo mẫu IE207, hướng dẫn SV, đề cương SE104, QL Chợ Địa Ốc, narita-spec (43 trang, bảng, tiếng Nhật), final exam (trang cheat-sheet chữ nhỏ), sách scan (8 trang), 2 quyết định scan, chương trình đào tạo (trang web in), bảng điểm Odoo, 3 DOCX, 2 XLSX. Bỏ `0-tham-khao`. Hai agent con rà soát output so với bản gốc (~70 trang đã xem).

**Không file nào crash.** Lỗi tìm được và đã sửa (đo trước → sau):

| Lỗi | Nguyên nhân | Sửa | Đo |
|---|---|---|---|
| Ảnh trang 1–5 dồn hết sang trang 6 (hướng dẫn SV) | B (xuất 1 lần) gán sai trang dù số đoạn khớp | Kiểm mọi khối chữ/ảnh nằm đúng trang, lệch thì xuất từng trang | Mỗi trang đúng 2 ảnh |
| 1 file mất 802 giây | Gemini trả rỗng cho slide gần trống, bị coi là lỗi, thử lại 10 phút | Rỗng + STOP = hợp lệ; lỗi nội dung tối đa 3 lần | 802 → 235 giây |
| Slide shape/thẻ bị xáo, sơ đồ UML còn dấu `*` rời | docling | F4: slide có ⚠ → Gemini chép lại cả slide (+ đối chứng), giữ đường dẫn ảnh | gis: UML có đủ lớp + quan hệ, ⚠ 9 → 3 |
| Slide chuyển mục ít chữ bị coi là scan | chỉ đếm chữ | Scan = ít chữ **và** có ảnh phủ ≥ 50% trang | Chữ "05 KẾT LUẬN…" có lại |
| Watermark/header lặp ("lOMoARcPSD…" ×34, "## IE207 - Đồ án" ×12) | — | Bỏ dòng lặp ≥ 25% trang (trang dọc) / ≥ 60% (slide) | 34 → 1 |
| Khối code trong mô tả ảnh không đóng | model quên ``` | Tự đóng | 0 fence lẻ |
| Ảnh thanh tiêu đề slide sinh khối trùng heading | ảnh chứa chữ tiêu đề | Bỏ khối ảnh mà ≥ 90% chữ chép từ ảnh đã có trên trang (không tính câu tóm tắt) | 30 → 1 |
| Gạch chân giả do viền bảng | cờ UNDER của PyMuPDF | Chỉ nhận khi có nét kẻ ≤ 2,5pt dưới chữ, ngắn ≤ 1,3× chữ, không phải hàng nét kẻ | 26 → 0; gạch chân thật vẫn giữ |
| Ký tự PUA (bullet Wingdings) | — | Loại trong `tidy` | 144 → 0 |
| XLSX `NaN`/`Unnamed`/`1.0`/`
` | pandas qua markitdown | Dọn trong route office | 146 → 0 |
| DOCX mất số đề mục (1.2.1, a., b.) | markitdown/mammoth | DOCX mặc định đi qua PDF | Có lại số (chậm hơn: 3 → 70 giây) |
| Câu từ chối của Gemini thành bảng; Gemini bịa tiêu đề bảng, dịch tiêu đề | prompt | `TABLE_PROMPT`: không đặt tiêu đề khi không có, không dịch, không phải bảng → `NOTABLE` | 1 → 0 |
| Highlight/sticky note của PDF bị mất | — | Chép ra cuối trang dạng `> Ghi chú/đánh dấu trên PDF gốc` | Có |
| Trang chữ dày nhiều cột bị xáo (cheat-sheet) | docling | Trang > 1500 ký tự có ⚠ về thứ tự → dùng lớp chữ PDF | Câu lặp 2 → 1 |
| So 2 bản chép: 6 dòng "khác nhau" chỉ vì đảo thứ tự | — | Cùng tập chữ (lệch ≤ 1 từ) → 1 dòng "khác THỨ TỰ" | — |
| Lồng `**` sai | — | Không gắn trong cặp `**` | — |

**Đã thử và GỠ BỎ:** lượt "trọng tài" (model thứ 3 chọn giữa 2 bản chép scan). Trên QĐ học bổng nó sửa **đúng thành sai** (Hào→Hảo, Lệ Hội→Lễ Hội, ATTT→ATTN). Thay vào đó, SKILL.md dặn Claude mở ảnh kiểm các ô bị gắn «A» ≠ «B» khi cần tên/mã/số: agent rà soát xác nhận mọi chỗ sai đều nằm ở các ô bị gắn cờ.

**Còn lại (chưa giải quyết):**

- Văn bản scan dày đặc tên/mã: sai ~1–2% ô với model free. Được gắn cờ, không tự sửa được.
- Bảng phức tạp (narita tiếng Nhật, bảng điểm Odoo): vài ô lệch, mất chú thích dưới bảng.
- Soát chéo vẫn báo nhầm khá nhiều (câu nối sang trang sau, chê mô tả ảnh tóm tắt).
- Chưa chạy lại trọn 25 file sau tất cả bản sửa; mới chạy lại các file có lỗi tương ứng.

**Bài học quy trình:**

- Đừng vá script khi batch đang chạy. Lần vá có chuỗi `
` bị biến thành xuống dòng thật đã làm script lỗi cú pháp ~1 phút giữa batch. Nay: sao lưu, vá, kiểm `ast.parse`, lỗi thì khôi phục.
- Kiểm `chr(8)` sau mỗi lần vá.

## 15. Bộ test giữ riêng (held-out) — chống "rò rỉ test"

**Vấn đề bạn chỉ ra:** mục 14 sửa script theo chính 25 file dùng để đánh giá, nên các ngưỡng bị "khớp" với bộ đó và số liệu bị lạc quan.

**Cách làm:**

1. Đóng băng script (bản sao `scratchpad/heldout/doc2md_FROZEN.py`).
2. Chạy trên 26 mục **chưa từng dùng**: slide IE307/IS402/SE104, đề cương, mẫu CT01, giấy phép tiếng Nhật, Sommerville, sách phạt nguội trang 30–37, tài liệu CSDL, 3 ảnh sách GIS mới, PPTX/PPT, 3 DOCX, 3 XLSX, trang web in ra.
3. Hai agent rà soát độc lập.

**Kết quả trên bộ mới:**

- Không crash, không hết quota giữa chừng.
- Lộ ra các lỗi **mà bộ cũ không có**:
  - ngày XLSX dạng ISO (dễ đọc lệch tháng);
  - ảnh nhúng trong XLSX bị bỏ;
  - DOCX qua PDF làm bảng bị cắt ở ranh giới trang;
  - sơ đồ vector bị tách thành 12–16 khối "Ảnh n" gắn nhầm nhãn giao diện;
  - mất gạch nối khi nối dòng (URL "kohacommunity", mã "TTBVHTTDL");
  - mất link chữ "tại đây";
  - gạch ngang giả do khung màu;
  - khoảng trắng chen giữa chữ Nhật;
  - bullet Wingdings dính chữ;
  - khối khôi phục lặp đoạn của trang trước hoặc kéo theo footer có số trang;
  - lỗi `** X**`.

**Sửa (chỉ các cách sửa tổng quát, tất định):**

| Lỗi | Cách sửa |
|---|---|
| XLSX | `route_xlsx` (openpyxl): ngày theo `number_format` của ô, mặc định dd/mm/yyyy; tự tìm dòng tiêu đề; mô tả ảnh nhúng; bỏ sheet rỗng |
| DOCX | `route_docx`: bộ đọc DOCX gốc của docling (đo trên se104_nhom5 và noidung_baocao: bảng nguyên vẹn, giữ 1.2.1) |
| Sơ đồ bị tách | Chỉ ghép mô tả ảnh con khi có 2–4 ảnh lớn (mỗi ảnh ≥ 15% hình); còn lại mô tả cả hình |
| Gạch nối | `fix_hyphen_joins`: giữ gạch khi dạng có gạch xuất hiện chỗ khác trong tài liệu hoặc 2 vế viết hoa |
| Link chữ | Gắn URL từ link annotation sau chữ neo |
| Gạch ngang giả | Phải có nét kẻ mảnh cắt ngang thân chữ, dài cỡ chữ |
| Khôi phục | Đối chiếu cả trang trước; footer khác nhau chỉ ở số trang vẫn là footer; bỏ bullet dính chữ |
| `tidy` | Bỏ khoảng trắng giữa ký tự CJK; sửa `** X**`; bỏ bullet "o/§/ü" dính chữ |

**Kiểm lại trên chính các file lỗi (trước → sau):**

- kohacommunity 5 → 2, koha-community 3 → 18, TTBVHTTDL 1 → 0.
- Link "tại đây" 0 → 1.
- Sơ đồ tách mảnh 1 → 0, gạch ngang giả 2 → 0.
- 第三 者 1 → 0, oBackup 1 → 0.
- Header bảng vỡ (nhom5) 1 → 0.
- XLSX: ngày dạng dd/mm, ảnh có mô tả.

Hồi quy trên file mẫu, file định dạng, LAB04: không đổi.

**Lưu ý trung thực:** các bản sửa này lại được kiểm trên chính bộ held-out vừa xem, nên độ chính xác thật trên tài liệu hoàn toàn mới có thể kém hơn chút. Các loại lỗi còn lại (bảng phức tạp, mô tả sơ đồ, scan dày đặc, bố cục thẻ) là giới hạn của model/công cụ free. Chúng được ghi trong SKILL.md mục "Khi nào phải mở ảnh gốc".

