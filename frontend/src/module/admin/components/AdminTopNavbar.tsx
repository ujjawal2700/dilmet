import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';

interface AdminTopNavbarProps {
  onMenuClick: () => void;
}

export const AdminTopNavbar = ({ onMenuClick }: AdminTopNavbarProps) => {
  return (
    <div className="sticky top-0 z-40 bg-white/90 dark:bg-[#111114]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 lg:ml-64">
      <div className="flex items-center justify-between px-4 sm:px-5 h-[57px]">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu - Only on mobile */}
          <button
            onClick={onMenuClick}
            className="flex items-center justify-center size-9 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <MaterialSymbol name="menu" size={22} />
          </button>

          <div className="flex items-center gap-2">
            <div className="size-7 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shrink-0">
              <MaterialSymbol name="favorite" size={14} className="text-white" filled />
            </div>
            <span className="text-base font-black text-gray-900 dark:text-white tracking-tight">Dil Mate</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center size-9 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            title="View Site"
          >
            <MaterialSymbol name="public" size={20} />
          </a>
          <button
            className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            title="Account"
          >
            <div className="size-6 rounded-full bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center">
              <MaterialSymbol name="admin_panel_settings" size={16} className="text-pink-600 dark:text-pink-400" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 hidden sm:inline">Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
