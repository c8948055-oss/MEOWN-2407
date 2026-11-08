/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { HeroSection } from './components/HeroSection';
import { CategoryViewer } from './components/CategoryViewer';
import { MiniRadio } from './components/MiniRadio';
import { AdminModal } from './components/AdminModal';
import { TabId, TabConfig, AllContent, AudioTrack } from './types';
import { ShieldCheck, RefreshCw } from 'lucide-react';

const TABS_CONFIG: TabConfig[] = [
  {
    id: 'history',
    name: 'Lịch Sử',
    shortName: 'Lịch Sử',
    code: 'CHRONICLE-01',
    accent: '#06b6d4',
    description: 'Biên niên sử 12,4 tỷ năm: Bồi tụ vũ trụ, bẫy kỳ dị lượng tử, 4 kỷ nguyên kiến tạo địa chất và Tinh Thể MEOWN.'
  },
  {
    id: 'geography',
    name: 'Địa Lý',
    shortName: 'Địa Lý',
    code: 'TERRAIN-02',
    accent: '#10b981',
    description: 'Đại lục địa pha lê, quần đảo lơ lửng và đại dương năng lượng.'
  },
  {
    id: 'species',
    name: 'Chủng Tộc',
    shortName: 'Chủng Tộc',
    code: 'SPECIES-03',
    accent: '#a855f7',
    description: 'Chủng tộc MEOWN bản địa, cộng đồng người Trái Đất và văn hóa cộng sinh.'
  },
  {
    id: 'economy',
    name: 'Kinh Tế & Khí Hậu',
    shortName: 'Kinh Tế',
    code: 'ECOLOGY-04',
    accent: '#f59e0b',
    description: 'Năng lượng Tinh Thạch Aether, tiền tệ AEC và mạng lưới điều hòa Gaia-Grid.'
  },
  {
    id: 'systems',
    name: 'Các Hệ Thống Liên Tinh',
    shortName: 'Liên Tinh',
    code: 'GATEWAY-05',
    accent: '#3b82f6',
    description: 'Cổng bước nhảy không gian, hạm đội bảo hộ và hiệp định hàng hải sao.'
  }
];

