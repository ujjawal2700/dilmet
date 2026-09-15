import { MaterialSymbol } from '../types/material-symbol';

interface FloatingActionButtonProps {
  title: string;
  subtitle?: string;
  icon?: string;
  onClick?: () => void;
}

export const FloatingActionButton = ({
  title,
  subtitle,
  icon = 'add',
  onClick,
}: FloatingActionButtonProps) => {
  return (
    <div className="fixed bottom-24 right-4 z-30">
      <button
        onClick={onClick}
        className="group flex h-14 items-center gap-3 rounded-full bg-primary pl-4 pr-6 shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white">
          <MaterialSymbol name={icon} size={20} />
        </div>
        {subtitle ? (
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold leading-none text-white">{title}</span>
            <span className="text-[10px] font-medium leading-none text-white/80 mt-1">
              {subtitle}
            </span>
          </div>
        ) : (
          <span className="text-sm font-bold text-white">{title}</span>
        )}
      </button>
    </div>
  );
};

