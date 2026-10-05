import React, { useState, useEffect, useMemo } from 'react';
import { Home, Compass, MessageCircle, Coins, User } from 'lucide-react';
import { MaterialSymbol } from '../types/material-symbol';
import { LiquidTabBar, type LiquidTab } from '../../../shared/components/LiquidTabBar';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  isActive?: boolean;
  hasBadge?: boolean;
}

interface BottomNavigationProps {
  items: NavItem[];
  onItemClick?: (itemId: string) => void;
}

// Module-level tracker so transition persists across page route changes
let globalPrevNavIndex: number | null = null;

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ items, onItemClick }) => {
  const currentActiveIndex = items.findIndex((item) => item.isActive);

  // Initialize with last known index to enable cross-page sliding animation
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    if (globalPrevNavIndex !== null && globalPrevNavIndex >= 0 && globalPrevNavIndex < items.length) {
      return globalPrevNavIndex;
    }
    return currentActiveIndex !== -1 ? currentActiveIndex : 0;
  });

  // Smoothly sync activeIndex when route / items change
  useEffect(() => {
    if (currentActiveIndex !== -1) {
      const frame = requestAnimationFrame(() => {
        setActiveIndex(currentActiveIndex);
        globalPrevNavIndex = currentActiveIndex;
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [currentActiveIndex]);

  const handleItemClick = (item: NavItem, index: number) => {
    setActiveIndex(index);
    globalPrevNavIndex = index;
    onItemClick?.(item.id);
  };

  const hasChatBadge = Boolean(items.find((it) => it.id === 'chats')?.hasBadge);

  const liquidTabs: LiquidTab[] = useMemo(
    () => [
      { to: '/male/dashboard', label: 'Home', icon: Home, end: true },
      { to: '/male/discover', label: 'Discover', icon: Compass },
      {
        to: '/male/chats',
        label: 'Chats',
        icon: MessageCircle,
        badge: hasChatBadge,
        matchPaths: ['/male/chats', '/male/chat', '/male/profile'],
      },
      {
        to: '/male/wallet',
        label: 'Wallet',
        icon: Coins,
        matchPaths: ['/male/wallet', '/male/buy-coins', '/male/purchase-history', '/male/payment'],
      },
      {
        to: '/male/my-profile',
        label: 'Profile',
        icon: User,
        matchPaths: ['/male/my-profile', '/male/notifications', '/male/gifts', '/male/badges'],
      },
    ],
    [hasChatBadge]
  );

  return (
    <>
      {/* Mobile & tablet: Floating NexClean Liquid Glass Navigation Bar */}
      <LiquidTabBar tabs={liquidTabs} slideTransition />

      {/* Laptop & desktop: Persistent left sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen w-60 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-100 dark:border-slate-800 shadow-nav flex-col px-4 py-8">
        <div className="flex items-center gap-2 px-2 mb-10">
          <div className="h-9 w-9 rounded-xl bg-cta-gradient flex items-center justify-center shrink-0 shadow-cta">
            <MaterialSymbol name="favorite" size={18} className="text-white" filled />
          </div>
          <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Dil Mate</span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {items.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item, index)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl relative transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MaterialSymbol
                  name={item.icon}
                  filled={isActive}
                  size={22}
                  className={isActive ? 'text-pink-600 dark:text-pink-400' : 'text-slate-400'}
                />
                <span className={`text-[14px] ${isActive ? 'font-black' : 'font-semibold'}`}>
                  {item.label}
                </span>

                {item.hasBadge && (
                  <span className="absolute top-3 right-4 h-2 w-2 rounded-full bg-pink-500 border border-white dark:border-slate-900 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