// Dữ liệu nội dung mặc định của 5 phân hệ
const DEFAULT_CONTENT: AllContent = {
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
      'Mạng Lưới Tự Điều Hòa: Tinh thể trải khắp vỏ hành tinh giữ nhiệt độ ổn định 18°C – 32°C suốt hàng tỷ năm qua.'
    ],
    htmlFileUrl: '',
    htmlContent: `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lịch Sử Kiến Tạo & Tiến Hóa Cổ Hành Tinh MEOWN-2407</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #06080d; color: #e2e8f0; font-family: system-ui, sans-serif; line-height: 1.6; padding: 24px; }
    .badge { display: inline-block; font-family: monospace; font-size: 11px; text-transform: uppercase; color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.3); padding: 4px 10px; border-radius: 4px; background: rgba(6, 182, 212, 0.05); margin-bottom: 12px; }
    h1 { font-size: 26px; font-weight: 800; color: #ffffff; margin-bottom: 6px; }
    .subtitle { color: #94a3b8; font-size: 14px; margin-bottom: 24px; }
    .stats-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px; margin-bottom: 24px; }
    .stat-pill { background: #0c1018; border: 1px solid #1e293b; border-radius: 8px; padding: 12px; }
    .stat-label { font-size: 10px; font-family: monospace; text-transform: uppercase; color: #64748b; display: block; margin-bottom: 4px; }
    .stat-val { font-size: 16px; font-weight: 700; color: #38bdf8; font-family: monospace; }
    .stat-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
    .canvas-container { position: relative; width: 100%; height: 320px; background: #020408; border: 1px solid #1e293b; border-radius: 10px; overflow: hidden; margin-bottom: 28px; }
    canvas { width: 100%; height: 100%; display: block; }
    .hud-overlay { position: absolute; top: 12px; left: 14px; font-family: monospace; font-size: 11px; color: rgba(56, 189, 248, 0.9); background: rgba(4, 6, 12, 0.75); padding: 5px 10px; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.25); }
    .era-section { background: #0a0e17; border: 1px solid #1e293b; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
    .era-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; border-bottom: 1px solid #1e293b; padding-bottom: 10px; }
    .era-title { font-size: 16px; font-weight: 700; color: #f8fafc; }
    .era-time { font-family: monospace; font-size: 11px; color: #06b6d4; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.25); padding: 2px 8px; border-radius: 4px; }
    .sub-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
    .sub-card { background: #060911; border: 1px solid #192231; border-radius: 8px; padding: 14px; }
    .sub-card h4 { font-size: 13px; font-weight: 600; color: #38bdf8; margin-bottom: 6px; }
    .sub-card p { font-size: 12.5px; color: #94a3b8; line-height: 1.55; }
    .crystal-box { background: rgba(6, 182, 212, 0.04); border: 1px solid rgba(6, 182, 212, 0.25); border-radius: 8px; padding: 16px; margin-top: 14px; }
    .crystal-box h4 { font-size: 13.5px; font-weight: 700; color: #22d3ee; margin-bottom: 6px; }
    .crystal-box p { font-size: 12.5px; color: #cbd5e1; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="badge">BIÊN NIÊN ĐỊA CHẤT & TIẾN HÓA // MEOWN-2407</div>
  <h1>Lịch Sử Hình Thành & Cổ Hành Tinh MEOWN-2407</h1>
  <div class="subtitle">Niên đại 12,4 tỷ năm · Khối lượng 1,82 M⊕ · Hệ mặt trăng đôi Selene-I & Selene-II · Năng lượng Tinh Thể MEOWN vĩnh cửu</div>
  <div class="stats-strip">
    <div class="stat-pill"><span class="stat-label">Niên Đại</span><div class="stat-val">12,4 Tỷ Năm</div><div class="stat-sub">Quần thể sao II cổ</div></div>
    <div class="stat-pill"><span class="stat-label">Khối Lượng</span><div class="stat-val">1,82 M⊕</div><div class="stat-sub">Gấp 1,82 lần Trái Đất</div></div>
    <div class="stat-pill"><span class="stat-label">Ngày-Đêm</span><div class="stat-val">32,0 Giờ</div><div class="stat-sub">Thủy triều nhịp đôi</div></div>
    <div class="stat-pill"><span class="stat-label">Nghiêng Trục</span><div class="stat-val">21,8°</div><div class="stat-sub">Bốn mùa điều hòa</div></div>
    <div class="stat-pill"><span class="stat-label">Hệ Vệ Tinh</span><div class="stat-val">2 Mặt Trăng</div><div class="stat-sub">Selene-I & Selene-II</div></div>
    <div class="stat-pill"><span class="stat-label">Từ Quyển</span><div class="stat-val">8× Trái Đất</div><div class="stat-sub">Bảo vệ tuyệt đối</div></div>
  </div>
  <div class="canvas-container">
    <div class="hud-overlay">MÔ PHỎNG VẬN HÀNH QUỸ ĐẠO // CỘNG HƯỞNG LAPLACE SELENE I & II</div>
    <canvas id="spaceCanvas"></canvas>
  </div>
  <div class="era-section">
    <div class="era-header"><span class="era-title">✦ KỶ NGUYÊN I: BÌNH MINH BỒI TỤ VŨ TRỤ & VA CHẠM ACHERON</span><span class="era-time">12,4 - 11,2 TỶ NĂM TRƯỚC</span></div>
    <div class="sub-grid">
      <div class="sub-card"><h4>1. Bẫy Dị Thường Lượng Tử Sơ Khai</h4><p>Tâm khối bồi tụ đã va chạm và nuốt trọn một điểm dị thường tô-pô học (micro-singularity) còn sót lại sau vụ nổ Big Bang. Lực hút cực hạn tạo ra hạt nhân hành tinh vĩnh cửu.</p></div>
      <div class="sub-card"><h4>2. Đại Dương Magma & Từ Quyển Siêu Cường</h4><p>Nóng chảy sâu hơn 3.000 km biến hành tinh thành quả cầu magma rực lửa. Kim loại nặng chìm sâu tạo lõi sắt-niken siêu nén, sinh ra từ quyển gấp 8 lần Trái Đất.</p></div>
      <div class="sub-card" style="grid-column: 1 / -1;"><h4>3. Va Chạm Acheron & Hệ Hai Mặt Trăng Selene-I, Selene-II</h4><p>Thiên thể Acheron va chạm sượt góc 34°, làm nghiêng trục địa cực về 21,8° và tạo 2 vệ tinh tự nhiên Selene-I và Selene-II. Lực thủy triều nhịp đôi hãm vận tốc quay về đúng 32 giờ chuẩn.</p></div>
    </div>
  </div>
  <div class="era-section">
    <div class="era-header"><span class="era-title">✦ KỶ NGUYÊN II: THỦY QUYỂN NGUYÊN KHAI & TINH THỂ MEOWN</span><span class="era-time">11,2 - 8,5 TỶ NĂM TRƯỚC</span></div>
    <div class="sub-grid">
      <div class="sub-card"><h4>1. Thoát Khí & Đại Dương Siêu Mặn</h4><p>Mưa acid kéo dài hơn 8 triệu năm kiến tạo đại dương bao phủ 82% bề mặt với độ mặn gấp 4 lần đại dương Trái Đất.</p></div>
      <div class="sub-card"><h4>2. Sự Ra Đời Của Tinh Thể MEOWN</h4><p>Tại đới ranh giới D'' sâu 2.800 km, áp suất và sóng lượng tử biến đổi silicat thành Tinh Thể MEOWN siêu dẫn.</p></div>
    </div>
  </div>
  <script>
    const canvas = document.getElementById('spaceCanvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let w = canvas.width = canvas.offsetWidth;
      let h = canvas.height = canvas.offsetHeight;
      let a1 = 0, a2 = 1.2;
      function loop() {
        ctx.fillStyle = '#020408';
        ctx.fillRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2;
        ctx.strokeStyle = 'rgba(6,182,212,0.2)';
        ctx.beginPath(); ctx.ellipse(cx, cy, 90, 45, -0.15, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(168,85,247,0.2)';
        ctx.beginPath(); ctx.ellipse(cx, cy, 140, 70, -0.15, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#0284c7'; ctx.beginPath(); ctx.arc(cx, cy, 22, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
        const x1 = cx + Math.cos(a1) * 90, y1 = cy + Math.sin(a1) * 45;
        ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(x1, y1, 5, 0, Math.PI * 2); ctx.fill();
        const x2 = cx + Math.cos(a2) * 140, y2 = cy + Math.sin(a2) * 70;
        ctx.fillStyle = '#c084fc'; ctx.beginPath(); ctx.arc(x2, y2, 6, 0, Math.PI * 2); ctx.fill();
        a1 += 0.02; a2 += 0.01;
        requestAnimationFrame(loop);
      }
      loop();
    }
  </script>
</body>
</html>`,
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
    htmlFileUrl: '',
    htmlContent: '<div style="padding:24px;color:#cbd5e1;background:#06080d;font-family:sans-serif;"><h3>✦ Cảnh quan sinh thái Aethel & Celestia</h3><p>Hồ sơ lưu trữ địa lý chuẩn mực của Cục Văn Khố MEOWN-2407.</p></div>',
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
    htmlFileUrl: '',
    htmlContent: '<div style="padding:24px;color:#cbd5e1;background:#06080d;font-family:sans-serif;"><h3>✦ Chủng tộc MEOWN & Nhân Loại</h3><p>Bản ghi nhận dạng hình thái và văn hóa cộng sinh.</p></div>',
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
    htmlFileUrl: '',
    htmlContent: '<div style="padding:24px;color:#cbd5e1;background:#06080d;font-family:sans-serif;"><h3>✦ Hệ thống kinh tế & Khí quyển Gaia-Grid</h3><p>Tài liệu lưu trữ chuẩn mực kinh tế vĩ mô.</p></div>',
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
    htmlFileUrl: '',
    htmlContent: '<div style="padding:24px;color:#cbd5e1;background:#06080d;font-family:sans-serif;"><h3>✦ Mạng lưới bước nhảy Alpha-9</h3><p>Hồ sơ kỹ thuật hành lang không gian liên sao.</p></div>',
    videoUrl: '',
    lastUpdated: new Date().toISOString(),
    version: 1
  }
};

