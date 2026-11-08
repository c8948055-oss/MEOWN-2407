import React from 'react';
import { Lock, ShieldCheck, Globe, Menu, X } from 'lucide-react';
import { TabId, TabConfig } from '../types';

interface TopNavProps {
  activeTab: TabId;
  tabs: TabConfig[];
  onSelectTab: (tabId: TabId) => void;
  isAdmin: boolean;
  onOpenAdmin: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  tabs,
  onSelectTab,
  isAdmin,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#06080d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Globe className="w-4 h-4" />
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('history');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            MEOWN-2407 ARCHIVE
          </a>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer border-b-2 ${
                  isActive
                    ? 'text-cyan-400 font-semibold border-cyan-400'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-700'
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenAdmin}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              isAdmin
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50 hover:bg-cyan-900'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-600'
            }`}
            title={isAdmin ? 'Mở bảng điều khiển Quản trị' : 'Đăng nhập Quản trị viên'}
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quản Trị Viên</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Admin</span>
              </>
            )}
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/80 bg-[#07090e] px-4 py-3 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onSelectTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  isActive
                    ? 'bg-cyan-950/60 text-cyan-300 font-medium border border-cyan-800/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
