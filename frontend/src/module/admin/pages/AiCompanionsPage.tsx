import { useState, useEffect, useRef } from 'react';
import { AdminTopNavbar } from '../components/AdminTopNavbar';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminNavigation } from '../hooks/useAdminNavigation';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { AdminNumberInput } from '../components/AdminNumberInput';
import adminService from '../../../core/services/admin.service';
import { compressImage } from '../../../core/utils/image';

type LanguageStyle = 'mirror' | 'hinglish' | 'hindi' | 'english';

interface AiPersona {
  personality: string;
  backstory: string;
  languageStyle: LanguageStyle;
  replyDelayMinSeconds: number | null;
  replyDelayMaxSeconds: number | null;
  isActive: boolean;
  stats?: {
    openersSent: number;
    repliesSent: number;
    inputTokens: number;
    outputTokens: number;
  };
}

interface AiCompanion {
  _id: string;
  isActive: boolean;
  profile: {
    name?: string;
    age?: number;
    bio?: string;
    occupation?: string;
    interests?: string[];
    photos?: Array<{ url: string }>;
  };
  persona: AiPersona | null;
}

interface AiSettings {
  enabled: boolean;
  replyDelayMinSeconds: number;
  replyDelayMaxSeconds: number;
  openersPerUserPerDay: number;
  repliesPerUserPerDay: number;
}

const LANGUAGE_OPTIONS: Array<{ value: LanguageStyle; label: string }> = [
  { value: 'mirror', label: "Match the user's language" },
  { value: 'hinglish', label: 'Hinglish' },
  { value: 'hindi', label: 'Hindi (Devanagari)' },
  { value: 'english', label: 'English' },
];

const DEFAULT_AI_SETTINGS: AiSettings = {
  enabled: true,
  replyDelayMinSeconds: 60,
  replyDelayMaxSeconds: 240,
  openersPerUserPerDay: 2,
  repliesPerUserPerDay: 150,
};

const inputClass =
  'w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none text-sm dark:text-white transition-all';
const labelClass = 'text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider';

const emptyForm = {
  name: '',
  age: 22,
  bio: '',
  occupation: '',
  interests: '',
  photos: [] as string[],
  personality: '',
  backstory: '',
  languageStyle: 'mirror' as LanguageStyle,
  replyDelayMinSeconds: '' as number | '',
  replyDelayMaxSeconds: '' as number | '',
  isActive: true,
};

