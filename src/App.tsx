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

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('history');
  const [content, setContent] = useState<AllContent | null>(null);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch content & tracks from server
  const loadData = async () => {
    try {
      const [contentRes, tracksRes] = await Promise.all([
        fetch('/api/content'),
        fetch('/api/tracks')
      ]);

      if (contentRes.ok) {
        const contentData = await contentRes.json();
        setContent(contentData);
      }

      if (tracksRes.ok) {
        const tracksData = await tracksRes.json();
        if (tracksData.tracks) {
          setTracks(tracksData.tracks);
        }
      }
    } catch (err) {
      console.error('Error loading initial data from server:', err);
    } finally {
      setIsLoading(false);
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

      {/* Unobtrusive Floating Mini Radio Player at Bottom Left */}
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
