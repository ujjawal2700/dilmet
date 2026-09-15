import { MaterialSymbol } from './MaterialSymbol';
import type { Badge } from '../../core/types/global';

interface BadgeDisplayProps {
  badges: Badge[];
  maxDisplay?: number;
  showUnlockedOnly?: boolean;
  compact?: boolean;
  onBadgeClick?: (badge: Badge) => void;
}

const rarityColors: Record<string, string> = {
  common: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600',
  rare: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600',
  epic: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600',
  legendary: 'bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-600',
};

export const BadgeDisplay = ({
  badges,
  maxDisplay = 6,
  showUnlockedOnly = true,
  compact = false,
  onBadgeClick
}: BadgeDisplayProps) => {
  const displayBadges = showUnlockedOnly
    ? badges.filter(b => b.isUnlocked).slice(0, maxDisplay)
    : badges.slice(0, maxDisplay);

  if (displayBadges.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {displayBadges.map((badge) => (
          <div
            key={badge.id}
            onClick={() => onBadgeClick?.(badge)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer hover:scale-105 active:scale-95 ${badge.isUnlocked
              ? `${rarityColors[badge.rarity || 'common']} shadow-sm`
              : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-50'
              }`}
            title={badge.name}
          >
            <MaterialSymbol
              name={badge.icon}
              size={16}
              className={badge.isUnlocked ? '' : 'grayscale'}
            />
            {!badge.isUnlocked && (
              <MaterialSymbol name="lock" size={12} className="text-gray-400" />
            )}
          </div>
        ))}
        {badges.filter(b => b.isUnlocked).length > maxDisplay && (
          <div className="flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium">
            +{badges.filter(b => b.isUnlocked).length - maxDisplay}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {displayBadges.map((badge) => (
        <div
          key={badge.id}
          onClick={() => onBadgeClick?.(badge)}
          className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 active:scale-95 ${badge.isUnlocked
            ? `${rarityColors[badge.rarity || 'common']} shadow-md`
            : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60'
            }`}
        >
          {/* Locked Overlay */}
          {!badge.isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
              <MaterialSymbol name="lock" size={24} className="text-gray-400" />
            </div>
          )}

          {/* Badge Icon */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`p-2 rounded-full ${badge.isUnlocked
                ? 'bg-white/50 dark:bg-black/20'
                : 'bg-gray-200 dark:bg-gray-700'
                }`}
            >
              <MaterialSymbol
                name={badge.icon}
                size={24}
                className={badge.isUnlocked ? '' : 'grayscale opacity-50'}
              />
            </div>
            <div className="text-center">
              <p className={`text-xs font-semibold ${badge.isUnlocked ? '' : 'text-gray-400'
                }`}>
                {badge.name}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