export const AiCompanionsPage = () => {
  const { isSidebarOpen, setIsSidebarOpen, navigationItems, handleNavigationClick } = useAdminNavigation();

  const [companions, setCompanions] = useState<AiCompanion[]>([]);
  const [geminiConfigured, setGeminiConfigured] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [aiSettings, setAiSettings] = useState<AiSettings>(DEFAULT_AI_SETTINGS);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<AiCompanion | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [list, settings] = await Promise.all([
        adminService.listAiCompanions(),
        adminService.getAppSettings(),
      ]);
      setCompanions(list.companions);
      setGeminiConfigured(list.geminiConfigured);
      setAiSettings({ ...DEFAULT_AI_SETTINGS, ...(settings?.aiCompanions || {}) });
    } catch (error) {
      console.error('Failed to load AI companions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (next: AiSettings) => {
    if (next.replyDelayMinSeconds > next.replyDelayMaxSeconds) {
      alert('Minimum reply delay cannot be greater than maximum');
      return;
    }
    try {
      setIsSavingSettings(true);
      const saved = await adminService.updateAppSettings({ aiCompanions: next });
      setAiSettings({ ...DEFAULT_AI_SETTINGS, ...(saved?.aiCompanions || next) });
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      alert('Failed to save AI settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (c: AiCompanion) => {
    setEditing(c);
    setForm({
      name: c.profile?.name || '',
      age: c.profile?.age || 22,
      bio: c.profile?.bio || '',
      occupation: c.profile?.occupation || '',
      interests: (c.profile?.interests || []).join(', '),
      photos: (c.profile?.photos || []).map((p) => p.url),
      personality: c.persona?.personality || '',
      backstory: c.persona?.backstory || '',
      languageStyle: c.persona?.languageStyle || 'mirror',
      replyDelayMinSeconds: c.persona?.replyDelayMinSeconds ?? '',
      replyDelayMaxSeconds: c.persona?.replyDelayMaxSeconds ?? '',
      isActive: c.isActive,
    });
    setIsModalOpen(true);
  };

  const handleAddPhotos = async (files: FileList | null) => {
    if (!files) return;
    const remaining = 6 - form.photos.length;
    const selected = Array.from(files).slice(0, remaining);
    const encoded = await Promise.all(
      selected.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => compressImage(reader.result as string, { maxWidth: 1080, maxHeight: 1080 }).then(resolve, reject);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    );
    setForm((prev) => ({ ...prev, photos: [...prev.photos, ...encoded] }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert('Name is required');
      return;
    }
    const payload = {
      name: form.name.trim(),
      age: form.age,
      bio: form.bio,
      occupation: form.occupation,
      interests: form.interests.split(',').map((i) => i.trim()).filter(Boolean),
      photos: form.photos,
      personality: form.personality,
      backstory: form.backstory,
      languageStyle: form.languageStyle,
      replyDelayMinSeconds: form.replyDelayMinSeconds,
      replyDelayMaxSeconds: form.replyDelayMaxSeconds,
      isActive: form.isActive,
    };
    try {
      setIsSaving(true);
      if (editing) {
        const updated = await adminService.updateAiCompanion(editing._id, payload);
        setCompanions((prev) => prev.map((c) => (c._id === editing._id ? updated : c)));
      } else {
        const created = await adminService.createAiCompanion(payload);
        setCompanions((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to save AI companion:', error);
      alert(error?.response?.data?.message || 'Failed to save AI companion');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (c: AiCompanion) => {
    try {
      const updated = await adminService.updateAiCompanion(c._id, { isActive: !c.isActive });
      setCompanions((prev) => prev.map((x) => (x._id === c._id ? updated : x)));
    } catch (error) {
      console.error('Failed to toggle AI companion:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (c: AiCompanion) => {
    if (!window.confirm(`Delete AI companion "${c.profile?.name}"? Existing chats stay visible, but it will stop replying.`)) return;
    try {
      await adminService.deleteAiCompanion(c._id);
      setCompanions((prev) => prev.filter((x) => x._id !== c._id));
    } catch (error) {
      console.error('Failed to delete AI companion:', error);
      alert('Failed to delete AI companion');
    }
  };

  const totalTokens = companions.reduce(
    (sum, c) => sum + (c.persona?.stats?.inputTokens || 0) + (c.persona?.stats?.outputTokens || 0),
    0,
  );

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-[#0a0a0a] dark:via-[#1a1a1a] dark:to-[#0a0a0a] overflow-x-hidden transition-colors duration-300">
      <AdminTopNavbar onMenuClick={() => setIsSidebarOpen(true)} />
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        items={navigationItems}
        onItemClick={handleNavigationClick}
      />

      <div className="flex-1 p-4 md:p-6 mt-[57px] lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Companions</h1>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered profiles that chat using Gemini. Users always see them with an AI badge.
              </p>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg active:scale-95 self-start md:self-auto"
            >
              <MaterialSymbol name="add" size={20} />
              Add AI Companion
            </button>
          </div>

          {!geminiConfigured && (
            <div className="mb-6 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium">
              GEMINI_API_KEY is not set on the server, so AI companions won't send messages.
            </div>
          )}

          {/* Global settings */}
          <div className="bg-white dark:bg-[#151515] p-5 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Global settings</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {companions.length} companions · {totalTokens.toLocaleString()} Gemini tokens used
                </p>
              </div>
              <button
                type="button"
                disabled={isSavingSettings}
                onClick={() => handleSaveSettings({ ...aiSettings, enabled: !aiSettings.enabled })}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${
                  aiSettings.enabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/30'
                    : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/30'
                }`}
              >
                <span className={`size-2 rounded-full ${aiSettings.enabled ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {aiSettings.enabled ? 'AI companions ON' : 'AI companions OFF'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Min reply delay (sec)</label>
                <AdminNumberInput min={0} value={aiSettings.replyDelayMinSeconds} onChange={(v) => setAiSettings((s) => ({ ...s, replyDelayMinSeconds: v }))} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Max reply delay (sec)</label>
                <AdminNumberInput min={0} value={aiSettings.replyDelayMaxSeconds} onChange={(v) => setAiSettings((s) => ({ ...s, replyDelayMaxSeconds: v }))} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>First messages / user / day</label>
                <AdminNumberInput min={0} value={aiSettings.openersPerUserPerDay} onChange={(v) => setAiSettings((s) => ({ ...s, openersPerUserPerDay: v }))} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>AI replies / user / day</label>
                <AdminNumberInput min={0} value={aiSettings.repliesPerUserPerDay} onChange={(v) => setAiSettings((s) => ({ ...s, repliesPerUserPerDay: v }))} />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                disabled={isSavingSettings}
                onClick={() => handleSaveSettings(aiSettings)}
                className="px-5 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold disabled:opacity-60"
              >
                {isSavingSettings ? 'Saving…' : 'Save settings'}
              </button>
            </div>
          </div>

          {/* Companion list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : companions.length === 0 ? (
            <div className="bg-white dark:bg-[#151515] border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-10 text-center text-gray-500 dark:text-gray-400">
              <MaterialSymbol name="smart_toy" size={40} className="text-gray-300" />
              <p className="font-semibold text-sm mt-2">No AI companions yet</p>
              <p className="text-xs text-gray-400">Add one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {companions.map((c) => (
                <div key={c._id} className="bg-white dark:bg-[#151515] border border-gray-200/60 dark:border-gray-800/60 rounded-2xl shadow-sm p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center">
                      {c.profile?.photos?.[0]?.url ? (
                        <img src={c.profile.photos[0].url} alt={c.profile?.name} className="w-full h-full object-cover" />
                      ) : (
                        <MaterialSymbol name="smart_toy" size={28} className="text-gray-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-gray-900 dark:text-white truncate">
                        {c.profile?.name}
                        {c.profile?.age ? <span className="font-medium text-gray-500">, {c.profile.age}</span> : null}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {LANGUAGE_OPTIONS.find((l) => l.value === c.persona?.languageStyle)?.label || "Match the user's language"}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleActive(c)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        c.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
                          : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {c.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{c.persona?.personality || c.profile?.bio}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {c.persona?.stats?.openersSent || 0} first messages · {c.persona?.stats?.repliesSent || 0} replies
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:text-blue-600" title="Edit">
                        <MaterialSymbol name="edit" size={18} />
                      </button>
                      <button onClick={() => handleDelete(c)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg hover:text-red-600" title="Delete">
                        <MaterialSymbol name="delete" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create / edit modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editing ? 'Edit AI Companion' : 'Add AI Companion'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="size-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 flex items-center justify-center"
              >
                <MaterialSymbol name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Name</label>
                  <input required className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Age</label>
                  <AdminNumberInput min={18} max={100} value={form.age} onChange={(v) => setForm({ ...form, age: v })} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Occupation</label>
                  <input className={inputClass} value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Interests (comma separated)</label>
                  <input className={inputClass} value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Profile bio</label>
                <textarea rows={2} className={inputClass} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>

              {/* Photos */}
              <div className="space-y-2">
                <label className={labelClass}>Photos (up to 6)</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use AI-generated or illustrated avatars, or photos you have written consent to use for an AI character. Never use photos of real people without their permission.
                </p>
                <div className="flex flex-wrap gap-2">
                  {form.photos.map((url, i) => (
                    <div key={i} className="relative size-20 rounded-xl overflow-hidden bg-gray-100">
                      <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, photos: form.photos.filter((_, idx) => idx !== i) })}
                        className="absolute top-1 right-1 size-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                        aria-label="Remove photo"
                      >
                        <MaterialSymbol name="close" size={14} />
                      </button>
                    </div>
                  ))}
                  {form.photos.length < 6 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="size-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-gray-400 flex items-center justify-center hover:border-pink-500 hover:text-pink-500"
                    >
                      <MaterialSymbol name="add_photo_alternate" size={24} />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => handleAddPhotos(e.target.files)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Personality</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Cheerful and witty, loves chai, old Bollywood songs and street food. Teases playfully."
                  className={inputClass}
                  value={form.personality}
                  onChange={(e) => setForm({ ...form, personality: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Character background</label>
                <textarea
                  rows={3}
                  placeholder="Hobbies, job, favourite things – used for small talk."
                  className={inputClass}
                  value={form.backstory}
                  onChange={(e) => setForm({ ...form, backstory: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Language</label>
                  <select
                    className={inputClass}
                    value={form.languageStyle}
                    onChange={(e) => setForm({ ...form, languageStyle: e.target.value as LanguageStyle })}
                  >
                    {LANGUAGE_OPTIONS.map((l) => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Min delay (sec)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder={`Default ${aiSettings.replyDelayMinSeconds}`}
                    className={inputClass}
                    value={form.replyDelayMinSeconds}
                    onChange={(e) => setForm({ ...form, replyDelayMinSeconds: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Max delay (sec)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder={`Default ${aiSettings.replyDelayMaxSeconds}`}
                    className={inputClass}
                    value={form.replyDelayMaxSeconds}
                    onChange={(e) => setForm({ ...form, replyDelayMaxSeconds: e.target.value === '' ? '' : Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-200/60 dark:border-gray-800/60">
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">Active</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Inactive companions are hidden from discovery and stop replying</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${form.isActive ? 'bg-pink-600' : 'bg-gray-200 dark:bg-gray-800'}`}
                >
                  <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-pink-700 text-white text-sm font-bold disabled:opacity-60"
                >
                  {isSaving ? 'Saving…' : editing ? 'Save changes' : 'Create companion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
