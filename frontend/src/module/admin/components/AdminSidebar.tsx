import { useState, useEffect } from "react";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";

interface SubItem {
  id: string;
  label: string;
  path: string;
  isActive?: boolean;
  badgeCount?: number;
}

interface NavItem {
  id: string;
  icon: string;
  label: string;
  isActive?: boolean;
  hasBadge?: boolean;
  badgeCount?: number;
  subItems?: SubItem[];
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: NavItem[];
  onItemClick?: (itemId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const AdminSidebar = ({
  isOpen,
  onClose,
  items,
  onItemClick,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["users", "finance"]),
  );

  useEffect(() => {
    // Auto-expand parent if child is active
    items.forEach((item) => {
      if (item.subItems?.some((sub) => sub.isActive)) {
        setExpandedItems((prev) => new Set(prev).add(item.id));
      }
    });
  }, [items]);

  useEffect(() => {
    // Only lock body scroll on mobile when sidebar is open
    const handleResize = () => {
      if (isOpen && window.innerWidth < 1024) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && window.innerWidth < 1024) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isOpen, onClose]);

  const handleItemClick = (itemId: string, hasSubItems: boolean) => {
    if (hasSubItems) {
      // Toggle expansion
      setExpandedItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    } else {
      onItemClick?.(itemId);
      // Only close sidebar on mobile
      if (window.innerWidth < 1024) {
        onClose();
      }
    }
  };

  const isLogout = (id: string) => id === "logout";

  return (
    <>
      {/* Backdrop - Only on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] animate-[fadeIn_0.2s_ease-out] lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 h-full bg-white dark:bg-[#111114] border-r border-gray-100 dark:border-white/5 z-[9999] transition-all duration-300 ease-out flex flex-col
          lg:left-0 lg:translate-x-0 lg:shadow-none
          ${isCollapsed ? "lg:w-[72px]" : "lg:w-64"}
          ${isOpen ? "left-0 translate-x-0 shadow-2xl w-72" : "left-0 -translate-x-full lg:translate-x-0"}
        `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5 h-[57px] shrink-0">
          <div
            className={`flex items-center gap-2.5 transition-opacity duration-300 overflow-hidden ${isCollapsed ? "lg:opacity-0 lg:w-0" : "opacity-100"}`}>
            <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-xl shadow-sm shrink-0">
              <img
                src="/logo.jpeg"
                alt="Dil Mate"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap tracking-tight">
              Dil Mate Admin
            </span>
          </div>

          {/* Collapse Toggle - Desktop only */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors active:scale-95"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}>
              <MaterialSymbol
                name={isCollapsed ? "chevron_right" : "chevron_left"}
                size={20}
                className="text-gray-400"
              />
            </button>
          )}

          {/* Close button - Mobile only */}
          <button
            onClick={onClose}
            className="flex items-center justify-center size-8 rounded-lg hover:bg-gray-100 transition-colors active:scale-95 lg:hidden"
            aria-label="Close menu">
            <MaterialSymbol name="close" size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-0.5 py-3 px-2.5 overflow-y-auto admin-scrollbar">
          {items.filter((item) => !isLogout(item.id)).map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const hasSubItems = (item.subItems?.length || 0) > 0;
            const isActiveParent = item.isActive && !hasSubItems;

            return (
              <div key={item.id} className="relative">
                {/* Main Item */}
                <button
                  onClick={() => handleItemClick(item.id, hasSubItems)}
                  className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all duration-150 relative group ${
                    isActiveParent
                      ? "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white font-medium"
                  }`}
                  title={isCollapsed ? item.label : undefined}>
                  <MaterialSymbol
                    name={item.icon}
                    filled={isActiveParent}
                    size={20}
                    className="flex-shrink-0"
                  />
                  <span
                    className={`flex-1 text-left text-sm transition-opacity duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"}`}>
                    {item.label}
                  </span>
                  {item.hasBadge && !!item.badgeCount && (
                    <span
                      className={`flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold transition-opacity duration-300 ${isCollapsed ? "lg:absolute lg:top-1 lg:right-1" : ""}`}>
                      {item.badgeCount}
                    </span>
                  )}
                  {hasSubItems && !isCollapsed && (
                    <MaterialSymbol
                      name="expand_more"
                      size={18}
                      className={`text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {/* Sub Items - Only show when not collapsed */}
                {hasSubItems && isExpanded && !isCollapsed && (
                  <div className="mt-0.5 ml-3.5 pl-3.5 border-l-2 border-gray-100 dark:border-white/5 space-y-0.5">
                    {item.subItems!.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => {
                          onItemClick?.(subItem.id);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm transition-all duration-150 ${
                          subItem.isActive
                            ? "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10 font-bold"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 font-medium"
                        }`}>
                        <span className="flex-1 text-left">
                          {subItem.label}
                        </span>
                        {!!subItem.badgeCount && subItem.badgeCount > 0 && (
                          <span className="flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                            {subItem.badgeCount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer: Logout + Copyright */}
        <div className="shrink-0 border-t border-gray-100 dark:border-white/5 p-2.5 space-y-2">
          {items.filter((item) => isLogout(item.id)).map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id, false)}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 font-medium transition-all duration-150"
              title={isCollapsed ? item.label : undefined}>
              <MaterialSymbol name={item.icon} size={20} className="flex-shrink-0" />
              <span
                className={`flex-1 text-left text-sm transition-opacity duration-300 ${isCollapsed ? "lg:opacity-0 lg:w-0 lg:overflow-hidden" : "opacity-100"}`}>
                {item.label}
              </span>
            </button>
          ))}
          <div
            className={`text-[10px] text-gray-400 text-center pt-1 transition-opacity duration-300 ${isCollapsed ? "lg:opacity-0" : "opacity-100"}`}>
            © {new Date().getFullYear()} Dil Mate Admin
          </div>
        </div>
      </div>

      <style>{`
        .admin-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .admin-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 6px;
        }
        .admin-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.18);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};
