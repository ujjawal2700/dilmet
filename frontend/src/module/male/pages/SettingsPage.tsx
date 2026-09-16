import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/context/AuthContext';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';
import { useGlobalState } from '../../../core/context/GlobalStateContext';
import userService from '../../../core/services/user.service';
import { legalDocuments } from '../../../core/content/legalDocuments';
import { queryClient } from '../../../core/queries/queryClient';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addNotification, appSettings } = useGlobalState();
  const supportEmail = appSettings?.general?.supportEmail;
  const supportPhone = appSettings?.general?.supportPhone;

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI companions preference (null until loaded)
  const [showAiCompanions, setShowAiCompanions] = useState<boolean | null>(null);
  const [isSavingAiPref, setIsSavingAiPref] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    userService.getMyProfile()
      .then((profile: any) => setShowAiCompanions(profile?.showAiCompanions !== false))
      .catch(() => setShowAiCompanions(true));
  }, []);

  const handleToggleAiCompanions = async () => {
    if (showAiCompanions === null || isSavingAiPref) return;
    const next = !showAiCompanions;
    setShowAiCompanions(next);
    setIsSavingAiPref(true);
    try {
      await userService.updateMyProfile({ showAiCompanions: next });
      queryClient.invalidateQueries({ queryKey: ['discovery'] });
    } catch (error) {
      console.error('Failed to update AI companion preference:', error);
      setShowAiCompanions(!next);
    } finally {
      setIsSavingAiPref(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await userService.deleteMyAccount();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="text-ink font-display antialiased min-h-screen relative overflow-x-hidden">

      <div className="relative z-10 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full flex flex-col pb-16">

        {/* Header */}
        <section className="pt-4 px-4 pb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/male/my-profile')}
              className="bg-[#f6ece7] size-12 shrink-0 flex items-center justify-center rounded-2xl text-slate-600 active:scale-90 transition-all"
              aria-label="Back"
            >
              <MaterialSymbol name="arrow_back" size={24} />
            </button>
            <h1 className="text-2xl font-black tracking-tighter text-ink">{t('settings')}</h1>
          </div>
        </section>

        {/* About Dil Mate Section */}
        <section className="px-4 mt-4">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="bg-[#f6ece7] size-8 rounded-xl flex items-center justify-center bg-transparent text-pink-600">
              <MaterialSymbol name="info" size={18} />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
              {t('aboutDilMate')}
            </h3>
          </div>

          <div className="bg-white shadow-card rounded-[2rem] border-white/60 overflow-hidden p-4 space-y-2">
            {Object.values(legalDocuments).map((doc) => (
              <button
                key={doc.slug}
                onClick={() => navigate(`/legal/${doc.slug}`)}
                className="w-full h-16 bg-slate-50/50 rounded-2xl flex items-center justify-between px-6 group hover:bg-slate-100 transition-all duration-500"
              >
                <div className="flex items-center gap-4">
                  <MaterialSymbol
                    name={doc.icon}
                    size={20}
                    className="text-ink/60 group-hover:text-pink-500 transition-colors"
                  />
                  <span className="text-[11px] font-black uppercase tracking-[0.15em] text-ink/80 group-hover:text-ink transition-colors">
                    {doc.title}
                  </span>
                </div>
                <MaterialSymbol
                  name="chevron_right"
                  size={20}
                  className="text-ink/40 group-hover:translate-x-1 group-hover:text-pink-500 transition-transform"
                />
              </button>
            ))}
          </div>
        </section>

        {/* Support Section */}
        {(supportEmail || supportPhone) && (
          <section className="px-4 mt-6">
            <div className="flex items-center gap-3 px-2 mb-2">
              <div className="bg-[#f6ece7] size-8 rounded-xl flex items-center justify-center bg-transparent text-pink-600">
                <MaterialSymbol name="support_agent" size={18} />
              </div>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
                {t('support')}
              </h3>
            </div>

            <div className="bg-white shadow-card rounded-[2rem] border-white/60 overflow-hidden p-4 space-y-2">
              {supportEmail && (
                <a
                  href={`mailto:${supportEmail}`}
                  className="w-full h-16 bg-slate-50/50 rounded-2xl flex items-center justify-between px-6 group hover:bg-slate-100 transition-all duration-500"
                >
                  <div className="flex items-center gap-4">
                    <MaterialSymbol name="mail" size={20} className="text-ink/60 group-hover:text-pink-500 transition-colors" />
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink/60">
                        {t('emailUs')}
                      </span>
                      <span className="text-xs font-semibold text-ink">{supportEmail}</span>
                    </div>
                  </div>
                  <MaterialSymbol name="chevron_right" size={20} className="text-ink/40 group-hover:translate-x-1 group-hover:text-pink-500 transition-transform" />
                </a>
              )}
              {supportPhone && (
                <a
                  href={`tel:${supportPhone}`}
                  className="w-full h-16 bg-slate-50/50 rounded-2xl flex items-center justify-between px-6 group hover:bg-slate-100 transition-all duration-500"
                >
                  <div className="flex items-center gap-4">
                    <MaterialSymbol name="call" size={20} className="text-ink/60 group-hover:text-pink-500 transition-colors" />
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink/60">
                        {t('callUs')}
                      </span>
                      <span className="text-xs font-semibold text-ink">{supportPhone}</span>
                    </div>
                  </div>
                  <MaterialSymbol name="chevron_right" size={20} className="text-ink/40 group-hover:translate-x-1 group-hover:text-pink-500 transition-transform" />
                </a>
              )}
            </div>
          </section>
        )}

        {/* AI Companions Section */}
        <section className="px-4 mt-6">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="bg-[#f6ece7] size-8 rounded-xl flex items-center justify-center bg-transparent text-pink-600">
              <MaterialSymbol name="smart_toy" size={18} />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
              AI Companions
            </h3>
          </div>

          <div className="bg-white shadow-card rounded-[2rem] border-white/60 overflow-hidden p-4">
            <button
              onClick={handleToggleAiCompanions}
              disabled={showAiCompanions === null || isSavingAiPref}
              role="switch"
              aria-checked={!!showAiCompanions}
              className="w-full min-h-16 bg-slate-50/50 rounded-2xl flex items-center justify-between gap-4 px-6 py-3 hover:bg-slate-100 transition-all disabled:opacity-60"
            >
              <div className="flex flex-col items-start text-left">
                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-ink/80">
                  Show AI companions
                </span>
                <span className="text-xs font-medium text-ink/60 mt-0.5">
                  AI-powered profiles marked with an AI badge. They can appear in discovery and message you first.
                </span>
              </div>
              <span
                className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors ${showAiCompanions ? 'bg-pink-500' : 'bg-slate-300'}`}
              >
                <span
                  className={`absolute top-1 size-5 rounded-full bg-white shadow transition-transform ${showAiCompanions ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </span>
            </button>
          </div>
        </section>

        {/* Account Section */}
        <section className="px-4 mt-6">
          <div className="flex items-center gap-3 px-2 mb-2">
            <div className="bg-[#f6ece7] size-8 rounded-xl flex items-center justify-center bg-transparent text-pink-600">
              <MaterialSymbol name="manage_accounts" size={18} />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted">{t('account')}</h3>
          </div>

          <div className="bg-white shadow-card rounded-[2rem] border-white/60 overflow-hidden p-4 space-y-2">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full h-16 bg-slate-50/50 rounded-2xl flex items-center justify-between px-6 group hover:bg-slate-100 transition-all duration-500"
            >
              <div className="flex items-center gap-4">
                <MaterialSymbol name="power_settings_new" size={22} className="text-ink/60 group-hover:text-amber-500 transition-colors" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-ink/80 group-hover:text-ink transition-colors">{t('logout')}</span>
              </div>
              <MaterialSymbol name="chevron_right" size={20} className="text-ink/40 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full h-14 bg-red-500/5 rounded-2xl flex items-center justify-between px-6 group hover:bg-red-500/10 transition-all duration-500"
            >
              <div className="flex items-center gap-4">
                <MaterialSymbol name="delete_sweep" size={20} className="text-red-500/60 group-hover:text-red-500 transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500/60 group-hover:text-red-500 transition-colors">{t('deleteAccount')}</span>
              </div>
              <MaterialSymbol name="chevron_right" size={18} className="text-red-300/40" />
            </button>
          </div>
        </section>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink/50 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-card-lg space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Background Mesh Glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-56 bg-amber-400/15 blur-[70px] rounded-full pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-5 relative z-10">
              <div className="size-20 rounded-[1.75rem] flex items-center justify-center bg-amber-50 text-amber-500">
                <MaterialSymbol name="power_settings_new" size={44} filled />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-ink leading-none">{t('signOutOfVault')}</h3>
                <p className="text-[13px] font-medium text-muted leading-relaxed px-2">{t('logoutConfirmText')}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <button
                disabled={isLoggingOut}
                onClick={() => {
                  if (isLoggingOut) return;
                  setIsLoggingOut(true);
                  addNotification({ title: 'logoutSuccess', message: 'logoutSuccessMessage', type: 'system' });
                  logout();
                  navigate('/login');
                }}
                className="h-14 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl text-white text-[12px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-amber-500/25"
              >
                {isLoggingOut ? <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : t('confirmLogout')}
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="h-14 bg-slate-50 rounded-2xl text-ink/70 text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all hover:bg-slate-100"
              >
                {t('stayInVault')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-ink/50 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-card-lg space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Destructive Mesh Glow */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-56 h-56 bg-red-400/15 blur-[70px] rounded-full pointer-events-none" />

            <div className="flex flex-col items-center text-center space-y-5 relative z-10">
              <div className="size-20 rounded-[1.75rem] flex items-center justify-center bg-red-50 text-red-500">
                <MaterialSymbol name="delete_forever" size={44} filled />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-ink leading-none">{t('selfDestructTitle')}</h3>
                <p className="text-[13px] font-medium text-muted leading-relaxed px-2">{t('deleteAccountConfirm')}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 relative z-10">
              <button
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl text-white text-[12px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-red-500/25"
              >
                {isDeleting ? <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : t('confirmDelete')}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="h-14 bg-slate-50 rounded-2xl text-ink/70 text-[11px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all hover:bg-slate-100"
              >
                {t('abortAction')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
