import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bhnt2006';

// Paths for persistent data
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const TRACKS_FILE = path.join(DATA_DIR, 'tracks.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// In-memory valid admin session tokens
const validAdminTokens = new Set<string>();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads directory
app.use('/uploads', express.static(UPLOADS_DIR));

// Default HTML template generator for seed data
function generateDefaultHtmlContent(
  category: string,
  title: string,
  subtitle: string,
  accentColor: string = '#06b6d4',
  includeVideo: boolean = false
) {
  // If category is history, render the full canonical 4-era geological evolution
  if (category === 'history') {
    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lịch Sử Kiến Tạo & Tiến Hóa Cổ Hành Tinh MEOWN-2407</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #06080d;
      color: #e2e8f0;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      padding: 24px;
      overflow-x: hidden;
    }
    .container {
      max-width: 920px;
      margin: 0 auto;
    }
    .badge {
      display: inline-block;
      font-family: monospace;
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #06b6d4;
      border: 1px solid rgba(6, 182, 212, 0.3);
      padding: 4px 10px;
      border-radius: 4px;
      background: rgba(6, 182, 212, 0.05);
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 6px;
      letter-spacing: -0.02em;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 24px;
    }
    .stats-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 10px;
      margin-bottom: 24px;
    }
    .stat-pill {
      background: #0c1018;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 12px;
    }
    .stat-label {
      font-size: 10px;
      font-family: monospace;
      text-transform: uppercase;
      color: #64748b;
      display: block;
      margin-bottom: 4px;
    }
    .stat-val {
      font-size: 16px;
      font-weight: 700;
      color: #38bdf8;
      font-family: monospace;
    }
    .stat-sub {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .canvas-container {
      position: relative;
      width: 100%;
      height: 340px;
      background: #020408;
      border: 1px solid #1e293b;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 28px;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    .hud-overlay {
      position: absolute;
      top: 12px;
      left: 14px;
      font-family: monospace;
      font-size: 11px;
      color: rgba(56, 189, 248, 0.9);
      background: rgba(4, 6, 12, 0.75);
      padding: 5px 10px;
      border-radius: 4px;
      border: 1px solid rgba(56, 189, 248, 0.25);
      pointer-events: none;
    }
    .hud-sub {
      position: absolute;
      bottom: 12px;
      right: 14px;
      font-family: monospace;
      font-size: 10px;
      color: #94a3b8;
      background: rgba(4, 6, 12, 0.75);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .era-section {
      background: #0a0e17;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .era-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 14px;
      border-bottom: 1px solid #1e293b;
      padding-bottom: 10px;
    }
    .era-title {
      font-size: 16px;
      font-weight: 700;
      color: #f8fafc;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .era-time {
      font-family: monospace;
      font-size: 11px;
      color: #06b6d4;
      background: rgba(6, 182, 212, 0.1);
      border: 1px solid rgba(6, 182, 212, 0.25);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .sub-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 14px;
    }
    .sub-card {
      background: #060911;
      border: 1px solid #192231;
      border-radius: 8px;
      padding: 14px;
    }
    .sub-card h4 {
      font-size: 13px;
      font-weight: 600;
      color: #38bdf8;
      margin-bottom: 6px;
    }
    .sub-card p {
      font-size: 12.5px;
      color: #94a3b8;
      line-height: 1.55;
    }
    .crystal-box {
      background: rgba(6, 182, 212, 0.04);
      border: 1px solid rgba(6, 182, 212, 0.25);
      border-radius: 8px;
      padding: 16px;
      margin-top: 14px;
    }
    .crystal-box h4 {
      font-size: 13.5px;
      font-weight: 700;
      color: #22d3ee;
      margin-bottom: 6px;
    }
    .crystal-box p {
      font-size: 12.5px;
      color: #cbd5e1;
      line-height: 1.6;
    }
    .footer-stamp {
      border-top: 1px solid #1e293b;
      padding-top: 14px;
      font-family: monospace;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">BIÊN NIÊN ĐỊA CHẤT & TIẾN HÓA // MEOWN-2407</div>
    <h1>Lịch Sử Hình Thành & Cổ Hành Tinh MEOWN-2407</h1>
    <div class="subtitle">Niên đại 12,4 tỷ năm · Khối lượng 1,82 M⊕ · Hệ mặt trăng đôi Selene-I & Selene-II · Năng lượng Tinh Thể MEOWN vĩnh cửu</div>

    <!-- Quick Stats Metric Strip -->
    <div class="stats-strip">
      <div class="stat-pill">
        <span class="stat-label">Niên Đại</span>
        <div class="stat-val">12,4 Tỷ Năm</div>
        <div class="stat-sub">Quần thể sao II cổ</div>
      </div>
      <div class="stat-pill">
        <span class="stat-label">Khối Lượng</span>
        <div class="stat-val">1,82 M⊕</div>
        <div class="stat-sub">Gấp 1,82 lần Trái Đất</div>
      </div>
      <div class="stat-pill">
        <span class="stat-label">Ngày-Đêm</span>
        <div class="stat-val">32,0 Giờ</div>
        <div class="stat-sub">Thủy triều nhịp đôi</div>
      </div>
      <div class="stat-pill">
        <span class="stat-label">Nghiêng Trục</span>
        <div class="stat-val">21,8°</div>
        <div class="stat-sub">Bốn mùa điều hòa</div>
      </div>
      <div class="stat-pill">
        <span class="stat-label">Hệ Vệ Tinh</span>
        <div class="stat-val">2 Mặt Trăng</div>
        <div class="stat-sub">Selene-I & Selene-II</div>
      </div>
      <div class="stat-pill">
        <span class="stat-label">Từ Quyển</span>
        <div class="stat-val">8× Trái Đất</div>
        <div class="stat-sub">Bảo vệ tuyệt đối</div>
      </div>
    </div>

    <!-- Interactive Celestial Canvas: MEOWN-2407 + Moons Selene I & II -->
    <div class="canvas-container">
      <div class="hud-overlay">MÔ PHỎNG VẬN HÀNH QUỸ ĐẠO // CỘNG HƯỞNG LAPLACE SELENE I & II</div>
      <div class="hud-sub">CHU KỲ TỰ QUAY: 32.0h // ĐỘ NGHIÊNG: 21.8°</div>
      <canvas id="spaceCanvas"></canvas>
    </div>

    <!-- ERA I -->
    <div class="era-section">
      <div class="era-header">
        <div class="era-title">
          <span>✦ KỶ NGUYÊN I: BÌNH MINH BỒI TỤ VŨ TRỤ & VA CHẠM ACHERON</span>
        </div>
        <span class="era-time">12,4 - 11,2 TỶ NĂM TRƯỚC</span>
      </div>
      <div class="sub-grid">
        <div class="sub-card">
          <h4>1. Bẫy Dị Thường Lượng Tử Sơ Khai</h4>
          <p>Tâm khối bồi tụ đã va chạm và nuốt trọn một điểm dị thường tô-pô học (micro-singularity) còn sót lại sau vụ nổ Big Bang. Lực hút cực hạn tạo ra hạt nhân hành tinh vĩnh cửu, duy trì trường hấp dẫn và mô-men ổn định suốt 12,4 tỷ năm.</p>
        </div>
        <div class="sub-card">
          <h4>2. Đại Dương Magma & Từ Quyển Siêu Cường</h4>
          <p>Nóng chảy sâu hơn 3.000 km biến hành tinh thành quả cầu magma rực lửa. Kim loại nặng chìm sâu tạo lõi sắt-niken siêu nén (bán kính 2.400 km), kích hoạt Geodynamo sinh ra từ quyển siêu cường gấp 8 lần Trái Đất.</p>
        </div>
        <div class="sub-card" style="grid-column: 1 / -1;">
          <h4>3. Va Chạm Acheron & Hệ Hai Mặt Trăng Selene-I, Selene-II (Khoảng 11,9 tỷ năm trước)</h4>
          <p>Thiên thể Acheron va chạm sượt góc 34°, làm nghiêng trục địa cực về 21,8° (tạo 4 mùa khí hậu) và bắn tung vành đai bụi silicat nóng chảy. Vành đai kết tụ thành 2 vệ tinh tự nhiên <strong>Selene-I</strong> và <strong>Selene-II</strong> cộng hưởng Laplace. Lực ma sát thủy triều nhịp đôi hãm dần tốc độ tự quay về đúng 32 giờ chuẩn.</p>
        </div>
      </div>
    </div>

    <!-- ERA II -->
    <div class="era-section">
      <div class="era-header">
        <div class="era-title">
          <span>✦ KỶ NGUYÊN II: THỦY QUYỂN NGUYÊN KHAI & TINH THỂ MEOWN</span>
        </div>
        <span class="era-time">11,2 - 8,5 TỶ NĂM TRƯỚC</span>
      </div>
      <div class="sub-grid">
        <div class="sub-card">
          <h4>1. Thoát Khí & Đại Dương Siêu Mặn</h4>
          <p>Khí quyển nguyên thủy áp suất 5,2 bar (nước sôi ở 153°C). Khi bề mặt nguội dưới 153°C, mưa acid xối xả kéo dài hơn 8 triệu năm đã lấp đầy các bồn trũng, kiến tạo đại dương bao phủ 82% bề mặt với độ mặn gấp 4 lần đại dương Trái Đất.</p>
        </div>
        <div class="sub-card">
          <h4>2. Sự Ra Đời Của Tinh Thể MEOWN</h4>
          <p>Tại đới ranh giới D'' sâu 2.800 km (áp suất > 135 GPa, nhiệt độ > 3.800 K), sóng hạ nguyên tử từ lõi kỳ dị kích thích khóa các electron silicat vào dao động lượng tử đồng bộ, chuyển pha thành <strong>Tinh Thể MEOWN</strong> thể rắn siêu dẫn.</p>
        </div>
      </div>
      <div class="crystal-box">
        <h4>✦ Đặc Tính Năng Lượng Địa Chất Độc Nhất Vô Nhị</h4>
        <p>Các chùm magma nhiệt siêu sâu (Superplumes) đẩy khoáng vật này lên lớp vỏ ngoài thành các khối lục giác siêu cứng dọc theo đứt gãy đại dương. Mạng tinh thể này sở hữu khả năng bảo toàn mật độ thế năng vĩnh cửu không suy giảm, trở thành nền tảng năng lượng cho toàn hành tinh.</p>
      </div>
    </div>

    <!-- ERA III -->
    <div class="era-section">
      <div class="era-header">
        <div class="era-title">
          <span>✦ KỶ NGUYÊN III: KIẾN TẠO MẢNG & BIẾN CỐ BĂNG HÀ TOÀN CẦU</span>
        </div>
        <span class="era-time">8,5 - 4,0 TỶ NĂM TRƯỚC</span>
      </div>
      <div class="sub-grid">
        <div class="sub-card">
          <h4>1. Phân Rã Siêu Lục Địa Pangaea-M</h4>
          <p>Khoảng 7,5 tỷ năm trước, siêu lục địa Pangaea-M nứt vỡ thành 4 mảng lục địa độc lập. Hoạt động uốn nếp kiến tạo đẩy các rặng núi Tinh Thể MEOWN trồi lên mặt đất, kiến tạo nên những rặng núi khoáng vật phát sáng cao hàng nghìn mét.</p>
        </div>
        <div class="sub-card">
          <h4>2. Quả Cầu Băng Cổ Đại & Tôi Luyện Tinh Thể</h4>
          <p>Khoảng 6,2 tỷ năm trước, nhiệt độ toàn cầu tụt dốc xuống âm 75°C, băng dày 8–15 km giam hãm suốt 1,5 tỷ năm. Áp suất thủy tĩnh khổng lồ đã ép vỡ vi bọt khí, tôi luyện Tinh Thể MEOWN đạt độ tinh khiết phân tử tuyệt đối, triệt tiêu phân rã tự phát.</p>
        </div>
        <div class="sub-card" style="grid-column: 1 / -1;">
          <h4>3. Đại Phun Trào Giải Thoát Địa Chất (4,5 - 4,0 tỷ năm trước)</h4>
          <p>Hàng loạt chuỗi siêu núi lửa xuyên thủng lớp băng, tống khí nhà kính vào khí quyển làm nhiệt độ tăng vọt hơn 100°C. Lũ tan băng dữ dội xé toạc lục địa, hình thành các lòng chảo đại dương hiện đại và đưa nước biển về mức cân bằng hóa học ngọt hóa ổn định.</p>
        </div>
      </div>
    </div>

    <!-- ERA IV -->
    <div class="era-section">
      <div class="era-header">
        <div class="era-title">
          <span>✦ KỶ NGUYÊN IV: CÂN BẰNG ĐỊA HÓA & CỔ HÀNH TINH TRƯỜNG TỒN</span>
        </div>
        <span class="era-time">4,0 TỶ NĂM TRƯỚC - HIỆN TẠI</span>
      </div>
      <div class="sub-grid">
        <div class="sub-card">
          <h4>1. Hệ Thống Tự Điều Hòa Nhiệt Độ</h4>
          <p>Mạng lưới Tinh Thể MEOWN trải dài từ lõi tới rặng núi hoạt động như bộ điều nhiệt khổng lồ: giải phóng nhiệt khi trời lạnh và hấp thu quang năng khi trời nóng, giữ nhiệt độ bề mặt luôn ổn định từ 18°C đến 32°C suốt hàng tỷ năm.</p>
        </div>
        <div class="sub-card">
          <h4>2. Cái Nôi Trường Tồn Của Văn Minh</h4>
          <p>Khí quyển thứ sinh áp suất 1,4 bar giàu nitơ và từ quyển siêu cường vững chãi đã biến MEOWN-2407 thành đài tưởng niệm bất biến của vũ trụ, trở thành ngôi nhà chung trường tồn nuôi dưỡng sự cộng sinh giữa chủng tộc MEOWN và Nhân loại.</p>
        </div>
      </div>
    </div>

    <div class="footer-stamp">
      <span>TƯ LIỆU: CỤC VĂN KHỐ CỔ HÀNH TINH MEOWN-2407</span>
      <span>MÃ KHÓA: GEOLOGY-CHRONICLE-2407</span>
    </div>
  </div>

  <script>
    // Celestial Canvas Simulation: MEOWN-2407 with core + Moons Selene I & II
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.2 + 0.05,
      alpha: Math.random() * 0.8 + 0.2
    }));

    let angle1 = 0;
    let angle2 = 1.2;
    let pulse = 0;

    function animate() {
      ctx.fillStyle = '#020408';
      ctx.fillRect(0, 0, width, height);

      // Stars
      ctx.fillStyle = '#ffffff';
      stars.forEach(star => {
        star.y += star.speed;
        if (star.y > height) star.y = 0;
        ctx.globalAlpha = star.alpha;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      const cx = width / 2;
      const cy = height / 2;

      // Orbit 1 (Selene-I inner orbit)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 95, 45, -0.15, 0, Math.PI * 2);
      ctx.stroke();

      // Orbit 2 (Selene-II outer orbit)
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.25)';
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 150, 75, -0.15, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Magnetic field flux lines
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 50, 80, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Central MEOWN-2407 Body
      const pRadius = 26;
      pulse += 0.03;
      const corePulse = Math.sin(pulse) * 4;

      // Atmosphere glow
      const atmoGlow = ctx.createRadialGradient(cx, cy, pRadius * 0.6, cx, cy, pRadius + 14);
      atmoGlow.addColorStop(0, '#0284c7');
      atmoGlow.addColorStop(0.6, 'rgba(6, 182, 212, 0.35)');
      atmoGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = atmoGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, pRadius + 14, 0, Math.PI * 2);
      ctx.fill();

      // Planet disk
      const planetGrad = ctx.createRadialGradient(cx - 8, cy - 8, 4, cx, cy, pRadius);
      planetGrad.addColorStop(0, '#0e7490');
      planetGrad.addColorStop(0.7, '#083344');
      planetGrad.addColorStop(1, '#020617');
      ctx.fillStyle = planetGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, pRadius, 0, Math.PI * 2);
      ctx.fill();

      // Singularity core glow
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5 + corePulse * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('MEOWN-2407', cx - 35, cy + pRadius + 16);

      // Selene-I (Closer moon, faster orbit)
      const rot = -0.15;
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      const raw1x = Math.cos(angle1) * 95;
      const raw1y = Math.sin(angle1) * 45;
      const m1x = cx + (raw1x * cosR - raw1y * sinR);
      const m1y = cy + (raw1x * sinR + raw1y * cosR);

      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(m1x, m1y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('Selene-I', m1x + 8, m1y + 3);

      // Selene-II (Outer moon, Laplace resonance)
      const raw2x = Math.cos(angle2) * 150;
      const raw2y = Math.sin(angle2) * 75;
      const m2x = cx + (raw2x * cosR - raw2y * sinR);
      const m2y = cy + (raw2x * sinR + raw2y * cosR);

      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(m2x, m2y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.fillText('Selene-II', m2x + 9, m2y + 3);

      angle1 += 0.024; // Selene-I faster
      angle2 += 0.012; // Selene-II 1:2 resonance

      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>`;
  }

  // Generic template for other categories
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - MEOWN-2407 Archive</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #07090e;
      color: #e2e8f0;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      padding: 24px;
      overflow-x: hidden;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .badge {
      display: inline-block;
      font-family: monospace;
      font-size: 11px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: ${accentColor};
      border: 1px solid rgba(6, 182, 212, 0.3);
      padding: 4px 10px;
      border-radius: 4px;
      background: rgba(6, 182, 212, 0.05);
      margin-bottom: 12px;
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 6px;
      letter-spacing: -0.02em;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 14px;
      margin-bottom: 24px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      background: #0c1017;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 18px;
    }
    .card h3 {
      font-size: 15px;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 8px;
    }
    .card p {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.6;
    }
    .footer-stamp {
      border-top: 1px solid #1e293b;
      padding-top: 14px;
      font-family: monospace;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">LƯU TRỮ TƯ LIỆU // MÃ PHÂN HỆ: ${category.toUpperCase()}</div>
    <h1>${title}</h1>
    <div class="subtitle">${subtitle}</div>

    <div class="grid-2">
      <div class="card">
        <h3>✦ Thông Số Phân Hệ</h3>
        <p>Hồ sơ ghi chép đã qua xác thực của Cục Văn Khố MEOWN-2407. Quản trị viên có thể cập nhật thêm thông tin và tải tệp HTML mới bất kỳ lúc nào.</p>
      </div>
      <div class="card">
        <h3>✦ Quy Chuẩn Đồng Bộ</h3>
        <p>Tất cả tư liệu phân hệ đều có cấu trúc tương thích, hỗ trợ tải file HTML riêng và hiển thị tương tác trong khung cát lập an toàn.</p>
      </div>
    </div>

    <div class="footer-stamp">
      <span>TƯ LIỆU: BAN VĂN KHỐ VŨ TRỤ MEOWN-2407</span>
      <span>MÃ KHÓA: SEC-2407-VERIFIED</span>
    </div>
  </div>
</body>
</html>`;
}

// Initial default seed contents for the 5 tabs
function getInitialContent() {
  return {
    history: {
      id: 'history',
      title: 'Lịch Sử Kiến Tạo & Tiến Hóa Cổ Hành Tinh',
      subtitle: 'Biên niên sử 12,4 tỷ năm: Bình minh bồi tụ, bẫy kỳ dị lượng tử, biến cố Acheron đến mạng lưới Tinh Thể MEOWN trường tồn',
      summary: 'MEOWN-2407 là cổ hành tinh 12,4 tỷ năm tuổi, sở hữu tâm vi kỳ dị lượng tử và khối lượng 1,82 M⊕. Sau vụ va chạm Acheron sinh ra 2 mặt trăng Selene-I và Selene-II, hành tinh trải qua 4 kỷ nguyên địa chất kỳ vĩ, tôi luyện nên Tinh Thể MEOWN siêu dẫn – nguồn năng lượng địa nhiệt vĩnh cửu điều hòa sự sống.',
      highlights: [
        'Niên đại 12,4 tỷ năm: Sinh ra từ vũ trụ sơ khai, quay quanh hệ sao đôi cổ thuộc Quần thể sao II.',
        'Tâm Vi Kỳ Dị Lượng Tử: Lực hút cực hạn tạo lõi sắt-niken siêu nén và từ quyển siêu cường gấp 8 lần Trái Đất.',
        'Hệ Vệ Tinh Đôi Selene-I & II: Hình thành sau cú va chạm Acheron (11,9 tỷ năm trước), nghiêng trục 21,8° và đưa ngày-đêm về 32 giờ chuẩn.',
        "Nguồn gốc Tinh Thể MEOWN: Kết tinh tại ranh giới D'' sâu 2.800 km (135 GPa, 3.800 K), được tôi luyện qua kỷ nguyên Quả Cầu Băng (-75°C) đạt độ tinh khiết tuyệt đối.",
        "Mạng Lưới Tự Điều Hòa: Tinh thể trải khắp vỏ hành tinh giữ nhiệt độ ổn định 18°C – 32°C suốt hàng tỷ năm qua."
      ],
      htmlFileUrl: '/uploads/history.html',
      htmlContent: '',
      videoUrl: '',
      lastUpdated: new Date().toISOString(),
      version: 1
    },
    geography: {
      id: 'geography',
      title: 'Địa Lý & Cảnh Quan Sinh Thái',
      subtitle: 'Đại lục địa pha lê, quần đảo lơ lửng và đại dương năng lượng',
      summary: 'Bề mặt MEOWN-2407 được bao bọc bởi 3 đại lục địa thạch anh phát quang sinh học, quần đảo không trọng lực Celestia và đại dương hydro lỏng thanh khiết điều tiết khí quyển toàn cầu.',
      highlights: [
        'Lục địa Aethel: Nơi đặt Thủ đô Liên Hiệp và rặng tinh thể năng lượng Aether.',
        'Quần đảo Lơ Lửng Celestia: Quần thể đảo bay với trọng lực 0.6G lý tưởng cho nghiên cứu học thuật.',
        'Đại dương Pha Lê Cyan: Cung cấp nguồn nước giàu ion khoáng nuôi dưỡng thảm thực vật phát sáng.',
        'Vực Thẳm Tinh Vân: Vùng trũng địa chất sâu nhất chứa mỏ đá cộng hưởng sóng tâm thức.'
      ],
      htmlFileUrl: '/uploads/geography.html',
      htmlContent: '',
      videoUrl: '',
      lastUpdated: new Date().toISOString(),
      version: 1
    },
    species: {
      id: 'species',
      title: 'Chủng Tộc & Dân Cư',
      subtitle: 'Cộng đồng cư dân MEOWN bản địa và người Trái Đất định cư',
      summary: 'Xã hội đa chủng tộc văn minh tôn trọng tự do và giao thoa văn hóa. Cư dân chủng MEOWN sở hữu trực giác nhạy bén, khả năng cảm thụ sóng năng lượng kết hợp cùng tư duy kiến tạo công nghệ của con người.',
      highlights: [
        'Chủng Tộc MEOWN-Felis: Cư dân bản địa mang hình thái bán nhân hình thanh nhã, mắt thích nghi bóng tối và thính giác siêu tần.',
        'Nhân Loại Trái Đất (Terrans): Đóng góp nền tảng kỹ thuật viễn thông, kiến trúc và nghệ thuật đương đại.',
        'Thế Hệ Cộng Sinh: Thế hệ trẻ lớn lên trong các học viện đa loài, thành thạo cả ngôn ngữ âm thanh và sóng tâm thức.',
        'Tập tục & Văn Hóa: Lễ hội Trăng Đôi Sol-Meown tổ chức định kỳ kỷ niệm tình hữu nghị liên hành tinh.'
      ],
      htmlFileUrl: '/uploads/species.html',
      htmlContent: '',
      videoUrl: '',
      lastUpdated: new Date().toISOString(),
      version: 1
    },
    economy: {
      id: 'economy',
      title: 'Kinh Tế & Khí Hậu Sinh Quyển',
      subtitle: 'Năng lượng Tinh Thạch Aether và Hệ sinh thái điều hòa toàn cầu',
      summary: 'Kinh tế dựa trên năng lượng sạch vĩnh cửu từ Tinh Thạch Aether, thương mại liên sao qua đơn vị Tín Dụng Tinh Cầu (AEC). Hệ thống vi khí hậu được quản lý thông minh giữ nhiệt độ lý tưởng 21.5°C.',
      highlights: [
        'Đồng tiền chung: Tín Dụng Aether (AEC) bảo chứng bởi trữ lượng năng lượng tái sinh sạch.',
        'Hệ sinh thái Gaia-Grid: Mạng lưới tháp điều hòa vi khí hậu ngăn ngừa bão vũ trụ và bức xạ mặt trời.',
        'Ngành công nghiệp mũi nhọn: Động cơ bước nhảy lượng tử, dược liệu phát quang sinh học và du lịch sinh thái sao.',
        'Chính sách an sinh: Phổ cập nhà ở, y tế tái tạo mô tế bào và giao thông đệm từ miễn phí toàn cầu.'
      ],
      htmlFileUrl: '/uploads/economy.html',
      htmlContent: '',
      videoUrl: '',
      lastUpdated: new Date().toISOString(),
      version: 1
    },
    systems: {
      id: 'systems',
      title: 'Các Hệ Thống Liên Tinh',
      subtitle: 'Mạng lưới Cổng Bước Nhảy, Hạm đội Liên Hiệp và Tuyến Hàng Hải Sao',
      summary: 'Hệ thống hạ tầng liên tinh gồm 12 trạm không gian quỹ đạo, 3 cổng bước nhảy vĩ mô kết nối Trái Đất, MEOWN-2407 và các trạm trung chuyển trong Liên Bang Sao.',
      highlights: [
        'Cổng Bước Nhảy Alpha-9: Nút thắt giao thông huyết mạch đảm bảo lưu thông hơn 200 lượt tuần dương hạm mỗi ngày.',
        'Trạm Quỹ Đạo Aethel-Prime: Trung tâm ngoại giao, kiểm soát không lưu và tiếp nhiên liệu tinh thể.',
        'Hạm Đội Bảo Hộ Star Aegis: Lực lượng tuần tra chung giữ gìn an ninh hàng hải liên sao khỏi hải tặc vũ trụ.',
        'Hiệp Định Không Gian Mở: Cam kết phi quân sự hóa các tuyến đường du lịch và nghiên cứu khoa học.'
      ],
      htmlFileUrl: '/uploads/systems.html',
      htmlContent: '',
      videoUrl: '',
      lastUpdated: new Date().toISOString(),
      version: 1
    }
  };
}

// Initial audio tracks for the mini radio
function getInitialTracks() {
  return [
    {
      id: 'track-1',
      title: 'Cosmic Lullaby of MEOWN',
      artist: 'Aethel Soundscape Ensemble',
      url: 'https://actions.google.com/sounds/v1/science_fiction/space_ambience.ogg',
      duration: '02:45',
      isCustom: false,
      addedAt: new Date().toISOString()
    },
    {
      id: 'track-2',
      title: 'Starlight Transit (Earth to MEOWN-2407)',
      artist: 'Celestia Orbital Symphony',
      url: 'https://actions.google.com/sounds/v1/science_fiction/deep_space_pulse.ogg',
      duration: '03:10',
      isCustom: false,
      addedAt: new Date().toISOString()
    },
    {
      id: 'track-3',
      title: 'Whispers of Crystal Sea',
      artist: 'Horizon Ambient Duo',
      url: 'https://actions.google.com/sounds/v1/water/gentle_stream_waterfall.ogg',
      duration: '03:30',
      isCustom: false,
      addedAt: new Date().toISOString()
    }
  ];
}

// Ensure default content file and HTML files exist
function initStorage() {
  const initialContent = getInitialContent();
  let content = initialContent;
  if (fs.existsSync(CONTENT_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
      content = { ...content, ...data };
      // Always ensure history tab has the latest canon unless custom-uploaded
      content.history = { ...initialContent.history, version: (data.history?.version || 1) + 1 };
    } catch (e) {
      console.error('Error reading content file, re-initializing:', e);
    }
  }

  // Ensure default html file exists or regenerate for history
  const categories = ['history', 'geography', 'species', 'economy', 'systems'];
  for (const cat of categories) {
    const filePath = path.join(UPLOADS_DIR, `${cat}.html`);
    if (cat === 'history' || !fs.existsSync(filePath)) {
      const catData = (content as any)[cat];
      const html = generateDefaultHtmlContent(
        cat,
        catData.title,
        catData.subtitle,
        cat === 'history' ? '#06b6d4' : cat === 'geography' ? '#10b981' : cat === 'species' ? '#a855f7' : cat === 'economy' ? '#f59e0b' : '#3b82f6',
        cat === 'history'
      );
      fs.writeFileSync(filePath, html, 'utf-8');
      (content as any)[cat].htmlFileUrl = `/uploads/${cat}.html`;
      (content as any)[cat].htmlContent = html;
    } else {
      if (!(content as any)[cat].htmlContent) {
        (content as any)[cat].htmlContent = fs.readFileSync(filePath, 'utf-8');
      }
    }
  }

  fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8');

  // Tracks
  if (!fs.existsSync(TRACKS_FILE)) {
    fs.writeFileSync(TRACKS_FILE, JSON.stringify(getInitialTracks(), null, 2), 'utf-8');
  }
}

initStorage();

// Middleware to authenticate admin token
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Chưa đăng nhập hoặc thiếu token xác thực quản trị viên.' });
    return;
  }
  const token = authHeader.substring(7).trim();
  if (!validAdminTokens.has(token)) {
    res.status(403).json({ error: 'Phiên làm việc quản trị viên không hợp lệ hoặc đã hết hạn.' });
    return;
  }
  next();
}

