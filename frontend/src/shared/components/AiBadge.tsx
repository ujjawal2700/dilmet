import { MaterialSymbol } from './MaterialSymbol';

/** Set VITE_SHOW_AI_LABELS=true to show AI companion badges and notices again */
export const SHOW_AI_LABELS = import.meta.env.VITE_SHOW_AI_LABELS === 'true';

interface AiBadgeProps {
  /** 'compact' shows "AI", 'full' shows "AI Companion" */
  variant?: 'compact' | 'full';
  /** Use on coloured/dark backgrounds such as the chat header */
  onDark?: boolean;
  className?: string;
}

/**
 * Visible label for AI companion profiles. Shown everywhere an AI companion appears
 * so users always know they are not talking to a real person.
 */
export const AiBadge = ({ variant = 'compact', onDark = false, className = '' }: AiBadgeProps) => {
  if (!SHOW_AI_LABELS) return null;

  const colors = onDark
    ? 'bg-white text-violet-700'
    : 'bg-violet-600 text-white dark:bg-violet-500';

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black leading-none uppercase tracking-wide shrink-0 ${colors} ${className}`}
      title="AI companion – not a real person"
      aria-label="AI companion"
    >
      <MaterialSymbol name="smart_toy" size={12} filled />
      {variant === 'full' ? 'AI Companion' : 'AI'}
    </span>
  );
};
