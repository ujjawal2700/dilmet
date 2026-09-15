import { useState } from 'react';
import { MaterialSymbol } from '../../../shared/components/MaterialSymbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Get localized FAQs from i18n
  // Use casting to ensure TypeScript knows we're getting an array
  const faqItems = (t('faq', { returnObjects: true }) as FAQItem[]) || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-[fadeIn_0.2s_ease-out]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#2f151e] rounded-t-3xl shadow-2xl photo-picker-slide-up safe-area-inset-bottom max-h-[90vh] overflow-y-auto font-display">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-[#2f151e] border-b border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-center justify-between px-4 py-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('helpAndSupport')}</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center size-10 rounded-full bg-gray-100 dark:bg-[#342d18] text-slate-600 dark:text-white hover:bg-gray-200 dark:hover:bg-[#4b202e] transition-colors active:scale-95"
              aria-label={t('close')}
            >
              <MaterialSymbol name="close" size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* FAQ Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">{t('faqTitle')}</h3>
            <div className="space-y-2">
              {faqItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 dark:bg-[#342d18] rounded-xl overflow-hidden border border-black/5 dark:border-white/5"
                >
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full flex items-center justify-between p-4 text-left transition-colors"
                  >
                    <span className="flex-1 font-medium text-slate-900 dark:text-white pr-2">
                      {item.question}
                    </span>
                    <MaterialSymbol
                      name={expandedId === item.id ? 'expand_less' : 'expand_more'}
                      size={24}
                      className="text-gray-400 shrink-0"
                    />
                  </button>
                  {expandedId === item.id && (
                    <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 animate-[fadeIn_0.3s_ease-out]">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">{t('stillNeedHelp')}</h3>
            <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors active:scale-95 text-slate-900 dark:text-white">
              <div className="flex items-center justify-center size-10 rounded-full bg-primary/20">
                <MaterialSymbol name="support_agent" size={24} className="text-primary" />
              </div>
              <span className="flex-1 text-left font-medium">
                {t('contactSupport')}
              </span>
              <MaterialSymbol name="chevron_right" size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};



