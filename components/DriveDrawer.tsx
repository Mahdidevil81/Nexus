import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  HardDrive,
  Folder,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Video,
  FileCode,
  File,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  X,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Upload,
  FolderPlus,
  Sparkles,
  LogOut,
  Download,
  Clock
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGmail,
  setManualAccessToken
} from '../services/gmailService';
import {
  listDriveFiles,
  createDriveFolder,
  uploadDriveTextFile,
  deleteDriveFile,
  DriveFile
} from '../services/driveService';
import { AiResponse, Task, UserProfile } from '../types';

interface DriveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'fa';
  history?: AiResponse[];
  tasks?: Task[];
  userProfile?: UserProfile;
}

export const DriveDrawer: React.FC<DriveDrawerProps> = ({
  isOpen,
  onClose,
  language,
  history = [],
  tasks = [],
  userProfile
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState('');

  // Files state
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'folders' | 'docs' | 'sheets' | 'media'>('all');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // New folder modal
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [showFolderConfirm, setShowFolderConfirm] = useState(false);

  // New upload / note modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadContent, setUploadContent] = useState('');
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);

  // Mandatory Delete Confirmation Modal
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // Listen to auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setHasToken(!!token);
      },
      () => {
        setCurrentUser(null);
        setHasToken(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setHasToken(true);
        loadFiles();
      }
    } catch (err: any) {
      console.warn('Sign-in notice:', err?.message || err);
      const msg = err?.message || 'Authentication failed.';
      if (msg.includes('api-key-not-valid') || msg.includes('requires a configured API key') || msg.includes('preview mode')) {
        setAuthError(
          language === 'en'
            ? 'Firebase API key is currently in preview mode. You can connect using a direct Google Access Token below.'
            : 'کلید وب فایربیس در حالت پیش‌نمایش است. می‌توانید با توکن دسترسی گوگل مستقیماً متصل شوید.'
        );
        setShowManualInput(true);
      } else {
        setAuthError(msg);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    setManualAccessToken(manualToken.trim());
    setHasToken(true);
    setShowManualInput(false);
    setAuthError(null);
    loadFiles();
  };

  const handleLogout = async () => {
    await logoutGmail();
    setCurrentUser(null);
    setHasToken(false);
    setFiles([]);
  };

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    setStatusNotification(null);
    try {
      const data = await listDriveFiles(searchQuery, 40);
      setFiles(data);
    } catch (err: any) {
      console.warn('Load files error:', err);
      setStatusNotification(
        language === 'en' ? `Could not load Drive files: ${err.message}` : `خطا در دریافت فایل‌ها: ${err.message}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, language]);

  useEffect(() => {
    if (isOpen && hasToken) {
      loadFiles();
    }
  }, [isOpen, hasToken, loadFiles]);

  // Execute Folder Creation (Post Confirmation)
  const confirmCreateFolder = async () => {
    setShowFolderConfirm(false);
    setIsMutating(true);
    try {
      await createDriveFolder(folderName.trim());
      setStatusNotification(
        language === 'en' ? `Folder "${folderName}" created in Google Drive.` : `پوشه "${folderName}" در گوگل درایو ایجاد شد.`
      );
      setIsFolderModalOpen(false);
      setFolderName('');
      loadFiles();
    } catch (err: any) {
      setStatusNotification(
        language === 'en' ? `Failed to create folder: ${err.message}` : `خطا در ایجاد پوشه: ${err.message}`
      );
    } finally {
      setIsMutating(false);
    }
  };

  // Execute Upload Document (Post Confirmation)
  const confirmUploadFile = async () => {
    setShowUploadConfirm(false);
    setIsMutating(true);
    try {
      const fileName = uploadTitle.endsWith('.md') || uploadTitle.endsWith('.txt') ? uploadTitle : `${uploadTitle}.md`;
      await uploadDriveTextFile(fileName, uploadContent, 'text/markdown');
      setStatusNotification(
        language === 'en' ? `Document "${fileName}" saved to Google Drive.` : `سند "${fileName}" در گوگل درایو ذخیره شد.`
      );
      setIsUploadModalOpen(false);
      setUploadTitle('');
      setUploadContent('');
      loadFiles();
    } catch (err: any) {
      setStatusNotification(
        language === 'en' ? `Failed to upload file: ${err.message}` : `خطا در ذخیره فایل: ${err.message}`
      );
    } finally {
      setIsMutating(false);
    }
  };

  // Quick Action: Backup Nexus Intelligence Session to Drive
  const handlePrepareNexusBackup = () => {
    const dateStr = new Date().toISOString().split('T')[0];
    setUploadTitle(`Nexus-Neural-Archive-${dateStr}.md`);
    
    let content = `# Nexus Neural Consciousness Archive\n`;
    content += `**Date**: ${new Date().toLocaleString()}\n`;
    content += `**Architect**: Mahdi Farahi (Mahdi Devil)\n`;
    content += `**Motto**: "I am free because I am aware" (من آزادم چون آگاهم)\n\n`;
    
    content += `## Neural Objectives & Tasks\n`;
    if (tasks.length > 0) {
      tasks.forEach(t => {
        content += `- [${t.completed ? 'x' : ' '}] **${t.text}** (Priority: ${t.priority})\n`;
        if (t.description) content += `  - ${t.description}\n`;
      });
    } else {
      content += `No active tasks.\n`;
    }
    
    content += `\n## Recent Cognitive Transmissions\n`;
    if (history.length > 0) {
      history.slice(0, 5).forEach((h, i) => {
        content += `### Session ${i + 1} (${new Date(h.timestamp).toLocaleTimeString()})\n`;
        if (h.prompt) content += `> **Query**: ${h.prompt}\n\n`;
        content += `${h.text}\n\n---\n\n`;
      });
    }
    
    setUploadContent(content);
    setIsUploadModalOpen(true);
  };

  // Execute Deletion (Post Confirmation)
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    const target = fileToDelete;
    setFileToDelete(null);
    setIsMutating(true);
    try {
      await deleteDriveFile(target.id);
      setFiles(prev => prev.filter(f => f.id !== target.id));
      setStatusNotification(
        language === 'en' ? `File "${target.name}" removed from Google Drive.` : `فایل "${target.name}" از گوگل درایو حذف شد.`
      );
    } catch (err: any) {
      setStatusNotification(
        language === 'en' ? `Failed to delete file: ${err.message}` : `خطا در حذف فایل: ${err.message}`
      );
    } finally {
      setIsMutating(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) return <Folder size={18} className="text-amber-400" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet size={18} className="text-emerald-400" />;
    if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) return <FileText size={18} className="text-blue-400" />;
    if (mimeType.includes('image')) return <ImageIcon size={18} className="text-fuchsia-400" />;
    if (mimeType.includes('video')) return <Video size={18} className="text-red-400" />;
    if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('python')) return <FileCode size={18} className="text-cyan-400" />;
    return <File size={18} className="text-gray-400" />;
  };

  const formatFileSize = (bytesStr?: string) => {
    if (!bytesStr) return '';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = files.filter(f => {
    if (activeFilter === 'folders') return f.mimeType.includes('folder');
    if (activeFilter === 'docs') return f.mimeType.includes('document') || f.mimeType.includes('text');
    if (activeFilter === 'sheets') return f.mimeType.includes('spreadsheet') || f.mimeType.includes('excel');
    if (activeFilter === 'media') return f.mimeType.includes('image') || f.mimeType.includes('video') || f.mimeType.includes('audio');
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-end bg-black/60 backdrop-blur-md transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative z-10 w-full max-w-xl h-full bg-zinc-950/95 border-l border-emerald-500/20 shadow-2xl flex flex-col overflow-hidden text-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <HardDrive size={22} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold tracking-wider text-white uppercase flex items-center gap-2">
                {language === 'en' ? 'Google Drive' : 'گوگل درایو نکسوس'}
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Workspace
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                {language === 'en'
                  ? 'Cloud file storage, neural memory archives & document browser'
                  : 'فضای ابری، ذخیره خاطرات و مرورگر اسناد نکسوس'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasToken && (
              <button
                onClick={loadFiles}
                disabled={isLoading}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                title="Refresh Drive"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Status notification banner */}
        {statusNotification && (
          <div className="px-4 py-2 bg-emerald-950/40 border-b border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-emerald-400" />
              <span>{statusNotification}</span>
            </div>
            <button onClick={() => setStatusNotification(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Unauthenticated View */}
        {!hasToken ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
              <HardDrive size={32} />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              {language === 'en' ? 'Connect to Google Drive' : 'اتصال به فضای ابری گوگل درایو'}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mb-6 leading-relaxed">
              {language === 'en'
                ? 'Sign in with your Google account with permission to browse files, backup neural consciousness memory, and manage documents.'
                : 'با اجازه کاربر، برای مرور فایل‌ها، ذخیره گزارش‌های شناختی نکسوس و مدیریت اسناد به گوگل درایو متصل شوید.'}
            </p>

            {authError && (
              <div className="w-full max-w-sm p-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-left">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <AlertTriangle size={14} />
                  <span>{language === 'en' ? 'Authentication Notice' : 'توجه احراز هویت'}</span>
                </div>
                <p className="text-[11px] opacity-90">{authError}</p>
              </div>
            )}

            {/* Official Google Sign In Button */}
            <button
              onClick={handleSignIn}
              disabled={isAuthenticating}
              className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isAuthenticating ? (language === 'en' ? 'Connecting...' : 'در حال اتصال...') : (language === 'en' ? 'Sign in with Google' : 'ورود با حساب گوگل')}</span>
            </button>

            {/* Direct Token Option */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-xs text-emerald-400 hover:underline"
              >
                {language === 'en' ? 'Have a direct Google OAuth Access Token?' : 'توکن دسترسی گوگل مستقیم دارید؟'}
              </button>

              {showManualInput && (
                <form onSubmit={handleManualTokenSubmit} className="mt-3 w-full max-w-sm space-y-2">
                  <input
                    type="password"
                    placeholder="ya29.a0..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
                  >
                    {language === 'en' ? 'Authorize Access' : 'تایید دسترسی'}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Authenticated Drive View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Bar */}
            <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.01]">
              <div className="flex-1 min-w-[180px] relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Search Google Drive...' : 'جستجو در درایو...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadFiles()}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsFolderModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs flex items-center gap-1.5 transition-all"
                  title="New Folder"
                >
                  <FolderPlus size={14} className="text-amber-400" />
                  <span className="hidden sm:inline">{language === 'en' ? 'Folder' : 'پوشه'}</span>
                </button>

                <button
                  onClick={handlePrepareNexusBackup}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                  title="Backup Nexus Memory to Drive"
                >
                  <Upload size={14} />
                  <span>{language === 'en' ? 'Backup Nexus' : 'پشتیبان نکسوس'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 transition-colors"
                  title="Disconnect Drive"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 overflow-x-auto text-[11px]">
              {(['all', 'folders', 'docs', 'sheets', 'media'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-2.5 py-1 rounded-full capitalize whitespace-nowrap transition-all ${
                    activeFilter === f
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
                  <RefreshCw size={24} className="animate-spin text-emerald-400" />
                  <p className="text-xs">{language === 'en' ? 'Accessing Google Drive...' : 'در حال بارگذاری فایل‌ها...'}</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <HardDrive size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium text-gray-400">
                    {language === 'en' ? 'No files match your query' : 'فایلی یافت نشد'}
                  </p>
                  <p className="text-xs mt-1">
                    {language === 'en' ? 'Use "Backup Nexus" to save an archive directly to Drive.' : 'از دکمه پشتیبان نکسوس برای ایجاد سند استفاده کنید.'}
                  </p>
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-white/5 shrink-0">
                        {getFileIcon(file.mimeType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-emerald-300 transition-colors">
                          {file.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mt-0.5">
                          {file.size && <span>{formatFileSize(file.size)}</span>}
                          {file.modifiedTime && (
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(file.modifiedTime).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                          title="Open in Google Drive"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => setFileToDelete(file)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete from Drive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal: Create Folder Form */}
        <AnimatePresence>
          {isFolderModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center"
            >
              <div className="w-full max-w-sm bg-zinc-900 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FolderPlus size={16} className="text-amber-400" />
                    {language === 'en' ? 'New Drive Folder' : 'ایجاد پوشه جدید'}
                  </h3>
                  <button onClick={() => setIsFolderModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                      {language === 'en' ? 'Folder Name *' : 'نام پوشه *'}
                    </label>
                    <input
                      type="text"
                      placeholder="Nexus Research Data"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setIsFolderModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-xs"
                  >
                    {language === 'en' ? 'Cancel' : 'انصراف'}
                  </button>
                  <button
                    disabled={!folderName.trim()}
                    onClick={() => setShowFolderConfirm(true)}
                    className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs disabled:opacity-50"
                  >
                    {language === 'en' ? 'Review & Create' : 'بررسی و ساخت'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal: Upload / Backup Form */}
        <AnimatePresence>
          {isUploadModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center"
            >
              <div className="w-full max-w-md bg-zinc-900 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Upload size={16} className="text-emerald-400" />
                    {language === 'en' ? 'Save Document to Google Drive' : 'ذخیره سند در گوگل درایو'}
                  </h3>
                  <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                      {language === 'en' ? 'File Name *' : 'نام فایل *'}
                    </label>
                    <input
                      type="text"
                      placeholder="My-Document.md"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                      {language === 'en' ? 'Content (Markdown / Plain Text)' : 'محتوا (مارک‌داون یا متن)'}
                    </label>
                    <textarea
                      rows={8}
                      value={uploadContent}
                      onChange={(e) => setUploadContent(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono text-[11px] outline-none focus:border-emerald-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-xs"
                  >
                    {language === 'en' ? 'Cancel' : 'انصراف'}
                  </button>
                  <button
                    disabled={!uploadTitle.trim() || !uploadContent.trim()}
                    onClick={() => setShowUploadConfirm(true)}
                    className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs disabled:opacity-50"
                  >
                    {language === 'en' ? 'Review & Upload' : 'بررسی و ذخیره'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mandatory User Confirmation Modal for Folder Creation */}
        <AnimatePresence>
          {showFolderConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md p-6 flex items-center justify-center"
            >
              <div className="w-full max-w-sm bg-zinc-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    {language === 'en' ? 'Confirm Folder Creation' : 'تایید ایجاد پوشه'}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {language === 'en'
                      ? `Create the folder "${folderName}" in your Google Drive root directory?`
                      : `آیا مایلید پوشه "${folderName}" را در گوگل درایو خود ایجاد کنید؟`}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowFolderConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-semibold"
                  >
                    {language === 'en' ? 'Cancel' : 'انصراف'}
                  </button>
                  <button
                    disabled={isMutating}
                    onClick={confirmCreateFolder}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-lg"
                  >
                    {isMutating ? (language === 'en' ? 'Creating...' : 'در حال ساخت...') : (language === 'en' ? 'Confirm & Create' : 'تایید و ساخت')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mandatory User Confirmation Modal for File Upload */}
        <AnimatePresence>
          {showUploadConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md p-6 flex items-center justify-center"
            >
              <div className="w-full max-w-sm bg-zinc-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    {language === 'en' ? 'Confirm File Upload' : 'تایید ذخیره فایل'}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {language === 'en'
                      ? `Upload document "${uploadTitle}" to your Google Drive?`
                      : `آیا مایلید فایل "${uploadTitle}" را در حساب گوگل درایو خود آپلود نمایید؟`}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowUploadConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-semibold"
                  >
                    {language === 'en' ? 'Cancel' : 'انصراف'}
                  </button>
                  <button
                    disabled={isMutating}
                    onClick={confirmUploadFile}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-lg"
                  >
                    {isMutating ? (language === 'en' ? 'Uploading...' : 'در حال آپلود...') : (language === 'en' ? 'Confirm & Upload' : 'تایید و آپلود')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mandatory User Confirmation Modal for File Deletion (Destructive Operation) */}
        <AnimatePresence>
          {fileToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md p-6 flex items-center justify-center"
            >
              <div className="w-full max-w-sm bg-zinc-900 border border-red-500/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                  <AlertTriangle size={28} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    {language === 'en' ? 'Confirm File Deletion' : 'تایید حذف فایل'}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {language === 'en'
                      ? `Are you sure you want to delete "${fileToDelete.name}" from your Google Drive? This action cannot be undone.`
                      : `آیا از حذف دائمی فایل "${fileToDelete.name}" از گوگل درایو خود اطمینان دارید؟ این عملیات قابل بازگشت نیست.`}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setFileToDelete(null)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-semibold"
                  >
                    {language === 'en' ? 'Cancel' : 'انصراف'}
                  </button>
                  <button
                    disabled={isMutating}
                    onClick={confirmDeleteFile}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
                  >
                    {isMutating ? (language === 'en' ? 'Deleting...' : 'در حال حذف...') : (language === 'en' ? 'Yes, Delete' : 'بله، حذف کن')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DriveDrawer;
