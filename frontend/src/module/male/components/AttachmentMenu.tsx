import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';

interface AttachmentMenuItem {
  id: string;
  icon: string;
  label: string;
  onClick: () => void;
  color?: string;
}

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: AttachmentMenuItem[];
}

export const AttachmentMenu = ({ isOpen, onClose, items }: AttachmentMenuProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent z-30"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-[#2f151e] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-40 min-w-[200px] overflow-hidden">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-[#342d18] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              item.color || 'bg-gray-100 dark:bg-[#342d18]'
            }`}>
              <MaterialSymbol name={item.icon as any} className={item.color ? 'text-white' : 'text-gray-600 dark:text-gray-400'} />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</span>
          </button>
        ))}
      </div>
    </>
  );
};

