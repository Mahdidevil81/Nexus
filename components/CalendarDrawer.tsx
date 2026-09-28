import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  X,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Video,
  Users,
  ShieldCheck,
  LogOut,
  CalendarCheck2,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logoutGmail,
  setManualAccessToken,
} from '../services/gmailService';
import {
  listCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  CalendarEvent,
  CalendarEventInput
} from '../services/calendarService';
import { Task } from '../types';

interface CalendarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'fa';
  tasks?: Task[];
}

export const CalendarDrawer: React.FC<CalendarDrawerProps> = ({
  isOpen,
  onClose,
  language,
  tasks = []
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualToken, setManualToken] = useState('');

  // Events state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // New Event Form State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eventSummary, setEventSummary] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Mandatory Destructive Confirmation Modals
  const [showCreateConfirm, setShowCreateConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

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
        loadEvents();
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
    loadEvents();
  };

  const handleLogout = async () => {
    await logoutGmail();
    setCurrentUser(null);
    setHasToken(false);
    setEvents([]);
  };

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setStatusNotification(null);
    try {
      const data = await listCalendarEvents(30, searchQuery);
      setEvents(data);
    } catch (err: any) {
      console.warn('Load calendar error:', err);
      setStatusNotification(
        language === 'en'
          ? `Could not load events: ${err.message}`
          : `خطا در دریافت تقویم: ${err.message}`
      );
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, language]);

  useEffect(() => {
    if (isOpen && hasToken) {
      loadEvents();
    }
  }, [isOpen, hasToken, loadEvents]);

  // Execute Event Creation (Post Confirmation)
  const confirmCreateEvent = async () => {
    setShowCreateConfirm(false);
    setIsSaving(true);
    setStatusNotification(null);

    try {
      const startDateTime = new Date(`${startDate}T${startTime}:00`).toISOString();
      const endDateTime = new Date(`${startDate}T${endTime}:00`).toISOString();

      const input: CalendarEventInput = {
        summary: eventSummary.trim(),
        description: eventDescription.trim() || undefined,
        location: eventLocation.trim() || undefined,
        start: { dateTime: startDateTime },
        end: { dateTime: endDateTime },
        attendees: attendeeEmail.trim() ? [{ email: attendeeEmail.trim() }] : undefined,
      };

      await createCalendarEvent(input);
      setStatusNotification(
        language === 'en' ? 'Event scheduled successfully in Google Calendar.' : 'رویداد با موفقیت در تقویم گوگل ثبت شد.'
      );
      setIsCreateModalOpen(false);
      setEventSummary('');
      setEventDescription('');
      setEventLocation('');
      setAttendeeEmail('');
      loadEvents();
    } catch (err: any) {
      setStatusNotification(
        language === 'en' ? `Failed to create event: ${err.message}` : `خطا در ایجاد رویداد: ${err.message}`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Execute Event Deletion (Post Confirmation)
  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    const target = eventToDelete;
    setEventToDelete(null);
    setStatusNotification(null);

    try {
      await deleteCalendarEvent(target.id);
      setEvents(prev => prev.filter(e => e.id !== target.id));
      setStatusNotification(
        language === 'en'
          ? `Event "${target.summary}" deleted from Google Calendar.`
          : `رویداد "${target.summary}" از تقویم گوگل حذف شد.`
      );
    } catch (err: any) {
      setStatusNotification(
        language === 'en' ? `Failed to delete event: ${err.message}` : `خطا در حذف رویداد: ${err.message}`
      );
    }
  };

  const handleQuickSyncTask = (task: Task) => {
    setEventSummary(task.text);
    setEventDescription(task.description || `Synchronized from Nexus Objective Matrix [ID: ${task.id}]`);
    if (task.dueDate) {
      setStartDate(task.dueDate);
    }
    setIsCreateModalOpen(true);
  };

  const formatEventTime = (event: CalendarEvent) => {
    if (event.start?.dateTime) {
      const d = new Date(event.start.dateTime);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (event.start?.date) {
      return language === 'en' ? 'All Day' : 'تمام روز';
    }
    return '';
  };

  const formatEventDate = (event: CalendarEvent) => {
    const raw = event.start?.dateTime || event.start?.date;
    if (!raw) return '';
    const d = new Date(raw);
    return d.toLocaleDateString(language === 'en' ? 'en-US' : 'fa-IR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-end bg-black/60 backdrop-blur-md transition-opacity">
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="relative z-10 w-full max-w-xl h-full bg-zinc-950/95 border-l border-cyan-500/20 shadow-2xl flex flex-col overflow-hidden text-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <CalendarIcon size={22} />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold tracking-wider text-white uppercase flex items-center gap-2">
                {language === 'en' ? 'Google Calendar' : 'تقویم گوگل نکسوس'}
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Workspace
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                {language === 'en'
                  ? 'Manage schedule, events & synchronized tasks'
                  : 'مدیریت زمان‌بندی، رویدادها و اهداف نکسوس'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasToken && (
              <button
                onClick={loadEvents}
                disabled={isLoading}
                className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
                title="Refresh Events"
              >
                <RefreshCw size={16} className={isLoading ? 'animate-spin text-cyan-400' : ''} />
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
          <div className="px-4 py-2 bg-cyan-950/40 border-b border-cyan-500/30 text-cyan-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-400" />
              <span>{statusNotification}</span>
            </div>
            <button onClick={() => setStatusNotification(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Unauthenticated View */}
        {!hasToken ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
              <CalendarCheck2 size={32} />
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              {language === 'en' ? 'Synchronize Your Google Calendar' : 'همگام‌سازی تقویم گوگل با نکسوس'}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mb-6 leading-relaxed">
              {language === 'en'
                ? 'Connect with permission to see your upcoming events, schedule appointments, and link Nexus neural objectives directly to your calendar.'
                : 'برای مشاهده رویدادها، زمان‌بندی جلسات و تبدیل اهداف نکسوس به رویدادهای تقویم، با اجازه کاربر متصل شوید.'}
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

            {/* Official Style Google Sign In Button */}
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
                className="text-xs text-cyan-400 hover:underline"
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
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
                  >
                    {language === 'en' ? 'Authorize Access' : 'تایید دسترسی'}
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Authenticated Calendar View */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Bar */}
            <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-white/[0.01]">
              <div className="flex-1 min-w-[200px] relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Search calendar events...' : 'جستجو در رویدادها...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadEvents()}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <Plus size={14} />
                  <span>{language === 'en' ? 'New Event' : 'رویداد جدید'}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 transition-colors"
                  title="Disconnect Calendar"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            {/* Quick Sync Tasks to Calendar banner */}
            {tasks.length > 0 && (
              <div className="px-4 py-2.5 bg-cyan-950/20 border-b border-cyan-500/20 flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-2 text-[10px] text-cyan-300 whitespace-nowrap">
                  <Sparkles size={12} className="text-cyan-400" />
                  <span>{language === 'en' ? 'Sync Objective:' : 'همگام‌سازی هدف:'}</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  {tasks.slice(0, 3).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleQuickSyncTask(t)}
                      className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-[10px] text-cyan-200 truncate max-w-[150px] transition-all"
                    >
                      + {t.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Events List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
                  <RefreshCw size={24} className="animate-spin text-cyan-400" />
                  <p className="text-xs">{language === 'en' ? 'Loading your Google Calendar...' : 'در حال بارگذاری تقویم گوگل...'}</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <CalendarIcon size={36} className="mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium text-gray-400">
                    {language === 'en' ? 'No upcoming events found' : 'هیچ رویدادی در این بازه یافت نشد'}
                  </p>
                  <p className="text-xs mt-1">
                    {language === 'en' ? 'Click "New Event" to add an event.' : 'برای ثبت رویداد، دکمه "رویداد جدید" را بزنید.'}
                  </p>
                </div>
              ) : (
                events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all group flex flex-col gap-2 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {formatEventDate(evt)}
                          </span>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock size={11} />
                            {formatEventTime(evt)}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white mt-1 group-hover:text-cyan-300 transition-colors">
                          {evt.summary || '(Untitled Event)'}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-90">
                        {evt.htmlLink && (
                          <a
                            href={evt.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            title="Open in Google Calendar"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button
                          onClick={() => setEventToDelete(evt)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {evt.description && (
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-gray-400 border-t border-white/5 mt-1">
                      {evt.location && (
                        <div className="flex items-center gap-1 text-gray-300 truncate max-w-[200px]">
                          <MapPin size={12} className="text-cyan-400 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      )}

                      {evt.hangoutLink && (
                        <a
                          href={evt.hangoutLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium"
                        >
                          <Video size={12} />
                          <span>Google Meet</span>
                        </a>
                      )}

                      {evt.attendees && evt.attendees.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-400">
                          <Users size={12} />
                          <span>{evt.attendees.length} {language === 'en' ? 'attendees' : 'شرکت‌کننده'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Modal: Create Event Form */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center"
            >
              <div className="w-full max-w-md bg-zinc-900 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <CalendarIcon size={16} className="text-cyan-400" />
                    {language === 'en' ? 'Schedule New Event' : 'ثبت رویداد جدید'}
                  </h3>
                  <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                      {language === 'en' ? 'Title *' : 'عنوان رویداد *'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'en' ? 'Meeting with Nexus architect...' : 'جلسه با معمار نکسوس...'}
                      value={eventSummary}
                      onChange={(e) => setEventSummary(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                        {language === 'en' ? 'Date' : 'تاریخ'}
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-[11px] outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                        {language === 'en' ? 'Start' : 'شروع'}
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-[11px] outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                        {language === 'en' ? 'End' : 'پایان'}
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-[11px] outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                      {language === 'en' ? 'Location' : 'مکان'}
                    </label>
                    <input
                      type="text"
                      placeholder={language === 'en' ? 'Online / Research Lab' : 'آنلاین یا دفتر پژوهش'}
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                      {language === 'en' ? 'Attendee Email' : 'ایمیل شرکت‌کننده'}
                    </label>
                    <input
                      type="email"
                      placeholder="colleague@example.com"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                      {language === 'en' ? 'Description' : 'توضیحات'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={language === 'en' ? 'Agenda or notes...' : 'دستور جلسه یا یادداشت‌ها...'}
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-cyan-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-xs"
                  >
                    {language === 'en' ? 'Cancel' : 'انصراف'}
                  </button>
                  <button
                    disabled={!eventSummary.trim()}
                    onClick={() => setShowCreateConfirm(true)}
                    className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs disabled:opacity-50"
                  >
                    {language === 'en' ? 'Review & Schedule' : 'بررسی و ثبت'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mandatory User Confirmation Modal for Creating Event */}
        <AnimatePresence>
          {showCreateConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md p-6 flex items-center justify-center"
            >
              <div className="w-full max-w-sm bg-zinc-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-center">
                <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    {language === 'en' ? 'Confirm Google Calendar Addition' : 'تایید ثبت در تقویم گوگل'}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {language === 'en'
                      ? `Add "${eventSummary}" on ${startDate} at ${startTime} to your primary Google Calendar?`
                      : `آیا مایلید رویداد "${eventSummary}" را در تاریخ ${startDate} ساعت ${startTime} به تقویم گوگل خود اضافه کنید؟`}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setShowCreateConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-semibold"
                  >
                    {language === 'en' ? 'Cancel' : 'انصراف'}
                  </button>
                  <button
                    disabled={isSaving}
                    onClick={confirmCreateEvent}
                    className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-lg"
                  >
                    {isSaving ? (language === 'en' ? 'Saving...' : 'در حال ثبت...') : (language === 'en' ? 'Confirm & Create' : 'تایید و ثبت')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mandatory User Confirmation Modal for Deleting Event (Destructive Operation) */}
        <AnimatePresence>
          {eventToDelete && (
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
                    {language === 'en' ? 'Confirm Event Deletion' : 'تایید حذف رویداد'}
                  </h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {language === 'en'
                      ? `Are you sure you want to permanently delete "${eventToDelete.summary || 'Untitled Event'}" from your Google Calendar? This action cannot be undone.`
                      : `آیا از حذف دائمی رویداد "${eventToDelete.summary || 'بدون عنوان'}" از تقویم گوگل اطمینان دارید؟ این عملیات قابل بازگشت نیست.`}
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setEventToDelete(null)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs font-semibold"
                  >
                    {language === 'en' ? 'Cancel' : 'انصراف'}
                  </button>
                  <button
                    onClick={confirmDeleteEvent}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
                  >
                    {language === 'en' ? 'Yes, Delete' : 'بله، حذف کن'}
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

export default CalendarDrawer;