// --- API ROUTES ---

// 1. Admin login: password checked purely server-side
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu quản trị viên.' });
    return;
  }

  // Strict server-side verification: password is NEVER exposed to the client
  if (password === ADMIN_PASSWORD) {
    const token = crypto.randomUUID();
    validAdminTokens.add(token);
    res.json({
      success: true,
      message: 'Đăng nhập Quản Trị Viên thành công.',
      token
    });
  } else {
    res.status(401).json({
      error: 'Mật khẩu quản trị viên không chính xác. Quyền truy cập bị từ chối.'
    });
  }
});

// 2. Admin verify session
app.get('/api/admin/verify', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (validAdminTokens.has(token)) {
      res.json({ authenticated: true });
      return;
    }
  }
  res.json({ authenticated: false });
});

// 3. Admin logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    validAdminTokens.delete(token);
  }
  res.json({ success: true, message: 'Đã đăng xuất phiên làm việc.' });
});

// 4. Get content for all tabs
app.get('/api/content', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'));
      res.json(data);
    } else {
      res.json(getInitialContent());
    }
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ error: 'Không thể đọc dữ liệu lưu trữ.' });
  }
});

// 5. Update content or upload HTML file for a tab (Admin only)
app.post('/api/admin/content/:tabId', requireAdmin, (req: Request, res: Response) => {
  const { tabId } = req.params;
  const { title, subtitle, summary, highlights, htmlContent, fileBase64, filename, videoUrl } = req.body;

  try {
    let contentData = fs.existsSync(CONTENT_FILE)
      ? JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf-8'))
      : getInitialContent();

    if (!contentData[tabId]) {
      contentData[tabId] = {
        id: tabId,
        title: title || tabId,
        subtitle: subtitle || '',
        summary: summary || '',
        highlights: highlights || [],
        htmlFileUrl: '',
        htmlContent: '',
        videoUrl: videoUrl || '',
        lastUpdated: new Date().toISOString(),
        version: 1
      };
    }

    const currentTab = contentData[tabId];

    if (title) currentTab.title = title;
    if (subtitle !== undefined) currentTab.subtitle = subtitle;
    if (summary !== undefined) currentTab.summary = summary;
    if (highlights && Array.isArray(highlights)) currentTab.highlights = highlights;
    if (videoUrl !== undefined) currentTab.videoUrl = videoUrl;

    // Handle uploaded HTML file base64 or raw string
    if (fileBase64 && filename) {
      const cleanName = `${tabId}_${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const targetPath = path.join(UPLOADS_DIR, cleanName);
      const buffer = Buffer.from(fileBase64, 'base64');
      fs.writeFileSync(targetPath, buffer);
      currentTab.htmlFileUrl = `/uploads/${cleanName}`;
      currentTab.htmlContent = buffer.toString('utf-8');
    } else if (htmlContent !== undefined) {
      currentTab.htmlContent = htmlContent;
      // Also write to tabId.html
      const targetPath = path.join(UPLOADS_DIR, `${tabId}.html`);
      fs.writeFileSync(targetPath, htmlContent, 'utf-8');
      currentTab.htmlFileUrl = `/uploads/${tabId}.html?v=${Date.now()}`;
    }

    currentTab.lastUpdated = new Date().toISOString();
    currentTab.version = (currentTab.version || 1) + 1;

    fs.writeFileSync(CONTENT_FILE, JSON.stringify(contentData, null, 2), 'utf-8');
    res.json({
      success: true,
      message: `Đã lưu và đồng bộ tài liệu phân hệ "${tabId}" thành công.`,
      content: currentTab
    });
  } catch (error) {
    console.error(`Error updating content for ${tabId}:`, error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lưu tư liệu.' });
  }
});

// 6. Get tracks for mini radio
app.get('/api/tracks', (_req: Request, res: Response) => {
  try {
    if (fs.existsSync(TRACKS_FILE)) {
      const tracks = JSON.parse(fs.readFileSync(TRACKS_FILE, 'utf-8'));
      res.json({ tracks });
    } else {
      res.json({ tracks: getInitialTracks() });
    }
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ error: 'Không thể đọc danh sách âm nhạc.' });
  }
});

// 7. Upload new MP3 track (Admin only)
app.post('/api/admin/tracks', requireAdmin, (req: Request, res: Response) => {
  const { title, artist, fileBase64, filename, directUrl, duration } = req.body;

  if (!title || !artist) {
    res.status(400).json({ error: 'Vui lòng điền tên bài hát và tên ca sĩ / nghệ sĩ.' });
    return;
  }

  try {
    let audioUrl = directUrl || '';

    if (fileBase64 && filename) {
      const cleanName = `track_${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const targetPath = path.join(UPLOADS_DIR, cleanName);
      const buffer = Buffer.from(fileBase64, 'base64');
      fs.writeFileSync(targetPath, buffer);
      audioUrl = `/uploads/${cleanName}`;
    }

    if (!audioUrl) {
      res.status(400).json({ error: 'Vui lòng tải lên tệp âm thanh MP3 hoặc nhập đường dẫn URL.' });
      return;
    }

    let tracks = fs.existsSync(TRACKS_FILE)
      ? JSON.parse(fs.readFileSync(TRACKS_FILE, 'utf-8'))
      : getInitialTracks();

    const newTrack = {
      id: `track-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim(),
      url: audioUrl,
      duration: duration || '03:15',
      isCustom: true,
      addedAt: new Date().toISOString()
    };

    tracks.unshift(newTrack);
    fs.writeFileSync(TRACKS_FILE, JSON.stringify(tracks, null, 2), 'utf-8');

    res.json({
      success: true,
      message: 'Đã tải lên và bổ sung bài hát vào đài phát thanh Radio thành công.',
      track: newTrack
    });
  } catch (error) {
    console.error('Error uploading track:', error);
    res.status(500).json({ error: 'Đã xảy ra lỗi khi tải lên bài hát.' });
  }
});

// 8. Delete custom track (Admin only)
app.delete('/api/admin/tracks/:trackId', requireAdmin, (req: Request, res: Response) => {
  const { trackId } = req.params;
  try {
    let tracks = fs.existsSync(TRACKS_FILE)
      ? JSON.parse(fs.readFileSync(TRACKS_FILE, 'utf-8'))
      : getInitialTracks();

    tracks = tracks.filter((t: any) => t.id !== trackId);
    fs.writeFileSync(TRACKS_FILE, JSON.stringify(tracks, null, 2), 'utf-8');

    res.json({ success: true, message: 'Đã xóa bài hát khỏi danh sách.' });
  } catch (error) {
    res.status(500).json({ error: 'Không thể xóa bài hát.' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In dev, use Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MEOWN-2407] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
