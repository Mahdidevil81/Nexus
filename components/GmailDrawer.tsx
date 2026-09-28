import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  Send,
  Trash2,
  RefreshCw,
  Search,
  X,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Inbox,
  PenSquare,
  ShieldCheck,
  LogOut,
  Sparkles,
  Paperclip
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGmail,
  listGmailMessages,
  getGmailMessageDetail,
  sendGmailMessage,
  trashGmailMessage,
  setManualAccessToken,
  GmailMessageSummary,
  GmailMessageDetail
} from '../services/gmailService';
import firebaseConfig from '../firebase-applet-config.json';

interface GmailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'fa';
}

export const GmailDrawer: React.FC<GmailDrawerProps> = ({ isOpen, onClose, language }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState('');

  // Messages state
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  const [messages, setMessages] = useState<GmailMessageSummary[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageDetail | null>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Compose state
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Destructive Confirmation Modals
  const [showSendConfirmation, setShowSendConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<string | null>(null); // messageId to delete

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
        loadInbox();
      }
    } catch (err: any) {
      console.warn('Sign-in notice:', err?.message || err);
      const msg = err?.message || 'Authentication failed. Please check permissions.';
      if (msg.includes('api-key-not-valid') || msg.includes('requires a configured API key') || msg.includes('preview mode')) {
        setAuthError(
          language === 'en'
            ? 'Firebase API key is currently in preview mode or unconfigured in Google Cloud. You can connect using a direct Google Access Token below.'
            : 'کلید وب فایربیس در حالت پیش‌نمایش است. می‌توانید با توکن دسترسی مستقیم متصل شوید.'
        );
      } else {
        setAuthError(msg);
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleApplyManualToken = () => {
    if (!manualToken.trim()) return;
    setManualAccessToken(manualToken.trim());
    setHasToken(true);
    setCurrentUser({ email: 'authorized-workspace-user@gmail.com' } as any);
    setAuthError(null);
    loadInbox();
  };

  const handleSignOut = async () => {
    await logoutGmail();
    setCurrentUser(null);
    setHasToken(false);
    setMessages([]);
    setSelectedMessage(null);
  };

  const loadInbox = useCallback(async (query = searchQuery) => {
    setIsLoadingMessages(true);
    setStatusNotification(null);
    try {
      const fetched = await listGmailMessages(query);
      setMessages(fetched);
    } catch (err: any) {
      console.error('Failed to load Gmail messages:', err);
      setStatusNotification(err.message || 'Error fetching Gmail messages');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen && hasToken) {
      loadInbox();
    }
  }, [isOpen, hasToken, loadInbox]);

  const handleSelectMessage = async (summary: GmailMessageSummary) => {
    setIsLoadingDetail(true);
    setStatusNotification(null);
    try {
      const detail = await getGmailMessageDetail(summary.id);
      setSelectedMessage(detail);
    } catch (err: any) {
      console.error('Failed to load email details:', err);
      setStatusNotification(err.message || 'Could not load full email');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // User Confirmation for Sending Email (Mandatory workspace-integration rule)
  const confirmAndSend = async () => {
    setShowSendConfirmation(false);
    setIsSending(true);
    setStatusNotification(null);
    try {
      await sendGmailMessage(recipient, subject, body);
      setRecipient('');
      setSubject('');
      setBody('');
      setActiveTab('inbox');
      setStatusNotification(language === 'en' ? 'Email sent successfully via Gmail API!' : 'پیام با موفقیت از طریق جیمیل ارسال شد!');
      loadInbox();
    } catch (err: any) {
      console.error('Send error:', err);
      setStatusNotification(err.message || 'Failed to send email.');
    } finally {
      setIsSending(false);
    }
  };

  // User Confirmation for Trashing Email (Mandatory workspace-integration rule)
  const confirmAndTrash = async (messageId: string) => {
    setShowDeleteConfirmation(null);
    try {
      await trashGmailMessage(messageId);
      setSelectedMessage(null);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setStatusNotification(language === 'en' ? 'Email moved to trash.' : 'پیام به سطل زباله منتقل شد.');
    } catch (err: any) {
      console.error('Trash error:', err);
      setStatusNotification(err.message || 'Failed to delete email.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-2xl h-full bg-[#0a0f1d]/95 border-l border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col overflow-hidden text-gray-100"
        >
          {/* Header */}
          <div className="p-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/30 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Mail className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-wider text-white uppercase">
                    {language === 'en' ? 'Nexus Transmissions' : 'ارتباطات نکسوس'}
                  </h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
                    Gmail 1P
                  </span>
                </div>
                <p className="text-[11px] text-cyan-300/70 font-light">
                  {language === 'en' ? 'Direct quantum relay to your Google Workspace mailbox' : 'اتصال مستقیم به صندوق پستی گوگل ورکس‌پیس'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser && (
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-xs flex items-center gap-1.5"
                  title="Sign out from Google"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline text-[11px]">{language === 'en' ? 'Sign out' : 'خروج'}</span>
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

          {/* Body Content */}
          {!hasToken ? (
            /* Unauthenticated / Sign-in View */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.25)]">
                <Mail className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 tracking-wide">
                {language === 'en' ? 'Connect Your Gmail Account' : 'اتصال به حساب جیمیل'}
              </h3>
              <p className="text-xs text-gray-400 max-w-md leading-relaxed mb-6">
                {language === 'en'
                  ? 'Authorize Nexus to view your inbox, read communications, and compose transmissions directly with permission from your account.'
                  : 'به نکسوس اجازه دهید صندوق ورودی شما را مشاهده کند، ایمیل‌ها را بخواند و با کسب اجازه مستقیم از شما پیام ارسال نماید.'}
              </p>

              {/* Official Google Sign In Button according to SKILL.md specs */}
              <button
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="gsi-material-button relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-xl bg-white text-[#1f1f1f] font-sans font-medium text-sm rounded-full py-2.5 px-6 flex items-center gap-3 border border-gray-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper flex items-center gap-3">
                  <div className="gsi-material-button-icon w-5 h-5">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '100%', height: '100%' }}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents font-medium tracking-wide">
                    {isAuthenticating
                      ? (language === 'en' ? 'Authenticating...' : 'در حال ورود...')
                      : (language === 'en' ? 'Sign in with Google' : 'ورود با حساب گوگل')}
                  </span>
                </div>
              </button>

              {authError && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-2 max-w-md text-left">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{authError}</span>
                  </div>
                  <button
                    onClick={() => setShowManualInput(!showManualInput)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline text-left"
                  >
                    {showManualInput
                      ? (language === 'en' ? 'Hide direct token input' : 'مخفی کردن ورودی توکن')
                      : (language === 'en' ? 'Provide Google OAuth Access Token directly' : 'وارد کردن مستقیم توکن دسترسی گوگل')}
                  </button>
                </div>
              )}

              {showManualInput && (
                <div className="mt-4 p-4 rounded-xl bg-white/5 border border-cyan-500/30 max-w-md w-full text-left space-y-3">
                  <label className="text-[11px] text-gray-300 block">
                    {language === 'en' ? 'Google OAuth Bearer Token (from gcloud or OAuth Playground):' : 'توکن دسترسی گوگل:'}
                  </label>
                  <input
                    type="password"
                    placeholder="ya29.a0..."
                    value={manualToken}
                    onChange={(e) => setManualToken(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 font-mono"
                  />
                  <button
                    onClick={handleApplyManualToken}
                    disabled={!manualToken.trim()}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all disabled:opacity-40"
                  >
                    {language === 'en' ? 'Connect Live Inbox' : 'اتصال مستقیم به اینباکس'}
                  </button>
                </div>
              )}

              <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10 text-left max-w-md w-full">
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-semibold tracking-wider uppercase">
                    {language === 'en' ? 'Security & Permission Principles' : 'اصول امنیت و حریم خصوصی'}
                  </span>
                </div>
                <ul className="text-[11px] text-gray-400 space-y-1.5 list-disc list-inside">
                  <li>{language === 'en' ? 'Credentials securely handled through Google OAuth' : 'احراز هویت امن از طریق درگاه رسمی گوگل'}</li>
                  <li>{language === 'en' ? 'In-memory token caching only (never persisted in storage)' : 'ذخیره کلید موقت در حافظه رم بدون نگهداری در دیسک'}</li>
                  <li>{language === 'en' ? 'Mandatory confirmation for sending or deleting emails' : 'تایید صریح کاربر قبل از ارسال یا حذف هر پیام'}</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Authenticated Workspace View */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Top Navigation Tabs & User badge */}
              <div className="px-4 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedMessage(null);
                      setActiveTab('inbox');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      activeTab === 'inbox' && !selectedMessage
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Inbox size={14} />
                    <span>{language === 'en' ? 'Inbox' : 'صندوق ورودی'}</span>
                    {messages.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/30 text-cyan-200">
                        {messages.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setSelectedMessage(null);
                      setActiveTab('compose');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      activeTab === 'compose'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <PenSquare size={14} />
                    <span>{language === 'en' ? 'Compose' : 'نگارش'}</span>
                  </button>
                </div>

                {currentUser && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="truncate max-w-[180px] font-mono text-cyan-300">
                      {currentUser.email}
                    </span>
                  </div>
                )}
              </div>

              {/* Status banner */}
              {statusNotification && (
                <div className="px-4 py-2 bg-cyan-950/40 border-b border-cyan-500/20 text-cyan-200 text-xs flex items-center justify-between">
                  <span>{statusNotification}</span>
                  <button onClick={() => setStatusNotification(null)} className="text-cyan-400 hover:text-cyan-200">
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Tab 1: Inbox or Message Detail */}
              {activeTab === 'inbox' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  {selectedMessage ? (
                    /* Message Detail View */
                    <div className="flex-1 flex flex-col overflow-hidden p-4">
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                        <button
                          onClick={() => setSelectedMessage(null)}
                          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          <ArrowLeft size={14} />
                          <span>{language === 'en' ? 'Back to Inbox' : 'بازگشت به اینباکس'}</span>
                        </button>

                        <button
                          onClick={() => setShowDeleteConfirmation(selectedMessage.id)}
                          className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all text-xs flex items-center gap-1"
                          title="Move to Trash"
                        >
                          <Trash2 size={13} />
                          <span>{language === 'en' ? 'Trash' : 'انتقال به سطل زباله'}</span>
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        <div>
                          <h3 className="text-base font-bold text-white mb-2">
                            {selectedMessage.subject}
                          </h3>
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400">{language === 'en' ? 'From:' : 'فرستنده:'}</span>
                              <span className="text-cyan-300 font-mono">{selectedMessage.from}</span>
                            </div>
                            {selectedMessage.to && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">{language === 'en' ? 'To:' : 'گیرنده:'}</span>
                                <span className="text-gray-300 font-mono">{selectedMessage.to}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-400">{language === 'en' ? 'Date:' : 'تاریخ:'}</span>
                              <span className="text-gray-400">{selectedMessage.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Email Content */}
                        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                          {selectedMessage.bodyText}
                        </div>

                        {/* Quick Reply Button */}
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setRecipient(selectedMessage.from);
                              setSubject(`Re: ${selectedMessage.subject}`);
                              setBody(`\n\n--- Original Transmission ---\n${selectedMessage.bodyText.slice(0, 300)}...`);
                              setSelectedMessage(null);
                              setActiveTab('compose');
                            }}
                            className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 text-xs flex items-center gap-2 transition-all"
                          >
                            <Send size={13} />
                            <span>{language === 'en' ? 'Reply to Transmission' : 'پاسخ به این پیام'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Messages List View */
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Search Bar & Refresh */}
                      <div className="p-3 border-b border-white/10 flex items-center gap-2">
                        <div className="flex-1 relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder={language === 'en' ? 'Search messages (e.g. from, subject)...' : 'جستجوی پیام‌ها...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') loadInbox(searchQuery);
                            }}
                            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                          />
                        </div>
                        <button
                          onClick={() => loadInbox(searchQuery)}
                          disabled={isLoadingMessages}
                          className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                          title="Refresh Inbox"
                        >
                          <RefreshCw size={14} className={isLoadingMessages ? 'animate-spin text-cyan-400' : ''} />
                        </button>
                      </div>

                      {/* Messages List */}
                      <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                        {isLoadingMessages ? (
                          <div className="p-12 text-center text-xs text-cyan-400 animate-pulse flex flex-col items-center gap-3">
                            <RefreshCw className="w-6 h-6 animate-spin" />
                            <span>{language === 'en' ? 'Synchronizing Gmail transmissions...' : 'در حال دریافت پیام‌ها...'}</span>
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="p-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                            <Inbox className="w-8 h-8 text-gray-600 mb-1" />
                            <span>{language === 'en' ? 'No messages found in your inbox.' : 'پیامی در صندوق ورودی یافت نشد.'}</span>
                          </div>
                        ) : (
                          messages.map((msg) => (
                            <button
                              key={msg.id}
                              onClick={() => handleSelectMessage(msg)}
                              className="w-full text-left p-3.5 hover:bg-cyan-950/20 transition-colors flex items-start gap-3 group"
                            >
                              <div className="pt-0.5">
                                {msg.isUnread ? (
                                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                                ) : (
                                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`text-xs truncate max-w-[200px] ${msg.isUnread ? 'text-white font-bold' : 'text-gray-300'}`}>
                                    {msg.from.replace(/<.*>/, '')}
                                  </span>
                                  <span className="text-[10px] text-gray-500 font-mono shrink-0">
                                    {msg.date ? new Date(msg.date).toLocaleDateString() : ''}
                                  </span>
                                </div>
                                <div className={`text-xs truncate ${msg.isUnread ? 'text-cyan-200 font-semibold' : 'text-gray-400'} group-hover:text-cyan-300 transition-colors`}>
                                  {msg.subject}
                                </div>
                                <div className="text-[11px] text-gray-500 truncate mt-0.5 font-light">
                                  {msg.snippet}
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Compose Email */}
              {activeTab === 'compose' && (
                <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-3">
                  <div className="flex items-center gap-2 mb-1 text-cyan-400">
                    <PenSquare size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {language === 'en' ? 'New Neural Transmission' : 'نگارش پیام جدید'}
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">
                      {language === 'en' ? 'Recipient (To):' : 'گیرنده:'}
                    </label>
                    <input
                      type="email"
                      placeholder="recipient@example.com"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">
                      {language === 'en' ? 'Subject:' : 'موضوع:'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'en' ? 'Subject of your email' : 'موضوع ایمیل'}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div className="flex-1 flex flex-col">
                    <label className="text-[11px] text-gray-400 block mb-1">
                      {language === 'en' ? 'Message Body:' : 'متن پیام:'}
                    </label>
                    <textarea
                      rows={8}
                      placeholder={language === 'en' ? 'Write your message content here...' : 'متن پیام خود را بنویسید...'}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="w-full flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none font-sans"
                    />
                  </div>

                  {/* Send Action Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setShowSendConfirmation(true)}
                      disabled={!recipient.trim() || !subject.trim() || !body.trim() || isSending}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs flex items-center gap-2 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                      <Send size={14} />
                      <span>{language === 'en' ? 'Review & Send' : 'بررسی و ارسال'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MANDATORY USER CONFIRMATION DIALOG: SEND EMAIL */}
          {showSendConfirmation && (
            <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-[#0d1527] border border-cyan-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(6,182,212,0.3)] space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                    <Send size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {language === 'en' ? 'Confirm Transmission' : 'تایید ارسال پیام'}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {language === 'en'
                        ? 'This action will dispatch an email through your Gmail account.'
                        : 'این عملیات ایمیلی را از طریق حساب جیمیل شما ارسال خواهد کرد.'}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2">
                  <div>
                    <span className="text-gray-400 block text-[10px]">{language === 'en' ? 'Recipient:' : 'گیرنده:'}</span>
                    <span className="text-cyan-300 font-mono font-medium">{recipient}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">{language === 'en' ? 'Subject:' : 'موضوع:'}</span>
                    <span className="text-white font-medium">{subject}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">{language === 'en' ? 'Preview:' : 'پیش‌نمایش:'}</span>
                    <span className="text-gray-300 italic line-clamp-2">{body}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowSendConfirmation(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-xs transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'انصراف'}
                  </button>
                  <button
                    onClick={confirmAndSend}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  >
                    {language === 'en' ? 'Confirm & Send' : 'تایید و ارسال'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* MANDATORY USER CONFIRMATION DIALOG: DELETE / TRASH EMAIL */}
          {showDeleteConfirmation && (
            <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-md bg-[#1a0a0f] border border-red-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(239,68,68,0.3)] space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400">
                    <Trash2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {language === 'en' ? 'Confirm Move to Trash' : 'تایید انتقال به سطل زباله'}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {language === 'en'
                        ? 'Are you sure you want to move this message to your Gmail trash? This mutates your mailbox.'
                        : 'آیا از انتقال این پیام به سطل زباله جیمیل مطمئن هستید؟'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirmation(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 text-xs transition-colors"
                  >
                    {language === 'en' ? 'Cancel' : 'انصراف'}
                  </button>
                  <button
                    onClick={() => confirmAndTrash(showDeleteConfirmation)}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-xs transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                  >
                    {language === 'en' ? 'Confirm Delete' : 'تایید حذف'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default GmailDrawer;
