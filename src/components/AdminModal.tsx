import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  Upload,
  FileCode,
  Music,
  Check,
  AlertCircle,
  Trash2,
  Save,
  Plus,
  RefreshCw,
  LogOut,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { TabId, TabConfig, TabContent, AudioTrack, AllContent } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  adminToken: string | null;
  onLoginSuccess: (token: string) => void;
  onLogout: () => void;
  tabs: TabConfig[];
  initialTabToEdit?: TabId;
  content: AllContent;
  onContentUpdated: (updatedContent: AllContent) => void;
  tracks: AudioTrack[];
  onTracksUpdated: (updatedTracks: AudioTrack[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdmin,
  adminToken,
  onLoginSuccess,
  onLogout,
  tabs,
  initialTabToEdit = 'history',
  content,
  onContentUpdated,
  tracks,
  onTracksUpdated
}) => {
  // Login State
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);

  // Admin Workspace State
  const [adminActiveTab, setAdminActiveTab] = useState<'content' | 'radio'>('content');
  const [selectedCategory, setSelectedCategory] = useState<TabId>(initialTabToEdit);

  // Content Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editHighlights, setEditHighlights] = useState<string[]>([]);
  const [newHighlightText, setNewHighlightText] = useState('');
  const [editHtmlContent, setEditHtmlContent] = useState('');
  const [uploadedHtmlFile, setUploadedHtmlFile] = useState<{ name: string; base64: string } | null>(null);

  // Radio Upload Form State
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackDirectUrl, setTrackDirectUrl] = useState('');
  const [uploadedAudioFile, setUploadedAudioFile] = useState<{ name: string; base64: string } | null>(null);

  // Status & Feedback
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Synchronize edit fields when selected category changes
  useEffect(() => {
    if (content && content[selectedCategory]) {
      const current = content[selectedCategory];
      setEditTitle(current.title || '');
      setEditSubtitle(current.subtitle || '');
      setEditSummary(current.summary || '');
      setEditHighlights(current.highlights ? [...current.highlights] : []);
      setEditHtmlContent(current.htmlContent || '');
      setUploadedHtmlFile(null);
      setSaveStatus(null);
    }
  }, [selectedCategory, content]);

  useEffect(() => {
    if (initialTabToEdit) {
      setSelectedCategory(initialTabToEdit);
    }
  }, [initialTabToEdit]);

  if (!isOpen) return null;

  // Handle Server-Side Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmittingLogin(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        onLoginSuccess(data.token);
        setPasswordInput('');
        setLoginError('');
      } else {
        setLoginError(data.error || 'Mật khẩu quản trị viên không chính xác.');
      }
    } catch (err) {
      setLoginError('Không thể kết nối với máy chủ xác thực.');
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Handle HTML File Selection
  const handleHtmlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      setUploadedHtmlFile({ name: file.name, base64 });

      // Read text content for immediate preview / editing
      const textReader = new FileReader();
      textReader.onload = () => {
        setEditHtmlContent(textReader.result as string);
      };
      textReader.readAsText(file);
    };
    reader.readAsDataURL(file);
  };

  // Add / Remove Highlights
  const handleAddHighlight = () => {
    if (newHighlightText.trim()) {
      setEditHighlights([...editHighlights, newHighlightText.trim()]);
      setNewHighlightText('');
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setEditHighlights(editHighlights.filter((_, i) => i !== index));
  };

  // Save Content to Server
  const handleSaveContent = async () => {
    if (!adminToken) {
      setSaveStatus({ type: 'error', message: 'Thiếu phiên làm việc quản trị viên.' });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const payload: any = {
        title: editTitle,
        subtitle: editSubtitle,
        summary: editSummary,
        highlights: editHighlights,
        htmlContent: editHtmlContent
      };

      if (uploadedHtmlFile) {
        payload.fileBase64 = uploadedHtmlFile.base64;
        payload.filename = uploadedHtmlFile.name;
      }

      const res = await fetch(`/api/admin/content/${selectedCategory}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({ type: 'success', message: data.message || 'Đã lưu và đồng bộ thành công!' });
        onContentUpdated({
          ...content,
          [selectedCategory]: data.content
        });
        setUploadedHtmlFile(null);
      } else {
        setSaveStatus({ type: 'error', message: data.error || 'Lỗi khi lưu dữ liệu lên máy chủ.' });
      }
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Lỗi mạng khi lưu dữ liệu.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Audio File Selection
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      setUploadedAudioFile({ name: file.name, base64 });
    };
    reader.readAsDataURL(file);
  };

  // Upload Audio Track to Server
  const handleUploadTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;

    if (!trackTitle.trim() || !trackArtist.trim()) {
      setSaveStatus({ type: 'error', message: 'Vui lòng nhập tên bài hát và ca sĩ.' });
      return;
    }

    if (!uploadedAudioFile && !trackDirectUrl.trim()) {
      setSaveStatus({ type: 'error', message: 'Vui lòng chọn tệp MP3 hoặc dán URL bài hát.' });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    try {
      const payload: any = {
        title: trackTitle.trim(),
        artist: trackArtist.trim(),
        directUrl: trackDirectUrl.trim()
      };

      if (uploadedAudioFile) {
        payload.fileBase64 = uploadedAudioFile.base64;
        payload.filename = uploadedAudioFile.name;
      }

      const res = await fetch('/api/admin/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveStatus({ type: 'success', message: 'Đã tải lên bài hát vào đài Radio thành công!' });
        onTracksUpdated([data.track, ...tracks]);
        setTrackTitle('');
        setTrackArtist('');
        setTrackDirectUrl('');
        setUploadedAudioFile(null);
      } else {
        setSaveStatus({ type: 'error', message: data.error || 'Lỗi khi tải bài hát.' });
      }
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Lỗi mạng khi tải lên bài hát.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Audio Track
  const handleDeleteTrack = async (trackId: string) => {
    if (!adminToken) return;
    try {
      const res = await fetch(`/api/admin/tracks/${trackId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        onTracksUpdated(tracks.filter(t => t.id !== trackId));
      }
    } catch (err) {
      console.error('Error deleting track:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#080c14] border border-slate-800 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0d121d] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isAdmin ? 'Bảng Điều Khiển Quản Trị Viên' : 'Xác Thực Quản Trị Viên'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                MEOWN-2407 ARCHIVE CONTROL CENTER
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg transition-colors cursor-pointer mr-2"
                title="Đăng xuất quyền quản trị"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* VIEW 1: LOGIN FORM (If not logged in) */}
          {!isAdmin ? (
            <div className="max-w-md mx-auto py-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Nhập Mật Khẩu Quản Trị</h4>
                <p className="text-xs text-slate-400">
                  Quyền truy cập dành riêng cho Quản Trị Viên để chỉnh sửa và đăng tải tài liệu HTML, âm nhạc đài Radio. Mật khẩu được bảo vệ an toàn phía máy chủ.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Mật khẩu quản trị
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Nhập mật khẩu admin..."
                      required
                      autoFocus
                      className="w-full px-3.5 py-2.5 text-sm bg-[#04060a] border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/60 flex items-center gap-2 text-xs text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingLogin || !passwordInput}
                  className="w-full py-2.5 px-4 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmittingLogin ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang xác thực...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Xác nhận đăng nhập</span>
                    </>
                  )}
                </button>
              </form>

              <div className="p-3 rounded-lg bg-[#0d121e] border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-cyan-400 block">✦ Bảo mật thông tin</span>
                <span>Mật khẩu được xác thực trực tiếp tại máy chủ Express backend. Client không lưu trữ chuỗi mật khẩu trong mã nguồn hay các tệp tĩnh.</span>
              </div>
            </div>
          ) : (
            /* VIEW 2: LOGGED-IN ADMIN DASHBOARD */
            <div className="space-y-6">
              
              {/* Admin Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setAdminActiveTab('content')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    adminActiveTab === 'content'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>Quản Lý Tư Liệu HTML (5 Danh Mục)</span>
                </button>

                <button
                  onClick={() => setAdminActiveTab('radio')}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    adminActiveTab === 'radio'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>Quản Lý Đài Radio & Tải MP3</span>
                </button>
              </div>

              {/* Status Alert */}
              {saveStatus && (
                <div
                  className={`p-3.5 rounded-lg flex items-center gap-2 text-xs ${
                    saveStatus.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-800/60 text-rose-300'
                  }`}
                >
                  {saveStatus.type === 'success' ? (
                    <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <span>{saveStatus.message}</span>
                </div>
              )}

              {/* TAB 1: HTML CONTENT & TAB EDITOR */}
              {adminActiveTab === 'content' && (
                <div className="space-y-5">
                  {/* Category Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Chọn danh mục cần cập nhật
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setSelectedCategory(tab.id)}
                          className={`p-2.5 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer ${
                            selectedCategory === tab.id
                              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm'
                              : 'bg-[#0d121d] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <div className="font-semibold truncate">{tab.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{tab.code}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Metadata Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">
                        Tiêu đề hiển thị
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                        placeholder="VD: Lịch Sử & Biên Niên Khai Nguyên"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-300">
                        Phụ đề tóm lược
                      </label>
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                        placeholder="VD: Kỷ nguyên chung sống giữa Con người và Cư dân MEOWN"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-300">
                      Đoạn tóm tắt giới thiệu danh mục
                    </label>
                    <textarea
                      rows={2}
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Mô tả ngắn gọn về thiết lập thế giới cho mục này..."
                    />
                  </div>

                  {/* Highlights Manager */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">
                      Các điểm nhấn nổi bật (Highlights)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newHighlightText}
                        onChange={(e) => setNewHighlightText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                        placeholder="Thêm điểm nhấn mới..."
                        className="flex-1 px-3 py-1.5 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {editHighlights.map((hl, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 px-3 py-1.5 bg-[#0d121d] border border-slate-800 rounded-lg text-xs text-slate-300"
                        >
                          <span className="truncate">{hl}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(idx)}
                            className="text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* HTML File Upload & Code Editor */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        <span>Tài liệu HTML tương tác cho phân hệ "{tabs.find(t => t.id === selectedCategory)?.name}"</span>
                      </label>
                      
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isPreviewOpen ? 'Ẩn xem trước' : 'Xem trước HTML'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Drag & Drop File Selector */}
                    <div className="p-4 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/60 bg-[#04060a]/60 text-center space-y-2 transition-colors">
                      <Upload className="w-6 h-6 mx-auto text-slate-400" />
                      <div className="text-xs text-slate-300">
                        <label className="font-semibold text-cyan-400 hover:underline cursor-pointer">
                          <span>Nhấn để chọn tệp HTML từ máy tính</span>
                          <input
                            type="file"
                            accept=".html,.htm"
                            onChange={handleHtmlFileChange}
                            className="hidden"
                          />
                        </label>
                        <span className="text-slate-400"> hoặc chỉnh sửa mã trực tiếp bên dưới</span>
                      </div>
                      {uploadedHtmlFile && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs">
                          <Check className="w-3 h-3" />
                          <span>Đã chọn: {uploadedHtmlFile.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Preview Box */}
                    {isPreviewOpen && (
                      <div className="h-64 rounded-xl border border-slate-700 bg-black overflow-hidden">
                        <iframe
                          title="HTML Live Preview"
                          srcDoc={editHtmlContent}
                          sandbox="allow-scripts allow-same-origin"
                          className="w-full h-full border-0"
                        />
                      </div>
                    )}

                    {/* HTML Code Editor */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400">
                        <span>MÃ NGUỒN HTML // SOẠN THẢO TRỰC TIẾP</span>
                        <span>{editHtmlContent.length} ký tự</span>
                      </div>
                      <textarea
                        rows={10}
                        value={editHtmlContent}
                        onChange={(e) => setEditHtmlContent(e.target.value)}
                        className="w-full p-3 font-mono text-xs bg-[#030509] border border-slate-800 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-500 leading-relaxed selection:bg-cyan-500/30"
                        placeholder="<!DOCTYPE html><html>...</html>"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveContent}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang lưu lên máy chủ...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Lưu & Đồng bộ lên toàn bộ Web</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: RADIO MUSIC MANAGER */}
              {adminActiveTab === 'radio' && (
                <div className="space-y-6">
                  
                  {/* Upload new track form */}
                  <form onSubmit={handleUploadTrack} className="p-4 rounded-xl bg-[#0d121d] border border-slate-800 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase font-mono">
                      <Sparkles className="w-4 h-4" />
                      <span>Thêm Bài Hát Mới Vào Đài Radio</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">
                          Tên bài hát *
                        </label>
                        <input
                          type="text"
                          required
                          value={trackTitle}
                          onChange={(e) => setTrackTitle(e.target.value)}
                          placeholder="VD: Giai Điệu Ánh Sao MEOWN"
                          className="w-full px-3 py-2 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-300">
                          Tên ca sĩ / nghệ sĩ *
                        </label>
                        <input
                          type="text"
                          required
                          value={trackArtist}
                          onChange={(e) => setTrackArtist(e.target.value)}
                          placeholder="VD: Dàn Giao Hưởng Aethel"
                          className="w-full px-3 py-2 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* File upload or URL */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-300">
                        Chọn tệp MP3 từ máy tính hoặc nhập liên kết
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-700 hover:border-cyan-500 bg-[#04060a] cursor-pointer text-xs text-slate-300">
                          <Upload className="w-4 h-4 text-cyan-400" />
                          <span>{uploadedAudioFile ? uploadedAudioFile.name : 'Tải lên tệp âm thanh (.mp3, .ogg, .wav)'}</span>
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleAudioFileChange}
                            className="hidden"
                          />
                        </label>
                        <div className="sm:w-64">
                          <input
                            type="url"
                            value={trackDirectUrl}
                            onChange={(e) => setTrackDirectUrl(e.target.value)}
                            placeholder="Hoặc dán URL file audio..."
                            className="w-full h-full px-3 py-2 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Đang lưu bài hát...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Đăng tải bài hát vào đài Radio</span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Existing tracks list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>DANH SÁCH BÀI HÁT HIỆN TẠI ({tracks.length})</span>
                      <span>Được lưu trên máy chủ toàn trang</span>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {tracks.map((track) => (
                        <div
                          key={track.id}
                          className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#0d121d] border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <Music className="w-4 h-4 text-cyan-400 shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-white block truncate">{track.title}</span>
                              <span className="text-slate-400 text-[11px] truncate">{track.artist}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {track.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTrack(track.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                                title="Xóa bài hát này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
