import React from 'react';
import { Compass, Users, Sparkles, Activity } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative w-full border-b border-slate-800/80 bg-gradient-to-b from-[#090d16] to-[#06080d] py-10 sm:py-14 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          {/* Main Title & Lore Introduction */}
          <div className="max-w-3xl space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 tracking-wider uppercase">
              <span>HỒ SƠ THẾ GIỚI</span>
              <span aria-hidden="true" className="text-slate-600">/</span>
              <span>PHÂN VÙNG CYGNUS-X</span>
              <span aria-hidden="true" className="text-slate-600">/</span>
              <span>ROLEPLAY LORE CODEX</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight" style={{ textWrap: 'balance' }}>
              Hành Tinh MEOWN-2407
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Hành tinh tinh tế đa chủng tộc trong kỷ nguyên mở, nơi cộng đồng nhân loại và cư dân bản địa MEOWN cùng chung sống hòa thuận ở cả hai quê hương sao. Kho tư liệu chuẩn mực phục vụ độc giả và người tham gia bot chat AI Roleplay.
            </p>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Niên đại: 12,4 tỷ năm (Quần thể sao II)</span>
              </span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>Độ nghiêng trục: 21,8° (Khí hậu 4 mùa)</span>
              </span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hệ vệ tinh: Selene-I & Selene-II</span>
              </span>
            </div>
          </div>

          {/* Quick Telemetry Metric Cards */}
          <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0">
            <div className="p-3.5 rounded-lg bg-[#0c101a] border border-slate-800/90 flex flex-col justify-between min-w-[140px]">
              <span className="text-[11px] font-mono uppercase text-slate-400">Khối lượng</span>
              <div className="text-xl sm:text-2xl font-mono font-bold text-white tabular-nums mt-1">
                1.82 <span className="text-xs font-normal text-cyan-400">M⊕</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">1,82 × Trái Đất</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c101a] border border-slate-800/90 flex flex-col justify-between min-w-[140px]">
              <span className="text-[11px] font-mono uppercase text-slate-400">Chu kỳ ngày-đêm</span>
              <div className="text-xl sm:text-2xl font-mono font-bold text-white tabular-nums mt-1">
                32.0 <span className="text-xs font-normal text-cyan-400">h</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Ma sát thủy triều nhịp đôi</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c101a] border border-slate-800/90 flex flex-col justify-between min-w-[140px]">
              <span className="text-[11px] font-mono uppercase text-slate-400">Niên đại địa chất</span>
              <div className="text-xl sm:text-2xl font-mono font-bold text-white tabular-nums mt-1">
                12.4 <span className="text-xs font-normal text-cyan-400">tỷ năm</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Lõi kỳ dị lượng tử</span>
            </div>

            <div className="p-3.5 rounded-lg bg-[#0c101a] border border-slate-800/90 flex flex-col justify-between min-w-[140px]">
              <span className="text-[11px] font-mono uppercase text-slate-400">Hệ mặt trăng</span>
              <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400 tabular-nums mt-1 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>2 <span className="text-xs font-normal text-slate-400">Vệ tinh</span></span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Selene-I & Selene-II</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