// Dữ liệu danh sách nhạc Radio mặc định
const DEFAULT_TRACKS: AudioTrack[] = [
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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('history');
  // Khởi tạo trực tiếp bằng dữ liệu mặc định để không bao giờ bị lỗi 404
  const [content, setContent] = useState<AllContent>(DEFAULT_CONTENT);
  const [tracks, setTracks] = useState<AudioTrack[]>(DEFAULT_TRACKS);
  const [isLoading, setIsLoading] = useState(false);

  // Admin authentication state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tabToEdit, setTabToEdit] = useState<TabId>('history');

  // Verify stored token on initial load
  useEffect(() => {
    const savedToken = localStorage.getItem('meown_admin_token');
    if (savedToken) {
      fetch('/api/admin/verify', {
        headers: { Authorization: `Bearer ${savedToken}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.authenticated) {
            setAdminToken(savedToken);
            setIsAdmin(true);
          } else {
            localStorage.removeItem('meown_admin_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('meown_admin_token');
        });
    }
  }, []);

  // Fetch content & tracks from server (nếu có server thì cập nhật, nếu không có thì giữ nguyên default)
  const loadData = async () => {
    try {
      const [contentRes, tracksRes] = await Promise.all([
        fetch('/api/content').catch(() => null),
        fetch('/api/tracks').catch(() => null)
      ]);

      if (contentRes && contentRes.ok) {
        const contentData = await contentRes.json();
        if (contentData && typeof contentData === 'object') {
          setContent(contentData);
        }
      }

      if (tracksRes && tracksRes.ok) {
        const tracksData = await tracksRes.json();
        if (tracksData && tracksData.tracks && Array.isArray(tracksData.tracks)) {
          setTracks(tracksData.tracks);
        }
      }
    } catch (err) {
      console.log('Chạy chế độ lưu trữ tĩnh độc lập.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Login Success
  const handleLoginSuccess = (token: string) => {
    localStorage.setItem('meown_admin_token', token);
    setAdminToken(token);
    setIsAdmin(true);
  };

  // Handle Logout
  const handleLogout = () => {
    if (adminToken) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      }).catch(console.error);
    }
    localStorage.removeItem('meown_admin_token');
    setAdminToken(null);
    setIsAdmin(false);
    setIsAdminModalOpen(false);
  };

  const handleEditTab = (tabId: TabId) => {
    setTabToEdit(tabId);
    setIsAdminModalOpen(true);
  };

  const currentContent = content ? content[activeTab] : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#06080d] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Bar Navigation */}
      <TopNav
        activeTab={activeTab}
        tabs={TABS_CONFIG}
        onSelectTab={setActiveTab}
        isAdmin={isAdmin}
        onOpenAdmin={() => {
          setTabToEdit(activeTab);
          setIsAdminModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <HeroSection />

        {isLoading ? (
          <div className="w-full py-24 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
            <p className="text-sm font-mono text-slate-400">Đang đồng bộ dữ liệu thế giới MEOWN-2407...</p>
          </div>
        ) : currentContent ? (
          <CategoryViewer
            activeTab={activeTab}
            tabs={TABS_CONFIG}
            content={currentContent}
            onSelectTab={setActiveTab}
            isAdmin={isAdmin}
            onEditTab={handleEditTab}
          />
        ) : (
          <div className="w-full py-20 text-center text-slate-400">
            Không thể tải tư liệu. Vui lòng tải lại trang.
          </div>
        )}
      </main>

      {/* Mini Radio Player at Bottom Left */}
      <MiniRadio
        tracks={tracks}
        isAdmin={isAdmin}
        onOpenAdminUpload={() => {
          setIsAdminModalOpen(true);
        }}
      />

      {/* Admin Management Modal */}
      {content && (
        <AdminModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          isAdmin={isAdmin}
          adminToken={adminToken}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
          tabs={TABS_CONFIG}
          initialTabToEdit={tabToEdit}
          content={content}
          onContentUpdated={setContent}
          tracks={tracks}
          onTracksUpdated={setTracks}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#04060a] py-8 px-4 sm:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">MEOWN-2407 CODEX</span>
            <span>·</span>
            <span>Tư liệu bối cảnh AI Roleplay Bot</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Thiết lập đa chủng tộc</span>
            <span>·</span>
            <span>Đồng bộ máy chủ</span>
            {isAdmin && (
              <span className="text-cyan-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phiên Admin đang kích hoạt</span>
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
