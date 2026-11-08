# MEOWN-2407 Planetary Archive & Lore Codex

Trang tư liệu lưu trữ hành tinh MEOWN-2407 dành cho độc giả và người tham gia bot chat AI Roleplay, tái hiện một kỷ nguyên tinh tế đa chủng tộc nơi nhân loại và cư dân MEOWN-2407 cùng chung sống hài hòa. Hệ thống cung cấp giao diện lưu trữ vũ trụ tối giản, hiện đại, hỗ trợ nhúng tài liệu/video HTML tương tác đa chiều, đài mini radio góc màn hình, và bảng điều khiển Admin bảo mật phía máy chủ để cập nhật nội dung đồng bộ.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Dưới đây là các quyết định thiết kế đã được xác nhận và cơ chế kỹ thuật bảo mật trọng yếu được áp dụng cho ứng dụng:

- **Phong cách giao diện**: Kho lưu trữ dữ liệu vũ trụ tối giản và hiện đại (*Obsidian Galactic Codex*). Nền đen không gian sâu (`#07090e`), phân vùng thẻ phẳng viền mảnh 1px (`#1e293b`), điểm nhấn laser cyan (`#06b6d4`) và cobalt (`#3b82f6`), phông chữ kỹ thuật số chính xác.
- **Cấu trúc 5 Danh mục**: Đồng bộ giao diện qua 5 phân hệ tri thức:
  1. *Lịch sử (History)*: Lưu trữ biên niên sử, video và tài liệu HTML tái hiện thời kỳ khai mở và liên minh nhân loại - MEOWN.
  2. *Địa lý (Geography)*: Khảo sát địa hình, lục địa nổi, quần đảo pha lê và các đại đô thị.
  3. *Chủng tộc (Species & Demographics)*: Hồ sơ các chủng tộc bản địa MEOWN, cộng đồng người Trái Đất và sự cộng sinh văn hóa.
  4. *Kinh tế & Khí hậu (Economy & Climate)*: Chu kỳ sinh thái, năng lượng tinh thạch và mạng lưới giao thương liên sao.
  5. *Các hệ thống liên tinh (Interstellar Systems)*: Bản đồ mạng lưới cổng bước nhảy và các hiệp ước liên hành tinh.
- **Cơ chế xem nội dung HTML**: Khung tương tác iframe cát lập an toàn (sandboxed iframe) đi kèm bảng tóm tắt thông số, thanh công cụ thu/phóng, nút mở chế độ toàn màn hình (fullscreen view), và trình chuyển đổi nhanh giữa các bản ghi.
- **Bảo mật tuyệt đối cho Admin & Mật khẩu `bhnt2006`**:
  - Mật khẩu `bhnt2006` được bảo vệ và xác thực hoàn toàn tại máy chủ Node.js/Express (`/api/admin/login`).
  - Tuyệt đối **không** nhúng chuỗi mật khẩu vào mã nguồn JavaScript phía client bundle để chống dịch ngược hay lộ thông tin trong Network/Elements tab.
  - Sau khi đăng nhập thành công, máy chủ cấp token phiên an toàn (session token) để xác thực quyền đăng tải file HTML và file MP3.
- **Đồng bộ hóa dữ liệu**: Tất cả file HTML danh mục và bài hát MP3 được lưu trữ bền vững tại kho dữ liệu máy chủ (`/data/store` và `/data/uploads`), tự động đồng bộ ngay lập tức cho toàn bộ người dùng khi Admin lưu lại.
- **Đài phát thanh mini (Mini Radio)**: Đặt kín đáo ở góc dưới bên trái màn hình, thiết kế thanh lịch không che chắn nội dung, cho phép thu gọn/mở rộng, hỗ trợ phát danh sách bài hát (tên bài, nghệ sĩ, file âm thanh) và Admin có thể đăng tải bài hát mới trực tiếp.

---

### 1. Overview & Core Concept

- **Mục tiêu**: Xây dựng một cổng thông tin trực quan, cô đọng và trang nhã về bối cảnh thế giới MEOWN-2407 nhằm phục vụ người chơi bot AI Roleplay nắm bắt nhanh toàn bộ thiết lập vũ trụ mà không bị choáng ngợp.
- **Đối tượng sử dụng**: Độc giả, thành viên cộng đồng bot chat AI Roleplay, và Quản trị viên (Admin) phụ trách cập nhật tư liệu bối cảnh thế giới.
- **Giá trị cốt lõi**:
  - Thể hiện sự hòa hợp tinh tế giữa công nghệ viễn tưởng và vẻ đẹp huyền bí của nền văn minh MEOWN-2407.
  - Tạo cấu trúc chuẩn hóa cho phép dễ dàng mở rộng, bổ sung tài liệu HTML và media cho bất kỳ tab nào.
  - Quản lý tập trung, an toàn với quyền quản trị viên chuẩn mực.

