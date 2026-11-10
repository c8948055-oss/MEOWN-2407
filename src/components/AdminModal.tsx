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
  ExternalLink,
  History,
  Download,
  RotateCcw,
  CheckCircle2,
  BookmarkCheck
} from 'lucide-react';
import { TabId, TabConfig, TabContent, AudioTrack, AllContent, BackupRecord } from '../types';

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
  const [adminActiveTab, setAdminActiveTab] = useState<'content' | 'backups' | 'radio'>('content');
  const [selectedCategory, setSelectedCategory] = useState<TabId>(initialTabToEdit);

  // Content Edit Form State
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editHighlights, setEditHighlights] = useState<string[]>([]);
  const [newHighlightText, setNewHighlightText] = useState('');
  const [editHtmlContent, setEditHtmlContent] = useState('');
  const [uploadedHtmlFile, setUploadedHtmlFile] = useState<{ name: string; size: number; base64: string } | null>(null);

  // LocalStorage Auto-Save Draft State
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string>('');

  // Backups History State
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [previewBackupHtml, setPreviewBackupHtml] = useState<string | null>(null);

  // Radio Upload Form State
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackDirectUrl, setTrackDirectUrl] = useState('');
  const [uploadedAudioFile, setUploadedAudioFile] = useState<{ name: string; base64: string } | null>(null);

  // Status & Feedback
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Synchronize edit fields when selected category changes or from LocalStorage Draft
  useEffect(() => {
    if (content && content[selectedCategory]) {
      const current = content[selectedCategory];
      const draftKey = `meown_admin_draft_${selectedCategory}`;
      const savedDraft = localStorage.getItem(draftKey);

      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          setEditTitle(parsed.title ?? current.title ?? '');
          setEditSubtitle(parsed.subtitle ?? current.subtitle ?? '');
          setEditSummary(parsed.summary ?? current.summary ?? '');
          setEditHighlights(
            parsed.highlights && Array.isArray(parsed.highlights)
              ? parsed.highlights
              : current.highlights ? [...current.highlights] : []
          );
          setEditHtmlContent(parsed.htmlContent ?? current.htmlContent ?? '');
          setHasDraft(true);
          setDraftSavedAt(parsed.updatedAt || 'Trước đó');
        } catch (e) {
          // Fallback to server data
          setEditTitle(current.title || '');
          setEditSubtitle(current.subtitle || '');
          setEditSummary(current.summary || '');
          setEditHighlights(current.highlights ? [...current.highlights] : []);
          setEditHtmlContent(current.htmlContent || '');
          setHasDraft(false);
        }
      } else {
        setEditTitle(current.title || '');
        setEditSubtitle(current.subtitle || '');
        setEditSummary(current.summary || '');
        setEditHighlights(current.highlights ? [...current.highlights] : []);
        setEditHtmlContent(current.htmlContent || '');
        setHasDraft(false);
      }
      setUploadedHtmlFile(null);
      setSaveStatus(null);
    }
  }, [selectedCategory, content]);

  // Load radio draft from localStorage on mount
  useEffect(() => {
    const radioDraft = localStorage.getItem('meown_admin_draft_radio');
    if (radioDraft) {
      try {
        const parsed = JSON.parse(radioDraft);
        if (parsed.trackTitle) setTrackTitle(parsed.trackTitle);
        if (parsed.trackArtist) setTrackArtist(parsed.trackArtist);
        if (parsed.trackDirectUrl) setTrackDirectUrl(parsed.trackDirectUrl);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (initialTabToEdit) {
      setSelectedCategory(initialTabToEdit);
    }
  }, [initialTabToEdit]);

  // Auto-Save Draft to LocalStorage immediately on any edit
  const triggerAutoSave = (fields: {
    title?: string;
    subtitle?: string;
    summary?: string;
    highlights?: string[];
    htmlContent?: string;
  }) => {
    const title = fields.title !== undefined ? fields.title : editTitle;
    const subtitle = fields.subtitle !== undefined ? fields.subtitle : editSubtitle;
    const summary = fields.summary !== undefined ? fields.summary : editSummary;
    const highlights = fields.highlights !== undefined ? fields.highlights : editHighlights;
    const htmlContent = fields.htmlContent !== undefined ? fields.htmlContent : editHtmlContent;
    const updatedAt = new Date().toLocaleTimeString('vi-VN');

    const draft = {
      title,
      subtitle,
      summary,
      highlights,
      htmlContent,
      updatedAt
    };

    try {
      localStorage.setItem(`meown_admin_draft_${selectedCategory}`, JSON.stringify(draft));
      setHasDraft(true);
      setDraftSavedAt(updatedAt);
    } catch (e) {
      console.warn('Draft auto-save error:', e);
    }
  };

  // Discard draft and revert back to server data
  const handleDiscardDraft = () => {
    if (!window.confirm('Bạn có muốn hủy bản nháp lưu tạm trên máy và nạp lại dữ liệu gốc từ máy chủ không?')) return;
    localStorage.removeItem(`meown_admin_draft_${selectedCategory}`);
    if (content && content[selectedCategory]) {
      const current = content[selectedCategory];
      setEditTitle(current.title || '');
      setEditSubtitle(current.subtitle || '');
      setEditSummary(current.summary || '');
      setEditHighlights(current.highlights ? [...current.highlights] : []);
      setEditHtmlContent(current.htmlContent || '');
      setUploadedHtmlFile(null);
    }
    setHasDraft(false);
    setSaveStatus({ type: 'success', message: 'Đã hủy bản nháp và hiển thị lại dữ liệu gốc từ máy chủ.' });
  };

  // Auto-save radio inputs to LocalStorage
  const triggerRadioAutoSave = (fields: { title?: string; artist?: string; directUrl?: string }) => {
    const title = fields.title !== undefined ? fields.title : trackTitle;
    const artist = fields.artist !== undefined ? fields.artist : trackArtist;
    const directUrl = fields.directUrl !== undefined ? fields.directUrl : trackDirectUrl;
    try {
      localStorage.setItem('meown_admin_draft_radio', JSON.stringify({
        trackTitle: title,
        trackArtist: artist,
        trackDirectUrl: directUrl,
        updatedAt: new Date().toLocaleTimeString('vi-VN')
      }));
    } catch (e) {
      // ignore
    }
  };

  // Load backups when admin tab is opened
  const loadBackups = async () => {
    if (!adminToken) return;
    setIsLoadingBackups(true);
    try {
      const res = await fetch('/api/admin/backups', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch (err) {
      console.error('Error fetching backups:', err);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  useEffect(() => {
    if (isAdmin && adminToken && adminActiveTab === 'backups') {
      loadBackups();
    }
  }, [isAdmin, adminToken, adminActiveTab]);

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
      setUploadedHtmlFile({ name: file.name, size: file.size, base64 });

      // Read text content for immediate preview / editing & autosave
      const textReader = new FileReader();
      textReader.onload = () => {
        const textContent = textReader.result as string;
        setEditHtmlContent(textContent);
        triggerAutoSave({ htmlContent: textContent });
      };
      textReader.readAsText(file);
    };
    reader.readAsDataURL(file);
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
      if (!trackTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setTrackTitle(cleanName);
        triggerRadioAutoSave({ title: cleanName });
      }
    };
    reader.readAsDataURL(file);
  };

  // Add / Remove Highlights
  const handleAddHighlight = () => {
    if (newHighlightText.trim()) {
      const next = [...editHighlights, newHighlightText.trim()];
      setEditHighlights(next);
      setNewHighlightText('');
      triggerAutoSave({ highlights: next });
    }
  };

  const handleRemoveHighlight = (index: number) => {
    const next = editHighlights.filter((_, i) => i !== index);
    setEditHighlights(next);
    triggerAutoSave({ highlights: next });
  };

  // Save Content & Create Backup on Server
  const handleSaveContent = async (overrideFile?: { name: string; base64: string }) => {
    if (!adminToken) {
      setSaveStatus({ type: 'error', message: 'Thiếu phiên làm việc quản trị viên.' });
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);

    const targetFile = overrideFile || uploadedHtmlFile;

    try {
      const payload: any = {
        title: editTitle,
        subtitle: editSubtitle,
        summary: editSummary,
        highlights: editHighlights,
        htmlContent: editHtmlContent
      };

      if (targetFile) {
        payload.fileBase64 = targetFile.base64;
        payload.filename = targetFile.name;
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
        // Clear local draft because content is now officially synced to server
        localStorage.removeItem(`meown_admin_draft_${selectedCategory}`);
        setHasDraft(false);

        setSaveStatus({
          type: 'success',
          message: `✅ Đã lưu, sao lưu và đồng bộ tệp "${targetFile ? targetFile.name : editTitle}" thành công vào toàn bộ hệ thống!`
        });
        onContentUpdated({
          ...content,
          [selectedCategory]: data.content
        });
        setUploadedHtmlFile(null);
        // Refresh backups list
        loadBackups();
      } else {
        setSaveStatus({ type: 'error', message: data.error || 'Lỗi khi lưu dữ liệu lên máy chủ.' });
      }
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Lỗi mạng khi lưu dữ liệu lên máy chủ.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Restore a specific backup
  const handleRestoreBackup = async (backupId: string, originalName: string) => {
    if (!adminToken) return;
    if (!window.confirm(`Bạn có chắc chắn muốn khôi phục bản sao lưu "${originalName}" không?`)) return;

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/backups/${backupId}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Clear local draft
        localStorage.removeItem(`meown_admin_draft_${data.content.id}`);
        setHasDraft(false);

        setSaveStatus({
          type: 'success',
          message: `✅ Đã khôi phục thành công bản sao lưu "${originalName}"!`
        });
        onContentUpdated({
          ...content,
          [data.content.id]: data.content
        });
        setSelectedCategory(data.content.id);
        setEditHtmlContent(data.content.htmlContent || '');
        setEditTitle(data.content.title || '');
      } else {
        setSaveStatus({ type: 'error', message: data.error || 'Không thể khôi phục.' });
      }
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Lỗi khi khôi phục bản sao lưu.' });
    } finally {
      setIsSaving(false);
    }
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
        localStorage.removeItem('meown_admin_draft_radio');
        setSaveStatus({ type: 'success', message: '✅ Đã tải lên và sao lưu bài hát vào đài Radio thành công!' });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#080c14] border border-slate-800 text-slate-100 shadow-2xl overflow-hidden">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-[#0d121d] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>{isAdmin ? 'Bảng Điều Khiển & Sao Lưu Quản Trị' : 'Xác Thực Quản Trị Viên'}</span>
                {isAdmin && (
                  <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                    ĐÃ XÁC THỰC
                  </span>
                )}
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
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 rounded-lg transition-colors cursor-pointer mr-1"
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* VIEW 1: LOGIN FORM */}
          {!isAdmin ? (
            <div className="max-w-md mx-auto py-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">Đăng Nhập Quản Trị Viên</h4>
                <p className="text-xs text-slate-400">
                  Chỉ quản trị viên mới có quyền tải lên, lưu trữ và sao lưu các tệp HTML và bài hát MP3. Mật khẩu được bảo vệ an toàn phía máy chủ.
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
                <span className="font-semibold text-cyan-400 block">✦ Tự động sao lưu & Lưu nháp</span>
                <span>Mọi thay đổi của bạn đều được tự động lưu nháp vào LocalStorage trên máy bạn và lưu trữ sao lưu vĩnh viễn trên máy chủ khi đồng bộ.</span>
              </div>
            </div>
          ) : (
            /* VIEW 2: LOGGED-IN ADMIN DASHBOARD */
            <div className="space-y-6">
              
              {/* Admin Navigation 3 Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setAdminActiveTab('content')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    adminActiveTab === 'content'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>Tải Lên & Quản Lý Tư Liệu HTML</span>
                </button>

                <button
                  onClick={() => setAdminActiveTab('backups')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    adminActiveTab === 'backups'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Lịch Sử Sao Lưu ({backups.length})</span>
                </button>

                <button
                  onClick={() => setAdminActiveTab('radio')}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    adminActiveTab === 'radio'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>Đài Radio & Tải MP3</span>
                </button>
              </div>

              {/* Status Alert Banner */}
              {saveStatus && (
                <div
                  className={`p-3.5 rounded-lg flex items-center justify-between gap-2 text-xs ${
                    saveStatus.type === 'success'
                      ? 'bg-emerald-950/70 border border-emerald-700 text-emerald-200'
                      : 'bg-rose-950/70 border border-rose-700 text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {saveStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span className="font-medium">{saveStatus.message}</span>
                  </div>
                  <button
                    onClick={() => setSaveStatus(null)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* TAB 1: HTML CONTENT & TAB EDITOR */}
              {adminActiveTab === 'content' && (
                <div className="space-y-5">
                  
                  {/* Category Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      1. Chọn phân hệ danh mục cần cập nhật
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {tabs.map((tab) => {
                        const tabData = content[tab.id];
                        const isSelected = selectedCategory === tab.id;
                        const hasCategoryDraft = !!localStorage.getItem(`meown_admin_draft_${tab.id}`);
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setSelectedCategory(tab.id)}
                            className={`p-2.5 rounded-lg text-xs font-medium text-left border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 shadow-sm'
                                : 'bg-[#0d121d] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <div className="font-semibold truncate">{tab.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-1">
                              <span>{tab.code}</span>
                              {hasCategoryDraft ? (
                                <span className="text-amber-400 text-[9px] font-sans font-semibold">● Nháp</span>
                              ) : tabData?.isCustomUpload ? (
                                <span className="text-cyan-400 text-[9px] font-sans">✓ Đã up</span>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AUTOSAVE DRAFT NOTICE BANNER */}
                  {hasDraft && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-200 text-xs animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <BookmarkCheck className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>
                          <strong>Bản nháp tự động lưu trên máy:</strong> Đã lưu lúc <strong>{draftSavedAt}</strong>. Dữ liệu này sẽ được duy trì an toàn kể cả khi bạn tải lại trang (F5).
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleDiscardDraft}
                        className="self-start sm:self-auto text-amber-400 hover:text-white underline text-[11px] font-semibold cursor-pointer shrink-0"
                      >
                        Hủy nháp & nạp bản máy chủ
                      </button>
                    </div>
                  )}

                  {/* PROMINENT FILE UPLOAD BOX WITH DIRECT 1-CLICK SAVE */}
                  <div className="p-4 sm:p-5 rounded-xl border-2 border-cyan-500/50 bg-[#090e18] shadow-lg space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-cyan-300 font-semibold text-sm">
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>Tải Lên Tệp HTML Cho Mục: "{tabs.find(t => t.id === selectedCategory)?.name}"</span>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400/80">
                        ĐƯỢC SAO LƯU VĨNH VIỄN TRÊN SERVER
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Chọn file HTML từ máy tính. Ngay khi chọn, mã HTML sẽ tự động được lưu nháp vào LocalStorage trên máy bạn và sẵn sàng đồng bộ lên máy chủ.
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                      <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-cyan-600/70 hover:border-cyan-400 bg-[#04060a] hover:bg-[#070b13] cursor-pointer text-xs text-slate-200 font-medium transition-colors">
                        <Upload className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="truncate">
                          {uploadedHtmlFile ? `Đã chọn: ${uploadedHtmlFile.name}` : 'Bấm vào đây để chọn tệp HTML (.html, .htm)...'}
                        </span>
                        <input
                          type="file"
                          accept=".html,.htm"
                          onChange={handleHtmlFileChange}
                          className="hidden"
                        />
                      </label>

                      {/* IMMEDIATE 1-CLICK SAVE BUTTON IF FILE CHOSEN */}
                      {uploadedHtmlFile && (
                        <button
                          type="button"
                          onClick={() => handleSaveContent()}
                          disabled={isSaving}
                          className="px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 animate-pulse"
                        >
                          {isSaving ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Đang lưu & sao lưu...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              <span>LƯU & ÁP DỤNG TỆP NÀY NGAY</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {uploadedHtmlFile && (
                      <div className="flex items-center justify-between text-xs bg-cyan-950/40 border border-cyan-800/50 p-2.5 rounded-lg text-cyan-300">
                        <span>Tệp sẵn sàng: <strong>{uploadedHtmlFile.name}</strong> ({(uploadedHtmlFile.size / 1024).toFixed(1)} KB)</span>
                        <span className="text-[11px] text-slate-400">Bấm nút "LƯU & ÁP DỤNG" ở trên để ghi đè vào web</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                        <span>Tiêu đề hiển thị phân hệ</span>
                        <span className="text-[10px] text-slate-500 font-mono">Tự động lưu nháp</span>
                      </div>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => {
                          setEditTitle(e.target.value);
                          triggerAutoSave({ title: e.target.value });
                        }}
                        className="w-full px-3 py-2 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                        placeholder="VD: Lịch Sử Kiến Tạo & Tiến Hóa Cổ Hành Tinh"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                        <span>Phụ đề tóm lược</span>
                        <span className="text-[10px] text-slate-500 font-mono">Tự động lưu nháp</span>
                      </div>
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => {
                          setEditSubtitle(e.target.value);
                          triggerAutoSave({ subtitle: e.target.value });
                        }}
                        className="w-full px-3 py-2 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                        placeholder="VD: Biên niên sử 12,4 tỷ năm..."
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                      <span>Đoạn tóm tắt giới thiệu</span>
                      <span className="text-[10px] text-slate-500 font-mono">Tự động lưu nháp</span>
                    </div>
                    <textarea
                      rows={2}
                      value={editSummary}
                      onChange={(e) => {
                        setEditSummary(e.target.value);
                        triggerAutoSave({ summary: e.target.value });
                      }}
                      className="w-full px-3 py-2 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      placeholder="Mô tả ngắn gọn về thiết lập thế giới cho mục này..."
                    />
                  </div>

                  {/* Highlights Manager */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                      <span>Các điểm nhấn nổi bật (Highlights)</span>
                      <span className="text-[10px] text-slate-500 font-mono">Tự động lưu nháp</span>
                    </div>
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

                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
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

                  {/* Live HTML Code Editor & Preview */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-slate-300 flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-cyan-400" />
                        <span>Mã HTML Trực Tiếp ({editHtmlContent.length} ký tự)</span>
                      </label>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono">Tự động lưu nháp khi gõ</span>
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

                    <textarea
                      rows={8}
                      value={editHtmlContent}
                      onChange={(e) => {
                        setEditHtmlContent(e.target.value);
                        triggerAutoSave({ htmlContent: e.target.value });
                      }}
                      className="w-full p-3 font-mono text-xs bg-[#030509] border border-slate-800 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-500 leading-relaxed selection:bg-cyan-500/30"
                      placeholder="<!DOCTYPE html><html>...</html>"
                    />
                  </div>

                  {/* General Save Button */}
                  <div className="pt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5">
                      <BookmarkCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        {hasDraft
                          ? `Bản nháp đã lưu trên máy (${draftSavedAt}). Nhấn nút bên cạnh để đồng bộ máy chủ.`
                          : 'Dữ liệu đang đồng bộ hoàn toàn với máy chủ.'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSaveContent()}
                      disabled={isSaving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer shrink-0"
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

              {/* TAB 2: BACKUP & RESTORE HISTORY */}
              {adminActiveTab === 'backups' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <History className="w-4 h-4 text-cyan-400" />
                        <span>Kho Lưu Trữ & Lịch Sử Sao Lưu HTML</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Tất cả các phiên bản tệp HTML bạn đã tải lên đều được lưu giữ tại đây. Bạn có thể khôi phục lại bất kỳ lúc nào.
                      </p>
                    </div>

                    <button
                      onClick={loadBackups}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                      <span>Làm mới</span>
                    </button>
                  </div>

                  {/* Preview Modal for selected backup */}
                  {previewBackupHtml && (
                    <div className="p-4 rounded-xl border border-cyan-800/80 bg-slate-950 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-cyan-300">Xem trước bản sao lưu</span>
                        <button
                          onClick={() => setPreviewBackupHtml(null)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Đóng xem trước
                        </button>
                      </div>
                      <div className="h-60 rounded border border-slate-800 overflow-hidden bg-black">
                        <iframe
                          title="Backup Preview"
                          srcDoc={previewBackupHtml}
                          sandbox="allow-scripts allow-same-origin"
                          className="w-full h-full border-0"
                        />
                      </div>
                    </div>
                  )}

                  {backups.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border border-slate-800 rounded-xl bg-[#0a0e17]">
                      <FileCode className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-xs">Chưa có bản sao lưu nào được ghi nhận.</p>
                      <p className="text-[11px] text-slate-500 mt-1">Khi bạn tải lên hoặc lưu tệp HTML mới, bản sao lưu sẽ xuất hiện tại đây.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                      {backups.map((bk) => (
                        <div
                          key={bk.id}
                          className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{bk.originalName}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/50 uppercase">
                                Phân hệ: {tabs.find(t => t.id === bk.tabId)?.name || bk.tabId}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-3">
                              <span>Thời gian: {new Date(bk.timestamp).toLocaleString('vi-VN')}</span>
                              <span>·</span>
                              <span>Kích thước: {(bk.size / 1024).toFixed(1)} KB</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={bk.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                              title="Tải về tệp này"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Tải về</span>
                            </a>

                            <button
                              type="button"
                              onClick={() => {
                                fetch(bk.url)
                                  .then(r => r.text())
                                  .then(text => setPreviewBackupHtml(text))
                                  .catch(console.error);
                              }}
                              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRestoreBackup(bk.id, bk.originalName)}
                              className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                              title="Khôi phục tệp này làm nội dung chính"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Khôi phục</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: RADIO MUSIC MANAGER */}
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
                        <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                          <span>Tên bài hát *</span>
                          <span className="text-[10px] text-slate-500 font-mono">Tự động lưu nháp</span>
                        </div>
                        <input
                          type="text"
                          required
                          value={trackTitle}
                          onChange={(e) => {
                            setTrackTitle(e.target.value);
                            triggerRadioAutoSave({ title: e.target.value });
                          }}
                          placeholder="VD: Giai Điệu Ánh Sao MEOWN"
                          className="w-full px-3 py-2 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                          <span>Tên ca sĩ / nghệ sĩ *</span>
                          <span className="text-[10px] text-slate-500 font-mono">Tự động lưu nháp</span>
                        </div>
                        <input
                          type="text"
                          required
                          value={trackArtist}
                          onChange={(e) => {
                            setTrackArtist(e.target.value);
                            triggerRadioAutoSave({ artist: e.target.value });
                          }}
                          placeholder="VD: Dàn Giao Hưởng Aethel"
                          className="w-full px-3 py-2 text-xs bg-[#04060a] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>

                    {/* File upload or URL */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                        <span>Chọn tệp MP3 từ máy tính hoặc nhập liên kết</span>
                        <span className="text-[10px] text-slate-500 font-mono">Tự động lưu nháp</span>
                      </div>
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
                            onChange={(e) => {
                              setTrackDirectUrl(e.target.value);
                              triggerRadioAutoSave({ directUrl: e.target.value });
                            }}
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
