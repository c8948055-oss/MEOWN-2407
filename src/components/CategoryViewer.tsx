import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  ExternalLink,
  Clock,
  FileCode,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { TabId, TabConfig, TabContent } from '../types';

interface CategoryViewerProps {
  activeTab: TabId;
  tabs: TabConfig[];
  content: TabContent;
  onSelectTab: (tabId: TabId) => void;
  isAdmin: boolean;
  onEditTab: (tabId: TabId) => void;
}

export const CategoryViewer: React.FC<CategoryViewerProps> = ({
  activeTab,
  tabs,
  content,
  onSelectTab,
  isAdmin,
  onEditTab
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  // Reset loading state on tab change
  useEffect(() => {
    setIsLoading(true);
  }, [activeTab, content?.version]);

  const toggleFullscreen = () => {
    if (!iframeContainerRef.current) return;

    if (!isFullscreen) {
      if (iframeContainerRef.current.requestFullscreen) {
        iframeContainerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const currentTabConfig = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      {/* 5-Tab Segmented Selector */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#0a0e17] border border-slate-800/90 rounded-xl overflow-x-auto no-scrollbar mb-8">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-slate-800 text-cyan-300 shadow-sm border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-cyan-400' : 'bg-slate-600'}`} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Layout */}
      <div className="space-y-6">
        
        {/* Header & Overview Card */}
        <div className="p-6 rounded-xl bg-[#090d16] border border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                <span>PHÂN HỆ TƯ LIỆU</span>
                <span aria-hidden="true" className="text-slate-600">/</span>
                <span>{currentTabConfig.code}</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {content.title}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {content.subtitle}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => onEditTab(activeTab)}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Chỉnh sửa tư liệu này</span>
              </button>
            )}
          </div>

          {/* Summary text */}
          <div className="mt-4 text-sm text-slate-300 leading-relaxed">
            {content.summary}
          </div>

          {/* Highlights Grid */}
          {content.highlights && content.highlights.length > 0 && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {content.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#0d121d] border border-slate-800/70 flex items-start gap-2.5 text-xs text-slate-300"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              ))}
            </div>
          )}

          {/* Metadata Footer */}
          <div className="mt-5 pt-3.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs font-mono text-slate-500 gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Cập nhật: {new Date(content.lastUpdated).toLocaleDateString('vi-VN')}</span>
              </span>
              <span>·</span>
              <span>Phiên bản: v{content.version || 1}.0</span>
              {content.isCustomUpload && (
                <>
                  <span>·</span>
                  <span className="text-emerald-400 font-sans flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã sao lưu: {content.uploadedFilename || 'Tệp tải lên bởi Admin'}</span>
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1 text-cyan-400/80">
              <FileCode className="w-3.5 h-3.5" />
              <span>Định dạng tư liệu: HTML5 Interactive Viewport</span>
            </div>
          </div>
        </div>

        {/* Interactive HTML Viewport Container */}
        <div
          ref={iframeContainerRef}
          className={`relative rounded-xl border border-slate-800/90 bg-[#04060a] overflow-hidden transition-all flex flex-col ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'h-[620px] shadow-2xl'
          }`}
        >
          {/* Iframe Control Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#090d16] border-b border-slate-800/80 text-xs text-slate-400 shrink-0">
            <div className="flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/80 inline-block" />
              <span className="text-slate-300 font-semibold uppercase">{currentTabConfig.name}</span>
              <span className="hidden sm:inline text-slate-600">//</span>
              <span className="hidden sm:inline text-slate-500">Khung tương tác độc lập (Sandboxed)</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReload}
                className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                title="Tải lại nội dung"
                aria-label="Tải lại"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>

              {content.htmlFileUrl && (
                <a
                  href={content.htmlFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Mở trong tab mới"
                  aria-label="Mở tab mới"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer ml-1"
                title={isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Thu nhỏ</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Toàn màn hình</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Iframe Canvas Area */}
          <div className="relative flex-1 w-full h-full bg-[#07090e]">
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#07090e]/80 backdrop-blur-xs z-10 space-y-2">
                <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                <span className="text-xs font-mono text-slate-400">Đang khởi tạo mô phỏng tư liệu...</span>
              </div>
            )}

            {/* Embedded sandboxed iframe */}
            {content.htmlContent ? (
              <iframe
                key={iframeKey}
                title={`${content.title} Document Viewport`}
                srcDoc={content.htmlContent}
                sandbox="allow-scripts allow-same-origin allow-popups"
                onLoad={() => setIsLoading(false)}
                className="w-full h-full border-0 block"
              />
            ) : content.htmlFileUrl ? (
              <iframe
                key={iframeKey}
                title={`${content.title} Document Viewport`}
                src={content.htmlFileUrl}
                sandbox="allow-scripts allow-same-origin allow-popups"
                onLoad={() => setIsLoading(false)}
                className="w-full h-full border-0 block"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
                <FileCode className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-sm font-medium text-slate-400">Chưa có tệp HTML nào được liên kết cho phân hệ này.</p>
                <p className="text-xs text-slate-500 mt-1">Quản trị viên có thể đăng tải tệp HTML từ bảng Admin.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