---

### 2. User Experience & Visual Design

#### A. Kiến trúc giao diện & Quy chuẩn thẩm mỹ
- **Bảng màu 60-30-10**:
  - *60% Nền canvas*: Đen vũ trụ sâu thẳm (`#06080d`) với lớp bụi sao tinh tế.
  - *30% Bề mặt cấu trúc*: Thẻ bảng dữ liệu obsidian xám đậm (`#0f141f`), viền hairline sắc nét 1px (`#1e293b`), các rãnh chia khu vực thanh mảnh.
  - *10% Điểm nhấn truyền tín hiệu*: Cyan phát quang (`#06b6d4`), ngọc lam êm dịu (`#22d3ee`) và cobalt hoàng hôn (`#6366f1`).
- **Hệ thống phông chữ**:
  - Phông hiển thị & Tiêu đề: *Plus Jakarta Sans* / *DM Sans* sắc nét, đĩnh đạc.
  - Phông tham số & Dữ liệu kỹ thuật: *JetBrains Mono* / `font-mono tabular-nums` cho tọa độ vũ trụ, ngày lập lưu trữ và chỉ số khí quyển.
- **Quy tắc Top Bar (3 Vùng chuẩn mực)**:
  - Vùng 1: Nhãn định danh `MEOWN-2407 ARCHIVE`.
  - Vùng 2: 5 liên kết điều hướng dạng văn bản thanh lịch (`Lịch sử`, `Địa lý`, `Chủng tộc`, `Kinh tế & Khí hậu`, `Hệ thống liên tinh`).
  - Vùng 3: Nút hành động đăng nhập `Admin Access` (với biểu tượng khóa an toàn).

#### B. Trải nghiệm người dùng theo các phân khu
1. **Hero & Thanh chỉ số hành tinh**:
   - Tên mã: *MEOWN-2407* · Định danh: *Hành tinh Cộng sinh Cấp IV*.
   - Khung tham số nhanh: Quỹ đạo song hành, Tỷ lệ dân số (Cư dân MEOWN & Con người), Khí quyển hít thở tự nhiên, Trọng lực chuẩn 0.94G.
2. **Khu vực nội dung từng Danh mục (5 Tabs)**:
   - Thanh chọn phân hệ danh mục trực quan, chuyển đổi mượt mà giữa các tab.
   - Thẻ thông tin tóm lược: Giới thiệu ngắn gọn, xuất xứ tư liệu, thời điểm cập nhật.
   - **Khung tài liệu tương tác (HTML & Media Canvas)**:
     - Nhúng file HTML qua sandbox bảo mật hoặc render tài liệu cấu trúc chuẩn kèm video minh họa (ở tab Lịch sử có sẵn bản trình chiếu video/HTML mẫu).
     - Công cụ hỗ trợ: Xem toàn màn hình (Fullscreen toggle), mở cửa sổ mới, tải lại khung nhìn.
3. **Mini Radio Player (Góc dưới bên trái)**:
   - Nút bật/thu gọn nhỏ gọn với biểu tượng sóng âm, không bao giờ chiếm dụng diện tích đọc tư liệu.
   - Khi mở rộng: Hiển thị tên bài hát, nghệ sĩ, thanh tiến trình thời gian, nút Play/Pause, Next/Prev, điều chỉnh âm lượng.
   - Tích hợp sẵn danh sách nhạc ambient du hành không gian thư giãn, hỗ trợ Admin nạp thêm file MP3 trực tiếp.
4. **Bảng điều khiển Quản trị viên (Admin Modal / Dashboard)**:
   - Cửa sổ xác thực đăng nhập bảo mật với ô nhập mật khẩu.
   - Sau khi đăng nhập: Hiển thị các công cụ quản lý:
     - **Quản lý tài liệu HTML**: Chọn danh mục (Lịch sử, Địa lý, Chủng tộc, Kinh tế, Liên tinh) -> Tải file HTML mới hoặc nhập/chỉnh sửa nội dung HTML -> Lưu lên máy chủ.
     - **Quản lý âm nhạc Radio**: Nhập Tên bài hát, Tên nghệ sĩ -> Tải file MP3 -> Lưu vào playlist toàn trang.
     - Nút Đăng xuất an toàn và xóa token phiên.

