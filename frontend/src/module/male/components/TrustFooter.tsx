import { MaterialSymbol } from '../types/material-symbol';
import { useTranslation } from '../../../core/hooks/useTranslation';

export const TrustFooter = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-3 opacity-60">
      <div className="flex items-center gap-2 text-xs">
        <MaterialSymbol name="lock" size={16} />
        <span>{t('paymentsSecure')}</span>
      </div>
      <p className="text-[10px] text-center max-w-[200px] leading-relaxed">
        {t('termsAgreement')}
      </p>
    </div>
  );
};

