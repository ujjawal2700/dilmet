import { MaterialSymbol } from '../types/material-symbol';

export type PaymentMethod = 'apple_pay' | 'card' | 'upi';

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  description?: string;
  icon?: string;
  iconBg?: string;
}

interface PaymentMethodSelectorProps {
  methods: PaymentMethodOption[];
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector = ({
  methods,
  selectedMethod,
  onMethodChange,
}: PaymentMethodSelectorProps) => {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 dark:border-[#683143] bg-white dark:bg-[#341822] overflow-hidden divide-y divide-gray-100 dark:divide-white/5">
      {methods.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <div
            key={method.id}
            onClick={() => onMethodChange(method.id)}
            className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
              isSelected
                ? 'bg-primary/5'
                : 'hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              {method.icon ? (
                <div
                  className={`w-10 h-6 rounded flex items-center justify-center ${
                    method.iconBg || 'bg-black'
                  }`}
                >
                  <span className="text-white text-[10px] font-bold">{method.icon}</span>
                </div>
              ) : (
                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {method.name.split(' ')[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <span
                  className={`text-sm ${isSelected ? 'font-bold' : 'font-medium'}`}
                >
                  {method.name}
                </span>
                {method.description && (
                  <span className="text-xs text-slate-500 dark:text-gray-400">
                    {method.description}
                  </span>
                )}
              </div>
            </div>
            <MaterialSymbol
              name={isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
              className={isSelected ? 'text-primary' : 'text-slate-300 dark:text-gray-600'}
            />
          </div>
        );
      })}
    </div>
  );
};