---

### 3. Key Product Decisions & Trade-Offs

- **Bảo mật mật khẩu Admin (Server-side Proxy vs Client Hardcoding)**:
  - *Cách tiếp cận*: Tạo endpoint `/api/admin/login` trên server Express, so sánh mật khẩu `bhnt2006` hoàn toàn tại server backend và sinh token phiên ký hiệu.
  - *Lý do*: Đáp ứng triệt để yêu cầu của người dùng "giấu kín và không để lộ mật khẩu". Mã JavaScript phía client tuyệt đối không chứa chuỗi ký tự mật khẩu.
- **Lưu trữ và Đồng bộ file HTML & MP3 (Server Filesystem & JSON Store)**:
  - *Cách tiếp cận*: Sử dụng máy chủ Node.js Express lưu trữ nội dung các danh mục trong thư mục `/data/content.json` và lưu các file HTML/MP3 tải lên vào `/data/uploads`.
  - *Lý do*: Đảm bảo mọi thay đổi từ Admin được lưu lại bền vững và tự động đồng bộ ngay lập tức cho bất kỳ ai truy cập website từ bất kỳ trình duyệt nào.
- **Cách hiển thị tài liệu HTML (Sandboxed Iframe & HTML Content Injector)**:
  - *Cách tiếp cận*: Sử dụng `iframe` với thuộc tính `sandbox="allow-scripts allow-same-origin"` kết hợp blob/URL an toàn hoặc đường dẫn tĩnh từ `/api/content/:category`.
  - *Lý do*: Đảm bảo tài liệu HTML hiển thị chính xác mọi hiệu ứng (video, style, cấu trúc) mà không gây xung đột CSS hoặc ảnh hưởng tới giao diện chính của ứng dụng.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MEOWN-2407 CLIENT APPLICATION                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────┐  ┌────────────────────────────────────────────┐  │
│  │ Top Bar Navigation    │  │ Planet Codex Hero & Vital Statistics       │  │
│  └───────────────────────┘  └────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Category Switcher (Lịch sử | Địa lý | Chủng tộc | Kinh tế | Liên tinh)│  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Interactive Content Stage: Summary Card + Sandboxed HTML/Media Viewer │  │
│  │ (Supports Fullscreen, Video Embeds, Custom HTML Documents)            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────┐    ┌──────────────────────────────────────┐  │
│  │ Floating Mini Radio Player│    │ Admin Auth & Management Modal        │  │
│  │ (Title, Artist, Audio)    │    │ (HTML Uploader & MP3 Track Manager)  │  │
│  └───────────────────────────┘    └──────────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST API
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    NODE.JS / EXPRESS BACKEND SERVER                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  - POST /api/admin/login   : Xác thực mật khẩu bảo mật (bhnt2006)           │
│  - GET  /api/content       : Lấy dữ liệu 5 danh mục hiện tại                │
│  - POST /api/content/:tab  : Admin cập nhật tài liệu HTML và mô tả tóm tắt │
│  - GET  /api/tracks        : Lấy danh sách bài hát radio                    │
│  - POST /api/tracks/upload : Admin tải lên file MP3 kèm thông tin bài hát   │
│  - GET  /uploads/*         : Phục vụ các tệp tĩnh (HTML, MP3, hình ảnh)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Storage: /data/content.json · /data/tracks.json · /data/uploads/            │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Dữ liệu mặc định ban đầu:
- **Lịch sử**: Trang tài liệu HTML hoàn chỉnh tích hợp video/canvas không gian, biên niên sử thiết lập hiệp ước MEOWN-2407 và Trái Đất, các mốc thời gian lớn.
- **Địa lý, Chủng tộc, Kinh tế & Khí hậu, Hệ thống liên tinh**: Các mẫu tài liệu HTML đồng bộ cấu trúc, sẵn sàng hiển thị thông số và sẵn sàng cho Admin tải đè file HTML mới bất kỳ lúc nào.
- **Playlist Radio**: Các bản nhạc không gian du dương (Lo-Fi Cosmic, Space Ambient) kèm sẵn và form tải MP3 mở rộng.
